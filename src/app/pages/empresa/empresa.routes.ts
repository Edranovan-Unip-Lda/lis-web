import { getAllAldeiasResolver, getRolesResolver, getSociedadeComercialResolver } from '@/core/resolvers/data-master.resolver';
import { getByUsernameResolver, getPageEmpresaResolver } from '@/core/resolvers/empresa.resolver';
import { Routes } from '@angular/router';
import { EmpresaDetailComponent } from './empresa-detail/empresa-detail.component';
import { EmpresaFormComponent } from './empresa-form/empresa-form.component';
import { EmpresaListComponent } from './empresa-list/empresa-list.component';
import { Role } from '@/core/models/enums';

export default [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'list',
        data: { breadcrumb: 'Lista' },
        component: EmpresaListComponent,
        resolve: {
            empresaPage: getPageEmpresaResolver,
            // role: [Role.admin, Role.manager, Role.chief, Role.staff]
        }
    },
    // {
    //     path: 'create',
    //     data: { breadcrumb: 'Criar' },
    //     component: EmpresaFormComponent,
    //     resolve: {
    //         roleList: getRolesResolver,
    //     }
    // },
    {
        path: ':username',
        data: { breadcrumb: 'Edit' },
        component: EmpresaFormComponent,
        resolve: {
            role: [Role.client],
            aldeiasResolver: getAllAldeiasResolver,
            listaSociedadeComercial: getSociedadeComercialResolver,
            roleListResolver: getRolesResolver,
            empresaResolver: getByUsernameResolver,
        }
    },
    {
        path: 'detail/:username',
        data: { breadcrumb: 'Detail' },
        component: EmpresaDetailComponent,
        resolve: {
            aldeiasResolver: getAllAldeiasResolver,
            listaSociedadeComercial: getSociedadeComercialResolver,
            roleListResolver: getRolesResolver,
            empresaResolver: getByUsernameResolver,
        }
    }
] as Routes;
