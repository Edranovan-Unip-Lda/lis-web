import { Routes } from '@angular/router';
import { UserList } from './userlist';
import { UserCreate } from './usercreate';
import { getPageUserResolver, getUserByUsernameResolver } from '@/core/resolvers/user.resolver';
import { getRolesResolver } from '@/core/resolvers/data-master.resolver';

export default [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'list',
        data: { breadcrumb: 'Lista' },
        component: UserList,
        resolve: {
            userPage: getPageUserResolver
        }
    },
    {
        path: 'create',
        data: { breadcrumb: 'Criar' },
        component: UserCreate,
        resolve: {
            roleList: getRolesResolver,
        }
    },
    {
        path: ':username',
        data: { breadcrumb: 'Editar' },
        component: UserCreate,
        resolve: {
            roleList: getRolesResolver,
            userData: getUserByUsernameResolver,
        }
    }
] as Routes;
