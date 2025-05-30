import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRightIcon,
  BeakerIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  CommandLineIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  DocumentCheckIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Navbar from "~/components/Navbar";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const gradientAnimation = {
  initial: { backgroundPosition: "0% 50%" },
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const cardHoverAnimation = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const features = [
  {
    title: "Drag & Drop Builder",
    description: "Create forms effortlessly with our intuitive drag-and-drop interface. No coding required.",
    icon: CursorArrowRaysIcon,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Real-time Preview",
    description: "See your changes instantly as you build with our live preview functionality.",
    icon: BeakerIcon,
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Customizable Themes",
    description: "Style your forms to match your brand with our powerful theming options.",
    icon: PaintBrushIcon,
    color: "from-pink-500 to-pink-600",
  },
  {
    title: "Responsive Design",
    description: "Forms that look and work perfectly on any device, from mobile to desktop.",
    icon: DevicePhoneMobileIcon,
    color: "from-green-500 to-green-600",
  },
  {
    title: "Advanced Validation",
    description: "Ensure data accuracy with our comprehensive form validation system.",
    icon: CheckCircleIcon,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    title: "Analytics Dashboard",
    description: "Track form submissions and user interactions with detailed analytics.",
    icon: ChartBarIcon,
    color: "from-red-500 to-red-600",
  },
];

const benefits = [
  {
    title: "Save Time",
    description: "Build forms in minutes instead of hours with our intuitive interface.",
    icon: BoltIcon,
  },
  {
    title: "Increase Conversions",
    description: "Optimize your forms for better user engagement and higher conversion rates.",
    icon: RocketLaunchIcon,
  },
  {
    title: "Secure Data",
    description: "Keep your form data safe with enterprise-grade security features.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Scale Easily",
    description: "Handle any number of form submissions with our scalable infrastructure.",
    icon: CloudArrowUpIcon,
  },
];

const testimonials = [
  {
    quote: "FormBuilder has revolutionized how we collect data. It's incredibly intuitive and powerful.",
    author: "Sarah Johnson",
    role: "Product Manager",
    company: "TechCorp",
  },
  {
    quote: "The customization options are endless. We've created forms that perfectly match our brand.",
    author: "Michael Chen",
    role: "Marketing Director",
    company: "GrowthLabs",
  },
  {
    quote: "Customer support is outstanding. They helped us implement complex form logic in no time.",
    author: "Emily Rodriguez",
    role: "Operations Lead",
    company: "InnovateCo",
  },
];

export default function Index() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden transition-colors duration-200">
      {/* Background Elements */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        style={{ opacity }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Build Beautiful Forms
              <br />
              in Minutes
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Create stunning, responsive forms with our drag-and-drop builder. 
              Choose from templates or start from scratch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/builder"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                Start Building
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/templates"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Browse Templates
                <Square3Stack3DIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800 relative transition-colors duration-200">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to create, manage, and optimize your forms
            </p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardHoverAnimation}
                initial="initial"
                whileHover="hover"
                className="p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-r ${feature.color} text-white shadow-lg transform rotate-3 hover:rotate-6 transition-transform`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose FormBuilder?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the difference with our comprehensive form building solution
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loved by Developers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what our users have to say about FormBuilder
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl relative"
              >
                <SparklesIcon className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{testimonial.author}</p>
                  <p className="text-gray-500 dark:text-gray-400">{testimonial.role}, {testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of developers and businesses who trust FormBuilder for their form needs
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/signup"
                className="bg-white text-blue-600 dark:bg-gray-900 dark:text-blue-400 px-8 py-4 rounded-full text-lg font-semibold inline-block hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto w-fit"
              >
                <RocketLaunchIcon className="w-5 h-5" />
                Start Building Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 px-6 relative transition-colors duration-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 md:mb-0"
              whileHover={{ scale: 1.05 }}
            >
              FormBuilder
            </motion.div>
            <motion.div 
              className="flex space-x-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                { name: "Twitter", icon: GlobeAltIcon },
                { name: "GitHub", icon: CommandLineIcon },
                { name: "LinkedIn", icon: UserGroupIcon },
                { name: "Discord", icon: SparklesIcon },
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href="#"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.1, color: "#4F46E5" }}
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group flex items-center gap-2"
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  <motion.div 
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              ))}
            </motion.div>
          </div>
          <motion.div 
            className="text-center text-gray-500 dark:text-gray-400 mt-8"
            variants={fadeInUp}
          >
            © {new Date().getFullYear()} FormBuilder. All rights reserved.
          </motion.div>
      </div>
      </motion.footer>
    </div>
  );
}

