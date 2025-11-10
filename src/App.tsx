
import React, { useState, useEffect } from 'react';
import { Profile, UserRole } from './types';
import api from './services/api';
import AuditDetailPage from './views/AuditDetailPage';
import DashboardPage from './views/DashboardPage';
import LandingPage from './views/LandingPage';
import AuthPage from './views/AuthPage';
import ProfileEditModal from './components/ProfileEditModal';
import Avatar from './components/Avatar';
import { InformationCircleIcon } from './components/Icons';
import GuidelinesModal from './components/GuidelinesModal';

type AppState = 'landing' | 'auth' | 'dashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'audit'>('dashboard');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);
  
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAppState('auth');
  };

  const handleLoginSuccess = (user: Profile) => {
    setCurrentUser(user);
    setAppState('dashboard');
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRole(null);
    setAppState('landing');
    setCurrentView('dashboard');
    setSelectedAuditId(null);
  };
  
  const handleProfileUpdate = (updatedProfile: Profile) => {
    setCurrentUser(updatedProfile);
  }

  const handleSelectAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
    setCurrentView('audit');
  };

  const handleBackToDashboard = () => {
    setSelectedAuditId(null);
    setCurrentView('dashboard');
  };

  if (appState === 'landing') {
    return <LandingPage onSelectRole={handleRoleSelect} />;
  }

  if (appState === 'auth' && selectedRole) {
    return <AuthPage role={selectedRole} onLoginSuccess={handleLoginSuccess} onBack={() => setAppState('landing')} />;
  }
  
  if (appState === 'dashboard' && currentUser) {
    return (
      <>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-white shadow-sm sticky top-0 z-20">
            <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <h1 className="text-lg sm:text-2xl font-bold text-green-700">CartaLinc</h1>
                 <span className="text-xs sm:text-sm bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">{currentUser.uniqueCode}</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="text-right hidden sm:block">
                    <p className="font-semibold text-gray-800 truncate">{currentUser.contactName}</p>
                    <p className="text-sm text-gray-500 truncate">{currentUser.companyName}</p>
                </div>
                <button onClick={() => setIsProfileModalOpen(true)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full">
                  <Avatar profile={currentUser} className="w-12 h-12 sm:w-16 sm:h-16" />
                </button>
                 <button onClick={() => setIsGuidelinesModalOpen(true)} className="text-gray-500 hover:text-green-600 focus:outline-none" title="Compliance Guidelines">
                    <InformationCircleIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                </button>
                <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-green-700 whitespace-nowrap">Logout</button>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {currentView === 'dashboard' ? (
              <DashboardPage user={currentUser} onSelectAudit={handleSelectAudit} />
            ) : (
              selectedAuditId && <AuditDetailPage auditId={selectedAuditId} user={currentUser} onBack={handleBackToDashboard} />
            )}
          </main>
        </div>
        {isProfileModalOpen && (
          <ProfileEditModal 
            user={currentUser} 
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleProfileUpdate}
          />
        )}
        {isGuidelinesModalOpen && (
          <GuidelinesModal onClose={() => setIsGuidelinesModalOpen(false)} />
        )}
      </>
    );
  }

  return null; // Should not be reached
};

export default App;
