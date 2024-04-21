import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { SocioDashboardComponent } from './socios-dashboard.component';
import { SocioDashboardRoutingModule } from './socios-dashboard-routing.module';
import { CalendarComponent } from './calendar/calendar.component';
import { RutinasComponent } from './rutinas/rutinas.component';
import { MatSelectModule } from '@angular/material/select';



@NgModule({
  declarations: [NavbarComponent,SocioDashboardComponent, RutinasComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    SocioDashboardRoutingModule,
    CalendarComponent,
    MatSelectModule

  ], exports:[SocioDashboardComponent,CalendarComponent]
})
export class SociosDashboardModule { }
