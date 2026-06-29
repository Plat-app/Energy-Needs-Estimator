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
  ],
  workstation: [
    { id: 'w1', name: 'Desktop PC (Office) (120W)', watts: 120 },
    { id: 'w2', name: 'Gaming PC (mid-range) (350W)', watts: 350 },
    { id: 'w3', name: 'Gaming PC (hi-end) (600W)', watts: 600 },
    { id: 'w4', name: 'Φορτιστής Laptop (65W)', watts: 65 },
    { id: 'w5', name: 'Monitor 24" (20W)', watts: 20 },
    { id: 'w6', name: 'Monitor 27" (30W)', watts: 30 },
  ],
  network: [
    { id: 'n1', name: 'Router / Modem (12W)', watts: 12 },
    { id: 'n2', name: 'Wi-Fi Access Point (9W)', watts: 9 },
    { id: 'n3', name: 'Switch 8-port (non-PoE) (15W)', watts: 15 },
    { id: 'n4', name: 'PoE Camera (8W)', watts: 8 },
    { id: 'n5', name: 'PoE Access Point (15W)', watts: 15 },
    { id: 'n6', name: 'VoIP Phone (6W)', watts: 6 },
  ],
  others: [
    { id: 'o1', name: 'Εκτυπωτής Inkjet (A4) (150W)', watts: 150 },
    { id: 'o2', name: 'LED TV 43" (70W)', watts: 70 },
    { id: 'o3', name: 'POS Terminal (25W)', watts: 25 },
    { id: 'o4', name: 'Θερμικός Εκτυπωτής Αποδείξεων (20W)', watts: 20 },
    { id: 'o5', name: 'Barcode Scanner (2W)', watts: 2 },
    { id: 'o6', name: 'Εξωτερικός HDD/SSD (USB) (8W)', watts: 8 },
    { id: 'o7', name: 'Λάμπα LED (20W)', watts: 20 },
  ],
};
