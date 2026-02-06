import { getDirecaoResolver, getRolesResolver } from '@/core/resolvers/data-master.resolver';
import { getPageEmpresaUserResolver, getPageUserResolver, getUserByUsernameResolver } from '@/core/resolvers/user.resolver';
import { Routes } from '@angular/router';
import { UserCreate } from './usercreate';
import { UserList } from './userlist';

export default [
    // { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'internal/list',
        data: { breadcrumb: 'Lista' },
        component: UserList,
        resolve: {
            userPage: getPageUserResolver
        }
    },
    {
        path: 'empresa/list',
        data: { breadcrumb: 'Lista' },
        component: UserList,
        resolve: {
            userPage: getPageEmpresaUserResolver
        }
    },
    {
        path: 'create',
        data: { breadcrumb: 'Criar' },
        component: UserCreate,
        resolve: {
            roleList: getRolesResolver,
            direcaoList: getDirecaoResolver,
        }
    },
    {
        path: ':username',
        data: { breadcrumb: 'Editar' },
        component: UserCreate,
        resolve: {
            roleList: getRolesResolver,
            userData: getUserByUsernameResolver,
            direcaoList: getDirecaoResolver,
        }
    }
] as Routes;
