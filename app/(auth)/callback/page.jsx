"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { appwriteService } from "@/appwrite/appwrite";

export default function CallbackPage() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState("শুরু করা হচ্ছে...");

  const router = useRouter();
  const { initializeAuth } = useAuthStore();
  const processingRef = useRef(false);

  useEffect(() => {
    if (processingRef.current) return;

    const handleCallback = async () => {
      try {
        processingRef.current = true;
        setStatus("processing");
        setCurrentStep("Google লগইন যাচাই করা হচ্ছে...");

        // OAuth callback handle করুন
        const user = await appwriteService.handleOAuthCallback();

        if (!user) {
          throw new Error("লগইন সম্পূর্ণ হয়নি। আবার চেষ্টা করুন।");
        }

        setCurrentStep("প্রোফাইল লোড করা হচ্ছে...");

        // Auth store initialize করুন
        await initializeAuth();

        setCurrentStep("সম্পূর্ণ! রিডাইরেক্ট করা হচ্ছে...");
        setStatus("success");

        // Role অনুযায়ী redirect করুন
        const redirectPath = user.profile?.role === "user" ? "/" : "/dashboard";

        setTimeout(() => {
          router.replace(redirectPath);
        }, 1000);
      } catch (error) {
        console.error("Callback failed:", error);
        setError(error.message);
        setStatus("error");

        // Error এর পর sign-in এ redirect করুন
        setTimeout(() => {
          router.replace("/sign-in?error=" + encodeURIComponent(error.message));
        }, 3000);
      }
    };

    // ১ সেকেন্ড পর processing শুরু করুন
    const timeout = setTimeout(handleCallback, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Loading state
  if (status === "loading" || status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Google দিয়ে সাইন ইন হচ্ছে
          </h2>
          <p className="text-gray-600">{currentStep}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            সফলভাবে সাইন ইন হয়েছে!
          </h2>
          <p className="text-gray-600">{currentStep}</p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          সাইন ইন ব্যর্থ হয়েছে
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => router.replace("/sign-in")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    </div>
  );
}
