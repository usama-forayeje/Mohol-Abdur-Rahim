
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use the auth context instead of direct store access
  const { isAuthenticated, canAccessDashboard, clearError } = useAuth();

  // Check for URL errors
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      let errorMessage = decodeURIComponent(urlError);

      // Handle specific browser session errors - simplified for Firefox
      if (errorMessage.includes("Firefox_session_blocked")) {
        errorMessage = "Firefox_session_blocked";
      } else if (errorMessage.includes("Safari_session_blocked")) {
        errorMessage = "Safari_session_blocked";
      } else if (errorMessage.includes("Browser_session_blocked")) {
        errorMessage = "Browser_session_blocked";
      } else if (errorMessage.includes("Firefox_login_failed")) {
        errorMessage = "Firefox_login_failed";
      } else if (errorMessage.includes("missing scopes")) {
        errorMessage = "Browser_session_blocked";
      } else if (errorMessage.includes("auth_failed")) {
        errorMessage = "Authentication failed. Please try again.";
      } else if (errorMessage.includes("Session")) {
        errorMessage = "Session error occurred. Please try logging in again.";
      }

      setError(errorMessage);
    }
  }, [searchParams]);

  // Redirect if already authenticated (one-time only)
  useEffect(() => {
    if (isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
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
      await authService.loginWithGoogle();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) return null;

  // Firefox compatibility check
  const isFirefox = typeof window !== 'undefined' && window.navigator.userAgent.includes('Firefox');
  const showFirefoxWarning = isFirefox && !error;

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
              {/* Firefox Compatibility Warning */}
              {showFirefoxWarning && (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    <div className="space-y-2">
                      <p className="font-semibold">Firefox ব্রাউজার দিয়ে লগইন করছেন?</p>
                      <p className="text-sm">
                        Firefox এর সিকিউরিটি সেটিংস লগইন প্রসেস ব্লক করতে পারে। যদি লগইন না হয়, তাহলে:
                      </p>
                      <ol className="text-xs list-decimal list-inside space-y-1">
                        <li>Firefox Settings (about:preferences#privacy) এ যান</li>
                        <li>"Enhanced Tracking Protection" কে "Standard" এ সেট করুন</li>
                        <li>অথবা Chrome ব্রাউজার দিয়ে ট্রাই করুন</li>
                      </ol>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <div className="space-y-3">
                      <div className="font-medium">{error}</div>

                      {(error.includes("Browser session") || error.includes("Session") || error.includes("_session_blocked")) && (
                        <div className="space-y-2">
                          <div className="text-xs">
                            <p className="font-semibold text-red-700">Quick Fix:</p>
                            <button
                              onClick={() => {
                                // Clear local storage and cookies
                                if (typeof window !== 'undefined') {
                                  localStorage.clear();
                                  sessionStorage.clear();

                                  // Clear cookies by setting expired date
                                  document.cookie.split(";").forEach(cookie => {
                                    const eqPos = cookie.indexOf("=");
                                    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                                  });
                                }

                                setError(null);
                                toast.success("Cache cleared. Please try logging in again.");
                              }}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                            >
                              Clear Cache & Retry
                            </button>
                          </div>

                          {/* Firefox-specific guidance */}
                          {error.includes("Firefox_session_blocked") && (
                            <div className="text-xs">
                              <p className="font-semibold text-orange-700">🔥 Firefox কমপ্লিট সলিউশন গাইড:</p>
                              <div className="space-y-3 mt-2">
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500">
                                  <p className="font-bold text-red-800 mb-2">� সমস্যা: Firefox এর Strict Tracking Protection</p>
                                  <p className="text-red-700 text-xs">Firefox আপনার লগইন সেশন ব্লক করে দিচ্ছে। নিচের সলিউশনগুলো ট্রাই করুন:</p>
                                </div>

                                <div>
                                  <p className="font-bold text-green-800 mb-1">✅ সবচেয়ে সহজ সলিউশন:</p>
                                  <ol className="list-decimal list-inside space-y-1 text-red-600">
                                    <li>� <strong>about:preferences#privacy</strong> এ যান</li>
                                    <li>🍪 "Enhanced Tracking Protection" কে <strong>"Standard"</strong> এ সেট করুন</li>
                                    <li>☑ "Cross-site tracking cookies" এনাবল করুন</li>
                                    <li>🔄 Firefox রিস্টার্ট করুন</li>
                                  </ol>
                                </div>

                                <div>
                                  <p className="font-bold text-orange-800 mb-1">⚠️ যদি উপরেরটি কাজ না করে:</p>
                                  <ol className="list-decimal list-inside space-y-1 text-red-600">
                                    <li>🌐 <strong>about:config</strong> এ যান</li>
                                    <li>🔍 <strong>network.cookie.cookieBehavior</strong> সার্চ করুন</li>
                                    <li>👆 Double click করে value <strong>0</strong> এ সেট করুন</li>
                                    <li>� Firefox পুরোপুরি বন্ধ করে আবার খুলুন</li>
                                  </ol>
                                </div>

                                <div>
                                  <p className="font-bold text-blue-800 mb-1">🔧 Advanced সলিউশন:</p>
                                  <ol className="list-decimal list-inside space-y-1 text-red-600">
                                    <li>📁 নতুন Firefox প্রোফাইল তৈরি করুন</li>
                                    <li>🔧 Firefox Developer Edition ট্রাই করুন</li>
                                    <li>🌐 Container Tabs ডিজেবল করুন</li>
                                    <li>🔌 সব Firefox Extensions টেম্পোরারিলি ডিজেবল করুন</li>
                                  </ol>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200">
                                  <p className="font-bold text-blue-800 mb-2">💡 সেরা সমাধান:</p>
                                  <p className="text-blue-700 text-xs mb-2">
                                    Firefox এ যদি বারবার সমস্যা হয়, তাহলে{" "}
                                    <a
                                      href="https://www.google.com/chrome/"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-bold text-blue-600 hover:text-blue-800 underline"
                                    >
                                      Google Chrome ব্রাউজার
                                    </a>{" "}
                                    দিয়ে ট্রাই করুন। Chrome এ এই সমস্যা হয় না।
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    <strong>Chrome ডাউনলোড:</strong>{" "}
                                    <a
                                      href="https://www.google.com/chrome/"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:text-blue-700 underline"
                                    >
                                      https://www.google.com/chrome/
                                    </a>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Safari-specific guidance */}
                          {error.includes("Safari_session_blocked") && (
                            <div className="text-xs">
                              <p className="font-semibold text-orange-700">Safari স্পেশাল সলিউশন:</p>
                              <ol className="list-decimal list-inside mt-1 space-y-1 text-red-600">
                                <li>🔒 Safari Settings এ যান (Preferences → Privacy)</li>
                                <li>☑ "Prevent cross-site tracking" ডিজেবল করুন</li>
                                <li>🍪 "Block all cookies" ডিজেবল করুন</li>
                                <li>🌐 Private browsing mode দিয়ে ট্রাই করুন</li>
                              </ol>
                            </div>
                          )}

                          {/* General browser guidance */}
                          {error.includes("Browser_session_blocked") && !error.includes("Firefox") && !error.includes("Safari") && (
                            <div className="text-xs">
                              <p className="font-semibold text-orange-700">সমাধানসমূহ:</p>
                              <ol className="list-decimal list-inside mt-1 space-y-1 text-red-600">
                                <li>🔒 Incognito/Private browsing mode দিয়ে ট্রাই করুন</li>
                                <li>🍪 Third-party cookies এনাবল করুন</li>
                                <li>🌐 অন্য ব্রাউজার দিয়ে ট্রাই করুন (Chrome recommended)</li>
                                <li>🔄 Browser restart করুন</li>
                              </ol>
                            </div>
                          )}

                          <div className="text-xs">
                            <p className="font-semibold">আরও সাহায্য:</p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-red-600">
                              <li>Internet connection চেক করুন</li>
                              <li>Browser cache clear করুন</li>
                              <li>Browser extensions টেম্পোরারিলি ডিজেবল করুন</li>
                              <li>Chrome ব্রাউজার দিয়ে ট্রাই করুন</li>
                            </ol>
                          </div>
                        </div>
                      )}

                      {!(error.includes("Browser session") || error.includes("Session")) && (
                        <button
                          onClick={() => setError(null)}
                          className="text-red-600 hover:text-red-800 underline text-sm"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
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

                {/* Firefox fallback suggestion */}
                {error && error.includes("Firefox_session_blocked") && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💡</div>
                      <div className="flex-1">
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                          <strong>Firefox এ সমস্যা হচ্ছে?</strong>
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                          যদি Firefox এ কোনো সলিউশন কাজ না করে, তাহলে{" "}
                          <a
                            href="https://www.google.com/chrome/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:text-blue-800 underline"
                          >
                            Google Chrome ব্রাউজার
                          </a>{" "}
                          দিয়ে ট্রাই করুন। Chrome এ এই সমস্যা হয় না এবং লগইন স্বাভাবিকভাবে কাজ করে।
                        </p>
                        <div className="flex gap-2">
                          <a
                            href="https://www.google.com/chrome/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Chrome ডাউনলোড করুন
                          </a>
                          <button
                            onClick={() => {
                              // Clear all Firefox-specific errors and try again
                              setError(null);
                              toast.info("আবার ট্রাই করুন - Firefox সেটিংস চেক করে দেখুন");
                            }}
                            className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            আবার ট্রাই করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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