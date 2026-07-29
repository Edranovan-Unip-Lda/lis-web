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

  // HttpParams is immutable — append() returns a NEW instance and must be reassigned.
  getAll(page = 0, size = 50): Observable<any> {
    const params = new HttpParams()
      .append('page', page)
      .append('size', size);
    return this.http.get<any>(this.apiUrl, { params }).pipe(take(1));
  }
}
