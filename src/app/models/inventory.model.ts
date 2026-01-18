export interface Inventory {
    id?: number;
    productId: number;
    warehouseId: number;
    qtyOnHand: number;
    qtyReserved: number;

    productName?: string;
    warehouseName?: string;
    productSku?: string;
    qtyAvailable?: number;
}
