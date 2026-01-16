import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/authService/auth.service';

@Component({
    selector: 'app-register-client',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: '../../auth-common.css'
})
export class RegisterClientComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    loading = false;
    errorMsg = '';

    form = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    submit() {
        this.errorMsg = '';
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;

        this.auth.register(this.form.value).subscribe({
            next: () => {
                this.router.navigate(['/client/login']);
            },
            error: (err) => {
                this.errorMsg = err?.error?.message || 'Registration failed. Please try again.';
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    get nameControl() { return this.form.get('name'); }
    get emailControl() { return this.form.get('email'); }
    get passwordControl() { return this.form.get('password'); }
}
