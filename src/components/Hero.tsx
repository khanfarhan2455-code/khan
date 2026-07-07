import { useState, FormEvent } from "react";
import { ShieldCheck, Sparkles, MapPin, BadgeCheck, Phone, Snowflake, Award, Clock, ArrowRight, ClipboardCheck, Sparkle, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BRAND_CONTACT, SERVICES_LIST, MUMBAI_SUBURBS } from "../data";
// @ts-ignore
import heroImg from "../assets/images/foam_jet_clean_ac_1781803680113.jpg";

export default function Hero() {
  const [activeTab, setActiveTab] = useState<"book" | "showcase">("book");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("Andheri West");
  const [serviceId, setServiceId] = useState("ac");
  const [address, setAddress] = useState("");
  const [successBooking, setSuccessBooking] = useState<any>(null);

  const handleHeroSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return;

    const matchedService = SERVICES_LIST.find((s) => s.id === serviceId);
    const serviceName = matchedService ? matchedService.name : "Appliance Services";
    const servicePrice = matchedService ? matchedService.price : 499;

    const refId = `RC-${Math.floor(100000 + Math.random() * 900000)}-MUM`;

    const newBooking = {
      id: refId,
      name: name.trim(),
      phone: phone.trim(),
      suburb,
      appliance: serviceName,
      totalPrice: servicePrice,
      express: false,
      warranty: false,
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    // Save state
    const existing = localStorage.getItem("rapid_cool_bookings");
    let currentList = [];
    if (existing) {
      try {
        currentList = JSON.parse(existing);
      } catch (err) {}
    }
    const updated = [newBooking, ...currentList];
    localStorage.setItem("rapid_cool_bookings", JSON.stringify(updated));

    // Dispatch Event so ContactForm.tsx updates instantly
    window.dispatchEvent(new Event("booking-added"));

    setSuccessBooking(newBooking);
    setName("");
    setPhone("");
    setAddress("");
  };
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#011e41] via-[#09356b] to-[#042147] text-white py-20 px-6 border-b-4 border-yellow-550">
      {/* Visual background subtle effects */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#0248a3]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Upper Badge Group */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-8 border-b border-white/10">
          {/* Active Area Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 bg-blue-900/40 border border-blue-400/20 px-4 py-2 rounded-xl whitespace-nowrap"
          >
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-bold tracking-wider uppercase font-mono flex items-center gap-1.5 text-blue-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Active in Oshiwara & Andheri West
            </span>
          </motion.div>

          {/* Golden Badge Mirroring "BEST SERVICE / BEST EXPERIENCE" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3 bg-gradient-to-r from-amber-500/10 to-amber-500/20 border border-amber-400/40 px-4 py-2 rounded-xl shadow-lg"
          >
            <div className="bg-amber-500/20 p-1.5 rounded-lg text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">Best Experience</p>
              <p className="text-xs font-black text-white uppercase leading-none">100% Certified Service</p>
            </div>
          </motion.div>
        </div>

        {/* Brand layout grid for modern split banner on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-black tracking-[0.25em] text-cyan-400 uppercase font-mono"
            >
              FASTER SERVICE | BEST QUALITY | TOTAL SATISFACTION
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
              id="main-headline"
            >
              RAPID COOL
              <span className="block text-xl sm:text-2xl mt-1.5 uppercase font-medium tracking-[0.4em] text-blue-300">
                S E R V I C E S
              </span>
            </motion.h1>

            <div>
              <p className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-widest uppercase font-mono py-1.5 px-4 bg-amber-500/5 inline-block border-y border-amber-500/20 rounded">
                COOLING YOUR COMFORT IS OUR PRIORITY
              </p>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed pt-2"
            >
              Expert Doorstep Repair, Maintenance, and Diagnostics in Mumbai. We provide rapid fixes for AC, Refrigerators, Washing Machines, and Microwave ovens with genuine spare parts.
            </motion.p>

            {/* The Bold "SALES • SERVICE • MAINTENANCE" Banner */}
            <div className="my-6">
              <div className="bg-blue-900/50 border border-blue-400/25 text-white py-2.5 px-6 rounded-2xl shadow-xl w-full max-w-lg flex justify-around items-center text-[10px] sm:text-xs font-black tracking-widest uppercase font-mono mx-auto lg:mx-0 gap-x-2">
                <span>Sales</span>
                <span className="text-[#38bdf8]">•</span>
                <span>Service</span>
                <span className="text-[#38bdf8]">•</span>
                <span>Maintenance</span>
              </div>
            </div>

            {/* CTA Button Actions with Quick Helplines */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 mt-6">
              <button
                onClick={() => scrollToSection("services")}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-[#011e41] px-8 py-3.5 rounded-xl font-extrabold transition-all hover:scale-101 shadow-lg shadow-amber-500/10 cursor-pointer uppercase text-xs tracking-wider"
              >
                Explore Services & Rates
              </button>
              <button
                onClick={() => {
                  setActiveTab("book");
                  scrollToSection("main-headline");
                }}
                className="w-full sm:w-auto bg-transparent border-2 border-slate-300 text-slate-100 hover:bg-white/10 px-8 py-3 rounded-xl font-extrabold transition-all cursor-pointer uppercase text-xs tracking-wider"
              >
                Quick Book on Front ⚡
              </button>
            </div>
          </div>

          {/* Right Hero Column - Interactive Booking & Rates Panel */}
          <div className="lg:col-span-6 h-full flex flex-col justify-center">
            <div className="bg-[#021329]/80 backdrop-blur-xl border border-blue-900/50 rounded-3xl p-6 sm:p-7 shadow-2xl w-full max-w-lg mx-auto">
              
              {/* Tabs selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab("book")}
                  className={`py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer ${
                    activeTab === "book"
                      ? "bg-[#0f5fc2] text-white shadow-lg font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="tab-book-front"
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>⚡ Instant Book</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("showcase")}
                  className={`py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer ${
                    activeTab === "showcase"
                      ? "bg-[#0f5fc2] text-white shadow-lg font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                  id="tab-showcase-front"
                >
                  <Sparkle className="w-3.5 h-3.5 text-amber-400" />
                  <span>📸 Showcase</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "book" ? (
                  <motion.div
                    key="book-tab"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {!successBooking ? (
                      <form onSubmit={handleHeroSubmit} className="space-y-4">
                        <div className="text-left border-b border-white/5 pb-2">
                          <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight flex items-center justify-between">
                            <span>Doorstep Visit scheduler</span>
                            <span className="text-[8px] sm:text-[9px] text-[#38bdf8] font-mono tracking-widest bg-blue-900/40 border border-blue-500/20 px-2 py-0.5 rounded font-black">
                              15-MIN RESPONSE
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                            Complete details to reserve a certified technician instantly. <strong>Note:</strong> All rates listed below are doorstep Visiting Charges which are fully adjusted in your final service repair bill!
                          </p>
                        </div>

                        {/* Name and Mobile Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                          <div>
                            <label className="block text-[8px] font-black uppercase text-slate-350 tracking-wider mb-1 font-mono">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Rajesh Sharma"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-[#010c1c] border border-blue-900/60 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-bold"
                              id="hero-book-name"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase text-slate-350 tracking-wider mb-1 font-mono">
                              Mobile (10 Digits)
                            </label>
                            <input
                              type="tel"
                              required
                              pattern="[0-9]{10}"
                              title="Please enter a valid 10-digit mobile number"
                              placeholder="9082213527"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full bg-[#010c1c] border border-blue-900/60 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono font-bold"
                              id="hero-book-phone"
                            />
                          </div>
                        </div>

                        {/* Appliance & Suburb Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                          <div>
                            <label className="block text-[8px] font-black uppercase text-slate-350 tracking-wider mb-1 font-mono">
                              Select Appliance
                            </label>
                            <select
                              value={serviceId}
                              onChange={(e) => setServiceId(e.target.value)}
                              className="w-full bg-[#010c1c] border border-blue-900/60 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                              id="hero-book-service"
                            >
                              {SERVICES_LIST.map((srv) => (
                                <option key={srv.id} value={srv.id} className="bg-slate-950 font-bold text-xs text-white">
                                  {srv.name} (Visiting Charge: ₹{srv.price})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase text-slate-350 tracking-wider mb-1 font-mono">
                              Mumbai Suburb
                            </label>
                            <select
                              value={suburb}
                              onChange={(e) => setSuburb(e.target.value)}
                              className="w-full bg-[#010c1c] border border-blue-900/60 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                              id="hero-book-suburb"
                            >
                              {MUMBAI_SUBURBS.map((sub) => (
                                <option key={sub} value={sub} className="bg-slate-950 font-bold text-xs text-white">
                                  {sub}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Flat/Home Address Textarea */}
                        <div className="text-left">
                          <label className="block text-[8px] font-black uppercase text-slate-350 tracking-wider mb-1 font-mono">
                            Doorstep Home Address
                          </label>
                          <textarea
                            rows={2}
                            required
                            placeholder="e.g. Flat 12, BB-12 BMC Colony, Near Heera Panna Mall, Oshiwara"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-[#010c1c] border border-blue-900/60 rounded-xl py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans resize-none font-bold"
                            id="hero-book-address"
                          />
                        </div>

                        {/* CTA Order Action */}
                        <button
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-600 text-[#011e41] py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg duration-300 flex items-center justify-center space-x-2 active:scale-98 mt-2"
                        >
                          <Wrench className="w-4 h-4 text-[#011e41]" />
                          <span>Book Doorstep Visit Now</span>
                        </button>
                      </form>
                    ) : (
                      /* Submission success visual receipt */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 px-1 space-y-4"
                      >
                        <div className="w-14 h-14 bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
                            Booking Confirmed!
                          </h4>
                          <span className="block text-[9px] text-amber-400 font-mono font-black mt-1">
                            REFERENCE ID: {successBooking.id}
                          </span>
                          <p className="text-[11px] text-slate-350 mt-2.5 leading-relaxed max-w-sm mx-auto">
                            Our technician is dispatched near <strong>{successBooking.suburb}</strong> for your <strong>{successBooking.appliance}</strong>. An engineer will ring you on <strong>+91 {successBooking.phone}</strong> shortly.
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                          <button
                            onClick={() => scrollToSection("contact")}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg tracking-widest uppercase cursor-pointer transition-all"
                          >
                            View Active Dispatch Database
                          </button>
                          <button
                            onClick={() => setSuccessBooking(null)}
                            className="text-[10px] font-bold text-slate-400 hover:text-white transition"
                          >
                            Book Another Service
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  /* Original Showcase Image Tab */
                  <motion.div
                    key="showcase-tab"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-blue-900/40 group cursor-pointer"
                    onClick={() => scrollToSection("services")}
                  >
                    <img
                      src={heroImg}
                      alt="Rapid Cool Premium Foam-Jet Air Conditioning Service Diagnostics"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent flex flex-col justify-end p-5 text-left">
                      <span className="text-[9px] bg-sky-500 text-slate-950 font-mono font-black py-0.5 px-2 rounded-full uppercase tracking-wider w-fit mb-1.5 shadow-md">
                        Active Service Showcase
                      </span>
                      <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-tight">
                        Foam-jet Deep Jet Wash Service
                      </h3>
                      <p className="text-slate-350 text-[10px] sm:text-xs leading-relaxed">
                        We deep clean AC vents & cooling coils to restore instant sub-zero chill. Click to view all appliance repair rates.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Highlight Banner matching bottom of the model graphic */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-white/10 text-center">
          <div className="bg-white/3 p-3.5 rounded-xl border border-white/5 flex flex-col justify-center items-center">
            <ShieldCheck className="w-5 h-5 text-[#38bdf8] mb-1.5" />
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-100">Genuine Parts</span>
            <span className="text-[10px] text-slate-400 mt-0.5">OEM Brand Sourced</span>
          </div>

          <div className="bg-white/3 p-3.5 rounded-xl border border-white/5 flex flex-col justify-center items-center">
            <Award className="w-5 h-5 text-amber-400 mb-1.5" />
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-100">Expert Techs</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Background Verified</span>
          </div>

          <div className="bg-white/3 p-3.5 rounded-xl border border-white/5 flex flex-col justify-center items-center">
            <BadgeCheck className="w-5 h-5 text-emerald-400 mb-1.5" />
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-100">Affordable Prices</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Flat Rates upfront</span>
          </div>

          <div className="bg-white/3 p-3.5 rounded-xl border border-white/5 flex flex-col justify-center items-center">
            <Clock className="w-5 h-5 text-purple-400 mb-1.5" />
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-100">7 Days active</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Emergency support always</span>
          </div>
        </div>

      </div>
    </section>
  );
}

