import { Routes } from '@angular/router';

export default [
    { path: '', redirectTo: 'seguranca', pathMatch: 'full' },
    {
        path: 'seguranca',
        data: { breadcrumb: 'breadcrumb.seguranca' },
        loadComponent: () => import('./seguranca/seguranca.component').then((c) => c.SegurancaComponent)
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
