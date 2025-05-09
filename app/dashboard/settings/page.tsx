'use client';
import { useState } from "react";
import AccountForm from "@/components/AccountForm";
import SecurityForm from "@/components/SecurityForm";

const tabs = [
  { id: 'account', label: 'My Account' },
  { id: 'security', label: 'Security' },

];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="max-w-4xl mx-2 px-2 py-4">
      <h1 className="text-2xl font-normal mb-6 text-white">Settings</h1>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-lg font-normal ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'account' && <AccountForm />}
        {activeTab === 'security' && <SecurityForm />}
      </div>
    </div>
  );
}
