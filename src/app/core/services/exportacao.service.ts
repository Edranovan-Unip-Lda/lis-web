import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AplicanteType } from '../models/enums';

export type ExportacaoStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
export type ExportacaoErro = 'DATABASE' | 'STORAGE_READ' | 'STORAGE_UPLOAD' | 'DISK' | 'INTERRUPTED' | 'UNEXPECTED';

export interface Exportacao {
    id: number;
    tipo: AplicanteType;
    filtro: Record<string, any>;
    status: ExportacaoStatus;
    total: number;
    processed: number;
    skipped: number;
    sizeBytes: number | null;
    /** Failure cause code (FAILED only); translated via reports.exportacoes.erro.<code>. */
    errorCode: ExportacaoErro | null;
    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    expiresAt: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ExportacaoService {
    protected apiUrl = `${environment.apiUrl}/exportacoes`;

    constructor(private http: HttpClient) { }

    /** Queue a bulk PDF (ZIP) export with the same filter body the report endpoint takes. */
    create(tipo: AplicanteType, filter: any): Observable<Exportacao> {
        const path = tipo === AplicanteType.cadastro ? 'certificados-inscricao-cadastro' : 'certificados-licenca-atividade';
        return this.http.post<Exportacao>(`${this.apiUrl}/${path}`, filter);
    }

    listMine(page: number, size: number): Observable<any> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<any>(this.apiUrl, { params });
    }

    /**
     * Plain URL, used as an <a href>: the browser streams the (possibly multi-GB) ZIP straight to disk with the
     * session cookie, instead of buffering it in memory as an HttpClient blob would.
     */
    downloadUrl(id: number): string {
        return `${this.apiUrl}/${id}/download`;
    }
}
