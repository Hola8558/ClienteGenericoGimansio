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

@Component({
  selector: 'app-delete-users-dialog',
  templateUrl: './delete-users-dialog.component.html',
  //styleUrls: ['./delete-users-dialog.component.css']
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, CommonModule, NgClass, MatProgressSpinnerModule],
})
export class DeleteUsersDialogComponent {

  public isSmallScreen: boolean = false;
  public errorNoMatchPass = false;
  public spinnerUpload = false;
  public changePass = false;
  public messageError = '';
  public _id = '';

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private breakpointObserver: BreakpointObserver,
    private loginService : LoginService,
    private _snackBar: MatSnackBar
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async deleteUser(){
    this.spinnerUpload = true;

    (await this.loginService.deleteAdminUser( this.data )).subscribe(
      res =>{
        this.onNoClick();
        this._snackBar.open('Administrador Eliminado', '', {
          duration: 1300
        });
      },
      err => {
        this.messageError = err.error.message;
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
