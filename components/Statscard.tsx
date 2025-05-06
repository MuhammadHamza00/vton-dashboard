'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';

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
        setLoading(true);

        const { count: customersCount } = await supabase
          .from('Users')
          .select('*', { count: 'exact', head: true });

        const { count: productsCount } = await supabase
          .from('Products')
          .select('*', { count: 'exact', head: true });

        const { count: ordersCount } = await supabase
          .from('Orders')
          .select('*', { count: 'exact', head: true });

        const { data: completedOrders } = await supabase
          .from('Orders')
          .select('id, total_amount')
          .eq('status', 'Completed');

        const { data: paidPayments } = await supabase
          .from('Payments')
          .select('order_id')
          .eq('status', 'Paid');

        const paidOrderIds = paidPayments?.map((payment) => payment.order_id) || [];

        const totalSalesAmount = completedOrders
          ? completedOrders
              .filter((order) => paidOrderIds.includes(order.id))
              .reduce((sum, order) => sum + (order.total_amount || 0), 0)
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

    // Real-time Subscriptions
    const ordersChannel = supabase
      .channel('orders-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Orders' }, () => {
        fetchStats();
      })
      .subscribe();

    const paymentsChannel = supabase
      .channel('payments-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Payments' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, []);

  const statsData = [
    { label: 'Total Sales', value: stats.totalSales, isMoney: true },
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Customers', value: stats.totalCustomers },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      <AnimatePresence>
        {loading ? (
          Array(4).fill(0).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="bg-[#111827] border-1 border-[#334155] p-6 rounded-2xl shadow animate-pulse h-[100px]"
            />
          ))
        ) : (
          statsData.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-[#111827] border-1 border-[#334155] hover:bg-[#000000] p-6 rounded-2xl shadow hover:shadow-lg transition-all"
            >
              <p className="text-[#9CA3AF] text-sm">{stat.label}</p>
              <h3 className="text-[#ffffff] text-2xl font-bold mt-2">
                <CountUp
                  end={stat.value}
                  duration={2}
                  separator=","
                  prefix={stat.isMoney ? '$' : ''}
                />
              </h3>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
