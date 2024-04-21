import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { AlertService } from 'src/app/components/shared/alert.service';
import { ClientService } from '../../inicio/clientes.service';
import { clientsRutinas, downloadClient } from '../../inicio/interfaces/download-client.interface';
import { MatDialog } from '@angular/material/dialog';
import { adjuntRutnaComponent } from '../dialogs/adjuntRutna-dialog/adjuntRutna-dialog.component';
import { RutinasService } from '../rutinas.service';
import { rutina, rutinasMusculares } from '../interfaces/ejercicios.interface';
import { createNewRutinaDialogFakeComponent } from '../dialogs/new-rutina-dialog/create-rutina-dialog.component';

@Component({
  selector: 'app-rutinas-asignados',
  templateUrl: './rutinas-asignados.component.html',
  styleUrls: ['./rutinas-asignados.component.css']
})
export class RutinasAsignadosComponent {

  constructor(private clientesService : ClientService, private rutinasService : RutinasService, private breakpointObserver: BreakpointObserver, private alertService: AlertService,public dialog: MatDialog){

    this.inicio()
  }

  public clientes : clientsRutinas[] = [];
  public clientesConfirmation : clientsRutinas[] = [];
  public panelOpenState = false;
  public diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  public isSmallScreen = false;
  public shoeMenuNewMobile = false;
  public estadoReceptorNewRutinaMobile$ = this.rutinasService.estadoMenuShowRutinaMobile$;

  public socioSelected = '';
  public daySelecter = '';

  async inicio(){
    this.clientes = [];
    (await this.clientesService.getAllClients()).subscribe(
      (res : any) => {
        res.forEach((e:downloadClient) => {
          let ruti = { l: '', M: '', Mi: '', J: '', V: '', S: '', };
          if ( e.rutinas ){
            ruti = e.rutinas
          }
          this.clientes.push({nombre:e.nombre, apellidos:e.apellidos,_id:e._id,ncuenta:e.ncuenta,rutinas:ruti});
        });
        this.clientesConfirmation = this.clientes;
      }
    )
  }

  getRutinasL(client : clientsRutinas){
    let nu = 0;
    if ( client.rutinas?.l != '' ){ nu++ };
    if ( client.rutinas?.M != '' ){ nu++ };
    if ( client.rutinas?.Mi != '' ){ nu++ };
    if ( client.rutinas?.J != '' ){ nu++ };
    if ( client.rutinas?.V != '' ){ nu++ };
    if ( client.rutinas?.S != '' ){ nu++ };
    return nu;
  }

  getRutinaComplete(c:clientsRutinas, d:string):string{
    if ( d === 'Lunes' && c.rutinas ){return c.rutinas?.l};
    if ( d === 'Martes' && c.rutinas ){return c.rutinas?.M};
    if ( d === 'Miercoles' && c.rutinas ){return c.rutinas?.Mi};
    if ( d === 'Jueves' && c.rutinas ){return c.rutinas?.J};
    if ( d === 'Viernes' && c.rutinas ){return c.rutinas?.V};
    if ( d === 'Sabado' && c.rutinas ){return c.rutinas?.S};
    return ''
  }

  public c = false;
  async getRutinadownload(cliente : clientsRutinas, day:string){
    let text = '';
    if (this.c === false){
      let id = this.getRutinaComplete(cliente, day);
    //(await )


    if(id != ''){
      (await (this.rutinasService.getResumenRutina(id))).subscribe(
        (res:any) => {
          console.log(res.name);
          text = res.name
        }
      )
    }
    this.c = true
    }
    return text

  }

  public listaRutinas : rutinasMusculares[] = [ ];

  addRutinaSocio(d : string): void {
    this.daySelecter = d;
    const dialogRef = this.dialog.open(adjuntRutnaComponent, {data:this.listaRutinas});

    dialogRef.afterClosed().subscribe(result => {
      if ( result.exit ) {
        this.alertService.showAlert("suc","Rutina añadida", 2000);
        this.saveRutina(result.rutina);
      }
      if (((result.rutinas) as rutinasMusculares[]).length > 0){
        this.listaRutinas = ((result.rutinas) as rutinasMusculares[]);
        return
      }
      if (result.newR === true){
        this.createNewRutinaForSocio(d);
      }
    });
  }

  createNewRutinaForSocio(d:string){
    this.rutinasService.actualizarDayToAsign(`${d}--::--${this.socioSelected}`)
    if( !this.isSmallScreen ){this.rutinasService.actualizarEstado(true);}else{
      this.rutinasService.actualizarEstadoMobile(true)
    }
  }

  async saveRutina(rutina:string){
    (await (this.rutinasService.setRutinaToClient(this.socioSelected, this.daySelecter, rutina))).subscribe((res:any) => {
      let index = this.clientes.findIndex(item=> item._id === this.socioSelected);
      this.clientes[index].rutinas = res.rutinas;
    }, (err: any) => {
      this.alertService.showAlert('danger', `${err.error.message}`);
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    let lista : clientsRutinas[] = []
    this.clientesConfirmation.forEach(e => {
      if (e.nombre.toLowerCase().startsWith(filterValue.toLowerCase())){ lista.push(e) }
    })
    this.clientes = lista
  }

  onClosed(agreed: rutina) {
    if (agreed) {
      this.rutinasService.actualizarEstadoMobile(false);
      this.rutinasService.actualizarEstado(false);
    //  this.ordenarRutina(agreed);
    }
    this.rutinasService.actualizarEstadoMobile(false);
      this.rutinasService.actualizarEstado(false);
  }

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });

    this.estadoReceptorNewRutinaMobile$.subscribe((estado) => {
      this.shoeMenuNewMobile = estado;
    });

    this.rutinasService.newAddedRutina$.subscribe((res:any) => {
      if (res != undefined){
        let index = this.clientes.findIndex(item=> item._id === this.socioSelected);
        if (res.rutinas)
        this.clientes[index].rutinas = res.rutinas;
      }
    });
  }


}
