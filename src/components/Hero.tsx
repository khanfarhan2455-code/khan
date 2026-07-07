import { motion } from "motion/react";
import {
  Award,
  BadgeCheck,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { BRAND_CONTACT } from "../data";
// @ts-ignore
import heroImg from "../assets/images/foam_jet_clean_ac_1781803680113.jpg";

export default function Hero() {
  const scrollToServices = () => {
    const section = document.getElementById("services");
    if (!section) return;

    const offset = 85;
    const top =
      section.getBoundingClientRect().top +
      window.pageYOffset -
      offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  return (
    <section
      className="relative overflow-hidden py-24 px-6 text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(1,30,65,.80), rgba(1,30,65,.90)), url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto max-w-6xl">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6 }}
          className="text-center"
        >

          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-400/30 rounded-full px-5 py-2 mb-6">
            <MapPin size={16} />
            <span className="text-sm font-semibold">
              Serving Oshiwara • Andheri • Mumbai
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black tracking-tight">
            RAPID COOL
          </h1>

          <h2 className="text-xl lg:text-2xl tracking-[0.4em] text-blue-300 mt-2 uppercase">
            SERVICES
          </h2>

          <p className="mt-8 text-lg text-slate-200 max-w-3xl mx-auto leading-8">
            Professional AC, Refrigerator, Washing Machine &
            Microwave Repair with fast doorstep service,
            genuine spare parts and experienced technicians
            across Mumbai.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

            <button
              onClick={scrollToServices}
              className="bg-amber-500 hover:bg-amber-600 text-[#011e41] px-8 py-4 rounded-xl font-bold transition"
            >
              Explore Services
            </button>

            <a
              href={`tel:${BRAND_CONTACT.phone}`}
              className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[#011e41] transition flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Call Now
            </a>

          </div>          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-16">

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <ShieldCheck className="w-10 h-10 text-sky-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg">Genuine Parts</h3>
              <p className="text-sm text-slate-300 mt-2">
                High-quality OEM spare parts for reliable repairs.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <Award className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg">Certified Experts</h3>
              <p className="text-sm text-slate-300 mt-2">
                Skilled technicians with years of experience.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <BadgeCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg">Affordable Pricing</h3>
              <p className="text-sm text-slate-300 mt-2">
                Transparent pricing with no hidden charges.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <Clock className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg">Fast Response</h3>
              <p className="text-sm text-slate-300 mt-2">
                Same-day and emergency doorstep service available.
              </p>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}
