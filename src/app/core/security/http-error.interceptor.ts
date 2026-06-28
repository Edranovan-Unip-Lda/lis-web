import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { AuthenticationService } from '../services';
import * as Sentry from "@sentry/angular";

// Finding #7: read a same-origin cookie. Angular's built-in XSRF interceptor skips absolute-URL requests
// (which this app uses everywhere), so we attach the double-submit header ourselves.
function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
}

const CSRF_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const httpErrorInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    // Always clone with credentials
    let authReq = req.clone({ withCredentials: true });

    // Finding #7: echo the XSRF-TOKEN cookie as X-XSRF-TOKEN on state-changing requests. Only present when
    // the backend has CSRF enabled (prod, same-origin); a no-op on cross-origin envs where the cookie is absent.
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken && CSRF_METHODS.includes(req.method.toUpperCase())) {
        authReq = authReq.clone({ setHeaders: { 'X-XSRF-TOKEN': csrfToken } });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = '';

            // Finding #27: log out only on 401 (truly unauthenticated). A 403 is an authorization/CSRF denial
            // on one request — logging out mid-flow would kick the user out for hitting a forbidden resource.
            if (error.status === 401) {
                authService.logout()
            }

            if (!(error.error instanceof ProgressEvent)) {
                // API error message
                errorMessage = error.error?.message || 'Unknown error';
            } else {
                // Connection/network error
                errorMessage = 'Algo correu mal! Pode ser um problema de rede ou de conexão. Por favor, tente novamente mais tarde.';
            }


            Sentry.captureException(error);

            return throwError(() => errorMessage);
        })
    );
};