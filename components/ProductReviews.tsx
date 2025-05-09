"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { FaTrash } from "react-icons/fa"; // 👈 For better delete icon

type Review = {
  id: number;
  user_id: string;
  order_id: string;
  product_id: string;
  content: string;
  stars: number;
  created_at: string;
};

type Users = {
  userId: string;
  name: string | null;
};

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    if (productId) {
      fetchReviews();
      fetchUsers();
    }
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    } else {
      toast.error("Failed to load reviews");
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("Users").select("userId, name");
    if (error) {
      toast.error("Failed to load users");
    } else {
      setUsers(data || [] );
    }
  };

  const getUserInfo = (userId: string) => {
    const user = users.find((u) => u.userId === userId);
    return user ? `${user.name || "Unknown User"} (${userId})` : `User ID: ${userId}`;
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("Reviews").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete review");
    } else {
      toast.success("Review deleted");
      fetchReviews();
    }
  };

  if (loading) {
    return <p className="text-white">Loading reviews...</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-gray-400">No reviews yet for this product.</p>;
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length;

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  return (
    <div className="space-y-6">
      {/* ⭐ Average rating on top */}
      <div className="text-center mb-3">
        <div className="text-yellow-400 text-3xl">
          {Array.from({ length: Math.floor(averageRating) }).map((_, i) => (
            <span key={i}>⭐</span>
          ))}
          {averageRating % 1 !== 0 && <span>⭐</span>}
        </div>
        <p className="text-white font-bold">{averageRating.toFixed(1)} / 5</p>
      </div>

      {/* Reviews */}
      {currentReviews.map((review) => (
        <div
          key={review.id}
          className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-yellow-400 font-semibold text-lg">
              {Array.from({ length: review.stars }).map((_, i) => (
                <span key={i}>⭐</span>
              ))}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="text-white">{review.content}</div>

          <div className="text-sm text-gray-400">
            {getUserInfo(review.user_id)}
          </div>

          {/* Fancy Delete Button */}
          <div className="flex justify-end">
            <button
              onClick={() => handleDelete(review.id)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded-full font-semibold ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              } hover:bg-blue-500 transition-all`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
