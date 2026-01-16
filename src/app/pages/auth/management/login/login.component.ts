import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/authService/auth.service';

@Component({
    selector: 'app-login-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: '../../auth-common.css'
})
export class LoginManagementComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    loading = false;
    errorMsg = '';
    showPassword = false;

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    submit() {
        this.errorMsg = '';
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const email = this.form.value.email!;
        const password = this.form.value.password!;

        this.loading = true;

        // Only allow ROLE_ADMIN or ROLE_WAREHOUSE_MANAGER
        this.auth.loginWithRoleCheck(email, password, ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']).subscribe({
            next: () => {
                const roles = this.auth.getRoles();
                if (roles.includes('ROLE_ADMIN')) {
                    this.router.navigate(['/admin/dashboard']);
                } else if (roles.includes('ROLE_WAREHOUSE_MANAGER')) {
                    this.router.navigate(['/manager/dashboard']);
                }
            },
            error: (err) => {
                this.errorMsg = err?.error?.message || 'Invalid credentials or unauthorized access';
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    get emailControl() { return this.form.get('email'); }
    get passwordControl() { return this.form.get('password'); }
}
