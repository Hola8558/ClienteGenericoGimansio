import { Component, Inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DialogOverviewExampleDialog } from '../../../usuarios-config/usuarios-config.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ClientService } from '../../clientes.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { AlertService } from 'src/app/components/shared/alert.service';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatNativeDateModule
  ],
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.css']
})
export class ConfirmDeleteComponent {

  public isSmallScreen: boolean = false;
  public error = '';

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private breakpointObserver: BreakpointObserver,
    private clientService : ClientService,
    private alertService: AlertService
  ){}

  onNoClick( succes:boolean ): void {
    this.dialogRef.close( succes );
  }

  async deleteUser(){
    (await this.clientService.deleteClients(this.data._id)).subscribe(
      res => {this.onNoClick(true)},
      err => {
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error desconocido';
        }

        this.alertService.showAlert("w", "Error", 5000);
        setTimeout(() => {
          this.error = '';
        }, 1500)
      }
    )

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
