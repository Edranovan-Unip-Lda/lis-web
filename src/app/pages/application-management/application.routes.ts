import { getAllAldeiasResolver, getAllGrupoAtividadeByTipoResolver, getSociedadeComercialResolver, getTaxaByCategoriaAndTipoResolver } from '@/core/resolvers/data-master.resolver';
import { getAplicante, getPageAplicanteOrByEmpresaIdResolver } from '@/core/resolvers/empresa.resolver';
import { Routes } from '@angular/router';
import { ApplicationAtividadeDetailComponent } from './application-atividade-detail/application-atividade-detail.component';
import { AutoVistoriaPdfComponent } from './application-atividade-detail/pdf/auto-vistoria-pdf/auto-vistoria-pdf.component';
import { CertificadoAtividadePdfComponent } from './application-atividade-detail/pdf/certificado-atividade-pdf/certificado-atividade-pdf.component';
import { PedidoPdfComponent } from './application-atividade-detail/pdf/pedido-pdf/pedido-pdf.component';
import { ApplicationCadastroDetailComponent } from './application-cadastro-detail/application-cadastro-detail.component';
import { ApplicationListComponent } from './application-cadastro-detail/application-list/application-list.component';
import { CertificatePdfComponent } from './application-cadastro-detail/certificate-pdf/certificate-pdf.component';
import { FaturaComponent } from './application-cadastro-detail/fatura/fatura.component';
import { PedidoInscricaoComponent } from './application-cadastro-detail/pedido-inscricao/pedido-inscricao.component';

export default [
    {
        path: 'list',
        data: { breadcrumb: 'Lista' },
        component: ApplicationListComponent,
        resolve: {
            applicationPage: getPageAplicanteOrByEmpresaIdResolver
        }
    },
    {
        path: 'cadastro',
        data: { breadcrumb: 'Atividade' },
        children: [
            {
                path: ':id',
                data: { breadcrumb: 'Detail' },
                component: ApplicationCadastroDetailComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                    listaTaxaResolver: getTaxaByCategoriaAndTipoResolver,
                    aldeiasResolver: getAllAldeiasResolver,
                    sociedadeComercialResolver: getSociedadeComercialResolver,
                    grupoAtividadeResolver: getAllGrupoAtividadeByTipoResolver,

                }
            },
            {
                path: ':id/pedido-inscricao',
                data: { breadcrumb: 'Pedido Inscricao PDF' },
                component: PedidoInscricaoComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/fatura-inscricao',
                data: { breadcrumb: 'Fatura PDF', tipo: 'CADASTRO', },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/certificado-inscricao',
                data: { breadcrumb: 'Certificado PDF' },
                component: CertificatePdfComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            }
        ]
    },
    {
        path: 'atividade',
        data: { breadcrumb: 'Atividade' },
        children: [
            {
                path: ':id',
                data: { breadcrumb: 'Detail' },
                component: ApplicationAtividadeDetailComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                    listaTaxaResolver: getTaxaByCategoriaAndTipoResolver,
                    aldeiasResolver: getAllAldeiasResolver,
                    sociedadeComercialResolver: getSociedadeComercialResolver,
                    grupoAtividadeResolver: getAllGrupoAtividadeByTipoResolver,
                }
            },
            {
                path: ':id/pedido-licenca',
                data: { breadcrumb: 'Pedido Atividade de Licenca' },
                component: PedidoPdfComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/fatura-atividade',
                data: { breadcrumb: 'Fatura PDF', tipo: 'ATIVIDADE', },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/pedido-vistoria',
                data: {
                    breadcrumb: 'Pedido Vistoria para Licenca de Atividade',

                },
                component: PedidoPdfComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/fatura-vistoria',
                data: {
                    breadcrumb: 'Fatura PDF',
                    tipo: 'VISTORIA',
                },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/auto-vistoria',
                data: {
                    breadcrumb: 'Auto Vistoria',
                },
                component: AutoVistoriaPdfComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/certificado-atividade',
                data: { breadcrumb: 'Certificado PDF' },
                component: CertificadoAtividadePdfComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
        ]
    },
] as Routes;
