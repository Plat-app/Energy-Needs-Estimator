import { useState } from 'react';
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
  const [selectedPredefinedId, setSelectedPredefinedId] = useState(PREDEFINED_DEVICES['server'][0].id);
  
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState<number>(0);
  const [customQty, setCustomQty] = useState<number>(1);
  
  const [powerFactorInput, setPowerFactorInput] = useState('0.9');
  const [safetyMargin, setSafetyMargin] = useState(0.2);

  const powerFactor = parseFloat(powerFactorInput.replace(',', '.')) || 0;
  const totalWatts = devices.reduce((sum, d) => sum + (d.watts * d.quantity), 0);
  const totalVA = powerFactor > 0 ? totalWatts / powerFactor : 0;
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Εκτίμηση αναγκών φορτίου</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Tescom Hellas</p>
            </div>
          </div>
          <img src="https://tescom.gr/wp-content/uploads/2021/04/tescom-logo.png" alt="Tescom Logo" className="h-8 hidden sm:block" />
        </header>

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
                      setSelectedPredefinedId(PREDEFINED_DEVICES[cat.id as Category][0].id);
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
                    className="w-full h-14 pl-5 pr-12 rounded-2xl bg-slate-50 border-2 border-sky-100 appearance-none focus:bg-white focus:border-sky-500 transition-all text-slate-700 font-bold shadow-sm shadow-sky-500/5"
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
                  className="w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center hover:border-sky-500 hover:bg-sky-50 transition-all disabled:opacity-50"
                >
                  <Plus className="w-6 h-6 text-slate-800" />
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
                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-sky-500 transition-all text-slate-700 font-bold placeholder:text-slate-300"
              />
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Watts"
                    value={customWatts || ''}
                    onChange={(e) => setCustomWatts(Number(e.target.value))}
                    className="w-full h-14 px-5 pr-12 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-sky-500 transition-all text-slate-700 font-bold placeholder:text-slate-300"
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
                    className="w-full h-14 px-5 text-center rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-sky-500 transition-all text-slate-700 font-bold"
                  />
                </div>
                <button 
                  onClick={addCustom}
                  className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all text-white shadow-xl shadow-slate-900/20"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Summary Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-10">
            <section>
              <label className="text-[10px] font-black text-slate-400 tracking-widest mb-2 block">Συνολικό φορτίο</label>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-slate-800 tracking-tighter">
                  {totalWatts.toLocaleString('el-GR')}
                </span>
                <span className="text-4xl font-black text-sky-400">W</span>
              </div>
            </section>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-50 flex flex-col items-center">
                <label className="text-[9px] font-black text-sky-900/40 tracking-widest mb-3 block uppercase">Power factor</label>
                <div className="bg-white rounded-2xl border border-slate-200 w-full py-2 shadow-sm shadow-slate-200/50">
                  <input
                    type="text"
                    value={powerFactorInput}
                    onChange={(e) => setPowerFactorInput(e.target.value)}
                    className="w-full bg-transparent text-lg font-bold text-slate-700 text-center focus:outline-none"
                  />
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-50">
                <label className="text-[9px] font-black text-slate-400 tracking-widest mb-2 block">Εκτ. VA</label>
                <div className="text-lg font-bold text-slate-700">
                  {Math.round(totalVA).toLocaleString('el-GR')} <span className="text-[10px] text-slate-400">VA</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-50">
                <label className="text-[9px] font-black text-slate-400 tracking-widest mb-2 block">Καθαρή ισχύς</label>
                <div className="text-lg font-bold text-slate-700">
                  {Math.round(totalWatts * powerFactor).toLocaleString('el-GR')} <span className="text-[10px] text-slate-400">W</span>
                </div>
              </div>
            </div>

            <section>
              <label className="text-[10px] font-black text-slate-400 tracking-widest mb-4 block underline decoration-sky-400 underline-offset-4">Περιθώριο ασφαλείας</label>
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

            <a 
              href="https://b2b.tescom.gr/shop/category/ups-1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 bg-white border border-slate-100 rounded-2xl font-bold text-slate-800 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              Εύρεση κατάλληλου UPS
            </a>
          </div>
        </div>

        {/* Device List Table */}
        <DeviceList 
          devices={devices} 
          onRemove={removeDevice} 
          onClear={() => setDevices([])} 
        />
      </div>
    </div>
  );
}
