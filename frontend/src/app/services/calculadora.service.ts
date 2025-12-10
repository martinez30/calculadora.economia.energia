import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Calculo, ResultadoCalculo } from '../models/Calculo.model';

@Injectable({
  providedIn: 'root'
})
export class CalculadoraComplexaService {
  private apiUrl = 'https://calculadora-economia-energia-wm1y.onrender.com/api/calculadora';

  constructor(private http: HttpClient) { }

  public calcularEconomia(dados: Calculo): Observable<ResultadoCalculo> {
    return this.http.post<ResultadoCalculo>(`${this.apiUrl}/calcular-complexo`, dados);
  }
}