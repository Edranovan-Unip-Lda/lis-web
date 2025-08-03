import { getPageClasseAtividadeResolver, getPageGrupoAtividadeResolver, getSociedadeComercialResolver, getTaxaResolver, getTipoRiscoResolver } from "@/core/resolvers/data-master.resolver";
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
            breadcrumb: 'Atividade Económica',
            type: 'atividade-economica'
        },
        children: [
            {
                path: 'grupo',
                data: {
                    breadcrumb: 'Grupo',
                    type: 'grupo-atividades'
                },
                loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
                resolve: {
                    listaGrupoAtividade: getPageGrupoAtividadeResolver
                }
            },
            {
                path: 'classe',
                data: {
                    breadcrumb: 'Classe',
                    type: 'classe-atividades'
                },
                loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
                resolve: {
                    listaClasseAtividade: getPageClasseAtividadeResolver,
                }
            },
        ]
        // loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
        // resolve: {
        //     listaAtividade: getAtividadeEconomicaResolver
        // }
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