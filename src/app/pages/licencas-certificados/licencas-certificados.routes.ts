import { AplicanteType, Categoria } from "@/core/models/enums";
import { getAplicante, getPageCertificadosByEmpresaId } from "@/core/resolvers/empresa.resolver";
import { Routes } from "@angular/router";
import { CertificadosListaComponent } from "./certificados-lista/certificados-lista.component";
import { LicencasListaComponent } from "./licencas-lista/licencas-lista.component";
import { CertificatePdfComponent } from "../application-management/application-cadastro-detail/certificate-pdf/certificate-pdf.component";
import { CertificadoAtividadePdfComponent } from "../application-management/application-atividade-detail/pdf/certificado-atividade-pdf/certificado-atividade-pdf.component";
import { getCertificadoById } from "@/core/resolvers/certificados.resolver";



export default [
    {
        path: 'licencas',
        data: { breadcrumb: 'Licenças' },
        children: [
            {
                path: 'comercio',
                data: {
                    breadcrumb: 'Comércio',
                    type: AplicanteType.licenca,
                    categoria: Categoria.comercial,
                },
                component: LicencasListaComponent,
                resolve: {
                    licencaListResolver: getPageCertificadosByEmpresaId
                },
            },
            {
                path: 'comercio/:id',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.licenca,
                    categoria: Categoria.comercial,
                },
                component: CertificadoAtividadePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            },
            {
                path: 'industria',
                data: {
                    breadcrumb: 'Indústria',
                    type: AplicanteType.licenca,
                    categoria: Categoria.industrial,
                },
                component: LicencasListaComponent,
                resolve: {
                    licencaListResolver: getPageCertificadosByEmpresaId
                },
            },
            {
                path: 'industria/:id',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.licenca,
                    categoria: Categoria.industrial,
                },
                component: CertificadoAtividadePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            },
        ]
    },
    {
        path: 'certificados',
        data: { breadcrumb: 'Certificados' },
        children: [
            {
                path: 'comercio',
                data: {
                    breadcrumb: 'Comércio',
                    type: AplicanteType.cadastro,
                    categoria: Categoria.comercial,
                },
                component: CertificadosListaComponent,
                resolve: {
                    licencaListResolver: getPageCertificadosByEmpresaId
                }
            },
            {
                path: 'comercio/:id',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.cadastro,
                    categoria: Categoria.comercial,
                },
                component: CertificatePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            },
            {
                path: 'industria',
                data: {
                    breadcrumb: 'Indústria',
                    type: AplicanteType.cadastro,
                    categoria: Categoria.industrial,
                },
                component: CertificadosListaComponent,
                resolve: {
                    licencaListResolver: getPageCertificadosByEmpresaId
                }
            },
            {
                path: 'industria/:id',
                data: {
                    breadcrumb: 'Certificado PDF',
                    type: AplicanteType.cadastro,
                    categoria: Categoria.industrial,
                },
                component: CertificatePdfComponent,
                resolve: {
                    certificadoResolver: getCertificadoById
                }
            }
        ]
    },

] as Routes;