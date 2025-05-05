'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
  totalSpend: number;
}

// Initialize supabase client manually
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('Users')
        .select('userId, name, email, created_at');

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

      const mergedData: Customer[] = usersData?.map((user) => ({
        id: user.userId,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        totalSpend: userSpends[user.userId] || 0,
      }));

      setCustomers(mergedData || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-[#111827] border-1 border-[#334155] p-6 rounded-2xl shadow hover:shadow-lg transition-all">
      <h3 className="text-white text-xl mb-4">Customers</h3>

      {/* Simple input field */}
      <input
        type="text"
        placeholder="Search customers..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1); // reset to first page when search
        }}
        className="w-full mb-6 p-2 rounded bg-[#1f2937] text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-white">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Created At</th>
              <th className="py-3 px-3">Total Spend</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  Loading customers...
                </td>
              </tr>
            ) : paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  No customers found.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-t px-3 py-3 border-[#334155] hover:bg-[#000000] hover:border-[#334155]"
                >
                  <td className="py-3 px-3">{customer.name}</td>
                  <td className="py-3 px-3">{customer.email}</td>
                  <td className="py-3 px-3">{format(new Date(customer.created_at), 'dd MMM yyyy')}</td>
                  <td className="py-3 px-3">${customer.totalSpend.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-[#334155] text-white px-4 py-2 rounded hover:bg-[#1f2937] disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-[#334155] text-white px-4 py-2 rounded hover:bg-[#1f2937] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
