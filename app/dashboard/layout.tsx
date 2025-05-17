'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script'; // ✅ Import Script
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ProtectedLayout from '@/components/ProtectedLayout';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';

// ✅ Declare global type
declare global {
  interface Window {
    puter: any;
    __puterScriptLoaded?: boolean;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [puterReady, setPuterReady] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ✅ Only check Puter readiness (not needed if children will check separately)
  useEffect(() => {
    const checkPuterReady = () => {
      if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
        setPuterReady(true);
        console.log("✅ Puter is ready globally!");
      } else {
        setTimeout(checkPuterReady, 300);
      }
    };

    if (typeof window !== 'undefined' && !window.__puterScriptLoaded) {
      window.__puterScriptLoaded = true;
      checkPuterReady();
    }
  }, []);

  return (
    <>
      {/* ✅ Load Puter script ONCE globally */}
      <Script
        src="https://js.puter.com/v2/"
        strategy="afterInteractive"
      />

      <ProtectedLayout>
        <AuthProvider>
          <div className="flex bg-[url('/stars.svg')] min-h-screen">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-col flex-1 overflow-hidden border-1 border-[#334155]">
              <Topbar toggleSidebar={toggleSidebar} />
              <Toaster position="top-center" />
              <main className="p-2">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </ProtectedLayout>
    </>
  );
}
