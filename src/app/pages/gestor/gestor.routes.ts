import { getPageAplicanteByUsernameResolver } from "@/core/resolvers/user.resolver";
import { Routes } from "@angular/router";
import { ApplicationListComponent } from "../application-management/application-list/application-list.component";
import { canActivateByRole } from "@/core/security/route.guard";
import { Role } from "@/core/models/enums";
import { getAplicante } from "@/core/resolvers/empresa.resolver";
import { getAllAldeiasResolver, getAllGrupoAtividadeByTipoResolver, getSociedadeComercialResolver, getTaxaByCategoriaAndTipoResolver } from "@/core/resolvers/data-master.resolver";

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
                    role: [Role.manager, Role.staff]
                },
                component: ApplicationListComponent,
                resolve: {
                    applicationPage: getPageAplicanteByUsernameResolver
                },
                canActivateChild: [canActivateByRole],
            },
            {
                path: ':id',
                data: { breadcrumb: 'Detail' },
                loadComponent: () => import('@/pages/application-management/application-detail/application-detail.component').then((c) => c.ApplicationDetailComponent),
                resolve: {
                    aplicanteResolver: getAplicante,
                    listaTaxaResolver: getTaxaByCategoriaAndTipoResolver,
                    aldeiasResolver: getAllAldeiasResolver,
                    sociedadeComercialResolver: getSociedadeComercialResolver,
                    grupoAtividadeResolver: getAllGrupoAtividadeByTipoResolver,

                }
            },
        ]

    },
] as Routes;