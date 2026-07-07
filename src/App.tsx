/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MapEmbed from "./components/MapEmbed";
import Reviews from "./components/Reviews";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import WhatsAppFAB from "./components/WhatsAppFAB";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from "./components/AdminDashboard";
import { SERVICES_LIST, ADDONS_LIST } from "./data";

export default function App() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [express, setExpress] = useState<boolean>(false);
  const [warranty, setWarranty] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState(
    window.location.hash === "#admin"
  );

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === "#admin");
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const currentService = SERVICES_LIST.find(
    (s) => s.id === selectedServiceId
  );

  const basePrice = currentService ? currentService.price : 0;

  const expressAddon = ADDONS_LIST.find(
    (a) => a.id === "expressService"
  );

  const warrantyAddon = ADDONS_LIST.find(
    (a) => a.id === "extendedWarranty"
  );

  const expressPrice =
    express && expressAddon ? expressAddon.price : 0;

  const warrantyPrice =
    warranty && warrantyAddon ? warrantyAddon.price : 0;

  const totalEstimate =
    basePrice > 0
      ? basePrice + expressPrice + warrantyPrice
      : 0;

  if (isAdminView) {
    return (
      <AdminDashboard
        onClose={() => {
          window.location.hash = "";
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-blue-600 selection:text-white antialiased">

      {/* Header */}
      <Header />

      {/* Hero */}
      <Hero />

      {/* Schedule Visit Form */}
      <ContactForm
        selectedServiceId={selectedServiceId}
        setSelectedServiceId={setSelectedServiceId}
        express={express}
        setExpress={setExpress}
        warranty={warranty}
        setWarranty={setWarranty}
        totalEstimate={totalEstimate}
      />

      {/* Google Map */}
      <MapEmbed />

      {/* Customer Reviews */}
      <Reviews />

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsAppFAB />

      {/* Scroll To Top */}
      <ScrollToTop />

    </div>
  );
}
