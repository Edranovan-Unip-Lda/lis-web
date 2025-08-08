import { getByIdResolver, getPageResolver } from "@/core/resolvers/aplicante.resolver";
import { getAllAldeiasResolver, getAllGrupoAtividadeByTipoResolver, getSociedadeComercialResolver, getTaxaByCategoriaAndTipoResolver } from "@/core/resolvers/data-master.resolver";
import { getAssignedAplicanteByIdResolver, getPageAplicanteByUsernameResolver } from "@/core/resolvers/user.resolver";
import { Routes } from "@angular/router";
import { CertificatePdfComponent } from "../application-management/certificate-pdf/certificate-pdf.component";
import { FaturaComponent } from "../application-management/fatura/fatura.component";
import { PedidoInscricaoComponent } from "../application-management/pedido-inscricao/pedido-inscricao.component";

export default [
    {
        path: 'application',
        data: {
            breadcrumb: 'Aplicantes',
        },
        children: [
            {
                path: 'task',
                data: {
                    breadcrumb: 'Tarefas',
                },
                children: [
                    {
                        path: '',
                        data: {
                            breadcrumb: 'List',
                        },
                        loadComponent: () => import('@/pages/application-management/application-list/application-list.component').then((c) => c.ApplicationListComponent),
                        resolve: {
                            applicationPage: getPageAplicanteByUsernameResolver
                        },
                    },
                    {
                        path: ':id',
                        data: {
                            breadcrumb: 'Detail',
                        },
                        loadComponent: () => import('@/pages/application-management/summary/summary.component').then((c) => c.SummaryComponent),
                        resolve: {
                            aplicanteResolver: getAssignedAplicanteByIdResolver,
                            listaTaxaResolver: getTaxaByCategoriaAndTipoResolver,
                            aldeiasResolver: getAllAldeiasResolver,
                            sociedadeComercialResolver: getSociedadeComercialResolver,
                            grupoAtividadeResolver: getAllGrupoAtividadeByTipoResolver,

                        }
                    },
                ]
            },
            {
                path: 'list',
                data: {
                    breadcrumb: 'Lista',
                },
                loadComponent: () => import('@/pages/application-management/application-list/application-list.component').then((c) => c.ApplicationListComponent),
                resolve: {
                    applicationPage: getPageResolver
                }
            },
            {
                path: ':id',
                data: {
                    breadcrumb: 'Detail',
                },
                loadComponent: () => import('@/pages/application-management/summary/summary.component').then((c) => c.SummaryComponent),
                resolve: {
                    aplicanteResolver: getByIdResolver,
                    listaTaxaResolver: getTaxaByCategoriaAndTipoResolver,
                    aldeiasResolver: getAllAldeiasResolver,
                    sociedadeComercialResolver: getSociedadeComercialResolver,
                    grupoAtividadeResolver: getAllGrupoAtividadeByTipoResolver,

                }
            },
            {
                path: ':id/pedido-inscricao',
                data: { breadcrumb: 'Pré-Visualização do Pedido Inscricao' },
                component: PedidoInscricaoComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/fatura-inscricao',
                data: { breadcrumb: 'Pré-Visualização do Fatura' },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/certificado-inscricao',
                data: { breadcrumb: 'Certificado PDF' },
                component: CertificatePdfComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            }
        ]

    },
] as Routes;