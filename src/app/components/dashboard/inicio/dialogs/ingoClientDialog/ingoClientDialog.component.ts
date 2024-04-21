import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogOverviewExampleDialog } from '../../../usuarios-config/usuarios-config.component';
import { ClientService } from '../../clientes.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { downloadClient } from '../../interfaces/download-client.interface';
import { MatButtonModule } from '@angular/material/button';
import { CalendarComponent } from '../../components/calendar/calendar.component';

@Component({
  selector: 'app-ingo-client-dialog',
  standalone: true,
  imports: [
    CommonModule, MatProgressSpinnerModule, MatDialogModule, MatButtonModule, CalendarComponent
  ],
  templateUrl: './ingoClientDialog.component.html',
  styleUrls: ['./ingoClientDialog.component.css'],
})
export class IngoClientDialogComponent {

  public isSmallScreen: boolean = false;
  public error = {e: false, messageError: ''};
  public messageError = ''
  public client : downloadClient = { _id: '', ncuenta: '', nombre: '', apellidos: '', ultimoPago: '', fechaVencimiento: '', tipoMensualidad: '', numeroCelular: '', numeroCelularEmergencia: '', profileImg: '', gender:'' };
  public spinnerUpload = false;
  public base64Image = '';

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver,
    private clientService : ClientService
  ) {
    this.inicio();
  }

  async inicio(){
    (await this.clientService.getClient(this.data._id)).subscribe(
      ( res : any ) => {
        this.client = res;
        this.client.ultimoPago = this.getRealDate(this.client.ultimoPago);
        this.client.fechaVencimiento = this.getRealDate(this.client.fechaVencimiento);
        this.base64Image = this.client.profileImg ?? '';
      },
      err => {
        this.error = { e: true, messageError: err.error.message };
        this.messageError = err.error.message;
      }
    )
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
  }
}
