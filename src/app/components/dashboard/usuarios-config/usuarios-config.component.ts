import { Component, Inject, OnInit } from '@angular/core';
import { LoginService } from '../../login/login.service';
import { UserData } from './interfaces/usuarios.interface';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';

import {MatButtonModule} from '@angular/material/button';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, NgClass } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { DeleteUsersDialogComponent } from './delete-users-dialog/delete-users-dialog.component';
import { infoAdminUserDialog } from './infloAdminUserDialog/infoAdminUserDialog';

@Component({
  selector: 'app-usuarios-config',
  templateUrl: './usuarios-config.component.html',
  styleUrls: ['./usuarios-config.component.css']
})
export class UsuariosConfigComponent implements OnInit{
  constructor(
    private loginService : LoginService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ){
    this.inicio()
  }

  message(element : UserData){
    const dialogRef = this.dialog.open(infoAdminUserDialog, { data: element });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
  }

  public usersList : UserData[] = [];
  public displayedColumns: string[] = ['Nombre', 'Correo', 'Opciones'];
  public displayedColumnsSmall: string[] = ['Usuarios'];
  public isLoadingResults = true;
  public isSmallScreen: boolean = false;

  async inicio(){

    await (await this.loginService.getAllUsers()).subscribe(
      (res : any) => {
        console.log(res);

        const condicionExclusion = (obj : any) => obj.activo === 0;
        this.usersList = res.filter((obj: any) => !condicionExclusion(obj));;
        this.isLoadingResults = false;
      },
      err => {
        console.log(err);
      }
    )
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog);

    dialogRef.afterClosed().subscribe(result => {
      this.inicio()
    });
  }

  editElement( element : UserData ){
    const dialogRef = this.dialog.open(EditUserDialogComponent, {data:element});

    dialogRef.afterClosed().subscribe(result => {
      this.inicio();
    });
  }

  deleteElement( _id : string ){
    const dialogRef = this.dialog.open(DeleteUsersDialogComponent, {data:_id});

    dialogRef.afterClosed().subscribe(result => {
      this.inicio();
    });
  }

}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule],
})
export class DialogOverviewExampleDialog implements OnInit {

  public form  : FormGroup;
  public isSmallScreen: boolean = false;
  public errorNoMatchPass = false;
  public spinnerUpload = false;
  public messageError = '';

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserData,
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private loginService : LoginService,
    private _snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', Validators.required],
      pass: ['', Validators.required],
      passConfirmed: ['', Validators.required], // Solo necesitas Validators.required aquí
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
    (await this.loginService.addAdminUser( { nombre, apellidos, correo, pass } )).subscribe(
      res =>{
        this.onNoClick();
        this._snackBar.open('Nuevo administrador creado', '', {
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
