import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Trash2, 
  RefreshCw, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  MapPin 
} from "lucide-react";

// Types definition
interface Booking {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  suburb: string;
  address: string;
  date: string;
  appliance: string;
  notes?: string;
  status?: string;
  express?: boolean;
  warranty?: boolean;
  visitingFee?: number;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuburb, setSelectedSuburb] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // 🟢 Live Fetch Database function
  const fetchLiveBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://rapidcool-new-backend.onrender.com/api/bookings");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch database data (${response.status})`);
      }
      
      const data = await response.json();
      
      // Agar API response format main array ke andar 'bookings' keys hai ya direct array hai:
      const bookingsArray = Array.isArray(data) ? data : (data.bookings || []);
      setBookings(bookingsArray);
      
    } catch (err: any) {
      console.warn("Backend API unreachable. Fallback to localStorage:", err);
      setError("Live connection failed. Displaying local offline records.");
      
      // Local cache backup fetch
      const saved = localStorage.getItem("rapid_cool_bookings");
      if (saved) {
        try {
          setBookings(JSON.parse(saved));
        } catch (e) {
          console.error("Local parsing failed", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBookings();
  }, []);

  // Filter & Search logic
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery) ||
      booking.appliance.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.id && booking.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSuburb = selectedSuburb === "All" || booking.suburb === selectedSuburb;
    
    const bookingStatus = booking.status || "Pending";
    const matchesStatus = selectedStatus === "All" || bookingStatus === selectedStatus;

    return matchesSearch && matchesSuburb && matchesStatus;
  });

  // Export dynamically to CSV
  const exportToCSV = () => {
    if (filteredBookings.length === 0) return;
    const headers = ["Ticket ID", "Name", "Phone", "Suburb", "Address", "Appliance", "Date", "Status", "Amount"];
    const rows = filteredBookings.map(b => [
      b.id || b._id || "N/A",
      b.name,
      b.phone,
      b.suburb,
      b.address.replace(/,/g, " "),
      b.appliance,
      b.date,
      b.status || "Pending",
      b.visitingFee || 499
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rapid_Cool_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete booking from database/local
  const deleteBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      const response = await fetch(`https://rapidcool-new-backend.onrender.com/api/bookings/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setBookings(bookings.filter(b => b._id !== id && b.id !== id));
      } else {
        alert("Failed to delete booking from backend.");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      // Fallback: Delete locally
      const filtered = bookings.filter(b => b.id !== id && b._id !== id);
      setBookings(filtered);
      localStorage.setItem("rapid_cool_bookings", JSON.stringify(filtered));
    }
  };

  // Metrics Calculations
  const totalTickets = bookings.length;
  const pendingTickets = bookings.filter(b => !b.status || b.status === "Pending" || b.status === "New").length;
  const completedTickets = bookings.filter(b => b.status === "Completed").length;
  const totalEscrow = bookings.reduce((acc, b) => acc + (b.visitingFee || 499), 0);

  // Unique Mumbai suburbs in database for dropdown filter
  const suburbsList = ["All", ...Array.from(new Set(bookings.map(b => b.suburb)))];

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
          <div>
            <span className="text-xs bg-blue-50 text-blue-700 font-mono font-extrabold px-3 py-1 rounded-full border border-blue-100 uppercase">
              Management Portal
            </span>
            <h1 className="text-2xl font-black text-[#011e41] tracking-tight mt-2 uppercase">
              Central Management Dashboard
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchLiveBookings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Syncing..." : "Sync Database"}</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredBookings.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
            <div className="flex justify-between items-center text-blue-600">
              <ClipboardList className="w-6 h-6" />
              <span className="text-[10px] font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">TOTAL</span>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-3">{totalTickets}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase mt-1">Total Bookings in Database</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
            <div className="flex justify-between items-center text-amber-600">
              <Clock className="w-6 h-6" />
              <span className="text-[10px] font-mono font-bold bg-amber-50 px-2 py-0.5 rounded">PENDING</span>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-3">{pendingTickets}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase mt-1">Awaiting dispatch</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
            <div className="flex justify-between items-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
              <span className="text-[10px] font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">COMPLETED</span>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-3">{completedTickets}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase mt-1">Invoices finalized</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
            <div className="flex justify-between items-center text-indigo-600">
              <TrendingUp className="w-6 h-6" />
              <span className="text-[10px] font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded">ESCROW</span>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-3">₹{totalEscrow}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase mt-1">Adjusted on repair completion</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Customer, ID, Phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <select
              value={selectedSuburb}
              onChange={(e) => setSelectedSuburb(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold text-gray-700"
            >
              {suburbsList.map(sub => (
                <option key={sub} value={sub}>{sub === "All" ? "All Suburbs" : sub}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold text-gray-700"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">🚨 New / Pending</option>
              <option value="Completed">✓ Completed</option>
            </select>
          </div>
        </div>

        {/* Database List */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="bg-white text-center py-16 rounded-2xl border border-gray-150 shadow-sm">
            <p className="text-gray-400 text-sm font-bold">No live bookings found matching criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-gray-150 text-gray-500 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="p-4">Ticket details</th>
                    <th className="p-4">Customer Contact</th>
                    <th className="p-4">Address details</th>
                    <th className="p-4">Addons & Cost</th>
                    <th className="p-4 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                  {filteredBookings.map((book) => (
                    <tr key={book._id || book.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-600 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
                            {book.id || "RC-9901-MUM"}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            book.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {book.status || "Pending"}
                          </span>
                        </div>
                        <p className="text-gray-900 font-black text-sm">{book.appliance}</p>
                        <p className="text-gray-400 font-mono text-[9px]">{book.date}</p>
                      </td>

                      <td className="p-4 space-y-1">
                        <p className="text-gray-900 font-bold">{book.name}</p>
                        <a href={`tel:${book.phone}`} className="text-blue-600 font-mono hover:underline block">{book.phone}</a>
                        <p className="text-gray-400 text-[10px] font-mono">{book.email || "No email provided"}</p>
                      </td>

                      <td className="p-4 space-y-1">
                        <p className="font-extrabold text-gray-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>{book.suburb}</span>
                        </p>
                        <p className="text-gray-500 font-medium max-w-xs leading-relaxed">{book.address}</p>
                        {book.notes && (
                          <p className="text-[10px] text-amber-700 bg-amber-50/50 p-1.5 rounded border border-amber-100 max-w-xs italic">
                            💬 Notes: {book.notes}
                          </p>
                        )}
                      </td>

                      <td className="p-4 space-y-1.5">
                        <strong className="text-gray-900 text-sm font-black">₹{book.visitingFee || 499}</strong>
                        <div className="flex gap-1 flex-wrap">
                          {book.express && (
                            <span className="bg-orange-50 text-orange-700 text-[8px] font-black uppercase px-1 rounded">
                              Same Day
                            </span>
                          )}
                          {book.warranty && (
                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase px-1 rounded">
                              Warranty Active
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteBooking(book._id || book.id || "")}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                          title="Cancel Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
