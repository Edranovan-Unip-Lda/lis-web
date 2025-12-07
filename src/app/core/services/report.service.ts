import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    protected apiUrl = `${environment.apiUrl}/reports`;

    constructor(
        private http: HttpClient
    ) { }

    getEmpresaReport(filter: any, page?: number, size?: number): Observable<any> {
        let params = new HttpParams();
        if (page != null && size != null) {
            params = params.append('page', page);
            params = params.append('size', size);
            return this.http.post<any>(`${this.apiUrl}/empresas`, filter, { params });
        } else {
            return this.http.post<any>(`${this.apiUrl}/empresas`, filter);
        }
    }

    getAplicanteReport(filter: any, page?: number, size?: number): Observable<any> {
        let params = new HttpParams();
        if (page != null && size != null) {
            params = params.append('page', page);
            params = params.append('size', size);
            return this.http.post<any>(`${this.apiUrl}/aplicantes`, filter, { params });
        } else {
            return this.http.post<any>(`${this.apiUrl}/aplicantes`, filter);
        }
    }
}