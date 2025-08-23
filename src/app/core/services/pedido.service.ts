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

    downloadRecibo(aplicanteId: number, pedidoId: number, faturaId: number, reciboId: number): Observable<Blob> {
        return this.http.get(`${environment.apiUrl}/aplicantes/${aplicanteId}/pedidos/${pedidoId}/faturas/${faturaId}/recibos/${reciboId}`, { responseType: 'blob' as 'blob' });
    }

    deleteRecibo(aplicanteId: number, pedidoId: number, faturaId: number, reciboId: number): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/aplicantes/${aplicanteId}/pedidos/${pedidoId}/faturas/${faturaId}/recibos/${reciboId}`);
    }

    // Pedido Licenca de Atividade

    saveFaturaPedidoLicenca(pedidoId: number, formData: any): Observable<Fatura> {
        return this.http.post<Fatura>(`${this.apiUrl}-atividade/${pedidoId}/faturas`, formData);
    }

    updateFaturaPedidoLicenca(id: number, faturaId: number, formData: any): Observable<Fatura> {
        return this.http.put<Fatura>(`${this.apiUrl}-atividade/${id}/faturas/${faturaId}`, formData);
    }

    saveFaturaPedidoVistoria(pedidoId: number, formData: any): Observable<Fatura> {
        return this.http.post<Fatura>(`${this.apiUrl}-vistoria/${pedidoId}/faturas`, formData);
    }

    updateFaturaPedidoVistoria(id: number, faturaId: number, formData: any): Observable<Fatura> {
        return this.http.put<Fatura>(`${this.apiUrl}-vistoria/${id}/faturas/${faturaId}`, formData);
    }

}