// Supply-chain data model + realistic interconnected sample data.
// All values are realistic; deterministic engines consume this shape.

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NEEDS_VERIFICATION';

export interface Supplier {
  id: string; name: string; location: string; products: string[];
  reliabilityScore: number; leadTimeDays: number; tier: 1 | 2 | 3;
}
export interface Product {
  id: string; name: string; category: string; unitPrice: number;
  dailyDemand: number; reorderLevel: number;
}
export interface Warehouse {
  id: string; name: string; location: string; capacity: number;
}
export interface Inventory {
  warehouseId: string; productId: string;
  available: number; reserved: number;
}
export interface Shipment {
  id: string; supplierId: string; productId: string; quantity: number;
  origin: string; destination: string;
  status: 'Scheduled' | 'In Transit' | 'Delayed' | 'Delivered' | 'Halted';
  expectedDate: string; updatedDate?: string; carrier: string;
}
export interface Order {
  id: string; customerId: string; productId: string; quantity: number;
  orderDate: string; requiredDate: string; status: 'Open' | 'Picking' | 'Shipped' | 'Delayed';
  revenue: number; priority: 'High' | 'Medium' | 'Low';
}
export interface Customer {
  id: string; name: string; location: string; priority: 'Platinum' | 'Gold' | 'Silver';
}

export interface SupplyChainDB {
  suppliers: Supplier[];
  products: Product[];
  warehouses: Warehouse[];
  inventory: Inventory[];
  shipments: Shipment[];
  orders: Order[];
  customers: Customer[];
}

export const TODAY = '2026-09-05';

export const db: SupplyChainDB = {
  suppliers: [
    { id: 'SUP-001', name: 'Supplier Alpha', location: 'Mumbai, IN', products: ['P-104','P-105'], reliabilityScore: 82, leadTimeDays: 7, tier: 1 },
    { id: 'SUP-002', name: 'Supplier Beta',  location: 'Pune, IN',  products: ['P-999'],        reliabilityScore: 91, leadTimeDays: 5, tier: 2 },
    { id: 'SUP-003', name: 'Supplier Gamma', location: 'Chennai, IN',products: ['P-201','P-202'],reliabilityScore: 76, leadTimeDays: 9, tier: 1 },
    { id: 'SUP-004', name: 'Supplier Delta', location: 'Delhi, IN',  products: ['P-301'],        reliabilityScore: 88, leadTimeDays: 6, tier: 2 },
    { id: 'SUP-005', name: 'Supplier Epsilon',location:'Bengaluru, IN',products:['P-401','P-402'],reliabilityScore: 94, leadTimeDays: 4, tier: 1 },
  ],
  products: [
    { id: 'P-104', name: 'Industrial Bearing 40mm', category: 'Mechanical', unitPrice: 1850, dailyDemand: 12, reorderLevel: 60 },
    { id: 'P-105', name: 'Hydraulic Seal Kit',      category: 'Mechanical', unitPrice: 920,  dailyDemand: 8,  reorderLevel: 40 },
    { id: 'P-999', name: 'Legacy Valve Unit',       category: 'Valves',     unitPrice: 4300, dailyDemand: 1,  reorderLevel: 10 },
    { id: 'P-201', name: 'Copper Wire 4mm',         category: 'Electrical', unitPrice: 640,  dailyDemand: 25, reorderLevel: 120 },
    { id: 'P-202', name: 'Insulator Cap',           category: 'Electrical', unitPrice: 210,  dailyDemand: 15, reorderLevel: 70 },
    { id: 'P-301', name: 'Servo Motor 2kW',         category: 'Motors',     unitPrice: 7800, dailyDemand: 4,  reorderLevel: 18 },
    { id: 'P-401', name: 'Aluminium Bracket A',     category: 'Fabrication',unitPrice: 340,  dailyDemand: 30, reorderLevel: 140 },
    { id: 'P-402', name: 'Mounting Plate',          category: 'Fabrication',unitPrice: 560,  dailyDemand: 18, reorderLevel: 80 },
  ],
  warehouses: [
    { id: 'WH-A', name: 'Warehouse Chennai', location: 'Chennai, IN', capacity: 5000 },
    { id: 'WH-B', name: 'Warehouse Mumbai',  location: 'Mumbai, IN',  capacity: 8000 },
    { id: 'WH-C', name: 'Warehouse Delhi',   location: 'Delhi, IN',   capacity: 4200 },
  ],
  inventory: [
    { warehouseId: 'WH-A', productId: 'P-104', available: 35,  reserved: 20 },
    { warehouseId: 'WH-B', productId: 'P-104', available: 180, reserved: 40 },
    { warehouseId: 'WH-A', productId: 'P-105', available: 90,  reserved: 15 },
    { warehouseId: 'WH-B', productId: 'P-201', available: 240, reserved: 60 },
    { warehouseId: 'WH-C', productId: 'P-202', available: 160, reserved: 30 },
    { warehouseId: 'WH-B', productId: 'P-301', available: 22,  reserved: 8 },
    { warehouseId: 'WH-C', productId: 'P-401', available: 310, reserved: 80 },
    { warehouseId: 'WH-A', productId: 'P-402', available: 120, reserved: 35 },
    { warehouseId: 'WH-B', productId: 'P-999', available: 14,  reserved: 0 },
  ],
  shipments: [
    { id: 'S-204', supplierId: 'SUP-001', productId: 'P-104', quantity: 100, origin: 'Mumbai, IN', destination: 'WH-A', status: 'Delayed', expectedDate: '2026-09-10', updatedDate: '2026-09-17', carrier: 'FastFreight Logistics' },
    { id: 'S-205', supplierId: 'SUP-001', productId: 'P-105', quantity: 60,  origin: 'Mumbai, IN', destination: 'WH-A', status: 'In Transit', expectedDate: '2026-09-08', carrier: 'FastFreight Logistics' },
    { id: 'S-208', supplierId: 'SUP-003', productId: 'P-201', quantity: 200, origin: 'Chennai, IN',destination: 'WH-B', status: 'In Transit', expectedDate: '2026-09-12', carrier: 'BlueHaul' },
    { id: 'S-211', supplierId: 'SUP-004', productId: 'P-301', quantity: 24,  origin: 'Delhi, IN',  destination: 'WH-B', status: 'Scheduled', expectedDate: '2026-09-14', carrier: 'TransIndia' },
    { id: 'S-214', supplierId: 'SUP-005', productId: 'P-401', quantity: 300, origin: 'Bengaluru, IN',destination:'WH-C', status: 'In Transit', expectedDate: '2026-09-09', carrier: 'BlueHaul' },
  ],
  orders: [
    { id: 'ORD-5821', customerId: 'C-104', productId: 'P-104', quantity: 40, orderDate: '2026-08-28', requiredDate: '2026-09-12', status: 'Open',    revenue: 74000,  priority: 'High' },
    { id: 'ORD-5822', customerId: 'C-108', productId: 'P-104', quantity: 30, orderDate: '2026-08-30', requiredDate: '2026-09-14', status: 'Open',    revenue: 55500,  priority: 'Medium' },
    { id: 'ORD-5823', customerId: 'C-110', productId: 'P-104', quantity: 25, orderDate: '2026-09-01', requiredDate: '2026-09-16', status: 'Picking', revenue: 46250,  priority: 'High' },
    { id: 'ORD-5830', customerId: 'C-104', productId: 'P-105', quantity: 50, orderDate: '2026-08-29', requiredDate: '2026-09-10', status: 'Open',    revenue: 46000,  priority: 'Medium' },
    { id: 'ORD-5840', customerId: 'C-115', productId: 'P-201', quantity: 80, orderDate: '2026-09-02', requiredDate: '2026-09-18', status: 'Open',    revenue: 51200,  priority: 'Medium' },
    { id: 'ORD-5841', customerId: 'C-118', productId: 'P-201', quantity: 60, orderDate: '2026-09-03', requiredDate: '2026-09-20', status: 'Open',    revenue: 38400,  priority: 'Low' },
    { id: 'ORD-5850', customerId: 'C-120', productId: 'P-301', quantity: 8,  orderDate: '2026-09-01', requiredDate: '2026-09-15', status: 'Open',    revenue: 62400,  priority: 'High' },
    { id: 'ORD-5855', customerId: 'C-110', productId: 'P-401', quantity: 120, orderDate: '2026-09-02', requiredDate: '2026-09-13', status: 'Picking', revenue: 40800,  priority: 'Medium' },
    { id: 'ORD-5860', customerId: 'C-104', productId: 'P-402', quantity: 40, orderDate: '2026-09-03', requiredDate: '2026-09-19', status: 'Open',    revenue: 22400,  priority: 'Low' },
    { id: 'ORD-5870', customerId: 'C-118', productId: 'P-301', quantity: 6,  orderDate: '2026-09-04', requiredDate: '2026-09-22', status: 'Open',    revenue: 46800,  priority: 'Medium' },
  ],
  customers: [
    { id: 'C-104', name: 'Ashok Industries',   location: 'Chennai, IN',  priority: 'Platinum' },
    { id: 'C-108', name: 'Bharat Motors',      location: 'Pune, IN',     priority: 'Gold' },
    { id: 'C-110', name: 'Coastal MechWorks',  location: 'Mangaluru, IN',priority: 'Gold' },
    { id: 'C-115', name: 'Delhi Electrics',    location: 'Delhi, IN',    priority: 'Silver' },
    { id: 'C-118', name: 'Everbright Systems', location: 'Hyderabad, IN',priority: 'Gold' },
    { id: 'C-120', name: 'Frontier Automation',location: 'Noida, IN',    priority: 'Platinum' },
  ],
};

// ---------- lookup helpers ----------
export const byId = {
  supplier: (id: string) => db.suppliers.find(s => s.id === id || s.name === id),
  product:  (id: string) => db.products.find(p => p.id === id || p.name === id),
  warehouse:(id: string) => db.warehouses.find(w => w.id === id || w.name === id),
  shipment: (id: string) => db.shipments.find(s => s.id === id),
  order:    (id: string) => db.orders.find(o => o.id === id),
  customer: (id: string) => db.customers.find(c => c.id === id),
};
export const inventoryForProduct = (pid: string) => db.inventory.filter(i => i.productId === pid);
export const shipmentsForProduct = (pid: string) => db.shipments.filter(s => s.productId === pid);
export const ordersForProduct = (pid: string) => db.orders.filter(o => o.productId === pid);
export const totalAvailable = (pid: string) => inventoryForProduct(pid).reduce((a, i) => a + i.available, 0);
export const totalReserved  = (pid: string) => inventoryForProduct(pid).reduce((a, i) => a + i.reserved, 0);
export const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
