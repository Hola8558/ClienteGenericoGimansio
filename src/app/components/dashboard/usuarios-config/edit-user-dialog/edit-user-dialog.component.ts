import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DialogOverviewExampleDialog } from '../usuarios-config.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UserData } from '../interfaces/usuarios.interface';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LoginService } from 'src/app/components/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
//  styleUrls: ['./edit-user-dialog.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule],
})
export class EditUserDialogComponent implements OnInit{

  public form  : FormGroup;
  public isSmallScreen: boolean = false;
  public errorNoMatchPass = false;
  public spinnerUpload = false;
  public changePass = false;
  public messageError = '';
  public _id = '';

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserData,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private loginService : LoginService,
    private _snackBar: MatSnackBar
  ) {
    let { nombre, apellidos } = data;
    let correo = data.email;
    this._id = data._id;
    this.form = this.fb.group({
      nombre: [nombre, Validators.required],
      apellidos: [apellidos, Validators.required],
      correo: [correo, Validators.required],
      pass: [''],
      passConfirmed: [''], // Solo necesitas Validators.required aquí
        }, { validators: this.matchPasswords.bind(this) });
  }

matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('pass')?.value;
  const confirmPassword = control.get('passConfirmed')?.value;
  if (password != confirmPassword) this.errorNoMatchPass = true; else this.errorNoMatchPass = false;

  return password === confirmPassword ? null : { passwordsNotMatch: true };
}

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.form.valid) {
      this.ingresar(); // Llama a la función del formulario si el formulario es válido
    };
  }

  async ingresar(){
    const { nombre, apellidos, correo, pass } = this.form.value;
    this.spinnerUpload = true;

    (await this.loginService.updateAdminUser( {_id: this._id, nombre, apellidos, correo, pass, changePass: this.changePass } )).subscribe(
      res =>{
        this.onNoClick();
        this._snackBar.open('Administrador Actualizado', '', {
          duration: 1300
        });
      },
      err => {
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
