'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { toast } from 'sonner'; 

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (event === 'USER_UPDATED') {
        toast.loading('Refreshing session...', { id: 'refresh-toast' }); // 👈 show loading toast
        await supabase.auth.refreshSession();
        toast.success('Session refreshed!', { id: 'refresh-toast' }); // 👈 update to success
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully');
      }

      if (event === 'SIGNED_OUT') {
        console.log('🚪 Signed out');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
