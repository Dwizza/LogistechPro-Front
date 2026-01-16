import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ManagerDashboardComponent } from './pages/manager/dashboard/dashboard.component';
import { landingGuard } from './guards/landing.guard';
import { guestOnlyGuard } from './guards/guest-only.guard';
import { roleGuard } from './guards/role.guard';
import { authGuard } from './guards/auth.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';

import { LayoutComponent } from './components/layout/layout.component';

import { CreateManagerComponent } from './pages/admin/manage-managers/create-manager.component';

export const routes: Routes = [

    { path: '', canActivate: [landingGuard], component: LoginComponent },
    { path: 'login', component: LoginComponent, canActivate: [guestOnlyGuard] },

    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [roleGuard(['ROLE_ADMIN'])] },
            { path: 'admin/managers/create', component: CreateManagerComponent, canActivate: [roleGuard(['ROLE_ADMIN'])] },
            { path: 'manager/dashboard', component: ManagerDashboardComponent, canActivate: [roleGuard(['ROLE_WAREHOUSE_MANAGER'])] },
        ]
    },

    { path: '**', component: NotFoundComponent },

];
