import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { PurchaseOrderService } from '../../../services/purchase-order/purchase-order.service';
import { PurchaseOrder, PurchaseOrderItem } from '../../../models/purchase-order.model';
import { ProductService, Product } from '../../../services/product/product.service';
import { WarehouseService, Warehouse } from '../../../services/warehouse/warehouse.service';
import { SupplierService } from '../../../services/supplier/supplier.service';
import { Supplier } from '../../../models/supplier.model';

@Component({
    selector: 'app-admin-manage-purchase-orders',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './manage-purchase-orders.component.html',
    styleUrl: './manage-purchase-orders.component.css'
})
export class ManagePurchaseOrdersComponent implements OnInit {
    private poService = inject(PurchaseOrderService);
    private productService = inject(ProductService);
    private warehouseService = inject(WarehouseService);
    private supplierService = inject(SupplierService);
    private fb = inject(FormBuilder);

    purchaseOrders: PurchaseOrder[] = [];
    products: Product[] = [];
    warehouses: Warehouse[] = [];
    suppliers: Supplier[] = [];

    loading = false;
    processing = false;
    submitting = false;

    errorMsg = '';
    successMsg = '';

    selectedOrder: PurchaseOrder | null = null;
    showDetailsModal = false;

    // Creation State
    showCreateModal = false;
    poForm = this.fb.group({
        supplierId: [null as number | null, [Validators.required]],
        warehouseId: [null as number | null, [Validators.required]],
        lines: this.fb.array([])
    });

    // Confirmation Modal State
    showConfirmModal = false;
    confirmAction: 'APPROVE' | 'RECEIVE' | 'CANCEL' | null = null;
    orderToProcess: PurchaseOrder | null = null;

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

    viewDetails(po: PurchaseOrder): void {
        this.selectedOrder = po;
        this.showDetailsModal = true;
    }

    closeModal(): void {
        this.showDetailsModal = false;
        this.showCreateModal = false;
        this.showConfirmModal = false;
        this.selectedOrder = null;
        this.orderToProcess = null;
        this.confirmAction = null;
    }

    // Creation Logic
    openCreateModal(): void {
        this.poForm.reset({ supplierId: null, warehouseId: null });
        while (this.lines.length) this.lines.removeAt(0);
        this.addItem();
        this.showCreateModal = true;
        this.errorMsg = '';
        this.successMsg = '';
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

    submitPO(): void {
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
            status: 'CREATED',
            lines: (formValue.lines as any[]).map(line => ({
                ...line,
                unitPrice: this.getProductPrice(line.productId)
            }))
        };

        this.poService.createPurchaseOrder(poData).subscribe({
            next: () => {
                this.loadPurchaseOrders();
                this.showCreateModal = false;
                this.successMsg = 'Purchase Order created successfully.';
                this.submitting = false;
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => {
                this.errorMsg = err.error?.message || 'Failed to create purchase order.';
                this.submitting = false;
            }
        });
    }

    calculateFormTotal(): number {
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

    // Processing Logic
    openConfirm(po: PurchaseOrder, action: 'APPROVE' | 'RECEIVE' | 'CANCEL', event?: Event): void {
        if (event) event.stopPropagation();
        this.orderToProcess = po;
        this.confirmAction = action;
        this.showConfirmModal = true;
    }

    confirm(): void {
        if (!this.orderToProcess || !this.confirmAction) return;

        const id = this.orderToProcess.id!;
        switch (this.confirmAction) {
            case 'APPROVE': this.approve(id); break;
            case 'RECEIVE': this.receive(id); break;
            case 'CANCEL': this.cancel(id); break;
        }
        this.showConfirmModal = false;
    }

    approve(id: number): void {
        this.processing = true;
        this.poService.approvePurchaseOrder(id).subscribe({
            next: () => {
                this.successMsg = 'Order approved successfully.';
                this.loadPurchaseOrders();
                this.processing = false;
                if (this.selectedOrder?.id === id) this.closeModal();
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => {
                this.errorMsg = err.error?.message || 'Failed to approve order.';
                this.processing = false;
            }
        });
    }

    receive(id: number): void {
        this.processing = true;
        this.poService.receivePurchaseOrder(id).subscribe({
            next: () => {
                this.successMsg = 'Order received. Inventory updated.';
                this.loadPurchaseOrders();
                this.processing = false;
                if (this.selectedOrder?.id === id) this.closeModal();
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => {
                this.errorMsg = err.error?.message || 'Failed to confirm reception.';
                this.processing = false;
            }
        });
    }

    cancel(id: number): void {
        this.processing = true;
        this.poService.cancelPurchaseOrder(id).subscribe({
            next: () => {
                this.successMsg = 'Order cancelled.';
                this.loadPurchaseOrders();
                this.processing = false;
                if (this.selectedOrder?.id === id) this.closeModal();
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => {
                this.errorMsg = err.error?.message || 'Failed to cancel order.';
                this.processing = false;
            }
        });
    }

    calculateTotal(po: PurchaseOrder): number {
        return po.lines?.reduce((acc, line) => acc + (line.quantity * (line.unitPrice || 0)), 0) || po.totalAmount || 0;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'CREATED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'APPROVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'RECEIVED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'CANCELLED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    }
}
