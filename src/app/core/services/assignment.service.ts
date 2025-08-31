import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  protected apiUrl = `${environment.apiUrl}/aplicantes`;

  constructor(
    private http: HttpClient,
  ) { }

  getAll(page?: number, size?: number): Observable<any> {
    let params = new HttpParams();
    if (page && size) {
      params.append('page', page)
      params.append('size', size);
      return this.http.get<any>(this.apiUrl, { params }).pipe(take(1));
    } else {
      return this.http.get<any>(this.apiUrl).pipe(take(1));
    }
  }
}
