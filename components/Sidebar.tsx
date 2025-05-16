'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaBox, FaShoppingCart, FaUsers, FaRobot, FaCog } from 'react-icons/fa';

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: <FaHome />, href: '/dashboard' },
    { name: 'Products', icon: <FaBox />, href: '/dashboard/products' },
    { name: 'Orders', icon: <FaShoppingCart />, href: '/dashboard/orders' },
    { name: 'Customers', icon: <FaUsers />, href: '/dashboard/customers' },
    { name: 'AI Assistant', icon: <FaRobot />, href: '/dashboard/chatbot' },
    { name: 'Settings', icon: <FaCog />, href: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black  bg-opacity-50 backdrop-blur-sm z-20 md:hidden"
        />
      )}
      
      <div className={`fixed z-30 md:relative h-full bg-[#000000] text-white w-64 border-b-0 px-2 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between p-5">
          <h1 className="text-white text-2xl font-bold">VirtuTry</h1>
          <button className="text-white md:hidden" onClick={toggleSidebar}>
            ✕
          </button>
        </div>
        <nav className="flex flex-col mt-5 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} className="group">
              <div className={`flex items-center gap-4 px-6 py-3 rounded-md cursor-pointer transition-all
                ${pathname === item.href ? 'bg-[#111827] border-1 border-[#334155]  text-white' : 'hover:bg-[#111827]  hover:border-1 border-[#334155]'}`}>
                <div className="text-lg">{item.icon}</div>
                <div className="text-md">{item.name}</div>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
