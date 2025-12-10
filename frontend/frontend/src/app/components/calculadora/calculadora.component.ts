import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { SelecionarEstadoComponent } from '../selecionar-estado/selecionar-estado.component';
import { ResultadoModalComponent } from '../resultado-modal/resultado-modal.component';
import { TarifaService } from '../../services/tarifa.service';
import { Distribuidora } from '../../models/Tarifa.model';

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelecionarEstadoComponent, ResultadoModalComponent],
  templateUrl: './calculadora.component.html',
  styleUrls: ['./calculadora.component.css']
})
export class CalculadoraComponent implements OnInit {
  formulario: FormGroup;
  resultado: any = null;
  showModal: boolean = false;
  carregando: boolean = false;
  errorMessage: string = '';
  estados: any[] = [];
  distribuidoras: Distribuidora[] = [];
  carregandoDistribuidoras: boolean = false;

  constructor(
    private fb: FormBuilder,
    private tarifaService: TarifaService
  ) {
    this.formulario = this.fb.group({
      estado: ['', Validators.required],
      distribuidora: ['', Validators.required],
      consumoMensalKwh: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      valorContaAtual: ['']
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

  carregarEstados(): void {
    this.tarifaService.getTarifas().subscribe({
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

    // Simulação de cálculo
    setTimeout(() => {
      const consumo = this.formulario.value.consumoMensalKwh;
      const distribuidoraId = this.formulario.value.distribuidora;

      // Buscar dados da distribuidora selecionada
      const distribuidora = this.distribuidoras.find(d => d.id === Number(distribuidoraId));

      if (!distribuidora) {
        this.errorMessage = 'Distribuidora não encontrada';
        this.carregando = false;
        return;
      }

      // Calcular tarifa total (TE + TUSD convertido de R$/MWh para R$/kWh)
      const tarifaTE = distribuidora.tarifa_te / 1000; // Converter de R$/MWh para R$/kWh
      const tarifaTUSD = distribuidora.tarifa_tusd / 1000; // Converter de R$/MWh para R$/kWh
      const tarifaTotal = tarifaTE + tarifaTUSD;

      const contaAtual = this.formulario.value.valorContaAtual || consumo * tarifaTotal * 1.3;
      const custoEnergiaLimpa = consumo * tarifaTotal;
      const economiaMensal = contaAtual - custoEnergiaLimpa;
      const economiaAnual = economiaMensal * 12;

      this.resultado = {
        distribuidora: distribuidora.nome,
        tarifa_te: tarifaTE,
        tarifa_tusd: tarifaTUSD,
        tarifa_kwh: tarifaTotal,
        custoMensalEnergiaLimpa: custoEnergiaLimpa,
        economiaMensal: Math.max(economiaMensal, 0),
        economiaAnual: Math.max(economiaAnual, 0),
        consumoMensalKwh: consumo
      };

      this.showModal = true;
      this.carregando = false;
    }, 1500);
  }

  fecharModal(): void {
    this.showModal = false;
    this.resultado = null;
  }
}