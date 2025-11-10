
import React from 'react';
import { CatIcon } from './Icons';
import { Profile } from '../types';

interface AvatarProps {
  profile: Profile | null;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ profile, className = 'w-12 h-12' }) => {
  if (!profile) return <div className={`bg-gray-200 rounded-full ${className}`} />;

  if (profile.companyPhotoUrl === 'default_cat_avatar') {
    return (
        <div className={`bg-gray-200 rounded-full flex items-center justify-center ${className}`}>
             <CatIcon className="text-gray-500 w-3/4 h-3/4" />
        </div>
    );
  }

  return (
    <img
      src={profile.companyPhotoUrl}
      alt={profile.companyName}
      className={`object-cover rounded-full ${className}`}
    />
  );
};

export default Avatar;
