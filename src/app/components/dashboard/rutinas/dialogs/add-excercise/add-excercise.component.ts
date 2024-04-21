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
import { ejercicio } from '../../interfaces/ejercicios.interface';
import { RutinasService } from '../../rutinas.service';
import { AlertService } from 'src/app/components/shared/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-add-excercise',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule,
    MatSelectModule, CommonModule, MatIconModule, MatTooltipModule
  ],
  templateUrl: './add-excercise.component.html',
  styleUrls: ['./add-excercise.component.css']
})
export class AddExcerciseComponent {

  public isSmallScreen: boolean = false;
  public form  : FormGroup;
  public gruposMusculares : string[] = [];
  public spinnerUpload = false;
  public messageError = '';
  public grupoMuscularText = '';

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver,
    private fb: FormBuilder,
    private rutinasService : RutinasService,
    private alertService: AlertService,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      url: ['', Validators.required],
      grupoMuscular: ['', Validators.required],
      description: ['', Validators.required],
      grupoMuscularText:['null',Validators.required]
    })
    this.inicio();
  }

  public errorMsg = { e: false, m:'' };

  async inicio() {
    this.gruposMusculares = [];
    (await this.rutinasService.getAllEjercicios()).subscribe(
      ( res: any ) => {
        for ( let e of res ){
          this.gruposMusculares.push(e.grupoMuscular)
        }
        this.gruposMusculares = [...new Set(this.gruposMusculares)]
        this.gruposMusculares.push("Agregar")
      },
      ( err : any ) => {
        this.errorMsg.e = true;
        this.errorMsg.m = err.error.message;
        this.alertService.showAlert("danger","Error", 2000);
      }
    );
  }

  async subir(){
    this.spinnerUpload = true;

    const { nombre, url, description, grupoMuscular, grupoMuscularText } : { nombre: string, url: string, description: string, grupoMuscular: string, grupoMuscularText: string } = this.form.value;
    let ejercicio : ejercicio = { nombre, url, description, grupoMuscular };

    if ( grupoMuscularText != 'null' && grupoMuscular === 'Agregar' ) { ejercicio.grupoMuscular = grupoMuscularText };

    (await this.rutinasService.addEjercicio( ejercicio )).subscribe(
      (res : any) => {
        this.onNoClick( true );
      },
      (err : any) => {

        if (err.error && err.error.message) {
          this.messageError = err.error.message;
        } else {
          this.messageError = 'Error desconocido';
        }

        this.alertService.showAlert("w", "Error", 5000);
        setTimeout(() => {
          this.spinnerUpload = false;
          this.messageError = '';
        }, 1500)

      }
    )
  }

  submitForm() {
    if (this.form.valid) {
      this.subir(); // Llama a la función del formulario si el formulario es válido
    };
  }

  cancelarNuevoGrupoMuscular() {
    this.form.get('grupoMuscular')?.setValue(null); // Reinicia la selección
    this.grupoMuscularText = ''; // Puedes ajustar esto según tus necesidades
  }

  onNoClick( e: boolean = false ): void {
    this.dialogRef.close({ exit: e });
  }


  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });

    this.form.get('grupoMuscular')?.valueChanges.subscribe((frupo) => {
      this.form.get('grupoMuscularText')?.setValue(frupo === 'Agregar' ? '' : this.form.get('grupoMuscularText')?.value);
    });
  }

}
