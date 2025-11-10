import React, { useState } from 'react';
import { Profile } from '../types';
import api from '../services/api';

interface AddConnectionModalProps {
  user: Profile;
  onClose: () => void;
  onConnectionAdded: () => void;
}

const AddConnectionModal: React.FC<AddConnectionModalProps> = ({ user, onClose, onConnectionAdded }) => {
    const [uniqueCode, setUniqueCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const partnerRole = user.userRole === 'buyer' ? 'Supplier' : 'Buyer';

    const handleSubmit = async () => {
        if (!uniqueCode.trim()) {
            setError('Please enter a unique code.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.addConnectionByCode(user.id, uniqueCode);
            setSuccess(`Connection request sent to ${uniqueCode}!`);
            setUniqueCode('');
            // Refresh dashboard list after a short delay to show success message
            setTimeout(() => {
                onConnectionAdded();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add a new {partnerRole}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter the unique code of the {partnerRole} you want to connect with. They will need to accept your request.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {partnerRole}'s Unique Code
              </label>
              <input 
                type="text" 
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value)}
                placeholder="e.g., ZESP123" 
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-4">{success}</p>}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300">
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      );
};

export default AddConnectionModal;
