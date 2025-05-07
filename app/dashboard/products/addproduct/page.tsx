'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

interface Product {
    name: string;
    description: string;
    price: number;
    discounted_price: number;
    category: string;
    stock: number;
    tryOnCompatible: boolean;
    features: string[];
    colors: string[];
    images: string[];
    sizes: string[];
}

export default function AddProductPage() {
    const router = useRouter();
    const [product, setProduct] = useState<Product>({
        name: '',
        description: '',
        price: 0,
        discounted_price: 0,
        category: '',
        stock: 0,
        tryOnCompatible: false,
        features: [],
        colors: [],
        images: [],
        sizes: [],
    });

    const [newImageFiles, setNewImageFiles] = useState<FileList | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleAddProduct() {
        setIsSubmitting(true);

        try {
            let uploadedImageUrls: string[] = [];

            if (newImageFiles && newImageFiles.length > 0) {
                for (let i = 0; i < newImageFiles.length; i++) {
                    const file = newImageFiles[i];
                    const fileExt = file.name.split('.').pop();
                    const filePath = `products/${Date.now()}-${i}.${fileExt}`;

                    const { data, error: uploadError } = await supabase.storage
                        .from('Product Images')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase
                        .storage
                        .from('Product Images')
                        .getPublicUrl(filePath);

                    if (publicUrlData?.publicUrl) {
                        uploadedImageUrls.push(publicUrlData.publicUrl);
                    }
                }
            }

            const { error } = await supabase
                .from('Products')
                .insert([
                    {
                        ...product,
                        images: uploadedImageUrls,
                    },
                ]);

            if (error) throw error;

            toast.success('Product added successfully!');
            router.push('/dashboard/products');
        } catch (error: any) {
            console.error('Error adding product:', error.message);
            toast.error('Failed to add product.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-[#111827] p-6 rounded-2xl shadow hover:shadow-lg transition-all max-w-5xl mx-auto mt-10">
            <h3 className="text-white text-xl mb-6">Add Product</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-4">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={product.name}
                        onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={product.description}
                        onChange={(e) => setProduct({ ...product, description: e.target.value })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white h-24"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Discounted Price"
                        value={product.discounted_price}
                        onChange={(e) => setProduct({ ...product, discounted_price: parseFloat(e.target.value) })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                        
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={product.category}
                        onChange={(e) => setProduct({ ...product, category: e.target.value })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Stock"
                        value={product.stock}
                        onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Features (comma separated)"
                        value={product.features.join(', ')}
                        onChange={(e) =>
                            setProduct({ ...product, features: e.target.value.split(',').map(f => f.trim()) })
                        }
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <input
                        type="text"
                        placeholder="Colors (comma separated)"
                        value={product.colors.join(', ')}
                        onChange={(e) =>
                            setProduct({ ...product, colors: e.target.value.split(',').map(c => c.trim()) })
                        }
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <input
                        type="text"
                        placeholder="Sizes (comma separated)"
                        value={product.sizes.join(', ')}
                        onChange={(e) =>
                            setProduct({ ...product, sizes: e.target.value.split(',').map(s => s.trim()) })
                        }
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <label className="flex items-center space-x-2 text-white">
                        <input
                            type="checkbox"
                            checked={product.tryOnCompatible}
                            onChange={(e) => setProduct({ ...product, tryOnCompatible: e.target.checked })}
                        />
                        <span>Try-On Compatible</span>
                    </label>
                </div>

                {/* Images Section */}
                <div className="flex flex-col space-y-4">
                    <label className="flex flex-col items-center justify-center px-6 py-4 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-blue-500 transition text-gray-400 hover:text-white">
                        <span className="text-lg font-semibold">Click to Upload Images</span>
                        <span className="text-sm">(or drag and drop)</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setNewImageFiles(e.target.files)}
                            className="hidden"
                        />
                    </label>
                </div>

            </div>

            <button
                onClick={handleAddProduct}
                disabled={isSubmitting}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg w-full flex items-center justify-center"
            >
                {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                        </svg>
                        <span>Submitting...</span>
                    </div>
                ) : (
                    'Add Product'
                )}
            </button>
        </div>
    );
}
