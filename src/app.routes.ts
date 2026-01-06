import { Role } from '@/core/models/enums';
import { getDashboardData } from '@/core/resolvers/dashboard.resolver';
import { getByUsernameResolver } from '@/core/resolvers/empresa.resolver';
import { getUnreadNotificationsResolver } from '@/core/resolvers/notificacao.resolver';
import { authenticationCanActivate, canActivateByRole, loginGuard } from '@/core/security/route.guard';
import { AppLayout } from '@/layout/components/app.layout';
import { DashboardComponent } from '@/pages/dashboard/dashboard.component';
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
        data: { breadcrumb: 'Login' },
    },
    {
        path: '',
        component: AppLayout,
        canActivateChild: [authenticationCanActivate],
        resolve: {
            notifications: getUnreadNotificationsResolver
        },
        children: [
            {
                path: 'dashboard',
                data: {
                    breadcrumb: 'Painél',
                    role: [Role.admin, Role.manager, Role.chief, Role.staff]
                },
                component: DashboardComponent,
                resolve: {
                    dashboardResolver: getDashboardData,
                },
                canActivate: [canActivateByRole],
            },
            {
                path: 'home',
                data: { breadcrumb: 'Início' },
                resolve: {
                    empresaResolver: getByUsernameResolver,
                },
                loadComponent: () => import('@/pages/inicio/inicio.component').then((c) => c.InicioComponent)
            },
            {
                path: 'application',
                data: { breadcrumb: 'Application' },
                loadChildren: () => import('@/pages/application-management/application.routes')
            },
            {
                path: 'empresa',
                data: { breadcrumb: 'Empresa' },
                loadChildren: () => import('@/pages/empresa/empresa.routes')
            },
            {
                path: 'licencas-certificados',
                data: { breadcrumb: 'Licenças e Certificados' },
                loadChildren: () => import('@/pages/licencas-certificados/licencas-certificados.routes')
            },
            {
                path: 'gestor',
                data: {
                    breadcrumb: 'Gestor',
                    role: [Role.admin, Role.manager, Role.chief, Role.staff]
                },
                canActivate: [canActivateByRole],
                loadChildren: () => import('@/pages/gestor/gestor.routes')
            },
            {
                path: 'utilizador',
                data: {
                    breadcrumb: 'Utilizadór',
                    role: [Role.admin]
                },
                loadChildren: () => import('@/pages/usermanagement/usermanagement.routes'),
                canActivate: [canActivateByRole],
            },
            {
                path: 'relatorios',
                data: {
                    breadcrumb: 'Relatórios',
                    role: [Role.admin, Role.manager, Role.chief]
                },
                loadChildren: () => import('@/pages/reports/report.route'),
                canActivate: [canActivateByRole],
            },
            {
                path: 'dados-mestre',
                data: { breadcrumb: 'Dados Mestre', role: [Role.admin] },
                loadChildren: () => import('@/pages/dados-mestre/dados-mestre.route'),
                canActivate: [canActivateByRole],
            }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('@/pages/auth/auth.routes')
    },
    {
        path: 'landing',
        loadComponent: () => import('@/pages/landing/landing').then((c) => c.Landing)
    },
    {
        path: 'notfound',
        loadComponent: () => import('@/pages/notfound/notfound').then((c) => c.Notfound)
    },
    { path: '**', redirectTo: '/notfound' }
];
