import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-resultado-modal',
  templateUrl: './resultado-modal.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./resultado-modal.component.css']
})
export class ResultadoModalComponent {
  @Input() resultado: any = null;  // Inicializado como null
  @Input() showModal: boolean = false;
  @Output() fechar = new EventEmitter<void>();

  fecharModal(): void {
    this.fechar.emit();
  }

  formatarMoeda(valor: number): string {
    if (!valor) return 'R$ 0,00';
    
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  }

  temEconomia(): boolean {
    return this.resultado?.economiaMensal > 0;
  }
}