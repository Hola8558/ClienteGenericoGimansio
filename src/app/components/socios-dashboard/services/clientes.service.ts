import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertService } from './alert.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor( private http : HttpClient, private alertService: AlertService ){ }

  private URL : string =  environment.domain + 'clientes';


  async getClient( _id : string ){
    return await this.http.get(this.URL+`/${_id}`);
  }



  async registrarAsistencia ( _id : string ){

    let registrada = false;

    this.http.get<string>(this.URL).subscribe((listaExistente: any) => {

      const fechaHoy = new Date();
      const nuevaFecha = `${fechaHoy.getFullYear().toString().slice(-2)}${(fechaHoy.getMonth() + 1).toString().padStart(2, '0')}${fechaHoy.getDate().toString().padStart(2, '0')}`;
      const client = listaExistente.find( (c : any) => c._id === _id );

      let diasAsistencia = listaExistente.diasAsistencia;

      if (client.diasAsistencia){
        const listaPrevia = client.diasAsistencia.split(' ');

        if (!listaPrevia.includes(nuevaFecha)) {
          listaPrevia.push(nuevaFecha);
          diasAsistencia = listaPrevia.join(' ');
        } else {
          registrada = true;
        }
      } else {
        diasAsistencia = nuevaFecha;
      }

      this.http.put(this.URL +`/${_id}`, { diasAsistencia }).subscribe(
        (res) => {
          if (registrada){
            this.alertService.showAlert("inf", "Ya se registró una entrada hoy", 2500);
          } else {
            this.alertService.showAlert("suc","Entrada registrada", 2000);
          }
        },
        (err) => {
          this.alertService.showAlert("w","Error al registrar", 3000);
        }
      );

    }, (err) => {
      this.alertService.showAlert("w","Error al registrar", 3000);
    });

    return new Observable();
  }

  async getDaysAssited( _id: string, month : string, year: string ) : Promise<number[]> {

    if ( month.length === 1 ) month = `0${month}`;
    return this.http.get(`${this.URL}/${_id}`).toPromise()
      .then((data: any) => {
        const list: number[] = [];
        if (data.diasAsistencia) {
          for (const day of data.diasAsistencia.split(" ")) {
            const y = `${day.slice(0, 2)}`;
            const m = `${day.slice(2, 4)}`;
            const d = `${day.slice(4, 6)}`;

            if (y === year && m === month) {
              list.push(Number(d));
            }
          }
        }
        return list;
      })
      .catch(error => {
        console.error('Error en la petición:', error);
        throw error; // Puedes manejar el error según tus necesidades
      });

  };
}
