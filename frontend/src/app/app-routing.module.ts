import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

import { TablesComponent } from './tables/tables.component';
import { TableDetailComponent } from './tables/table-detail/table-detail.component';
import { ProductsComponent } from './products/products.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'tables',
    component: TablesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'tables/:id',
    component: TableDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { allowedRoles: ['gerente', 'dueño'] },
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { allowedRoles: ['dueño'] },
  },
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { allowedRoles: ['dueño'] },
  },
  { path: '', redirectTo: '/tables', pathMatch: 'full' },
  { path: '**', redirectTo: '/tables' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
