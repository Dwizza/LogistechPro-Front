import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../services/inventory/inventory.service';
import { ProductService } from '../../../services/product/product.service';
import { WarehouseService } from '../../../services/warehouse/warehouse.service';
import { Inventory } from '../../../models/inventory.model';
import { Product } from '../../../services/product/product.service';
import { Warehouse } from '../../../services/warehouse/warehouse.service';

@Component({
    selector: 'app-manage-inventory',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './manage-inventory.component.html',
    styleUrl: './manage-inventory.component.css'
})
export class ManageInventoryComponent implements OnInit {
    private fb = inject(FormBuilder);
    private inventoryService = inject(InventoryService);
    private productService = inject(ProductService);
    private warehouseService = inject(WarehouseService);

    inventories: Inventory[] = [];
    products: Product[] = [];
    warehouses: Warehouse[] = [];

    loading = false;
    showModal = false;
    editingInventory: Inventory | null = null;
    errorMsg = '';
    successMsg = '';

    form = this.fb.group({
        productId: [null as number | null, [Validators.required]],
        warehouseId: [null as number | null, [Validators.required]],
        qtyOnHand: [0, [Validators.required, Validators.min(0)]],
        qtyReserved: [0, [Validators.required, Validators.min(0)]]
    });

    ngOnInit(): void {
        this.loadInitialData();
    }

    loadInitialData(): void {
        this.loading = true;
        this.loadInventories();
        this.loadProducts();
        this.loadWarehouses();
    }

    loadInventories(): void {
        this.inventoryService.getInventories().subscribe({
            next: (data) => {
                this.inventories = data;
                this.loading = false;
            },
            error: () => {
                this.errorMsg = 'Failed to load inventory records.';
                this.loading = false;
            }
        });
    }

    loadProducts(): void {
        this.productService.getProducts().subscribe({
            next: (data) => this.products = data,
            error: () => console.error('Failed to load products')
        });
    }

    loadWarehouses(): void {
        this.warehouseService.getWarehouses().subscribe({
            next: (data) => this.warehouses = data,
            error: () => console.error('Failed to load warehouses')
        });
    }

    openCreateModal(): void {
        this.editingInventory = null;
        this.form.reset({ qtyOnHand: 0, qtyReserved: 0 });
        this.showModal = true;
    }

    openEditModal(inventory: Inventory): void {
        this.editingInventory = inventory;
        this.form.patchValue({
            productId: inventory.productId,
            warehouseId: inventory.warehouseId,
            qtyOnHand: inventory.qtyOnHand,
            qtyReserved: inventory.qtyReserved
        });
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.editingInventory = null;
        this.form.reset();
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const inventoryData = this.form.value as Inventory;
        this.loading = true;

        const op = this.editingInventory
            ? this.inventoryService.updateInventory(this.editingInventory.id!, inventoryData)
            : this.inventoryService.createInventory(inventoryData);

        op.subscribe({
            next: () => {
                this.successMsg = `Inventory ${this.editingInventory ? 'updated' : 'created'} successfully!`;
                this.loadInventories();
                this.closeModal();
                setTimeout(() => this.successMsg = '', 3000);
            },
            error: (err) => {
                this.errorMsg = 'Operation failed. Please check your data.';
                this.loading = false;
            }
        });
    }

    deleteInventory(id: number): void {
        if (confirm('Are you sure you want to delete this inventory record?')) {
            this.loading = true;
            this.inventoryService.deleteInventory(id).subscribe({
                next: () => {
                    this.successMsg = 'Inventory record deleted.';
                    this.loadInventories();
                    setTimeout(() => this.successMsg = '', 3000);
                },
                error: () => {
                    this.errorMsg = 'Delete failed.';
                    this.loading = false;
                }
            });
        }
    }

    getProductName(id: number): string {
        const p = this.products.find(x => x.id === id);
        return p ? p.name : `Product #${id}`;
    }

    getWarehouseName(id: number): string {
        const w = this.warehouses.find(x => x.id === id);
        return w ? w.name : `Warehouse #${id}`;
    }

    getAvailableQty(inv: Inventory): number {
        return inv.qtyOnHand - inv.qtyReserved;
    }
}
