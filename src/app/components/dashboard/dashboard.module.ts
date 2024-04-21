import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

import { RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SharedModule } from '../shared/shared.module';
import { UsuariosConfigComponent } from './usuarios-config/usuarios-config.component';
import { CdkBolsaInfoClientComponent } from './inicio/components/cdk-bolsa-info-client/cdk-bolsa-info-client.component';
import { CalendarComponent } from './inicio/components/calendar/calendar.component';
import { MenuDesarolladores } from './menu_desarrolladores/menuDesarrolladores.component';
import { RutinasComponent } from './rutinas/rutinas.component';
import { RutinasListComponent } from './rutinas/rutinas-list/rutinas-list.component';
import { EjerciciosComponent } from './rutinas/ejercicios/ejercicios.component';
import { RutinasAsignadosComponent } from './rutinas/rutinas-asignados/rutinas-asignados.component';
import { createNewRutinaDialogFakeComponent } from './rutinas/dialogs/new-rutina-dialog/create-rutina-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { EntradaSociosComponent } from './entrada-socios/entrada-socios.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';


@NgModule({
  declarations: [
    DashboardComponent,
    InicioComponent,
    NavbarComponent,
    UsuariosConfigComponent,
    CdkBolsaInfoClientComponent,
    MenuDesarolladores,
    RutinasComponent,
    RutinasListComponent,
    EjerciciosComponent,
    RutinasAsignadosComponent,
    EntradaSociosComponent,

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    RouterModule,
    SharedModule,
    CalendarComponent,
    createNewRutinaDialogFakeComponent
  ],
  exports: [DashboardComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' } // Configura el formato de fecha deseado (por ejemplo, 'es-ES' para formato DD/MM/YYYY)
  ],
})
export class DashboardModule {
}
