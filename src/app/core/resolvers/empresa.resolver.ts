import { inject } from "@angular/core";
import { EmpresaService } from "../services/empresa.service";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { of } from "rxjs";
import { AuthenticationService } from "../services";


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

export const getPageAplicanteByEmpresaIdResolver: ResolveFn<any> = () => {
    const service = inject(EmpresaService);
    const authServiec = inject(AuthenticationService);
    const empresaId = authServiec.currentUserValue?.empresa?.id;
    return service.getAplicantesPage(empresaId);
}