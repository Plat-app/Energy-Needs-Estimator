/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, RefreshCcw, ExternalLink, AlertTriangle, Monitor, Server, Wifi, Cpu, Zap, Activity, ChevronDown } from 'lucide-react';
import { DeviceLibItem, ListItem } from './types';

// ---------- Device Library (Categorized) ----------
const LIB: DeviceLibItem[] = [
  // Server
  { key: "server_1u-2u", name: "Server 1U/2U", defaultW: 500, warnAbove: 900 },
  { key: "nas2", name: "NAS 2‑bay", defaultW: 35, warnAbove: 120 },
  // Workstation
  { key: "desktop_office", name: "Desktop PC (Office)", defaultW: 120, warnAbove: 300 },
  { key: "gaming_mid", name: "Gaming PC (mid-range)", defaultW: 350, warnAbove: 800 },
  { key: "gaming_high", name: "Gaming PC (hi-end)", defaultW: 600, warnAbove: 1200 },
  { key: "laptop", name: "Φορτιστής Laptop", defaultW: 65, warnAbove: 180 },
  { key: "monitor_24", name: "Monitor 24\"", defaultW: 20, warnAbove: 80 },
  { key: "monitor_27", name: "Monitor 27\"", defaultW: 30, warnAbove: 120 }, 
  // Network
  { key: "router", name: "Router / Modem", defaultW: 12, warnAbove: 50 },
  { key: "wifi_ap", name: "Wi‑Fi Access Point", defaultW: 9, warnAbove: 40 },
  { key: "switch8", name: "Switch 8‑port (non‑PoE)", defaultW: 15, warnAbove: 60 },
  { key: "poe_cam", name: "PoE Camera", defaultW: 8, warnAbove: 20 },
  { key: "poe_ap", name: "PoE Access Point", defaultW: 15, warnAbove: 35 },
  { key: "voip_phone", name: "VoIP Phone", defaultW: 6, warnAbove: 15 },
  // Other (Office / Retail)
  { key: "inkjet_A4", name: "Εκτυπωτής Inkjet (A4)", defaultW: 150, warnAbove: 300 },
  { key: "tv_led_43", name: "LED TV 43\"", defaultW: 70, warnAbove: 250 },
  { key: "pos", name: "POS Terminal", defaultW: 25, warnAbove: 100 },
  { key: "receipt", name: "Θερμικός Εκτυπωτής Αποδείξεων", defaultW: 20, warnAbove: 80 },
  { key: "barcode", name: "Barcode Scanner", defaultW: 2, warnAbove: 20 },
  { key: "ext_drive", name: "Εξωτερικός HDD/SSD (USB)", defaultW: 8, warnAbove: 30 },
  { key: "led_lamp", name: "Λάμπα LED", defaultW: 20, warnAbove: 60 },
];

const CATEGORIES = [
  { id: 'server', label: 'Server', icon: Server },
  { id: 'workstation', label: 'Workstation', icon: Monitor },
  { id: 'network', label: 'Δίκτυο', icon: Wifi },
  { id: 'other', label: 'Διάφορα', icon: Cpu },
];

const HEADROOM_OPTIONS = [0, 10, 20, 30];
const STORAGE_KEY = "tescom_load_builder_v1";

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function App() {
  const [headroom, setHeadroom] = useState(20);
  const [pf, setPf] = useState("0.9");
  const [items, setItems] = useState<ListItem[]>([]);
  const [libKey, setLibKey] = useState(LIB[0].key);
  const [customName, setCustomName] = useState("");
  const [customW, setCustomW] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [activeCategory, setActiveCategory] = useState('server');
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Clear highlight after delay
  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => setHighlightId(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [highlightId]);

  // Load/Save state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          setItems(parsed.items);
        }
        if (parsed && typeof parsed.headroom === "number") setHeadroom(parsed.headroom);
        if (parsed && parsed.pf) setPf(parsed.pf);
      }
    } catch (_) { /* noop */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, headroom, pf }));
    } catch (_) { /* noop */ }
  }, [items, headroom, pf]);

  const totalW = useMemo(() => {
    return items.reduce((acc, it) => acc + Math.max(0, Math.round(Number(it.w) || 0)) * Math.max(0, Number(it.qty) || 0), 0);
  }, [items]);

  const totalWithHeadroom = useMemo(() => {
    return Math.round(totalW * (1 + headroom / 100));
  }, [totalW, headroom]);

  const parsedPf = useMemo(() => {
    const val = parseFloat(pf.replace(',', '.'));
    return isNaN(val) || val <= 0 ? 0.9 : val;
  }, [pf]);

  function addFromLibrary() {
    const lib = LIB.find((x) => x.key === libKey);
    if (!lib) return;

    setItems((xs) => {
      const existingIdx = xs.findIndex(it => it.name === lib.name && it.w === lib.defaultW);
      if (existingIdx !== -1) {
        const next = [...xs];
        const targetId = next[existingIdx].id;
        next[existingIdx] = { ...next[existingIdx], qty: next[existingIdx].qty + 1 };
        setTimeout(() => setHighlightId(targetId), 0);
        return next;
      }
      const newId = uid();
      setTimeout(() => setHighlightId(newId), 0);
      return [
        ...xs,
        { id: newId, name: lib.name, w: lib.defaultW, qty: 1, warnAbove: lib.warnAbove, source: "lib" },
      ];
    });
  }

  function addCustom() {
    const w = Math.round(Number(customW));
    const name = customName.trim();
    if (!name || isNaN(w) || w <= 0) return;

    setItems((xs) => {
      const existingIdx = xs.findIndex(it => it.name === name && it.w === w);
      if (existingIdx !== -1) {
        const next = [...xs];
        const targetId = next[existingIdx].id;
        next[existingIdx] = { 
          ...next[existingIdx], 
          qty: next[existingIdx].qty + Math.max(1, Number(customQty) || 1) 
        };
        setTimeout(() => setHighlightId(targetId), 0);
        return next;
      }
      const newId = uid();
      setTimeout(() => setHighlightId(newId), 0);
      return [
        ...xs,
        { id: newId, name, w, qty: Math.max(1, Number(customQty) || 1), warnAbove: 400, source: "custom" },
      ];
    });
    setCustomName("");
    setCustomW("");
    setCustomQty(1);
  }

  function updateItem(id: string, patch: Partial<ListItem>) {
    setItems((xs) => xs.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems((xs) => xs.filter((it) => it.id !== id));
  }

  function changeCategory(catId: string) {
    setActiveCategory(catId);
    const firstInCat = LIB.find(item => {
      if (catId === 'server') return item.key.includes('server') || item.key.includes('nas');
      if (catId === 'network') return item.key.includes('router') || item.key.includes('switch') || item.key.includes('poe') || item.key.includes('wifi') || item.key.includes('phone');
      if (catId === 'other') return item.key.includes('inkjet') || item.key.includes('tv') || item.key.includes('pos') || item.key.includes('receipt') || item.key.includes('barcode') || item.key.includes('ext_drive') || item.key.includes('lamp');
      if (catId === 'workstation') return ['desktop_office', 'gaming_mid', 'gaming_high', 'laptop', 'monitor_24', 'monitor_27'].includes(item.key);
      return true;
    });
    if (firstInCat) setLibKey(firstInCat.key);
  }

  function clearAll() {
    if (items.length > 0) {
      setItems([]);
      setHeadroom(20);
      setLibKey(LIB[0].key);
      setCustomName("");
      setCustomW("");
      setCustomQty(1);
      setActiveCategory('server');
      localStorage.removeItem(STORAGE_KEY);
      // Hard reload to ensure a fresh state as requested
      setTimeout(() => window.location.reload(), 100);
    }
  }

  function openUpsFinder() {
    window.open("https://b2b.tescom.gr/shop/category/ups-1", "_blank");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans p-4 md:p-8 selection:bg-[#22d3ee]/20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#22d3ee] rounded-xl flex items-center justify-center shadow-lg shadow-[#22d3ee]/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Εκτίμηση αναγκών φορτίου</h1>
              <p className="text-[10px] tracking-[0.2em] font-black text-slate-400">Tescom Hellas</p>
            </div>
          </div>
          <img 
            src="https://tescom-ups.gr/wp-content/uploads/2021/04/tescom-logo.png" 
            alt="Tescom Logo" 
            className="h-8 md:h-10 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column: Device Selection */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-400 mb-6">Συσκευές</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => changeCategory(cat.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                      activeCategory === cat.id 
                      ? "bg-slate-50 border-slate-900 text-slate-900 shadow-sm" 
                      : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? "text-slate-900" : "text-slate-400"}`} />
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select 
                        value={libKey} 
                        onChange={(e) => setLibKey(e.target.value)} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:border-[#22d3ee] focus:ring-4 focus:ring-[#22d3ee]/10 outline-none cursor-pointer appearance-none transition-all pr-10"
                      >
                        {LIB.filter(item => {
                          if (activeCategory === 'server') return item.key.includes('server') || item.key.includes('nas');
                          if (activeCategory === 'network') return item.key.includes('router') || item.key.includes('switch') || item.key.includes('poe') || item.key.includes('wifi') || item.key.includes('phone');
                          if (activeCategory === 'other') return item.key.includes('inkjet') || item.key.includes('tv') || item.key.includes('pos') || item.key.includes('receipt') || item.key.includes('barcode') || item.key.includes('ext_drive') || item.key.includes('lamp');
                          if (activeCategory === 'workstation') return ['desktop_office', 'gaming_mid', 'gaming_high', 'laptop', 'monitor_24', 'monitor_27'].includes(item.key);
                          return true;
                        }).map(d => (
                          <option key={d.key} value={d.key}>{d.name} ({d.defaultW}W)</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button 
                      onClick={addFromLibrary}
                      className="w-12 h-[42px] bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm flex items-center justify-center shrink-0"
                    >
                      <Plus className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 mb-4">Προσαρμοσμένη είσοδος</h3>
                  <div className="space-y-3">
                    <input 
                      placeholder="Όνομα συσκευής" 
                      value={customName} 
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 placeholder:text-slate-300 focus:border-[#22d3ee] focus:ring-4 focus:ring-[#22d3ee]/10 outline-none transition-all" 
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-[2]">
                        <input 
                          type="number" 
                          placeholder="Watts" 
                          value={customW} 
                          onChange={(e) => setCustomW(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 placeholder:text-slate-300 focus:border-[#22d3ee] focus:ring-4 focus:ring-[#22d3ee]/10 outline-none transition-all pr-8" 
                        />
                        <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">W</span>
                      </div>
                      <input 
                        type="number" 
                        value={customQty} 
                        onChange={(e) => setCustomQty(Number(e.target.value))}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 text-center outline-none focus:border-[#22d3ee] transition-all" 
                      />
                      <button 
                        onClick={addCustom}
                        className="w-12 h-[42px] bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200 flex items-center justify-center shrink-0"
                      >
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & UPS Finder */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col">
            <div className="flex-1 space-y-10">
              <div>
                <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-400 mb-6">Συνολικό φορτίο</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black text-slate-900 tabular-nums tracking-tighter">
                    {Math.round(totalWithHeadroom).toLocaleString()}
                  </span>
                  <span className="text-2xl font-bold text-[#22d3ee]">W</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Power factor</div>
                  <input 
                    type="text"
                    value={pf}
                    onChange={(e) => setPf(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-black text-slate-900 outline-none focus:border-[#22d3ee] transition-all text-center"
                  />
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Εκτ. VA</div>
                  <div className="text-xl font-black text-slate-900 tabular-nums">
                    {Math.round(totalWithHeadroom / parsedPf).toLocaleString()} 
                    <span className="text-[10px] font-bold text-slate-400 ml-1">VA</span>
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[90px]">
                  <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Καθαρή ισχύς</div>
                  <div className="text-xl font-black text-slate-900 tabular-nums">
                    {totalW.toLocaleString()} 
                    <span className="text-[10px] font-bold text-slate-400 ml-1">W</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Περιθώριο ασφαλείας</div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 20, 30].map(m => (
                    <button 
                      key={m}
                      onClick={() => setHeadroom(m)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                        headroom === m 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-200" 
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                      }`}
                    >
                      {m}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={openUpsFinder}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-900 py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all group h-[52px]"
              >
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                Εύρεση κατάλληλου UPS
              </button>
            </div>
          </div>

          {/* Full Width Bottom: Device List */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 py-8 shadow-sm flex-1 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between mb-8 px-8">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-400">Λίστα συσκευών</h2>
                {items.length > 0 && (
                  <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-full tracking-wider border border-emerald-100">
                    {items.length} {items.length === 1 ? 'συσκευή' : 'συσκευές'}
                  </span>
                )}
              </div>
              <button 
                onClick={clearAll} 
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl border border-slate-200 hover:border-red-100 transition-all active:scale-95 group/reset font-bold text-xs"
              >
                <RefreshCcw className="w-3.5 h-3.5 group-hover/reset:rotate-180 transition-transform duration-500" />
                Καθαρισμός
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-medium">
                <thead>
                  <tr className="text-slate-400 tracking-wider text-[9px] border-b border-slate-100">
                    <th className="py-4 pl-8 text-left font-black">Συσκευή</th>
                    <th className="py-4 text-left font-black w-24">Ποσότητα</th>
                    <th className="py-4 text-left font-black w-24">Watts/μον.</th>
                    <th className="py-4 text-left font-black w-24">Σύνολο</th>
                    <th className="py-4 pr-8 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-32 px-8 text-center text-slate-300 font-medium italic tracking-tight text-sm">
                        Δεν βρέθηκαν συσκευές στην ουρά.
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => (
                      <motion.tr 
                        key={it.id}
                        initial={highlightId === it.id ? { backgroundColor: 'rgba(34, 211, 238, 0.1)' } : { opacity: 0 }}
                        animate={{ 
                          opacity: 1, 
                          backgroundColor: highlightId === it.id ? 'rgba(34, 211, 238, 0.05)' : 'transparent'
                        }}
                        transition={{ 
                          delay: highlightId === it.id ? 0 : 0.05 * idx,
                          backgroundColor: { duration: 0.6 }
                        }}
                        className={`group transition-all ${highlightId === it.id ? 'ring-1 ring-inset ring-[#22d3ee]/20' : 'hover:bg-slate-50/50'}`}
                      >
                        <td className="py-6 pl-8">
                          <div className="text-slate-900 font-bold text-sm">{it.name}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${it.source === 'lib' ? 'bg-[#22d3ee]' : 'bg-purple-400'}`} />
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest">
                              {it.source === 'lib' ? 'Βιβλιοθήκη' : 'Προσαρμοσμένο'}
                            </span>
                          </div>
                        </td>
                        <td className="py-6">
                          <input 
                            type="number" 
                            min="1"
                            value={it.qty} 
                            onChange={(e) => updateItem(it.id, { qty: Math.max(1, Number(e.target.value)) })}
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-black text-slate-900 text-center outline-none focus:border-[#22d3ee] transition-all" 
                          />
                        </td>
                        <td className="py-6">
                          <input 
                            type="number" 
                            min="1"
                            value={it.w} 
                            onChange={(e) => updateItem(it.id, { w: Math.max(1, Number(e.target.value)) })}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-black text-slate-900 text-center outline-none focus:border-[#22d3ee] transition-all" 
                          />
                        </td>
                        <td className="py-6 font-black text-slate-900 text-sm tabular-nums">
                          {it.w * it.qty} <span className="text-[10px] text-slate-400 ml-0.5">W</span>
                        </td>
                        <td className="py-6 pr-8 text-right">
                           <button 
                            onClick={() => removeItem(it.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                           >
                            <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Legend/Info Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 text-[10px] font-bold text-slate-400 tracking-widest">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
              Συσκευές Βιβλιοθήκης
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Προσαρμοσμένες Είσοδοι
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#22d3ee]" />
            Real-time Load Monitoring Active
          </div>
        </div>

      </div>
    </div>
  );
}
