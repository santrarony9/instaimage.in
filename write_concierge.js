const fs = require('fs');

const code = `
"use client";
import React, { useState } from "react";
import { Camera, Video, Sparkles, Plane, BookImage, ArrowRight, CheckCircle2, Calculator } from "lucide-react";
import Link from "next/link";

const EVENT_TYPES = [
  { id: "wedding", label: "Wedding", icon: Camera, basePrice: 10000 },
  { id: "prewedding", label: "Pre-Wedding", icon: Camera, basePrice: 8000 },
  { id: "birthday", label: "Birthday", icon: Sparkles, basePrice: 3000 },
  { id: "corporate", label: "Corporate", icon: Video, basePrice: 5000 },
];

const DURATIONS = [
  { id: "2h", label: "2 Hours", multiplier: 1, desc: "Quick Shoot" },
  { id: "4h", label: "4 Hours", multiplier: 1.5, desc: "Half Day" },
  { id: "8h", label: "8 Hours", multiplier: 2.5, desc: "Full Day" },
];

const ADDONS = [
  { id: "drone", label: "Drone Pilot", icon: Plane, price: 3000 },
  { id: "reels", label: "Reels Editor", icon: Video, price: 2000 },
  { id: "album", label: "Premium Album", icon: BookImage, price: 4500 },
];

export function SmartConcierge() {
  const [eventType, setEventType] = useState("wedding");
  const [duration, setDuration] = useState("4h");
  const [selectedAddons, setSelectedAddons] = useState([]);

  const toggleAddon = (id) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const currentEvent = EVENT_TYPES.find(e => e.id === eventType) || EVENT_TYPES[0];
  const currentDuration = DURATIONS.find(d => d.id === duration) || DURATIONS[1];
  
  const baseTotal = currentEvent.basePrice * currentDuration.multiplier;
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = ADDONS.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);
  
  const estimatedTotal = baseTotal + addonsTotal;

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row relative z-50">
      
      <div className="flex-1 p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">Build Your Custom Shoot</h2>
            <p className="text-sm text-gray-500 font-medium">Our smart system calculates the perfect package instantly.</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span> 
            What is the occasion?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EVENT_TYPES.map(type => (
              <button 
                key={type.id}
                onClick={() => setEventType(type.id)}
                className={"p-3 rounded-xl border-2 text-left transition-all " + (eventType === type.id ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200 bg-white")}
              >
                <type.icon className={"w-5 h-5 mb-2 " + (eventType === type.id ? "text-blue-600" : "text-gray-400")} />
                <div className={"font-bold text-sm " + (eventType === type.id ? "text-blue-900" : "text-gray-700")}>{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span> 
            How long do you need us?
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {DURATIONS.map(dur => (
              <button 
                key={dur.id}
                onClick={() => setDuration(dur.id)}
                className={"p-3 rounded-xl border-2 text-center transition-all " + (duration === dur.id ? "border-indigo-600 bg-indigo-50/50" : "border-gray-100 hover:border-gray-200 bg-white")}
              >
                <div className={"font-black text-lg " + (duration === dur.id ? "text-indigo-600" : "text-gray-900")}>{dur.label}</div>
                <div className="text-[11px] text-gray-500 font-medium mt-0.5">{dur.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="bg-gray-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span> 
            Magic Add-ons (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ADDONS.map(addon => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <button 
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={"p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all " + (isSelected ? "border-emerald-500 bg-emerald-50/50" : "border-gray-100 hover:border-gray-200 bg-white")}
                >
                  <div className={"w-8 h-8 rounded-lg flex items-center justify-center " + (isSelected ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                    <addon.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={"font-bold text-sm " + (isSelected ? "text-emerald-900" : "text-gray-700")}>{addon.label}</div>
                    <div className="text-xs text-gray-500">+₹{addon.price.toLocaleString("en-IN")}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <div className="w-full lg:w-[380px] bg-gray-900 p-8 flex flex-col justify-between text-white">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-300 mb-6 border border-white/10">
            <Sparkles className="w-3 h-3" /> Smart Estimate
          </div>
          
          <h3 className="text-3xl font-black text-white mb-2 tracking-tight">₹{estimatedTotal.toLocaleString("en-IN")}</h3>
          <p className="text-gray-400 text-sm font-medium mb-8">Estimated cost based on your custom requirements.</p>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{currentEvent.label} ({currentDuration.label})</span>
              <span className="font-bold text-white">₹{baseTotal.toLocaleString("en-IN")}</span>
            </div>
            {selectedAddons.map(id => {
              const addon = ADDONS.find(a => a.id === id);
              if (!addon) return null;
              return (
                <div key={id} className="flex justify-between text-sm">
                  <span className="text-gray-400">{addon.label}</span>
                  <span className="font-bold text-white">+₹{addon.price.toLocaleString("en-IN")}</span>
                </div>
              );
            })}
          </div>
          <div className="w-full h-px bg-white/10 my-6"></div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> No hidden fees or surprises.
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Pay only 20% to lock your date.
            </li>
          </ul>
        </div>

        <Link 
          href={"/services?category=" + currentEvent.label.replace(" ", "+")}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgb(37,99,235,0.4)]"
        >
          Find Available Pros <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

    </div>
  );
}
`

fs.writeFileSync('d:/anti gravity/InstaImage_Source_Code (1)/frontend/src/components/ui/SmartConcierge.tsx', code);
