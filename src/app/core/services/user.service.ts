import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Empresa, User } from '../models/entities.model';
import { AplicanteType, Categoria, Role } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  protected apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
  ) { }

  save(formData: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, formData).pipe(take(1));
  }

  update(username: string, formData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${username}`, formData).pipe(take(1));
  }

  updateProfile(username: string, formData: any): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${username}/profile`, formData).pipe(take(1));
  }

  deleteSignature(username: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${username}/signature`).pipe(take(1));
  }

  getByProfileByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${username}`).pipe(take(1));
  }

  /**
   * Makes a GET request to the users endpoint with optional pagination parameters.
   *
   * @param page The page number to retrieve.
   * @param size The number of items per page.
   * @returns The response from the server.
   */
  getPagination(roles: string, page?: number, size?: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('roles', roles.toString());
    if (page !== undefined && size !== undefined) {
      params = params.append('page', page)
      params = params.append('size', size);
      return this.http.get<any>(this.apiUrl, { params }).pipe(take(1));
    } else {
      return this.http.get<any>(this.apiUrl, { params }).pipe(take(1));
    }
  }

  search(query: string, roles: string): Observable<any[]> {
    let params = new HttpParams()
      .append('q', query)
      .append('roles', roles);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params }).pipe(take(1));
  }

  // Backed by GET /api/v1/users/by-direcao (returns a plain UserDto[]), not Spring Data REST /data anymore.
  getByDirecaoId(direcaoId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('direcaoId', direcaoId);
    return this.http.get<any>(`${this.apiUrl}/by-direcao`, { params }).pipe(take(1));
  }

  getByDirecaoIdAndRoleName(direcaoId: number, roleName: Role): Observable<any> {
    let params = new HttpParams();
    params = params.append('direcaoId', direcaoId);
    params = params.append('roleName', roleName);
    return this.http.get<any>(`${this.apiUrl}/by-direcao`, { params }).pipe(take(1));
  }

  /**
  * Makes a POST request to the users endpoint with the
  * /activate?token={token} path to activate a user by their token.
  *
  * @param token The token of the user to be activated.
  * @param form The object containing the user's new password and confirm password.
  * @returns An observable of the server response.
  */
  activate(token: string, form: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/activate?token=${token}`, form);
  }

  // HttpParams is immutable — append() returns a NEW instance. The previous version discarded the results,
  // so the task list always re-fetched page 0 whichever page the paginator asked for.
  getPaginationAssignedAplicante(username: string, page = 0, size = 50, q?: string, sort?: string): Observable<any> {
    let params = new HttpParams()
      .append('page', page)
      .append('size', size);
    if (q) params = params.append('q', q);
    if (sort) params = params.append('sort', sort);
    return this.http.get<any>(`${this.apiUrl}/${username}/aplicantes`, { params }).pipe(take(1));
  }

  getAssignedAplicante(username: string, aplicanteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${username}/aplicantes/${aplicanteId}`);
  }

  revistoAplicante(username: string, aplicanteId: number, form: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${username}/aplicantes/${aplicanteId}/revisto`, form);
  }

  // Devolver para correção: hand the application back to the company; the motivo travels in the historico descricao.
  devolverAplicante(username: string, aplicanteId: number, form: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${username}/aplicantes/${aplicanteId}/devolver`, form);
  }

  /**
   * Sends a PATCH request to approve an aplicante associated with a user.
   *
   * @param username The username of the user associated with the aplicante.
   * @param aplicanteId The ID of the aplicante to be approved.
   * @param form The form data containing approval information.
   * @returns An observable of the server response.
   */
  updateAplicante(username: string, aplicanteId: number, form: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${username}/aplicantes/${aplicanteId}`, form);
  }

  getPaginationAtribuidoAplicante(username: string, page = 0, size = 50, q?: string, sort?: string): Observable<any> {
    let params = new HttpParams()
      .append('page', page)
      .append('size', size);
    if (q) params = params.append('q', q);
    if (sort) params = params.append('sort', sort);
    return this.http.get<any>(`${this.apiUrl}/${username}/aplicantes/atribuidos`, { params }).pipe(take(1));
  }

  atribuirAplicante(username: string, aplicanteId: number, staffUsername: string, note: string): Observable<any> {
    let params = new HttpParams();
    params.append('staffUsername', staffUsername);
    params.append('notes', note);
    return this.http.patch<any>(`${this.apiUrl}/${username}/aplicantes/atribuidos/${aplicanteId}?staffUsername=${staffUsername}&notes=${note}`, { params }).pipe(take(1));
  }

  /**
   * Makes a GET request to the users endpoint with pagination parameters
   * to retrieve a list of certificados associated with the user.
   *
   * @param username The username of the logged user.
   * @param type The type of the certificados to be retrieved.
   * @param categoria The categoria of the certificados to be retrieved.
   * @param page The page number to retrieve (default is 0).
   * @param size The number of items per page (default is 50).
   * @returns An observable of the server response.
   */
  getPageCertificados(username: string, type: AplicanteType, categoria: Categoria, page = 0, size = 50): Observable<any> {
    let params = new HttpParams()
      .append('categoria', categoria)
      .append('type', type)
      .append('page', page)
      .append('size', size);
    return this.http.get<any>(`${this.apiUrl}/${username}/certificados`, { params }).pipe(take(1));
  }

  /**
   * Retrieves an empresa object associated with the given utilizadorUsername from the current user's empresas.
   *
   * @param username The username of the current user.
   * @param utilizadorUsername The username of the utilizador associated with the empresa.
   * @returns An observable containing the empresa object associated with the given utilizadorUsername.
   */
  getEmpresaByUtilizadorUsername(username: string, utilizadorUsername: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${username}/empresas/${utilizadorUsername}`).pipe(take(1));
  }

}
