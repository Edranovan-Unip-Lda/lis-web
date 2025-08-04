import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  protected apiUrl = `${environment.apiUrl}/empresas`;

  constructor(
    private http: HttpClient,
  ) { }

  save(formData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  update(id: string, formData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
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

  createAplicante(empresaId: number, formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${empresaId}/aplicantes`, formData);
  }

  submitAplicanteByEmpresaIdAndAplicanteId(empresaId: number, aplicanteId: number, formData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${empresaId}/aplicantes/${aplicanteId}`, formData);
  }

  getAplicantesPage(empresaId: number, page?: number, size?: number): Observable<any> {
    let params = new HttpParams();
    if (page && size) {
      params.append('page', page)
      params.append('size', size);
      return this.http.get<any>(`${this.apiUrl}/${empresaId}/aplicantes`, { params }).pipe(take(1));
    } else {
      return this.http.get<any>(`${this.apiUrl}/${empresaId}/aplicantes`).pipe(take(1));
    }
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
}
