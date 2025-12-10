import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Distribuidora } from '../models/Tarifa.model';

@Injectable({
  providedIn: 'root'
})
export class TarifaService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getTarifas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tarifas`);
  }

  getTarifasComDistribuidoras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tarifas/com-distribuidoras`);
  }

  getDistribuidorasPorUF(uf: string): Observable<Distribuidora[]> {
    return this.http.get<Distribuidora[]>(`${this.apiUrl}/calculadora/distribuidoras/${uf}`);
  }
}