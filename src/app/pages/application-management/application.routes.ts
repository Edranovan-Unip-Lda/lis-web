import { Routes } from '@angular/router';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationAtividadeDetailComponent } from './application-atividade-detail/application-atividade-detail.component';
import { getAplicante, getPageAplicanteOrByEmpresaIdResolver } from '@/core/resolvers/empresa.resolver';

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
        path: 'cadastro',
        data: { breadcrumb: 'Cadastro' },
        children: [
            {
                path: ':id',
                data: { breadcrumb: 'Detail' },
                component: ApplicationDetailComponent,
                resolve: {
                    aplicanteResolver: getAplicante
                }
            },
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
                    aplicanteResolver: getAplicante
                }
            }
        ]
    }
] as Routes;
