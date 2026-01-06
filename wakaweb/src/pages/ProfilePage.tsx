import React, { useEffect } from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../stores/auth';

export const ProfilePage: React.FC = () => {
  const { userProfile, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-textMuted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-textPrimary">Profile</h1>

        <Card className="mb-6">
          <div className="flex items-center gap-6 mb-6">
            <Avatar src={userProfile.photoUrl} name={userProfile.displayName} size="xl" />
            <div>
              <h2 className="text-2xl font-semibold text-textPrimary mb-2">
                {userProfile.displayName}
              </h2>
              <p className="text-textMuted capitalize">{userProfile.role?.toLowerCase()}</p>
            </div>
          </div>

          <div className="space-y-4">
            {userProfile.phone && (
              <div className="flex items-center gap-3 text-textMuted">
                <Phone size={20} />
                <span>{userProfile.phone}</span>
              </div>
            )}
            {userProfile.email && (
              <div className="flex items-center gap-3 text-textMuted">
                <Mail size={20} />
                <span>{userProfile.email}</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4 text-textPrimary flex items-center gap-2">
            <User size={20} />
            Account Information
          </h3>
          <div className="space-y-3 text-textMuted">
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="text-textPrimary font-mono text-sm">{userProfile.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`${userProfile.isActive ? 'text-success' : 'text-error'}`}>
                {userProfile.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

