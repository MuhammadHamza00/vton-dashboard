'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Boxes, Loader2, Package, Star, Copy } from 'lucide-react';
import { Badge } from '@/components/Badge';
import { toast } from 'react-hot-toast';

const tabs = [
  { key: 'lowStock', label: 'Low Stock', icon: <Boxes size={16} /> },
  { key: 'unshippedOrders', label: 'Unshipped Orders', icon: <Package size={16} /> },
  { key: 'badReviews', label: 'Negative Reviews', icon: <Star size={16} /> },
];

export default function AdminAlerts() {
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [unshippedOrders, setUnshippedOrders] = useState<any[]>([]);
  const [badReviews, setBadReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lowStock');

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);

      const [productsRes, ordersRes, reviewsRes] = await Promise.all([
        supabase.from('Products').select('*').lte('stock', 5),
        supabase.from('Orders').select('*').or('status.eq.pending,status.eq.processing'),
        supabase.from('Reviews').select('id, rating, comment, product_id, user_id').lte('rating', 2),
      ]);

      if (!productsRes.error) setLowStock(productsRes.data || []);
      if (!ordersRes.error) setUnshippedOrders(ordersRes.data || []);
      if (!reviewsRes.error) setBadReviews(reviewsRes.data || []);

      setLoading(false);
    };

    fetchAlerts();
  }, []);

  const copyId = (id: string | number) => {
    navigator.clipboard.writeText(String(id));
    toast.success('ID copied to clipboard');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lowStock':
        return lowStock.length === 0 ? (
          <p className="text-slate-400">All stock levels are good!</p>
        ) : (
          <ul className="space-y-4">
            {lowStock.map((item) => (
              <li key={item.id} className="border border-slate-800 rounded p-3 bg-slate-800 hover:bg-slate-700 transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <div className="text-sm text-slate-400">Stock: <Badge variant="danger">{item.stock}</Badge></div>
                  </div>
                  <button onClick={() => copyId(item.id)} className="text-slate-400 hover:text-white">
                    <Copy size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        );

      case 'unshippedOrders':
        return unshippedOrders.length === 0 ? (
          <p className="text-slate-400">All orders are shipped!</p>
        ) : (
          <ul className="space-y-4">
            {unshippedOrders.map((order) => (
              <li key={order.id} className="border border-slate-800 rounded p-3 bg-slate-800 hover:bg-slate-700 transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">Order #{order.id}</h4>
                    <div className="text-sm text-slate-400">Status: <Badge variant="warning">{order.status}</Badge></div>
                  </div>
                  <button onClick={() => copyId(order.id)} className="text-slate-400 hover:text-white">
                    <Copy size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        );

      case 'badReviews':
        return badReviews.length === 0 ? (
          <p className="text-slate-400">No negative reviews 🎉</p>
        ) : (
          <ul className="space-y-4">
            {badReviews.map((review) => (
              <li key={review.id} className="border border-slate-800 rounded p-3 bg-slate-800 hover:bg-slate-700 transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">Rating: {review.rating}</h4>
                    <p className="text-slate-400 text-sm">{review.comment || 'No comment provided'}</p>
                    <div className="flex gap-2 mt-1 text-xs text-slate-400">
                      <Badge variant="info">Product ID: {review.product_id}</Badge>
                      <Badge variant="info">User ID: {review.user_id}</Badge>
                    </div>
                  </div>
                  <button onClick={() => copyId(review.id)} className="text-slate-400 hover:text-white">
                    <Copy size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-md">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">Admin Alerts</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 px-4 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}
