import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CertificadoCadastro, CertificadoLicencaAtividade } from '../models/entities.model';
import { AplicanteType, Categoria } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class CertificadoService {
    protected apiUrl = `${environment.apiUrl}/certificados`;

    constructor(
        private http: HttpClient,
    ) { }

    getCertificadosById(id: number, aplicanteType: AplicanteType, categoria?: Categoria): Observable<CertificadoCadastro | CertificadoLicencaAtividade> {
        let params = new HttpParams()
            .append('type', aplicanteType);

        if (categoria) {
            params = params.append('categoria', categoria);
        }
        return this.http.get<CertificadoCadastro | CertificadoLicencaAtividade>(`${this.apiUrl}/${id}`, { params });
    }

    /**
     * Fetch the server-generated certificate PDF (auth + ownership enforced server-side).
     * `regenerate=true` forces a staff-only re-render of an already-issued certificate (e.g. after a layout change).
     */
    getCertificadoPdf(id: number, aplicanteType: AplicanteType, regenerate = false): Observable<Blob> {
        let params = new HttpParams().append('type', aplicanteType);
        if (regenerate) {
            params = params.append('regenerate', 'true');
        }
        return this.http.get(`${this.apiUrl}/${id}/pdf`, { params, responseType: 'blob' });
    }

    searchByNumero(numero: string, recaptchaToken: string): Observable<CertificadoCadastro | CertificadoLicencaAtividade> {
        const params = new HttpParams()
            .append('numero', numero)
            .append('recaptchaToken', recaptchaToken);
        return this.http.get<CertificadoCadastro | CertificadoLicencaAtividade>(`${this.apiUrl}/search`, { params });
    }
}