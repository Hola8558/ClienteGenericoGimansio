import { Component, Inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DialogOverviewExampleDialog } from '../../../dashboard/usuarios-config/usuarios-config.component';
import { ejercicio, pseaudoEjerciicios, rutina, rutinasMusculares } from '../../interfaces/ejercicios.interface';
import { RutinasService } from '../../services/rutinas.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDeleteRuinaComponent } from '../confirm-delete.component/confirm-delete.component';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatNativeDateModule, MatExpansionModule, MatIconModule
  ],
  templateUrl: './newRutina-or-previous.component.html',
  styleUrls: ['./newRutina-or-previous.component.css']
})
export class newRutinaOrPrevious {

  public isSmallScreen: boolean = false;
  public error = '';
  public listaRutinas : rutinasMusculares[] = [ ];
  public ejercicios : ejercicio[] = [];
  public listStarred : rutina[] = [];
  public rutinasDescargadas = false;
  public panelOpenState = false;
  public rutinaSelect = '';
  public form  : FormGroup;
  public diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {r:{Lunes:rutina, Martes:rutina, Miercoles:rutina,Jueves:rutina,Viernes:rutina,Sabado:rutina}},
    private breakpointObserver: BreakpointObserver,
    private rutinasService : RutinasService,
    private fb: FormBuilder,
    public dialog: MatDialog,
  ){

    this.form = this.fb.group({
      diaSelect: [''],
    })
    this.inicio()
  }

  onNoClick( exit:number = 0 ): void {
    if ( exit === 0 ){
      this.dialogRef.close( { exit:exit, selected:'', day: '' } );
    }
    let rutinaElimnar : rutina = {name:'',grupoMuscular:'',ejercicios:[]}
    if ( this.form.get("diaSelect")?.value === '' && this.rutinaSelect != '' ){ this.error = 'Debe seleccionar un día y una rutina o crear una nueva'; return }
    if ( this.form.get("diaSelect")?.value === 'Lunes' ){ rutinaElimnar = this.data.r.Lunes}
    if ( this.form.get("diaSelect")?.value === 'Martes' ){ rutinaElimnar = this.data.r.Martes}
    if ( this.form.get("diaSelect")?.value === 'Miercoles' ){ rutinaElimnar = this.data.r.Miercoles}
    if ( this.form.get("diaSelect")?.value === 'Jueves' ){ rutinaElimnar = this.data.r.Jueves}
    if ( this.form.get("diaSelect")?.value === 'Viernes' ){ rutinaElimnar = this.data.r.Viernes}
    if ( this.form.get("diaSelect")?.value === 'Sabado' ){ rutinaElimnar = this.data.r.Sabado}

    if ( rutinaElimnar && rutinaElimnar.favorites && rutinaElimnar.favorites === 1 && exit != 0){ this.dialogRef.close( { exit:exit, selected:this.rutinaSelect, day: this.form.get("diaSelect")?.value } ); } else {
      if ( rutinaElimnar && exit != 0 && exit != 1 ){
        const dialogRef = this.dialog.open(ConfirmDeleteRuinaComponent);
        dialogRef.afterClosed().subscribe( async (result: {exit:boolean}) => {
          (await this.rutinasService.deleteRutina(rutinaElimnar._id!)).subscribe((res:any) => {});
        })
      }
      this.dialogRef.close( { exit:exit, selected:this.rutinaSelect, day: this.form.get("diaSelect")?.value } );
    }


  }

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

  ordenarRutina( r:rutina ){
    if (!r) return;
    if ( this.data.r.Lunes && r._id === this.data.r.Lunes._id ) return;
    if ( this.data.r.Martes && r._id === this.data.r.Martes._id ) return;
    if ( this.data.r.Miercoles && r._id === this.data.r.Miercoles._id ) return;
    if ( this.data.r.Jueves && r._id === this.data.r.Jueves._id ) return;
    if ( this.data.r.Viernes && r._id === this.data.r.Viernes._id ) return;
    if ( this.data.r.Sabado && r._id === this.data.r.Sabado._id ) return;
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

  async getEjercicios(){
    /**EJERCICIOS */
    (await this.rutinasService.getAllEjercicios()).subscribe(
      ( res: any ) => {
        for ( let e of res ){
          this.ejercicios.push(e);
        };
      },
      ( err : any ) => {
        this.error = err.error.message;
      }
    );
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });

    this.dialogRef.backdropClick().subscribe(() => {
      this.onNoClick(0);
    });
  }

}
