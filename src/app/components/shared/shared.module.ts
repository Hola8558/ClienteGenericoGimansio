import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//ANGULAR MATERIAL
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import {CdkDrag, CdkDropList, CdkDropListGroup, DragDropModule} from '@angular/cdk/drag-drop';
import {MatChipsModule} from '@angular/material/chips';
import {MatTabsModule} from '@angular/material/tabs';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { MatRippleModule } from '@angular/material/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatRadioModule} from '@angular/material/radio';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    MatChipsModule,
    MatTabsModule,
    MatGridListModule,
    MatCardModule,
    ScrollingModule,
    MatRippleModule,
    MatExpansionModule,
    MatDividerModule,
    CdkDropListGroup, CdkDropList, CdkDrag,
    MatProgressBarModule,
    MatRadioModule,
    MatPaginatorModule,
    MatSelectModule,

  ],
  exports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    MatChipsModule,
    MatTabsModule,
    MatGridListModule,
    MatCardModule,
    ScrollingModule,
    MatRippleModule,
    MatExpansionModule,
    MatDividerModule,
    CdkDropListGroup, CdkDropList, CdkDrag,
    MatProgressBarModule,
    MatRadioModule,
    MatPaginatorModule,
    MatSelectModule,

  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' } // Configura el formato de fecha deseado (por ejemplo, 'es-ES' para formato DD/MM/YYYY)
  ],
})
export class SharedModule { }
