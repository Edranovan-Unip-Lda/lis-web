import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { CertificadoService } from "../services/certificado.service";
import { AplicanteType, Categoria } from "../models/enums";
import { inject } from "@angular/core";
import { of } from "rxjs";


export const getCertificadoById: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const id = route.paramMap.get('certificadoId') ? route.paramMap.get('certificadoId') : route.paramMap.get('id');
    const categoria = route.data['categoria'] as Categoria;
    const type = route.data['type'] as AplicanteType;
    const service = inject(CertificadoService);
    console.log(id);
    
    if (id) {
        return service.getCertificadosById(+id, type, categoria);
    } else {
        return of(null);
    }
}