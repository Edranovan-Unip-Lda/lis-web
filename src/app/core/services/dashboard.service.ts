import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CategoryDistributionDto, DashboardResponse } from '../models/entities.model';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  protected apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(
    private http: HttpClient,
  ) { }

  /**
 * Retrieves dashboard data for the current user.
 * 
 * @param year - Optional year parameter for filtering dashboard data
 * @param startDate - Optional start date for filtering dashboard data (ISO 8601 format recommended)
 * @param endDate - Optional end date for filtering dashboard data (ISO 8601 format recommended)
 * @returns An Observable that emits the dashboard data for the authenticated user
 */
  getData(year?: number): Observable<DashboardResponse> {
    let params: any = {};
    if (year !== undefined) {
      params.year = year;
    }
    return this.http.get<DashboardResponse>(`${this.apiUrl}`, { params }).pipe(take(1));
  }

  getByCategory(nome: string): Observable<CategoryDistributionDto[]> {
    return this.http.get<CategoryDistributionDto[]>(`${this.apiUrl}/category`, { params: { nome } }).pipe(take(1));
  }

}
