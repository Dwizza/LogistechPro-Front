import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ManagerDashboardComponent } from './pages/manager/dashboard/dashboard.component';
import { landingGuard } from './guards/landing.guard';
import { guestOnlyGuard } from './guards/guest-only.guard';
import { roleGuard } from './guards/role.guard';
import { authGuard } from './guards/auth.guard';
import { LoginManagementComponent } from './pages/auth/management/login/login.component';
import { LoginClientComponent } from './pages/auth/client/login/login.component';
import { RegisterClientComponent } from './pages/auth/client/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

import { LayoutComponent } from './components/layout/layout.component';

import { CreateManagerComponent } from './pages/admin/manage-managers/create-manager.component';
import { ManageWarehousesComponent } from './pages/admin/manage-warehouses/manage-warehouses.component';

export const routes: Routes = [

    { path: '', component: LoginClientComponent, canActivate: [landingGuard] },
    { path: 'management/login', component: LoginManagementComponent, canActivate: [guestOnlyGuard] },
    { path: 'client/login', component: LoginClientComponent, canActivate: [guestOnlyGuard] },
    { path: 'client/register', component: RegisterClientComponent, canActivate: [guestOnlyGuard] },
    { path: 'login', redirectTo: 'client/login', pathMatch: 'full' },

    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [roleGuard(['ROLE_ADMIN'])] },
            { path: 'admin/managers', component: CreateManagerComponent, canActivate: [roleGuard(['ROLE_ADMIN'])] },
            { path: 'admin/warehouses', component: ManageWarehousesComponent, canActivate: [roleGuard(['ROLE_ADMIN'])] },
            { path: 'admin/products', loadComponent: () => import('./pages/admin/manage-products/manage-products.component').then(m => m.ManageProductsComponent), canActivate: [roleGuard(['ROLE_ADMIN'])] },
            { path: 'admin/inventory', loadComponent: () => import('./pages/admin/manage-inventory/manage-inventory.component').then(m => m.ManageInventoryComponent), canActivate: [roleGuard(['ROLE_ADMIN'])] },
            { path: 'manager/dashboard', component: ManagerDashboardComponent, canActivate: [roleGuard(['ROLE_WAREHOUSE_MANAGER'])] },
        ]
    },

    { path: '**', component: NotFoundComponent },

];
