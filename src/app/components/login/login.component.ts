import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { Login } from './interfaces/login.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  public form : FormGroup;
  public formSocio : FormGroup;
  public loanding = false;
  public errorAlert = { e: false, m: '' }
  public loginMode = true;

  constructor( private fb: FormBuilder, private _snackBar: MatSnackBar, private router: Router, private loginService : LoginService ){
    this.formSocio = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    });
    const nivel = localStorage.getItem("nivel");
    const token = localStorage.getItem("token");
    const rutaActiva = localStorage.getItem("rutaActiva");
    if (!token) return;
    if (!nivel) return;
    if ( nivel === '1' ) {this.router.navigate(['socios-SportHouse']); return;}
    if ( nivel === '0' ) {
    //this.router.navigate(['dashboard'])
    if (rutaActiva === 'Rutinas'){
      this.router.navigate(['dashboard/rutinas']);
      return
    }else {
      this.router.navigate(['socios-SportHouse']);
    }
  }

  }

  async ingresarAdmin(){
    const usuario = this.form.value.usuario;
    const password = this.form.value.password;

    const login : Login = { email : usuario, contrasena: password }

    //TODO: Login en backend
    await (await this.loginService.login( login )).subscribe(
      (res : any) => {
        this.fakeLoading();
        localStorage.setItem('token', res.token);
        localStorage.setItem('nivel', '0');
        localStorage.setItem('nombre', `${res.userData.nombre} ${res.userData.apellidos}`);
        this.loginService.secion = res.userData;
      },
      err => {
        this.error(err.error.message);
        this.form.reset();
      }
    );
  };

  async ingresarSocio(){
    const usuario = this.formSocio.value.usuario;
    const password = this.formSocio.value.password;

    const loginSocio : Login = { email : usuario, contrasena: password }

    //TODO: Login en backend
    await (await this.loginService.loginSocio( loginSocio )).subscribe(
      (res : any) => {
        this.fakeLoadingSocio();
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', res.userData._id);
        localStorage.setItem('nivel', '1');
        localStorage.setItem('nombre', `${res.userData.nombre} ${res.userData.apellidos}`);
        this.loginService.secion = res.userData;
      },
      err => {
        this.error(err.error.message);
        this.formSocio.reset();
      }
    );
  };

  error(error : string){
    this._snackBar.open(error, '', {
      duration:5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  public fakebenchpres = false
  fakeLoadingSocio(){
    this.fakebenchpres = true;
    this.loanding = true;

    setTimeout(() => {
      this.router.navigate(['socios-SportHouse']);
    },1700);
  }

  fakeLoading(){
    this.loanding = true;
    setTimeout(() => {
      this.router.navigate(['dashboard']);
    },1000);
  }

}
