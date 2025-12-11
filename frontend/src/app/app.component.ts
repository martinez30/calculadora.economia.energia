import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TarifaService } from './services/tarifa.service';
import { Distribuidora } from './models/Tarifa.model';
import { CalculadoraComplexaService } from './services/calculadora.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Calculadora de Economia de Energia Limpa';
  formulario: FormGroup;
  result: any = null;
  carregando: boolean = false;
  errorMessage: string = '';
  estados: any[] = [];
  distribuidoras: Distribuidora[] = [];
  carregandoDistribuidoras: boolean = false;

  constructor(
    private fb: FormBuilder,
    private tarifaService: TarifaService,
    private calculadoraComplexaService: CalculadoraComplexaService
  ) {
    this.formulario = this.fb.group({
      estado: ['', Validators.required],
      distribuidora: ['', Validators.required],
      valorContaAtual: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.carregarEstados();

    // Observar mudanças no campo estado
    this.formulario.get('estado')?.valueChanges.subscribe((uf) => {
      if (uf) {
        this.carregarDistribuidoras(uf);
      } else {
        this.distribuidoras = [];
        this.formulario.get('distribuidora')?.setValue('');
      }
    });
  }

  getStateName(): string {
    const estadoSelecionado = this.estados.find(e => e.uf === this.formulario.value.estado);
    return estadoSelecionado ? estadoSelecionado.estado : '';
  }

  carregarEstados(): void {
    this.tarifaService.getTarifasComDistribuidoras().subscribe({
      next: (tarifas) => {
        this.estados = tarifas.sort((a, b) => a.estado.localeCompare(b.estado));
      },
      error: (error) => {
        console.error('Erro ao carregar estados:', error);
        this.errorMessage = 'Erro ao carregar estados';
      }
    });
  }

  carregarDistribuidoras(uf: string): void {
    this.carregandoDistribuidoras = true;
    this.distribuidoras = [];
    this.formulario.get('distribuidora')?.setValue('');

    this.tarifaService.getDistribuidorasPorUF(uf).subscribe({
      next: (distribuidoras) => {
        this.distribuidoras = distribuidoras;
        this.carregandoDistribuidoras = false;

        if (distribuidoras.length === 0) {
          this.errorMessage = 'Nenhuma distribuidora encontrada para este estado';
        } else {
          this.errorMessage = '';
        }
      },
      error: (error) => {
        console.error('Erro ao carregar distribuidoras:', error);
        this.errorMessage = 'Erro ao carregar distribuidoras';
        this.carregandoDistribuidoras = false;
      }
    });
  }

  // Método para acessar os controles de forma segura
  getFormControl(nome: string): AbstractControl | null {
    return this.formulario.get(nome);
  }

  calcular(): void {
    // Marcar todos os campos como tocados para mostrar erros
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.carregando = true;
    this.errorMessage = '';

    const distribuidora = this.distribuidoras.find(d => d.id === Number(this.formulario.value.distribuidora));
    if (!distribuidora) {
      this.errorMessage = 'Distribuidora inválida';
      this.carregando = false;
      return;
    }

    this.calculadoraComplexaService.calcularEconomia({
      uf: this.formulario.value.estado,
      distribuidora_id: Number(this.formulario.value.distribuidora),
      valor_fatura: Number(this.formulario.value.valorContaAtual)
    }).subscribe({
      next: (resultado) => {
        this.result = {
          distribuidora: distribuidora.nome,
          yearsToROI: Math.ceil(Number(this.formulario.value.valorContaAtual) / (resultado.economia)),
          tarifa_te: resultado.detalhes.tarifa_te,
          tarifa_tusd: resultado.detalhes.tarifa_tusd,
          consumoEstimado: resultado.consumo_medio,
          valorContaAtual: Number(this.formulario.value.valorContaAtual),
          custoMensalEnergiaLimpa: resultado.detalhes.valor_fatura - resultado.economia,
          economiaMensal: Math.max(resultado.economia, 0),
          economiaAnual: Math.max(resultado.economia * 12, 0),
          desconto: resultado.detalhes.desconto * 100,
        };
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao calcular economia:', error);
        this.errorMessage = 'Erro ao calcular economia';
        this.carregando = false;
      }
    })
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}