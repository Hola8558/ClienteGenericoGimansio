import { Component, OnInit, EventEmitter } from '@angular/core';
import { RutinasComponent } from '../rutinas.component';
import { ejercicio, pseaudoEjerciicios, rutina, rutinasMusculares, grupoMuscular } from '../interfaces/ejercicios.interface';
import { MatDialog } from '@angular/material/dialog';
import { RutinasService } from '../rutinas.service';
import { AlertService } from 'src/app/components/shared/alert.service';
import { Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ShowExcerciseComponent } from '../dialogs/show-excercise.component/show-excercise.component';

@Component({
  selector: 'app-rutinas-list',
  templateUrl: './rutinas-list.component.html',
  styleUrls: ['./rutinas-list.component.css']
})
export class RutinasListComponent implements OnInit{// implements AfterViewInit {

  public listaRutinas : rutinasMusculares[] = [ ];
  public listStarred : rutina[] = [];
  public deletingList : rutina[] = [];
  public startingList : rutina[] = [];
  public panelOpenState = false;
  public shoeMenuNew = false;
  public estadoReceptorNewRutina$ = this.rutinasService.estadoMenuShowRutina$;
  public shoeMenuNewMobile = false;
  public estadoReceptorNewRutinaMobile$ = this.rutinasService.estadoMenuShowRutinaMobile$;
  public ejercicios : ejercicio[] = [];
  public messageError = '';

  public rutinaToChange$ = this.rutinasService.newAddedRutina$
  //private estadoSubscription: Subscription;
  private estadoAnterior: boolean = false;
  private estadoActual: boolean = false;
  public isSmallScreen = false;
  public isSmallScreenMobile = false;
  public deletingRutines = false;
  public startMode = false;
  public rutinasDescargadas = false;

  constructor( private rutinasComponent : RutinasComponent, private breakpointObserver: BreakpointObserver, public dialog: MatDialog, private rutinasService : RutinasService, private alertService: AlertService ){
    this.inicio();
    this.rutinasService.getEstadoActual().subscribe(
      (res: boolean) => {
        if ( res === true ){this.estadoAnterior = res;}
        this.estadoActual = res;
        const newRu = this.rutinasService.newAddedRutina
        if ( newRu.name != '' && newRu.grupoMuscular != '' ){
          this.ordenarRutina(newRu)
          this.rutinasService.newAddedRutina = {name:'', grupoMuscular:'', ejercicios:[]}
        }

      }
    );
    if ( this.estadoAnterior === true && this.estadoActual === false ){
      this.inicio()
    }
  }

  async inicio() {
    this.estadoActual = false;
    this.estadoAnterior = false;
    this.ejercicios = [];
    this.listaRutinas = [];
    (await (this.rutinasService.getAllRutinasStarred())).subscribe((res:any) => {
      this.listStarred = res;
    })
    this.getEjercicios();
  }

  async downloadAllRutinas(){
    this.listaRutinas = [];
    this.rutinasDescargadas = true;
    (await (this.rutinasService.findAllRutinas())).subscribe(
      (res:any) => {
        for ( let r of res ){
          this.ordenarRutina(r);
        }
      }
    )
  }

  async getEjercicios(){
    /**EJERCICIOS */
    (await this.rutinasService.getAllEjercicios()).subscribe(
      ( res: any ) => {
        for ( let e of res ){
          this.ejercicios.push(e);
        };
      },
      ( err : any ) => {
        this.messageError = err.error.message;
        this.alertService.showAlert("danger","Error", 2000);
      }
    );
  }

  ordenarRutina( r:rutina ){
    if ( r.favorites === 1 ) { this.listStarred.push(r); return };
    let long = this.listaRutinas.length;
    let contador = 0;
    this.listaRutinas.forEach((x) => {
      if ( r.grupoMuscular != x.grupoMuscular ) {contador++} //{this.gruposMusculares.push( { name: e.grupoMuscular, ejercicios: [] } )}
      if ( r.grupoMuscular === x.grupoMuscular ) {x.rutinas.push(r);}
    });
    if ( contador === long ) { this.listaRutinas.unshift( { grupoMuscular: r.grupoMuscular, rutinas: [r] } ) };
  }

  getExcercise( itemEjer:pseaudoEjerciicios ){
    let index = this.ejercicios.findIndex(item => item._id === itemEjer.id);
    return this.ejercicios[index]
  }

  getExcerciseEJER( itemEjer:ejercicio ){
    let index = this.ejercicios.findIndex(item => item._id === itemEjer._id);
    return this.ejercicios[index]
  }

  changeShowNewRutina(){
    if( !this.isSmallScreen ){this.rutinasService.actualizarEstado(true);}else{
      this.rutinasService.actualizarEstadoMobile(true)
    }

  }

  calcelRutina(){
    this.rutinasService.actualizarEstadoMobile(false);
  }

  getResumeExcecise(e:pseaudoEjerciicios[]){
    let text = '';
    if ( this.ejercicios.length > 0 ){
      if (e.length >= 3){
        let index = this.ejercicios.findIndex(item => item._id === e[0].id);
        if (index === -1){ text = 'Ciruito'}else{text = this.ejercicios[index]?.nombre}
        index = this.ejercicios.findIndex(item => item._id === e[1].id);
        if (index === -1){ text = `${text}, Circuito`}else{text = `${text}, ${this.ejercicios[index]?.nombre}`}
        index = this.ejercicios.findIndex(item => item._id === e[2].id);
        if (index === -1){ text = `${text}, Circuito...`}else{text = `${text}, ${this.ejercicios[index]?.nombre}...`}
      } else{
        let index = this.ejercicios.findIndex(item => item._id === e[0].id);
        if (index === -1){ text = `Ciruito...`}else{text = `${this.ejercicios[index]?.nombre}...`}

      }
    }
    return text;
  }

  isPropertyArray(value: pseaudoEjerciicios): ejercicio[] {
    let list: ejercicio[] = [];

    if (value && Array.isArray(value.series)) {
        (value.series as ({ iden: string, reps: number }[])).forEach((element, ind) => {
            let index = this.ejercicios.findIndex(item => item._id === element.iden);
            if (index != -1) {
                list.push(this.ejercicios[index]);
                list[list.length-1].reps = ((value.series) as { iden: string, reps: number }[])[ind].reps | 0;
            }
        });
    }

    return list;
  }

  onClosed(agreed: rutina) {
    if (agreed) {
      this.rutinasService.actualizarEstadoMobile(false)
      this.rutinasService.actualizarEstado(false)
    //  this.ordenarRutina(agreed);
    }
  }

  starToStarringMode(){
    this.startMode = true;
    this.listStarred.forEach((element:rutina) => { this.startingList.push(element) })
  }

  putListDelete(rutina:rutina){
    if ( this.startMode ){
      let index = this.startingList.findIndex(item=> item._id === rutina._id);
      if ( index != -1 ) {this.startingList.splice(index,1)} else {
        this.startingList.push(rutina);
      }
    }
    if (this.deletingRutines) {
      let index = this.deletingList.findIndex(item=> item._id === rutina._id);
      if ( index != -1 ) {this.deletingList.splice(index,1)} else {
        this.deletingList.push(rutina);
      }
    };
  }

  addStarRutinas(){
    this.listStarred.forEach( async (ru:rutina, i) => {
      let index = this.startingList.findIndex(item => item._id === ru._id);
      if ( index === -1 ) {
        (await this.rutinasService.setFavorites(ru,0)).subscribe( (res:any) => {
          this.ordenarRutina(res);
          this.startingList.splice(index,1);
          this.listStarred.splice(i,1);
         })
      }
    });
    if (this.startingList.length <= 0){ this.startMode = false ;this.startingList = [] ;return };
    this.startingList.forEach( async (ru:rutina) => {
      let index = this.listStarred.findIndex(item => item._id === ru._id);
      if ( index != -1 ) { return };
      (await this.rutinasService.setFavorites(ru,1)).subscribe( (res:any) => {
        this.listStarred.push(res);
        let gm = this.listaRutinas.findIndex(item => item.grupoMuscular === res.grupoMuscular);
        let prevIndex = this.listaRutinas[gm].rutinas.findIndex(item => item._id === res._id);
        this.listaRutinas[gm].rutinas.splice(prevIndex,1);
        if ( this.listaRutinas[gm].rutinas.length <= 0 ) { this.listaRutinas.splice( gm, 1 ) };
      })
    });
    this.startMode = false ;this.startingList = [] ;
    this.alertService.showAlert("inf",'Rutinas actualizadas');
  }

  calcelarDelete(){
    this.deletingList = [];
    this.deletingRutines = false;
    this.startingList = [];
    this.startMode = false;
  }

  async deleteForeverAll(){
    this.deletingList.forEach( async (r:rutina) => {
      (await this.rutinasService.deleteRutina(r._id!)).subscribe((res:any) => {console.log(res)})
      let indexGrupo = this.listaRutinas.findIndex(item => item.grupoMuscular === r.grupoMuscular);
      let realIndex = this.listaRutinas[indexGrupo].rutinas.findIndex(item => item._id === r._id);
      this.listaRutinas[indexGrupo].rutinas.splice(realIndex,1);
      if ( this.listaRutinas[indexGrupo].rutinas.length <= 0 ){ this.listaRutinas.splice(indexGrupo,1) };
    })
    this.deletingRutines = false;
  }

  finInDeletingList(rutina:rutina){
    let index = this.deletingList.findIndex(item=> item._id === rutina._id);
    if ( index != -1 ) return true;
    return false;
  }

  finInStartingList(rutina:rutina){
    let index = this.startingList.findIndex(item=> item._id === rutina._id);
    if ( index != -1 ) return true;
    return false;
  }

  openShowExcercise(item:pseaudoEjerciicios){
    const ej = this.getExcercise(item);
    if (ej){
      const dialogRef = this.dialog.open(ShowExcerciseComponent, {data: ej});
      dialogRef.afterClosed().subscribe( async (result: any) => {
      });
    }
  }

  openShowExcerciseCircuito(exerCiruito:ejercicio){
    const ej = this.getExcerciseEJER(exerCiruito);
    const dialogRef = this.dialog.open(ShowExcerciseComponent, {data: ej});
    dialogRef.afterClosed().subscribe( async (result: any) => {
    });
  }

  editRutina(r:rutina, event:MouseEvent){
    event.stopPropagation();
    this.rutinasService.actualizarDayToAsign(`${r.name}--::--${r._id}`)
    this.rutinasService.newListEditEjercicios = r.ejercicios;
    if( !this.isSmallScreen ){this.rutinasService.actualizarEstado(true);}else{
      this.rutinasService.actualizarEstadoMobile(true)
    }
  }

  ngOnInit(){
    this.estadoReceptorNewRutina$.subscribe((estado) => {
      this.shoeMenuNew = estado;
    });

    this.estadoReceptorNewRutinaMobile$.subscribe((estado) => {
      this.shoeMenuNewMobile = estado;
    });

    this.rutinaToChange$.subscribe(( rutina:any ) => {
      if (rutina){
        let index = this.listStarred.findIndex(item => item._id === rutina._id);
        this.listStarred[index] = rutina;
      }
    })

    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
  }

}
