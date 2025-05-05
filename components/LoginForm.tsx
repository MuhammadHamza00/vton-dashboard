'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(''); // clear error on new submit

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg('Invalid login credentials.');
            return;
        }

        // Now fetch the user from database using their ID
        const { data: userData, error: userError } = await supabase
            .from('Users')           // your table name
            .select('role')          // just get role field
            .eq('userId', data.user.id)  // match by id
            .single();               // expect one record
        if (userError || !userData) {
            setErrorMsg('Error fetching user role.');
            return;
        }

        // Now check role
        if (userData.role !== 'admin') {
            setErrorMsg('You are not authorized to access the dashboard.');
            return;
        }

        // ✅ Everything good, proceed to dashboard
        router.push('/dashboard');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <form onSubmit={handleSubmit} className="bg- p-8 bg-[#111827] border-1 border-[#334155]  rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Admin Login</h2>

                {errorMsg && (
                    <div className="bg-red-500 text-white p-2 mb-4 rounded">
                        {errorMsg}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded border-1 border-[#334155]  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-white mb-2" htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded border-1 border-[#334155] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
