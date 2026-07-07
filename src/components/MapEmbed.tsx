import { useState } from "react";
import { MapPin, Navigation, Info, ShieldAlert, CheckCircle2, ChevronRight, Globe, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";

// Mumbai service coverage areas centered on Andheri West / Oshiwara HQ
const COVERAGE_REGIONS = [
  { name: "Oshiwara & Andheri West (HQ)", time: "15-30 Mins", type: "HQ / Priority Zone", lat: 19.1363, lng: 72.8358, color: "from-blue-600 to-indigo-600" },
  { name: "Juhu & Versova", time: "30 Mins", type: "Express Zone", lat: 19.1025, lng: 72.8273, color: "from-cyan-500 to-blue-500" },
  { name: "Bandra & Santacruz", time: "40 Mins", type: "Standard Zone", lat: 19.0596, lng: 72.8295, color: "from-sky-500 to-sky-600" },
  { name: "Goregaon & Malad", time: "45 Mins", type: "Standard Zone", lat: 19.1634, lng: 72.8412, color: "from-teal-500 to-teal-600" },
  { name: "Powai & Vikhroli", time: "50 Mins", type: "Extended Zone", lat: 19.1176, lng: 72.9060, color: "from-emerald-500 to-emerald-600" },
  { name: "Borivali West", time: "60 Mins", type: "Extended Zone", lat: 19.2291, lng: 72.8475, color: "from-amber-500 to-amber-600" }
];

export default function MapEmbed() {
  const [selectedRegion, setSelectedRegion] = useState(COVERAGE_REGIONS[0]);
  const [mapType, setMapType] = useState<"visual" | "google">("visual");
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);

  const GOOGLE_MAPS_REDIRECT_URL = "https://maps.app.goo.gl/p5zevTKywUAPwUti7";

  // Expose the API key definition as required by the GMP platform rules
  const GOOGLE_MAPS_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    "";

  const hasValidKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== "YOUR_API_KEY" && GOOGLE_MAPS_KEY.trim() !== "";

  // Helper coordinate centered exactly near BB-12 BMC Colony, Oshiwara, Andheri West
  const defaultCenter = { lat: 19.1363, lng: 72.8358 };

  return (
    <section id="coverage" className="py-20 bg-slate-50 border-t border-gray-150 relative">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Section Heading */}
        <div className="text-center mb-12">
          <span className="text-blue-700 text-[10px] font-black tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3 font-mono border border-blue-100">
            LOCALIZATION & SERVICE REACH
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#011e41] uppercase tracking-tight">
            Our Mumbai Service Reach
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-xs sm:text-sm mt-3 leading-relaxed">
            Headquartered in Andheri West, our mobile HVAC engineers and appliance specialists cover a 20KM radial reach to maintain direct rapid response times.
          </p>
        </div>

        {/* View mode selectors */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm flex items-center space-x-1">
            <button
              onClick={() => setMapType("visual")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                mapType === "visual"
                  ? "bg-[#011e41] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Reach coverage map</span>
            </button>
            <button
              onClick={() => setMapType("google")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                mapType === "google"
                  ? "bg-[#011e41] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Interactive Google Map</span>
            </button>
          </div>
        </div>

        {/* Main interactive section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: List of dispatch regions and zone selection */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-[#011e41] uppercase tracking-wider">
                  Guaranteed Dispatch Hubs
                </h3>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                  CLICK ZONE TO HIGHLIGHT AREA
                </p>
              </div>

              <div className="space-y-2">
                {COVERAGE_REGIONS.map((region) => {
                  const isSelected = region.name === selectedRegion.name;
                  return (
                    <button
                      key={region.name}
                      onClick={() => setSelectedRegion(region)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between cursor-pointer group ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-400 text-blue-900"
                          : "border-gray-100 hover:bg-slate-50 hover:border-gray-200"
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="block font-extrabold text-xs text-gray-900 leading-none group-hover:text-blue-700 transition-colors">
                          {region.name}
                        </span>
                        <span className="block text-[10px] text-gray-550">
                          {region.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-[10px] font-black font-mono border bg-white px-2 py-0.5 rounded-md leading-none text-blue-700 shadow-sm">
                          {region.time}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick service dispatch guarantee banner */}
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl space-y-2.5">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider font-mono">
                    Dispatch Pledge
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed font-sans font-medium">
                  Our technicians are stationed locally throughout Northwest Mumbai to bypass heavy traffic and arrive exactly on your selected time block.
                </p>
              </div>

              <a
                href={GOOGLE_MAPS_REDIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#011e41] text-[#38bdf8] py-3.5 px-4 rounded-2xl text-center font-extrabold text-[11px] uppercase tracking-widest block hover:bg-[#0f5fc2] hover:text-white transition-all duration-300 border border-blue-900 cursor-pointer shadow-lg active:scale-98"
              >
                📍 Open Google Maps Directions
              </a>
            </div>
          </div>

          {/* Right Column: Visual Coverage Map / Google Live Map Frame */}
          <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden border-4 border-white shadow-xl min-h-[420px] flex flex-col relative group">
            
            <AnimatePresence mode="wait">
              {mapType === "visual" ? (
                /* Custom Reach Visualizer (Elegant, bespoke SVG design of Mumbai coastline and regions) */
                <motion.div
                  key="visual"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-[#011e41] flex flex-col justify-between p-6 overflow-hidden"
                >
                  {/* Subtle Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

                  {/* Top Status Bar */}
                  <div className="relative z-10 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center space-x-2 bg-slate-950/75 border border-slate-800/40 px-3.5 py-1.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] text-slate-300 font-mono font-bold uppercase tracking-wider">
                        Andheri West HQ Hub: ONLINE
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      Standard Max Limit: 20 KM
                    </span>
                  </div>

                  {/* SVG coastline and point network representation */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-full flex items-center justify-center pointer-events-none">
                    <svg className="w-full h-4/5 filter drop-shadow-2xl" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                      
                      {/* Coastline visual backdrop */}
                      <path d="M50 10 C 60 70, 70 110, 80 140 C 90 170, 95 200, 105 230 C 112 250, 110 270, 120 295" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
                      <path d="M50 10 C 60 70, 70 110, 80 140 C 90 170, 95 200, 105 230 C 112 250, 110 270, 120 295" stroke="#334155" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

                      {/* Animated reach circles with radial fade originating from Andheri West (220, 140) */}
                      <circle cx="220" cy="140" r="115" stroke="#0f5fc2" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" className="animate-spin" style={{ transformOrigin: "220px 140px", animationDuration: "35s" }} />
                      <circle cx="220" cy="140" r="85" stroke="#0f5fc2" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                      
                      {/* Pulse circle */}
                      <circle cx="220" cy="140" r="45" fill="url(#radialGlow)" opacity="0.25" />
                      <circle cx="220" cy="140" r="20" stroke="#0f5fc2" strokeWidth="1" opacity="0.5" />

                      {/* Defined paths linking active nodes */}
                      {COVERAGE_REGIONS.map((region, i) => {
                        const isHQ = i === 0;
                        // Approximate radial coordinates on mock preview mapped relative to center
                        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 6;
                        const dist = isHQ ? 0 : 50 + (i % 3) * 20;
                        const x = 220 + dist * Math.cos(angle);
                        const y = 140 + dist * Math.sin(angle);

                        return (
                          <g key={region.name}>
                            {/* Link lines back to HQ */}
                            {!isHQ && (
                              <line x1="220" y1="140" x2={x} y2={y} stroke={region.name === selectedRegion.name ? "#38bdf8" : "#1e293b"} strokeWidth={region.name === selectedRegion.name ? "1.5" : "1"} opacity={region.name === selectedRegion.name ? "0.9" : "0.5"} />
                            )}
                            
                            {/* Spot interactive nodes */}
                            <circle cx={x} cy={y} r={region.name === selectedRegion.name ? "9" : "4.5"} fill={region.name === selectedRegion.name ? "#38bdf8" : "#1e293b"} stroke={region.name === selectedRegion.name ? "rgba(56, 189, 248, 0.3)" : "rgba(30, 41, 59, 0.4)"} strokeWidth="5" />
                          </g>
                        );
                      })}

                      <defs>
                        <radialGradient id="radialGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#0f5fc2" />
                          <stop offset="100%" stopColor="#0f5fc2" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Active highlight card block in absolute overlay */}
                  <div className="relative z-10 self-end w-full max-w-sm bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl border border-slate-800/60 shadow-xl space-y-2">
                    <span className="text-[9px] font-black text-sky-400 font-mono tracking-widest uppercase">
                      Selected Service Reach Sector
                    </span>
                    <h4 className="text-white font-extrabold text-sm uppercase flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#38bdf8]" />
                      <span>{selectedRegion.name}</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
                      <div>
                        <span className="block text-[8px] text-slate-400 uppercase tracking-wider font-mono">
                          Arrival Time
                        </span>
                        <span className="text-amber-400 font-black text-xs uppercase font-mono">
                          {selectedRegion.time}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 uppercase tracking-wider font-mono">
                          Sector Class
                        </span>
                        <span className="text-slate-200 font-black text-[10px] uppercase">
                          {selectedRegion.type}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between">
                      <span className="text-[9px] text-slate-350 italic font-mono">BB-12 BMC Colony, Oshiwara</span>
                      <a
                        href={GOOGLE_MAPS_REDIRECT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] bg-blue-600/80 hover:bg-blue-600 text-white font-extrabold uppercase tracking-wide font-mono px-2.5 py-1 rounded-md border border-white/5 flex items-center transition"
                      >
                        Open In Google Maps ↗
                      </a>
                    </div>
                  </div>

                </motion.div>
              ) : (
                /* Google Live Map wrapper following skill instructions carefully */
                <motion.div
                  key="google"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900 w-full h-full flex flex-col justify-between"
                >
                  {!hasValidKey ? (
                    // Explicit constitution rule 1C Required: Setup tutorial UI in map container when hasValidKey is false
                    <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-950 text-white select-text">
                      <div className="max-w-md space-y-4">
                        <div className="w-12 h-12 rounded-full border-2 border-amber-500/40 bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2">
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-black uppercase text-amber-400 tracking-wide font-sans">
                          Google Maps API Secret Required
                        </h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          The interactive map requires a Google Maps Platform API key. You do not need to reload the page once set up.
                        </p>
                        <div className="text-left bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-xs space-y-2.5 font-sans">
                          <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                            <strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Get an API Key</a>
                          </p>
                          <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                            <strong>Step 2:</strong> Add your key as a secret in AI Studio:
                          </p>
                          <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[10px]">
                            <li>Click the <strong>Settings</strong> (⚙️ gear icon, top-right)</li>
                            <li>Select <strong>Secrets</strong> option</li>
                            <li>Name your secret <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
                            <li>Paste your API key and press <strong>Enter</strong> to auto-build</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // vis.gl SDK rendering centered at Andheri West, Mumbai
                    <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
                      <Map
                        defaultCenter={defaultCenter}
                        defaultZoom={13}
                        mapId="DEMO_MAP_ID"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: '100%', height: '100%' }}
                      >
                        {/* Interactive marker matching standard guidelines */}
                        <AdvancedMarker 
                          position={defaultCenter}
                          onClick={() => setInfoWindowOpen(!infoWindowOpen)}
                        >
                          <Pin background="#0f5fc2" glyphColor="#ffffff" borderColor="#011e41" />
                        </AdvancedMarker>

                        {infoWindowOpen && (
                          <InfoWindow 
                            position={defaultCenter} 
                            onCloseClick={() => setInfoWindowOpen(false)}
                          >
                            <div className="p-3 text-[#011e41] font-sans max-w-[220px] space-y-1.5 select-text">
                              <h4 className="font-black text-xs uppercase tracking-tight">Rapid Cool HQ</h4>
                              <p className="text-[10px] leading-relaxed text-gray-600">
                                BB-12 BMC Colony, Near Heera Panna Mall, Oshiwara, Andheri West, Mumbai - 400102
                              </p>
                              <div className="flex flex-col gap-1">
                                <span className="block text-[8px] font-mono font-black border bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded uppercase max-w-max">
                                  HQ Dispatches
                                </span>
                                <a 
                                  href={GOOGLE_MAPS_REDIRECT_URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[#0f5fc2] hover:underline font-bold"
                                >
                                  Get Directions ↗
                                </a>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </Map>
                    </APIProvider>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>

        </div>

        {/* Footnote of coverage zone boundaries */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-gray-150 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-black text-xs text-slate-900 uppercase tracking-tight">Need service outside this zone?</span>
              <p className="text-[11px] text-gray-550 leading-relaxed max-w-xl">
                We periodically dispatch HVAC technicians to adjacent zones like Powai, Borivali, or Thane for pre-scheduled industrial service appointments. Contact us directly to confirm support.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-xs font-black uppercase text-blue-700 hover:text-blue-900 tracking-wider flex items-center space-x-1 whitespace-nowrap bg-blue-50/50 hover:bg-blue-50 px-4 py-2 border border-blue-100 rounded-lg cursor-pointer transition shrink-0"
          >
            <span>Book Visit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
