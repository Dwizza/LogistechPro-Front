export interface ProductWarehouse {
    warehouseId: number;
    warehouseCode: string;
    warehouseName: string;
    qtyOnHand: number;
    qtyReserved: number;
    qtyAvailable: number;
    price: number;
}

export interface Product {
    id?: number;
    sku: string;
    name: string;
    category: string;
    avgPrice: number;
    active: boolean;
    description?: string;
    imageUrl?: string;
    warehouses?: ProductWarehouse[];
}

export interface ProductTableItem {
    id?: number;
    sku: string;
    name: string;
    category: string;
    warehouseName: string;
    warehouseCode: string;
    warehouseId?: number;
    stock: number;
    price: number;
    imageUrl?: string;
}
