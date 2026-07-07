import { Snowflake, MapPin, Phone, Instagram, ShieldCheck } from "lucide-react";
import { BRAND_CONTACT } from "../data";

export default function Footer() {
  return (
    <footer className="bg-[#01162e] border-t border-blue-900/60 text-slate-400 py-12">
      <div className="container mx-auto px-6 text-center text-sm space-y-6">
        
        {/* Logo and Brand Name */}
        <div className="flex justify-center items-center space-x-2">
          <Snowflake className="w-6 h-6 text-blue-400 fill-blue-900/30 animate-pulse" />
          <span className="font-extrabold text-white tracking-widest text-lg">
            RAPID COOL <span className="text-blue-400">SERVICES</span>
          </span>
         </div>

        {/* Brand Slogan details */}
        <div className="max-w-xl mx-auto leading-relaxed text-slate-300 text-xs text-center space-y-4">
          <p>
            Providing exceptional diagnostic services, expert compressor replacements, breakdown maintenance, and genuine brand spare parts at upfront competitive rates in Mumbai.
          </p>
          
          {/* Quick Contacts Footer Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-[11px] text-slate-400 max-w-2xl mx-auto font-mono">
            <div className="flex flex-col items-center">
              <MapPin className="w-4 h-4 text-amber-500 mb-1" />
              <span>{BRAND_CONTACT.address}</span>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-4 h-4 text-blue-400 mb-1" />
              <span>+91 {BRAND_CONTACT.phone1} / +91 {BRAND_CONTACT.phone2}</span>
            </div>
            <div className="flex flex-col items-center">
              <Instagram className="w-4 h-4 text-[#38bdf8] mb-1" />
              <span>Insta: {BRAND_CONTACT.instagram}</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright details */}
        <div className="pt-6 border-t border-blue-900/30 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
          <p>© 2026 Rapid Cool Services. All rights reserved. | <a href="#admin" className="hover:text-amber-400 font-mono font-bold transition">Admin Portal 🔐</a></p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Certified Safety Standard Disinfection Program Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

