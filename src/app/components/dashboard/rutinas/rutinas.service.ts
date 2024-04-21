import { Injectable } from '@angular/core';
import { ejercicio, pseaudoEjerciicios, rutina } from './interfaces/ejercicios.interface';
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

  private estadoSubjectNewRutinaMobile = new BehaviorSubject<boolean>(false);
  estadoMenuShowRutinaMobile$ = this.estadoSubjectNewRutinaMobile.asObservable();

  private dayToAddNewRutina = new BehaviorSubject<string>('');
  dayToAddNewRutina$ = this.dayToAddNewRutina.asObservable();

  public newAddedRutina : rutina = {name:'', grupoMuscular:'', ejercicios:[]}

  private newAddedRutinaSubject = new BehaviorSubject<any>({});
  //_id:'',name:'', grupoMuscular:'', ejercicios:[]
  public newAddedRutina$ = this.newAddedRutinaSubject.asObservable();

  public newListEditEjercicios : {}[]=[];

  actualizarRutina(rutina: any) {
    this.newAddedRutinaSubject.next(rutina);
  }

  actualizarDayToAsign(nuevoEstado: string) {
    this.dayToAddNewRutina.next(nuevoEstado);
  }

  getDayToAsign(){
    return this.dayToAddNewRutina$
  }

  actualizarEstado(nuevoEstado: boolean) {
    this.estadoSubjectNewRutina.next(nuevoEstado);
  }

  getEstadoActual(){
    return this.estadoMenuShowRutina$
  }

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

   private URLSocio : string =  environment.domain + 'clientes';

   async addRutina( rutina: rutina){
    const { name, grupoMuscular, ejercicios } = rutina;
    return this.http.post(this.URL + '/createRutina', { name, grupoMuscular, ejercicios });
  }

  async findAllRutinas() {
    return await this.http.get(this.URL + '/verRutinas');
  }

  async getResumenRutina(id:string){
    return await this.http.get(this.URL + `/rutinasUna/${id}`);
  }

  async setRutinaToClient( socio: string, d: string, rutina: string ){
    let ruta = this.URLSocio + `/${socio}/addRutina/${d}`;
    return await this.http.put(ruta, {rutina : rutina.toString()});
  }

  async setFavorites( rutina : rutina, mode: number ){
    rutina.favorites = mode;
    const { name, grupoMuscular, ejercicios, favorites  } = rutina;
    return await this.http.put( this.URL + `/updateRutina/${rutina._id}` , { name, grupoMuscular, ejercicios, favorites  });
  }

  async getAllRutinasStarred() {
    return await this.http.get( this.URL + '/getAllRutinasStarred' );
  }

  async updateRutina( id:string, ejercicios : pseaudoEjerciicios[] ){
    return await this.http.put(this.URL + `/updateRutinaEjercicios/${id}`, ejercicios);
  }

  async deleteRutina(id:string){
    return await this.http.delete(this.URL+`/deleteRutina/${id}`)
  }

}
