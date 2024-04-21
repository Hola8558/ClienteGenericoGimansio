import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path:'login', component:LoginComponent
  },
  {
    path:'dashboard', loadChildren: () => import( './components/dashboard/dashboard.module' ).then(x => x.DashboardModule), canActivate: [ AuthGuard ]
  },
  {
    path:'socios-SportHouse', loadChildren: () => import( 'src/app/components/socios-dashboard/socios-dashboard.module' ).then(x => x.SociosDashboardModule)//, canActivate: [ AuthGuard ]
  },
  {
    path:'', redirectTo:'login', pathMatch: 'full'
  },
  {
    path:'**', redirectTo:'login', pathMatch: 'full'
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
