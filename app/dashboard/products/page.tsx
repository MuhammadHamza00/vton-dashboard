'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // at top

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discounted_price: number;
  category: string;
  stock: number;
  tryOnCompatible: boolean;
  created_at: string;
  features: string[];
  colors: string[];
  images: string[];
  sizes: string[];
}

export default function ProductsPage() {
  const router = useRouter(); // inside your component
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('Products')
        .select('*');

      if (error) throw error;

      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      toast.error('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: number) {
    const confirmDelete = confirm('Are you sure you want to delete this product? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('Products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error.message);
        toast.error('Failed to delete product.');
      } else {
        toast.success('Product deleted successfully.');
        fetchProducts();
      }
    } catch (error: any) {
      console.error('Error deleting product:', error.message);
      toast.error('An unexpected error occurred.');
    }
  }

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="bg-[#111827] border-1 border-[#334155] p-6 rounded-2xl shadow hover:shadow-lg transition-all">
      <h3 className="text-white text-xl mb-4">Products</h3>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-lg bg-[#1F2937] text-white placeholder-gray-400"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="text-left bg-[#1e293b] text-white text-sm">
              {['ID', 'Name', 'Price', 'Price2', 'Category', 'Stock', 'Colors', 'Size', 'Try-On', 'Date', 'Actions'].map((heading, idx) => (
                <th key={idx} className="py-2 px-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-300 text-sm">
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center py-8">Loading products...</td>
              </tr>
            ) : currentProducts.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8">No products found.</td>
              </tr>
            ) : (
              currentProducts.map((product) => (
                <tr key={product.id} className="border-t border-[#334155] hover:bg-[#0f172a]/50 transition">
                  <td className="py-3 px-3">{product.id}</td>
                  <td className="py-3 px-3">{product.name}</td>
                  <td className="py-3 px-3">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-3">${product.discounted_price}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(product?.category) ? product?.category.map((cat, idx) => (
                        <span key={idx} className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {cat}
                        </span>
                      )) : product?.category && (
                        <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">{product.stock}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {product?.colors?.map((color, idx) => (
                        <span key={idx} className="inline-block w-4 h-4 rounded-full ring-1 ring-gray-300" style={{ backgroundColor: color }}></span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((size, idx) => (
                        <span key={idx} className={`inline-flex items-center rounded bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 ${size === 'S' ? 'bg-green-100 text-green-800' :
                            size === 'M' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                          {size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">{product.tryOnCompatible ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-3">{new Date(product.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/dashboard/products/${product.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs">
                        {loadingId === product.id ? 'Loading...' : 'Manage'}
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-xs">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {loading ? (
          <div className="text-center py-8 text-white">Loading products...</div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-8 text-white">No products found.</div>
        ) : (
          <div className="space-y-4">
            {currentProducts.map((product) => (
              <div key={product.id} className="border border-[#334155] rounded-lg p-4 bg-[#0f172a] shadow-sm text-white">
                <div className="flex justify-between mb-2">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm">${product.price.toFixed(2)}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-300 mb-2">
                  <span>Category:</span>
                  {Array.isArray(product.category) ? product.category.map((cat, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{cat}</span>
                  )) : product?.category && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{product.category}</span>
                  )}
                </div>
                <div className="flex gap-2 mb-2">
                  {product.colors.map((color, idx) => (
                    <span key={idx} className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: color }}></span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-2">
                  {product.sizes.map((size, idx) => (
                    <span key={idx} className={`px-2 py-0.5 rounded ${size === 'S' ? 'bg-green-100 text-green-800' :
                      size === 'M' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {size}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mb-2">Stock: {product.stock} | Try-On: {product.tryOnCompatible ? 'Yes' : 'No'}</div>
                <div className="text-xs text-gray-500 mb-4">Date: {new Date(product.created_at).toLocaleDateString()}</div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => router.push(`/dashboard/products/${product.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs">
                    {loadingId === product.id ? 'Loading...' : 'Manage'}
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-xs">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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
