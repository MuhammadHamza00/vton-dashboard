'use client';

import React, { useState } from 'react';
import AddProductButton from './AddProductButton';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Papa from 'papaparse';
import Spinner from '@/components/Loader';
import { supabase } from "@/lib/supabaseClient";
import BulkProductUpload from "@/components/BulkUpload"; // Adjust path if needed

const statuses = ['Completed', 'Pending', 'Shipped', 'Returned'];
const productCategories = ['Electronics', 'Clothing', 'Beauty', 'Toys'];

export default function ExportSection() {
  const router = useRouter();
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [exportType, setExportType] = useState('Products');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    let query;

    switch (exportType) {
      case 'Products':
        query = supabase.from('Products').select('*');
        if (categoryFilter) query = query.eq('category', categoryFilter);
        break;

      case 'Orders':
        query = supabase.from('Orders').select('*');
        if (statusFilter) query = query.eq('status', statusFilter);
        break;

      case 'Reviews':
        query = supabase.from('Reviews').select('*');
        break;

      case 'Customers':
        query = supabase.from('Users').select('*');
        break;

      default:
        toast.error('Invalid export type');
        setLoading(false);
        return;
    }

    if (dateRange.from) query = query.gte('created_at', dateRange.from);
    if (dateRange.to) query = query.lte('created_at', dateRange.to);

    const { data, error } = await query;

    setLoading(false);

    if (error) {
      toast.error('Export failed: ' + error.message);
    } else if (data && data.length > 0) {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportType.toLowerCase()}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${exportType} exported successfully!`);
    } else {
      toast('No data found for export.');
    }

    setModalOpen(false);
  };

  const shouldShowStatus = exportType === 'Orders';

  return (
    <div className="w-full bg-[#111827] p-4 border border-[#334155] rounded-xl mb-3">
      <Toaster position="top-center" />

      <div className="flex items-center ">
        <AddProductButton onClick={() => router.push("/dashboard/products/addproduct")} />

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow ml-4"
          onClick={() => setModalOpen(true)}
        >
          📦 Export Data
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow ml-4 mr-4"
          onClick={() => setShowBulkUpload((prev) => !prev)}
        >
          📤 {showBulkUpload ? "Hide" : "Bulk Upload CSV"}
        </button>
        {/* Show BulkUploadCSV component conditionally */}
        {showBulkUpload && <BulkProductUpload />}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-[#1f2937] rounded-xl p-6 w-full max-w-md shadow-lg relative border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">📁 Export Data</h2>

            {/* Export Type */}
            <label className="block text-gray-300 mb-1">Export Type</label>
            <select
              className="w-full p-2 mb-4 rounded-md bg-gray-800 text-white border border-gray-600"
              value={exportType}
              onChange={(e) => {
                setExportType(e.target.value);
                setStatusFilter('');
                setCategoryFilter('');
              }}
            >
              <option>Products</option>
              <option>Orders</option>
              <option>Reviews</option>
              <option>Customers</option>
            </select>

            {/* Status Filter */}
            {shouldShowStatus && (
              <>
                <label className="block text-gray-300 mb-1">Status</label>
                <select
                  className="w-full p-2 mb-4 rounded-md bg-gray-800 text-white border border-gray-600"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </>
            )}

            {/* Category Filter */}
            {exportType === 'Products' && (
              <>
                <label className="block text-gray-300 mb-1">Category</label>
                <select
                  className="w-full p-2 mb-4 rounded-md bg-gray-800 text-white border border-gray-600"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {productCategories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </>
            )}

            {/* Date Range */}
            <label className="block text-gray-300 mb-1">Date Range</label>
            <div className="flex gap-2 mb-4">
              <input
                type="date"
                className="w-1/2 p-2 rounded-md bg-gray-800 text-white border border-gray-600"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
              <input
                type="date"
                className="w-1/2 p-2 rounded-md bg-gray-800 text-white border border-gray-600"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>

            {loading && <Spinner />}

            <div className="flex justify-between">
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => setModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={handleExport}
                disabled={loading}
              >
                {loading ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
