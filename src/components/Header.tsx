import { useState, useEffect } from "react";
import { Snowflake, Phone, Menu, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BRAND_CONTACT } from "../data";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0b2b5c]/95 backdrop-blur-md text-white shadow-lg py-2.5 border-b border-blue-900/30"
          : "bg-white text-gray-950 py-4 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center space-x-2.5 cursor-pointer group"
          id="header-logo"
        >
          <motion.div
            animate={{ rotate: isScrolled ? 180 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={isScrolled ? "text-blue-400" : "text-blue-600"}
          >
            <Snowflake className="w-8 h-8 fill-current" />
          </motion.div>
          <div className="flex flex-col">
            <span className={`text-xl md:text-2xl font-black tracking-tight leading-none ${isScrolled ? "text-white" : "text-gray-900"}`}>
              RAPID COOL
            </span>
            <span className={`text-[9px] font-bold tracking-[0.25em] ${isScrolled ? "text-blue-400" : "text-blue-600"}`}>
              S E R V I C E S
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-extrabold text-sm uppercase tracking-wider">
          <button
            onClick={() => scrollToSection("services")}
            className={`transition-colors py-2 cursor-pointer ${isScrolled ? "text-slate-200 hover:text-blue-450" : "text-gray-700 hover:text-blue-600"}`}
            id="nav-services"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection("reviews")}
            className={`transition-colors py-2 cursor-pointer ${isScrolled ? "text-slate-200 hover:text-blue-450" : "text-gray-700 hover:text-blue-600"}`}
            id="nav-reviews"
          >
            Reviews
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className={`transition-colors py-2 cursor-pointer ${isScrolled ? "text-slate-200 hover:text-blue-450" : "text-gray-700 hover:text-blue-600"}`}
            id="nav-contact"
          >
            Book Standard Call
          </button>
        </nav>

        {/* Call to action */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center text-xs font-semibold space-x-1.5 border-r border-dotted border-gray-400 pr-4">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={isScrolled ? "text-blue-200" : "text-gray-500"}>Live Response (7 AM - 10 PM)</span>
          </div>
          <a
            href={`tel:+91${BRAND_CONTACT.phone1}`}
            className="bg-[#0f5fc2] hover:bg-[#0248a3] text-white px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all duration-200 flex items-center space-x-2 shadow-md shadow-blue-900/20 active:translate-y-0.5"
            id="desktop-cta-phone"
          >
            <Phone className="w-4 h-4 fill-white animate-pulse" />
            <span>+91 {BRAND_CONTACT.phone1}</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center space-x-3 md:hidden">
          <a
            href={`tel:+91${BRAND_CONTACT.phone1}`}
            className={`p-2.5 rounded-xl transition-colors ${isScrolled ? "bg-blue-900/40 text-blue-300" : "bg-blue-50 text-blue-600"}`}
            id="mobile-phone-shortcut"
          >
            <Phone className="w-5 h-5 fill-current" />
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 transition-colors focus:outline-none ${isScrolled ? "text-white" : "text-gray-700"}`}
            id="mobile-menu-toggle"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t md:hidden overflow-hidden ${isScrolled ? "bg-[#0b2b5c] border-blue-900" : "bg-white border-gray-100"}`}
          >
            <div className="px-6 py-5 flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("services")}
                className={`text-left py-2 font-bold uppercase text-xs tracking-wider border-b ${isScrolled ? "text-slate-200 border-blue-900/40" : "text-gray-700 border-gray-50"}`}
              >
                Our Core Services
              </button>
              <button
                onClick={() => scrollToSection("reviews")}
                className={`text-left py-2 font-bold uppercase text-xs tracking-wider border-b ${isScrolled ? "text-slate-200 border-blue-900/40" : "text-gray-700 border-gray-50"}`}
              >
                Customer Reviews
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`text-left py-2 font-bold uppercase text-xs tracking-wider border-b ${isScrolled ? "text-slate-200 border-blue-900/40" : "text-gray-700 border-gray-50"}`}
              >
                Book Inspection / Contact
              </button>
              <div className="pt-2 flex flex-col space-y-3">
                <span className={`text-[10px] text-center font-bold tracking-wide ${isScrolled ? "text-blue-300" : "text-gray-500"}`}>
                  ⚡ MUMBAI SAME-DAY DISPATCH ACTIVE
                </span>
                <a
                  href={`tel:+91${BRAND_CONTACT.phone1}`}
                  className="w-full bg-[#0f5fc2] text-white text-center py-3 rounded-xl font-extrabold hover:bg-[#0248a3] transition text-sm flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>Call: +91 {BRAND_CONTACT.phone1}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

