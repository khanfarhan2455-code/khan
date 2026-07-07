import { Wind, ThermometerSnowflake, Disc3, Zap, ArrowUpRight, ShieldCheck, CheckCircle2, Award, HeartHandshake, ShieldAlert } from "lucide-react";
import { SERVICES_LIST } from "../data";
import { motion } from "motion/react";

// @ts-ignore
import imgGauges from "../assets/images/ac_outdoor_gauges_1781803695824.jpg";
// @ts-ignore
import imgRepair from "../assets/images/technician_repair_1781803712309.jpg";
// @ts-ignore
import imgMockup from "../assets/images/appliance_mockup_1781803732478.jpg";

interface ServicesProps {
  onSelectService: (serviceId: string) => void;
}

export default function Services({ onSelectService }: ServicesProps) {
  // Map identifier strings to beautiful animated icons
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Wind":
        return <Wind className="w-8 h-8 text-[#0f5fc2] stroke-[2]" />;
      case "ThermometerSnowflake":
        return <ThermometerSnowflake className="w-8 h-8 text-[#38bdf8] stroke-[2]" />;
      case "Tv":
        return <Disc3 className="w-8 h-8 text-indigo-600 stroke-[2]" />;
      case "Zap":
        return <Zap className="w-8 h-8 text-amber-500 stroke-[2]" />;
      default:
        return <Wind className="w-8 h-8 text-blue-600" />;
    }
  };

  const handleServiceClick = (id: string) => {
    onSelectService(id);
    const element = document.getElementById("contact");
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

  const brandsList = [
    { name: "LG", type: "Air Conditioning / Refrigerators" },
    { name: "Panasonic", type: "Microwaves / AC" },
    { name: "Samsung", type: "Washing Machines / Fridges" },
    { name: "Godrej", type: "Refrigerators / AC" },
    { name: "Whirlpool", type: "Washing Machines" },
    { name: "Haier", type: "Fridges / Appliances" },
    { name: "Voltas", type: "Premium Air Conditioning" },
    { name: "IFB", type: "Microwave / Washing Machine" },
    { name: "Philips", type: "Kitchen Ovens" },
    { name: "Bajaj", type: "Heaters & Cookers" },
    { name: "Morphy Richards", type: "Oven Repairs" },
    { name: "& more brands", type: "All Major Appliance Brands" }
  ];

  return (
    <section id="services" className="py-24 bg-white border-y border-gray-150">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Header content */}
        <div className="text-center mb-16">
          <span className="text-blue-700 text-xs font-black tracking-widest uppercase bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-3 font-mono border border-blue-100">
            Certified Care
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#011e41] tracking-tight mb-4">
            Our Core Doorstep Offerings
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
            Professional, certified, and fully background-verified Mumbai technicians. We use authentic spares with upfront flat-rate diagnostics.
          </p>
        </div>

        {/* Dynamic Grid of Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {SERVICES_LIST.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-50/50 p-6 rounded-2xl border border-gray-150 hover:border-blue-400 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between group h-full relative"
            >
              {/* Gold Top Feature Strip on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-amber-500 opacity-0 group-hover:opacity-100 rounded-t-2xl transition-opacity" />

              <div>
                {/* Icon Container with match colors */}
                <div className="w-14 h-14 bg-white border border-gray-200 text-blue-600 rounded-2xl flex items-center justify-center mb-5 text-xl group-hover:bg-[#0248a3] group-hover:text-white transition-all duration-300 shadow-sm">
                  {renderIcon(service.iconName)}
                </div>

                <h3 className="text-base font-black text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight mb-2">
                  {service.name}
                </h3>

                <p className="text-gray-550 text-xs leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between mt-auto font-sans">
                <span className="font-mono text-[10px] text-gray-500 uppercase">
                  Visiting Charge: <strong className="text-gray-950 font-black text-sm block">₹{service.price}</strong>
                </span>
                <button
                  onClick={() => handleServiceClick(service.id)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-black uppercase tracking-wider flex items-center space-x-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-150 hover:border-blue-400 transition"
                  id={`srv-get-estimate-${service.id}`}
                >
                  <span>Select</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Visiting Charge Clarity Notice */}
        <div className="bg-sky-50/50 border border-sky-200/60 rounded-2xl p-5 mb-16 flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-10 h-10 rounded-xl bg-[#0f5fc2]/10 text-[#0f5fc2] flex items-center justify-center text-lg shrink-0 font-bold">
            ℹ️
          </div>
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[10px] font-black uppercase text-[#011e41] tracking-wider block font-mono">
              Transparent Pricing & Visiting Charge Policy
            </span>
            <p className="text-gray-600 text-xs leading-relaxed">
              Every doorstep visit is subject to the specified <strong>Visiting & Inspection Charge</strong> (such as the AC Rate of ₹299). This covers diagnostic testing by a certified engineer at your home. <strong>Crucial Benefit:</strong> If you proceed with our recommended repairs, this visiting charge is fully adjusted and waived from your final service bill!
            </p>
          </div>
        </div>

        {/* Brand-New Section: Procedural & Safety Standards Showcase (Addresses Screenshot Requirements!) */}
        <div className="border-t border-gray-150 pt-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Core Strengths and diagnostic photography of pressure tests */}
            <div className="md:col-span-6 space-y-8">
              <div>
                <span className="text-amber-700 text-[10px] font-black tracking-widest uppercase bg-amber-50 px-3.5 py-1 rounded-full inline-block mb-3 font-mono border border-amber-200">
                  Precision Equipment
                </span>
                <h3 className="text-2xl font-black text-[#011e41] uppercase tracking-tight">
                  State-Of-The-Art Equipment
                </h3>
                <p className="text-gray-600 text-xs mt-3 leading-relaxed">
                  We diagnose every appliance issue using proper manifold gauges and digital insulation multimeters. This ensures diagnostic accuracy is 100% on target before changing parts.
                </p>
              </div>

              {/* Gauges Image Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-150 aspect-[4/3] bg-slate-900 group">
                <img
                  src={imgGauges}
                  alt="Professional AC Pressure Testing Manifold Gauges Diagnostics in Mumbai"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-5 flex flex-col justify-end">
                  <span className="text-[9px] font-bold text-amber-300 font-mono tracking-widest uppercase mb-1">
                    01. Diagnostic Phase
                  </span>
                  <h4 className="text-white font-extrabold text-sm uppercase">24-Point Sub-Zero Pressure Check</h4>
                  <p className="text-slate-300 text-[10px]">Real-time compressor diagnostics & gas charging calibration.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Expert technicians and board/circuit testing photography */}
            <div className="md:col-span-6 space-y-8">
              <div>
                <span className="text-blue-700 text-[10px] font-black tracking-widest uppercase bg-blue-50 px-3.5 py-1 rounded-full inline-block mb-3 font-mono border border-blue-100">
                  Expert Engineers
                </span>
                <h3 className="text-2xl font-black text-[#011e41] uppercase tracking-tight">
                  Background Verified Techs
                </h3>
                <p className="text-gray-600 text-xs mt-3 leading-relaxed">
                  Every Rapid Cool technician operates with full Skill Certification. We inspect circuits, components, and controllers systematically with zero shortcuts.
                </p>
              </div>

              {/* Technician Circuit Repair Image Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-150 aspect-[4/3] bg-slate-900 group">
                <img
                  src={imgRepair}
                  alt="Certified Service Engineer testing split AC electrical circuits"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-5 flex flex-col justify-end">
                  <span className="text-[9px] font-bold text-sky-300 font-mono tracking-widest uppercase mb-1">
                    02. Execution Phase
                  </span>
                  <h4 className="text-white font-extrabold text-sm uppercase">Motherboard & Component Calibrations</h4>
                  <p className="text-slate-300 text-[10px]">Only genuine brand-compliant original spare parts with serial verification.</p>
                </div>
              </div>
            </div>

          </div>
        </div>



        {/* Major Brand Service Coverage (Displays what brands we service based on input_file_6.png) */}
        <div className="mt-20 border-t border-gray-150 pt-16 text-center">
          <h3 className="text-xs font-black text-[#011e41] uppercase tracking-[0.2em] font-mono mb-8">
            Expertly Servicing All Major Appliance Brands
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {brandsList.map((brand) => (
              <div 
                key={brand.name} 
                className="bg-slate-50 border border-gray-150 px-4 py-3.5 rounded-xl text-center hover:bg-blue-50/20 hover:border-blue-300 transition-all duration-200"
              >
                <span className="block font-extrabold text-[#011e41] text-xs uppercase tracking-tight">
                  {brand.name}
                </span>
                <span className="block text-[8px] text-gray-500 font-mono uppercase mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  {brand.type}
                </span>
              </div>
            ))}
          </div>
          
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-6 font-mono font-bold">
            Disclaimer: All trademark logos belong to respective OEM owners. We are an independent multi-brand diagnostic service provider.
          </p>
        </div>

      </div>
    </section>
  );
}

