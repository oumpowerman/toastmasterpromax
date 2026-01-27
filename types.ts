
export interface Equipment {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  resalePrice: number;
  lifespanDays: number;
}

export interface FixedCosts {
  boothRent: number;
  transport: number;
  electricityBase: number;
  laborOwner: number;
}

export interface SupplierProductInfo {
    id: string;
    price: number;
}

export interface Supplier {
  id: string;
  name: string;
  locationName?: string;
  color?: string;
  type: 'physical' | 'online';
  leadTime?: number;
  products?: SupplierProductInfo[];
  isHome?: boolean;
  mapUrl?: string;      
  websiteUrl?: string;
  distanceKm?: number;
  image?: string; // NEW: Image URL
}

export interface IngredientItem {
  id: string;
  name: string;
  cost: number;
  masterId?: string;
  image?: string; 
  quantity?: number;
  unit?: string;
  costPerUnit?: number; // Added to prevent zero-cost bug when quantity is 0
}

export interface IngredientLibraryItem {
  id: string;
  name: string;
  details?: string;
  category?: 'ingredient' | 'packaging' | 'asset'; 
  subCategory?: string; 
  type?: 'single' | 'composite'; 
  image?: string;
  bulkPrice: number;
  unitType: 'unit' | 'weight';
  unit?: string; 
  totalQuantity: number;
  usagePerUnit: number;
  costPerUnit: number;
  supplierId?: string;
  subIngredients?: { 
    id: string; 
    name: string; 
    quantity: number;
    cost: number;
  }[]; 
}

export interface MenuItem {
  id: string;
  name: string;
  sellingPrice: number;
  ingredients: IngredientItem[];
  category?: string; 
  image?: string;
  tags?: string[]; 
}

export interface HiddenCostPercentages {
  waste: number;
  promoLoss: number;
  paymentFee: number;
}

export interface Pricing {
  basePrice: number;
  promoType: 'none' | 'bundle';
  bundleQty: number;
  bundlePrice: number;
}

export interface TrafficData {
  openHours: number;
  customersPerHour: number;
  conversionRate: number;
  avgUnitPerBill: number;
}

export interface LedgerItem {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  title: string;
  amount: number;
  channel?: 'cash' | 'transfer' | 'delivery' | 'other';
  slipItems?: { name: string; price: number }[];
  slipImage?: string;
  note?: string;
}

export interface InventoryBatch {
    id: string;
    quantity: number; 
    originalQuantity: number; 
    costPerUnit: number;
    receivedDate: string;
    expiryDate?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number; 
  unit: string;
  minLevel: number;
  costPerUnit?: number; 
  lastUpdated: string;
  image?: string;
  expiryDate?: string; 
  batches?: InventoryBatch[]; 
  
  category?: string; 
  subCategory?: string; // Used for Taxonomy Category

  type?: 'stock' | 'asset'; 
  status?: 'active' | 'repair' | 'broken' | 'lost'; 
  assetCode?: string; // NEW: Running Number
  salvagePrice?: number; 
  lifespanDays?: number; 
  dailyDepreciation?: number; 
  purchaseDate?: string; 
  notes?: string; 

  isGroup?: boolean;
  linkedAssets?: InventoryItem[]; 
}

// NEW: Inventory Log for History
export interface InventoryLog {
    id: string;
    inventoryItemId: string;
    type: 'in' | 'out' | 'audit';
    reason: string;
    quantityChange: number;
    newBalance?: number;
    refId?: string;
    createdAt: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  category: 'equipment' | 'ingredient' | 'misc';
  isChecked: boolean;
  quantity: number;
  unit: string;
}

export interface ChecklistPreset {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface OrderItem {
    id: string;
    menuId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    modifiers?: string[];
    toppings?: { id: string; name: string; price: number; refId?: string }[]; 
    image?: string; 
}

export interface Order {
    id: string;
    queueNumber: number;
    timestamp: string;
    status: 'pending' | 'cooking' | 'completed' | 'cancelled';
    items: OrderItem[];
    totalPrice: number;
    netTotal: number;
    paymentMethod: 'cash' | 'transfer' | 'delivery';
    channel?: string;
    gpDeduction: number;
}

export interface NeededItem {
    id: string;      
    name: string;
    current: number;
    toBuy: number;
    unit: string;
    usagePerDay: number;
    daysLeft: number; 
    libId: string;
    isUrgent: boolean;
}

export interface CostBreakdown {
    supplierName: string;
    productCost: number;
    logisticsCost: number;
    totalCost: number;
    note: string;
    isFeasible: boolean;
    leadTime: number;
    daysLeft: number;
}

export interface PurchaseOption {
    item: NeededItem;
    supplierId: string;
    supplierName: string;
    supplierType: 'online' | 'physical';
    unitPrice: number;
    qty: number;
    totalProductCost: number;
    reason: string;
    analysis: {
        winner: CostBreakdown;
        runnerUp?: CostBreakdown;
        allOptions: CostBreakdown[];
    };
}

export interface RouteGroup {
    supplier: Supplier;
    items: PurchaseOption[];
    totalCost: number;
}

export interface CartItemState {
    itemId: string;
    actualQty: number;
    actualPrice: number;
    isComplete: boolean;
    syncStandardPrice?: boolean; 
}

export interface ShopMember {
    id: string;
    userId: string; 
    ownerId: string; 
    role: 'owner' | 'manager' | 'staff';
    joinedAt: string;
}

// NEW: Asset Taxonomy Interface
export interface AssetCategory {
    id: string;
    name: string;
    isSystem: boolean; // Cannot delete
    types: string[]; // Sub-types e.g. "Knife", "Pot"
}

export interface AppState {
  appMode?: 'real' | 'sim'; // NEW: Application Mode

  equipment: Equipment[]; 
  fixedCosts: FixedCosts;
  menuItems: MenuItem[];
  centralIngredients: IngredientLibraryItem[]; 
  suppliers: Supplier[];
  ledger: LedgerItem[];
  inventory: InventoryItem[];
  checklist: ChecklistItem[];
  checklistPresets: ChecklistPreset[];
  orders: Order[];
  hiddenPercentages: HiddenCostPercentages;
  pricing: Pricing;
  traffic: TrafficData;
  isWorstCase: boolean;
  
  // NEW: Asset Taxonomy
  assetTaxonomy: AssetCategory[];

  // NEW: Simulation Sandbox
  simulationDraft: AppState | null;

  activeShopId?: string; 
  userRole?: 'owner' | 'manager' | 'staff';
}
