import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupplierService } from '../../../services/supplier/supplier.service';
import { Supplier } from '../../../models/supplier.model';

@Component({
    selector: 'app-manage-suppliers',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './manage-suppliers.component.html',
    styleUrl: './manage-suppliers.component.css'
})
export class ManageSuppliersComponent implements OnInit {
    suppliers: Supplier[] = [];
    supplierForm: FormGroup;
    loading = false;
    fetching = false;
    isModalOpen = false;
    isEditMode = false;
    selectedSupplierId: number | null = null;
    message: { type: 'success' | 'error', text: string } | null = null;

    constructor(
        private fb: FormBuilder,
        private supplierService: SupplierService
    ) {
        this.supplierForm = this.fb.group({
            name: ['', [Validators.required]],
            contactInfo: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.loadSuppliers();
    }

    loadSuppliers(): void {
        this.fetching = true;
        this.supplierService.getSuppliers().subscribe({
            next: (data) => {
                this.suppliers = data;
                this.fetching = false;
            },
            error: () => {
                this.fetching = false;
                this.message = { type: 'error', text: 'Failed to load suppliers.' };
            }
        });
    }

    openCreateModal(): void {
        this.isEditMode = false;
        this.selectedSupplierId = null;
        this.supplierForm.reset();
        this.isModalOpen = true;
        this.message = null;
    }

    openEditModal(supplier: Supplier): void {
        this.isEditMode = true;
        this.selectedSupplierId = supplier.id;
        this.supplierForm.patchValue({
            name: supplier.name,
            contactInfo: supplier.contactInfo
        });
        this.isModalOpen = true;
        this.message = null;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.supplierForm.reset();
    }

    onSubmit(): void {
        if (this.supplierForm.invalid) {
            this.supplierForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.message = null;

        if (this.isEditMode && this.selectedSupplierId) {
            this.supplierService.updateSupplier(this.selectedSupplierId, this.supplierForm.value).subscribe({
                next: () => {
                    this.loading = false;
                    this.message = { type: 'success', text: 'Supplier updated successfully!' };
                    this.loadSuppliers();
                    setTimeout(() => this.closeModal(), 1500);
                },
                error: (err) => {
                    this.loading = false;
                    this.message = { type: 'error', text: err.error?.message || 'Failed to update supplier.' };
                }
            });
        } else {
            this.supplierService.createSupplier(this.supplierForm.value).subscribe({
                next: () => {
                    this.loading = false;
                    this.message = { type: 'success', text: 'Supplier created successfully!' };
                    this.loadSuppliers();
                    setTimeout(() => this.closeModal(), 1500);
                },
                error: (err) => {
                    this.loading = false;
                    this.message = { type: 'error', text: err.error?.message || 'Failed to create supplier.' };
                }
            });
        }
    }

    onDelete(id: number): void {
        if (confirm('Are you sure you want to remove this supplier?')) {
            this.supplierService.deleteSupplier(id).subscribe({
                next: () => {
                    this.message = { type: 'success', text: 'Supplier removed successfully.' };
                    this.loadSuppliers();
                    setTimeout(() => this.message = null, 3000);
                },
                error: (err) => {
                    this.message = { type: 'error', text: err.error?.message || 'Failed to remove supplier.' };
                }
            });
        }
    }
}
