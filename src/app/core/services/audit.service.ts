import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuditFilterRequest } from '../models/entities.model';

@Injectable({
    providedIn: 'root'
})
export class AuditService {

    protected apiUrl = `${environment.apiUrl}/audit`;

    constructor(private http: HttpClient) { }

    /**
     * Retrieves all audit actions with optional pagination and date-range filtering.
     *
     * @param page          - Zero-based page index (default: 0)
     * @param size          - Number of records per page (default: 10)
     * @param startDateTime - Optional inclusive start of the time window (ISO 8601)
     * @param endDateTime   - Optional inclusive end of the time window (ISO 8601)
     * @returns An Observable that emits the raw JSON string returned by the API
     */
    getAllActions(
        page: number = 0,
        size: number = 50,
        startDateTime?: Date | string,
        endDateTime?: Date | string
    ): Observable<string> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size);

        if (startDateTime) {
            params = params.set(
                'startDateTime',
                startDateTime instanceof Date ? startDateTime.toISOString() : startDateTime
            );
        }

        if (endDateTime) {
            params = params.set(
                'endDateTime',
                endDateTime instanceof Date ? endDateTime.toISOString() : endDateTime
            );
        }

        return this.http.get<string>(`${this.apiUrl}/actions`, { params }).pipe(take(1));
    }

    filterActions(param: AuditFilterRequest): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/actions/filter`, param).pipe(take(1));
    }

    /**
     * Retrieves a paginated list of login activities with optional date-range filtering.
     *
     * @param page          - Zero-based page index (default: 0)
     * @param size          - Number of records per page (default: 10)
     * @param startDateTime - Optional inclusive start of the time window (ISO 8601)
     * @param endDateTime   - Optional inclusive end of the time window (ISO 8601)
     * @returns An Observable that emits a Spring Page of login activity records
     */
    getLoginActivities(
        page: number = 0,
        size: number = 50,
        startDateTime?: Date | string,
        endDateTime?: Date | string
    ): Observable<any> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size);

        if (startDateTime) {
            params = params.set(
                'startDateTime',
                startDateTime instanceof Date ? startDateTime.toISOString() : startDateTime
            );
        }

        if (endDateTime) {
            params = params.set(
                'endDateTime',
                endDateTime instanceof Date ? endDateTime.toISOString() : endDateTime
            );
        }

        return this.http.get<any>(`${this.apiUrl}/login`, { params }).pipe(take(1));
    }
}
