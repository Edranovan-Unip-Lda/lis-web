import { inject } from "@angular/core";
import { EmpresaService } from "../services/empresa.service";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { of } from "rxjs";
import { AuthenticationService } from "../services";
import { Role } from "../models/enums";
import { AplicanteService } from "../services/aplicante.service";


export const getPageEmpresaResolver: ResolveFn<any> = () => {
    const service = inject(EmpresaService);
    return service.getPage();
}

export const getByIdResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const id = route.paramMap.get('id');
    const service = inject(EmpresaService);
    if (id) {
        return service.getById(+id);
    } else {
        return of(null);
    }
}

export const getPageAplicanteOrByEmpresaIdResolver: ResolveFn<any> = () => {
    const service = inject(EmpresaService);
    const aplicanteService = inject(AplicanteService);
    const authServiec = inject(AuthenticationService);

    if (authServiec.currentUserValue.role === Role.client) {
        const empresaId = authServiec.currentUserValue?.empresa?.id;
        return service.getAplicantesPage(empresaId);
    } else {
        return aplicanteService.getPage();
    }
}