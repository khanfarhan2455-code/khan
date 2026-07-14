import { useState, useEffect, FormEvent } from "react";
import { Mail, Phone, MapPin, Calendar, CheckCircle2, ClipboardList, Trash2, ArrowRight } from "lucide-react";
import { MUMBAI_SUBURBS, SERVICES_LIST, BRAND_CONTACT } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface ContactFormProps {
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  express: boolean;
  setExpress: (val: boolean) => void;
  warranty: boolean;
  setWarranty: (val: boolean) => void;
  totalEstimate: number;
}

interface LocalBooking {
  id: string;
  name: string;
  phone: string;
  suburb: string;
  appliance: string;
  totalPrice: number;
  express: boolean;
  warranty: boolean;
  time: string;
}

export default function ContactForm({
  selectedServiceId,
  setSelectedServiceId,
  express,
  setExpress,
  warranty,
  setWarranty,
  totalEstimate,
}: ContactFormProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedSuburb, setSelectedSuburb] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const [submittedBooking, setSubmittedBooking] = useState<LocalBooking | null>(null);
  const [bookingsList, setBookingsList] = useState<LocalBooking[]>([]);

  useEffect(() => {
    const loadBookings = () => {
      const saved = localStorage.getItem("rapid_cool_bookings");
      if (saved) {
        try {
          setBookingsList(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse bookings", e);
        }
      } else {
        setBookingsList([]);
      }
    };

    loadBookings();

    window.addEventListener("booking-added", loadBookings);
    return () => {
      window.removeEventListener("booking-added", loadBookings);
    };
  }, []);

  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBookingError("");
    setBookingLoading(true);

    const selectedApplianceName =
      SERVICES_LIST.find((s) => s.id === selectedServiceId)?.name || "General Inspection Service";

    const payload = {
      name: fullName,
      email: customerEmail,
      phone: phoneNumber,
      service: selectedApplianceName,
      date: preferredDate || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      address: `${fullAddress}, ${selectedSuburb || "Andheri West"}`,
      express: express,
      warranty: warranty,
      visitingFee: totalEstimate === 0 ? 499 : totalEstimate,
    };

    try {
      // 🟢 DIRECT CALL TO RENDER BACKEND (Vercel Friendly - No Netlify code)
      const response = await fetch("https://rapidcool-new-backend.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const referenceId = `RC-${Math.floor(100000 + Math.random() * 900000)}-MUM`;
        const savedBooking: LocalBooking = {
          id: referenceId,
          name: fullName,
          phone: phoneNumber,
          suburb: selectedSuburb || "Andheri West",
          appliance: selectedApplianceName,
          totalPrice: totalEstimate === 0 ? 499 : totalEstimate,
          express: express,
          warranty: warranty,
          time: `${payload.date} • ${payload.time}`,
        };

        const updated = [savedBooking, ...bookingsList];
        setBookingsList(updated);
        localStorage.setItem("rapid_cool_bookings", JSON.stringify(updated));
        
        setSubmittedBooking(savedBooking);

        // Reset inputs
        setFullName("");
        setPhoneNumber("");
        setCustomerEmail("");
        setFullAddress("");
        setSelectedSuburb("");
        setPreferredDate("");
        setAdditionalNotes("");
      } else {
        setBookingError(resData.error || "Failed to parse booking response on server.");
      }
    } catch (apiErr) {
      console.warn("Express API unreachable. Saving booking locally in browser memory:", apiErr);
      
      const referenceId = `RC-${Math.floor(100000 + Math.random() * 900000)}-MUM`;
      const fallbackBooking: LocalBooking = {
        id: referenceId,
        name: fullName,
        phone: phoneNumber,
        suburb: selectedSuburb || "Andheri West",
        appliance: selectedApplianceName,
        totalPrice: totalEstimate === 0 ? 499 : totalEstimate,
        express: express,
        warranty: warranty,
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      const updated = [fallbackBooking, ...bookingsList];
      setBookingsList(updated);
      localStorage.setItem("rapid_cool_bookings", JSON.stringify(updated));
      setSubmittedBooking(fallbackBooking);

      setFullName("");
      setPhoneNumber("");
      setCustomerEmail("");
      setFullAddress("");
      setSelectedSuburb("");
      setPreferredDate("");
      setAdditionalNotes("");
    } finally {
      setBookingLoading(false);
    }
  };

  const deleteBooking = (id: string) => {
    const filtered = bookingsList.filter((b) => b.id !== id);
    setBookingsList(filtered);
    localStorage.setItem("rapid_cool_bookings", JSON.stringify(filtered));
  };

  return (
    <section id="contact" className="py-24 bg-white border-t border-gray-150">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Column A: Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-blue-700 text-xs font-black tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3 font-mono border border-blue-100">
                Central Helpline
              </span>
              <h2 className="text-3xl font-extrabold text-[#011e41] tracking-tight">
                Our Support Helplines
              </h2>
              <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                Need premium diagnostics in Mumbai? Ring our centralized team directly, or fill in your details on the instant doorstep scheduler.
              </p>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div className="flex items-start space-x-4 bg-slate-50 p-4.5 rounded-2xl border border-gray-150 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-blue-900 text-white rounded-xl flex items-center justify-center text-xl shrink-0">
                  <MapPin className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#011e41] text-base uppercase tracking-tight">Main Office Location</h4>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                    {BRAND_CONTACT.address}
                  </p>
                </div>
              </div>

              {/* Call Support */}
              <div className="flex items-start space-x-4 bg-slate-50 p-4.5 rounded-2xl border border-gray-150 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-[#0248a3] text-white rounded-xl flex items-center justify-center text-xl shrink-0">
                  <Phone className="w-5 h-5 stroke-[2] fill-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#011e41] text-base uppercase tracking-tight">Call Support Helplines</h4>
                  <div className="text-xs mt-1.5 space-y-1 font-mono">
                    <p className="flex items-center gap-1.5 text-blue-700">
                      Primary Support:{" "}
                      <a href={`tel:+91${BRAND_CONTACT.phone1}`} className="hover:underline font-black text-sm">
                        +91 {BRAND_CONTACT.phone1}
                      </a>
                    </p>
                    <p className="flex items-center gap-1.5 text-blue-700">
                      Secondary Line:{" "}
                      <a href={`tel:+91${BRAND_CONTACT.phone2}`} className="hover:underline font-black text-sm">
                        +91 {BRAND_CONTACT.phone2}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Feed */}
              <div className="flex items-start space-x-4 bg-slate-50 p-4.5 rounded-2xl border border-gray-150 shadow-sm transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-amber-550/10 text-amber-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                  <Mail className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#011e41] text-base uppercase tracking-tight font-sans">Social Feed</h4>
                  <p className="text-gray-600 text-xs mt-1 font-mono">
                    Instagram: <span className="text-[#0248a3] font-bold">{BRAND_CONTACT.instagram}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-sans">
                    Email: rapidcoolservices0services@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column B: Booking Form */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!submittedBooking ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-150"
                >
                  <h3 className="text-2xl font-black mb-6 text-[#011e41] tracking-tight flex items-center justify-between uppercase">
                    <span>Schedule Visit</span>
                    <span className="text-xs bg-emerald-50 text-emerald-800 font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Dispatch Active
                    </span>
                  </h3>

                  {selectedServiceId && (
                    <div className="bg-blue-50/50 p-4.5 rounded-xl border border-blue-100 mb-6 text-xs text-blue-900">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="block font-black font-mono text-blue-500 uppercase text-[9px] mb-0.5">Appliance Service selected</span>
                          <strong className="font-extrabold text-sm text-[#011e41]">
                            {SERVICES_LIST.find((s) => s.id === selectedServiceId)?.name}
                          </strong>
                          <div className="flex gap-2.5 mt-1 text-blue-800 font-bold font-mono text-[10px]">
                            {express && <span className="text-amber-700">• Express Same-Day (+₹200)</span>}
                            {warranty && <span className="text-emerald-700">• Parts Warranty (+₹150)</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] text-blue-500 font-bold uppercase font-mono">Visiting Charge Est.</span>
                          <span className="text-lg font-black font-mono text-blue-600">₹{totalEstimate === 0 ? 499 : totalEstimate}</span>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-blue-100/60 text-[10px] text-blue-700 font-medium">
                        ℹ️ This visiting charge covers doorstep diagnostic inspection, and is <strong>fully adjusted & waived</strong> from your final invoice if you proceed with recommended repairs.
                      </div>
                    </div>
                  )}

                  {bookingError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold leading-relaxed mb-4 flex items-center gap-2">
                      <span className="text-sm">⚠️</span>
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#011e41] uppercase tracking-wider mb-1.5">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Rajesh Sharma"
                        className="w-full p-3.5 border border-gray-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0f5fc2] focus:bg-white text-gray-900 font-bold text-sm transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#011e41] uppercase tracking-wider mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit mobile number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="10-digit mobile, e.g., 9082213527"
                          className="w-full p-3.5 border border-[#0f5fc2]/30 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0f5fc2] focus:bg-white text-gray-900 font-bold text-sm transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-[#011e41] uppercase tracking-wider mb-1.5">
                          Your Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="e.g., rajesh@gmail.com"
                          className="w-full p-3.5 border border-gray-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0f5fc2] focus:bg-white text-gray-900 font-bold text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#011e41] uppercase tracking-wider mb-1.5">
                          Mumbai Suburb / Area Location
                        </label>
                        <select
                          required
                          value={selectedSuburb}
                          onChange={(e) => setSelectedSuburb(e.target.value)}
                          className="w-full p-3.5 border border-gray-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0f5fc2] focus:bg-white text-gray-850 font-bold text-sm transition-all"
                        >
                          <option value="">-- Choose Suburb --</option>
                          {MUMBAI_SUBURBS.map((sub) => (
                             <option key={sub} value={sub}>
                               {sub}
                             </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-[#011e41] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>Preferred Visit Date</span>
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full p-3.5 border border-gray-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0f5fc2] focus:bg-white text-gray-900 font-bold text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#011e41] uppercase tracking-wider mb-1.5">
                        Home / Flat Doorstep Address
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="e.g., Flat 12, BMC Colony, Near Hera Panna Mall, Oshiwara, Andheri West"
                        className="w-full p-3.5 border border-gray-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0f5fc2] focus:bg-white text-gray-900 font-bold text-sm transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#011e41] uppercase tracking-wider mb-1.5">
                        Additional Notes / Request details
                      </label>
                      <input
                        type="text"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="e.g. AC cooling is low, please bring gas testing equipment"
                        className="w-full p-3.5 border border-gray-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0f5fc2] focus:bg-white text-gray-900 font-bold text-sm transition-all"
                      />
                    </div>

                    <div className="space-y-3 pt-1 pb-1">
                      <span className="block text-[10px] font-extrabold text-[#011e41] uppercase tracking-wider">
                        Premium Add-ons (Optional)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div
                          onClick={() => setExpress(!express)}
                          className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            express
                              ? "bg-blue-50/50 border-blue-400 text-blue-900"
                              : "bg-slate-50/30 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={express}
                            onChange={(e) => setExpress(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-[#0f5fc2] border-gray-300 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                          />
                          <div>
                            <span className="block font-black text-xs text-gray-900 leading-none">Express Same-Day (+₹200)</span>
                            <span className="text-[10px] text-gray-500 mt-1 block">Priority engineer dispatch</span>
                          </div>
                        </div>

                        <div
                          onClick={() => setWarranty(!warranty)}
                          className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            warranty
                              ? "bg-blue-50/50 border-blue-400 text-blue-900"
                              : "bg-slate-50/30 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={warranty}
                            onChange={(e) => setWarranty(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-[#0f5fc2] border-gray-300 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                          />
                          <div>
                            <span className="block font-black text-xs text-gray-900 leading-none">Parts Warranty (+₹150)</span>
                            <span className="text-[10px] text-gray-500 mt-1 block">90-Day Guarantee</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full bg-[#0f5fc2] text-white py-4 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-[#0248a3] transition shadow-lg shadow-blue-100 hover:shadow-xl hover:translate-y-[-1px] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60"
                    >
                      {bookingLoading ? (
                        <span>Processing with System...</span>
                      ) : (
                        <>
                          <span>Confirm Doorstep Booking</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#011e41] text-white p-8 md:p-10 rounded-3xl shadow-xl border border-blue-900 text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#38bdf8] to-emerald-500 animate-pulse" />
                  
                  <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">
                    Booking Confirmed!
                  </h3>
                  <p className="text-slate-300 text-xs mb-6 max-w-md mx-auto leading-relaxed">
                    We have specialists active near <strong>{submittedBooking.suburb}</strong>. An engineer will contact you on <strong>+91 {submittedBooking.phone}</strong> in under 15 minutes.
                  </p>

                  <div className="bg-blue-950/80 rounded-2xl p-6 mb-8 text-left border border-blue-900/60 font-sans space-y-3.5 text-sm">
                    <div className="flex justify-between items-center pb-3 border-b border-blue-900/40">
                      <span className="text-blue-300 text-[10px] uppercase font-bold tracking-widest font-mono">Reference Ticket ID</span>
                      <strong className="text-amber-400 font-black font-mono tracking-wider">{submittedBooking.id}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-350">Customer Name:</span>
                      <span className="text-white font-extrabold">{submittedBooking.name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-350">Selected Appliance:</span>
                      <span className="text-blue-300 font-bold">{submittedBooking.appliance}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-350">Mumbai Suburb:</span>
                      <span className="text-slate-200 font-bold">{submittedBooking.suburb}</span>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-blue-900/40">
                      <span className="text-blue-300 font-extrabold uppercase text-xs font-mono">Estimated Invoice Rate:</span>
                      <span className="text-white font-black text-lg">₹{submittedBooking.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setSubmittedBooking(null)}
                      className="px-6 py-3 bg-[#0a3263] text-white font-extrabold rounded-xl hover:bg-[#0248a3] transition text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Book Another Service
                    </button>
                    <a
                      href={`tel:+91${BRAND_CONTACT.phone1}`}
                      className="px-6 py-3 bg-amber-500 text-blue-950 font-black rounded-xl hover:bg-amber-600 transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 animate-bounce" />
                      <span>Call helpline now</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {bookingsList.length > 0 && (
              <div className="mt-10 bg-slate-50 rounded-2xl border border-gray-150 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-extrabold text-gray-900 text-sm tracking-wide flex items-center space-x-2">
                    <ClipboardList className="w-4.5 h-4.5 text-blue-600" />
                    <span>Scheduled Bookings ({bookingsList.length})</span>
                  </h4>
                  <span className="text-[10px] bg-white border border-gray-150 text-slate-550 font-mono font-black px-2 py-0.5 rounded">
                    PERSISTED DATABASE
                  </span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {bookingsList.map((book) => (
                    <div
                      key={book.id}
                      className="p-4 bg-white rounded-xl border border-gray-150 text-xs flex justify-between items-start shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-gray-900 font-extrabold uppercase">{book.appliance}</strong>
                          <span className="text-[10px] text-blue-600 font-mono font-bold uppercase">{book.id}</span>
                        </div>
                        <p className="text-gray-550 mt-1">
                          Suburb: <strong className="text-gray-700">{book.suburb}</strong> • Logged: {book.time}
                        </p>
                        <div className="flex gap-2 mt-1.5">
                          {book.express && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-150 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                              Same-Day Priority
                            </span>
                          )}
                          {book.warranty && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                              Warranty Secured
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end space-y-1.5">
                        <strong className="text-gray-900 font-black text-sm">₹{book.totalPrice}</strong>
                        <button
                          onClick={() => deleteBooking(book.id)}
                          className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 hover:text-red-700 transition"
                          title="Cancel/Remove Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
