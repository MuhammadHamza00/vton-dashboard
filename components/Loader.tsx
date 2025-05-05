'use client';

import React from 'react';

export default function Loader() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Animated background stars */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-black overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full animate-stars bg-[url('/stars.svg')] bg-repeat opacity-20"></div>
        </div>
      </div>

      {/* Center Loader */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24">
          {/* Outer glowing ball */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 animate-ping opacity-75"></div>

          {/* Middle orbit ring */}
          <div className="absolute inset-2 border-2 border-blue-400 rounded-full animate-spin-slow"></div>

          {/* Inner small ball */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-pink-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <p className="text-gray-400 text-lg mt-6 animate-pulse">Loading the universe...</p>
      </div>
    </div>
  );
}
