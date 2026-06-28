import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AplicanteType } from '../models/enums';
import { Fatura, PedidoInscricaoCadastro, PedidoVistoria } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
    protected apiUrl = `${environment.apiUrl}/pedidos`;

    constructor(
        private http: HttpClient,
    ) { }

    /** Fetch the official "Pedido de Inscrição no Cadastro" form PDF, rendered fresh from current data. */
    getCadastroFormPdf(pedidoId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${pedidoId}/form-pdf`, { responseType: 'blob' });
    }

    /** Fetch the official "Pedido de Vistoria" form PDF, rendered fresh from current data. */
    getVistoriaFormPdf(pedidoVistoriaId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}-vistoria/${pedidoVistoriaId}/form-pdf`, { responseType: 'blob' });
    }

    /** Fetch the "Auto de Vistoria" inspection record PDF, rendered fresh from current data. */
    getAutoVistoriaFormPdf(autoVistoriaId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}-vistoria/auto-vistorias/${autoVistoriaId}/form-pdf`, { responseType: 'blob' });
    }

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

    /** Fetch the official "Pedido de Licença para Atividade" form PDF, rendered fresh from current data. */
    getAtividadeFormPdf(pedidoId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}-atividade/${pedidoId}/form-pdf`, { responseType: 'blob' });
    }

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

    savePedidoVistoria(id: number, formData: any): Observable<PedidoVistoria> {
        return this.http.post<PedidoVistoria>(`${this.apiUrl}-atividade/${id}/pedidos-vistoria`, formData);
    }

    updatePedidoVistoria(id: number, pedidoVistoriaId: number, formData: any): Observable<PedidoVistoria> {
        return this.http.put<PedidoVistoria>(`${this.apiUrl}-atividade/${id}/pedidos-vistoria/${pedidoVistoriaId}`, formData);
    }

    saveAutoVistoria(aplicanteId: number, formData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}-vistoria/${aplicanteId}/auto-vistorias`, formData);
    }

}