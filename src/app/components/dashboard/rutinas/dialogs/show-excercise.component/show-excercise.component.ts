import { Component, Inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { AlertService } from 'src/app/components/shared/alert.service';
import { ejercicio } from '../../interfaces/ejercicios.interface';
import { DialogOverviewExampleDialog } from '../../../usuarios-config/usuarios-config.component';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatNativeDateModule
  ],
  templateUrl: './show-excercise.component.html',
  styleUrls: ['./show-excercise.component.css']
})
export class ShowExcerciseComponent {

  public isSmallScreen: boolean = false;
  public error = '';
  public ejercicio : ejercicio;

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ejercicio,
    private breakpointObserver: BreakpointObserver,
    private alertService: AlertService
  ){
    this.ejercicio = data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
    this.dialogRef.backdropClick().subscribe(() => {
      this.onNoClick();
    });
  }

}
