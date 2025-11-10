
import React, { useState } from 'react';
import { Profile, UserRole } from '../types';
import api from '../services/api';

interface AuthPageProps {
  role: UserRole;
  onLoginSuccess: (user: Profile) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ role, onLoginSuccess, onBack }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.loginByEmail(loginEmail, role);
      if (user) {
        onLoginSuccess(user);
      } else {
        throw new Error("No account found with that email for this role. Please register or check your email.");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!formData.fullName || !formData.companyName || !formData.contactEmail) {
        throw new Error("Please fill in all required fields.");
      }
      const user = await api.register({
        ...formData,
        userRole: role,
        contactName: formData.contactName || formData.fullName,
      });
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email Address</label>
        <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" required />
      </div>
      <p className="text-xs text-gray-500">Note: This is a demo. No password is required.</p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300">
        {loading ? 'Logging In...' : 'Login'}
      </button>
      <button type="button" onClick={() => { setAuthMode('register'); setError('') }} className="w-full text-center text-sm text-green-600 hover:underline">
        Need an account? Register here.
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-gray-700">Full Name*</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name*</label>
        <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Contact Email*</label>
        <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300">
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
      <button type="button" onClick={() => { setAuthMode('login'); setError('') }} className="w-full text-center text-sm text-green-600 hover:underline">
        Already have an account? Login.
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
       <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 relative">
         <button onClick={onBack} className="absolute top-4 left-4 text-sm text-gray-600 hover:text-green-700">&larr; Back</button>
        <div className="text-center mb-6">
          <p className="text-gray-500 capitalize">{role} Account</p>
          <h2 className="text-2xl font-bold text-gray-800">{authMode === 'login' ? 'Login' : 'Create Account'}</h2>
        </div>
        {authMode === 'login' ? renderLoginForm() : renderRegisterForm()}
      </div>
      <footer className="text-center text-gray-500 text-sm mt-8">
            <p>CartaLinc &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default AuthPage;
