import { useState, useEffect } from 'react';
import { 
  Zap, 
  Server, 
  Monitor, 
  Wifi, 
  Cpu, 
  Plus, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  Category, 
  SelectedDevice, 
  PREDEFINED_DEVICES 
} from './types';
import { DeviceList } from './components/DeviceList';

export default function App() {
  const [devices, setDevices] = useState<SelectedDevice[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('server');
  const [selectedPredefinedId, setSelectedPredefinedId] = useState('');
  
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState<number>(0);
  const [customQty, setCustomQty] = useState<number>(1);
  
  const [safetyMargin, setSafetyMargin] = useState(0.2);

  useEffect(() => {
    const sendHeight = () => {
      const content = document.getElementById('app-content-inner');
      if (content) {
        // Χρησιμοποιούμε το offsetHeight για ακρίβεια στο περιεχόμενο
        const height = content.offsetHeight;
        window.parent.postMessage({ type: 'setHeight', height: height }, '*');
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });

    const content = document.getElementById('app-content-inner');
    if (content) {
      resizeObserver.observe(content);
    }
    
    // Ακρόαση και για αλλαγή μεγέθους παραθύρου
    window.addEventListener('resize', sendHeight);
    
    // Αρχική αποστολή
    sendHeight();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', sendHeight);
    };
  }, [devices, safetyMargin]);

  const totalWatts = devices.reduce((sum, d) => sum + (d.watts * d.quantity), 0);
  const netPower = totalWatts * (1 + safetyMargin);

  const addPredefined = () => {
    const dev = PREDEFINED_DEVICES[activeCategory].find(d => d.id === selectedPredefinedId);
    if (!dev) return;
    
    setDevices(prev => {
      const existingIndex = prev.findIndex(d => d.name === dev.name && d.watts === dev.watts);
      const now = Date.now();

      if (existingIndex !== -1) {
        const updated = {
          ...prev[existingIndex],
          quantity: prev[existingIndex].quantity + 1,
          lastUpdated: now
        };
        const remaining = prev.filter((_, i) => i !== existingIndex);
        return [updated, ...remaining];
      }

      const newDevice: SelectedDevice = {
        ...dev,
        id: Math.random().toString(36).substr(2, 9),
        quantity: 1,
        category: activeCategory,
        lastUpdated: now
      };
      return [newDevice, ...prev];
    });
  };

  const addCustom = () => {
    if (!customName || customWatts <= 0) return;
    
    setDevices(prev => {
      const existingIndex = prev.findIndex(d => d.name === customName && d.watts === customWatts);
      const now = Date.now();

      if (existingIndex !== -1) {
        const updated = {
          ...prev[existingIndex],
          quantity: prev[existingIndex].quantity + customQty,
          lastUpdated: now
        };
        const remaining = prev.filter((_, i) => i !== existingIndex);
        return [updated, ...remaining];
      }

      const newDevice: SelectedDevice = {
        id: Math.random().toString(36).substr(2, 9),
        name: customName,
        watts: customWatts,
        quantity: customQty,
        category: 'others',
        lastUpdated: now
      };
      return [newDevice, ...prev];
    });

    setCustomName('');
    setCustomWatts(0);
    setCustomQty(1);
  };

  const removeDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setDevices(prev => prev.map(d => 
      d.id === id ? { ...d, quantity, lastUpdated: Date.now() } : d
    ));
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      <div id="app-content-inner">
        {/* Top Brand Bar */}
      <div className="bg-white px-4 py-5 lg:px-6 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="https://b2b.tescom.gr/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://tescom-energy-needs-estimator.netlify.app/logo.png" 
                alt="TESCOM" 
                className="h-10 sm:h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </a>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#0f172a] text-center sm:text-left">
              Εκτίμηση αναγκών <span className="text-[#0971ce]">φορτίου</span>
            </h1>
          </div>
          <a 
            href={`https://b2b.tescom.gr/odigos-epilogis-ups?load=${Math.round(netPower)}`} 
            target="_parent" 
            className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 hover:text-[#0971ce] transition-all group"
          >
            Οδηγός επιλογής UPS
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
            <section>
              <label className="text-[10px] font-black text-slate-400 tracking-widest mb-4 block">Συσκευές</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'server', label: 'Server', icon: Server },
                  { id: 'workstation', label: 'Workstation', icon: Monitor },
                  { id: 'network', label: 'Δίκτυο', icon: Wifi },
                  { id: 'others', label: 'Διάφορα', icon: Cpu },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id as Category);
                      setSelectedPredefinedId('');
                    }}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border transition-all
                      ${activeCategory === cat.id 
                        ? 'border-slate-800 bg-white shadow-sm ring-1 ring-slate-800' 
                        : 'border-slate-50 bg-white hover:border-slate-200'}
                    `}
                  >
                    <cat.icon className={`w-5 h-5 ${activeCategory === cat.id ? 'text-slate-800' : 'text-slate-300'}`} />
                    <span className={`text-sm font-bold ${activeCategory === cat.id ? 'text-slate-800' : 'text-slate-400'}`}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedPredefinedId}
                    onChange={(e) => setSelectedPredefinedId(e.target.value)}
                    className="w-full h-14 pl-5 pr-12 rounded-2xl bg-slate-50 border-2 border-[#0971ce]/10 appearance-none focus:bg-white focus:border-[#0971ce] transition-all text-slate-700 font-bold shadow-sm shadow-[#0971ce]/5"
                  >
                    <option value="">Επιλογή συσκευής...</option>
                    {PREDEFINED_DEVICES[activeCategory].map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                </div>
                <button 
                  onClick={addPredefined}
                  disabled={!selectedPredefinedId}
                  className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all text-white shadow-xl shadow-slate-900/20 disabled:opacity-50"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 tracking-widest block">Προσαρμοσμένη είσοδος</label>
              <input
                type="text"
                placeholder="Όνομα συσκευής"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-[#0971ce] transition-all text-slate-700 font-bold placeholder:text-slate-300"
              />
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Watts"
                    value={customWatts || ''}
                    onChange={(e) => setCustomWatts(Number(e.target.value))}
                    className="w-full h-14 px-5 pr-12 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-[#0971ce] transition-all text-slate-700 font-bold placeholder:text-slate-300"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">W</span>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    min="1"
                    placeholder="Ποσ."
                    value={customQty}
                    onChange={(e) => setCustomQty(Number(e.target.value))}
                    className="w-full h-14 px-5 text-center rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-[#0971ce] transition-all text-slate-700 font-bold"
                  />
                </div>
                <button 
                  onClick={addCustom}
                  className="w-14 h-14 bg-[#0971ce] rounded-2xl flex items-center justify-center hover:bg-[#075da9] transition-all text-white shadow-xl shadow-[#0971ce]/20"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Summary Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              <section>
                <label className="text-[10px] font-black text-slate-400 tracking-widest mb-2 block">Συνολικό φορτίο</label>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-800 tracking-tighter">
                    {totalWatts.toLocaleString('el-GR')}
                  </span>
                  <span className="text-2xl font-black text-[#0971ce]">W</span>
                </div>
              </section>

              <section className="sm:border-l sm:border-slate-100 sm:pl-8">
                <label className="text-[10px] font-black text-slate-400 tracking-widest mb-2 block">Φορτίο με προσαύξηση</label>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-800 tracking-tighter">
                    {Math.round(netPower).toLocaleString('el-GR')}
                  </span>
                  <span className="text-2xl font-black text-[#0971ce]">W</span>
                </div>
              </section>
            </div>

            <section>
              <label className="text-[10px] font-black text-slate-400 tracking-widest mb-4 block underline decoration-[#0971ce] underline-offset-4">Περιθώριο ασφαλείας</label>
              <div className="bg-white rounded-2xl p-1 border border-slate-100 grid grid-cols-4 gap-1">
                {[0, 0.1, 0.2, 0.3].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSafetyMargin(m)}
                    className={`
                      py-3 rounded-xl text-xs font-bold transition-all
                      ${safetyMargin === m 
                        ? 'bg-[#0F172A] text-white shadow-lg' 
                        : 'text-slate-400 hover:bg-slate-50'}
                    `}
                  >
                    {m * 100}%
                  </button>
                ))}
              </div>
            </section>
            <div className="flex flex-col gap-3">
          {/* Το νέο Primary Κουμπί */}
        <a 
         href={`https://b2b.tescom.gr/odigos-epilogis-ups?load=${Math.round(netPower)}`}
        target="_parent"
      className="w-full py-5 bg-[#0971ce] rounded-2xl font-bold text-white flex items-center justify-center gap-3 hover:bg-[#075da9] transition-all shadow-lg shadow-[#0971ce]/20"
  >
       <ExternalLink className="w-4 h-4 text-white/80" />
      Συνέχεια στον οδηγό επιλογής UPS
    </a>

  {/* Το προϋπάρχον κουμπί (μετακινήθηκε μέσα στο div) */}
            <a 
              href="https://b2b.tescom.gr/shop/category/ups-1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 bg-white border border-slate-100 rounded-2xl font-bold text-slate-800 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              Δείτε διαθέσιμα UPS
            </a>
          </div>
        </div>
      </div>

      {/* Device List Table */}
      <DeviceList 
        devices={devices} 
        onRemove={removeDevice} 
        onUpdateQuantity={updateQuantity}
        onClear={() => setDevices([])} 
        totalWatts={totalWatts}
        marginPower={netPower}
      />
        <div className="text-right mt-4 px-2">
          <p className="text-[14px] text-slate-400 italic">
            Η εκτίμηση είναι ενδεικτική και αφορά μόνο το συνολικό φορτίο σε Watt.
          </p>
          <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 mt-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              <p>© 2026 TESCOM HELLAS</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
</div>
);
}
