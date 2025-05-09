// products/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import EditProductForm from "@/components/EditProductForm";
import ProductReviews from "@/components/ProductReviews";

export default function ProductPage() {
  const { id } = useParams(); // 👈 no need to rename here
  const productId = id as string; // 👈 cast to string safely

  const [activeTab, setActiveTab] = useState<"edit" | "reviews">("edit");

  if (!productId) {
    return <p className="text-white">Invalid Product ID</p>;
  }

  return (
    <div className="max-w-5xl mx-2 p-3 text-white">
      <div className="flex space-x-4 border-b border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "edit"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("edit")}
        >
          Edit Product
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "reviews"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "edit" && <EditProductForm />}
        {activeTab === "reviews" && <ProductReviews productId={productId} />}
      </div>
    </div>
  );
}
