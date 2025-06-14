import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DataMasterService {
    protected apiUrl = `${environment.url}`;

    constructor(
        private http: HttpClient,
    ) { }


    getRoles(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/roles`).pipe(take(1));
    }


}
