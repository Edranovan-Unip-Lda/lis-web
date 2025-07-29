import { getAllAldeiasResolver, getAtividadeEconomicaAtividadeResolver, getAtividadeEconomicaTipoResolver, getSociedadeComercialResolver, getTaxaByCategoriaAndTipoResolver } from '@/core/resolvers/data-master.resolver';
import { getAplicante, getPageAplicanteOrByEmpresaIdResolver } from '@/core/resolvers/empresa.resolver';
import { Routes } from '@angular/router';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationListComponent } from './application-list/application-list.component';

export default [
    {
        path: 'list',
        data: { breadcrumb: 'Lista' },
        component: ApplicationListComponent,
        resolve: {
            applicationPage: getPageAplicanteOrByEmpresaIdResolver
        }
    },
    // {
    //     path: 'create',
    //     data: { breadcrumb: 'Criar' },
    //     component: ApplicationFormComponent
    // },
    {
        path: ':id',
        data: { breadcrumb: 'Detail' },
        component: ApplicationDetailComponent,
        resolve: {
            aplicanteResolver: getAplicante,
            listaTaxaResolver: getTaxaByCategoriaAndTipoResolver,
            aldeiasResolver: getAllAldeiasResolver,
            atividadeEconomicaTipoResolver: getAtividadeEconomicaTipoResolver,
            atividadeEconomicaAtividadeResolver: getAtividadeEconomicaAtividadeResolver,
            sociedadeComercialResolver: getSociedadeComercialResolver,

        }
    },

    // {
    //     path: 'cadastro',
    //     data: { breadcrumb: 'Cadastro' },
    //     children: [
    //         {
    //             path: ':id',
    //             data: { breadcrumb: 'Detail' },
    //             component: ApplicationDetailComponent,
    //             resolve: {
    //                 aplicanteResolver: getAplicante,
    //                 listaTaxaResolver: getTaxaResolver,
    //                 aldeiasResolver: getAllAldeiasResolver,
    //                 atividadeEconomicaTipoResolver: getAtividadeEconomicaTipoResolver,
    //                 atividadeEconomicaAtividadeResolver: getAtividadeEconomicaAtividadeResolver,
    //                 sociedadeComercialResolver: getSociedadeComercialResolver,
    //             }
    //         },
    //         {
    //             path: ':id/pedido-inscricao',
    //             data: { breadcrumb: 'Atividade' },
    //             component: PedidoInscricaoComponent,
    //             resolve: {
    //                 aplicanteResolver: getAplicante,
    //             }
    //         }
    //     ]

    // },
    // {
    //     path: 'atividade',
    //     data: { breadcrumb: 'Atividade' },
    //     children: [
    //         {
    //             path: ':id',
    //             data: { breadcrumb: 'Detail' },
    //             component: ApplicationAtividadeDetailComponent,
    //             resolve: {
    //                 aplicanteResolver: getAplicante
    //             }
    //         }
    //     ]
    // }
] as Routes;
