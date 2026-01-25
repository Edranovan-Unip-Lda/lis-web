import { getAllAldeiasResolver, getRolesResolver, getSociedadeComercialResolver } from '@/core/resolvers/data-master.resolver';
import { getByUsernameResolver, getPageEmpresaResolver } from '@/core/resolvers/empresa.resolver';
import { Routes } from '@angular/router';
import { EmpresaDetailComponent } from './empresa-detail/empresa-detail.component';
import { EmpresaFormComponent } from './empresa-form/empresa-form.component';
import { EmpresaListComponent } from './empresa-list/empresa-list.component';
import { Role } from '@/core/models/enums';
import { canActivateByRole } from '@/core/security/route.guard';

export default [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'list',
        data: {
            breadcrumb: 'Lista',
            role: [Role.admin, Role.manager, Role.chief, Role.staff]
        },
        component: EmpresaListComponent,
        resolve: {
            empresaPage: getPageEmpresaResolver,
        },
        canActivate: [canActivateByRole],
    },
    {
        path: ':username',
        data: {
            breadcrumb: 'Edit',
            role: [Role.client],
        },
        component: EmpresaFormComponent,
        resolve: {
            aldeiasResolver: getAllAldeiasResolver,
            listaSociedadeComercial: getSociedadeComercialResolver,
            roleListResolver: getRolesResolver,
            empresaResolver: getByUsernameResolver,
        }
    },
    {
        path: 'detail/:username',
        data: {
            breadcrumb: 'Detail',
            role: [Role.admin, Role.manager, Role.chief, Role.staff]
        },
        component: EmpresaDetailComponent,
        resolve: {
            aldeiasResolver: getAllAldeiasResolver,
            listaSociedadeComercial: getSociedadeComercialResolver,
            roleListResolver: getRolesResolver,
            empresaResolver: getByUsernameResolver,
        },
        canActivate: [canActivateByRole],
    }
] as Routes;
