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

  save(formData: any, selectedFiles: any[]): Observable<any> {
    const fd = new FormData();

    fd.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    for (const file of selectedFiles) {
      fd.append('files', file, file.name);
    }

    return this.http.post<any>(this.apiUrl, fd);
  }

  update(username: string, formData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${username}`, formData);
  }

  getByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${username}`);
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
      console.log(page, size);
      params = params.append('page', page);
      params = params.append('size', size);
      console.log(params);

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
