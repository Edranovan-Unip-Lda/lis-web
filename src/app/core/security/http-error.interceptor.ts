import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { AuthenticationService } from '../services';
import * as Sentry from "@sentry/angular";

export const httpErrorInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    // Always clone with credentials
    const authReq = req.clone({ withCredentials: true });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = '';

            if (error.status === 401 || error.status === 403) {
                authService.logout()
            }

            if (!(error.error instanceof ProgressEvent)) {
                // API error message
                errorMessage = error.error?.message || 'Unknown error';
            } else {
                // Connection/network error
                errorMessage = 'Something went wrong! Please try again later.';
            }


            Sentry.captureException(error);

            return throwError(() => errorMessage);
        })
    );
};