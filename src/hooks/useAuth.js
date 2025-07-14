import { useState, useEffect } from 'react';
import { useAuth as useSupabaseAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

export function useAuth() {
  const { user, ...authMethods } = useSupabaseAuth();
  const { userProfile } = useDatabase();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userProfile]);

  return {
    user,
    isAdmin,
    ...authMethods
  };
}