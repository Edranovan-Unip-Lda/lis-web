import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FaturaService {
    private apiUrl = `${environment.apiUrl}/faturas`;

    constructor(private http: HttpClient) { }

    /** Fetch the server-generated invoice PDF (auth + ownership enforced server-side; generated on first request). */
    getFaturaPdf(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
    }
}
