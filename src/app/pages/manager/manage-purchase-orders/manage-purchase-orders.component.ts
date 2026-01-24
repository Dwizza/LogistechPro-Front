import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { PurchaseOrderService } from '../../../services/purchase-order/purchase-order.service';
import { PurchaseOrder, PurchaseOrderItem } from '../../../models/purchase-order.model';
import { ProductService } from '../../../services/product/product.service';
import { WarehouseService} from '../../../services/warehouse/warehouse.service';
import { SupplierService } from '../../../services/supplier/supplier.service';
import { Supplier } from '../../../models/supplier.model';
import { Product } from '../../../models/product.model';
import { Warehouse } from '../../../models/warehouse.model';

@Component({
    selector: 'app-manager-manage-purchase-orders',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './manage-purchase-orders.component.html',
    styleUrl: './manage-purchase-orders.component.css'
})
export class ManagePurchaseOrdersComponent implements OnInit {
    private fb = inject(FormBuilder);
    private poService = inject(PurchaseOrderService);
    private productService = inject(ProductService);
    private warehouseService = inject(WarehouseService);
    private supplierService = inject(SupplierService);

    purchaseOrders: PurchaseOrder[] = [];
    products: Product[] = [];
    warehouses: Warehouse[] = [];
    suppliers: Supplier[] = [];

    loading = false;
    submitting = false;
    showModal = false;
    selectedOrder: PurchaseOrder | null = null;
    showDetailsModal = false;
    errorMsg = '';
    successMsg = '';

    poForm = this.fb.group({
        supplierId: [null as number | null, [Validators.required]],
        warehouseId: [null as number | null, [Validators.required]],
        lines: this.fb.array([])
    });

    get lines() {
        return this.poForm.get('lines') as FormArray;
    }

    ngOnInit(): void {
        this.loadPurchaseOrders();
        this.loadProducts();
        this.loadWarehouses();
        this.loadSuppliers();
    }

    loadPurchaseOrders(): void {
        this.loading = true;
        this.poService.getPurchaseOrders().subscribe({
            next: (data) => {
                this.purchaseOrders = data;
                this.loading = false;
            },
            error: () => {
                this.errorMsg = 'Failed to load purchase orders.';
                this.loading = false;
            }
        });
    }

    loadProducts(): void {
        this.productService.getProducts().subscribe({
            next: (data) => this.products = data
        });
    }

    loadWarehouses(): void {
        this.warehouseService.getWarehouses().subscribe({
            next: (data) => this.warehouses = data
        });
    }

    loadSuppliers(): void {
        this.supplierService.getSuppliers().subscribe({
            next: (data) => this.suppliers = data
        });
    }

    addItem(): void {
        const itemGroup = this.fb.group({
            productId: [null as number | null, [Validators.required]],
            quantity: [1, [Validators.required, Validators.min(1)]]
        });
        this.lines.push(itemGroup);
    }

    removeItem(index: number): void {
        this.lines.removeAt(index);
    }

    openCreateModal(): void {
        this.poForm.reset({ supplierId: null, warehouseId: null });
        while (this.lines.length) this.lines.removeAt(0);
        this.addItem();
        this.showModal = true;
        this.errorMsg = '';
        this.successMsg = '';
    }

    closeModal(): void {
        this.showModal = false;
        this.showDetailsModal = false;
        this.selectedOrder = null;
    }

    viewDetails(po: PurchaseOrder): void {
        this.selectedOrder = po;
        this.showDetailsModal = true;
    }

    submit(): void {
        if (this.poForm.invalid || this.lines.length === 0) {
            this.poForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        this.errorMsg = '';

        const formValue = this.poForm.value;
        const poData: PurchaseOrder = {
            warehouseId: formValue.warehouseId!,
            supplierId: formValue.supplierId!,
            status: 'PENDING',
            orderDate: new Date().toISOString(),
            totalAmount: this.calculateTotal(),
            lines: (formValue.lines as any[]).map(line => ({
                ...line,
                unitPrice: this.getProductPrice(line.productId)
            }))
        };

        this.poService.createPurchaseOrder(poData).subscribe({
            next: () => {
                this.loadPurchaseOrders();
                this.showModal = false;
                this.successMsg = 'Purchase Order transmitted successfully!';
                this.submitting = false;
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => {
                this.errorMsg = err.error?.message || 'Failed to sync with central node.';
                this.submitting = false;
            }
        });
    }

    calculateTotal(): number {
        return this.lines.controls.reduce((acc, control) => {
            const g = control.value;
            const price = this.getProductPrice(g.productId);
            return acc + (g.quantity * price);
        }, 0);
    }

    getProductPrice(productId: any): number {
        if (productId === null || productId === undefined || !this.products.length) return 0;
        const product = this.products.find(p => p.id == productId);
        return product?.avgPrice || 0;
    }

    calculateOrderTotal(po: PurchaseOrder): number {
        return po.lines?.reduce((acc, line) => acc + (line.quantity * (line.unitPrice || 0)), 0) || po.totalAmount || 0;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'CREATED': return 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'APPROVED': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
            case 'RECEIVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'CANCELLED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    }
}
