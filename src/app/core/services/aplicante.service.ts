import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AplicanteType, Categoria } from '../models/enums';
import { CertificadoCadastro, CertificadoLicencaAtividade, PedidoAtividadeLicenca, PedidoInscricaoCadastro, PedidoVistoria } from '../models/entities.model';

@Injectable({ providedIn: 'root' })
export class AplicanteService {
    protected apiUrl = `${environment.apiUrl}/aplicantes`;

    constructor(
        private http: HttpClient,
    ) { }

    getPage(page?: number, size?: number): Observable<any> {
        let params = new HttpParams();
        if (page && size) {
            params.append('page', page)
            params.append('size', size);
            return this.http.get<any>(this.apiUrl, { params }).pipe(take(1));
        } else {
            return this.http.get<any>(this.apiUrl).pipe(take(1));
        }
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    savePedidoCadastro(aplicanteId: number, formData: any): Observable<PedidoInscricaoCadastro> {
        return this.http.post<PedidoInscricaoCadastro>(`${this.apiUrl}/${aplicanteId}/pedidos/cadastro`, formData);
    }

    updatePedidoCadastro(aplicanteId: number, pedidoId: number, formData: any): Observable<PedidoInscricaoCadastro> {
        return this.http.put<PedidoInscricaoCadastro>(`${this.apiUrl}/${aplicanteId}/pedidos/cadastro/${pedidoId}`, formData);
    }

    savePedidoAtividade(aplicanteId: number, formData: any): Observable<PedidoAtividadeLicenca> {
        return this.http.post<PedidoAtividadeLicenca>(`${this.apiUrl}/${aplicanteId}/pedidos/atividade`, formData);
    }

    updatePedidoAtividade(aplicanteId: number, pedidoId: number, formData: any): Observable<PedidoAtividadeLicenca> {
        return this.http.put<PedidoAtividadeLicenca>(`${this.apiUrl}/${aplicanteId}/pedidos/atividade/${pedidoId}`, formData);
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