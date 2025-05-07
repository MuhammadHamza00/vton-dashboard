'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

interface Customer {
  userId: string;
  name: string;
  email: string;
  created_at: string;
  address: string;
  phone: number;
  totalSpend: number;

}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 8;

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);

      const { data: usersData, error: usersError } = await supabase
        .from('Users')
        .select('userId, name, email, address,created_at,phone');

      if (usersError) throw usersError;

      const { data: ordersData, error: ordersError } = await supabase
        .from('Orders')
        .select('user_id, total_amount, status');

      if (ordersError) throw ordersError;

      const userSpends: Record<string, number> = {};

      ordersData?.forEach((order) => {
        if (order.status === 'Completed') {
          if (!userSpends[order.user_id]) {
            userSpends[order.user_id] = 0;
          }
          userSpends[order.user_id] += order.total_amount || 0;
        }
      });

      const mergedData = usersData?.map((user) => ({
        ...user,
        totalSpend: userSpends[user.userId] || 0,
      }));

      setCustomers(mergedData || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
      toast.error('Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer(userId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this customer? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('Users')
        .delete()
        .eq('userId', userId);

      if (error) {
        console.error('Error deleting customer:', error.message);
        toast.error('Failed to delete customer.');
      } else {
        toast.success('Customer deleted successfully.');
        // Refresh table after deleting
        fetchCustomers();
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error.message);
      toast.error('An unexpected error occurred.');
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  return (
    <div className="bg-[#111827] border-1 border-[#334155]  p-6 rounded-2xl shadow hover:shadow-lg transition-all">
      <h3 className="text-white text-xl mb-4">Customers</h3>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#1F2937] text-white placeholder-gray-400"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-white">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3">Joined</th>
              <th className="py-3 px-3">Total Spend</th>
              <th className="py-3 px-3">Address</th>
              <th className="py-3 px-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">Loading customers...</td>
              </tr>
            ) : currentCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">No customers found.</td>
              </tr>
            ) : (
              currentCustomers.map((customer) => (
                <tr key={customer.userId} className="border-t border-[#334155] hover:bg-[#000000]">
                  <td className="py-3 px-3">{customer.name}</td>
                  <td className="py-3 px-3">{customer.email}</td>
                  <td className="py-3 px-3">{customer.phone}</td>
                  <td className="py-3 px-3">{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-3">${customer.totalSpend.toLocaleString()}</td>
                  <td className="py-3 px-3">{customer.address}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => deleteCustomer(customer.userId)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="block md:hidden space-y-2 p-0">
        {loading ? (
          <div className="text-center text-white">Loading customers...</div>
        ) : currentCustomers.length === 0 ? (
          <div className="text-center text-white">No customers found.</div>
        ) : (
          currentCustomers.map((customer) => (
            <div
              key={customer.userId}
              className="bg-[#000000] border border-[#334155] rounded-xl p-4 text-white shadow hover:shadow-lg transition-all"
            >
              <div className="mb-2">
                <span className="font-normal text-gray-400">Name:</span> {customer.name}
              </div>
              <div className="mb-2">
                <span className="font-normal text-gray-400">Email:</span> {customer.email}
              </div>
              <div className="mb-2">
                <span className="font-normal text-gray-400">Phone:</span> {customer.phone}
              </div>
              <div className="mb-2">
                <span className="font-normal text-gray-400">Joined:</span> {new Date(customer.created_at).toLocaleDateString()}
              </div>
              <div className="mb-2">
                <span className="font-normal text-gray-400">Total Spend:</span> ${customer.totalSpend.toLocaleString()}
              </div>
              <div className="mb-2">
                <span className="font-normal text-gray-400">Address:</span> {customer.address}
              </div>
              <div className=" mt-4">
                <button
                  onClick={() => deleteCustomer(customer.userId)}
                  className="bg-red-600 w-full hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[#1F2937] rounded text-white disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-white">{currentPage} / {totalPages}</span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-[#1F2937] rounded text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
