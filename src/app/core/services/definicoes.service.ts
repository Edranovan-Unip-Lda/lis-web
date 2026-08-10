import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SecuritySettings } from '../models/entities.model';

/**
 * Platform-wide settings. Both endpoints are ADMIN-only server-side; the route guard on /definicoes is UX only.
 */
@Injectable({
    providedIn: 'root'
})
export class DefinicoesService {
    protected apiUrl = `${environment.apiUrl}/definicoes`;

    constructor(private http: HttpClient) {}

    getSecuritySettings(): Observable<SecuritySettings> {
        return this.http.get<SecuritySettings>(`${this.apiUrl}/seguranca`).pipe(take(1));
    }

    /** motivo is mandatory server-side when disabling — the backend answers 400 without it. */
    setOtpEnabled(enabled: boolean, motivo?: string): Observable<SecuritySettings> {
        return this.http.put<SecuritySettings>(`${this.apiUrl}/seguranca/otp`, { enabled, motivo }).pipe(take(1));
    }
}
