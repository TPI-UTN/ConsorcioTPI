import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  private apiUrl = 'http://localhost:3000/suppliers';

  constructor(private http: HttpClient) {}

  getProviders(filters?: {
    serviceType?: string,
    state?: string,
    contactNumber?: string
  }): Observable<Supplier[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.serviceType) {
        params = params.append('serviceType', filters.serviceType);
      }
      if (filters.state) {
        params = params.append('state', filters.state);
      }
      if (filters.contactNumber) {
        params = params.append('contact', filters.contactNumber);
      }
    }
    return this.http.get<Supplier[]>(this.apiUrl, { params });
  }

  addProvider(provider: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, provider);
  }

  updateProvider(provider: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${provider.id}`, provider);
  }

  deleteProvider(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
