import { Component, Inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DialogOverviewExampleDialog } from '../../../usuarios-config/usuarios-config.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ejercicio } from '../../interfaces/ejercicios.interface';
import { RutinasService } from '../../rutinas.service';
import { AlertService } from 'src/app/components/shared/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-add-excercise',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule,
    MatSelectModule, CommonModule, MatIconModule, MatTooltipModule, MatExpansionModule
  ],
  templateUrl: './adjuntExcercise-dialog.component.html',
  styleUrls: ['./adjuntExcercise-dialog.component.css']
})
export class adjuntExcerciseComponent {

  public isSmallScreen: boolean = false;
  public spinnerUpload = false;
  public messageError = '';
  public panelOpenState = false;

  public ejercicios : ejercicio[] = [];
  public ejerciciosConfirmation : ejercicio[] = [];
  public addExcercise : ejercicio[] = []


  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {e:ejercicio[]},
    private breakpointObserver: BreakpointObserver,
    private rutinasService : RutinasService,
    private alertService: AlertService,
  ) {
    this.inicio();
  }

  public errorMsg = { e: false, m:'' };

  async inicio() {
    this.ejercicios = [];
    this.data.e.forEach((e:ejercicio) => {
      this.ejercicios.push(e)
    })
    this.ejerciciosConfirmation = this.ejercicios;
  }

  addExcerciseFun( ejr:ejercicio ){
    let index = this.addExcercise.findIndex(item => item._id === ejr._id);
    if (index != -1) {
      this.addExcercise.splice(index,1);
    }else{
      this.addExcercise.push(ejr);
    }
  }

  isInList(_id:string){
    let index = this.addExcercise.findIndex(item => item._id === _id);
    if ( index != -1 ){return true}
    return false;
  }

  submitForm() {
    this.dialogRef.close({ exit: true, ejercicios:this.addExcercise});
  }

  onNoClick( e: boolean = false ): void {
    this.dialogRef!.close({ exit: e, ejercicios:[] });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    let lista : ejercicio[] = []
    this.ejerciciosConfirmation.forEach(e => {
      if (e.nombre.toLowerCase().startsWith(filterValue.toLowerCase())){ lista.push(e) }
    })
    this.ejercicios = lista
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
