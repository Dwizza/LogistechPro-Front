import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/adminService/admin.service';

@Component({
    selector: 'app-create-manager',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './create-manager.component.html',
    styleUrl: './create-manager.component.css'
})
export class CreateManagerComponent implements OnInit {
    managers: any[] = [];
    managerForm: FormGroup;
    loading = false;
    fetching = false;
    isModalOpen = false;
    isEditMode = false;
    selectedManagerId: number | null = null;
    message: { type: 'success' | 'error', text: string } | null = null;

    constructor(
        private fb: FormBuilder,
        private adminService: AdminService
    ) {
        this.managerForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]]
        });
    }

    ngOnInit(): void {
        this.loadManagers();
    }

    loadManagers(): void {
        this.fetching = true;
        this.adminService.getWarehouseManagers().subscribe({
            next: (data) => {
                this.managers = data;
                this.fetching = false;
            },
            error: () => {
                this.fetching = false;
                this.message = { type: 'error', text: 'Failed to load managers.' };
            }
        });
    }

    openCreateModal(): void {
        this.isEditMode = false;
        this.selectedManagerId = null;
        this.managerForm.reset();
        this.managerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.isModalOpen = true;
        this.message = null;
    }

    openEditModal(manager: any): void {
        this.isEditMode = true;
        this.selectedManagerId = manager.id;
        this.managerForm.patchValue({
            name: manager.name,
            email: manager.email,
            password: ''
        });
        // Password optional on edit
        this.managerForm.get('password')?.setValidators([Validators.minLength(6)]);
        this.isModalOpen = true;
        this.message = null;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.managerForm.reset();
    }

    onSubmit(): void {
        if (this.managerForm.invalid) {
            this.managerForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.message = null;

        if (this.isEditMode && this.selectedManagerId) {
            const updateData = { ...this.managerForm.value };
            if (!updateData.password) delete updateData.password;

            this.adminService.updateWarehouseManager(this.selectedManagerId, updateData).subscribe({
                next: () => {
                    this.loading = false;
                    this.message = { type: 'success', text: 'Manager updated successfully!' };
                    this.loadManagers();
                    setTimeout(() => this.closeModal(), 1500);
                },
                error: (err) => {
                    this.loading = false;
                    this.message = { type: 'error', text: err.error?.message || 'Failed to update manager.' };
                }
            });
        } else {
            this.adminService.createWarehouseManager(this.managerForm.value).subscribe({
                next: () => {
                    this.loading = false;
                    this.message = { type: 'success', text: 'Manager created successfully!' };
                    this.loadManagers();
                    setTimeout(() => this.closeModal(), 1500);
                },
                error: (err) => {
                    this.loading = false;
                    this.message = { type: 'error', text: err.error?.message || 'Failed to create manager.' };
                }
            });
        }
    }

    onDelete(id: number): void {
        if (confirm('Are you sure you want to remove this authority node?')) {
            this.adminService.deleteWarehouseManager(id).subscribe({
                next: () => {
                    this.message = { type: 'success', text: 'Manager removed from registry.' };
                    this.loadManagers();
                    setTimeout(() => this.message = null, 3000);
                },
                error: (err) => {
                    this.message = { type: 'error', text: err.error?.message || 'Failed to remove manager.' };
                }
            });
        }
    }
}
