import { inject } from "@angular/core";
import { EmpresaService } from "../services/empresa.service";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { of } from "rxjs";
import { AuthenticationService } from "../services";
import { AplicanteType, Categoria, Role } from "../models/enums";
import { AplicanteService } from "../services/aplicante.service";


export const getPageEmpresaResolver: ResolveFn<any> = () => {
    const service = inject(EmpresaService);
    return service.getPage();
}

export const getByIdResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const id = route.paramMap.get('id') || inject(AuthenticationService).currentUserValue.empresa.id;
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

    if (authServiec.currentUserValue.role.name === Role.client) {
        const empresaId = authServiec.currentUserValue?.empresa?.id;
        return service.getAplicantesPage(empresaId);
    } else {
        return aplicanteService.getPage();
    }
}


/**
 * Resolver function to fetch an aplicante based on the current user's empresa ID and the aplicante ID from the route.
 * If the aplicante ID is present in the route parameters, it returns the aplicante details from the EmpresaService.
 * If the current user is a client (i.e. has a empresa), it fetches the aplicante by the empresa ID and the aplicante ID.
 * If the current user is not a client, it fetches the aplicante by the aplicante ID.
 * If no aplicante ID is found, it returns `null`.
 *
 * @param route - The activated route snapshot containing the route parameters.
 * @returns An observable containing the aplicante details or `null`.
 */
export const getAplicante: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const id = route.paramMap.get('id');
    const authService = inject(AuthenticationService);
    const empresaService = inject(EmpresaService);
    const aplicanteService = inject(AplicanteService);

    if (id) {
        const empresa = authService.currentUserValue.empresa;
        if (empresa) {
            return empresaService.getAplicanteByEmpresaIdAndAplicanteId(empresa.id, +id);
        } else {
            return aplicanteService.getById(+id);
        }
    } else {
        return of(null);
    }
}

/**
 * Resolver function to fetch a list of certificados based on the current user's empresa ID, the categoria and the type from the route.
 * If the current user is a client (i.e. has a empresa), it fetches the list of certificados from the EmpresaService based on the empresa ID, the categoria and the type.
 * If the current user is not a client, it returns `null`.
 *
 * @param route - The activated route snapshot containing the route parameters.
 * @returns An observable containing the list of certificados or `null`.
 */
export const getPageCertificadosByEmpresaId: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const categoria = route.data['categoria'] as Categoria;
    const type = route.data['type'] as AplicanteType;
    const authService = inject(AuthenticationService);
    const service = inject(EmpresaService);
    const empresa = authService.currentUserValue.empresa;
    if (empresa) {
        return service.getPageCertificados(empresa.id, categoria, type);
    } else {
        return of(null);
    }
}