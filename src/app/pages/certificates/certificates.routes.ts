import { Routes } from "@angular/router";
import { CertificatePdfComponent } from "./certificate-pdf/certificate-pdf.component";
import { getAplicante } from "@/core/resolvers/empresa.resolver";

export default [
    {
        path: ':id',
        data: { breadcrumb: 'PDF' },
        component: CertificatePdfComponent,
        resolve: {
            applicanteResolver: getAplicante
        }
    }

] as Routes