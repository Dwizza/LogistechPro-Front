import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WarehouseService } from '../../../services/warehouse/warehouse.service';
import { Warehouse } from '../../../models/warehouse.model';

@Component({
    selector: 'app-manage-warehouses',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './manage-warehouses.component.html',
    styleUrl: './manage-warehouses.component.css'
})
export class ManageWarehousesComponent implements OnInit {
    private fb = inject(FormBuilder);
    private warehouseService = inject(WarehouseService);

    warehouses: Warehouse[] = [];
    loading = false;
    showModal = false;
    editingWarehouse: Warehouse | null = null;
    errorMsg = '';

    form = this.fb.group({
        code: ['', [Validators.required]],
        name: ['', [Validators.required]],
        active: [true]
    });

    ngOnInit(): void {
        this.loadWarehouses();
    }

    loadWarehouses(): void {
        this.loading = true;
        this.errorMsg = '';
        this.warehouseService.getWarehouses().subscribe({
            next: (data) => {
                this.warehouses = data;
                this.loading = false;
            },
            error: (err) => {
                this.errorMsg = 'Failed to load warehouses.';
                this.loading = false;
            }
        });
    }

    openCreateModal(): void {
        this.editingWarehouse = null;
        this.form.reset({ active: true });
        this.showModal = true;
    }

    openEditModal(warehouse: Warehouse): void {
        this.editingWarehouse = warehouse;
        this.form.patchValue({
            code: warehouse.code,
            name: warehouse.name,
            active: warehouse.active
        });
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.editingWarehouse = null;
        this.form.reset();
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const warehouseData = this.form.value as Warehouse;
        this.loading = true;

        if (this.editingWarehouse) {
            this.warehouseService.updateWarehouse(this.editingWarehouse.id!, warehouseData).subscribe({
                next: () => {
                    this.loadWarehouses();
                    this.closeModal();
                },
                error: () => {
                    this.errorMsg = 'Failed to update warehouse.';
                    this.loading = false;
                }
            });
        } else {
            this.warehouseService.createWarehouse(warehouseData).subscribe({
                next: () => {
                    this.loadWarehouses();
                    this.closeModal();
                },
                error: () => {
                    this.errorMsg = 'Failed to create warehouse.';
                    this.loading = false;
                }
            });
        }
    }

    deleteWarehouse(id: number): void {
        if (confirm('Are you sure you want to delete this warehouse?')) {
            this.loading = true;
            this.warehouseService.deleteWarehouse(id).subscribe({
                next: () => this.loadWarehouses(),
                error: () => {
                    this.errorMsg = 'Failed to delete warehouse.';
                    this.loading = false;
                }
            });
        }
    }
}
