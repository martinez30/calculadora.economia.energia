import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TarifaService } from '../../services/tarifa.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selecionar-estado',
  templateUrl: './selecionar-estado.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./selecionar-estado.component.css']
})
export class SelecionarEstadoComponent implements OnInit {
  @Input() estadoSelecionado: string = '';
  @Output() estadoChange = new EventEmitter<string>();
  
  tarifas: any[] = [];
  carregando: boolean = true;

  constructor(private tarifaService: TarifaService) {}

  ngOnInit(): void {
    this.carregarTarifas();
  }

  carregarTarifas(): void {
    this.carregando = true;
    this.tarifaService.getTarifas().subscribe({
      next: (data) => {
        this.tarifas = data;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar tarifas:', error);
        this.carregando = false;
      }
    });
  }

  onEstadoChange(event: any): void {
    this.estadoChange.emit(event.target.value);
  }
}