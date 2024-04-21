import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DialogOverviewExampleDialog } from '../../../usuarios-config/usuarios-config.component';
import { ClientService } from '../../clientes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { updeateClient } from '../../interfaces/update-client.interface';
import { renewMensualidad } from '../../interfaces/renew-mensualidad.interface';
import { AlertService } from 'src/app/components/shared/alert.service';

@Component({
  selector: 'app-edit-client-dialog',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatNativeDateModule, CommonModule
  ],
  templateUrl: './renew-mensualidad-dialog.component.html',
  providers: [DatePipe],
  styleUrls: ['./renew-mensualidad-dialog.component.css']
})
export class RenewMensualidadDialogComponent {

  public date = new FormControl(new Date());
  public serializedDate = new FormControl(new Date().toISOString());
  selectedValue: string = '';

  tipos = ['Estudiante', 'General', 'Convenio'];

  public form  : FormGroup;
  public isSmallScreen: boolean = false;
  public errorNoMatchPass = false;
  public spinnerUpload = false;
  public changePass = false;
  public messageError = '';
  public _id = '';
  public client : updeateClient = {}

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private clientService : ClientService,
    private alertService: AlertService,
    private datePipe: DatePipe
  ) {
    this.inicio();
    const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.form = this.fb.group({
      ncuenta: [this.client.ncuenta],
      fechaPago: [fechaActual, Validators.required],
      mensualidad: [this.client.tipoMensualidad, Validators.required]
    })
}

filterDate = (date: Date | null): boolean => {
  // Implementa la lógica de filtrado si es necesario
  return true;
};

async inicio(){
  const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

  this.spinnerUpload = true;
  (await this.clientService.getClient(this.data._id)).subscribe(
    res => {
      this.client = res;
      this.form = this.fb.group({
        ncuenta: [this.client.ncuenta],
        fechaPago: [fechaActual, Validators.required],
        mensualidad: [this.client.tipoMensualidad, Validators.required]
      })
      this.spinnerUpload = false;
    },
    err => {
      if (err.error && err.error.message) {
        this.messageError = err.error.message;
      } else {
        this.messageError = 'Error desconocido';
      }

      this.alertService.showAlert("w", "Error", 5000);
      setTimeout(() => {
        this.spinnerUpload = false;
        this.messageError = '';
      }, 1500)
    }
  )
}

  onNoClick( update : boolean ): void {
    this.dialogRef.close( update );
  }

  submitForm() {
    if (this.form.valid) {
      this.actualizar(); // Llama a la función del formulario si el formulario es válido
    };
  }

  async actualizar(){
    this.spinnerUpload = true;

    const { ncuenta, mensualidad, fechaPago } : { ncuenta:string, mensualidad:string, fechaPago:string } = this.form.value;
    const client : renewMensualidad = { ncuenta, tipoMensualidad: mensualidad, ultimoPago:fechaPago, fechaVencimiento: this.obtenerFechaSiguiente(fechaPago) };

    (await this.clientService.renovarMensualidad( this.data._id ,client )).subscribe(
      (res : any) => {
        this.onNoClick(true);
        console.log(res);

      },
      (err : any) => {
        console.log(err);

        this.spinnerUpload = false;
        this.messageError = err.error.message;
      }
    )


  }

  obtenerFechaSiguiente(fecha: string | null): string {
    if (!fecha) {
      return ''; // Maneja el caso donde la fecha es nula
    }

    // Clonamos la fecha para evitar modificar la original
    const fechaSiguiente = new Date(fecha);

    // Establecemos un año específico (puedes ajustarlo según tus necesidades)
    const añoEspecifico = 2024;
    fechaSiguiente.setFullYear(añoEspecifico);

    // Obtenemos el día del mes
    const diaDelMes = fechaSiguiente.getDate();

    // Configuramos la fecha para el próximo mes
    fechaSiguiente.setMonth(fechaSiguiente.getMonth() + 1);

    // Si el día del mes original era mayor que el último día del próximo mes,
    // establecemos el día del mes al último día del próximo mes
    if (diaDelMes > new Date(añoEspecifico, fechaSiguiente.getMonth() + 1, 0).getDate()) {
      fechaSiguiente.setDate(new Date(añoEspecifico, fechaSiguiente.getMonth() + 1, 0).getDate());
    }

    // Formateamos la fecha en el formato ISO 8601
    const fechaFormateada = fechaSiguiente.toISOString();

    return fechaFormateada;
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
