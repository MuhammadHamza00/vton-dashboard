'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_name: string;
  shipping_address: string;
  payment_status?: string;
  payment_method?: string;
  payment_date?: string;
  payment_id?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from('Orders')
        .select('*')
        .order('created_at', { ascending: false }); // newest first

      if (ordersError) throw ordersError;

      const { data: usersData, error: usersError } = await supabase
        .from('Users')
        .select('userId, name, address');
      if (usersError) throw usersError;

      const { data: paymentData, error: paymentError } = await supabase
        .from('Payments')
        .select('id, order_id, payment_method, status, created_at');
      if (paymentError) throw paymentError;

      const mergedOrders = ordersData?.map((order) => {
        const user = usersData?.find((u) => u.userId === order.user_id);
        const payment = paymentData?.find((p) => p.order_id === order.id);
        return {
          ...order,
          user_name: user?.name || 'Unknown',
          shipping_address: user?.address || 'Not Provided',
          payment_status: payment?.status || 'Pending',
          payment_method: payment?.payment_method || 'Unknown',
          payment_date: payment?.created_at || '',
          payment_id: payment?.id || '',
        };
      });

      setOrders(mergedOrders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error.message);
      toast.error('Error fetching orders.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(orderId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this order?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('Orders').delete().eq('id', orderId);

    if (error) {
      toast.error('Failed to delete order.');
    } else {
      toast.success('Order deleted.');
      fetchOrders();
    }
  }

  async function handleShippingStatusChange(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('Orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update shipping status.');
    } else {
      toast.success('Shipping status updated.');
      fetchOrders();
    }
  }

  async function handlePaymentStatusChange(paymentId: string, newPaymentStatus: string) {
    const { error } = await supabase
      .from('Payments')
      .update({ status: newPaymentStatus })
      .eq('id', paymentId);

    if (error) {
      toast.error('Failed to update payment status.');
    } else {
      toast.success('Payment status updated.');
      fetchOrders();
    }
  }

  const filteredOrders = orders.filter((order) =>
    `${order.id} ${order.user_name} ${order.shipping_address}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  function goToNextPage() {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }

  function goToPreviousPage() {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }

  return (
    <div className="p-6 bg-[#111827] border-1 border-[#334155] rounded-2xl">
      <h3 className="text-white text-2xl font-bold mb-6">Orders</h3>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-3 rounded-lg bg-[#1F2937] text-white placeholder-gray-400"
        />
      </div>

      <div className="bg-[#111827] border-1 rounded-2xl shadow hover:shadow-lg transition-all">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-white">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Shipping Status</th>
                <th className="py-3 px-3">Shipping Address</th>
                <th className="py-3 px-3">Payment Status</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Payment Date</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    Loading orders...
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    No orders found.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-[#334155] hover:bg-[#000000]"
                  >
                    <td className="py-3 px-3">{order.id}</td>
                    <td className="py-3 px-3">{order.user_name}</td>
                    <td className="py-3 px-3">${order.total_amount.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleShippingStatusChange(order.id, e.target.value)}
                        className="bg-[#1F2937] border border-[#334155] text-white rounded p-2"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">{order.shipping_address}</td>
                    <td className="py-3 px-3">
                      {order.payment_id ? (
                        <select
                          value={order.payment_status}
                          onChange={(e) =>
                            handlePaymentStatusChange(order.payment_id!, e.target.value)
                          }
                          className="bg-[#1F2937] border border-[#334155] text-white rounded p-2"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      ) : (
                        'No Payment'
                      )}
                    </td>
                    <td className="py-3 px-3">{order.payment_method}</td>
                    <td className="py-3 px-3">
                      {order.payment_date
                        ? new Date(order.payment_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleDelete(order.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-4 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-white mt-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-4 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
