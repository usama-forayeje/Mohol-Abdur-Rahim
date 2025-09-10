"use client";
import React, { useState, useEffect } from "react";
import { Scissors, Sparkles, Award, Users, Star } from "lucide-react";

const SkeletonLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const loadingTexts = [
    "جاري تحضير تجربة استثنائية...",
    "نحضر لك أفضل الخدمات...",
    "تصميمات رائعة في انتظارك...",
    "مرحباً بك في عالم الأناقة...",
  ];

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setShowContent(true), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    // Text changing animation
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  if (showContent) {
    return <MainContent />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-1/3 w-20 h-20 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-pink-200 dark:bg-pink-800 rounded-full opacity-20 animate-float"></div>
      </div>

      {/* Main Loading Content */}
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo Animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4 animate-pulse-scale">
                <Scissors className="w-12 h-12 text-white animate-spin-slow" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-green-400 to-teal-500 rounded-full animate-pulse"></div>
            </div>

            {/* Brand Name */}
            <h1
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-2"
              style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
            >
              Mohol Abdul Raheem
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-8"></div>
          </div>

          {/* Loading Text Animation */}
          <div className="mb-12">
            <p
              key={currentText}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium animate-fade-in-up"
              style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
            >
              {loadingTexts[currentText]}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Preview Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Award, text: "خبرة 15+ عام", delay: "0s" },
              { icon: Users, text: "5000+ عميل", delay: "0.5s" },
              { icon: Star, text: "تقييم 5 نجوم", delay: "1s" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-slide-up"
                style={{ animationDelay: item.delay }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce-gentle">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p
                  className="text-gray-700 dark:text-gray-300 font-medium"
                  style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Animation */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-24"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96 C150,120 350,120 600,96 C850,72 1050,72 1200,96 L1200,120 L0,120 Z"
            className="fill-blue-100 dark:fill-gray-800 animate-wave"
          ></path>
          <path
            d="M0,96 C150,100 350,100 600,96 C850,92 1050,92 1200,96 L1200,120 L0,120 Z"
            className="fill-purple-100 dark:fill-gray-700 animate-wave-delayed"
          ></path>
        </svg>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap");

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(10px) rotate(-5deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(15px) rotate(-3deg);
          }
          66% {
            transform: translateY(-10px) rotate(3deg);
          }
        }

        @keyframes pulse-scale {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(-25px);
          }
        }

        @keyframes wave-delayed {
          0%,
          100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(25px);
          }
        }

        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }

        .animate-wave-delayed {
          animation: wave-delayed 3s ease-in-out infinite reverse;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Skeleton components for main content
const SkeletonNavbar = () => (
  <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center h-18">
        {/* Logo Skeleton */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse"></div>
          <div className="w-48 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"></div>
        </div>

        {/* Desktop Nav Skeleton */}
        <div className="hidden lg:flex items-center space-x-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>

        {/* Auth Section Skeleton */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-24 h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"></div>
        </div>

        {/* Mobile Menu Skeleton */}
        <div className="lg:hidden w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </nav>
);

const SkeletonHero = () => (
  <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
    {/* Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-10 animate-float"></div>
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full opacity-10 animate-float-delayed"></div>
    </div>

    <div className="text-center max-w-4xl mx-auto px-6 z-10">
      {/* Main Title Skeleton */}
      <div className="mb-8">
        <div className="w-full max-w-3xl h-16 md:h-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl mx-auto mb-4 animate-pulse"></div>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700 mx-auto rounded-full animate-pulse"></div>
      </div>

      {/* Description Skeleton */}
      <div className="mb-12 space-y-3">
        <div className="w-full max-w-2xl h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"></div>
        <div
          className="w-full max-w-xl h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"
          style={{ animationDelay: "0.1s" }}
        ></div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
        <div className="w-40 h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse"></div>
        <div
          className="w-40 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full mx-auto mb-4"></div>
            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2"></div>
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SkeletonServices = () => (
  <section className="py-24 bg-white dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-6">
      {/* Header Skeleton */}
      <div className="text-center mb-20">
        <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 animate-pulse"></div>
        <div className="w-80 h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mx-auto mb-6 animate-pulse"></div>
        <div
          className="w-96 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"
          style={{ animationDelay: "0.1s" }}
        ></div>
      </div>

      {/* Services Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-6"></div>
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="space-y-2 mb-6">
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-200 dark:bg-green-700 rounded-full"></div>
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Main Content Component (combines all skeletons)
const MainContent = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate main content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <SkeletonNavbar />
        <SkeletonHero />
        <SkeletonServices />

        {/* Final Loading Message */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            <span
              className="text-gray-700 dark:text-gray-300 font-medium"
              style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
            >
              تحميل المحتوى النهائي...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 mx-auto mb-8 animate-bounce">
          <Scissors className="w-12 h-12 text-white" />
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-6"
          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
        >
          مرحباً بك في محل عبد الرحيم
        </h1>
        <p
          className="text-xl text-gray-600 dark:text-gray-300 mb-8"
          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
        >
          تم تحميل الموقع بنجاح! جاهزون لخدمتك.
        </p>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300 hover:shadow-lg">
          استكشف خدماتنا
        </button>
      </div>
    </div>
  );
};

export default SkeletonLoader;
