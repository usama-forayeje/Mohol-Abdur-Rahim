
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ useAuth hook থেকে loginWithGoogle নিন
  const { loginWithGoogle } = useAuthStore();

  // useAuthStore থেকে শুধুমাত্র state-related values নিন
  const { isAuthenticated, canAccessDashboard, clearError } = useAuthStore();

  // Check for URL errors
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (canAccessDashboard()) {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, canAccessDashboard, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    clearError();

    try {
      await loginWithGoogle();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-4"
        >
          <div className="mx-auto h-20 w-20   flex items-center justify-center mb-2">
            <Image
              src="/logo.png"
              alt="Abdul Raheem Tailoring"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">স্বাগতম</h1>
          <p className="text-gray-600">
            আপনার প্রবেশের জন্য ধন্যবাদ!
          </p>
        </motion.div>

        {/* Sign In Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="shadow-2xl bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold text-gray-800">
                সাইন ইন করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 flex justify-between items-center">
                    <span>{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="ml-2 text-red-600 hover:text-red-800 underline"
                    >
                      বন্ধ করুন
                    </button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Google Sign In Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      <span>সাইন ইন হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Google দিয়ে সাইন ইন করুন</span>
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Info Text */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  সাইন ইন করে আপনি আমাদের{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    শর্তাবলী
                  </a>{" "}
                  এবং{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    গোপনীয়তা নীতি
                  </a>{" "}
                  মেনে নিচ্ছেন।
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          <p>
            সাহায্যের প্রয়োজন?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              যোগাযোগ করুন
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}