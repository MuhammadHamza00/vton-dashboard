'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

function BulkUploadCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewData(results.data as any[]);
        },
        error: (err) => {
          toast.error('CSV parse error');
          console.error(err);
        },
      });
    }
  };

  const handleCSVUpload = async () => {
    if (!file || previewData.length === 0) {
      toast.error('Please select and preview a valid CSV first.');
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    for (const [i, row] of previewData.entries()) {
      try {
        const product: {
                    name: string;
                    description: string;
                    price: number;
                    discounted_price: number;
                    category: string;
                    stock: number;
                    tryOnCompatible: boolean;
                    features: string[];
                    colors: string[];
                    sizes: string[];
                    images: string[]; // ✅ Explicitly type this
                } = {
                    name: row.name,
                    description: row.description,
                    price: parseFloat(row.price),
                    discounted_price: parseFloat(row.discounted_price),
                    category: row.category,
                    stock: parseInt(row.stock),
                    tryOnCompatible: row.tryOnCompatible === 'true',
                    features: row.features?.split(';').map((s: string) => s.trim()) || [],
                    colors: row.colors?.split(';').map((s: string) => s.trim()) || [],
                    sizes: row.sizes?.split(';').map((s: string) => s.trim()) || [],
                    images: [], // ✅ Now TypeScript knows this is a string[]
                };

        const imageUrls = row.images?.split(';').map((s: string) => s.trim()) || [];
        const uploadedImages = [];

        for (const imageUrl of imageUrls) {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
          const filePath = `products/${Date.now()}-${i}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('Product Images')
            .upload(filePath, blob);

          if (uploadError) continue;

          const { data: urlData } = supabase.storage
            .from('Product Images')
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) uploadedImages.push(urlData.publicUrl);
        }

        product.images = uploadedImages;

        const { error } = await supabase.from('Products').insert([product]);
        if (!error) successCount++;
      } catch (err) {
        console.error(`Row ${i} failed`, err);
      }
    }

    toast.success(`${successCount} products uploaded!`);
    setIsUploading(false);
    setFile(null);
    setPreviewData([]);
  };

  return (
    <div className="bg-[#111827] text-white p-6 rounded-2xl shadow-xl w-full max-w-5xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-4">📦 Bulk Product Upload (CSV)</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-white file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-600 file:text-white
        hover:file:bg-blue-700"
      />

      {previewData.length > 0 && (
        <div className="overflow-auto mb-4 max-h-[400px] border border-gray-700 rounded-lg">
          <table className="min-w-full table-auto text-sm text-left text-white">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                {Object.keys(previewData[0]).map((key) => (
                  <th key={key} className="px-4 py-2 border-b border-gray-700">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, idx) => (
                <tr key={idx} className="odd:bg-gray-900 even:bg-gray-800">
                  {Object.keys(row).map((key) => (
                    <td key={key} className="px-4 py-2 border-b border-gray-700">{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={handleCSVUpload}
        disabled={!file || isUploading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl transition-all duration-200"
      >
        {isUploading ? 'Uploading Products...' : 'Upload All Products'}
      </button>

      <div className="mt-6 text-sm text-gray-400">
        <p className="mb-2">🧾 CSV format must include these headers:</p>
        <code className="text-yellow-300">
          name, description, price, discounted_price, category, stock, tryOnCompatible, features, colors, images, sizes
        </code>
        <p className="mt-2">⚠️ Use <code className="text-yellow-300">semicolon (;) </code> to separate multiple features, colors, images, sizes.</p>
      </div>
    </div>
  );
}

export default function BulkUploadModalWrapper() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
      >
        Open Bulk Upload
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)} // close modal on background click
        >
          <div
            className="bg-[#111827] p-6 rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>

            <BulkUploadCSV />
          </div>
        </div>
      )}
    </>
  );
}
