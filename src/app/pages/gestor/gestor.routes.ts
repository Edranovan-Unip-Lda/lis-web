import { getByIdResolver, getPageResolver } from "@/core/resolvers/aplicante.resolver";
import { getAllAldeiasResolver, getAllGrupoAtividadeByTipoResolver, getPageClasseAtividadeResolver, getPostosResolver, getSociedadeComercialResolver, getTaxaByCategoriaAndTipoResolver } from "@/core/resolvers/data-master.resolver";
import { getAssignedAplicanteByIdResolver, getPageAplicanteByUsernameResolver, getPageUserResolver } from "@/core/resolvers/user.resolver";
import { Routes } from "@angular/router";
import { AutoVistoriaComponent } from "../application-management/application-atividade-detail/auto-vistoria/auto-vistoria.component";
import { PedidoPdfComponent } from "../application-management/application-atividade-detail/pdf/pedido-pdf/pedido-pdf.component";
import { PedidoVistoriaPdfComponent } from "../application-management/application-atividade-detail/pdf/pedido-vistoria-pdf/pedido-vistoria-pdf.component";
import { CertificatePdfComponent } from "../application-management/application-cadastro-detail/certificate-pdf/certificate-pdf.component";
import { FaturaComponent } from "../application-management/application-cadastro-detail/fatura/fatura.component";
import { PedidoInscricaoComponent } from "../application-management/application-cadastro-detail/pedido-inscricao/pedido-inscricao.component";
import { AutoVistoriaPdfComponent } from "../application-management/application-atividade-detail/pdf/auto-vistoria-pdf/auto-vistoria-pdf.component";
import { CertificadoAtividadePdfComponent } from "../application-management/application-atividade-detail/pdf/certificado-atividade-pdf/certificado-atividade-pdf.component";
import { canActivateByRole } from "@/core/security/route.guard";
import { Role } from "@/core/models/enums";

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
                        loadComponent: () => import('@/pages/application-management/application-cadastro-detail/application-list/application-list.component').then((c) => c.ApplicationListComponent),
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
                            userPageResolver: getPageUserResolver

                        }
                    },
                    {
                        path: ':id/auto-vistoria',
                        data: {
                            breadcrumb: 'Auto Vistoria',
                            role: [Role.staff]
                        },
                        canActivate: [canActivateByRole],
                        component: AutoVistoriaComponent,
                        resolve: {
                            aplicanteResolver: getAssignedAplicanteByIdResolver,
                            listaAldeiasResolver: getAllAldeiasResolver,
                            listaClasseAtividadeResolver: getPageClasseAtividadeResolver,
                            listaPostoAdministrativoResolver: getPostosResolver,
                        }
                    }
                ]
            },
            {
                path: 'list',
                data: {
                    breadcrumb: 'Lista',
                },
                loadComponent: () => import('@/pages/application-management/application-cadastro-detail/application-list/application-list.component').then((c) => c.ApplicationListComponent),
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
                    userPageResolver: getPageUserResolver

                }
            },
            // Inscricao de Cadastro
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
            },
            // Atividade de Licenca
            {
                path: ':id/pedido-atividade',
                data: { breadcrumb: 'Pedido Atividade de Licenca' },
                component: PedidoPdfComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/fatura-atividade',
                data: { breadcrumb: 'Pré-Visualização da Fatura', tipo: 'ATIVIDADE', },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/pedido-vistoria',
                data: {
                    breadcrumb: 'Pedido Vistoria para Licenca de Atividade',

                },
                component: PedidoVistoriaPdfComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/auto-vistoria',
                data: {
                    breadcrumb: 'Auto Vistoria',
                },
                component: AutoVistoriaPdfComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/fatura-vistoria',
                data: {
                    breadcrumb: 'Pré-Visualização da Fatura',
                    tipo: 'VISTORIA',
                },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/certificado-atividade',
                data: { breadcrumb: 'Certificado PDF' },
                component: CertificadoAtividadePdfComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
        ]

    },
] as Routes;