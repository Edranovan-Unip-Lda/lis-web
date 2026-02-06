import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router } from "@angular/router";
import { EMPTY, of } from "rxjs";
import { AplicanteType, Categoria, Role } from "../models/enums";
import { AuthenticationService, UserService } from "../services";

/**
 * Resolves a page of users.
 *
 * @returns A promise that resolves to an HttpResponse of User objects.
 */
export const getPageUserResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const service = inject(UserService);
    const roles = route.queryParamMap.get('roles');
    return service.getPagination(roles ? roles.split(',').map(r => r.trim() as Role) : [], 0, 10);
}

export const getPageEmpresaUserResolver: ResolveFn<any> = () => {
    const service = inject(UserService);
    return service.getPagination([Role.client], 0, 10);
}

export const getUsersByDirecaoId: ResolveFn<any> = () => {
    const service = inject(UserService);
    const authService = inject(AuthenticationService);
    const user = authService.currentUserValue;
    if (user && user.direcao) {
        return service.getByDirecaoId(user.direcao.id);
    } else {
        return of(null);
    }
}

/**
 * Resolves the list of users by direcao ID and role ID.
 *
 * @param route - The route snapshot.
 *
 * @returns A promise of the list of users.
 */
export const getUsersByDirecaoIdAndRole_Staff: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const service = inject(UserService);
    const authService = inject(AuthenticationService);
    const user = authService.currentUserValue;
    if (user && user.direcao && user.role) {
        return service.getByDirecaoIdAndRoleName(user.direcao.id, Role.staff);
    } else {
        return of(null);
    }
}

/**
 * Resolves the user by username.
 *
 * @param route - The route snapshot.
 *
 * @returns A promise of the user.
 */
export const getUserByUsernameResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const username = route.paramMap.get('username');
    const service = inject(UserService);
    if (username) {
        return service.getByProfileByUsername(username);
    } else {
        return of(null);
    }
}

export const getUserProfileResolver: ResolveFn<any> = () => {
    const authService = inject(AuthenticationService);
    const service = inject(UserService);
    const user = authService.currentUserValue;
    if (user && user.username) {
        return service.getByProfileByUsername(user.username);
    } else {
        return of(null);
    }
}

/**
 * Resolves the token from the query string and redirects to the index route
 * if the token is invalid or missing.
 *
 * @param route - The route snapshot.
 *
 * @returns A promise of the token if it is valid, or an empty observable
 *          if the token is invalid or missing.
 */
export const getTokenActivationResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const token = route.queryParamMap.get('t');

    // Basic JWT regex: header.payload.signature
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    if (token && jwtRegex.test(token)) {
        return of(token);
    } else {
        // If token is invalid or missing, navigate to the index route
        router.navigate(['/']);
        return EMPTY;
    }
}
export const getTokenResetPasswordResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const token = route.queryParamMap.get('t');

    // Basic UUID Regex
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    if (token && uuidRegex.test(token)) {
        return of(token);
    } else {
        // If token is invalid or missing, navigate to the index route
        router.navigate(['/']);
        return EMPTY;
    }
}

export const getPageAplicanteByUsernameResolver: ResolveFn<any> = () => {
    const authService = inject(AuthenticationService);
    const user = authService.currentUserValue;

    const service = inject(UserService);

    if (user.username) {
        switch (user.role.name) {
            case Role.admin:
            case Role.manager:
            case Role.chief:
                return service.getPaginationAssignedAplicante(user.username);
            case Role.staff:
                return service.getPaginationAtribuidoAplicante(user.username);
            default:
                return of(null);
        }

    } else {
        return of(null);
    }
}

export const getAssignedAplicanteByIdResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const id = route.paramMap.get('id');
    const authService = inject(AuthenticationService);
    const service = inject(UserService);
    const username = authService.currentUserValue.username;
    if (id) {
        return service.getAssignedAplicante(username, +id);
    } else {
        return of(null);
    }
}

export const getPageCertificadosByUsername: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
    const categoria = route.data['categoria'] as Categoria;
    const type = route.data['type'] as AplicanteType;
    const authService = inject(AuthenticationService);
    const service = inject(UserService);
    const user = authService.currentUserValue;

    if (user) {
        return service.getPageCertificados(user.id, type, categoria);
    } else {
        return of(null);
    }
}