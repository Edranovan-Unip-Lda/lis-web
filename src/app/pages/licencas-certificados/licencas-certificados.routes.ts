import { Routes } from "@angular/router";
import { CertificadosListaComponent } from "./certificados-lista/certificados-lista.component";
import { LicencasListaComponent } from "./licencas-lista/licencas-lista.component";



export default [
    {
        path: 'licencas',
        data: { breadcrumb: 'Licenças' },
        component: LicencasListaComponent
    },
     {
        path: 'certificados',
        data: { breadcrumb: 'Certificados' },
        component: CertificadosListaComponent
    }
    // {
    //     path: 'certificados',
    //     data: { breadcrumb: 'Certificados' },
    //     children: [
    //         {
    //             path: 'comercio',
    //             data: { breadcrumb: 'Comércio' },
    //             component: CertificadosListaComponent
    //         },
    //         {
    //             path: 'industria',
    //             data: { breadcrumb: 'Indústria' },
    //             component: CertificadosListaComponent
    //         }
    //     ]
    // },
    // {
    //     path: 'licencas',
    //     data: { breadcrumb: 'Licenças' },
    //     children: [
    //         {
    //             path: 'comercio',
    //             data: { breadcrumb: 'Comércio' },
    //             component: LicencasListaComponent
    //         },
    //         {
    //             path: 'industria',
    //             data: { breadcrumb: 'Indústria' },
    //             component: LicencasListaComponent
    //         }
    //     ]
    // },

] as Routes;