/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, RefreshCcw, ExternalLink, AlertTriangle, Monitor, Server, Wifi, Cpu, Zap, Activity } from 'lucide-react';
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
  const [items, setItems] = useState<ListItem[]>([]);
  const [libKey, setLibKey] = useState(LIB[0].key);
  const [customName, setCustomName] = useState("");
  const [customW, setCustomW] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [activeCategory, setActiveCategory] = useState('server');
  const [selectedKva, setSelectedKva] = useState(3);
  const [powerFactor, setPowerFactor] = useState(1.0);

  const KVA_OPTIONS = [1, 2, 3, 6, 10];
  const PF_OPTIONS = [0.9, 1.0];

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
        if (parsed && typeof parsed.selectedKva === "number") setSelectedKva(parsed.selectedKva);
        if (parsed && typeof parsed.powerFactor === "number") setPowerFactor(parsed.powerFactor);
      }
    } catch (_) { /* noop */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, headroom, selectedKva, powerFactor }));
    } catch (_) { /* noop */ }
  }, [items, headroom, selectedKva, powerFactor]);

  const totalW = useMemo(() => {
    return items.reduce((acc, it) => acc + Math.max(0, Math.round(Number(it.w) || 0)) * Math.max(0, Number(it.qty) || 0), 0);
  }, [items]);

  const totalWithHeadroom = useMemo(() => {
    return Math.round(totalW * (1 + headroom / 100));
  }, [totalW, headroom]);

  // Capacity in Watts based on selected kVA and PF
  const capacityW = selectedKva * 1000 * powerFactor;
  const loadPercentage = Math.min(100, Math.round((totalWithHeadroom / capacityW) * 100));

  function addFromLibrary() {
    const lib = LIB.find((x) => x.key === libKey);
    if (!lib) return;

    setItems((xs) => {
      const existingIdx = xs.findIndex(it => it.name === lib.name && it.w === lib.defaultW);
      if (existingIdx !== -1) {
        const next = [...xs];
        next[existingIdx] = { ...next[existingIdx], qty: next[existingIdx].qty + 1 };
        return next;
      }
      return [
        ...xs,
        { id: uid(), name: lib.name, w: lib.defaultW, qty: 1, warnAbove: lib.warnAbove, source: "lib" },
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
        next[existingIdx] = { 
          ...next[existingIdx], 
          qty: next[existingIdx].qty + Math.max(1, Number(customQty) || 1) 
        };
        return next;
      }
      return [
        ...xs,
        { id: uid(), name, w, qty: Math.max(1, Number(customQty) || 1), warnAbove: 400, source: "custom" },
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

  function clearAll() {
    if (confirm("Είστε σίγουροι ότι θέλετε να καθαρίσετε τη λίστα;")) {
      setItems([]);
    }
  }

  function openUpsFinder() {
    const base = "https://dazzling-dusk-ab5209.netlify.app/";
    const url = `${base}?w=${encodeURIComponent(totalWithHeadroom)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans selection:bg-[#22d3ee]/30">
      {/* Navbar */}
      <nav className="border-b border-[#1e293b] bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#22d3ee] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <Zap className="text-[#0f172a] w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Εκτίμηση αναγκών φορτίου</h1>
              <p className="text-[10px] text-[#94a3b8] font-mono tracking-widest">Tescom Hellas</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94a3b8]">
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Config */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Load Config Card */}
            <div className="bg-[#1e293b] rounded-3xl border border-[#334155] p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#22d3ee]/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-[#22d3ee]/10 transition-colors" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold tracking-[0.2em] text-[#94a3b8]">Συσκευές - Φορτία</h2>
                <button onClick={clearAll} className="p-2 bg-[#0f172a] hover:bg-red-500/10 text-[#94a3b8] hover:text-red-400 rounded-lg transition-all">
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-4">
                {/* Category Sidebar */}
                <div className="col-span-4 space-y-2">
                  <p className="text-[10px] font-bold text-[#64748b] mb-2">Κατηγορία</p>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        activeCategory === cat.id 
                        ? "bg-[#22d3ee] text-[#0f172a] shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                        : "bg-[#0f172a] text-[#64748b] hover:text-white"
                      }`}
                    >
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Device Type & Watts */}
                <div className="col-span-8 flex flex-col justify-between">
                  <div>
                    <label className="text-[10px] font-bold text-[#64748b] mb-2 block">Τύπος συσκευής</label>
                    <div className="flex gap-2">
                      <select 
                        value={libKey} 
                        onChange={(e) => setLibKey(e.target.value)} 
                        className="flex-1 bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#22d3ee] outline-none cursor-pointer"
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
                      <button 
                        onClick={addFromLibrary}
                        className="bg-[#22d3ee] text-[#0f172a] px-4 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#334155] mt-4">
                    <label className="text-[10px] font-bold text-[#64748b] mb-2 block">Προσαρμοσμένη είσοδος</label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        placeholder="Όνομα Συσκευής" 
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="flex-1 bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#334155] focus:border-[#22d3ee] outline-none" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <div className="flex-[3] relative">
                          <input 
                            type="number" 
                            placeholder="Watts" 
                            value={customW}
                            onChange={(e) => setCustomW(e.target.value)}
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#334155] focus:border-[#22d3ee] outline-none" 
                          />
                          <span className="absolute right-3 top-2.5 text-[#334155] text-[10px] font-bold pointer-events-none">W</span>
                        </div>
                        <input 
                          type="number" 
                          placeholder="Ποσ." 
                          value={customQty}
                          onChange={(e) => setCustomQty(Number(e.target.value) || 1)}
                          className="w-16 bg-[#0f172a] border border-[#334155] rounded-xl px-2 py-2.5 text-xs text-white placeholder:text-[#334155] focus:border-[#22d3ee] outline-none text-center" 
                        />
                      </div>
                      <button 
                        onClick={addCustom}
                        className="bg-[#22d3ee] text-[#0f172a] px-4 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Load Card */}
            <div className="bg-[#1e293b] rounded-3xl border border-[#334155] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <Zap className="w-12 h-12 text-[#22d3ee]/10" />
              </div>
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#94a3b8] mb-6">Συνολικό υπολογισμένο φορτίο</h2>
              
              <div className="flex items-end gap-3 mb-8">
                <span className="text-6xl font-black text-white font-mono tracking-tighter">{totalWithHeadroom.toLocaleString()}</span>
                <span className="text-2xl font-bold text-[#22d3ee] mb-2">W</span>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#334155]">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#64748b] tracking-wider">Σύνολο VA (Εκτ.)</p>
                  <p className="text-xl font-bold text-white font-mono">{(totalWithHeadroom * 1.25).toFixed(0)} VA</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#64748b] tracking-wider">Καθαρή ισχύς</p>
                  <p className="text-xl font-bold text-white font-mono">{totalW} W</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 bg-[#0f172a] p-1 rounded-xl flex">
                  {HEADROOM_OPTIONS.map(h => (
                    <button 
                      key={h}
                      onClick={() => setHeadroom(h)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        headroom === h ? "bg-[#334155] text-[#22d3ee]" : "text-[#475569] hover:text-white"
                      }`}
                    >
                      {h}%
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-[#475569] whitespace-nowrap">Περιθώριο ασφαλείας</span>
              </div>
            </div>

            {/* Warning Info */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-200/70 leading-relaxed font-medium">
                Συσκευές με μεγάλο ρεύμα εκκίνησης (laser, μοτέρ) απαιτούν επαγγελματική αξιολόγηση πριν τη σύνδεση σε UPS.
              </p>
            </div>
          </div>

          {/* Right Column: Analysis & List */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* kVA Selection Card */}
              <div className="bg-[#1e293b] rounded-3xl border border-[#334155] p-6 shadow-xl space-y-6">
                 <div>
                   <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#94a3b8] mb-4">Επιλογή χωρητικότητας στόχου</h2>
                   <label className="text-[10px] font-bold text-[#64748b] mb-2 block">Ονομαστική ισχύς UPS (kVA)</label>
                   <div className="grid grid-cols-5 gap-2">
                      {KVA_OPTIONS.map(kva => (
                        <button 
                          key={kva}
                          onClick={() => setSelectedKva(kva)}
                          className={`py-3 rounded-xl text-xs font-black transition-all ${
                            selectedKva === kva 
                            ? "bg-[#22d3ee] text-[#0f172a] shadow-[0_0_15px_rgba(34,211,238,0.3)]" 
                            : "bg-[#0f172a] text-[#64748b] border border-[#334155] hover:text-white"
                          }`}
                        >
                          {kva}
                        </button>
                      ))}
                   </div>
                 </div>

                 <div>
                   <label className="text-[10px] font-bold text-[#64748b] mb-2 block">Συντελεστής ισχύος εξόδου (PF)</label>
                   <div className="flex bg-[#0f172a] p-1 rounded-xl w-32">
                      {PF_OPTIONS.map(pf => (
                        <button 
                          key={pf}
                          onClick={() => setPowerFactor(pf)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                            powerFactor === pf 
                            ? "bg-[#334155] text-[#22d3ee]" 
                            : "text-[#475569] hover:text-white"
                          }`}
                        >
                          {pf.toFixed(1)}
                        </button>
                      ))}
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-2xl border border-[#334155]">
                    <div className="w-10 h-10 rounded-xl bg-[#22d3ee]/10 flex items-center justify-center">
                      <Zap className={`w-5 h-5 ${loadPercentage > 100 ? 'text-red-500 animate-pulse' : 'text-[#22d3ee]'}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#64748b]">Όριο χωρητικότητας</p>
                      <p className="text-sm font-bold text-white font-mono">{capacityW} W <span className="text-[#475569] font-normal text-[10px]">@ PF {powerFactor.toFixed(1)}</span></p>
                    </div>
                 </div>
              </div>

              {/* Load Meter Card */}
              <div className="bg-[#1e293b] rounded-3xl border border-[#334155] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#94a3b8] mb-4">Οπτική ανάλυση φορτίου</h2>
                
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="h-4 w-full bg-[#0f172a] rounded-full overflow-hidden border border-[#334155] p-0.5 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${loadPercentage}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        totalWithHeadroom > capacityW ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                        loadPercentage > 75 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                        'bg-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                      }`}
                    />
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-[#64748b] tracking-widest">Χρήση</p>
                       <p className={`text-3xl font-black font-mono tracking-tighter ${
                         totalWithHeadroom > capacityW ? 'text-red-500' : 'text-white'
                       }`}>
                         {(totalWithHeadroom / capacityW * 100).toFixed(0)}%
                       </p>
                    </div>
                    <div className="text-right">
                       {totalWithHeadroom > capacityW && (
                         <p className="text-xs font-bold text-red-500">
                           Κρίσιμη Υπερφόρτωση
                         </p>
                       )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Device List Table Card */}
            <div className="bg-[#1e293b] rounded-3xl border border-[#334155] p-6 shadow-2xl flex-1 flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#94a3b8]">Λίστα συσκευών</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-1 rounded-lg tracking-wider">Φορτία</span>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-xs font-medium">
                  <thead>
                    <tr className="text-[#64748b] tracking-wider text-[9px] border-b border-[#334155]">
                      <th className="py-4 text-left font-black">Συσκευή</th>
                      <th className="py-4 text-left font-black w-24">Ποσότητα</th>
                      <th className="py-4 text-left font-black w-24">Watts μον.</th>
                      <th className="py-4 text-left font-black w-24">Σύνολο Watts</th>
                      <th className="py-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]/30">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center text-[#475569] font-mono italic tracking-tight">Το σύστημα είναι σε αδράνεια. Δεν βρέθηκαν συσκευές στην ουρά.</td>
                      </tr>
                    ) : (
                      items.map((it, idx) => (
                        <motion.tr 
                          key={it.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * idx }}
                          className="group hover:bg-[#0f172a]/30 transition-all"
                        >
                          <td className="py-5">
                            <div className="text-white font-bold">{it.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${it.source === 'lib' ? 'bg-[#22d3ee]' : 'bg-purple-400'}`} />
                              <span className="text-[9px] text-[#64748b] font-bold tracking-widest">{it.source === 'lib' ? 'Βιβλιοθήκη' : 'Προσαρμοσμένο'}</span>
                            </div>
                          </td>
                          <td className="py-5">
                            <input 
                              type="number" 
                              value={it.qty}
                              onChange={(e) => updateItem(it.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                              className="w-16 bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-1.5 text-center focus:border-[#22d3ee] outline-none text-[#22d3ee] font-mono font-bold"
                            />
                          </td>
                          <td className="py-5">
                            <input 
                              type="number" 
                              value={it.w}
                              onChange={(e) => updateItem(it.id, { w: Math.max(1, Number(e.target.value) || 1) })}
                              className="w-20 bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-1.5 focus:border-[#22d3ee] outline-none text-white font-mono"
                            />
                          </td>
                          <td className="py-5 font-bold text-white font-mono">{it.w * it.qty} W</td>
                          <td className="py-5 text-right">
                             <button 
                              onClick={() => removeItem(it.id)}
                              className="p-2 text-[#475569] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
        </div>
      </main>

      <footer className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-center border-t border-[#1e293b] gap-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-[#334155] rounded-lg" />
          <span className="text-[10px] font-bold text-[#475569] tracking-wider">© Tescom Hellas — Enterprise load evaluation kit</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, highlight, subtle, description }: { 
  label: string; 
  value: string; 
  highlight?: boolean; 
  subtle?: boolean;
  description?: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      highlight 
        ? "bg-[#22d3ee]/5 border-[#22d3ee]/20 shadow-sm" 
        : "bg-[#0f172a] border-[#334155]"
    }`}>
      <div className="text-[10px] font-bold text-[#64748b] mb-1">{label}</div>
      <div className={`text-xl font-bold font-mono ${
        highlight ? "text-[#22d3ee]" : subtle ? "text-[#475569]" : "text-white"
      }`}>
        {value}
      </div>
      {description && <div className="text-[9px] font-medium text-[#475569] mt-0.5 tracking-tighter">{description}</div>}
    </div>
  );
}
