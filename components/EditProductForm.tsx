'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

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
    images: string[]; // array of image URLs
    sizes: string[];
}

export default function EditProductPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [newImageFiles, setNewImageFiles] = useState<FileList | null>(null);

    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    async function fetchProduct() {

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('Products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error: any) {
            console.error('Error fetching product:', error.message);
            toast.error('Failed to load product.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteImage(imageUrl: string) {
        if (!product) return; // ADD THIS to avoid null errors

        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const path = imageUrl.split(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Product%20Images/`)[1];

            const { error: storageError } = await supabase
                .storage
                .from('Product Images')
                .remove([path]);

            if (storageError) {
                console.error('Error deleting from storage:', storageError.message);
                toast.error('Failed to delete image from storage.');
                return;
            }

            const updatedImages = product.images.filter((url) => url !== imageUrl);

            // Instead of spreading directly, make sure you keep all fields
            setProduct({
                ...product,
                images: updatedImages,
            });

            const { error: updateError } = await supabase
                .from('Products')
                .update({ images: updatedImages })
                .eq('id', product.id);

            if (updateError) {
                console.error('Error updating product images:', updateError.message);
                toast.error('Failed to update product images.');
                return;
            }

            toast.success('Image deleted successfully!');

        } catch (error: any) {
            console.error('Error deleting image:', error.message);
            toast.error('Error deleting image.');
        }
    }


    async function handleUpdateProduct() {
        if (!product) return;

        setIsUpdating(true); // Start loading
        try {
            let updatedImageUrls = product?.images || [];

            if (newImageFiles && newImageFiles.length > 0) {
                const uploadedUrls: string[] = [];

                for (let i = 0; i < newImageFiles.length; i++) {
                    const file = newImageFiles[i];
                    const fileExt = file.name.split('.').pop();
                    const filePath = `products/${id}-${Date.now()}-${i}.${fileExt}`;

                    const { data, error } = await supabase.storage
                        .from('Product Images')
                        .upload(filePath, file);

                    if (error) throw error;

                    const { data: publicUrlData } = supabase
                        .storage
                        .from('Product Images')
                        .getPublicUrl(filePath);

                    if (publicUrlData?.publicUrl) {
                        uploadedUrls.push(publicUrlData.publicUrl);
                    }
                }

                // Append new images to old ones
                updatedImageUrls = [...updatedImageUrls, ...uploadedUrls];
            }

            const { error } = await supabase
                .from('Products')
                .update({
                    ...product,
                    images: updatedImageUrls,
                })
                .eq('id', id);

            if (error) throw error;

            toast.success('Product updated successfully.');
            router.push('/dashboard/products');
        } catch (error: any) {
            console.error('Error updating product:', error.message);
            toast.error('Failed to update product.');
        } finally {
            setIsUpdating(false); // Stop loading
        }
    }

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    if (!product) {
        return <div className="text-white">Product not found.</div>;
    }

    return (
        <div className="bg-[#111827] p-5 rounded-2xl shadow hover:shadow-lg transition-all max-w-5xl mx-auto mt-5">
            <h3 className="text-white text-xl mb-6">Edit Product</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-4">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={product?.name || ""}
                        onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <textarea
                        placeholder="Description"
                        value={product?.description || ""}
                        onChange={(e) => setProduct({ ...product, description: e.target.value })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white h-24"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={product?.price || ""}
                        onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <input
                        type="number"
                        placeholder="Disconted Price"
                        value={product?.discounted_price || ""}
                        onChange={(e) => setProduct({ ...product, discounted_price: parseFloat(e.target.value) })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={product?.category || ""}
                        onChange={(e) => setProduct({ ...product, category: e.target.value })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <input
                        type="number"
                        placeholder="Stock"
                        value={product?.stock || ""}
                        onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <input
                        type="text"
                        placeholder="Features (comma separated)"
                        value={product?.features.join(', ') || ""}
                        onChange={(e) =>
                            setProduct({ ...product, features: e.target.value.split(',').map(f => f.trim()) })
                        }
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <input
                        type="text"
                        placeholder="Colors (comma separated)"
                        value={product?.colors.join(', ') || ""}
                        onChange={(e) =>
                            setProduct({ ...product, colors: e.target.value.split(',').map(c => c.trim()) })
                        }
                        className="p-3 rounded-lg bg-[#1F2937] text-white"
                    />
                    <input
                        type="text"
                        placeholder="Sizes (comma separated)"
                        value={product?.sizes.join(', ') || ""}
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
                    <div className="grid grid-cols-2 gap-2">
                        {product.images && product.images.length > 0 ? (
                            product.images.map((url, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={url}
                                        alt="Product"
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteImage(url)}
                                        className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded px-2 py-1"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No images uploaded yet.</p>
                        )}
                    </div>

                    <div className="flex flex-col space-y-4">
                        <label className="flex flex-col items-center justify-center px-6 py-4 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-blue-500 transition text-gray-400 hover:text-white">
                            <span className="text-lg font-semibold">Upload Images</span>
                            <span className="text-sm">(Click or Drag & Drop)</span>
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


            </div>

            <button
                onClick={handleUpdateProduct}
                disabled={isUpdating}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg w-full flex items-center justify-center"
            >
                {isUpdating ? (
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
                        <span>Updating...</span>
                    </div>
                ) : (
                    'Update Product'
                )}
            </button>

        </div>
    );
}
