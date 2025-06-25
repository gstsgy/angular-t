import { Routes } from '@angular/router';
import { LoginComponent } from '@pages/login/login.component';
import {LoginGuard,DeFaultGuard} from '@utils/LoginGuard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home',data: { keep: true } },
  { path: '', canActivate: [LoginGuard],loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),
      children:[
          {path:'home',loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), data: { keep: true }},
          {path:'form-register/:formId',loadComponent: () => import('@pages/comm/form-register/form-register.component').then(m => m.FormRegisterComponent), data: { keep: true }},
          {path:'searchForm/:formId',loadComponent: () => import('@pages/comm/search-form/search-form.component').then(m => m.SearchFormComponent), data: { keep: true }},
          {path:'setForm/:formId',loadComponent: () => import('@pages/comm/set-form/set-form.component').then(m => m.SetFormComponent), data: { keep: true }},
          {path:'dict/:formId',loadComponent: () => import('@pages/comm/dict/dict.component').then(m => m.DictComponent), data: { keep: true }},
          {path:'menu/:formId',loadComponent: () => import('@pages/comm/menu/menu.component').then(m => m.MenuComponent), data: { keep: true }},
          {path:'user/:formId',loadComponent: () => import('@pages/comm/user/user.component').then(m => m.UserComponent), data: { keep: true }},
          {path:'role/:formId',loadComponent: () => import('@pages/comm/role/role.component').then(m => m.RoleComponent), data: { keep: true }},
          {path:'permission/:formId',loadComponent: () => import('@pages/comm/permission/permission.component').then(m => m.PermissionComponent), data: { keep: true }},
          {path:'formSql/:formId',loadComponent: () => import('@pages/comm/form-sql/form-sql.component').then(m => m.FormSqlComponent), data: { keep: true }},
      ]

   },
  { path: 'login', component: LoginComponent, data: { keep: false } },
  { path: '**',canActivate: [DeFaultGuard],loadComponent: () => import('./pages/layout/layout.component').then(m => m.LayoutComponent),data: { keep: true }}
 
];
