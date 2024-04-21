import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { InicioComponent } from './inicio/inicio.component';
import { SocioDashboardComponent } from './socios-dashboard.component';
import { RutinasComponent } from './rutinas/rutinas.component';

const routes: Routes=[
  {
    path: '', component:SocioDashboardComponent, children : [
      {
        path:'', component:InicioComponent, data: { title: 'Inicio' }
      },
      {
        path:'rutinas', component: RutinasComponent, data: { title: 'Rutinas' }
      },

    ]
  },
  {
    path:'rutinas', component: RutinasComponent, data: { title: 'Rutinas' }
  },
];

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocioDashboardRoutingModule {

}
