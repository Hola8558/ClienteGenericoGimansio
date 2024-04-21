import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DialogOverviewExampleDialog } from '../../../usuarios-config/usuarios-config.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { ClientService } from '../../clientes.service';
import { createClient } from '../../interfaces/create-client.interface';
import { AlertService } from 'src/app/components/shared/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';


@Component({
  selector: 'app-create-client-dialog',
  templateUrl: './create-client-dialog.component.html',
  styleUrls: ['./create-client-dialog.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatNativeDateModule, CommonModule, MatIconModule, MatTooltipModule, MatRadioModule, MatDatepickerModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' } // Configura el formato de fecha deseado (por ejemplo, 'es-ES' para formato DD/MM/YYYY)
  ],
})
export class createClientDialogComponent implements OnInit{

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
  public ncuenta : string;
  public mens = '';

  cancelarConvenio() {
    this.form.get('mensualidad')?.setValue(null); // Reinicia la selección
    this.mens = ''; // Puedes ajustar esto según tus necesidades
  }

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private clientService : ClientService,
    private _snackBar: MatSnackBar,
    private alertService: AlertService,
  ) {
    const nCuenta = this.generateRandomAccountNumber();
    this.form = this.fb.group({
      ncuenta: [ nCuenta , Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: [''],
      emergencia: [''],
      fechaPago: [this.date, Validators.required],
      mensualidad: ['', Validators.required],
      Precio: [0, Validators.required],
      gender : ['H', Validators.required],
      pass : [`${nCuenta}`, Validators.required],
    })
    this.ncuenta = this.generateRandomAccountNumber();
}

  onNoClick( e: boolean = false ): void {
    this.dialogRef.close({ exit: e });
  }

  submitForm() {
    if (this.form.valid) {
      this.ingresar(); // Llama a la función del formulario si el formulario es válido
    };
  }

  async ingresar(){
    this.spinnerUpload = true;

    const {nombre, apellidos, ncuenta, fechaPago, mensualidad, telefono, emergencia, Precio, gender, pass} : {nombre:string, apellidos:string, ncuenta:string, fechaPago:string, mensualidad:string, telefono:string, emergencia:string, Precio:number, gender?:string, pass:string} = this.form.value;
    const client : createClient = { nombre, apellidos, ncuenta, ultimoPago: fechaPago, fechaVencimiento: this.obtenerFechaSiguiente(fechaPago),
      tipoMensualidad: mensualidad, numeroCelular:telefono, numeroCelularEmergencia:emergencia, precioConvenio:Precio, gender, pass };

    (await this.clientService.addClient( client )).subscribe(
      (res : any) => {
        this._snackBar.open('Cliente creado correctamente', '', { duration: 1200});
        this.onNoClick( true );
      },
      (err : any) => {

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

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Genera un número de cuenta de 5 dígitos al azar
  generateRandomAccountNumber(): string {
    const min = 10000; // El número mínimo de 5 dígitos
    const max = 100000; // El número máximo de 5 dígitos (excluido)
    const randomNumber = this.getRandomNumber(min, max);
    return randomNumber.toString();
  }

  obtenerFechaSiguiente(fecha: string | null): string {
    if (!fecha) {
      return ''; // Maneja el caso donde la fecha es nula
    }

    // Clonamos la fecha para evitar modificar la original
    const fechaSiguiente = new Date(fecha);

    // Obtenemos el día del mes
    const diaDelMes = fechaSiguiente.getDate();

    // Configuramos la fecha para el próximo mes
    fechaSiguiente.setMonth(fechaSiguiente.getMonth() + 1);

    // Si el día del mes original era mayor que el último día del próximo mes,
    // establecemos el día del mes al último día del próximo mes
    if (diaDelMes > new Date(fechaSiguiente.getFullYear(), fechaSiguiente.getMonth() + 1, 0).getDate()) {
      fechaSiguiente.setDate(new Date(fechaSiguiente.getFullYear(), fechaSiguiente.getMonth() + 1, 0).getDate());
    }

    // Devolvemos la fecha en formato ISO8601
    return fechaSiguiente.toISOString();
  }



  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });

    this.form.get('mensualidad')?.valueChanges.subscribe((mensualidad) => {
      this.form.get('Precio')?.setValue(mensualidad === 'Convenio' ? '' : this.form.get('Precio')?.value);
    });
  }

}
