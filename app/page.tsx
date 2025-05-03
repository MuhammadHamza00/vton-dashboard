'use client';

import { useState } from 'react'; // ✅ import useState
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]); // ✅ state to store products
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // ✅ state for error

  async function testSupabase() {
    const { data, error } = await supabase.from('Products').select('*');

    if (error) {
      setErrorMessage(error.message);
      setProducts([]);
    } else {
      setProducts(data || []);
      setErrorMessage(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Testing Superbase</h1>
      <button 
        onClick={testSupabase} 
        className="p-2 mb-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
      >
        Load Products
      </button>

      {/* Error message if any */}
      {errorMessage && (
        <p className="text-red-500 mb-4">Error: {errorMessage}</p>
      )}

      {/* Products list */}
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="p-2 border rounded">
            {product.name} — ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
