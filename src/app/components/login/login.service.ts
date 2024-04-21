import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from './interfaces/login.interface';
import { UserData } from '../dashboard/usuarios-config/interfaces/usuarios.interface';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  secion : UserData = {
    _id: "",
    email: "",
    nombre: "",
    apellidos: "",
    contrasena: "",
    activo: 1,
    admin: 0
  }
  constructor( private http : HttpClient ) {
    //this.secion.nombre = localStorage.getItem('nombre')!.split(' ')[0];
    //const nombreCompleto = localStorage.getItem('nombre')!.split(' ');
    //this.secion.apellidos = nombreCompleto.slice(1).join(' ');
    console.log(this.URL);

   }

  private URL : string =  environment.domain;

  async login( user : Login ){
    return await this.http.post(this.URL + 'usuarios/login', user);
  }

  async loginSocio( user : Login ){
    return await this.http.post(this.URL+'clientes/loginSocio', user);
  }

  loggedIn() {
    return !!localStorage.getItem('token');
  }

  async getAllUsers(){
    return await this.http.get(this.URL+'usuarios')
  }

  async addAdminUser ( { nombre, apellidos, correo, pass } :{ nombre:string, apellidos:string, correo:string, pass:string } ) {
    return await this.http.post(this.URL+'usuarios', {nombre, apellidos, email:correo, contrasena: pass });
  }

  async updateAdminUser ( { _id, nombre, apellidos, correo, pass, changePass }: {  _id:string, nombre:string, apellidos:string, correo:string, pass:string, changePass:boolean } ){
    if (changePass) return await this.http.put(this.URL+`usuarios/${_id}`, {nombre, apellidos, email:correo, contrasena: pass }); else return await this.http.put(this.URL+`/${_id}`, {nombre, apellidos, email:correo });

  }

  async deleteAdminUser ( _id : string ) {
    return await this.http.delete(this.URL+`usuarios/${_id}`);
  }
}

