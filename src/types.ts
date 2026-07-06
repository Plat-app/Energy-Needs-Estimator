export type Category = 'server' | 'workstation' | 'network' | 'others';

export interface Device {
  id: string;
  name: string;
  watts: number;
}

export interface SelectedDevice {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  category: Category;
  lastUpdated?: number; // Timestamp for highlighting
}

export const PREDEFINED_DEVICES: Record<Category, Device[]> = {
  server: [
    { id: 's1', name: 'Server 1U/2U (500W)', watts: 500 },
    { id: 's2', name: 'NAS 2-bay (35W)', watts: 35 },
    { id: 's3', name: 'Microserver / Small Server (150W)', watts: 150 },
    { id: 's4', name: 'Tower Server (350W)', watts: 350 },
    { id: 's5', name: 'Server 2U High Performance (800W)', watts: 800 },
    { id: 's6', name: 'NAS 4-bay (60W)', watts: 60 },
    { id: 's7', name: 'NAS 8-bay (120W)', watts: 120 },
    { id: 's8', name: 'External Storage / DAS (150W)', watts: 150 },
    { id: 's9', name: 'Rack KVM Console (40W)', watts: 40 },
  ],
  workstation: [
    { id: 'w1', name: 'Desktop PC (Office) (120W)', watts: 120 },
    { id: 'w2', name: 'Gaming PC (mid-range) (350W)', watts: 350 },
    { id: 'w3', name: 'Gaming PC (hi-end) (600W)', watts: 600 },
    { id: 'w4', name: 'Φορτιστής Laptop (65W)', watts: 65 },
    { id: 'w5', name: 'Monitor 24" (20W)', watts: 20 },
    { id: 'w6', name: 'Monitor 27" (30W)', watts: 30 },
    { id: 'w7', name: 'Mini PC / NUC (35W)', watts: 35 },
    { id: 'w8', name: 'All-in-One PC (90W)', watts: 90 },
    { id: 'w9', name: 'Business Workstation (250W)', watts: 250 },
    { id: 'w10', name: 'CAD / Design Workstation (450W)', watts: 450 },
    { id: 'w11', name: 'Φορτιστής Laptop USB-C (90W)', watts: 90 },
    { id: 'w12', name: 'Φορτιστής Laptop Workstation (130W)', watts: 130 },
    { id: 'w13', name: 'Docking Station USB-C (60W)', watts: 60 },
    { id: 'w14', name: 'Monitor 32" (45W)', watts: 45 },
    { id: 'w15', name: 'Ultrawide Monitor (55W)', watts: 55 },
  ],
  network: [
    { id: 'n1', name: 'Router / Modem (12W)', watts: 12 },
    { id: 'n2', name: 'Wi-Fi Access Point (9W)', watts: 9 },
    { id: 'n3', name: 'Switch 8-port (non-PoE) (15W)', watts: 15 },
    { id: 'n4', name: 'PoE Camera (8W)', watts: 8 },
    { id: 'n5', name: 'PoE Access Point (15W)', watts: 15 },
    { id: 'n6', name: 'VoIP Phone (6W)', watts: 6 },
    { id: 'n7', name: 'Fiber ONT (8W)', watts: 8 },
    { id: 'n8', name: 'Firewall / UTM Appliance (25W)', watts: 25 },
    { id: 'n9', name: 'Switch 16-port (non-PoE) (25W)', watts: 25 },
    { id: 'n10', name: 'Switch 24-port (non-PoE) (40W)', watts: 40 },
    { id: 'n11', name: 'Switch 48-port (non-PoE) (80W)', watts: 80 },
    { id: 'n12', name: 'PoE Switch 8-port (60W)', watts: 60 },
    { id: 'n13', name: 'PoE Switch 16-port (120W)', watts: 120 },
    { id: 'n14', name: 'PoE Switch 24-port (250W)', watts: 250 },
    { id: 'n15', name: 'Media Converter (5W)', watts: 5 },
    { id: 'n16', name: 'NVR / DVR Recorder (40W)', watts: 40 },
  ],
  others: [
    { id: 'o1', name: 'Εκτυπωτής Inkjet (A4) (150W)', watts: 150 },
    { id: 'o2', name: 'LED TV 43" (70W)', watts: 70 },
    { id: 'o3', name: 'POS Terminal (25W)', watts: 25 },
    { id: 'o4', name: 'Θερμικός Εκτυπωτής Αποδείξεων (20W)', watts: 20 },
    { id: 'o5', name: 'Barcode Scanner (2W)', watts: 2 },
    { id: 'o6', name: 'Εξωτερικός HDD/SSD (USB) (8W)', watts: 8 },
    { id: 'o7', name: 'Λάμπα LED (20W)', watts: 20 },
    { id: 'o8', name: 'Ταμειακή Μηχανή (30W)', watts: 30 },
    { id: 'o9', name: 'Card Payment Terminal (10W)', watts: 10 },
    { id: 'o10', name: 'Ζυγαριά Καταστήματος (15W)', watts: 15 },
    { id: 'o11', name: 'Οθόνη Πελάτη / Customer Display (10W)', watts: 10 },
    { id: 'o12', name: 'Σύστημα Συναγερμού (15W)', watts: 15 },
    { id: 'o13', name: 'Access Control Controller (10W)', watts: 10 },
    { id: 'o14', name: 'Ηλεκτρική Κλειδαριά / Magnetic Lock (12W)', watts: 12 },
    { id: 'o15', name: 'PLC Controller (25W)', watts: 25 },
    { id: 'o16', name: 'HMI Panel (20W)', watts: 20 },
    { id: 'o17', name: 'Small Audio / Intercom System (30W)', watts: 30 },
    { id: 'o18', name: 'LED TV 55" (110W)', watts: 110 },
  ],
};
