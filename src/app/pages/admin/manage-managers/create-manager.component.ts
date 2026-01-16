import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/adminService/admin.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-manager',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './create-manager.component.html',
    styleUrl: './create-manager.component.css'
})
export class CreateManagerComponent {
    managerForm: FormGroup;
    loading = false;
    message: { type: 'success' | 'error', text: string } | null = null;

    constructor(
        private fb: FormBuilder,
        private adminService: AdminService,
        private router: Router
    ) {
        this.managerForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.managerForm.invalid) {
            this.managerForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.message = null;

        this.adminService.createWarehouseManager(this.managerForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.message = { type: 'success', text: 'Warehouse Manager created successfully!' };
                setTimeout(() => this.router.navigate(['/admin/dashboard']), 2000);
            },
            error: (err) => {
                this.loading = false;
                this.message = { type: 'error', text: err.error?.message || 'Failed to create Warehouse Manager.' };
            }
        });
    }
}
