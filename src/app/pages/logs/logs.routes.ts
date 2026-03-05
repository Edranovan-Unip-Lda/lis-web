import { getAllActivities, getLoginActivities } from "@/core/resolvers/audit.resolver";
import { Routes } from '@angular/router';

export default [
    {
        path: 'autenticacoes',
        loadComponent: () => import('./authentication/authentication-list.component').then(c => c.AuthenticationListComponent),
        data: { breadcrumb: 'Autenticações' },
        resolve: {
            loginActivities: getLoginActivities
        }
    },
    {
        path: 'acoes',
        loadComponent: () => import('./actions/actions.component').then(c => c.ActionsComponent),
        data: { breadcrumb: 'Ações' },
        resolve: {
            allActivities: getAllActivities
        }
    }
] as Routes;