import { Routes } from '@angular/router';
import { EmpresaListComponent } from './empresa-list/empresa-list.component';
import { EmpresaFormComponent } from './empresa-form/empresa-form.component';
import { getPageEmpresaResolver } from '@/core/resolvers/empresa.resolver';

export default [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'list',
        data: { breadcrumb: 'Lista' },
        component: EmpresaListComponent,
        resolve: {
            empresaPage: getPageEmpresaResolver
        }
    },
    {
        path: 'create',
        data: { breadcrumb: 'Criar' },
        component: EmpresaFormComponent,
        // resolve: {
        //     roleList: getRolesResolver,
        // }
    },
    // {
    //     path: ':username',
    //     data: { breadcrumb: 'Edit' },
    //     component: UserCreate,
    //     resolve: {
    //         roleList: getRolesResolver,
    //         userData: getUserByUsernameResolver,
    //     }
    // }
] as Routes;
