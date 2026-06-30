import React, { useEffect, useState } from 'react';
import { Trash2, RotateCcw, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { SelectedDevice } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Props {
  devices: SelectedDevice[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClear: () => void;
  totalWatts: number;
  marginPower: number;
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
      <td className="px-6 py-4 text-center text-slate-600 font-bold text-sm">
        {device.watts}
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

export const DeviceList: React.FC<Props> = ({ devices, onRemove, onUpdateQuantity, onClear, totalWatts, marginPower }) => {
  const exportToPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://b2b.tescom.gr/static/version1719240893/frontend/MageBig/martfury_child/el_GR/images/logo.png";
    
    img.onload = () => {
      // Add Logo
      doc.addImage(img, 'PNG', 14, 10, 40, 10);
      
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text("Εκτίμηση Αναγκών Φορτίου", 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Ημερομηνία: ${new Date().toLocaleDateString('el-GR')}`, 14, 38);

      const tableData = devices.map(d => [
        d.name,
        d.quantity.toString(),
        `${d.watts} W`,
        `${d.watts * d.quantity} W`
      ]);

      (doc as any).autoTable({
        startY: 45,
        head: [['Συσκευή', 'Ποσότητα', 'Watts/μον.', 'Σύνολο']],
        body: tableData,
        headStyles: { fillColor: [9, 113, 206], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(`Συνολικό Φορτίο: ${totalWatts} W`, 14, finalY);
      doc.text(`Φορτίο με Προσαύξηση: ${Math.round(marginPower)} W`, 14, finalY + 7);
      
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Η εκτίμηση είναι ενδεικτική και αφορά μόνο το συνολικό φορτίο σε Watt.", 14, finalY + 20);

      doc.save(`Tescom_Load_Estimate_${new Date().getTime()}.pdf`);
    };

    img.onerror = () => {
      // Fallback if image fails to load
      doc.setFontSize(18);
      doc.setTextColor(9, 113, 206);
      doc.text("TESCOM HELLAS", 14, 20);
      
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text("Εκτίμηση Αναγκών Φορτίου", 14, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Ημερομηνία: ${new Date().toLocaleDateString('el-GR')}`, 14, 43);

      const tableData = devices.map(d => [
        d.name,
        d.quantity.toString(),
        `${d.watts} W`,
        `${d.watts * d.quantity} W`
      ]);

      (doc as any).autoTable({
        startY: 50,
        head: [['Συσκευή', 'Ποσότητα', 'Watts/μον.', 'Σύνολο']],
        body: tableData,
        headStyles: { fillColor: [9, 113, 206], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(`Συνολικό Φορτίο: ${totalWatts} W`, 14, finalY);
      doc.text(`Φορτίο με Προσαύξηση: ${Math.round(marginPower)} W`, 14, finalY + 7);
      
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Η εκτίμηση είναι ενδεικτική και αφορά μόνο το συνολικό φορτίο σε Watt.", 14, finalY + 20);

      doc.save(`Tescom_Load_Estimate_${new Date().getTime()}.pdf`);
    };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Λίστα συσκευών</h2>
          {devices.length > 0 && (
            <span className="px-2 py-0.5 bg-emerald-50 text-[#0971ce] text-[10px] font-black rounded-full border border-[#0971ce]/10">
              {devices.length} {devices.length === 1 ? 'συσκευή' : 'συσκευές'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {devices.length > 0 && (
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 text-[#0971ce] hover:text-[#075da9] transition-colors text-sm font-bold px-3 py-1.5 bg-[#0971ce]/5 rounded-lg"
            >
              <ExternalLink className="w-4 h-4" />
              Εξαγωγή PDF
            </button>
          )}
          <button 
            onClick={onClear}
            className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            Καθαρισμός
          </button>
        </div>
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
