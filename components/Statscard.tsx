'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // adjust your import based on file path

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total customers
        const { count: customersCount } = await supabase
          .from('Users')
          .select('*', { count: 'exact', head: true });

        // Fetch total products
        const { count: productsCount } = await supabase
          .from('Products')
          .select('*', { count: 'exact', head: true });

        // Fetch total orders
        const { count: ordersCount } = await supabase
          .from('Orders')
          .select('*', { count: 'exact', head: true });
        // Fetch total sales (only completed orders)
        const { data: completedOrders, error } = await supabase
          .from('Orders')
          .select('total_amount')
          .eq('status', 'Completed');

        const totalSalesAmount = completedOrders
          ? completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
          : 0;

        setStats({
          totalSales: totalSalesAmount,
          totalOrders: ordersCount || 0,
          totalProducts: productsCount || 0,
          totalCustomers: customersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-400">Loading stats...</p>;
  }

  const statsData = [
    { label: 'Total Sales', value: `$${stats.totalSales.toLocaleString()}` },
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Customers', value: stats.totalCustomers },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {statsData.map((stat) => (
        <div key={stat.label} className="bg-[#111827] border-1 border-[#334155] hover:bg-[#000000] p-6 rounded-2xl shadow hover:shadow-lg transition-all">
          <p className="text-[#9CA3AF] text-sm">{stat.label}</p>
          <h3 className="text-[#ffffff] text-2xl font-bold mt-2">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
}
