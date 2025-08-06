import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/entities.model';

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
  getPagination(page?: number, size?: number): Observable<any> {
    let params = new HttpParams();
    if (page && size) {
      params.append('page', page)
      params.append('size', size);
      return this.http.get<any>(this.apiUrl, { params }).pipe(take(1));
    } else {
      return this.http.get<any>(this.apiUrl, { params }).pipe(take(1));
    }
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

  getPaginationAplicante(username: string, page?: number, size?: number): Observable<any> {
    let params = new HttpParams();
    if (page && size) {
      params.append('page', page)
      params.append('size', size);
      return this.http.get<any>(`${this.apiUrl}/${username}/aplicantes`, { params }).pipe(take(1));
    } else {
      return this.http.get<any>(`${this.apiUrl}/${username}/aplicantes`, { params }).pipe(take(1));
    }
  }


}
