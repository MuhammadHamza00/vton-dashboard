'use client';

import { FaBars } from 'react-icons/fa';

export default function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <div className="flex items-center justify-between p-5 bg-dark border-1 border-[#334155] sticky top-0 z-10">
      <button onClick={toggleSidebar} className="text-white text-2xl md:hidden">
        <FaBars />
      </button>
      <h2 className="text-2xl font-semibold text-white">Welcome back!</h2>
      <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
    </div>
  );
}
