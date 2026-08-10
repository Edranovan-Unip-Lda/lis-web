import { Routes } from '@angular/router';

export default [
    { path: '', redirectTo: 'seguranca', pathMatch: 'full' },
    {
        path: 'seguranca',
        data: { breadcrumb: 'Segurança' },
        loadComponent: () => import('./seguranca/seguranca.component').then((c) => c.SegurancaComponent)
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
