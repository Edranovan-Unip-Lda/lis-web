import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CertificadoCadastro, CertificadoLicencaAtividade, PedidoAtividadeLicenca, PedidoInscricaoCadastro } from '../models/entities.model';
import { AplicanteType, Categoria } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class AplicanteService {
    protected apiUrl = `${environment.apiUrl}/aplicantes`;

    constructor(
        private http: HttpClient,
    ) { }

    // HttpParams is immutable — append() returns a NEW instance, so every param must be reassigned.
    // The previous version discarded the results and silently sent no page/size at all.
    getPage(page = 0, size = 50, q?: string, sort?: string): Observable<any> {
        let params = new HttpParams()
            .append('page', page)
            .append('size', size);
        if (q) params = params.append('q', q);
        if (sort) params = params.append('sort', sort);
        return this.http.get<any>(this.apiUrl, { params }).pipe(take(1));
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    deleteById(aplicanteId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${aplicanteId}`);
  }

    savePedidoCadastro(aplicanteId: number, formData: any, draft = false): Observable<PedidoInscricaoCadastro> {
        return this.http.post<PedidoInscricaoCadastro>(`${this.apiUrl}/${aplicanteId}/pedidos/cadastro`, formData, { params: this.draftParams(draft) });
    }

    updatePedidoCadastro(aplicanteId: number, pedidoId: number, formData: any, draft = false): Observable<PedidoInscricaoCadastro> {
        return this.http.put<PedidoInscricaoCadastro>(`${this.apiUrl}/${aplicanteId}/pedidos/cadastro/${pedidoId}`, formData, { params: this.draftParams(draft) });
    }

    savePedidoAtividade(aplicanteId: number, formData: any, draft = false): Observable<PedidoAtividadeLicenca> {
        return this.http.post<PedidoAtividadeLicenca>(`${this.apiUrl}/${aplicanteId}/pedidos/atividade`, formData, { params: this.draftParams(draft) });
    }

    updatePedidoAtividade(aplicanteId: number, pedidoId: number, formData: any, draft = false): Observable<PedidoAtividadeLicenca> {
        return this.http.put<PedidoAtividadeLicenca>(`${this.apiUrl}/${aplicanteId}/pedidos/atividade/${pedidoId}`, formData, { params: this.draftParams(draft) });
    }

    // Only sends ?draft=true when saving a draft; omitted otherwise so the server default (submit) applies.
    private draftParams(draft: boolean): HttpParams {
        return draft ? new HttpParams().set('draft', 'true') : new HttpParams();
    }

    getPedidoAtividade(aplicanteId: number): Observable<PedidoAtividadeLicenca> {
        return this.http.get<PedidoAtividadeLicenca>(`${this.apiUrl}/${aplicanteId}/pedidos/atividade`);
    }

    getCertificados(aplicanteId: number, certificadoId: number, aplicanteType: AplicanteType, categoria: Categoria): Observable<CertificadoCadastro | CertificadoLicencaAtividade> {
        let params = new HttpParams()
            .append('type', aplicanteType)
            .append('categoria', categoria);
        return this.http.get<CertificadoCadastro | CertificadoLicencaAtividade>(`${this.apiUrl}/${aplicanteId}/certificados/${certificadoId}`, { params });
    }
}