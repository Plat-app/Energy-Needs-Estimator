import React, { useEffect, useState } from 'react';
import { Trash2, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { SelectedDevice } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  devices: SelectedDevice[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClear: () => void;
}

const DeviceRow: React.FC<{ 
  device: SelectedDevice; 
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}> = ({ device, onRemove, onUpdateQuantity }) => {
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (device.lastUpdated && (Date.now() - device.lastUpdated) < 3000) {
      setIsHighlighting(true);
      const timer = setTimeout(() => setIsHighlighting(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [device.lastUpdated]);

  const handleIncrement = () => {
    onUpdateQuantity(device.id, device.quantity + 1);
  };

  const handleDecrement = () => {
    if (device.quantity > 1) {
      onUpdateQuantity(device.id, device.quantity - 1);
    }
  };

  return (
    <motion.tr 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        backgroundColor: isHighlighting ? 'rgba(9, 113, 206, 0.05)' : 'rgba(255, 255, 255, 0)'
      }}
      exit={{ opacity: 0, x: 20 }}
      className="group transition-colors"
    >
      <td className="px-6 py-4">
        <div className="font-bold text-slate-700">{device.name}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0971ce]"></div>
          <span className="text-[10px] text-slate-400 font-bold tracking-wider">Βιβλιοθήκη</span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block px-4 py-1.5 bg-slate-50 rounded-lg text-slate-600 font-bold text-sm border border-slate-100 min-w-[3rem]">
            {device.quantity}
          </span>
          <div className="flex flex-col -space-y-1">
            <button 
              onClick={handleIncrement}
              className="p-0.5 text-slate-400 hover:text-[#0971ce] transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDecrement}
              disabled={device.quantity <= 1}
              className="p-0.5 text-slate-400 hover:text-[#0971ce] transition-colors disabled:opacity-30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center text-slate-600 font-medium">
        <span className="inline-block px-4 py-1.5 bg-slate-50 rounded-lg text-slate-600 font-bold text-sm border border-slate-100">
          {device.watts}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-slate-800 font-black">
          {device.watts * device.quantity} <span className="text-slate-400 font-medium text-xs">W</span>
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={() => onRemove(device.id)}
          className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </motion.tr>
  );
};

export const DeviceList: React.FC<Props> = ({ devices, onRemove, onUpdateQuantity, onClear }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-slate-700 font-bold">Λίστα συσκευών</h3>
          <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full font-bold">
            {devices.length} συσκευές
          </span>
        </div>
        <button 
          onClick={onClear}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Καθαρισμός
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] tracking-widest text-slate-400 border-b border-slate-50">
              <th className="px-6 py-4 font-bold capitalize">Συσκευή</th>
              <th className="px-6 py-4 font-bold text-center capitalize">Ποσότητα</th>
              <th className="px-6 py-4 font-bold text-center">Watts/μον.</th>
              <th className="px-6 py-4 font-bold text-center capitalize">Σύνολο</th>
              <th className="px-6 py-4 font-bold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence initial={false}>
              {devices.length === 0 ? (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Δεν έχουν προστεθεί συσκευές
                  </td>
                </motion.tr>
              ) : (
                devices.map((device) => (
                  <DeviceRow 
                    key={device.id} 
                    device={device} 
                    onRemove={onRemove} 
                    onUpdateQuantity={onUpdateQuantity}
                  />
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
