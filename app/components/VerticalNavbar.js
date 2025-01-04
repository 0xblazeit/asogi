"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { House, Binary, Placeholder } from "@phosphor-icons/react";

const NAV_ITEMS = [
  {
    icon: House,
    href: "/",
    label: "Home",
  },
  {
    icon: Binary,
    href: "/about",
    label: "Binary",
  },
  {
    icon: Placeholder,
    href: "/redacted",
    label: "Redacted",
  },
];

export function VerticalNavbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delayed visibility
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Cleanup timer
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.25,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 w-12 sm:w-16 flex flex-col items-center justify-center py-4 space-y-2 sm:space-y-3"
        >
          {NAV_ITEMS.map(({ icon: Icon, href, label }) => (
            <motion.div key={href} variants={itemVariants} className="w-full flex justify-center">
              <Link
                href={href}
                className={`
                  p-1.5 sm:p-2 rounded-lg transition-all duration-300 ease-in-out
                  flex items-center justify-center
                  ${pathname === href ? "bg-blue-500/20 ring-1 ring-blue-500/50" : "hover:bg-green-200/50"}
                `}
                aria-label={label}
              >
                <Icon
                  weight={pathname === href ? "fill" : "thin"}
                  className={`
                    w-4 h-4 sm:w-6 sm:h-6
                    ${pathname === href ? "text-blue-600" : "text-gray-200"}
                  `}
                />
              </Link>
            </motion.div>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
