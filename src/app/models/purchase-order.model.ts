export interface PurchaseOrderItem {
    id?: number;
    productId?: number;
    productName?: string;
    quantity: number;
    unitPrice: number;
}

export type PurchaseOrderStatus = 'CREATED' | 'APPROVED' | 'RECEIVED' | 'CANCELLED' | 'PENDING';

export interface PurchaseOrder {
    id?: number;
    orderNumber?: string;
    supplierId?: number;
    supplierName?: string;
    warehouseId?: number;
    warehouseName?: string;
    status: PurchaseOrderStatus;
    totalAmount?: number;
    createdAt?: string;
    orderDate?: string; // keeping for backward compatibility if needed temporarily
    lines: PurchaseOrderItem[];
}
