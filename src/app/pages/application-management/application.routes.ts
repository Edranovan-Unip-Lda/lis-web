import { getAllAldeiasResolver, getAllGrupoAtividadeByTipoResolver, getSociedadeComercialResolver, getTaxaByCategoriaAndTipoResolver } from '@/core/resolvers/data-master.resolver';
import { getAplicante, getPageAplicanteOrByEmpresaIdResolver } from '@/core/resolvers/empresa.resolver';
import { Routes } from '@angular/router';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationListComponent } from './application-list/application-list.component';
import { CertificatePdfComponent } from './certificate-pdf/certificate-pdf.component';
import { FaturaComponent } from './fatura/fatura.component';
import { PedidoInscricaoComponent } from './pedido-inscricao/pedido-inscricao.component';
import { ApplicationAtividadeDetailComponent } from './application-atividade-detail/application-atividade-detail.component';

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
                component: ApplicationDetailComponent,
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
                data: { breadcrumb: 'Fatura PDF' },
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
            }
        ]
    },
] as Routes;
