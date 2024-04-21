import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from './dashboard.component';
import { InicioComponent } from './inicio/inicio.component';
import { UsuariosConfigComponent } from './usuarios-config/usuarios-config.component';
import { MenuDesarolladores } from './menu_desarrolladores/menuDesarrolladores.component';
import { RutinasComponent } from 'src/app/components/dashboard/rutinas/rutinas.component';
import { EntradaSociosComponent } from './entrada-socios/entrada-socios.component';

const routes: Routes=[
  {
    path: '', component:DashboardComponent, children : [
      {
        path:'', component:InicioComponent, data: { title: 'Inicio' }
      },
      {
        path: 'opciones_administrador', component: MenuDesarolladores
      },
      {
        path: 'rutinas', component: RutinasComponent, data: { title: 'Rutinas' }
      },
      {
        path:'usuarios-config', component: UsuariosConfigComponent, data: { title: 'Usuarios' }
      },
      {
        path:'entrada-socios', component: EntradaSociosComponent, data: { title: 'EntradaSocios' }
      },
    ]
  }
];

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {

}
