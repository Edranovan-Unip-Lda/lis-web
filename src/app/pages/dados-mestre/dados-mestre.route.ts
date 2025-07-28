import { getAtividadeEconomicaResolver, getSociedadeComercialResolver, getTaxaResolver, getTipoRiscoResolver } from "@/core/resolvers/data-master.resolver";
import { Routes } from "@angular/router";

export default [
    {
        path: 'endereco',
        data: { breadcrumb: 'Localização' },
        loadChildren: () => import('@/pages/dados-mestre/endereco/endereco.route')
    },
    {
        path: 'atividade-economica',
        data: {
            breadcrumb: 'Atividade',
            type: 'atividade-economica'
        },
        loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
        resolve: {
            listaAtividade: getAtividadeEconomicaResolver
        }
    },
    {
        path: 'tipo-risco',
        data: {
            breadcrumb: 'Risco',
            type: 'tipo-risco'
        },
        loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
        resolve: {
            listaTipoRisco: getTipoRiscoResolver
        }
    },
    {
        path: 'taxa',
        data: {
            breadcrumb: 'Taxa',
            type: 'taxas'
        },
        loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
        resolve: {
            listaTaxa: getTaxaResolver
        }
    },
    {
        path: 'sociedade-comercial',
        data: {
            breadcrumb: 'Sociedade Comercial',
            type: 'sociedade-comercial'
        },
        loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
        resolve: {
            listaSociedadeComercial: getSociedadeComercialResolver
        }
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;