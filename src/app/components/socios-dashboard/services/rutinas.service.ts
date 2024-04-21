import { Injectable } from '@angular/core';
import { ejercicio, rutina } from '../interfaces/ejercicios.interface';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RutinasService {

  constructor( private http : HttpClient ){}

  /** EXTRAS */
  private estadoSubjectNewRutina = new BehaviorSubject<boolean>(false);
  estadoMenuShowRutina$ = this.estadoSubjectNewRutina.asObservable();

  actualizarEstado(nuevoEstado: boolean) {
    this.estadoSubjectNewRutina.next(nuevoEstado);
  }

  getEstadoActual(){
    return this.estadoMenuShowRutina$
  }

  private estadoSubjectNewRutinaMobile = new BehaviorSubject<boolean>(false);
  estadoMenuShowRutinaMobile$ = this.estadoSubjectNewRutinaMobile.asObservable();

  actualizarEstadoMobile(nuevoEstado: boolean) {
    this.estadoSubjectNewRutinaMobile.next(nuevoEstado);
  }

  getEstadoActualMobile(){
    return this.estadoMenuShowRutinaMobile$
  }

  /** PESTAÑAS */
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }


  /** EJERCICIOS */

  private URL : string =  environment.domain + 'rutinas';
  async addEjercicio( ejercicio: ejercicio){
    const { nombre, url, description, grupoMuscular } = ejercicio;
    return this.http.post(this.URL + '/createEjercico', { nombre, url, description, grupoMuscular });
  }

  async getAllEjercicios() {
    return await this.http.get(this.URL + '/ejercicios');
  }

  async deleteExcecise( _id : string ){
    return await this.http.delete(this.URL + `/ejercicio/${_id}`)
  }

  async getOneExcercise( _id : string ){
    return await this.http.get(this.URL + `/ejercicio/${_id}`);
  }

  async updateExcecise( _id : string, ejercicio : ejercicio ){
    return await this.http.put(this.URL + `/ejercicio/${_id}`, ejercicio );
  }

   /** RUTINAS */

   private URLSocio : string =  environment.domain + 'clientes/';

   async addRutina( rutina: rutina){
    console.log(rutina);

    const { name, grupoMuscular, ejercicios } = rutina;
    let o  = { "name":name, "grupoMuscular":grupoMuscular, "ejercicios":ejercicios }
    return this.http.post(this.URL + '/createRutina', o);
    }

  async findAllRutinas() {
    const result = await this.http.get(this.URL + '/verRutinas');
    return result
  }

  async getAllRutinasStarred() {
    const result = await this.http.get( this.URL + '/getAllRutinasStarred' );
    return result
  }

  async getResumenRutina(id:string){
    let res = await this.http.get(this.URL + `/rutinasUna/${id}`);
    return res;
  }

  async setRutinaToClient( socio: string, d: string, rutina: string ){
    let ruta = this.URLSocio + `${socio}/addRutina/${d}`;
    let e = {"rutina":rutina.toString()};
    console.log(ruta);
    console.log(e);
    return await this.http.put(ruta, e);
  }

  async deleteRutina(id:string){
    return await this.http.delete(this.URL+`/deleteRutina/${id}`)
  }

}
