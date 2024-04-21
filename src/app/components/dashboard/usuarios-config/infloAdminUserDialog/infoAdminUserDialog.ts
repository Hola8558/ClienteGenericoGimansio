import { CommonModule, NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DialogOverviewExampleDialog } from '../usuarios-config.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LoginService } from 'src/app/components/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserData } from '../interfaces/usuarios.interface';

@Component({
  selector: 'app-info-admin-users-dialog',
  templateUrl: './info-admin-users-dialog.component.html',
  styleUrls: ['./info-admin-users-dialog.css'],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, CommonModule, NgClass, MatProgressSpinnerModule],
})
export class infoAdminUserDialog {

  public isSmallScreen: boolean = false;
  public errorNoMatchPass = false;
  public spinnerUpload = false;
  public changePass = false;
  public messageError = '';
  public _id = '';

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserData,
    private breakpointObserver: BreakpointObserver,
    private loginService : LoginService,
    private _snackBar: MatSnackBar
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async deleteUser(){

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
