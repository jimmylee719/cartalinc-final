
import React, { useState, ChangeEvent } from 'react';
import { Profile } from '../types';
import api from '../services/api';
import Avatar from './Avatar';
import { UploadIcon } from './Icons';

interface ProfileEditModalProps {
  user: Profile;
  onClose: () => void;
  onSave: (updatedProfile: Profile) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<Profile>(user);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      let updatedData: Partial<Profile> = { ...formData };
      if (newPhotoFile && photoPreview) {
        updatedData.companyPhotoUrl = photoPreview; // In a real app, you'd upload and get back a URL
      }
      
      const updatedProfile = await api.updateProfile(user.id, updatedData);
      if (updatedProfile) {
        onSave(updatedProfile);
        onClose();
      } else {
        throw new Error('Failed to update profile.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Profile</h2>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            {photoPreview ? <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover"/> : <Avatar profile={user} className="w-16 h-16"/>}
             <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-green-700">
                <UploadIcon className="w-4 h-4"/>
             </label>
             <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handleFileChange}/>
          </div>
          <div>
            <p className="text-lg font-bold">{formData.companyName}</p>
            <p className="text-sm text-gray-500">Unique Code: {user.uniqueCode}</p>
          </div>
        </div>

        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
              <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
