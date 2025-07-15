import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DataMasterService {
    protected apiUrl = `${environment.url}/data`;

    constructor(
        private http: HttpClient,
    ) { }


    getRoles(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/roles`).pipe(take(1));
    }

    getMunicipios(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/municipios`).pipe(take(1));
    }

    getPostosByMunicipio(municipioId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/municipios/${municipioId}/listaPostoAdministrativo`).pipe(take(1));
    }

    getPostos(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/postos`).pipe(take(1));
    }

    getSucosByPosto(postoId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/postos/${postoId}/listaSuco`).pipe(take(1));
    }

    getSucos(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/sucos`).pipe(take(1));
    }

    getAldeiasBySuco(sucoId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/sucos/${sucoId}/listaAldeia`).pipe(take(1));
    }

    getAldeias(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/aldeias`).pipe(take(1));
    }


}
