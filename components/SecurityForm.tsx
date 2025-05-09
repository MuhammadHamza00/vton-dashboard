import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // update path if needed

export default function SecurityForm() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("User not found!");
      return;
    }

    // Re-authenticate the user by signing in again
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: passwords.currentPassword,
    });

    if (loginError) {
      alert("Current password is incorrect!");
      return;
    }

    // Now update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwords.newPassword,
    });

    if (updateError) {
      alert("Error updating password!");
    } else {
      alert("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {[
        { name: "currentPassword", label: "Current Password" },
        { name: "newPassword", label: "New Password" },
        { name: "confirmPassword", label: "Confirm New Password" },
      ].map(({ name, label }) => (
        <div key={name}>
          <label className="block text-sm font-medium mb-1 text-white">
            {label}
          </label>
          <input
            type="password"
            name={name}
            value={passwords[name as keyof typeof passwords]}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
      >
        Update Password
      </button>
    </form>
  );
}
