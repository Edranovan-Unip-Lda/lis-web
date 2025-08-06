import { authenticationCanActivate } from '@/core/security/route.guard';
import { AppLayout } from '@/layout/components/app.layout';
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
        data: { breadcrumb: 'Login' }
    },
    {
        path: '',
        component: AppLayout,
        canActivateChild: [authenticationCanActivate],
        children: [
            {
                path: 'dashboard',
                data: { breadcrumb: 'Painél' },
                loadComponent: () => import('@/pages/dashboard/ecommercedashboard').then((c) => c.EcommerceDashboard),
            },
            {
                path: 'home',
                data: { breadcrumb: 'Início' },
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
                path: 'pages',
                data: { breadcrumb: 'Pages' },
                loadChildren: () => import('@/pages/pages.routes')
            },
            {
                path: 'gestor',
                data: { breadcrumb: 'Gestor' },
                loadChildren: () => import('@/pages/gestor/gestor.routes')
            },
            {
                path: 'apps',
                data: { breadcrumb: 'Apps' },
                loadChildren: () => import('./app/apps/apps.routes')
            },
            {
                path: 'ecommerce',
                data: { breadcrumb: 'E-Commerce' },
                loadChildren: () => import('@/pages/ecommerce/ecommerce.routes')
            },
            {
                path: 'utilizador',
                data: { breadcrumb: 'Utilizadór' },
                loadChildren: () => import('@/pages/usermanagement/usermanagement.routes')
            },
            {
                path: 'dados-mestre',
                data: { breadcrumb: 'Dados Mestre' },
                loadChildren: () => import('@/pages/dados-mestre/dados-mestre.route')
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
