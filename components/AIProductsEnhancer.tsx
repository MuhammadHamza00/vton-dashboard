"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import Script from "next/script";

declare global {
    interface Window {
        puter: any;
    }
}

export default function AIProductsEnhancer({ productId }: { productId: string }) {
    const [productData, setProductData] = useState<null | {
        name: string;
        description: string;
        category: string;
        features: string[];
        reviews: string[];
    }>(null);
    const [activeTab, setActiveTab] = useState<"summary" | "seo">("summary");

    const [reviewSummary, setReviewSummary] = useState("");
    const [seoData, setSeoData] = useState({ html: "" });

    const [loadingReview, setLoadingReview] = useState(false);
    const [loadingSEO, setLoadingSEO] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [puterReady, setPuterReady] = useState(false);

    useEffect(() => {
        async function fetchProduct() {
            try {
                setLoadingProduct(true);

                const { data: product, error: productError } = await supabase
                    .from("Products")
                    .select("name, description, category, features")
                    .eq("id", productId)
                    .single();

                if (productError) {
                    throw productError;
                }

                const { data: reviews, error: reviewsError } = await supabase
                    .from("Reviews")
                    .select("content")
                    .eq("product_id", productId);
                if (reviewsError) {
                    throw reviewsError;
                }
                const reviewsCount = reviews?.length || 0;

                setProductData({
                    name: product.name,
                    description: product.description,
                    category: product.category,
                    features: product.features || [],
                    reviews: reviews?.map((r: any) => r.content) || [],
                });

            } catch (error) {
                toast.error("Failed to load product data.");
            } finally {
                setLoadingProduct(false);
            }
        }

        fetchProduct();
    }, [productId]);

    const handleSummarizeReviews = async () => {
        if (!productData?.reviews.length) {
            toast.error("No reviews to summarize.");
            return;
        }

        if (!window.puter) {
            toast.error("AI tools not ready yet. Please wait.");
            return;
        }

        try {
            setLoadingReview(true);
            setReviewSummary("");

            const prompt = `Summarize the following customer reviews in short paragraph:\n\n${productData.reviews.join("\n")}`;

            const response = await window.puter.ai.chat(prompt, {
                model: "gpt-4o-mini",
                stream: true,
            });

            for await (const part of response) {
                setReviewSummary(prev => prev + (part?.text || ""));
            }

        } catch (error) {
            toast.error("Failed to summarize reviews.");
        } finally {
            setLoadingReview(false);
        }
    };

    const handleGenerateSEO = async () => {
        if (!productData) return;

        if (!window.puter) {
            toast.error("AI tools not ready yet. Please wait.");
            return;
        }

        try {
            setLoadingSEO(true);
            setSeoData({ html: "" }); // single field for full HTML

            const prompt = `
            I'm giving you product data Title${productData.name},Description  ${productData.description},Category ${productData.category} and Features ${productData.features.join(", ")}.
            You've to act as SEO expert and generate optimized Title, description,category and features list even if something is missing.
            Format: Bold Title: Optimized title Same for other properties.
            Only respond with pure HTML. No code block formatting. No explanations.
            `;

            const response = await window.puter.ai.chat(prompt, {
                model: "gpt-4o-mini",
                stream: true,
            });

            let fullText = "";

            for await (const part of response) {
                fullText += part?.text || "";
            }

            setSeoData({ html: fullText.trim() });

        } catch (error) {
            toast.error("Failed to generate SEO content.");
        } finally {
            setLoadingSEO(false);
        }
    };


    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied!");
    };

    if (loadingProduct) {
        return (
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
                <div className="flex space-x-4 mb-6">
                    <div className="h-10 bg-gray-700 rounded w-32"></div>
                    <div className="h-10 bg-gray-700 rounded w-48"></div>
                </div>
                <div className="h-40 bg-gray-800 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Load Puter Script */}
            <Script
                src="https://js.puter.com/v2/"
                strategy="afterInteractive"
                onLoad={() => setPuterReady(true)}

            />


            <div className="border-1 border-gray-800 p-8 rounded-md shadow-2xl space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">🧠 AI Assistant</h2>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        className={`py-2 px-6 rounded-md  transition ${activeTab === "summary" ? "bg-gray-800  text-white " : "border-1 border-gray-800 text-gray-300"
                            }`}
                        onClick={() => setActiveTab("summary")}
                    >
                        Review Summarizer
                    </button>

                    <button
                        className={`py-2 px-6 rounded-md  transition ${activeTab === "seo" ? "bg-gray-800  text-white" : "border-1 border-gray-800 text-gray-300"
                            }`}
                        onClick={() => setActiveTab("seo")}
                    >
                        SEO Title & Description
                    </button>
                </div>

                {!puterReady && (
                    <div className="text-gray-400">Loading AI tools...</div>
                )}

                {puterReady && (
                    <>
                        {/* Summary Tab */}
                        {activeTab === "summary" && (
                            <div className="space-y-6">
                                <button
                                    onClick={handleSummarizeReviews}
                                    disabled={loadingReview}
                                    className="bg-blue-500 hover:bg-blue-600 text-white  py-3 px-8 rounded-md transition"
                                >
                                    {loadingReview ? "Summarizing..." : "Summarize Reviews"}
                                </button>

                                {reviewSummary && (
                                    <div className="border-1 border-gray-800 p-6 rounded-xl relative">
                                        <h3 className="text-xl text-white mb-4">Summary:</h3>
                                        <p className="text-gray-300 whitespace-pre-line">{reviewSummary}</p>

                                        <button
                                            onClick={() => handleCopy(reviewSummary)}
                                            className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition cursor-pointer"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "seo" && (
                            <div className="space-y-6">
                                <button
                                    onClick={handleGenerateSEO}
                                    disabled={loadingSEO}
                                    className="bg-blue-500 hover:bg-blue-600 text-white  py-3 px-8 rounded-md transition"
                                >
                                    {loadingSEO ? "Generating..." : "Generate SEO Content"}
                                </button>

                                {seoData.html && (
                                    <div className="border-1 border-gray-800 p-6 rounded-xl space-y-6 relative">
                                        <div className="prose prose-invert max-w-none text-gray-300">
                                            <div dangerouslySetInnerHTML={{ __html: seoData.html }} />
                                        </div>

                                        <button
                                            onClick={() => handleCopy(seoData.html)}
                                            className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                )}


                            </div>
                        )}

                    </>
                )}
            </div>
        </div>
    );
}

