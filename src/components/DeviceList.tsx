import React, { useEffect, useState } from 'react';
import { Trash2, RotateCcw, ChevronUp, ChevronDown, ExternalLink, Download } from 'lucide-react';
import { SelectedDevice } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = React.useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    
    setIsExporting(true);
    
    try {
      // 1. Create a clone and mount it safely to ensure rendering
      const clone = element.cloneNode(true) as HTMLDivElement;
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = '800px';
      clone.style.visibility = 'visible';
      clone.style.opacity = '1';
      clone.style.zIndex = '-9999';
      clone.style.backgroundColor = 'white';
      document.body.appendChild(clone);

      // 2. Wait for layout
      await new Promise(resolve => setTimeout(resolve, 300));

      // 3. Capture
      const canvas = await html2canvas(clone, {
        scale: 1.5, // Reduced scale for better compatibility/memory
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        windowWidth: 800
      });

      // 4. Clean up
      document.body.removeChild(clone);
      
      // 5. Generate PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      
      const imgRatio = canvas.width / canvas.height;
      let finalWidth = maxWidth;
      let finalHeight = maxWidth / imgRatio;

      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = maxHeight * imgRatio;
      }

      const marginX = (pdfWidth - finalWidth) / 2;
      const marginY = margin;
      
      pdf.addImage(imgData, 'JPEG', marginX, marginY, finalWidth, finalHeight);
      pdf.save(`Tescom_Load_Estimate_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Σφάλμα κατά την εξαγωγή. Δοκιμάστε να κάνετε μια ανανέωση (Refresh) στη σελίδα και προσπαθήστε ξανά.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4 relative">
      <div className="absolute bottom-1 right-3 text-[8px] text-slate-200 pointer-events-none">v1.1</div>
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
              disabled={isExporting}
              className="flex items-center gap-2 text-[#0971ce] hover:text-[#075da9] transition-colors text-sm font-bold px-3 py-1.5 bg-[#0971ce]/5 rounded-lg disabled:opacity-50"
            >
              {isExporting ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
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

      {/* Hidden PDF Template - Fixed Visibility */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: '-9999px', 
          width: '800px',
          visibility: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          backgroundColor: 'white'
        }}
      >
        <div 
          ref={pdfRef} 
          className="p-12 bg-white font-sans text-slate-800"
          style={{ width: '800px' }}
        >
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="text-3xl font-black text-[#0971ce] mb-0 leading-none">TESCOM</div>
              <div className="text-[11px] font-bold text-slate-400 tracking-[0.3em] uppercase">Hellas</div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-slate-900 mb-1">Εκτίμηση Αναγκών Φορτίου</h1>
              <p className="text-slate-400 font-bold text-sm">Ημερομηνία: {new Date().toLocaleDateString('el-GR')}</p>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="bg-[#0971ce] text-white">
                <th className="p-4 text-left rounded-tl-xl">Συσκευή</th>
                <th className="p-4 text-center">Ποσότητα</th>
                <th className="p-4 text-center">Watts/μον.</th>
                <th className="p-4 text-right rounded-tr-xl">Σύνολο</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((device) => (
                <tr key={device.id}>
                  <td className="p-4 font-bold">{device.name}</td>
                  <td className="p-4 text-center">{device.quantity}</td>
                  <td className="p-4 text-center">{device.watts} W</td>
                  <td className="p-4 text-right font-black">{device.watts * device.quantity} W</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-bold">Συνολικό Φορτίο:</span>
              <span className="text-xl font-black text-slate-900">{totalWatts} W</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-[#0971ce] font-black uppercase tracking-wider text-sm">Προτεινόμενη Ισχύς (+25%):</span>
              <span className="text-3xl font-black text-[#0971ce]">{Math.round(marginPower)} W</span>
            </div>
          </div>

          <div className="mt-12 text-[10px] text-slate-400 italic text-center border-t border-slate-100 pt-6">
            Η εκτίμηση είναι ενδεικτική και αφορά μόνο το συνολικό φορτίο σε Watt. Για ακριβή μελέτη και επιλογή UPS, παρακαλούμε επικοινωνήστε με την TESCOM HELLAS.
          </div>
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
