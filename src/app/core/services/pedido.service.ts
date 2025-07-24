import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AplicanteType } from '../models/enums';
import { Fatura, PedidoInscricaoCadastro } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
    protected apiUrl = `${environment.apiUrl}/pedidos`;

    constructor(
        private http: HttpClient,
    ) { }

    saveFatura(pedidoId: number, formData: any): Observable<Fatura> {
        return this.http.post<Fatura>(`${this.apiUrl}/${pedidoId}/faturas`, formData);
    }

    updateFatura(id: number, faturaId: number, formData: any): Observable<Fatura> {
        return this.http.put<Fatura>(`${this.apiUrl}/${id}/faturas/${faturaId}`, formData);
    }

}