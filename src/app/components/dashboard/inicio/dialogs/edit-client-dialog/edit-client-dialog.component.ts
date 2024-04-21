import { Component, Inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DialogOverviewExampleDialog } from '../../../usuarios-config/usuarios-config.component';
import { ClientService } from '../../clientes.service';
import {MatRadioModule} from '@angular/material/radio';
import { updeateClient } from '../../interfaces/update-client.interface';
import { AlertService } from 'src/app/components/shared/alert.service';

@Component({
  selector: 'app-edit-client-dialog',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatNativeDateModule, CommonModule, MatRadioModule
  ],
  templateUrl: './edit-client-dialog.component.html',
  styleUrls: ['./edit-client-dialog.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' } // Configura el formato de fecha deseado (por ejemplo, 'es-ES' para formato DD/MM/YYYY)
  ],
})
export class EditClientDialogComponent {

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
  public base64Image: string = '';

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private clientService : ClientService,
    private alertService: AlertService
  ) {
    this.inicio();
    this.form = this.fb.group({
      ncuenta: [this.client.ncuenta],
      nombre: [this.client.nombre, Validators.required],
      apellidos: [this.client.apellidos, Validators.required],
      telefono: [this.client.numeroCelular],
      emergencia: [this.client.numeroCelularEmergencia],
      fechaPago: [this.client.ultimoPago, Validators.required],
      mensualidad: [this.client.tipoMensualidad, Validators.required],
      pass:[''],
      passConfirmed: [''], // Solo necesitas Validators.required aquí
        }, { validators: this.matchPasswords.bind(this)
    })
}

cancelarNewPass(){
 this.form.get("pass")?.setValue("");
 this.form.get("passConfirmed")?.setValue("");
 this.changePass = false;
}

matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('pass')?.value;
  const confirmPassword = control.get('passConfirmed')?.value;
  if (password != confirmPassword) this.errorNoMatchPass = true; else this.errorNoMatchPass = false;

  return password === confirmPassword ? null : { passwordsNotMatch: true };
}

async inicio(){
  this.spinnerUpload = true;
  (await this.clientService.getClient(this.data._id)).subscribe(
    res => {
      this.client = res;
      this.form = this.fb.group({
        ncuenta: [this.client.ncuenta],
        nombre: [this.client.nombre, Validators.required],
        apellidos: [this.client.apellidos, Validators.required],
        telefono: [this.client.numeroCelular],
        emergencia: [this.client.numeroCelularEmergencia],
        fechaPago: [this.client.ultimoPago, Validators.required],
        mensualidad: [this.client.tipoMensualidad, Validators.required],
        gender: [this.client.gender, Validators.required],
        pass:[''],
        passConfirmed: [''], // Solo necesitas Validators.required aquí
          }, { validators: this.matchPasswords.bind(this)
      })
      this.spinnerUpload = false;
      this.base64Image = this.client.profileImg ?? '';
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
      this.actualizar();
    };
  }

  onImgSelected(event: any){
    const file = event.target.files[0];
    if (!file) return;

    const maxSizeInBytes = 3 * 1024 * 1024; // 5MB

    if (file.size > maxSizeInBytes) {
      this.alertService.showAlert("danger", "La imagen es mayor a 3mb", 3000);
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      this.base64Image = reader.result as string;
    }
  }

  async actualizar(){
    this.spinnerUpload = true;

    const {nombre, apellidos, ncuenta, mensualidad, telefono, emergencia, gender} : {nombre:string, apellidos:string, ncuenta:string, fechaPago:string, mensualidad:string, telefono:string, emergencia:string, gender:string, pass:string} = this.form.value;
    let client : updeateClient = { nombre, apellidos, ncuenta, tipoMensualidad: mensualidad, numeroCelular:telefono, numeroCelularEmergencia:emergencia, gender };
    if (this.form.get("pass")?.value != ''){
      const { pass } : {pass:string} = this.form.value;
      client = {...client, pass}
    }

    (await this.clientService.updateClient( this.data._id ,client, this.base64Image )).subscribe(
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

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
  }

}
