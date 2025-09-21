import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { of } from "rxjs";
import { AplicanteType, Categoria } from "../models/enums";
import { AplicanteService } from "../services/aplicante.service";

export const getPageResolver: ResolveFn<any> = () => {
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

export const getPedidoAtividadeLicencaByIdResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const id = route.paramMap.get('id');
    const service = inject(AplicanteService);
    if (id) {
        return service.getPedidoAtividade(+id);
    } else {
        return of(null);
    }
}