import { useState, useEffect, FormEvent } from "react";
import { Star, StarHalf, MessageSquare, Plus, Search, X, Check, CheckCircle2, ThumbsUp, Filter, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MUMBAI_SUBURBS, SERVICES_LIST } from "../data";

// Type definitions for a review
export interface Review {
  id: string;
  name: string;
  suburb: string;
  serviceId: string;
  serviceName: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  likes: number;
}

// Pre-seeded authentic localized customer reviews for Rapid Cool Services
const PRE_SEEDED_REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Karan Johar",
    suburb: "Oshiwara",
    serviceId: "ac",
    serviceName: "Air Conditioner Services",
    rating: 5,
    text: "Extremely professional service. Tech arrived within 25 minutes of booking for our split AC gas charging. Transparent pricing of ₹299 + gas charges, very satisfied with their promptness!",
    date: "2026-06-15",
    verified: true,
    likes: 12,
  },
  {
    id: "rev-2",
    name: "Aarti Mehra",
    suburb: "Andheri West",
    serviceId: "refrigerator",
    serviceName: "Refrigerator Repair",
    rating: 5,
    text: "Our double door LG fridge stopped cooling suddenly. The technician identified a thermostat failure, repaired it on the spot, and gave us a 90-day warranty. Strongly recommended dynamic team!",
    date: "2026-06-10",
    verified: true,
    likes: 8,
  },
  {
    id: "rev-3",
    name: "Rohan Shirke",
    suburb: "Bandra West",
    serviceId: "washing_machine",
    serviceName: "Washing Machine Repair",
    rating: 4,
    text: "Had a water drainage issue in my Samsung front load. They cleared the pump clog quickly. Very polite behavior and pocket-friendly repair rates.",
    date: "2026-06-08",
    verified: true,
    likes: 3,
  },
  {
    id: "rev-4",
    name: "Vikram Malhotra",
    suburb: "Juhu",
    serviceId: "ac",
    serviceName: "Air Conditioner Services",
    rating: 5,
    text: "Excellent jet cleaning service for our Juhu flat. They put a specialized collector bag to prevent wall damage. Air draft is cold and fresh now.",
    date: "2026-06-02",
    verified: true,
    likes: 14,
  },
  {
    id: "rev-5",
    name: "Sneha Patel",
    suburb: "Goregaon West",
    serviceId: "microwave",
    serviceName: "Microwave Oven Repair",
    rating: 4,
    text: "Buttons on the microwave membrane weren't working. They replaced the panel. Service was done in 45 minutes flat at my doorstep.",
    date: "2026-05-28",
    verified: true,
    likes: 5,
  }
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | "all">("all");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedReviews, setLikedReviews] = useState<string[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newSuburb, setNewSuburb] = useState(MUMBAI_SUBURBS[0] || "");
  const [newServiceId, setNewServiceId] = useState(SERVICES_LIST[0]?.id || "ac");
  const [newRating, setNewRating] = useState(5);
  const [newRatingHover, setNewRatingHover] = useState(0);
  const [newText, setNewText] = useState("");
  const [formError, setFormError] = useState("");

  // Load reviews from local storage, fallback to pre-seeded list
  useEffect(() => {
    const stored = localStorage.getItem("rapid_cool_reviews");
    if (stored) {
      try {
        setReviews(JSON.parse(stored));
      } catch (e) {
        setReviews(PRE_SEEDED_REVIEWS);
      }
    } else {
      localStorage.setItem("rapid_cool_reviews", JSON.stringify(PRE_SEEDED_REVIEWS));
      setReviews(PRE_SEEDED_REVIEWS);
    }

    const storedLikes = localStorage.getItem("rapid_cool_liked_reviews");
    if (storedLikes) {
      try {
        setLikedReviews(JSON.parse(storedLikes));
      } catch (e) {}
    }
  }, []);

  const saveReviews = (updated: Review[]) => {
    setReviews(updated);
    localStorage.setItem("rapid_cool_reviews", JSON.stringify(updated));
  };

  // Helper stats calculation
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1))
    : 5.0;

  // Star frequencies
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
    return { stars, count, percentage };
  });

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.suburb.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = selectedRatingFilter === "all" || review.rating === selectedRatingFilter;
    const matchesService = selectedServiceFilter === "all" || review.serviceId === selectedServiceFilter;

    return matchesSearch && matchesRating && matchesService;
  });

  // Handle support/like click
  const handleLike = (id: string) => {
    if (likedReviews.includes(id)) {
      // Unlike
      const updatedLikes = likedReviews.filter((item) => item !== id);
      setLikedReviews(updatedLikes);
      localStorage.setItem("rapid_cool_liked_reviews", JSON.stringify(updatedLikes));

      const updatedReviews = reviews.map((r) => {
        if (r.id === id) {
          return { ...r, likes: Math.max(0, r.likes - 1) };
        }
        return r;
      });
      saveReviews(updatedReviews);
    } else {
      // Like
      const updatedLikes = [...likedReviews, id];
      setLikedReviews(updatedLikes);
      localStorage.setItem("rapid_cool_liked_reviews", JSON.stringify(updatedLikes));

      const updatedReviews = reviews.map((r) => {
        if (r.id === id) {
          return { ...r, likes: r.likes + 1 };
        }
        return r;
      });
      saveReviews(updatedReviews);
    }
  };

  // Handle submitting review
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newText.trim()) {
      setFormError("Please fill out your name and review details.");
      return;
    }
    if (newText.length < 10) {
      setFormError("Please write at least a short sentence (10+ characters).");
      return;
    }

    const matchedService = SERVICES_LIST.find((s) => s.id === newServiceId);
    const serviceName = matchedService ? matchedService.name : "Appliance Services";

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      name: newName.trim(),
      suburb: newSuburb,
      serviceId: newServiceId,
      serviceName,
      rating: newRating,
      text: newText.trim(),
      date: new Date().toISOString().split("T")[0] || "",
      verified: true,
      likes: 0,
    };

    const updatedReviews = [newReview, ...reviews];
    saveReviews(updatedReviews);

    // Reset Form and close Modal
    setNewName("");
    setNewText("");
    setNewRating(5);
    setFormError("");
    setIsModalOpen(false);

    // Show custom toast notification
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <section id="reviews" className="py-20 bg-white relative border-t border-gray-100">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-blue-700 text-[10px] font-black tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3 font-mono border border-blue-100">
            CUSTOMER VOICE & OPINIONS
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#011e41] uppercase tracking-tight">
            Loved By 150+ Homeowners
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-xs sm:text-sm mt-3 leading-relaxed">
            Read transparent feedback from households across Northwest Mumbai regarding our breakdown responses, repair speeds, and technical skills.
          </p>
        </div>

        {/* Analytics rating overview block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50 rounded-3xl p-6 sm:p-8 border border-gray-150 mb-10 shadow-sm">
          
          {/* Average Badge Counter */}
          <div className="md:col-span-4 text-center md:border-r border-gray-200 md:pr-8 py-4 space-y-2">
            <span className="text-6xl font-black text-[#011e41] tracking-tight font-mono">
              {averageRating}
            </span>
            <div className="flex justify-center text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => {
                const isFull = s <= Math.floor(averageRating);
                const isHalf = !isFull && s - 0.5 <= averageRating;
                return (
                  <span key={s}>
                    {isFull ? (
                      <Star className="w-5 h-5 fill-amber-500 stroke-amber-500" />
                    ) : isHalf ? (
                      <StarHalf className="w-5 h-5 fill-amber-500 stroke-amber-500" />
                    ) : (
                      <Star className="w-5 h-5 text-gray-300" />
                    )}
                  </span>
                );
              })}
            </div>
            <div className="space-y-0.5">
              <span className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Overall Score
              </span>
              <span className="block text-[10px] text-gray-500 font-mono">
                Based on {totalReviewsCount} Local Submissions
              </span>
            </div>
          </div>

          {/* Progress Distribution Bars */}
          <div className="md:col-span-5 space-y-2">
            {ratingDistribution.map((row) => (
              <div key={row.stars} className="flex items-center space-x-3 text-xs">
                <span className="w-8 text-right font-black text-slate-700 font-mono">
                  {row.stars} ★
                </span>
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-[#0f5fc2] rounded-full"
                  />
                </div>
                <span className="w-10 text-left text-gray-500 font-mono text-[10px]">
                  {row.count} ({Math.round(row.percentage)}%)
                </span>
              </div>
            ))}
          </div>

          {/* Call to Write feedback CTA */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#011e41] hover:bg-[#0f5fc2] text-white py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 border border-blue-900 cursor-pointer active:scale-95"
              id="open-review-form-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
            <p className="text-[10px] text-gray-550 text-center mt-3 leading-relaxed">
              Have you utilized our repair service? Share your honest review to improve our workmanship.
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Filter Toolbar */}
        <div className="bg-white border border-gray-150 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          
          {/* Search container */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search words (eg. AC, fridge, speed)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3.5 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white placeholder-gray-400"
              id="search-reviews-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtering selectors */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* Rating Filter Select */}
            <div className="flex items-center space-x-1.5 bg-slate-100/60 border border-gray-200 py-1.5 px-3 rounded-xl">
              <Filter className="w-3 h-3 text-slate-500" />
              <select
                value={selectedRatingFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedRatingFilter(val === "all" ? "all" : Number(val));
                }}
                className="bg-transparent border-none text-xs text-slate-700 focus:ring-0 font-bold focus:outline-none cursor-pointer"
                id="rating-filter-select"
              >
                <option value="all">Rating: All Stars</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars & Above</option>
                <option value="3">3 Stars & Above</option>
              </select>
            </div>

            {/* Service filter selector */}
            <div className="flex items-center space-x-1.5 bg-slate-100/60 border border-gray-200 py-1.5 px-3 rounded-xl">
              <MessageSquare className="w-3 h-3 text-slate-500" />
              <select
                value={selectedServiceFilter}
                onChange={(e) => setSelectedServiceFilter(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-700 focus:ring-0 font-bold focus:outline-none cursor-pointer"
                id="service-filter-select"
              >
                <option value="all">Service: All Types</option>
                {SERVICES_LIST.map((serv) => (
                  <option key={serv.id} value={serv.id}>
                    {serv.name}
                  </option>
                ))}
              </select>
            </div>
            
          </div>
        </div>

        {/* Reviews dynamic list container */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => {
                const hasLiked = likedReviews.includes(review.id);
                return (
                  <motion.div
                    layout
                    key={review.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="p-6 bg-slate-50 hover:bg-slate-50/80 border border-gray-150 rounded-2xl shadow-sm transition-colors duration-200 space-y-4 flex flex-col justify-between"
                  >
                    
                    {/* Top Row: User details & Stars */}
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-[#011e41]">
                            {review.name}
                          </span>
                          <span className="text-[10px] bg-blue-50 text-[#0f5fc2] font-black border border-blue-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            <span>{review.suburb}</span>
                          </span>
                          {review.verified && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-0.5" title="Verified Customer">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                              <span className="hidden sm:inline">Verified Repair</span>
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-gray-550 font-mono uppercase tracking-wider">
                          Service Ordered: <strong className="text-gray-700 font-bold">{review.serviceName}</strong>
                        </span>
                      </div>

                      {/* Display Star rating */}
                      <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Middle: Review text content */}
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line italic">
                      "{review.text}"
                    </p>

                    {/* Bottom row: Dates and helpful thumbs up */}
                    <div className="flex items-center justify-between text-[11px] text-gray-550 border-t border-gray-100 pt-3 mt-1.5">
                      <span className="font-mono">
                        Posted on {review.date}
                      </span>

                      {/* Helpful Button */}
                      <button
                        onClick={() => handleLike(review.id)}
                        className={`flex items-center space-x-1.5 py-1 px-3.5 rounded-lg border transition-all cursor-pointer ${
                          hasLiked
                            ? "bg-blue-600 border-blue-500 text-white font-bold"
                            : "bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                        id={`like-review-${review.id}`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-white text-blue-600" : ""}`} />
                        <span>Helpful ({review.likes})</span>
                      </button>
                    </div>

                  </motion.div>
                );
              })
            ) : (
              /* Empty state matching zero queries found */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 px-6 bg-slate-50 border border-dashed border-gray-200 rounded-3xl"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-[#011e41] uppercase tracking-wider mb-1">
                  No matching reviews found
                </h4>
                <p className="text-xs text-gray-550 max-w-sm mx-auto">
                  Try clearing your search query ("{searchTerm}") or adjusting the star rating filter tags to view other remarks.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRatingFilter("all");
                    setSelectedServiceFilter("all");
                  }}
                  className="mt-4 text-xs font-bold text-blue-700 hover:underline inline-block cursor-pointer"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leaves modal form pop up */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              {/* Form Window */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                
                {/* Modal Header */}
                <div className="bg-[#011e41] text-white p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-[#38bdf8] uppercase tracking-wider text-xs font-mono">
                      Workmanship Feedback
                    </h3>
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      Leave Your Honest Review
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white cursor-pointer"
                    aria-label="Close modal dialog"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto">
                  
                  {/* Alert Error Messages */}
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium">
                      ⚠️ {formError}
                    </div>
                  )}

                  {/* Rating star Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#011e41] uppercase tracking-wider">
                      Your Rating *
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeVal = newRatingHover || newRating;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setNewRatingHover(star)}
                            onMouseLeave={() => setNewRatingHover(0)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                            aria-label={`Select ${star} stars`}
                          >
                            <Star
                              className={`w-7 h-7 transition-all ${
                                star <= activeVal
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-200"
                              }`}
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs font-bold text-gray-500 ml-2 font-mono uppercase">
                        ({newRating === 5 ? "Excellent" : newRating === 4 ? "Good" : newRating === 3 ? "Average" : newRating === 2 ? "Below Average" : "Poor"})
                      </span>
                    </div>
                  </div>

                  {/* Input Split Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#011e41] uppercase tracking-wider">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="eg. Sunita Sharma"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white placeholder-gray-400"
                        required
                        id="new-review-name"
                      />
                    </div>

                    {/* Suburb Selection */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#011e41] uppercase tracking-wider">
                        Your Suburb (Mumbai)
                      </label>
                      <select
                        value={newSuburb}
                        onChange={(e) => setNewSuburb(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                        id="new-review-suburb"
                      >
                        {MUMBAI_SUBURBS.map((suburb) => (
                          <option key={suburb} value={suburb}>
                            {suburb}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Service Ordered selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#011e41] uppercase tracking-wider">
                      Service Demanded *
                    </label>
                    <select
                      value={newServiceId}
                      onChange={(e) => setNewServiceId(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                      id="new-review-service-id"
                    >
                      {SERVICES_LIST.map((serv) => (
                        <option key={serv.id} value={serv.id}>
                          {serv.name} (Starts from ₹{serv.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description Review Area */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#011e41] uppercase tracking-wider">
                      Your Comments & Review Details *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Share your experience... eg. how was the speed, did they fix the compressor safely, was the behavior friendly? (Min. 10 characters)"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white placeholder-gray-400 font-sans resize-none"
                      required
                      id="new-review-text"
                    />
                  </div>

                  {/* Form Actions Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Submit Review</span>
                    </button>
                  </div>

                </form>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Toast Success Notification popups after review is created */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 left-6 z-50 max-w-sm bg-slate-950 text-white border border-emerald-900 rounded-2xl p-4 shadow-2xl flex items-start space-x-3 select-none"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Check className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-black uppercase text-emerald-400 tracking-wider">
                  Review Received Successfully
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Thank you for submission. Your verified review is now actively rendered in the dispatch database list below!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
