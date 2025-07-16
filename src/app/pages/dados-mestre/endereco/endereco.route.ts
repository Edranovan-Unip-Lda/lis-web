import { Routes } from "@angular/router";
import { MunicipioListComponent } from "./municipio-list/municipio-list.component";
import { PostoListComponent } from "./posto-list/posto-list.component";
import { SucoListComponent } from "./suco-list/suco-list.component";
import { AldeiaListComponent } from "./aldeia-list/aldeia-list.component";
import { getAldeiasResolver, getMunicipiosResolver, getPostosResolver, getSucosResolver } from "@/core/resolvers/data-master.resolver";

export default [
    {
        path: 'municipio',
        data: { breadcrumb: 'Lista Municipio' },
        component: MunicipioListComponent,
        resolve: {
            municipioResolve: getMunicipiosResolver
        }
    },
    {
        path: 'posto-administrativo',
        data: { breadcrumb: 'Lista Posto Administrativo' },
        component: PostoListComponent,
        resolve: {
            postoResolve: getPostosResolver
        }
    },
    {
        path: 'suco',
        data: { breadcrumb: 'Lista Suco' },
        component: SucoListComponent,
        resolve: {
            sucoResolve: getSucosResolver
        }
    },
    {
        path: 'aldeia',
        data: { breadcrumb: 'Lista aldeia' },
        component: AldeiaListComponent,
        resolve: {
            aldeiaResolve: getAldeiasResolver
        }
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;