import { Routes } from "@angular/router";
import { MunicipioListComponent } from "./municipio-list/municipio-list.component";
import { PostoListComponent } from "./posto-list/posto-list.component";
import { SucoListComponent } from "./suco-list/suco-list.component";
import { AldeiaListComponent } from "./aldeia-list/aldeia-list.component";
import { getAldeiasResolver, getMunicipiosResolver, getPostosResolver, getSucosResolver } from "@/core/resolvers/data-master.resolver";

export default [
    {
        path: 'municipio',
        data: { breadcrumb: 'Lista Municipio', type: 'municipios' },
        component: MunicipioListComponent,
        resolve: {
            municipioResolve: getMunicipiosResolver
        }
    },
    {
        path: 'posto-administrativo',
        data: { breadcrumb: 'Lista Posto Administrativo', type: 'postos' },
        component: PostoListComponent,
        resolve: {
            municipioResolve: getMunicipiosResolver,
            postoResolve: getPostosResolver
        }
    },
    {
        path: 'suco',
        data: { breadcrumb: 'Lista Suco', type: 'sucos' },
        component: SucoListComponent,
        resolve: {
            sucoResolve: getSucosResolver,
            municipioResolve: getMunicipiosResolver,
            postoResolve: getPostosResolver
        }
    },
    {
        path: 'aldeia',
        data: { breadcrumb: 'Lista aldeia', type: 'aldeias' },
        component: AldeiaListComponent,
        resolve: {
            aldeiaResolve: getAldeiasResolver,
            municipioResolve: getMunicipiosResolver,
        }
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;