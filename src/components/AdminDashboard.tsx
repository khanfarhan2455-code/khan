import { useState, useEffect, FormEvent } from "react";
import { 
  Lock, Search, Filter, RefreshCw, LogOut, CheckCircle, Wrench, Clock, FileSpreadsheet, 
  ChevronRight, Phone, MessageSquare, MapPin, Calendar, HelpCircle, Copy, AlertTriangle, ArrowLeft
} from "lucide-react";
import { MUMBAI_SUBURBS, SERVICES_LIST } from "../data";
import { motion, AnimatePresence } from "motion/react";

// ==========================================
// 💡 LIVE PRODUCTION BACKEND CONFIGURATION
// ==========================================
const API_BASE_URL = "https://rapidcool-new-backend.onrender.com";

interface AdminBooking {
  id: string;
  date: string;
  time: string;
  customerName: string;
  mobileNumber: string;
  customerEmail: string;
  applianceType: string;
  serviceRequired: string;
  area: string;
  address: string;
  preferredDate: string;
  additionalNotes: string;
  status: "New" | "Assigned" | "Completed";
  express: boolean;
  warranty: boolean;
  visitingFee: number;
  deliveryTries?: {
    emailAdmin: number;
    emailCustomer: number;
    sheets: number;
    whatsapp: number;
  };
  errors?: string[];
}

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Dashboard Data State
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [newBookingNotification, setNewBookingNotification] = useState<AdminBooking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suburbFilter, setSuburbFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sheet Integration Guide Tab
  const [showSheetCode, setShowSheetCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live chime sound trigger using native Web Audio synthesizer (no assets required)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chime start
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5 chime peak
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Subtle audio notification blocked by browser autoplay policy.");
    }
  };

  const fetchBookings = async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`);
      if (response.ok) {
        const resData = await response.json();
        const freshList: AdminBooking[] = resData.bookings || [];
        
        // If it is a background silent check and we already have some bookings loaded
        if (isSilent && bookings.length > 0) {
          const existingIds = new Set(bookings.map(b => b.id));
          const trulyNew = freshList.filter(b => !existingIds.has(b.id));
          
          if (trulyNew.length > 0) {
            // Trigger beautiful real-time toast alert & audio chime
            setNewBookingNotification(trulyNew[0]);
            playChime();
          }
        }
        setBookings(freshList);
      }
    } catch (error) {
      console.error("Failed to query bookings:", error);
    } finally {
      if (!isSilent) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  // Load Session on start
  useEffect(() => {
    const savedToken = localStorage.getItem("rapid_cool_admin_token");
    if (savedToken === "rapid_cool_verified_session_token_2026") {
      setIsAuthenticated(true);
      fetchBookings();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Set up 10-second polling interval when admin is active
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchBookings(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, bookings]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoadingLogin(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        localStorage.setItem("rapid_cool_admin_token", resData.token);
        setIsAuthenticated(true);
        fetchBookings();
      } else {
        setLoginError(resData.error || "Incorrect admin credentials.");
      }
    } catch (e) {
      setLoginError("Failed to authenticate with system server. Please make sure the backend is active.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rapid_cool_admin_token");
    setIsAuthenticated(false);
    setBookings([]);
  };

  const updateBookingStatus = async (id: string, newStatus: "New" | "Assigned" | "Completed") => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBookings(prev =>
          prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (e) {
      alert("Error updating booking status.");
    }
  };

  const deleteBookingRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking permanently from the database?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: "DELETE" });
      if (response.ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (e) {
      alert("Failed to delete booking.");
    }
  };

  // CSV Export trigger
  const triggerCSVDownload = () => {
    window.open(`${API_BASE_URL}/api/bookings/export`, "_blank");
  };

  // Filter Bookings logic client side for ultra responsive feedback
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobileNumber.includes(searchTerm) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSuburb = suburbFilter === "" || b.area === suburbFilter;
    const matchesStatus = statusFilter === "" || b.status === statusFilter;
    const matchesDate = dateFilter === "" || b.preferredDate === dateFilter;

    return matchesSearch && matchesSuburb && matchesStatus && matchesDate;
  });

  // Calculate quick metrics
  const stats = {
    total: bookings.length,
    new: bookings.filter(b => b.status === "New").length,
    assigned: bookings.filter(b => b.status === "Assigned").length,
    completed: bookings.filter(b => b.status === "Completed").length,
    revenue: bookings.reduce((acc, b) => acc + (b.visitingFee || 0), 0)
  };

  const appsScriptCode = `/*
  Rapid Cool Services - Google Sheets App Script 
  Paste this inside your Google Sheet:
  1. Open sheets.google.com -> Create a sheet named "Rapid Cool Services Bookings"
  2. Click Extensions -> Apps Script
  3. Replace the entire code with the block below, save, and click "Deploy -> New Deployment"
  4. Choose type: Web App, Execute as: Me, Who has access: Anyone
  5. Copy the Web App Deployment URL and paste it as your "GOOGLE_SHEET_WEBHOOK_URL" in your environment variables!
*/

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (data.action === "addBooking") {
      // Append booking row 
      sheet.appendRow([
        data.id,
        data.date,
        data.time,
        data.customerName,
        "'" + data.mobileNumber, // Force string representation inside sheets
        data.customerEmail || "N/A",
        data.applianceType,
        data.serviceRequired,
        data.area,
        data.address,
        data.preferredDate,
        data.status
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "updateBooking") {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          sheet.getRange(i + 1, 12).setValue(data.status); // Updates Status column
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, updated: true })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid Action" })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-[#030d1a] min-h-screen text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      
      {/* Floating Real-Time Booking Alert Toast */}
      <AnimatePresence>
        {newBookingNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-20 right-6 z-[9999] max-w-sm w-full bg-[#021329] border-2 border-amber-500 rounded-2xl p-5 shadow-2xl text-left backdrop-blur-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                  🚨 LIVE WEBSITE NOTIFICATION
                </span>
              </div>
              <button
                onClick={() => setNewBookingNotification(null)}
                className="text-slate-400 hover:text-white transition text-xs font-bold px-1.5 py-0.5 rounded bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="mt-3.5 space-y-1.5">
              <p className="text-xs text-white leading-relaxed">
                <strong>{newBookingNotification.customerName}</strong> has placed a new booking for <strong className="text-[#38bdf8]">{newBookingNotification.applianceType}</strong> in <strong className="text-white">{newBookingNotification.area}</strong>!
              </p>
              <div className="text-[11px] text-slate-300 font-mono flex justify-between">
                <span>Phone: +91 {newBookingNotification.mobileNumber}</span>
                <span className="text-amber-400 font-bold">₹{newBookingNotification.visitingFee}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  const id = newBookingNotification.id;
                  setNewBookingNotification(null);
                  setSearchTerm(id);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-[#011e41] text-[10px] font-black uppercase rounded-lg tracking-wider transition"
              >
                View Ticket
              </button>
              <button
                onClick={() => setNewBookingNotification(null)}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold uppercase rounded-lg transition"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="border-b border-blue-900/40 bg-[#020912]/92 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-750 hover:bg-white/5 transition text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase font-mono">
                Rapid Cool Services
              </span>
              <h1 className="text-sm font-black uppercase text-white tracking-tight flex items-center">
                <span>Central Management Dashboard</span>
                <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="bg-transparent border border-rose-900 text-rose-400 hover:bg-rose-950/20 px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout Session</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer"
            >
              EXIT ADMIN
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* LOGIN GATE SCREEN */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto py-16">
            <div className="bg-[#021329]/80 border border-blue-900/50 rounded-2xl p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                  <Lock className="w-6 h-6 stroke-[2]" />
                </div>
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-white mt-4">
                  Admin Sign-In
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Owner dashboard is securely protected. Please sign in using the Rapid Cool administrative credentials.
                </p>
              </div>

              {loginError && (
                <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3.5 rounded-xl text-xs font-semibold leading-relaxed flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 font-mono">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#010c1c] border border-blue-900/60 rounded-xl py-3 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 font-mono">
                    Security Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#010c1c] border border-blue-900/60 rounded-xl py-3 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingLogin}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-[#011e41] py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg mt-2 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loadingLogin ? (
                    <span>Authenticating System...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authenticate Securely</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-350 transition flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return plain web store
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ACTUAL ADMINISTRATIVE USER WORKSPACE */
          <div className="space-y-8">
            
            {/* 1. Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              
              <div className="bg-[#021329]/60 border border-blue-900/30 rounded-xl p-4.5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Total Tickets</span>
                <span className="text-2xl font-black text-white block">{stats.total}</span>
                <span className="text-[10px] text-slate-400 font-mono">Registered in local cache</span>
              </div>

              <div className="bg-[#021329]/60 border border-blue-900/30 rounded-xl p-4.5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase text-amber-400 block">⚡ New Bookings</span>
                <span className="text-2xl font-black text-amber-400 block">{stats.new}</span>
                <span className="text-[10px] text-slate-400 font-mono">Awaiting dispatch</span>
              </div>

              <div className="bg-[#021329]/60 border border-blue-900/30 rounded-xl p-4.5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase text-blue-400 block">🛠️ Assigned Active</span>
                <span className="text-2xl font-black text-blue-400 block">{stats.assigned}</span>
                <span className="text-[10px] text-slate-400 font-mono">Technicians en route</span>
              </div>

              <div className="bg-[#021329]/60 border border-blue-900/30 rounded-xl p-4.5 space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 block">✓ Completed</span>
                <span className="text-2xl font-black text-emerald-400 block">{stats.completed}</span>
                <span className="text-[10px] text-slate-400 font-mono">Invoices finalised</span>
              </div>

              <div className="bg-[#021329]/60 border border-amber-500/20 rounded-xl p-4.5 space-y-1 col-span-2 md:col-span-1">
                <span className="text-[9px] font-mono font-bold uppercase text-amber-500 block">Visiting Escrow</span>
                <span className="text-2xl font-black text-amber-500 block">₹{stats.revenue}</span>
                <span className="text-[10px] text-slate-400 font-mono">Waived on final repair</span>
              </div>

            </div>

            {/* 2. Admin Quick Guide & Google Sheet Config */}
            <div className="bg-[#011e41]/50 border border-blue-900/50 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-amber-500">
                    <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-black tracking-wider uppercase font-mono">
                      Google Sheets Integration Connected
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    Need to link a dynamic Google Sheet spreadsheet for live sync?
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Keep your Excel Sheets up to date automatically! We support appending real bookings as fresh rows directly into your selected Google Sheet via our secure lightweight micro-Apps Script.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSheetCode(!showSheetCode)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-lg uppercase tracking-wider transition cursor-pointer"
                  >
                    {showSheetCode ? "Hide Instruction Script" : "Reveal Google Script"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showSheetCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-3 pt-4 border-t border-blue-900/40"
                  >
                    <div className="text-xs text-left text-slate-300 space-y-1.5 bg-slate-950 p-4 rounded-xl border border-blue-900/30">
                      <p><strong>Step 1:</strong> Go to <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-bold">sheets.google.com</a> and build a spreadsheet with the name <strong>"Rapid Cool Services Bookings"</strong>.</p>
                      <p><strong>Step 2:</strong> In the upper menu, go to <strong>Extensions ➔ Apps Script</strong>.</p>
                      <p><strong>Step 3:</strong> Paste the code block below, replacing any template code there perfectly.</p>
                      <p><strong>Step 4:</strong> Click <strong>Deploy ➔ New Deployment</strong>. Choose <strong>Web App</strong>, change Who has access to <strong>"Anyone"</strong>, execute as <strong>"Me"</strong>, and click Deploy.</p>
                      <p><strong>Step 5:</strong> Copy the output Web App URL and add it to your <code>.env.example / server</code> environment secrets as <code>GOOGLE_SHEET_WEBHOOK_URL</code>.</p>
                    </div>

                    <div className="relative">
                      <pre className="text-[10px] text-slate-300 overflow-x-auto text-left bg-slate-950 p-4.5 rounded-xl border border-blue-900/60 font-mono leading-relaxed max-h-72">
                        {appsScriptCode}
                      </pre>
                      <button
                        onClick={copyToClipboard}
                        className="absolute top-3 right-3 bg-white/10 hover:bg-white/15 text-white p-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 bubble-button"
                        title="Copy Apps Script to clipboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Search & Operational Filters Panel */}
            <div className="bg-[#020d1c]/80 border border-blue-900/30 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-left">
                
                {/* Search Term input */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ID, name, number, address..."
                    className="w-full bg-slate-950 border border-blue-900/50 rounded-xl py-2 px-10 text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                {/* Suburb Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
                  <div>
                    <select
                      value={suburbFilter}
                      onChange={(e) => setSuburbFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900/50 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-500 font-bold cursor-pointer text-slate-300"
                    >
                      <option value="">All Mumbai Suburbs</option>
                      {MUMBAI_SUBURBS.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Selector */}
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900/50 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-500 font-bold cursor-pointer text-slate-300"
                    >
                      <option value="">All Statuses</option>
                      <option value="New">🚨 New</option>
                      <option value="Assigned">🛠️ Assigned</option>
                      <option value="Completed">✓ Completed</option>
                    </select>
                  </div>

                  {/* Export CSV CTA */}
                  <div className="col-span-2 sm:col-span-1">
                    <button
                      onClick={triggerCSVDownload}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-[#011e41] text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Export to CSV</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* 4. Live Table View / Mobile Cards Container */}
            <div className="bg-[#021329]/20 border border-blue-900/20 rounded-2xl overflow-hidden shadow-2xl">
              
              <div className="bg-slate-950/60 py-3.5 px-6 border-b border-blue-900/30 flex items-center justify-between">
                <span className="text-xs uppercase font-black tracking-widest text-[#38bdf8] font-mono">
                  Active Dispatch Database ({filteredBookings.length} bookings listed)
                </span>
                <button
                  onClick={() => fetchBookings()}
                  disabled={isRefreshing}
                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Reload Live Database"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-20 text-slate-400 space-y-3 font-mono">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                  <p className="text-xs">Gathering rapid cool bookings cache...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs font-mono space-y-2">
                  <p>🔍 No bookings found matching the selected search query or category filters.</p>
                  <button 
                    onClick={() => { setSearchTerm(""); setStatusFilter(""); setSuburbFilter(""); }}
                    className="text-amber-500 hover:underline font-bold"
                  >
                    Reset Filter Query Settings
                  </button>
                </div>
              ) : (
                /* Desktop Table Layout View */
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans text-xs min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-950/90 text-slate-400 border-b border-blue-900/30">
                        <th className="py-4.5 px-6 font-mono font-black uppercase tracking-wider text-[10px]">Reference Ticket</th>
                        <th className="py-4.5 px-5 font-black uppercase tracking-wider text-[10px]">Customer Details</th>
                        <th className="py-4.5 px-5 font-black uppercase tracking-wider text-[10px]">Appliance & Service</th>
                        <th className="py-4.5 px-5 font-black uppercase tracking-wider text-[10px]">Doorstep Address</th>
                        <th className="py-4.5 px-4 font-black uppercase tracking-wider text-[10px]">Status Tracker</th>
                        <th className="py-4.5 px-4 font-black uppercase tracking-wider text-[10px] text-right">Escrow Cost</th>
                        <th className="py-4.5 px-5 font-black uppercase tracking-wider text-[10px] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/10">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-blue-950/20 bg-slate-950/10 transition">
                          {/* Col 1: Ticket References */}
                          <td className="py-4 px-6 items-start font-mono text-left">
                            <strong className="block text-amber-400 text-sm font-black tracking-wider">{b.id}</strong>
                            <span className="block text-[10px] text-slate-400 mt-1">{b.date} • {b.time}</span>
                            <span className="block text-[9px] text-[#38bdf8] font-bold mt-1 uppercase">Pref: {b.preferredDate}</span>
                          </td>

                          {/* Col 2: Customer Name, Email, Phone */}
                          <td className="py-4 px-5">
                            <strong className="block text-white text-sm font-extrabold">{b.customerName}</strong>
                            <div className="flex items-center space-x-1 text-slate-350 mt-1 font-mono font-bold">
                              <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>+91 {b.mobileNumber}</span>
                            </div>
                            {b.customerEmail && (
                              <span className="block text-[10px] text-slate-400 truncate max-w-[160px] font-mono mt-1">{b.customerEmail}</span>
                            )}
                          </td>

                          {/* Col 3: Service details */}
                          <td className="py-4 px-5">
                            <strong className="block text-[#38bdf8] text-[13px] font-black uppercase">{b.applianceType}</strong>
                            <span className="block text-slate-300 mt-1 font-medium">{b.serviceRequired}</span>
                            <div className="flex gap-1.5 mt-2">
                              {b.express && (
                                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide">
                                  ⚡ EXPRESS
                                </span>
                              )}
                              {b.warranty && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide">
                                  🛡️ 90D PARTS
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Col 4: Location Address */}
                          <td className="py-4 px-5 max-w-xs">
                            <div className="flex items-start space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-white text-xs block">{b.area}</strong>
                                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed line-clamp-3">
                                  {b.address}
                                </p>
                              </div>
                            </div>
                            {b.additionalNotes && (
                              <div className="text-[10px] text-amber-300 italic font-medium mt-1 bg-amber-500/5 p-1 rounded-lg border border-amber-500/10">
                                Note: {b.additionalNotes}
                              </div>
                            )}
                          </td>

                          {/* Col 5: Dropdown Status update control */}
                          <td className="py-4 px-4 font-mono">
                            <div className="space-y-1.5">
                              <select
                                value={b.status}
                                onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                                className={`text-[10px] font-black uppercase tracking-wider py-1.5 px-2.5 rounded-lg border focus:outline-none cursor-pointer ${
                                  b.status === "New" 
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30" 
                                    : b.status === "Assigned"
                                    ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                }`}
                              >
                                <option value="New" className="bg-[#030d1a] font-black text-amber-400">🚨 New Request</option>
                                <option value="Assigned" className="bg-[#030d1a] font-black text-blue-400">🛠️ Assigned</option>
                                <option value="Completed" className="bg-[#030d1a] font-black text-emerald-400">✓ Completed</option>
                              </select>
                            </div>
                          </td>

                          {/* Col 6: Price costs */}
                          <td className="py-4 px-4 text-right font-mono">
                            <strong className="text-white font-black text-sm">₹{b.visitingFee}</strong>
                            <span className="block text-[9px] text-slate-400 mt-1">Visit Escrow</span>
                          </td>

                          {/* Col 7: Actions */}
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <a
                                href={`https://wa.me/91${b.mobileNumber}?text=Hello%20${encodeURIComponent(b.customerName)},%20this%20is%20Rapid%20Cool%20Services%20Mumbai.%20We%20received%20your%20booking%20for%20${encodeURIComponent(b.applianceType)}%20(ID:%20${b.id}).%20Our%20certified%20technician%20is%20dispatched%20to%20your%20address%20in%20${encodeURIComponent(b.area)}.%20Please%20verify%20if%20you%20are%20available%20now.`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center space-x-1 transition"
                                title="Instantly coordinate with homeowner on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3 fill-white" />
                                <span>WhatsApp Customer</span>
                              </a>

                              <button
                                onClick={() => deleteBookingRecord(b.id)}
                                className="p-1.5 bg-rose-950/25 text-rose-450 border border-rose-900/40 rounded-lg hover:bg-rose-900 hover:text-white transition"
                                title="Remove reservation permanently"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
