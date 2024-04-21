import { Component, OnInit } from '@angular/core';
import { Tile, ejercicio, grupoMuscular } from '../interfaces/ejercicios.interface';
import { MatDialog } from '@angular/material/dialog';
import { AddExcerciseComponent } from '../dialogs/add-excercise/add-excercise.component';
import { AlertService } from 'src/app/components/shared/alert.service';
import { RutinasService } from '../rutinas.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ConfirmDeleteComponentEjercicio } from '../dialogs/confirm-delete/confirm-delete.component';
import { EditExcerciseComponent } from '../dialogs/edit-excercise/edit-excercise.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export const sliderAnimation = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('500ms ease-in', style({ transform: 'translateX(0%)' })),
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0%)' }),
    animate('500ms ease-out', style({ transform: 'translateX(-100%)' })),
  ]),
]);

@Component({
  selector: 'app-ejercicios',
  templateUrl: './ejercicios.component.html',
  styleUrls: ['./ejercicios.component.css'],
  animations: [sliderAnimation],
})
export class EjerciciosComponent implements OnInit {

  public gruposMusculares : grupoMuscular[] = [];
  public errorMsg = { e: false, m:'' };
  public showExercise = {s: false, _id:'', title:'', desc:'', url:''};
  public tarjeta_ejercicio = false;
  public errorTarjetaExc = { e: false, m:'' };
  public isSmallScreen = false;

  constructor( public dialog: MatDialog, private alertService: AlertService, private rutinasService : RutinasService, private breakpointObserver: BreakpointObserver ){
    this.inicio();
  }

  async inicio() {
//    setTimeout((x:any) => {
//      localStorage.removeItem("pestanaRutinas")
//      localStorage.setItem("pestanaRutinas", "ejercicios");
//    },10);
    this.gruposMusculares = [];
    (await this.rutinasService.getAllEjercicios()).subscribe(
      ( res: any ) => {
        for ( let e of res ){
          let long = this.gruposMusculares.length;
          let contador = 0;
          this.gruposMusculares.forEach((x) => {
            if ( e.grupoMuscular != x.name ) {contador++} //{this.gruposMusculares.push( { name: e.grupoMuscular, ejercicios: [] } )}

            if ( e.grupoMuscular === x.name ) {x.ejercicios.push(e);}
          });
          if ( contador === long ) { this.gruposMusculares.push( { name: e.grupoMuscular, ejercicios: [e] } ) }
        };
      },
      ( err : any ) => {
        this.errorMsg.e = true;
        this.errorMsg.m = err.error.message;
        this.alertService.showAlert("danger","Error", 2000);
      }
    );

    let item = localStorage.getItem("viewEjercicio");
    if (item){
      (await this.rutinasService.getOneExcercise(item)).subscribe(
        (res: any) => {
          this.tarjeta_ejercicio = true;
          this.showExercise = { s:true, _id:res._id, title:res.nombre, desc:res.description, url:res.url };
        },
        (err : any) => {
          this.errorTarjetaExc.e = true;
          this.errorTarjetaExc.m = err.error.message;
        }
      )
    }
  }

  public tiles: Tile[] = [
    {text: 'One', cols: 1, rows: 1, color: 'rgba(44, 168, 128, 0.7)'},
    {text: 'Two', cols: 2, rows: 1, color: 'rgba(122, 211, 190, 0.7)'}
  ];

  viewEjercicio( i : number, o : number){
    let e : ejercicio = this.gruposMusculares[i].ejercicios[o];
    this.tarjeta_ejercicio = true;
    this.showExercise = { s:true, _id:e._id!, title:e.nombre, desc:e.description, url:e.url };
    localStorage.setItem("viewEjercicio", `${e._id}`);
  }

  closeTarjetaE(){
    localStorage.removeItem("viewEjercicio");
    this.showExercise.s = false;
    setTimeout(
      (x:any) => {
        this.tarjeta_ejercicio = false;
      }, 400
    )
  }

  editarEjercicio(_id : string){
    const dialogRef = this.dialog.open(EditExcerciseComponent, {
      data: {_id}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.exit){
        this.alertService.showAlert("inf", "Actualizado correctamente", 2000);
        this.inicio();
      }
    });
  }

  eliminarEjercicio(_id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteComponentEjercicio, {
      data: {_id}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.alertService.showAlert("inf", "Eliminado correctamente", 2000);
        this.closeTarjetaE();
        this.inicio();
        localStorage.removeItem("viewEjercicio");
      }
    });
  }

  sliceButton( number : number, indice : number ){
    if ( number === 1 ){
      this.gruposMusculares[indice].ejercicios.push(this.gruposMusculares[indice].ejercicios[0]);
      this.gruposMusculares[indice].ejercicios.splice(0,1);
      return;
    }
    this.gruposMusculares[indice].ejercicios.unshift(this.gruposMusculares[indice].ejercicios[ this.gruposMusculares[indice].ejercicios.length-1 ]);
    this.gruposMusculares[indice].ejercicios.pop();
  }

  addNewExcercise(): void {
    const dialogRef = this.dialog.open(AddExcerciseComponent);

    dialogRef.afterClosed().subscribe(result => {
      if ( result.exit ) {
        this.alertService.showAlert("suc","Ejercicio creado", 2000);
        this.inicio();
      }
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

}
