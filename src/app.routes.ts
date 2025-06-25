import { authenticationCanActivate } from '@/core/security/route.guard';
import { AppLayout } from '@/layout/components/app.layout';
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('@/pages/auth/login/login').then((c) => c.Login),
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
                path: 'uikit',
                data: { breadcrumb: 'UI Kit' },
                loadChildren: () => import('@/pages/uikit/uikit.routes')
            },
            {
                path: 'documentation',
                data: { breadcrumb: 'Documentation' },
                loadComponent: () => import('@/pages/documentation/documentation').then((c) => c.Documentation)
            },
            {
                path: 'pages',
                data: { breadcrumb: 'Pages' },
                loadChildren: () => import('@/pages/pages.routes')
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
                path: 'blocks',
                data: { breadcrumb: 'Prime Blocks' },
                loadChildren: () => import('@/pages/blocks/blocks.routes')
            },
            {
                path: 'utilizador',
                data: { breadcrumb: 'Utilizadór' },
                loadChildren: () => import('@/pages/usermanagement/usermanagement.routes')
            }
        ]
    },
    { path: 'auth', loadChildren: () => import('@/pages/auth/auth.routes') },
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
