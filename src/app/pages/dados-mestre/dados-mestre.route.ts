import { Routes } from "@angular/router";

export default [
    {
        path: 'endereco',
        data: { breadcrumb: 'Localização' },
        loadChildren: ()=> import('@/pages/dados-mestre/endereco/endereco.route')
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;