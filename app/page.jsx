"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  Award,
  Users,
  Star,
  Clock,
  Ruler,
  Phone,
  Mail,
  MapPin,
  Palette,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { BackgroundBeams } from "@/components/ui/background-beams";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

// --- Helper: Arabic Role ---
const getRoleArabic = (role) => {
  const roleMap = {
    superAdmin: "مشرف عام",
    admin: "مدير",
    manager: "مدير",
    tailor: "خياط",
    user: "عميل",
    salesman: "بائع",
    embroideryMan: "مطرز",
    stoneMan: "فني أحجار",
  };
  return roleMap[role] || "مستخدم";
};

// --- Logo ---
const Logo = () => {
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState("/logo.png");

  useEffect(() => {
    setLogoSrc("/logo.png");
  }, [theme]);

  return (
    <motion.div
      className="flex flex-col items-start space-y-1 rtl:items-end"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Link
        href="/"
        className="flex items-center space-x-2 rtl:space-x-reverse"
      >
        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
          <Image
            src={logoSrc || "/placeholder.svg"}
            alt="Abdul Raheem Tailoring"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full shadow-lg"
          />
        </motion.div>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
          Mohol Abdur Rahim
        </span>
      </Link>
      <span className="text-sm text-gray-500 dark:text-gray-400 pl-14 rtl:pr-14 -mt-1">
        Premium Tailoring
      </span>
    </motion.div>
  );
};

const MobileSidebar = ({
  isOpen,
  toggleMenu,
  navigationItems,
  userProfile,
  isAuthenticated,
  logout,
}) => {
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    closed: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: 50, opacity: 0 },
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
          />

          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between rounded-l-3xl border-l border-gray-200 dark:border-slate-700"
            dir="rtl"
          >
            <div className="flex justify-between items-center mb-8 border-b pb-6 border-gray-200 dark:border-slate-700">
              <Logo />
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMenu}
                  className="w-10 h-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <X className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="flex-1 overflow-y-auto"
              variants={sidebarVariants}
            >
              <div className="flex flex-col space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div key={item.name} variants={itemVariants}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-4 rtl:space-x-reverse px-6 py-4 rounded-xl text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                      onClick={toggleMenu}
                    >
                      {item.icon && (
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <item.icon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </motion.div>
                      )}
                      <span>{item.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-auto" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700"
              variants={itemVariants}
            >
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="text-right bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {userProfile?.name || "User"}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-sm mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    >
                      {getRoleArabic(userProfile?.role)}
                    </Badge>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => {
                        logout();
                        toggleMenu();
                      }}
                      variant="outline"
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-500 hover:border-red-600 shadow-lg"
                    >
                      Logout
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/sign-in" onClick={toggleMenu}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border border-blue-200 dark:border-blue-800"
                      >
                        Login
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/sign-in" onClick={toggleMenu}>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const PremiumHeroSection = ({ isAuthenticated }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      <motion.div
        className="max-w-4xl mx-auto p-4 z-10 text-center"
        style={{ y: y1, opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={floatingVariants} animate="animate">
          <motion.h1
            className="text-4xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 via-neutral-300 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-400 font-bold leading-tight"
            variants={itemVariants}
          >
            خياطة عصرية،
            <br />
            <motion.span
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              لمستقبل الأناقة.
            </motion.span>
          </motion.h1>
        </motion.div>

        <motion.p
          className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto my-6 text-lg md:text-xl leading-relaxed"
          variants={itemVariants}
        >
          نجمع بين الحرفية التقليدية والتقنيات الحديثة لإنشاء قطع فريدة تناسبك.
          تصميماتنا تعبر عن شخصيتك وتفردك في عالم الموضة.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={isAuthenticated ? "/dashboard" : "/sign-up"}>
              <button
                className="relative px-8 py-4 text-lg font-semibold rounded-full text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 min-w-[160px] h-14 border-0 cursor-pointer"
                style={{
                  backgroundColor: "#2563eb",
                  backgroundImage:
                    "linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #ec4899 100%)",
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isAuthenticated ? "لوحة التحكم" : "ابدأ الآن"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-gray-100 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm bg-white/10 dark:bg-black/10 min-w-[160px] h-14"
            >
              <Palette className="w-5 h-5 ml-2" />
              تصفح خدماتنا
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex justify-center items-center gap-8 mt-12 text-sm text-gray-500 dark:text-gray-400"
          variants={itemVariants}
        >
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.1 }}
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>جودة مضمونة</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.1 }}
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>تسليم سريع</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.1 }}
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>خدمة 24/7</span>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div style={{ y: y2 }}>
        <BackgroundBeams />
      </motion.div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/10 to-blue-400/10 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
};

// --- Services & Features Data ---
const services = [
  {
    title: "خياطة مخصصة",
    description:
      "تصميم وخياطة ملابس حسب المقاس والذوق الشخصي مع أحدث التقنيات.",
    icon: <Ruler className="h-8 w-8" />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "جودة ممتازة",
    description:
      "استخدام أفضل الأقمشة والتقنيات لضمان أعلى جودة وأناقة لا مثيل لها.",
    icon: <Sparkles className="h-8 w-8" />,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "تسليم سريع",
    description: "نلتزم بتسليم الطلبات في الموعد المحدد وبأسرع وقت ممكن.",
    icon: <Clock className="h-8 w-8" />,
    gradient: "from-green-500 to-emerald-500",
  },
];

const features = [
  {
    title: "15+ سنوات خبرة",
    description:
      "أكثر من عقد من الخبرة في عالم الخياطة الراقية والتصميم المتميز.",
    icon: <Award className="h-8 w-8" />,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "5000+ عميل راضٍ",
    description: "ثقة الآلاف من العملاء السعداء بخدماتنا المتميزة عبر السنوات.",
    icon: <Users className="h-8 w-8" />,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "تقييم 5 نجوم",
    description:
      "تقييمات عالية من عملائنا على جميع المنصات الرقمية والمراجعات.",
    icon: <Star className="h-8 w-8" />,
    gradient: "from-pink-500 to-rose-500",
  },
];

export default function TailoringLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, userProfile, canAccessDashboard, logout } =
    useAuthStore();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigationItems = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Features", href: "#features" },
    { name: "Contact Us", href: "#contact" },
  ];
  if (isAuthenticated && canAccessDashboard()) {
    navigationItems.splice(1, 0, {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    });
  }

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white font-sans min-h-screen">
      <motion.nav
        className="fixed top-0 w-full z-40 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <Logo />

            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 flex items-center gap-2"
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="hidden lg:flex items-center space-x-3 rtl:space-x-reverse">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.name || "User"}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={logout}
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent"
                    >
                      Logout
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/sign-in">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        Login
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/sign-up">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMenu}
                  className="lg:hidden w-10 h-10 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      <MobileSidebar
        isOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        navigationItems={navigationItems}
        userProfile={userProfile}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />

      {/* Hero */}
      <section id="home">
        <PremiumHeroSection isAuthenticated={isAuthenticated} />
      </section>

      <section
        id="services"
        className="py-24 bg-gradient-to-b from-gray-50/50 to-white dark:from-neutral-950/50 dark:to-black"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4">
              خدماتنا المتميزة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              نقدم مجموعة شاملة من الخدمات المتخصصة في عالم الخياطة والتفصيل
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="group relative bg-white dark:bg-neutral-900 shadow-xl hover:shadow-2xl rounded-3xl p-8 text-center border border-gray-100 dark:border-neutral-800 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}
                />

                <motion.div
                  className={`mb-6 flex justify-center text-transparent bg-clip-text bg-gradient-to-r ${service.gradient}`}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {service.icon}
                </motion.div>

                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {service.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  {service.description}
                </p>

                <div
                  className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:${service.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-black dark:to-neutral-950/50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-4">
              لماذا نحن الأفضل؟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              إنجازاتنا وخبرتنا تتحدث عن جودة خدماتنا المتميزة
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -15,
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="group relative bg-white dark:bg-neutral-900 shadow-xl hover:shadow-2xl rounded-3xl p-8 text-center border border-gray-100 dark:border-neutral-800 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}
                />

                <motion.div
                  className={`mb-6 flex justify-center text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient}`}
                  whileHover={{
                    scale: 1.3,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  {feature.description}
                </p>

                <motion.div
                  className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20`}
                  style={{ padding: "2px" }}
                  whileHover={{ opacity: 0.3 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="py-24 bg-gradient-to-b from-gray-50/50 to-white dark:from-neutral-950/50 dark:to-black"
      >
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-6">
              تواصل معنا
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              للاستفسار أو الطلبات الخاصة، يمكنكم التواصل معنا عبر الوسائل
              التالية
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  icon: Phone,
                  text: "+966 123 456 789",
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  icon: Mail,
                  text: "info@tailoring.com",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: MapPin,
                  text: "الرياض، المملكة العربية السعودية",
                  gradient: "from-purple-500 to-pink-500",
                },
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-neutral-800"
                >
                  <motion.div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${contact.gradient} flex items-center justify-center text-white`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <contact.icon className="w-8 h-8" />
                  </motion.div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {contact.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <Logo />
            </div>
            <p className="text-gray-300 text-lg mb-6">
              © {new Date().getFullYear()} Mohol Abdul Raheem Tailoring. جميع
              الحقوق محفوظة.
            </p>
            <div className="flex justify-center space-x-6 rtl:space-x-reverse">
              {["الخصوصية", "الشروط", "الدعم"].map((item, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
