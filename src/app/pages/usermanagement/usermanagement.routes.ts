import { getDirecaoResolver, getRolesResolver } from '@/core/resolvers/data-master.resolver';
import { getPageEmpresaUserResolver, getPageUserResolver, getUserByUsernameResolver } from '@/core/resolvers/user.resolver';
import { Routes } from '@angular/router';
import { Role } from '@/core/models/enums';
import { canActivateByRole } from '@/core/security/route.guard';
import { UserCreate } from './usercreate';
import { UserList } from './userlist';

// #13: user-management screens were unguarded. Lists are back-office; create/edit (which assign roles) are
// ADMIN-only, matching the backend ADMIN gate on POST/PUT /api/v1/users.
const BACK_OFFICE = [Role.admin, Role.manager, Role.chief, Role.staff];

export default [
    // { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'internal/list',
        data: {
            breadcrumb: 'Lista',
            type: 'internal',
            role: BACK_OFFICE
        },
        component: UserList,
        resolve: {
            userPage: getPageUserResolver
        },
        canActivate: [canActivateByRole]
    },
    {
        path: 'empresa/list',
        data: {
            breadcrumb: 'Lista',
            role: BACK_OFFICE
        },
        component: UserList,
        resolve: {
            userPage: getPageEmpresaUserResolver
        },
        canActivate: [canActivateByRole]
    },
    {
        path: 'create',
        data: {
            breadcrumb: 'Criar',
            role: [Role.admin]
        },
        component: UserCreate,
        resolve: {
            roleList: getRolesResolver,
            direcaoList: getDirecaoResolver,
        },
        canActivate: [canActivateByRole]
    },
    {
        path: ':username',
        data: {
            breadcrumb: 'Editar',
            role: [Role.admin]
        },
        component: UserCreate,
        resolve: {
            roleList: getRolesResolver,
            userData: getUserByUsernameResolver,
            direcaoList: getDirecaoResolver,
        },
        canActivate: [canActivateByRole]
    }
] as Routes;
