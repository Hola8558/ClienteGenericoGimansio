import { Component, HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { downloadClient } from '../inicio/interfaces/download-client.interface';
import { ClientService } from './menuDesarrolladores.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RenewMensualidadDialogComponent } from '../inicio/dialogs/renewMensualidad/renew-mensualidad-dialog.component';
import { AlertService } from '../../shared/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../inicio/dialogs/confirm-delete/confirm-delete.component';
import { EditClientDialogComponent } from '../inicio/dialogs/edit-client-dialog/edit-client-dialog.component';

@Component({
  selector: 'app-menu-desarrolladores',
  templateUrl: './menuDesarrolladores.component.html',
  styleUrls: ['./menuDesarrolladores.component.css']
})

export class MenuDesarolladores {

  constructor(public route: ActivatedRoute,
    public router: Router,
    private clientesService : ClientService,
    private breakpointObserver: BreakpointObserver,
    private alertService: AlertService,
    public dialog: MatDialog,
    ) {
    this.inicio();
    localStorage.setItem("entradaInicio", "1")

    if (localStorage.getItem("entradaAdmin")) {
      this.applyAnimationToRigth = true;
      setTimeout(() => {
        this.applyAnimationToRigth = false;
        localStorage.removeItem("entradaAdmin");
      }, 500);
    }
   }

  public posX : number = 0;
  public posY : number = 0;
  public clientes : downloadClient[] = [];
  public displayedColumns: string[] = [' ','Número de Cuenta', 'Foto', 'Nombre', 'Información', 'Opciones'];
  public displayedColumnsSmall: string[] = [' ', 'Información', 'Opciones'];
  public dataSource = new MatTableDataSource(this.clientes);
  public elementClientShow : { show : string, posX : number, posY: number, aplicarAnimacion: string, _id: string, changeInfo : string } = {
    show: 'void', posX: this.posX, posY: this.posY, aplicarAnimacion: 'void', _id:'', changeInfo:'void' };
  public isSmallScreen: boolean = false;

  @HostListener('mousemove', ['$event']) onMouseMove(event : any) {
    this.posX = event.clientX;
    this.posY = event.clientY;
  }

  public applyAnimationToRigth: boolean = false;

  async inicio(){
    (await this.clientesService.getAllClients()).subscribe(
      (res : any) => {
        this.clientes = res;
        this.clientes = this.clientes.map(cliente => {
          return{
            ...cliente,
            fechaVencimiento : this.getRealDate(cliente.fechaVencimiento)
          };
        });

        this.clientes = this.formterClientsStatus( res );
        this.clientes = this.clientes.map(cliente => {
          return{
            ...cliente,
            ultimoPago : this.getRealDate(cliente.ultimoPago)
          };
        });

        this.dataSource = new MatTableDataSource(this.clientes);
      }
    );
  }

  async filtrar(){
    //await this.inicio();

    let filteredClientes = [...this.clientes]; // Crear una copia para mantener la inmutabilidad

    if (!this.filtrosLista[0]) {
      filteredClientes = filteredClientes.filter(cliente => cliente.fechaVencimiento !== 'vigente');
    }

    if (!this.filtrosLista[2]) {
      filteredClientes = filteredClientes.filter(cliente => cliente.fechaVencimiento !== '1semana');
    }

    if (!this.filtrosLista[1]) {
      filteredClientes = filteredClientes.filter(cliente => cliente.fechaVencimiento !== 'deBaja');
    }

    if (!this.filtrosLista[3]) {
      filteredClientes = filteredClientes.filter(cliente => cliente.tipoMensualidad !== 'Estudiante');
    }

    if (!this.filtrosLista[4]) {
      filteredClientes = filteredClientes.filter(cliente => cliente.tipoMensualidad !== 'General');
    }

    if (!this.filtrosLista[5]) {
      filteredClientes = filteredClientes.filter(cliente => cliente.tipoMensualidad.split('-./()/.-')[0] !== 'Convenio');
    }

    this.dataSource = new MatTableDataSource(filteredClientes);
  }

  deleteCliente(event: MouseEvent, _id:string){
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: {_id}
    });
    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        this.inicio();
        this.alertService.showAlert("danger","Cliente eliminado", 2000);
      }
    });
  }

  editarCliente(event: MouseEvent, _id:string){
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditClientDialogComponent, {
      data: {_id}
    });
    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        this.inicio();
        this.alertService.showAlert("inf","Informacion actualizada correctamente", 2000);
      }
    });
  }

  public filtrosLista : boolean[] = [true, true, true, true, true, true]
  onChipSelectionChange(num: number): void {
    this.filtrosLista[num] = !this.filtrosLista[num];

    let c = 0;
    this.filtrosLista.map( (x) => {
      if ( x === false ) c++
    });

    if (c === 6) this.filtrosLista.map((x,i) => { this.filtrosLista[i] = true }); c = 0;

    this.filtrar();
  }

  formterClientsStatus(res: downloadClient[]) {
    let ret: downloadClient[] = res;
    ret.forEach((c, i) => {
      const fechaObjeto: Date = this.convertirFecha(c.fechaVencimiento);
      const milisegundosPorDia: number = 24 * 60 * 60 * 1000; // 1 día en milisegundos
      const fechaActual: Date = new Date();
      const diferenciaMilisegundos: number = fechaObjeto.getTime() - fechaActual.getTime();
      const diferenciaDias: number = (Math.floor(diferenciaMilisegundos / milisegundosPorDia)) + 1;
      if (diferenciaDias > 0) {
        if (diferenciaDias <= 7 && diferenciaDias >= 0) {
          ret[i] = { ...ret[i], fechaVencimiento: '1semana' };
        } else {
          ret[i] = { ...ret[i], fechaVencimiento: 'vigente' };
        }

      } else {
        ret[i] = { ...ret[i], fechaVencimiento: 'deBaja' };
      }
    });

    return ret;
  }

  convertirFecha(fechaString: string): Date {
    return new Date(fechaString);
  }

  getRealDate( fechaString : string ) : string {
    const fecha = new Date(fechaString);
    // Obtén los componentes de la fecha
    const dia = fecha.getDate();
    const mes = fecha.toLocaleString('default', { month: 'long' });
    const anio = fecha.getFullYear();
    // Crea el texto en el formato deseado
    const textoFecha = `${dia} de ${mes} de ${anio}`;

    return textoFecha;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  sendDataViewClient(_id: string){
    if (_id != this.elementClientShow._id && this.elementClientShow.show === 'show') {
      this.elementClientShow = {
        ...this.elementClientShow,
        _id, // Actualizar el _id
        aplicarAnimacion: 'void',
        changeInfo: 'show',
        show: 'show'
      };
      return;
    }

    if (_id === '' || this.elementClientShow.show === 'void') {
      this.elementClientShow = {
        show: 'show',
        posX: this.posX,
        posY: this.posY,
        aplicarAnimacion: 'void',
        _id,
        changeInfo: 'void'
      };
      return;
    }
  }

  renovarMembresia(element:downloadClient){
    let _id = element._id
    const dialogRef = this.dialog.open(RenewMensualidadDialogComponent, {
      data: {_id}
    });
    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        this.inicio();
        this.alertService.showAlert("p","Mensualidad renovada", 2000);
      }
    });
  }

  getColor(element: any): string {
    if (element.fechaVencimiento === 'vigente') return '9px solid #228B22';
    if (element.fechaVencimiento === '1semana') return '9px solid #FFD700';
    return '9px solid #DC143C';
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
