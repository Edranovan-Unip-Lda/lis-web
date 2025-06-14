import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router } from "@angular/router";
import { EMPTY, of } from "rxjs";
import { UserService } from "../services";

/**
 * Resolves a page of users.
 *
 * @returns A promise that resolves to an HttpResponse of User objects.
 */
export const getPageUserResolver: ResolveFn<any> = () => {
    const service = inject(UserService);
    return service.getPagination();
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