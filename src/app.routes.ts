import { Role } from '@/core/models/enums';
import { getDashboardData } from '@/core/resolvers/dashboard.resolver';
import { getByUsernameResolver } from '@/core/resolvers/empresa.resolver';
import { getUnreadNotificationsResolver } from '@/core/resolvers/notificacao.resolver';
import { getUserProfileResolver } from '@/core/resolvers/user.resolver';
import { authenticationCanActivate, canActivateByRole } from '@/core/security/route.guard';
import { AppLayout } from '@/layout/components/app.layout';
import { DashboardComponent } from '@/pages/dashboard/dashboard.component';
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
        data: { breadcrumb: 'breadcrumb.login' },
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
                    breadcrumb: 'breadcrumb.painel',
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
                data: { breadcrumb: 'breadcrumb.inicio' },
                resolve: {
                    empresaResolver: getByUsernameResolver,
                },
                loadComponent: () => import('@/pages/inicio/inicio.component').then((c) => c.InicioComponent)
            },
            {
                path: 'application',
                data: { breadcrumb: 'breadcrumb.aplicacao' },
                loadChildren: () => import('@/pages/application-management/application.routes')
            },
            {
                path: 'empresa',
                data: { breadcrumb: 'breadcrumb.empresa' },
                loadChildren: () => import('@/pages/empresa/empresa.routes')
            },
            {
                path: 'licencas-certificados',
                data: { breadcrumb: 'breadcrumb.licencasCertificados' },
                loadChildren: () => import('@/pages/licencas-certificados/licencas-certificados.routes')
            },
            {
                path: 'gestor',
                data: {
                    breadcrumb: 'breadcrumb.gestor',
                    role: [Role.admin, Role.manager, Role.chief, Role.staff]
                },
                canActivate: [canActivateByRole],
                loadChildren: () => import('@/pages/gestor/gestor.routes')
            },
            {
                path: 'utilizador',
                data: {
                    breadcrumb: 'breadcrumb.utilizador',
                    role: [Role.admin]
                },
                loadChildren: () => import('@/pages/usermanagement/usermanagement.routes'),
                canActivate: [canActivateByRole],
            },
            {
                path: 'relatorios',
                data: {
                    breadcrumb: 'breadcrumb.relatorios',
                    role: [Role.admin, Role.manager, Role.chief, Role.staff]
                },
                loadChildren: () => import('@/pages/reports/report.route'),
                canActivate: [canActivateByRole],
            },
            {
                path: 'dados-mestre',
                data: { breadcrumb: 'breadcrumb.dadosMestre', role: [Role.admin] },
                loadChildren: () => import('@/pages/dados-mestre/dados-mestre.route'),
                canActivate: [canActivateByRole],
            },
            {
                path: 'profile',
                data: { breadcrumb: 'breadcrumb.perfil' },
                resolve: {
                    userData: getUserProfileResolver,
                },
                loadComponent: () => import('@/pages/profile/profile.component').then((c) => c.ProfileComponent)
            },
            {
                path: 'definicoes',
                data: {
                    breadcrumb: 'breadcrumb.definicoes',
                    role: [Role.admin]
                },
                loadChildren: () => import('@/pages/definicoes/definicoes.routes'),
                canActivate: [canActivateByRole],
            },
            {
                path: 'historicos',
                data: {
                    breadcrumb: 'breadcrumb.historicos',
                    role: [Role.admin]
                },
                loadChildren: () => import('@/pages/logs/logs.routes'),
                canActivate: [canActivateByRole],
            }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('@/pages/auth/auth.routes')
    },
    {
        path: 'notfound',
        loadComponent: () => import('@/pages/notfound/notfound').then((c) => c.Notfound)
    },
    { path: '**', redirectTo: '/notfound' }
];
