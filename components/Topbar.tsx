'use client';

import { useEffect, useState } from 'react';
import { FaBars, FaCog, FaSignOutAlt, FaMapMarkerAlt, FaSun } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";


export default function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [adminName, setAdminName] = useState('Admin');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('Users')
          .select('name')
          .eq('email', user.email)
          .single();
        if (data && data.name) setAdminName(data.name);
      }
    };

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    const fetchLocationAndWeather = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          setLocation(`Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`);

          // Optional: Add weather API here (e.g., OpenWeatherMap)
          setWeather('Sunny');
        });
      } else {
        setLocation('Unknown');
      }
    };

    fetchUser();
    updateTime();
    fetchLocationAndWeather();

    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex items-center  justify-between p-5 bg-dark border-1 border-[#334155] sticky top-0 z-10 shadow-md">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-white text-2xl md:hidden">
          <FaBars />
        </button>
        <div className="text-white">
          <h2 className="text-2xl font-semibold">👋 Welcome back, {adminName}</h2>
          <p className="text-md text-white">⏰ {time} | <FaMapMarkerAlt className="inline" /> {location} | <FaSun className="inline" /> {weather}</p>
        </div>
      </div>

      <div className="relative">
        <div
          className="w-13 h-13 bg-gray-800 rounded-full flex items-center justify-center text-white cursor-pointer"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {adminName.charAt(0).toUpperCase()}
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20">
            <button
              className="w-full px-4 py-3 text-left text-md text-white hover:bg-gray-900 flex items-center gap-2"
              onClick={() => {
                router.push('/dashboard/settings');
                setDropdownOpen(false);
              }}
            >
              <FaCog /> Settings
            </button>
            <button
              className="w-full px-4 py-3 text-left text-md text-red-600 hover:bg-gray-900 flex items-center gap-2"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
