import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/authService/auth.service';


export const landingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const roles = auth.getRoles();

  if (roles.includes('ROLE_ADMIN')) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  if (roles.includes('ROLE_MANAGER') || roles.includes('ROLE_WAREHOUSE_MANAGER')) {
    return router.createUrlTree(['/manager/dashboard']);
  }

  return router.createUrlTree(['/shop/home']);
};
