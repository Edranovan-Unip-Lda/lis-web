import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { of } from 'rxjs';
import { OtpSessionService } from '../services/otp-session.service';

export const authenticationCanActivate: CanActivateFn = () => {
    const authService = inject(AuthenticationService);
    const location = inject(Location);
    const admin = authService.currentUserValue;

    if (admin) {
        return true;
    } else {
        location.back();
        return false;
    }
}

export const canActivateByRole: CanActivateChildFn = (
    childRoute: ActivatedRouteSnapshot
) => {
    const authService = inject(AuthenticationService);
    const location = inject(Location);
    const user = authService.currentUserValue;

    const allowedRoles: any[] = childRoute.data['role'];

    console.log(allowedRoles, user.role.name);


    if (!allowedRoles || allowedRoles.length === 0) {
        // role not authorised so redirect to home page
        location.back();
        return of(false);
    } else if (allowedRoles.includes(user.role.name)) {
        return of(true);
    } else {
        location.back();
        return of(false);
    }
}


/**
 * Guard function to check if a user is already authenticated.
 *
 * If the user is authenticated, navigates to the admin dashboard and returns
 * an observable of false, preventing access to the current route. If not
 * authenticated, returns an observable of true, allowing access.
 *
 * @returns An observable of a boolean indicating whether the navigation should
 *          proceed (true if not authenticated, false if authenticated).
 */

export const loginGuard: CanActivateFn = () => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);
    const user = authService.currentUserValue;

    if (user) {
        router.navigate(['/dashboard']).then();
        return of(false);
    } else {
        return of(true);
    }
}

export const validateGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const otpService = inject(OtpSessionService);
    const router = inject(Router);
    const otp = otpService.isSessionActive();
    const username = route.queryParamMap.get('u');

    if (otp && username) {
        return of(true);
    } else {
        router.navigate(['/']).then();
        otpService.clearSession();
        return of(false);
    }
}


/**
 * Guard function to validate and sanitize query parameters for pagination.
 *
 * @param route - The active route snapshot containing the query parameters.
 * @param state - The router state snapshot.
 * @returns A boolean indicating whether the query parameters are valid. If invalid,
 *          navigates to the current URL with sanitized query parameters and returns false.
 */
export const canActivateQueryParams: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router = inject(Router);

    const page = route.queryParamMap.get('page');
    const size = route.queryParamMap.get('size');
    const startDateTime = route.queryParamMap.get('startDateTime');
    const endDateTime = route.queryParamMap.get('endDateTime');

    const validatePagination = (page: string | null, size: string | null) => {
        const MAX_SIZE = 300;
        const isValidNumber = (value: string | null): boolean => /^\d+$/.test(value ?? '');
        const toInteger = (value: string | null, defaultValue: number): number =>
            isValidNumber(value) ? Math.min(parseInt(value!, 10), MAX_SIZE) : defaultValue;

        const safePage = toInteger(page, 0);
        const safeSize = toInteger(size, 50);
        const isValid = safePage.toString() === page && safeSize.toString() === size;

        return { isValid, safePage, safeSize };
    };

    const validateDateRange = (start: string | null, end: string | null) => {
        const isValidIsoDate = (value: string | null): boolean => {
            if (!value) return false;
            const date = new Date(value);
            return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value);
        };

        const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const defaultEnd = new Date(); // now

        const safeStart = isValidIsoDate(start) ? new Date(start!) : defaultStart;
        const safeEnd = isValidIsoDate(end) ? new Date(end!) : defaultEnd;

        const isValid = safeStart <= safeEnd;

        return {
            isValid,
            safeStart,
            safeEnd,
            safeStartString: safeStart.toISOString(),
            safeEndString: safeEnd.toISOString()
        };
    };

    const pagination = validatePagination(page, size);
    const dateRange = validateDateRange(startDateTime, endDateTime);

    if (!pagination.isValid || !dateRange.isValid) {
        router.navigate([state.url], {
            queryParams: {
                page: pagination.safePage,
                size: pagination.safeSize,
                sdt: dateRange.safeStartString,
                edt: dateRange.safeEndString
            },
            queryParamsHandling: 'merge'
        });
        return false;
    }

    return true;
};