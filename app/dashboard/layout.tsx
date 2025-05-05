'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ProtectedLayout from '@/components/ProtectedLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ProtectedLayout>
    <div className="flex  bg-[url('/stars.svg')]  min-h-screen ">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden border-1 border-[#334155] ">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="p-6">{children}</main>
      </div>
    </div>
    </ProtectedLayout>

  );
}
