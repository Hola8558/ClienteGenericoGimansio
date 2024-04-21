import { HostListener, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { createClientDialogComponent } from './dialogs/create-new-client-dialog/create-client-dialog.component';
import { downloadClient } from './interfaces/download-client.interface';
import { ClientService } from './clientes.service';
import { ConfirmDeleteComponent } from './dialogs/confirm-delete/confirm-delete.component';
import { EditClientDialogComponent } from './dialogs/edit-client-dialog/edit-client-dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IngoClientDialogComponent } from './dialogs/ingoClientDialog/ingoClientDialog.component';
import { RenewMensualidadDialogComponent } from './dialogs/renewMensualidad/renew-mensualidad-dialog.component';
import { AlertService } from '../../shared/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createClient } from './interfaces/create-client.interface';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})

export class InicioComponent implements OnInit {

  public posX : number = 0;
  public posY : number = 0;
  public clientes : downloadClient[] = [];
  public isSmallScreen: boolean = false;
  public displayedColumns: string[] = [' ','Número de Cuenta', 'Nombre', 'Registrar Entrada', 'Opciones'];
  public displayedColumnsSmall: string[] = [' ','Cliente'];
  public dataSource = new MatTableDataSource(this.clientes);
  public elementClientShow : { show : string, posX : number, posY: number, aplicarAnimacion: string, _id: string, changeInfo : string, entrada:string } = {
    show: 'void', posX: this.posX, posY: this.posY, aplicarAnimacion: 'void', _id:'', changeInfo:'void', entrada: '' }

  @HostListener('mousemove', ['$event']) onMouseMove(event : any) {
    this.posX = event.clientX;
    this.posY = event.clientY;
  }

  @ViewChild(MatPaginator) paginator !: MatPaginator;

  constructor(public dialog: MatDialog, private clientesService : ClientService,
    private breakpointObserver: BreakpointObserver,
    private alertService: AlertService,
    private fb: FormBuilder,
    private clientService : ClientService,
    private _snackBar: MatSnackBar,
    public route: ActivatedRoute, public router: Router){
    this.inicio()
    if (localStorage.getItem("entradaInicio")) {
      this.estadoAnimaciones = 1;
      this.applyAnimationToLeft = true;
      setTimeout(() => {
        localStorage.removeItem("entradaInicio");
        this.applyAnimationToLeft = false;
        this.estadoAnimaciones = 0;
      }, 500);
    }
      const nCuenta = this.generateRandomAccountNumber();
      this.form = this.fb.group({
        ncuenta: [ nCuenta , Validators.required],
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        telefono: [''],
        emergencia: [''],
        fechaPago: [this.date, Validators.required],
        mensualidad: ['', Validators.required],
        Precio: [0, Validators.required],
        gender : ['H', Validators.required],
        pass : [`${nCuenta}`, Validators.required],
      })
      this.ncuenta = this.generateRandomAccountNumber();
  }

  public date = new FormControl(new Date());
  public serializedDate = new FormControl(new Date().toISOString());
  selectedValue: string = '';

  tipos = ['Estudiante', 'General', 'Convenio'];

  public form  : FormGroup;
  public errorNoMatchPass = false;
  public spinnerUpload = false;
  public changePass = false;
  public messageError = '';
  public _id = '';
  public ncuenta : string;
  public mens = '';

  cancelarConvenio() {
    this.form.get('mensualidad')?.setValue(null); // Reinicia la selección
    this.mens = ''; // Puedes ajustar esto según tus necesidades
  }

  submitForm() {
    if (this.form.valid) {
      this.ingresar(); // Llama a la función del formulario si el formulario es válido
    };
  }

  async ingresar(){
    this.spinnerUpload = true;

    const {nombre, apellidos, ncuenta, fechaPago, mensualidad, telefono, emergencia, Precio, gender, pass} : {nombre:string, apellidos:string, ncuenta:string, fechaPago:string, mensualidad:string, telefono:string, emergencia:string, Precio:number, gender?:string, pass:string} = this.form.value;
    const client : createClient = { nombre, apellidos, ncuenta, ultimoPago: fechaPago, fechaVencimiento: this.obtenerFechaSiguiente(fechaPago),
      tipoMensualidad: mensualidad, numeroCelular:telefono, numeroCelularEmergencia:emergencia, precioConvenio:Precio, gender, pass };

    (await this.clientService.addClient( client )).subscribe(
      (res : any) => {
        this._snackBar.open('Cliente creado correctamente', '', { duration: 1200});
        const nCuenta = this.generateRandomAccountNumber();
        this.form = this.fb.group({
          ncuenta: [ nCuenta , Validators.required],
          nombre: ['', Validators.required],
          apellidos: ['', Validators.required],
          telefono: [''],
          emergencia: [''],
          fechaPago: [this.date, Validators.required],
          mensualidad: ['', Validators.required],
          Precio: [0, Validators.required],
          gender : ['H', Validators.required],
          pass : [`${nCuenta}`, Validators.required],
        })
        this.ncuenta = this.generateRandomAccountNumber();
      },
      (err : any) => {

        if (err.error && err.error.message) {
          this.messageError = err.error.message;
        } else {
          this.messageError = 'Error desconocido';
        }

        this.alertService.showAlert("w", "Error", 5000);
        setTimeout(() => {
          this.spinnerUpload = false;
          this.messageError = '';
        }, 1500)

      }
    )


  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // Genera un número de cuenta de 5 dígitos al azar
  generateRandomAccountNumber(): string {
    const min = 10000; // El número mínimo de 5 dígitos
    const max = 100000; // El número máximo de 5 dígitos (excluido)
    const randomNumber = this.getRandomNumber(min, max);
    return randomNumber.toString();
  }

  obtenerFechaSiguiente(fecha: string | null): string {
    if (!fecha) {
      return ''; // Maneja el caso donde la fecha es nula
    }

    // Clonamos la fecha para evitar modificar la original
    const fechaSiguiente = new Date(fecha);

    // Obtenemos el día del mes
    const diaDelMes = fechaSiguiente.getDate();

    // Configuramos la fecha para el próximo mes
    fechaSiguiente.setMonth(fechaSiguiente.getMonth() + 1);

    // Si el día del mes original era mayor que el último día del próximo mes,
    // establecemos el día del mes al último día del próximo mes
    if (diaDelMes > new Date(fechaSiguiente.getFullYear(), fechaSiguiente.getMonth() + 1, 0).getDate()) {
      fechaSiguiente.setDate(new Date(fechaSiguiente.getFullYear(), fechaSiguiente.getMonth() + 1, 0).getDate());
    }

    // Devolvemos la fecha en formato ISO8601
    return fechaSiguiente.toISOString();


    if (localStorage.getItem("id_cdk") && !this.isSmallScreen){
      this.elementClientShow = {show: 'show', posX: Number(localStorage.getItem("postionX")), posY: Number(localStorage.getItem("postionY")), aplicarAnimacion: 'void', _id: localStorage.getItem("id_cdk")!!, changeInfo: 'void', entrada:"string" }
    }
    this.dataSource = new MatTableDataSource(this.clientes);
    this.dataSource.paginator = this.paginator
  }

  public estadoAnimaciones = 0;
  public applyAnimationToLeft: boolean = false;

  changeView(){
    localStorage.setItem("entradaAdmin", "1")
    setTimeout(() => {
      this.router.navigate(["/dashboard/opciones_administrador"])
    }, 100);
  }

  sendDataViewClient(_id: string){
    if (_id != this.elementClientShow._id && this.elementClientShow.show === 'show') {
      this.elementClientShow = {
        ...this.elementClientShow,
        _id, // Actualizar el _id
        aplicarAnimacion: 'void',
        changeInfo: 'show',
        show: 'show',
        entrada:'string'
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
        changeInfo: 'void',
        entrada:'string'
      };
      return;
    }
  }

  sendDataViewClientDialog( _id:string ){
    const dialogRef = this.dialog.open(IngoClientDialogComponent, {
      data: {_id}
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

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
        this.dataSource.paginator = this.paginator
      }
    )
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

  formterClientsStatus(res: downloadClient[]) {
    let ret: downloadClient[] = res;
    ret.forEach((c, i) => {
      const fechaObjeto: Date = this.convertirFecha(c.fechaVencimiento);
      const milisegundosPorDia: number = 24 * 60 * 60 * 1000; // 1 día en milisegundos
      const fechaActual: Date = new Date();
      const diferenciaMilisegundos: number = fechaObjeto.getTime() - fechaActual.getTime();

      const diferenciaDias = diferenciaMilisegundos/milisegundosPorDia;

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

  fechaYaPaso(fechaString:string) {
    // Obtener la fecha actual
    const fechaActual = new Date();
//
    // Convertir la cadena de fecha dada a un objeto Date
    const fechaDada = new Date(fechaString);
    //console.log(fechaDada - fechaActual);
//
    // Comparar las fechas
    return fechaDada < fechaActual;
  }
//
  convertirFecha(fechaString: string): Date {
    // Crear una instancia de Date directamente desde la cadena ISO 8601
    return new Date(fechaString);
  }
//
  obtenerNumeroMes(nombreMes: string): number {
//
    const meses: Record<string, number> = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
      'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    };

    return meses[nombreMes.toLowerCase()];
  }

  createClient(){
    const dialogRef = this.dialog.open(createClientDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      this.inicio();
      if (result.exit){
        this.alertService.showAlert("suc","Cliente creado correctamente", 2000);
      };
    });
  }

  getColor(element: any): string {
    if (element.fechaVencimiento === 'vigente') return '9px solid #228B22';
    if (element.fechaVencimiento === '1semana') return '9px solid #FFD700';
    return '9px solid #DC143C';
  }

  registrarEntrada(event: MouseEvent, _id:string){
    event.stopPropagation();
    this.clientesService.registrarAsistencia(_id);
  }

  renovarMensualidad(event: MouseEvent, _id:string){
    event.stopPropagation();

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

  ngOnInit() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isSmallScreen = result.matches;
    });
  }
}
