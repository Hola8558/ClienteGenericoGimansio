import { Component } from '@angular/core';
import { ClientService } from '../services/clientes.service';
import { downloadClient } from '../interfaces/download-client.interface';
import { RutinasService } from '../services/rutinas.service';
import { ejercicio, pseaudoEjerciicios, rutina } from '../interfaces/ejercicios.interface';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {

  constructor(private clienService : ClientService, private rutinasService : RutinasService, private alertService: AlertService){
    this.inicio();
  }

  public base64Image = '';
  public client : downloadClient = {_id:'', ncuenta:'', nombre:'',apellidos:'',ultimoPago:'',fechaVencimiento:'',tipoMensualidad:'', numeroCelular:'',numeroCelularEmergencia:'',rutinas:{l:'',M:'',Mi:'',J:'',V:'',S:''}}
  public messageError = '';

  async inicio() {
    const id = localStorage.getItem('id')!;
    try {
      (await this.clienService.getClient(id)).subscribe(
        async (res: any) => {
          this.client = res;
          this.client.ultimoPago = this.getRealDate(this.client.ultimoPago);
          this.client.fechaVencimiento = this.getRealDate(this.client.fechaVencimiento);
          this.base64Image = this.client.profileImg ?? '';
        },
        (err: any) => {
          console.log(err);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  getRealDate( fechaString : string ) : string {
    const fecha = new Date(fechaString);
    // Obtén los componentes de la fecha
    const dia = fecha.getDate();
    const mes = fecha.toLocaleString('default', { month: 'long' });
    const anio = fecha.getFullYear();
    // Crea el texto en el formato deseado
    const textoFecha = `${dia} de ${mes} de ${anio}`;

    return textoFecha;
  }

}
