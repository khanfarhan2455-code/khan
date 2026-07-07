import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { BRAND_CONTACT } from "../data";

export default function WhatsAppFAB() {
  // Use the primary contact phone number
  const phoneNumber = BRAND_CONTACT.phone1;
  const message = "Hi Rapid Cool Services, I would like to inquire about your appliance repair services.";
  
  // Format the url for WhatsApp
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Small tooltip notification that appears helper note */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="mb-2 bg-gradient-to-r from-[#011e41] to-[#0f5fc2] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl border border-blue-400/30 whitespace-nowrap hidden sm:block pointer-events-auto"
      >
        💬 Instant Help? 
      </motion.div>

      {/* Floating Action Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5 
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-[#0f5fc2] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#0248a3] transition-colors border-2 border-white/20 active:scale-95 pointer-events-auto group relative cursor-pointer"
        aria-label="Contact standard service on WhatsApp"
        id="whatsapp-fab"
      >
        {/* Subtle glowing ring background animation */}
        <span className="absolute -inset-1 rounded-full bg-[#0f5fc2] opacity-30 blur-md group-hover:opacity-50 transition-opacity animate-pulse" />
        
        {/* Highlight details */}
        <MessageCircle className="w-6 h-6 relative z-10 transition-transform group-hover:scale-105" />
      </motion.a>
    </div>
  );
}
