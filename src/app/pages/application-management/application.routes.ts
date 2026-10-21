import { AplicanteType, Role } from '@/core/models/enums';
import { getCertificadoById } from '@/core/resolvers/certificados.resolver';
import { getAllAldeiasResolver, getPageClasseAtividadeResolver, getSociedadeComercialResolver, getTaxaByCategoriaAndTipoResolver } from '@/core/resolvers/data-master.resolver';
import { getAplicante, getPageAplicanteOrByEmpresaIdResolver } from '@/core/resolvers/empresa.resolver';
import { Routes } from '@angular/router';
import { ApplicationAtividadeDetailComponent } from './application-atividade-detail/application-atividade-detail.component';
import { AutoVistoriaPdfComponent } from './application-atividade-detail/pdf/auto-vistoria-pdf/auto-vistoria-pdf.component';
import { CertificadoAtividadePdfComponent } from './application-atividade-detail/pdf/certificado-atividade-pdf/certificado-atividade-pdf.component';
import { PedidoPdfComponent } from './application-atividade-detail/pdf/pedido-pdf/pedido-pdf.component';
import { PedidoVistoriaPdfComponent } from './application-atividade-detail/pdf/pedido-vistoria-pdf/pedido-vistoria-pdf.component';
import { ApplicationCadastroDetailComponent } from './application-cadastro-detail/application-cadastro-detail.component';
import { ApplicationListComponent } from './application-list/application-list.component';
import { CertificatePdfComponent } from './application-cadastro-detail/certificate-pdf/certificate-pdf.component';
import { FaturaComponent } from './application-cadastro-detail/fatura/fatura.component';
import { PedidoInscricaoComponent } from './application-cadastro-detail/pedido-inscricao/pedido-inscricao.component';
import { canActivateByRole } from '@/core/security/route.guard';

export default [
    {
        path: 'list',
        // listMode tells the shared list component which paged endpoint to call for page/search/sort.
        data: { breadcrumb: 'breadcrumb.lista', listMode: 'client' },
        component: ApplicationListComponent,
        resolve: {
            applicationPage: getPageAplicanteOrByEmpresaIdResolver
        }
    },
    {
        path: 'cadastro',
        data: { breadcrumb: 'breadcrumb.atividade' },
        children: [
            {
                path: ':id',
                data: {
                    breadcrumb: 'breadcrumb.detalhe',
                    role: [Role.client]
                },
                component: ApplicationCadastroDetailComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                    listaTaxaResolver: getTaxaByCategoriaAndTipoResolver,
                    aldeiasResolver: getAllAldeiasResolver,
                    sociedadeComercialResolver: getSociedadeComercialResolver,
                    classeAtividadeResolver: getPageClasseAtividadeResolver,
                },
                canActivate: [canActivateByRole],
            },
            {
                path: ':id/pedido-inscricao',
                data: { breadcrumb: 'breadcrumb.pedidoInscricaoPdf' },
                component: PedidoInscricaoComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/fatura-inscricao',
                data: { breadcrumb: 'breadcrumb.faturaPreview', type: AplicanteType.cadastro },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/certificado-inscricao/:certificadoId',
                data: {
                    breadcrumb: 'breadcrumb.certificadoPdf',
                    type: AplicanteType.cadastro,
                },
                component: CertificatePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            }
        ]
    },
    {
        path: 'atividade',
        data: { breadcrumb: 'breadcrumb.atividade' },
        children: [
            {
                path: ':id',
                data: {
                    breadcrumb: 'breadcrumb.detalhe',
                    role: [Role.client]
                },
                component: ApplicationAtividadeDetailComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                    listaTaxaResolver: getTaxaByCategoriaAndTipoResolver,
                    aldeiasResolver: getAllAldeiasResolver,
                    sociedadeComercialResolver: getSociedadeComercialResolver,
                    grupoAtividadeResolver: getPageClasseAtividadeResolver,
                    classeAtividadeResolver: getPageClasseAtividadeResolver,
                },
                canActivate: [canActivateByRole],
            },
            {
                path: ':id/pedido-licenca',
                data: { breadcrumb: 'breadcrumb.pedidoAtividade' },
                component: PedidoPdfComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/fatura-atividade',
                data: { breadcrumb: 'breadcrumb.faturaPdf', type: 'ATIVIDADE', },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/pedido-vistoria',
                data: {
                    breadcrumb: 'breadcrumb.pedidoVistoria',

                },
                component: PedidoVistoriaPdfComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/fatura-vistoria',
                data: {
                    breadcrumb: 'breadcrumb.faturaPdf',
                    type: 'VISTORIA',
                },
                component: FaturaComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/auto-vistoria',
                data: {
                    breadcrumb: 'breadcrumb.autoVistoria',
                },
                component: AutoVistoriaPdfComponent,
                resolve: {
                    aplicanteResolver: getAplicante,
                }
            },
            {
                path: ':id/certificado-atividade/:certificadoId',
                data: {
                    breadcrumb: 'breadcrumb.certificadoPdf',
                    type: AplicanteType.licenca,
                },
                component: CertificadoAtividadePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            },
        ]
    },
] as Routes;
