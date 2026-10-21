import { getDirecaoResolver, getPageClasseAtividadeResolver, getPageGrupoAtividadeResolver, getRolesResolver, getSociedadeComercialResolver, getTaxaResolver, getTipoRiscoResolver } from "@/core/resolvers/data-master.resolver";
import { Routes } from "@angular/router";

export default [
    {
        path: 'endereco',
        data: { breadcrumb: 'breadcrumb.localizacao' },
        loadChildren: () => import('@/pages/dados-mestre/endereco/endereco.route')
    },
    {
        path: 'atividade-economica',
        data: {
            breadcrumb: 'breadcrumb.atividadeEconomica',
            type: 'atividade-economica'
        },
        children: [
            {
                path: 'grupo',
                data: {
                    breadcrumb: 'breadcrumb.grupo',
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
                    breadcrumb: 'breadcrumb.classe',
                    type: 'classe-atividades'
                },
                loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
                resolve: {
                    listaClasseAtividade: getPageClasseAtividadeResolver,
                }
            },
        ]
    },
    {
        path: 'roles',
        data: {
            breadcrumb: 'breadcrumb.funcao',
            type: 'roles'
        },
        loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
        resolve: {
            listaRoles: getRolesResolver
        }
    },
    {
        path: 'tipo-risco',
        data: {
            breadcrumb: 'breadcrumb.risco',
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
            breadcrumb: 'breadcrumb.taxa',
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
            breadcrumb: 'breadcrumb.sociedadeComercial',
            type: 'sociedade-comercial'
        },
        loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
        resolve: {
            listaSociedadeComercial: getSociedadeComercialResolver
        }
    },
    {
        path: 'direcao',
        data: {
            breadcrumb: 'breadcrumb.direcoes',
            type: 'direcoes'
        },
        loadComponent: () => import('@/pages/dados-mestre/lista/lista.component').then((c) => c.ListaComponent),
        resolve: {
            listaDirecao: getDirecaoResolver
        }
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;