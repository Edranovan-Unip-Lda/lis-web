import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { AplicanteService } from "../services/aplicante.service";
import { inject } from "@angular/core";
import { of } from "rxjs";

export const getPageEmpresaResolver: ResolveFn<any> = () => {
    const service = inject(AplicanteService);
    return service.getPage();
}

export const getByIdResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const id = route.paramMap.get('id');
    const service = inject(AplicanteService);
    if (id) {
        return service.getById(+id);
    } else {
        return of(null);
    }
}