
const VENUE = {
 
  seatSize: 28,
  gap: 6,

  width: 1160,
  height: 800,

  stage: { x: 380, y: 30, w: 400, h: 80, label: 'STAGE' },

  categories: {
    vip:      { name: 'VIP',      price: 120, color: '#d4a94a' },
    standard: { name: 'Standard', price: 80,  color: '#4d8fc4' },
    economy:  { name: 'Economy',  price: 45,  color: '#5fa57f' }
  },

  sections: [
    { id: 'OC', name: 'Orchestra Center', cat: 'vip',      x: 420, y: 170, rows: 5, cols: 10 },
    { id: 'OL', name: 'Orchestra Left',   cat: 'standard', x: 80,  y: 170, rows: 6, cols: 9 },
    { id: 'OR', name: 'Orchestra Right',  cat: 'standard', x: 774, y: 170, rows: 6, cols: 9 },
    { id: 'MZ', name: 'Mezzanine',        cat: 'standard', x: 190, y: 420, rows: 4, cols: 24 },
    { id: 'BA', name: 'Balcony',          cat: 'economy',  x: 130, y: 600, rows: 5, cols: 28 }
  ]
};
