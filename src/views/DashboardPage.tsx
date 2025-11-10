
import React, { useState, useEffect, useCallback } from 'react';
import { Profile, Audit, AuditStatus, UserRole, Connection } from '../types';
import api from '../services/api';
import { CheckCircleIcon, ClockIcon, DocumentTextIcon, EyeIcon, PlusCircleIcon } from '../components/Icons';
import NewAuditModal from '../components/NewAuditModal';
import AddConnectionModal from '../components/AddConnectionModal';
import Avatar from '../components/Avatar';

interface DashboardPageProps {
  user: Profile;
  onSelectAudit: (auditId: string) => void;
}

const statusStyles: Record<AuditStatus, { icon: React.ReactNode; text: string; bg: string; textColor: string }> = {
  [AuditStatus.Approved]: { icon: <CheckCircleIcon className="w-5 h-5" />, text: 'Approved', bg: 'bg-green-100', textColor: 'text-green-800' },
  [AuditStatus.InReview]: { icon: <EyeIcon className="w-5 h-5" />, text: 'In Review', bg: 'bg-yellow-100', textColor: 'text-yellow-800' },
  [AuditStatus.Pending]: { icon: <ClockIcon className="w-5 h-5" />, text: 'Pending', bg: 'bg-blue-100', textColor: 'text-blue-800' },
  [AuditStatus.Rejected]: { icon: <CheckCircleIcon className="w-5 h-5" />, text: 'Action Required', bg: 'bg-red-100', textColor: 'text-red-800' },
};

const AuditCard: React.FC<{ audit: Audit; onClick: () => void; userRole: UserRole }> = ({ audit, onClick, userRole }) => {
  const [relatedProfile, setRelatedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const details = await api.getAuditDetails(audit.id);
      if (details) {
        setRelatedProfile(userRole === UserRole.Buyer ? details.supplier : details.buyer);
      }
    };
    fetchProfile();
  }, [audit.id, userRole]);

  const statusInfo = statusStyles[audit.status];

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{relatedProfile?.companyName || 'Loading...'}</p>
            <h3 className="text-lg font-bold text-gray-800 mt-1">{audit.auditTitle}</h3>
          </div>
          <div className={`flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.textColor}`}>
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
          <span>Due Date: {new Date(audit.dueDate).toLocaleDateString()}</span>
          <div className="flex items-center space-x-1">
            <DocumentTextIcon className="w-4 h-4" />
            <span>{audit.templateIds.length} templates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onSelectAudit }) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [connections, setConnections] = useState<{connection: Connection, profile: Profile, isInitiator: boolean}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  const fetchAudits = useCallback(async () => {
    const userAudits = await api.getAuditsForUser(user.id, user.userRole);
    userAudits.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    setAudits(userAudits);
  }, [user.id, user.userRole]);

  const fetchConnections = useCallback(async () => {
    const userConnections = await api.getConnectionsForUser(user.id);
    setConnections(userConnections);
  }, [user.id]);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAudits(), fetchConnections()]);
    setLoading(false);
  }, [fetchAudits, fetchConnections]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleConnectionUpdate = async () => {
    await fetchConnections();
  }

  const handleAuditCreated = () => {
    setIsNewAuditModalOpen(false);
    fetchAudits();
  }
  
  const handleAcceptConnection = async (connectionId: string) => {
    await api.updateConnectionStatus(connectionId, 'active');
    handleConnectionUpdate();
  }
  
  const handleRejectConnection = async (connectionId: string) => {
    await api.updateConnectionStatus(connectionId, 'rejected');
    handleConnectionUpdate();
  }

  const welcomeMessage = user.userRole === UserRole.Buyer 
    ? "Manage your audits and supplier connections." 
    : "Manage your audits and buyer connections.";
    
  const pendingReceivedConnections = connections.filter(c => c.connection.status === 'pending' && !c.isInitiator);
  const sentPendingConnections = connections.filter(c => c.connection.status === 'pending' && c.isInitiator);
  const activeConnections = connections.filter(c => c.connection.status === 'active');

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {user.contactName.split(' ')[0]}!</h2>
          <p className="text-gray-600 mt-1">{welcomeMessage}</p>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => setIsConnectionModalOpen(true)} className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-50 transition">
                {user.userRole === UserRole.Buyer ? "Add Supplier" : "Add Buyer"}
            </button>
             {user.userRole === UserRole.Buyer && (
                  <button onClick={() => setIsNewAuditModalOpen(true)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition">
                      Start New Audit
                  </button>
              )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Audits</h3>
                 <div className="space-y-4">
                    {audits.length > 0 ? (
                         audits.map(audit => (
                            <AuditCard key={audit.id} audit={audit} onClick={() => onSelectAudit(audit.id)} userRole={user.userRole}/>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-800">No Audits Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {user.userRole === UserRole.Buyer ? "You haven't assigned any audits yet." : "You have no pending or active audits."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div>
                 <h3 className="text-xl font-bold text-gray-900 mb-4">Your Connections</h3>
                 <div className="space-y-4">
                    {pendingReceivedConnections.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-bold text-yellow-800">Pending Requests</h4>
                            {pendingReceivedConnections.map(({ connection, profile }) => (
                                <div key={connection.id} className="mt-2 p-2 bg-white rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm text-black">{profile.companyName}</p>
                                        <p className="text-xs text-gray-500">{profile.contactName}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleAcceptConnection(connection.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600">Accept</button>
                                        <button onClick={() => handleRejectConnection(connection.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {sentPendingConnections.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-bold text-blue-800">Sent Requests</h4>
                            {sentPendingConnections.map(({ connection, profile }) => (
                                <div key={connection.id} className="mt-2 p-2 bg-white rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm text-black">{profile.companyName}</p>
                                        <p className="text-xs text-gray-500">Waiting for response...</p>
                                    </div>
                                    <button onClick={() => handleRejectConnection(connection.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">Cancel</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-bold text-gray-800">Active Connections</h4>
                         {activeConnections.length > 0 ? (
                            <div className="space-y-3 mt-2">
                                {activeConnections.map(({profile}) => (
                                <div key={profile.id} className="flex items-center space-x-3">
                                    <Avatar profile={profile} className="w-16 h-16"/>
                                    <div>
                                        <p className="font-semibold text-sm text-black">{profile.companyName}</p>
                                        <p className="text-xs text-gray-500">{profile.contactName} - {profile.uniqueCode}</p>
                                    </div>
                                </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500 mt-2">No active connections yet.</p>}
                    </div>
                 </div>
            </div>
        </div>
      )}
      
      {isConnectionModalOpen && (
        <AddConnectionModal user={user} onClose={() => setIsConnectionModalOpen(false)} onConnectionAdded={handleConnectionUpdate} />
      )}

      {isNewAuditModalOpen && user.userRole === UserRole.Buyer && (
        <NewAuditModal 
            buyer={user}
            onClose={() => setIsNewAuditModalOpen(false)}
            onAuditCreated={handleAuditCreated}
        />
      )}
    </div>
  );
};

export default DashboardPage;
