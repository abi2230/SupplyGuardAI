import type { SupplyChainDB } from './db';
import { db, byId, inventoryForProduct, shipmentsForProduct, ordersForProduct, totalAvailable, daysBetween, TODAY } from './db';

// ---------- Scenarios ----------
export interface Scenario {
  id: string;
  title: string;
  category: 'Supplier Failure' | 'Carrier Delay' | 'Warehouse Incident' | 'No Impact' | 'Ambiguous';
  description: string;
  inputText: string;
  expected: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'sc1',
    title: 'Major Supplier Failure',
    category: 'Supplier Failure',
    description: 'Supplier Alpha halts production of P-104 for 7 days. Multiple shipments and customer orders affected.',
    expected: 'Critical impact across shipments, inventory and high-priority orders.',
    inputText:
      'URGENT NOTICE — Supplier Alpha will stop manufacturing Product P-104 for the next 7 days due to an unexpected production line failure. Shipment S-204 scheduled for delivery on September 10 will be delayed. Please review affected orders and advise.',
  },
  {
    id: 'sc2',
    title: 'Carrier Delay',
    category: 'Carrier Delay',
    description: 'A carrier delays one shipment by 3 days. Inventory buffer may absorb the gap.',
    expected: 'Medium impact — buffer inventory covers most of the delay.',
    inputText:
      'Logistics update from BlueHaul: Shipment S-214 from Supplier Epsilon is delayed by 3 days due to regional flooding. New expected arrival Sep 12. Product P-401.',
  },
  {
    id: 'sc3',
    title: 'Warehouse Incident',
    category: 'Warehouse Incident',
    description: 'Inventory at Warehouse Chennai is temporarily unavailable due to a facility incident.',
    expected: 'High local impact — alternate warehouse Mumbai holds buffer stock.',
    inputText:
      'Incident report: Warehouse Chennai (WH-A) experienced a storage bay flood. Inventory of Product P-104 located at WH-A is currently inaccessible for the next 6 days. Please assess customer order impact.',
  },
  {
    id: 'sc4',
    title: 'No Business Impact',
    category: 'No Impact',
    description: 'A serious-sounding notice about a product with no active shipments or affected orders.',
    expected: 'No current business impact — disruption acknowledged, no action required.',
    inputText:
      'Notice from Supplier Beta: production of Product P-999 has been temporarily paused for 5 days due to a component shortage. Please confirm whether any orders are affected.',
  },
  {
    id: 'sc5',
    title: 'Ambiguous Notice',
    category: 'Ambiguous',
    description: 'Vague notice referencing an unrecognised supplier and product — requires human review.',
    expected: 'Human review required — entities cannot be confidently matched.',
    inputText:
      'Hi team, our contact mentioned that one of our key vendors will be facing some issues next week with a critical component. Not sure exactly which product or shipment this affects, but thought we should flag it. Might be the servo line or maybe the bearing order.',
  },
];

// ---------- Extraction ----------
// Deterministic entity extraction + fuzzy matching against db.
// This is the bridge between unstructured text and structured data.
export interface ExtractedEntities {
  suppliers: { id: string; name: string; matched: boolean; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  products:  { id: string; name: string; matched: boolean; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  shipments: { id: string; matched: boolean; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  warehouses:{ id: string; name: string; matched: boolean; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  delayDays: number | null;
  disruptionType: string;
  rawText: string;
  ambiguous: boolean;
  ambiguityReason?: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

export function extractEntities(text: string): ExtractedEntities {
  const t = norm(text);

  const suppliers = db.suppliers
    .map(s => {
      const key = norm(s.name);
      const id = norm(s.id);
      const hit = t.includes(key) || t.includes(id) || t.includes(norm(s.name.replace('Supplier ', '')));
      return { id: s.id, name: s.name, matched: hit, confidence: hit ? 'HIGH' as const : 'LOW' as const };
    })
    .filter(s => s.matched);

  const products = db.products
    .map(p => {
      const id = norm(p.id);
      const name = norm(p.name);
      const hit = t.includes(id) || t.includes(name) || (name.length > 6 && t.includes(name.slice(0, 10)));
      return { id: p.id, name: p.name, matched: hit, confidence: hit ? 'HIGH' as const : 'LOW' as const };
    })
    .filter(p => p.matched);

  const shipments = db.shipments
    .map(s => {
      const hit = t.includes(norm(s.id));
      return { id: s.id, matched: hit, confidence: hit ? 'HIGH' as const : 'LOW' as const };
    })
    .filter(s => s.matched);

  const warehouses = db.warehouses
    .map(w => {
      const hit = t.includes(norm(w.id)) || t.includes(norm(w.name)) || t.includes(norm(w.location));
      return { id: w.id, name: w.name, matched: hit, confidence: hit ? 'HIGH' as const : 'LOW' as const };
    })
    .filter(w => w.matched);

  // delay days
  const delayMatch = text.match(/(\d+)\s*day/i);
  const delayDays = delayMatch ? parseInt(delayMatch[1], 10) : null;

  // disruption type
  let disruptionType = 'Disruption';
  if (/halt|stop|pause|production issue|line failure/i.test(text)) disruptionType = 'Supplier Production Halt';
  else if (/delay|flood|carrier|transit|shipping/i.test(text)) disruptionType = 'Carrier / Shipping Delay';
  else if (/warehouse|incident|flood|storage|inaccessible/i.test(text)) disruptionType = 'Warehouse Incident';
  else if (/component shortage|shortage/i.test(text)) disruptionType = 'Component Shortage';

  const foundAny = suppliers.length || products.length || shipments.length || warehouses.length;
  const vague = /^(hi|hello|hey|please|kindly|urgent|notice)/i.test(text.trim()) && !foundAny && text.split(/\s+/).length < 60;
  const ambiguous = !foundAny || vague || (text.includes('maybe') && suppliers.length === 0 && shipments.length === 0);
  const ambiguityReason = ambiguous
    ? (!foundAny
      ? 'No recognised supplier, product, or shipment could be matched from the notice.'
      : vague
      ? 'The notice is too vague to confidently identify affected entities.'
      : 'Multiple ambiguous references — entities could not be confidently matched to the catalogue.')
    : undefined;

  return {
    suppliers, products, shipments, warehouses,
    delayDays, disruptionType, rawText: text, ambiguous, ambiguityReason,
  };
}

// ---------- Impact Analysis (deterministic) ----------
export interface InventoryRisk {
  productId: string; productName: string;
  available: number; reserved: number; dailyDemand: number;
  daysRemaining: number; reorderLevel: number;
  incomingShipmentId?: string; incomingEta?: string; incomingDelayed: boolean;
  stockOutRisk: 'STOCK-OUT LIKELY' | 'AT RISK' | 'SAFE';
  warehouses: { id: string; name: string; available: number; reserved: number }[];
}

export interface AffectedOrder {
  order: ReturnType<typeof ordersForProduct>[number];
  customerName: string; customerPriority: string;
  productName: string;
  currentEta: string; newEta: string; daysDelayed: number;
  revenueImpact: number; recommendedAction: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface GraphNode {
  id: string; type: 'Supplier' | 'Shipment' | 'Warehouse' | 'Product' | 'Order' | 'Customer';
  label: string; sublabel?: string; status?: string;
}
export interface GraphEdge { from: string; to: string; label?: string; }

export interface ImpactGraph { nodes: GraphNode[]; edges: GraphEdge[]; }

export interface Finding {
  id: string;
  statement: string;
  evidence: { ref: string; detail: string }[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
}

export interface ImpactAnalysis {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  disruptionType: string;
  delayDays: number | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEEDS_VERIFICATION';
  affectedShipments: SupplyChainDB['shipments'];
  affectedProducts: SupplyChainDB['products'];
  affectedOrders: AffectedOrder[];
  affectedCustomers: SupplyChainDB['customers'];
  inventoryRisks: InventoryRisk[];
  graph: ImpactGraph;
  findings: Finding[];
  kpis: {
    productsAffected: number;
    unitsAtRisk: number;
    shipmentsDelayed: number;
    ordersAffected: number;
    customersAffected: number;
    revenueAtRisk: number;
    earliestAffectedDate: string | null;
  };
  noImpact: boolean;
  needsReview: boolean;
  reviewReason?: string;
}

export function analyzeDisruption(text: string): ImpactAnalysis {
  const ent = extractEntities(text);

  // Ambiguous -> human review
  if (ent.ambiguous) {
    return {
      severity: 'NONE', disruptionType: ent.disruptionType, delayDays: ent.delayDays,
      confidence: 'NEEDS_VERIFICATION',
      affectedShipments: [], affectedProducts: [], affectedOrders: [], affectedCustomers: [],
      inventoryRisks: [], graph: { nodes: [], edges: [] }, findings: [],
      kpis: { productsAffected: 0, unitsAtRisk: 0, shipmentsDelayed: 0, ordersAffected: 0, customersAffected: 0, revenueAtRisk: 0, earliestAffectedDate: null },
      noImpact: false, needsReview: true, reviewReason: ent.ambiguityReason,
    };
  }

  const delayDays = ent.delayDays ?? 7;
  const productIds = new Set<string>(ent.products.map(p => p.id));

  // Add products from matched shipments
  ent.shipments.forEach(s => {
    const sh = byId.shipment(s.id);
    if (sh) productIds.add(sh.productId);
  });
  // Add products from matched suppliers
  ent.suppliers.forEach(s => {
    const sup = byId.supplier(s.id);
    if (sup) sup.products.forEach(p => productIds.add(p));
  });

  // Warehouse incident: mark inventory at that warehouse unavailable
  const affectedWarehouseIds = new Set(ent.warehouses.map(w => w.id));

  const affectedShipments = db.shipments.filter(sh =>
    productIds.has(sh.productId) || ent.shipments.some(s => s.id === sh.id)
  ).map(sh => {
    if (ent.shipments.some(s => s.id === sh.id) || productIds.has(sh.productId)) {
      // If shipment explicitly mentioned or product is affected, mark delayed
      if (sh.status !== 'Delivered') {
        const updated = sh.updatedDate ?? addDays(sh.expectedDate, delayDays);
        return { ...sh, status: 'Delayed' as const, updatedDate: updated };
      }
    }
    return sh;
  }).filter(sh => sh.status === 'Delayed' || ent.shipments.some(s => s.id === sh.id));

  const affectedProducts = db.products.filter(p => productIds.has(p.id));

  // Inventory risk
  const inventoryRisks: InventoryRisk[] = affectedProducts.map(p => {
    const inv = inventoryForProduct(p.id);
    const avail = inv.reduce((a, i) => a + i.available, 0);
    const reserved = inv.reduce((a, i) => a + i.reserved, 0);
    const daysRemaining = p.dailyDemand > 0 ? +(avail / p.dailyDemand).toFixed(1) : 999;
    const incoming = db.shipments.find(s => s.productId === p.id && s.status !== 'Delivered');
    const incomingDelayed = incoming?.status === 'Delayed';
    const incomingEta = incoming?.updatedDate ?? incoming?.expectedDate;
    const risk: InventoryRisk['stockOutRisk'] =
      daysRemaining < delayDays ? 'STOCK-OUT LIKELY' :
      daysRemaining < delayDays * 1.6 ? 'AT RISK' : 'SAFE';
    return {
      productId: p.id, productName: p.name,
      available: avail, reserved, dailyDemand: p.dailyDemand,
      daysRemaining, reorderLevel: p.reorderLevel,
      incomingShipmentId: incoming?.id, incomingEta, incomingDelayed,
      stockOutRisk: risk,
      warehouses: inv.map(i => ({ id: i.warehouseId, name: byId.warehouse(i.warehouseId)?.name ?? i.warehouseId, available: i.available, reserved: i.reserved })),
    };
  });

  // Affected orders
  const affectedOrders: AffectedOrder[] = [];
  affectedProducts.forEach(p => {
    ordersForProduct(p.id).forEach(o => {
      const cust = byId.customer(o.customerId);
      const shipment = affectedShipments.find(s => s.productId === p.id);
      const currentEta = shipment?.expectedDate ?? o.requiredDate;
      const newEta = shipment?.updatedDate ?? addDays(currentEta, delayDays);
      const daysDelayed = daysBetween(currentEta, newEta);
      const risk = inventoryRisks.find(r => r.productId === p.id);
      let action = 'Monitor';
      if (risk?.stockOutRisk === 'STOCK-OUT LIKELY') {
        if (totalAvailable(p.id) > 0) action = 'Reallocate inventory from alternate warehouse';
        else action = 'Expedite replacement shipment';
      } else if (risk?.stockOutRisk === 'AT RISK') {
        action = 'Part-ship available stock, hold remainder';
      } else if (daysDelayed <= 3) {
        action = 'Notify customer of revised ETA';
      } else {
        action = 'Expedite shipment';
      }
      affectedOrders.push({
        order: o, customerName: cust?.name ?? o.customerId, customerPriority: cust?.priority ?? 'Silver',
        productName: p.name, currentEta, newEta, daysDelayed,
        revenueImpact: o.revenue, recommendedAction: action, priority: o.priority,
      });
    });
  });

  const affectedCustomers = db.customers.filter(c => affectedOrders.some(o => o.order.customerId === c.id));

  // Graph
  const graph = buildGraph(ent, affectedShipments, affectedProducts, affectedOrders);

  // Findings
  const findings: Finding[] = [];
  affectedShipments.forEach(s => {
    const prod = byId.product(s.productId);
    findings.push({
      id: `F-${s.id}`,
      statement: `Shipment ${s.id} (${prod?.name ?? s.productId}) is delayed. Original ETA ${s.expectedDate} → new ETA ${s.updatedDate}.`,
      evidence: [
        { ref: `[Shipment ${s.id}]`, detail: `Status: ${s.status}, Qty: ${s.quantity}, Carrier: ${s.carrier}` },
        { ref: `[Product ${s.productId}]`, detail: `${prod?.name} — ${prod?.category}` },
        { ref: `[Supplier ${s.supplierId}]`, detail: byId.supplier(s.supplierId)?.name ?? s.supplierId },
      ],
      severity: 'HIGH',
    });
  });
  inventoryRisks.forEach(r => {
    if (r.stockOutRisk !== 'SAFE') {
      findings.push({
        id: `F-${r.productId}`,
        statement: `Product ${r.productId} (${r.productName}) will stock out in ~${r.daysRemaining} days; incoming shipment is ${r.incomingDelayed ? 'delayed' : 'on schedule'}.`,
        evidence: [
          { ref: `[Inventory ${r.productId}]`, detail: `Available ${r.available}, Reserved ${r.reserved}, Daily demand ${r.dailyDemand}` },
          { ref: `[Shipment ${r.incomingShipmentId ?? '—'}]`, detail: `ETA ${r.incomingEta ?? 'n/a'}, ${r.incomingDelayed ? 'Delayed' : 'On time'}` },
        ],
        severity: r.stockOutRisk === 'STOCK-OUT LIKELY' ? 'CRITICAL' : 'MEDIUM',
      });
    }
  });
  affectedOrders.forEach(o => {
    findings.push({
      id: `F-${o.order.id}`,
      statement: `Order ${o.order.id} (${o.customerName}) is likely to be delayed by ${o.daysDelayed} days.`,
      evidence: [
        { ref: `[Order ${o.order.id}]`, detail: `Qty ${o.order.quantity}, Required ${o.order.requiredDate}, Revenue ₹${o.revenueImpact.toLocaleString('en-IN')}` },
        { ref: `[Customer ${o.order.customerId}]`, detail: `${o.customerName} — ${o.customerPriority} priority` },
        { ref: `[Product ${o.order.productId}]`, detail: o.productName },
      ],
      severity: o.priority === 'High' ? 'HIGH' : 'MEDIUM',
    });
  });

  // KPIs
  const unitsAtRisk = affectedOrders.reduce((a, o) => a + o.order.quantity, 0);
  const revenueAtRisk = affectedOrders.reduce((a, o) => a + o.revenueImpact, 0);
  const earliestAffectedDate = affectedShipments.length
    ? affectedShipments.map(s => s.updatedDate ?? s.expectedDate).sort()[0]
    : affectedOrders.length ? affectedOrders.map(o => o.newEta).sort()[0] : null;

  const noImpact = affectedShipments.length === 0 && affectedOrders.length === 0 && inventoryRisks.every(r => r.stockOutRisk === 'SAFE');

  // Severity
  let severity: ImpactAnalysis['severity'] = 'LOW';
  if (noImpact) severity = 'NONE';
  else if (inventoryRisks.some(r => r.stockOutRisk === 'STOCK-OUT LIKELY') || revenueAtRisk > 150000) severity = 'CRITICAL';
  else if (revenueAtRisk > 50000 || affectedOrders.length >= 3) severity = 'HIGH';
  else if (affectedOrders.length > 0) severity = 'MEDIUM';

  return {
    severity, disruptionType: ent.disruptionType, delayDays,
    confidence: ent.ambiguous ? 'NEEDS_VERIFICATION' : (ent.suppliers.length && ent.shipments.length ? 'HIGH' : ent.suppliers.length || ent.products.length ? 'MEDIUM' : 'LOW'),
    affectedShipments, affectedProducts, affectedOrders, affectedCustomers,
    inventoryRisks, graph, findings,
    kpis: { productsAffected: affectedProducts.length, unitsAtRisk, shipmentsDelayed: affectedShipments.length, ordersAffected: affectedOrders.length, customersAffected: affectedCustomers.length, revenueAtRisk, earliestAffectedDate },
    noImpact, needsReview: false,
  };
}

function addDays(date: string, days: number) {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildGraph(ent: ExtractedEntities, shipments: SupplyChainDB['shipments'], products: SupplyChainDB['products'], orders: AffectedOrder[]): ImpactGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeIds = new Set<string>();

  const addNode = (n: GraphNode) => { if (!nodeIds.has(n.id)) { nodes.push(n); nodeIds.add(n.id); } };
  const addEdge = (from: string, to: string, label?: string) => edges.push({ from, to, label });

  ent.suppliers.forEach(s => {
    const sup = byId.supplier(s.id);
    addNode({ id: sup!.id, type: 'Supplier', label: sup!.name, sublabel: sup!.location, status: 'Disrupted' });
  });

  shipments.forEach(sh => {
    const prod = byId.product(sh.productId);
    addNode({ id: sh.id, type: 'Shipment', label: sh.id, sublabel: `Qty ${sh.quantity} · ${prod?.name ?? sh.productId}`, status: sh.status });
    if (ent.suppliers.some(s => s.id === sh.supplierId)) addEdge(sh.supplierId, sh.id, 'ships');
    const wh = byId.warehouse(sh.destination);
    if (wh) {
      addNode({ id: wh.id, type: 'Warehouse', label: wh.name, sublabel: wh.location, status: 'Active' });
      addEdge(sh.id, wh.id, 'arrives at');
    }
  });

  products.forEach(p => {
    addNode({ id: p.id, type: 'Product', label: p.name, sublabel: p.id, status: 'At risk' });
    shipments.filter(s => s.productId === p.id).forEach(s => addEdge(s.destination, p.id, 'stocks'));
  });

  orders.forEach(o => {
    addNode({ id: o.order.id, type: 'Order', label: o.order.id, sublabel: `${o.order.quantity} units · ${o.customerName}`, status: o.daysDelayed > 0 ? 'Delayed' : 'Open' });
    addEdge(o.order.productId, o.order.id, 'fulfills');
    const cust = byId.customer(o.order.customerId);
    if (cust) {
      addNode({ id: cust.id, type: 'Customer', label: cust.name, sublabel: cust.location, status: cust.priority });
      addEdge(o.order.id, cust.id, 'delivers to');
    }
  });

  return { nodes, edges };
}

// ---------- Response Planner (deterministic generation) ----------
export interface ResponseOption {
  id: string; label: string; description: string;
  cost: number; costLabel: string;
  expectedDelayDays: number; customerImpact: 'Low' | 'Medium' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  advantages: string[]; disadvantages: string[];
  assumptions: string[]; evidence: string[];
  recommended: boolean;
}

export function generateResponseOptions(impact: ImpactAnalysis): ResponseOption[] {
  if (impact.noImpact || impact.needsReview || impact.affectedOrders.length === 0) return [];

  const opts: ResponseOption[] = [];
  const hasAlternateInv = impact.inventoryRisks.some(r => r.warehouses.length > 1 && r.warehouses.some(w => w.available > 30));
  const totalAtRisk = impact.kpis.unitsAtRisk;
  const revenue = impact.kpis.revenueAtRisk;

  // Option A — Expedite
  opts.push({
    id: 'A', label: 'Expedite Shipment', description: 'Upgrade carrier to priority freight to reduce transit time on the delayed shipment.',
    cost: 35000, costLabel: '₹35,000',
    expectedDelayDays: 1, customerImpact: 'Low', risk: 'Low',
    advantages: ['Fastest recovery of supply', 'Minimal customer communication overhead', 'Preserves existing order commitments'],
    disadvantages: ['Higher freight cost', 'Subject to carrier availability', 'Does not address stock-out window fully'],
    assumptions: ['Expedited carrier has capacity within 24h', 'Supplier can release goods for pickup'],
    evidence: [`[Shipment ${impact.affectedShipments[0]?.id}]`],
    recommended: false,
  });

  // Option B — Reallocate inventory
  if (hasAlternateInv) {
    opts.push({
      id: 'B', label: 'Reallocate Inventory', description: 'Transfer available stock from an unaffected warehouse to cover priority orders during the delay.',
      cost: 12000, costLabel: '₹12,000',
      expectedDelayDays: 2, customerImpact: 'Medium', risk: 'Medium',
      advantages: ['Lower cost than expedite', 'Uses existing stock immediately', 'Reduces stock-out window for high-priority orders'],
      disadvantages: ['Depletes buffer at source warehouse', 'Inter-warehouse transfer time', 'May not cover full shortage if demand is high'],
      assumptions: ['Source warehouse has unreserved stock', 'Transfer transit ≤ 2 days'],
      evidence: impact.inventoryRisks.filter(r => r.warehouses.some(w => w.available > 30)).map(r => `[Inventory ${r.productId} @ ${r.warehouses.find(w => w.available > 30)?.name}]`),
      recommended: true,
    });
  }

  // Option C — Part-ship
  opts.push({
    id: 'C', label: 'Part-Ship Orders', description: 'Ship partial quantities from available stock now; fulfil remainder when the delayed shipment arrives.',
    cost: 8000, costLabel: '₹8,000',
    expectedDelayDays: 3, customerImpact: 'Medium', risk: 'Medium',
    advantages: ['Lowest cost option', 'Maintains partial customer fulfilment', 'Spreads impact across orders'],
    disadvantages: ['Customers receive split deliveries', 'Higher coordination overhead', 'Does not eliminate delay'],
    assumptions: ['Customers accept partial shipments', 'Available stock can cover partial quantities'],
    evidence: [`[Orders ${impact.affectedOrders.slice(0, 3).map(o => o.order.id).join(', ')}]`],
    recommended: false,
  });

  // Option D — Notify only
  opts.push({
    id: 'D', label: 'Notify Customers', description: 'Accept the delay and proactively notify affected customers with revised ETAs. No operational change.',
    cost: 2000, costLabel: '₹2,000',
    expectedDelayDays: impact.delayDays ?? 7, customerImpact: 'High', risk: 'High',
    advantages: ['No additional spend', 'Transparent communication', 'Preserves inventory buffers'],
    disadvantages: ['Customer dissatisfaction likely', 'Risk of order cancellation', 'Revenue at risk remains uncovered'],
    assumptions: ['Customers tolerate the delay', 'No SLA penalties triggered'],
    evidence: [`[Revenue at risk ₹${revenue.toLocaleString('en-IN')}]`, `[Units at risk ${totalAtRisk}]`],
    recommended: false,
  });

  return opts;
}

export function recommendationRationale(impact: ImpactAnalysis, opts: ResponseOption[]): string {
  const rec = opts.find(o => o.recommended) ?? opts[0];
  if (!rec) return '';
  const risk = impact.inventoryRisks.find(r => r.stockOutRisk === 'STOCK-OUT LIKELY');
  const altWh = risk?.warehouses.find(w => w.available > 30 && w.id !== 'WH-A');
  const lines: string[] = [];
  if (rec.id === 'B' && altWh) {
    lines.push(`Warehouse ${altWh.name} has ${altWh.available} available units while ${risk?.warehouses.find(w => w.id !== altWh.id)?.name ?? 'the primary warehouse'} is projected to stock out in ~${risk?.daysRemaining} days.`);
    lines.push(`Reallocating from ${altWh.name} reduces the stock-out window for ${impact.kpis.unitsAtRisk} units at risk, while expediting the delayed shipment limits the remaining shortage.`);
  } else if (rec.id === 'A') {
    lines.push(`Expedited freight recovers supply within ~1 day at ₹35,000 — the lowest customer-impact option given ${impact.kpis.ordersAffected} orders and ₹${impact.kpis.revenueAtRisk.toLocaleString('en-IN')} revenue at risk.`);
  } else {
    lines.push(`${rec.label} is the lowest-cost pragmatic option given current inventory and shipment status.`);
  }
  lines.push(`Evidence: ${impact.affectedShipments.map(s => `[Shipment ${s.id}]`).join(', ')} and ${impact.inventoryRisks.map(r => `[Inventory ${r.productId}]`).join(', ')}.`);
  return lines.join(' ');
}

// ---------- Copilot (deterministic Q&A over data) ----------
export interface CopilotMessage { role: 'user' | 'assistant'; content: string; citations?: string[]; }

export function copilotAnswer(q: string, impact: ImpactAnalysis | null): CopilotMessage {
  const query = norm(q);

  if (/urgent|most urgent|priority/.test(query)) {
    if (!impact || impact.affectedOrders.length === 0) return { role: 'assistant', content: 'No affected orders in the current analysis. Analyze a disruption to see priority orders.' };
    const sorted = [...impact.affectedOrders].sort((a, b) => (a.priority === 'High' ? -1 : 1) - (b.priority === 'High' ? -1 : 1) || b.revenueImpact - a.revenueImpact);
    const top = sorted.slice(0, 3);
    return {
      role: 'assistant',
      content: `The most urgent orders are:\n${top.map(o => `• ${o.order.id} — ${o.customerName} (${o.customerPriority}), ${o.order.quantity} units, ₹${o.revenueImpact.toLocaleString('en-IN')}, ${o.daysDelayed}d delay`).join('\n')}`,
      citations: top.map(o => `[Order ${o.order.id}]`),
    };
  }
  if (/stock.?out|stockout|first/.test(query)) {
    if (!impact || impact.inventoryRisks.length === 0) return { role: 'assistant', content: 'No inventory risk data available for the current analysis.' };
    const sorted = [...impact.inventoryRisks].sort((a, b) => a.daysRemaining - b.daysRemaining);
    const top = sorted[0];
    return {
      role: 'assistant',
      content: `${top.productName} (${top.productId}) will stock out first — approximately ${top.daysRemaining} days of inventory remaining at ${top.dailyDemand} units/day demand. Incoming shipment ${top.incomingShipmentId ?? '—'} is ${top.incomingDelayed ? 'delayed' : 'on time'}.`,
      citations: [`[Inventory ${top.productId}]`, top.incomingShipmentId ? `[Shipment ${top.incomingShipmentId}]` : ''].filter(Boolean),
    };
  }
  if (/don.t expedite|no expedite|without expedite|if we do nothing/.test(query)) {
    if (!impact) return { role: 'assistant', content: 'Analyze a disruption first to model the no-action scenario.' };
    if (impact.noImpact) return { role: 'assistant', content: 'There is no current business impact, so no action is needed.' };
    return {
      role: 'assistant',
      content: `Without expediting: ${impact.kpis.ordersAffected} orders representing ₹${impact.kpis.revenueAtRisk.toLocaleString('en-IN')} would slip by ~${impact.delayDays ?? 7} days. ${impact.inventoryRisks.filter(r => r.stockOutRisk === 'STOCK-OUT LIKELY').length} product(s) are likely to stock out before the delayed shipment arrives.`,
      citations: impact.affectedOrders.slice(0, 3).map(o => `[Order ${o.order.id}]`),
    };
  }
  if (/warehouse|replacement|alternate|alternate stock|reallocate/.test(query)) {
    if (!impact) return { role: 'assistant', content: 'Analyze a disruption first so I can identify warehouses with replacement stock.' };
    const candidates = impact.inventoryRisks.flatMap(r => r.warehouses.filter(w => w.available > 30).map(w => ({ ...w, productId: r.productId, productName: r.productName })));
    if (candidates.length === 0) return { role: 'assistant', content: 'No warehouse currently holds sufficient replacement stock for the affected products.' };
    return {
      role: 'assistant',
      content: `Warehouses with replacement stock:\n${candidates.map(c => `• ${c.name} — ${c.available} units of ${c.productName} (${c.productId})`).join('\n')}`,
      citations: candidates.map(c => `[Inventory ${c.productId} @ ${c.name}]`),
    };
  }
  if (/why.*recommend|recommend.*why|rationale|explain.*recommend/.test(query)) {
    if (!impact) return { role: 'assistant', content: 'Analyze a disruption to see a recommendation.' };
    const opts = generateResponseOptions(impact);
    return { role: 'assistant', content: recommendationRationale(impact, opts), citations: opts.find(o => o.recommended)?.evidence };
  }
  if (/evidence|show me the evidence|proof/.test(query)) {
    if (!impact || impact.findings.length === 0) return { role: 'assistant', content: 'No findings yet. Analyze a disruption to generate evidence-backed findings.' };
    return {
      role: 'assistant',
      content: `Here are the key findings with evidence:\n${impact.findings.slice(0, 4).map(f => `• ${f.statement}\n  Evidence: ${f.evidence.map(e => e.ref).join(', ')}`).join('\n')}`,
      citations: impact.findings.slice(0, 4).flatMap(f => f.evidence.map(e => e.ref)),
    };
  }
  if (/hello|hi|help|what can you/.test(query)) {
    return { role: 'assistant', content: 'I am your supply chain copilot. Ask me about urgent orders, stock-out risk, replacement warehouses, or the rationale behind a recommendation. I answer only from the application\u2019s data.' };
  }
  return { role: 'assistant', content: 'I don\u2019t have enough data to answer that reliably. Try asking about urgent orders, stock-out risk, replacement warehouses, or the recommendation rationale.' };
}

// ---------- Analytics (deterministic aggregates) ----------
export interface Analytics {
  disruptionsByType: { type: string; count: number }[];
  ordersAffectedTrend: { week: string; count: number }[];
  inventoryRisk: { productId: string; productName: string; daysRemaining: number; risk: string }[];
  supplierReliability: { supplier: string; score: number }[];
  shipmentDelays: { shipmentId: string; daysDelayed: number }[];
  revenueAtRisk: { category: string; revenue: number }[];
  responseComparison: { option: string; cost: number; delayDays: number; impact: string }[];
}

export function computeAnalytics(): Analytics {
  const disruptionsByType = [
    { type: 'Supplier Halt', count: 3 },
    { type: 'Carrier Delay', count: 5 },
    { type: 'Warehouse Incident', count: 2 },
    { type: 'Component Shortage', count: 1 },
  ];
  const ordersAffectedTrend = [
    { week: 'W31', count: 4 }, { week: 'W32', count: 7 }, { week: 'W33', count: 5 },
    { week: 'W34', count: 9 }, { week: 'W35', count: 6 }, { week: 'W36', count: 11 },
  ];
  const inventoryRisk = db.products.map(p => {
    const avail = inventoryForProduct(p.id).reduce((a, i) => a + i.available, 0);
    const days = p.dailyDemand > 0 ? +(avail / p.dailyDemand).toFixed(1) : 999;
    return { productId: p.id, productName: p.name, daysRemaining: days, risk: days < 5 ? 'High' : days < 12 ? 'Medium' : 'Low' };
  });
  const supplierReliability = db.suppliers.map(s => ({ supplier: s.name, score: s.reliabilityScore }));
  const shipmentDelays = db.shipments.filter(s => s.status === 'Delayed' && s.updatedDate).map(s => ({ shipmentId: s.id, daysDelayed: daysBetween(s.expectedDate, s.updatedDate!) }));
  const revenueAtRisk = db.products.filter(p => ordersForProduct(p.id).length > 0).map(p => ({
    category: p.category, revenue: ordersForProduct(p.id).reduce((a, o) => a + o.revenue, 0),
  }));
  const responseComparison = [
    { option: 'Expedite', cost: 35000, delayDays: 1, impact: 'Low' },
    { option: 'Reallocate', cost: 12000, delayDays: 2, impact: 'Medium' },
    { option: 'Part-Ship', cost: 8000, delayDays: 3, impact: 'Medium' },
    { option: 'Notify Only', cost: 2000, delayDays: 7, impact: 'High' },
  ];
  return { disruptionsByType, ordersAffectedTrend, inventoryRisk, supplierReliability, shipmentDelays, revenueAtRisk, responseComparison };
}
