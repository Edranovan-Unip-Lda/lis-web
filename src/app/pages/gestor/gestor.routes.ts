import { AplicanteType, Categoria, Role } from "@/core/models/enums";
import { getByIdResolver, getPageResolver } from "@/core/resolvers/aplicante.resolver";
import { getCertificadoById } from "@/core/resolvers/certificados.resolver";
import { getAllAldeiasResolver, getPageClasseAtividadeResolver, getPostosResolver, getSociedadeComercialResolver, getTaxaByCategoriaAndTipoResolver } from "@/core/resolvers/data-master.resolver";
import { getAssignedAplicanteByIdResolver, getPageAplicanteByUsernameResolver, getPageCertificadosByUsername, getPageUserResolver, getUsersByDirecaoIdAndRole_Staff } from "@/core/resolvers/user.resolver";
import { canActivateByRole } from "@/core/security/route.guard";
import { Routes } from "@angular/router";
import { AutoVistoriaComponent } from "../application-management/application-atividade-detail/auto-vistoria/auto-vistoria.component";
import { AutoVistoriaPdfComponent } from "../application-management/application-atividade-detail/pdf/auto-vistoria-pdf/auto-vistoria-pdf.component";
import { CertificadoAtividadePdfComponent } from "../application-management/application-atividade-detail/pdf/certificado-atividade-pdf/certificado-atividade-pdf.component";
import { PedidoPdfComponent } from "../application-management/application-atividade-detail/pdf/pedido-pdf/pedido-pdf.component";
import { PedidoVistoriaPdfComponent } from "../application-management/application-atividade-detail/pdf/pedido-vistoria-pdf/pedido-vistoria-pdf.component";
import { CertificatePdfComponent } from "../application-management/application-cadastro-detail/certificate-pdf/certificate-pdf.component";
import { FaturaComponent } from "../application-management/application-cadastro-detail/fatura/fatura.component";
import { PedidoInscricaoComponent } from "../application-management/application-cadastro-detail/pedido-inscricao/pedido-inscricao.component";
import { CertificadosListaComponent } from "../licencas-certificados/certificados-lista/certificados-lista.component";
import { LicencasListaComponent } from "../licencas-certificados/licencas-lista/licencas-lista.component";

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
                            userRoleStaffResolver: getUsersByDirecaoIdAndRole_Staff

                        }
                    },
                    {
                        path: ':id/auto-vistoria',
                        data: {
                            breadcrumb: 'Auto Vistoria',
                            role: [Role.staff, Role.admin]
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
                data: { breadcrumb: 'Pré-Visualização do Fatura', type: 'CADASTRO' },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/certificado-inscricao/:certificadoId',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.cadastro,
                },
                component: CertificatePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
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
                data: { breadcrumb: 'Pré-Visualização da Fatura', type: 'ATIVIDADE', },
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
                    type: 'VISTORIA',
                },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getByIdResolver,
                }
            },
            {
                path: ':id/certificado-atividade/:certificadoId',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.licenca,
                },
                component: CertificadoAtividadePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            },
        ]

    },
    {
        path: 'licencas',
        data: { breadcrumb: 'Licenças' },
        children: [
            {
                path: 'comercio',
                data: {
                    breadcrumb: 'Comércio',
                    type: AplicanteType.licenca,
                    categoria: Categoria.comercial,
                },
                component: LicencasListaComponent,
                resolve: {
                    licencaListResolver: getPageCertificadosByUsername
                },
            },
            {
                path: 'comercio/:id',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.licenca,
                    categoria: Categoria.comercial,
                },
                component: CertificadoAtividadePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            },
            {
                path: 'industria',
                data: {
                    breadcrumb: 'Indústria',
                    type: AplicanteType.licenca,
                    categoria: Categoria.industrial,
                },
                component: LicencasListaComponent,
                resolve: {
                    licencaListResolver: getPageCertificadosByUsername
                },
            },
            {
                path: 'industria/:id',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.licenca,
                    categoria: Categoria.industrial,
                },
                component: CertificadoAtividadePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            }
        ]
    },
    {
        path: 'certificados',
        data: { breadcrumb: 'Certificados' },
        children: [
            {
                path: 'comercio',
                data: {
                    breadcrumb: 'Comércio',
                    type: AplicanteType.cadastro,
                    categoria: Categoria.comercial,
                },
                component: CertificadosListaComponent,
                resolve: {
                    licencaListResolver: getPageCertificadosByUsername
                },
            },
            {
                path: 'comercio/:id',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.cadastro,
                    categoria: Categoria.comercial,
                },
                component: CertificatePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            },
            {
                path: 'industria',
                data: {
                    breadcrumb: 'Indústria',
                    type: AplicanteType.cadastro,
                    categoria: Categoria.industrial,
                },
                component: CertificadosListaComponent,
                resolve: {
                    licencaListResolver: getPageCertificadosByUsername
                },
            },
            {
                path: 'industria/:id',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.cadastro,
                    categoria: Categoria.industrial,
                },
                component: CertificatePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            }
        ]
    },

] as Routes;