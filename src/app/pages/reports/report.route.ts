import { getMunicipiosResolver, getPostosResolver, getSociedadeComercialResolver, getSucosResolver } from "@/core/resolvers/data-master.resolver";
import { Routes } from "@angular/router";


export default [
    {
        path: 'empresa',
        data: { breadcrumb: 'Empresa' },
        loadComponent: () => import('./empresa/empresa.component').then(m => m.EmpresaComponent),
        resolve: {
            listaSociedadeComercial: getSociedadeComercialResolver,
            listaMunicipios: getMunicipiosResolver,
            listaPostosAdministrativos: getPostosResolver,
            listaSucos: getSucosResolver,
        }
    },
    {
        path: 'aplicante',
        data: { breadcrumb: 'Aplicante' },
        loadComponent: () => import('./aplicante/aplicante.component').then(m => m.AplicanteComponent)
    },
    {
        path: 'licencas-certificados',
        data: { breadcrumb: 'Licenças e Certificados' },
        loadComponent: () => import('./licencas-certificados/licencas-certificados.component').then(m => m.LicencasCertificadosComponent)
    },
] as Routes;
