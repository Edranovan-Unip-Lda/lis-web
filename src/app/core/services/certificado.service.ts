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

    searchByNumero(numero: string): Observable<CertificadoCadastro | CertificadoLicencaAtividade> {
        const params = new HttpParams().append('numero', numero);
        return this.http.get<CertificadoCadastro | CertificadoLicencaAtividade>(`${this.apiUrl}/search`, { params });
    }
}