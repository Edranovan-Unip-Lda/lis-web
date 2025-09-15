import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class DocumentosService {
    protected apiUrl = `${environment.apiUrl}/documentos`;

    constructor(
        private http: HttpClient,
    ) { }

    downloadById(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'blob' as 'blob' });
    }

    deleteById(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}