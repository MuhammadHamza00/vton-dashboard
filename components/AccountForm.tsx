import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // update path if needed

export default function AccountForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        phone: "",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from("Users")
                .select("name, email, address, phone")
                .eq("userId", user.id) // <-- THIS IS THE FIX
                .single();

            if (!error && data) {
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    address: data.address || "",
                    phone: data.phone || "",
                });
            } else {
                console.log(error); // optional: debug if still any issue
            }
        }
        setLoading(false);
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from("Users")
                .update({
                    name: formData.name,
                    email: formData.email,
                    address: formData.address,
                    phone: formData.phone,
                })
                .eq("userId", user.id
                );

            if (error) {
                alert("Error updating profile!");
            } else {
                alert("Profile updated successfully!");
            }
        }
    };

    if (loading) return <p className="text-white">Loading...</p>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {["name", "email", "address", "phone"].map((field) => (
                <div key={field}>
                    <label className="block text-sm font-medium mb-1 capitalize text-white">
                        {field}
                    </label>
                    <input
                        type="text"
                        name={field}
                        value={formData[field as keyof typeof formData]}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            ))}

            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
            >
                Save Changes
            </button>
        </form>
    );
}
