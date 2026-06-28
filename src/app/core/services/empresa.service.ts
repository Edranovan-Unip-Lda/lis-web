import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AplicanteType, Categoria } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  protected apiUrl = `${environment.apiUrl}/empresas`;

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * Pre-flight (B1): verify the fresh reCAPTCHA v3 token and open a registration session. The returned
   * sessionToken authorizes the document uploads and the final submit.
   */
  verifyRecaptcha(token: string): Observable<{ sessionToken: string }> {
    return this.http.post<{ sessionToken: string }>(`${this.apiUrl}/verify-recaptcha`, { token, action: 'REGISTER_EMPRESA' });
  }

  /** Stage one document immediately on selection; returns a ref the finalize call sends back. */
  stageDocument(file: File, sessionToken: string): Observable<{ ref: string; nome: string; extensao: string; tamanho: number }> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    fd.append('sessionToken', sessionToken);
    return this.http.post<{ ref: string; nome: string; extensao: string; tamanho: number }>(`${this.apiUrl}/staging-documents`, fd);
  }

  /** Remove a staged document the user dropped before submitting. */
  deleteStagedDocument(ref: string, sessionToken: string): Observable<void> {
    const params = new HttpParams().append('sessionToken', sessionToken);
    return this.http.delete<void>(`${this.apiUrl}/staging-documents/${encodeURIComponent(ref)}`, { params });
  }

  /** Finalize: small JSON call carrying the form + staged document refs + session token. */
  finalize(formData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  /** Public registration check: is this NIF free? `available=false` means a company already uses it. */
  checkNif(nif: string): Observable<{ available: boolean }> {
    const params = new HttpParams().append('nif', nif);
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-nif`, { params }).pipe(take(1));
  }

  update(username: string, formData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${username}`, formData);
  }

  getByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${username}`);
  }

  deleteByUsername(username: string): Observable<number> {
    return this.http.delete<number>(`${this.apiUrl}/${username}`);
  }

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

  search(query: string): Observable<any[]> {
    let params = new HttpParams().append('q', query);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params }).pipe(take(1));
  }


  createAplicante(empresaId: number, formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${empresaId}/aplicantes`, formData);
  }

  submitAplicanteByEmpresaIdAndAplicanteId(empresaId: number, aplicanteId: number, formData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${empresaId}/aplicantes/${aplicanteId}`, formData);
  }

  getAplicantesPage(empresaId: number, page?: number, size?: number): Observable<any> {
    let params = new HttpParams();
    if (page !== undefined && size !== undefined) {
      params = params.append('page', page);
      params = params.append('size', size);
      return this.http.get<any>(`${this.apiUrl}/${empresaId}/aplicantes`, { params }).pipe(take(1));
    } else {
      return this.http.get<any>(`${this.apiUrl}/${empresaId}/aplicantes`).pipe(take(1));
    }
  }

  searchAplicanteById(id: number, query: string): Observable<any[]> {
    let params = new HttpParams().append('q', query);
    return this.http.get<any[]>(`${this.apiUrl}/${id}/aplicantes/search`, { params }).pipe(take(1));
  }

  /**
   * Retorna um aplicante especifico por empresaId e aplicanteId.
   * @param empresaId O id da empresa a qual o aplicante pertence.
   * @param aplicanteId O id do aplicante a ser retornado.
   * @returns Um observable com o aplicante especifico.
   */
  getAplicanteByEmpresaIdAndAplicanteId(empresaId: number, aplicanteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${empresaId}/aplicantes/${aplicanteId}`);
  }

  deleteApicante(empresaId: number, aplicanteId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${empresaId}/aplicantes/${aplicanteId}`);
  }

  getPageCertificados(empresaId: number, categoria: Categoria, type: AplicanteType, page = 0, size = 50): Observable<any> {
    let params = new HttpParams()
      .append('categoria', categoria)
      .append('type', type)
      .append('page', page)
      .append('size', size);
    return this.http.get<any>(`${this.apiUrl}/${empresaId}/certificados`, { params }).pipe(take(1));
  }
}
