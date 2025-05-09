import { useState } from "react";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {Object.keys(settings).map((key) => (
        <div key={key} className="flex items-center justify-between">
          <span className="capitalize text-white">{key} Notifications</span>
          <button
            onClick={() => toggleSetting(key as keyof typeof settings)}
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              settings[key as keyof typeof settings]
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            {settings[key as keyof typeof settings] ? "Enabled" : "Disabled"}
          </button>
        </div>
      ))}
    </div>
  );
}
