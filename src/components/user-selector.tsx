// User Selector component for demo mode - switch between different users
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTeamUsers, useAllUsers } from '@/lib/queries';
import { useAppStore } from '@/lib/store';
import { User } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import { Users, Crown, User as UserIcon } from 'lucide-react';

export function UserSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const isDemoMode = useAppStore((state) => state.isDemoMode);
  
  // Use all users for demo mode to show team switching capability
  const { data: allUsers, isLoading } = useAllUsers();

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    setIsOpen(false);
  };

  if (!isDemoMode) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          style={{
            backgroundColor: 'var(--brand-yellow)',
            color: 'var(--brand-navy)',
            borderColor: 'var(--brand-yellow)'
          }}
          className="hover:opacity-90 font-semibold transition-opacity"
        >
          <Users className="h-4 w-4 mr-2" />
          Switch User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users style={{ color: 'var(--brand-yellow)' }} className="h-5 w-5" />
            <span>Select User (Demo Mode)</span>
          </DialogTitle>
          <DialogDescription>
            Choose a team member to view the budget tool from their perspective.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            allUsers?.users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                style={{
                  borderColor: currentUser?.id === user.id ? 'var(--brand-navy)' : '#e5e7eb',
                  backgroundColor: currentUser?.id === user.id ? 'rgba(26, 35, 126, 0.05)' : 'transparent'
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:bg-gray-50"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div 
                    style={{ backgroundColor: 'var(--brand-navy)', color: 'white' }}
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium"
                  >
                    {getInitials(user.name)}
                  </div>
                </div>

                {/* User Details */}
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    {user.role === 'admin' && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {currentUser?.id === user.id && (
                      <Badge variant="default" className="text-xs">
                        <UserIcon className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p style={{ color: 'var(--brand-navy)' }} className="text-xs font-medium">Team: {user.team?.name}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {!isLoading && allUsers?.users && allUsers.users.length === 0 && (
          <div className="text-center py-8">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No team members found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
