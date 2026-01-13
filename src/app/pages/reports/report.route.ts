import { getAllClasseAtividadeResolver, getAllPostosResolver, getAllSucosResolver, getMunicipiosResolver, getPostosResolver, getSociedadeComercialResolver, getSucosResolver } from "@/core/resolvers/data-master.resolver";
import { getPageEmpresaResolver } from "@/core/resolvers/empresa.resolver";
import { Routes } from "@angular/router";


export default [
    {
        path: 'empresa',
        data: { breadcrumb: 'Empresa' },
        loadComponent: () => import('./empresa/empresa.component').then(m => m.EmpresaComponent),
        resolve: {
            listaSociedadeComercial: getSociedadeComercialResolver,
            listaMunicipios: getMunicipiosResolver,
            listaPostosAdministrativos: getAllPostosResolver,
            listaSucos: getAllSucosResolver,
        }
    },
    {
        path: 'aplicante',
        data: { breadcrumb: 'Aplicante' },
        loadComponent: () => import('./aplicante/aplicante.component').then(m => m.AplicanteComponent),
        resolve: {
            listaEmpresa: getPageEmpresaResolver,
        }
    },
    {
        path: 'licencas-certificados',
        data: { breadcrumb: 'Licenças e Certificados' },
        loadComponent: () => import('./licencas-certificados/licencas-certificados.component').then(m => m.LicencasCertificadosComponent),
        resolve: {
            listaEmpresa: getPageEmpresaResolver,
            listaMunicipios: getMunicipiosResolver,
            listaPostosAdministrativos: getAllPostosResolver,
            listaSucos: getAllSucosResolver,
            classeAtividadeResolver: getAllClasseAtividadeResolver,
        }
    },
] as Routes;
