import { Component, Inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DialogOverviewExampleDialog } from '../../../usuarios-config/usuarios-config.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ejercicio, pseaudoEjerciicios, rutina, rutinasMusculares } from '../../interfaces/ejercicios.interface';
import { RutinasService } from '../../rutinas.service';
import { AlertService } from 'src/app/components/shared/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
import { createNewRutinaDialogFakeComponent } from '../new-rutina-dialog/create-rutina-dialog.component';

@Component({
  selector: 'app-add-excercise',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule,
    MatSelectModule, CommonModule, MatIconModule, MatTooltipModule, MatExpansionModule,createNewRutinaDialogFakeComponent
  ],
  templateUrl: './adjuntRutna-dialog.component.html',
  styleUrls: ['./adjuntRutna-dialog.component.css']
})
export class adjuntRutnaComponent {

  public isSmallScreen: boolean = false;
  public gruposMusculares : string[] = [];
  public spinnerUpload = false;
  public messageError = '';
  public grupoMuscularText = '';
  public panelOpenState = false;
  public rutinasDescargadas = false;


  public listaRutinas : rutinasMusculares[] = [ ];
  public ejercicios : ejercicio[] = [];
  public rutinaSelect = '';
  public listStarred : rutina[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: rutinasMusculares[],
    private breakpointObserver: BreakpointObserver,
    private rutinasService : RutinasService,
    private alertService: AlertService,
  ) {
    this.inicio();
    if (data.length > 0){
      this.rutinasDescargadas = true;
      this.listaRutinas = data;
    }
  }

  public errorMsg = { e: false, m:'' };

  async inicio() {
    this.ejercicios = [];
    this.listaRutinas = [];
    (await (this.rutinasService.getAllRutinasStarred())).subscribe((res:any) => {
      this.listStarred = res;
    })

    this.getEjercicios();
  }

  async downloadAllRutinas(){
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

  getExcercise( itemEjer:pseaudoEjerciicios ){
    let index = this.ejercicios.findIndex(item => item._id === itemEjer.id);
    return this.ejercicios[index]
  }

  ordenarRutina( r:rutina ){
    let long = this.listaRutinas.length;
    let contador = 0;
    this.listaRutinas.forEach((x) => {
      if ( r.grupoMuscular != x.grupoMuscular ) {contador++} //{this.gruposMusculares.push( { name: e.grupoMuscular, ejercicios: [] } )}
      if ( r.grupoMuscular === x.grupoMuscular ) {x.rutinas.push(r);}
    });
    if ( contador === long ) { this.listaRutinas.unshift( { grupoMuscular: r.grupoMuscular, rutinas: [r] } ) };
  }

  async subir(){
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

  submitForm() {
    if ( this.rutinaSelect != '' ){
      this.dialogRef.close({ exit: true, rutina:this.rutinaSelect });
      return;
    }
    this.alertService.showAlert("danger", "Debe seleccionar una rutina o crear una nueva")
  }

  createNewRutina(){
    this.onNoClick(false, true);
  }

  onNoClick( e: boolean = false, newR:boolean = false ): void {
    this.dialogRef.close({ exit: e, rutinas:this.listaRutinas, newR });
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    // Suscribirse al evento de clic en el fondo del diálogo
  this.dialogRef.backdropClick().subscribe(() => {
    this.onNoClick(false);
  });
  }

}
