import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ejercicio, grupoMuscular, pseaudoEjerciicios, rutina, rutinasMusculares } from '../interfaces/ejercicios.interface';
import { ClientService } from '../services/clientes.service';
import { RutinasService } from '../services/rutinas.service';
import { AlertService } from '../services/alert.service';
import { downloadClient } from '../interfaces/download-client.interface';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { adjuntExcerciseComponent } from '../../dashboard/rutinas/dialogs/adjuntExcercise/adjuntExcercise-dialog.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteRuinaComponent } from '../dialogs/confirm-delete.component/confirm-delete.component';
import { newRutinaOrPrevious } from '../dialogs/newRutina-UsePrevous/newRutina-or-previous.component';
import { ShowExcerciseComponent } from '../dialogs/show-excercise.component/show-excercise.component';

@Component({
  selector: 'app-rutinas',
  templateUrl: './rutinas.component.html',
  styleUrls: ['./rutinas.component.css'],
})
export class RutinasComponent {
  cancelarConvenio() {
    this.form.get('grupoMuscular')?.setValue('');
  }
  public form  : FormGroup;
  public isSmallScreen: boolean = false;
  public errorNoMatchPass = false;
  public spinnerUpload = false;
  public changePass = false;
  public messageError = '';
  public _id = '';
  public rutinas : rutina[] = [];
  public client : downloadClient = {_id:'', ncuenta:'', nombre:'',apellidos:'',ultimoPago:'',fechaVencimiento:'',tipoMensualidad:'', numeroCelular:'',numeroCelularEmergencia:'',rutinas:{l:'',M:'',Mi:'',J:'',V:'',S:''}}
  public tipos : grupoMuscular[] = [];
  public tiposConfirmattion : grupoMuscular[] = [];
  public closeAnimation = false;
  public slideLeft = { i: 0, estado :false };
  public slideRight = { i: 0, estado :false };
  public listaRutinas : rutinasMusculares[] = [ ];
  public shoeMenuNewMobile = false;
  public isSmallScreenMobile = false;
  public shoeMenuNew = false;
  public estadoReceptorNewRutina$ = this.rutinasService.estadoMenuShowRutina$;
  public estadoReceptorNewRutinaMobile$ = this.rutinasService.estadoMenuShowRutinaMobile$;
  public crearNuevoC = 0;
  public indiceCircuitoEnProcess : number = 0;
  @Output() closed = new EventEmitter<rutina>();
  public deletingMode = false;
  public diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private alertService: AlertService,
    private rutinasService : RutinasService,
    public dialog: MatDialog,
    private clienService : ClientService
  ) {
    this.form = this.fb.group({
      nombre: ['.'],
      grupoMuscular: ['', Validators.required],
      diaSelect: ['', Validators.required],
      newgrupoMuscular: [''],
    })
    this.loadMuscularGroups();
    this.closeAnimation = false;
    this.inicio();
}

  async ordenaRutinasPro(d:downloadClient){
    this.rutinas = [];
    if (d.rutinas)
    if (d.rutinas) {
      const rutinasKeys = Object.keys(d.rutinas) as Array<keyof typeof d.rutinas>;
      for (const r of rutinasKeys) {
        (await this.rutinasService.getResumenRutina(d.rutinas[r])).subscribe((res:any) => {
          if (res && res._id) {
            this.rutinas.push(res);
          } else {
            console.error("El objeto res o su propiedad _id es null o undefined.");
          }
        });
      }
    }
  }

  getRutina(d:string){
    let index = '';
    if(this.client.rutinas)
    Object.keys(this.client.rutinas).map(key => {
      if ( d === 'Lunes' && key === 'l' ){index = this.client.rutinas![key]};
      if ( d === 'Martes' && key === 'M' ){index = this.client.rutinas![key]};
      if ( d === 'Miercoles' && key === 'Mi' ){index = this.client.rutinas![key]};
      if ( d === 'Jueves' && key === 'J' ){index = this.client.rutinas![key]};
      if ( d === 'Viernes' && key === 'V' ){index = this.client.rutinas![key]};
      if ( d === 'Sabado' && key === 'S' ){index = this.client.rutinas![key]};
    })
    return this.rutinas.find(item => item._id === index)
  }

  async inicio(){
    await this.loadEjercicios();
    this.loadMuscularGroups();
    (await this.rutinasService.getAllEjercicios()).subscribe(
      ( res: any ) => {
        for ( let e of res ){
          this.ordenarEjercicio(e);
        };
        if ( this.tipos[this.tipos.length-1].name !== "Agregar" ){
          this.tipos.push({ name: "Agregar", ejercicios: [] });
        }
      },
      ( err : any ) => {
        this.messageError = err.error.message;
        this.alertService.showAlert("danger","Error", 2000);
      }
    );

    this.getRutinasXd()
  };

  async getRutinasXd(){
    const id = localStorage.getItem('id')!;
    try {
      (await this.clienService.getClient(id)).subscribe(
        async (res: any) => {
          this.client = res;
          this.ordenaRutinasPro(this.client)
        },
        (err: any) => {
          console.log(err);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  desplazarAtras(i:number){
    this.slideLeft.i = i;
    this.slideLeft.estado = true;
    setTimeout( (x : any) => {
      this.slideLeft.estado = false;
      let first = this.tipos[i].ejercicios.shift();  // Extrae y guarda el primer elemento
      this.tipos[i].ejercicios.push(first!);
    },200)

  }
  desplazarEnfrente(i:number){
    this.slideRight.i = i;
    this.slideRight.estado = true;
    let last = this.tipos[i].ejercicios.pop();  // Extrae y guarda el último elemento
      this.tipos[i].ejercicios.unshift(last!);     // Inserta el último elemento al principio del array
    setTimeout ((x: any) => {

      this.slideRight.estado = false;
    },200)
  }

  closeDialog(event: MouseEvent): void {
    // Verificar si el clic proviene del componente grande
    if ((event.target as HTMLElement).classList.contains('containerPadre')) {
      // Lógica cuando se hace clic en el componente grande
      this.closeAnimation = true;
      setTimeout(() => {
        this.rutinasService.actualizarEstado(false);
        this.closeAnimation = false;
      }, 200);
    }
  }

  closeDialogToCode(): void {
    this.closeAnimation = true;
    setTimeout(() => {
      this.rutinasService.actualizarEstado(false);
      this.closeAnimation = false;
    }, 200);
  }

  public error : { e:boolean, msg: string } = { e:false, msg:'' }

  public uploadRutina : rutina = {name:'',grupoMuscular:'', ejercicios:[]}


  async ingresar(){
    let gM = this.form.get("grupoMuscular")?.value.name;
      if (this.form.get("grupoMuscular")?.value.name === '') { gM = this.form.get("newgrupoMuscular")?.value.name };
    if ( this.form.invalid ) { this.loadErrorMsg('Debe colocar un nombre y seleccionar un grupo muscular'); return; };
    if ( this.todo.length <= 0 ) { this.loadErrorMsg('Debe haber al menos un ejercicio'); return; };
    this.uploadRutina.name = this.form.get("nombre")!.value;
    if ( this.form.get("newgrupoMuscular")?.value != '' ){ this.uploadRutina.grupoMuscular = this.form.get("newgrupoMuscular")?.value } else {

      this.uploadRutina.grupoMuscular = gM;
    }
    if ( this.form.get("diaSelect")?.value === '' ) { this.loadErrorMsg('Debe seleccionar un día de la semana'); return; }
    let errors = 0;
    this.todo.forEach((ejercicio : ejercicio, ind) => {
      if ( ejercicio.nombre != 'c1ecu1t029092005' ){
        if ( !ejercicio.series || (ejercicio.series && +ejercicio.series <= 0) ) {  this.loadErrorMsg(`Debe haber al menos una serie por ejercicio (${ejercicio.nombre})`); errors++; return }
        if ( !ejercicio.reps || (ejercicio.reps && +ejercicio.reps <= 0) ) {  this.loadErrorMsg(`Debe haber al menos una repeticion por ejercicio (${ejercicio.nombre})`); errors++; return }
        this.uploadRutina.ejercicios.push({ id: ejercicio._id!, series: +ejercicio.series!, reps: ejercicio.reps! });
      } else {
        if ( !ejercicio.reps || (ejercicio.reps && +ejercicio.reps <= 0) ) {  this.loadErrorMsg(`Debe haber al menos una serie por circuito (${ind})`); errors++; return; }
        let listaEjercicios : { iden:string, reps: number }[] = [];
        let color = '';
        ((ejercicio.series) as ejercicio[]).forEach( (circui:ejercicio,index) => {
          if ( !circui.reps || (circui.reps && +circui.reps <= 0) ) {  this.loadErrorMsg(`Debe haber al menos una repeticion por ejercicio (${circui.nombre})`); errors++; return; }
          listaEjercicios.push({iden:circui._id!, reps: circui.reps});
          if ( index === 0){ color = circui.description }
        })
        if(listaEjercicios.length > 0){
          this.uploadRutina.ejercicios.push({ id:'c1ecu1t029092005', series:listaEjercicios, ciruitoseries:ejercicio.reps, color: color });
        }

      }
    });
    if ( this.uploadRutina.ejercicios.length > 0 && errors === 0 ){
      let d = this.form.get("diaSelect")?.value;
      let prev = '';
      if (d === 'Lunes' && this.client.rutinas){ prev = this.client.rutinas.l }
      if (d === 'Martes' && this.client.rutinas){ prev = this.client.rutinas.M }
      if (d === 'Miercoles' && this.client.rutinas){ prev = this.client.rutinas.Mi }
      if (d === 'Jueves' && this.client.rutinas){ prev = this.client.rutinas.J }
      if (d === 'Viernes' && this.client.rutinas){ prev = this.client.rutinas.V }
      if (d === 'Sabado' && this.client.rutinas){ prev = this.client.rutinas.S }
      if (prev != ''){this.openDialogDeleteRutina(prev)}else{
        this.closed.emit(this.uploadRutina);
      try {
        (await (this.rutinasService.addRutina(this.uploadRutina)))
        .subscribe(async (x:any) => {
          (await this.rutinasService.setRutinaToClient(this.client._id, gM, x)).subscribe((res:any)=>{
            this.newRutina.d= d;
            this.newRutina.ruti = x;
            this.setNewRutina(prev);
          },(err:any)=>{console.log(err)})
        }, async (y:any)=> {
          (await this.rutinasService.setRutinaToClient(this.client._id, gM, y.error.text)).subscribe((res:any)=>{
            this.newRutina.d= d;
            this.newRutina.ruti = y.error.text;
            this.setNewRutina(prev);
          },(err:any)=>{console.log(err)})
        })
        await this.getRutinasXd()
        console.log("Ambas solicitudes fueron exitosas");
      } catch (err) {
        // Hubo un error en alguna de las solicitudes
        console.log("Hubo un error en alguna de las solicitudes:", err);
      }

      this.onClosed(this.uploadRutina);
      this.uploadRutina = {name:'',grupoMuscular:'', ejercicios:[]};
      this.form.get("nombre")?.setValue("");
      this.form.get("grupoMuscular")?.setValue("");
      this.form.get("diaSelect")?.setValue("");
      this.form.get("newgrupoMuscular")?.setValue("");
      this.todo = [];
      this.alertService.showAlert("suc", "Rutina creada correctamente")
 }    }
  }

  public newRutina : {d:string, ruti:string} = { d:'', ruti:'' };

  async setNewRutina(prev?:string){
    await (await this.rutinasService.getResumenRutina(this.newRutina.ruti)).subscribe((res:any)=>{
      this.rutinas.push(res);
      if (this.newRutina.d === 'Lunes' && this.client.rutinas){  this.client.rutinas.l = this.newRutina.ruti }
      if (this.newRutina.d === 'Martes' && this.client.rutinas){  this.client.rutinas.M = this.newRutina.ruti }
      if (this.newRutina.d === 'Miercoles' && this.client.rutinas){ this.client.rutinas.Mi = this.newRutina.ruti }
      if (this.newRutina.d === 'Jueves' && this.client.rutinas){  this.client.rutinas.J = this.newRutina.ruti }
      if (this.newRutina.d === 'Viernes' && this.client.rutinas){  this.client.rutinas.V = this.newRutina.ruti }
      if (this.newRutina.d === 'Sabado' && this.client.rutinas){  this.client.rutinas.S = this.newRutina.ruti }

      this.newRutina = { d:'', ruti:'' };
    })

  }

  async openDialogDeleteRutina(prev : string){
    const dialogRef = this.dialog.open(ConfirmDeleteRuinaComponent, {data: {r:prev}});
    dialogRef.afterClosed().subscribe( async (result: boolean) => {
      if (prev != '' && result === false)  {
        (await this.rutinasService.deleteRutina(prev)).subscribe((res:any) => {});
      };

      this.closed.emit(this.uploadRutina);
          let d = this.form.get("diaSelect")?.value;
          try {
            (await (this.rutinasService.addRutina(this.uploadRutina)))
            .subscribe(async (x:any) => {
              (await this.rutinasService.setRutinaToClient(this.client._id, d, x)).subscribe((res:any)=>{
                this.newRutina.d= d;
                this.newRutina.ruti = x;
                this.setNewRutina(prev);
              },(err:any)=>{console.log(err)})
            }, async (y:any)=> {
              (await this.rutinasService.setRutinaToClient(this.client._id, d, y.error.text))!.subscribe((res:any)=>{
                this.newRutina.d= d;
                this.newRutina.ruti = y.error.text;
                this.setNewRutina(prev);
              },(err:any)=>{console.log(err)})
            })
            await this.getRutinasXd()
            console.log("Ambas solicitudes fueron exitosas");
          } catch (err) {
            // Hubo un error en alguna de las solicitudes
            console.log("Hubo un error en alguna de las solicitudes:", err);
          }
          this.onClosed(this.uploadRutina);
          this.uploadRutina = {name:'',grupoMuscular:'', ejercicios:[]};
          this.alertService.showAlert("suc", "Rutina creada correctamente")

    });

  }

  loadErrorMsg( error : string ){
    this.spinnerUpload = true;
    this.error.e = true;
    this.error.msg = error;
    setTimeout((x:any) => {
      this.error.e = false;
      this.error.msg = '';
      this.spinnerUpload = false;
    },2200)
  }

  loadMuscularGroups(){
    this.tipos = [];
  }

  handleClickEnComponentePequeno(event: MouseEvent): void {
    event.stopPropagation();
  };

  public todo:      ejercicio [] = [];
  public todoLeft:  ejercicio [] = [];
  public todoRight: ejercicio [] = [];

  public previousTodo:      ejercicio [] = [];
  public previousTodoLeft:  ejercicio [] = [];
  public previousTodoRight: ejercicio [] = [];

  public colorSelect = '';

  onDropSource(event: any, i : number): void {//CdkDragDrop<ejercicio[]>
    if (event.previousContainer === event.container) {
      // El elemento se movió dentro de la misma lista
      const movedItem = event.container.data[event.previousIndex];
      if (movedItem) {
        //moveItemInArray(this.todo, event.previousIndex, event.currentIndex  )
        this.tipos[i].ejercicios = this.tipos[i].ejercicios.filter(item => item.nombre !== movedItem.nombre);
        this.todo.push(movedItem);
        if ( this.todoLeft.length > this.todoRight.length ){
          this.todoRight.push(movedItem);
        } else {
          this.todoLeft.push(movedItem);
        }
      }
      // Tu lógica aquí
    } else {
      // El elemento se movió de una lista a otra
      const movedItem = this.tipos[i].ejercicios.find(item => item._id === event.container.data[0]._id);
      if (movedItem) {
        this.tipos[i].ejercicios = this.tipos[i].ejercicios.filter(item => item.nombre !== movedItem.nombre);
        this.todo.push(movedItem);
      }
    }

    this.reOrderList()
  }

  onDragDropped(event: CdkDragDrop<any[]>): void {
    if (event.container !== event.previousContainer) {
      // El elemento se movió de una lista a otra
      const i = event.container.data[0].index; // Obtener el índice del grupo
      this.onDropSource(event, i);
    }
  }

  onDropContainer(event: any): void {//CdkDragDrop<string[]>
    if (event.previousContainer !== event.container) {
      // El elemento se movió de una lista a otra
      const movedItem = this.todoLeft.find(item => item.nombre === event.item.nombre);
      if (movedItem) {
        this.todoLeft = this.todoLeft.filter(item => item.nombre !== movedItem.nombre);
        this.inicio();
      }
    }


  }

  ordenarEjercicio( e:ejercicio ){
    let long = this.tipos.length;
    let contador = 0;
    this.tipos.forEach((x) => {
      if ( e.grupoMuscular != x.name ) {contador++} //{this.gruposMusculares.push( { name: e.grupoMuscular, ejercicios: [] } )}
      if ( e.grupoMuscular === x.name ) {x.ejercicios.push(e);}
    });
    if ( contador === long ) { this.tipos.unshift( { name: e.grupoMuscular, ejercicios: [e] } ) }
    this.tiposConfirmattion = this.tipos;
  }

  deleteExcercise( colum: number, index: number, itemEjer: ejercicio ){

    if ( colum === 0 ){
      this.todoLeft.splice(index, 1);
    } else { this.todoRight.splice(index, 1); }

    let indice = this.todo.findIndex( item => item._id === itemEjer._id);
    if (indice !== -1){
      this.todo.splice(indice, 1);
    }
    this.ordenarEjercicio(itemEjer);
    this.reOrderList();
  }

  reOrderList(){
    let longituExtraIzq = 0;
    let longituExtraDer = 0;
    this.todoLeft = [];
    this.todoRight = [];

    for (let i = 0; i < this.todo.length; i++) {

      if ( i != 0 ){
        if ( this.todo[i-1] && this.todo[i-1].series != undefined && typeof (this.todo[i-1].series) === 'object' ){
          let izq = this.todoLeft.findIndex( item => item._id === this.todo[i-1]._id )
          if ( izq != -1 ){ longituExtraIzq += ((this.todo[i-1].series)as ejercicio[]).length-1; }else {
            longituExtraDer += ((this.todo[i-1].series)as ejercicio[]).length-1;
          }
        }
        if ( this.todoLeft.length + longituExtraIzq > this.todoRight.length + longituExtraDer ){
          this.todoRight.push(this.todo[i])
        } else {
          this.todoLeft.push(this.todo[i])
        }
      }
      if (i === 0){ this.todoLeft.push(this.todo[i]); }
    }
  }

  setButtonCloseAgain ( lista : number ){
    if ( lista === 0 ){
      let temporaly : ejercicio[] = this.todoLeft;
      this.todoLeft = [];
      this.todoLeft = temporaly;
      return
    }
    let temporaly : ejercicio[] = this.todoRight;
    this.todoRight = [];
    this.todoRight = temporaly;

  }

  dropInside(event: CdkDragDrop<ejercicio[]>) {
    if (event.previousContainer === event.container) {

      const indiceNew = this.todo.findIndex(item => item._id === event.container.data[event.currentIndex]._id);
      const indicePrev = this.todo.findIndex(item => item._id === event.container.data[event.previousIndex]._id);
      const elementPrev = this.todo[indicePrev];
      this.todo.splice(indiceNew,0,elementPrev);
      if ( indiceNew < indicePrev ){
        this.todo.splice(indicePrev+1,1);
      } else {
        this.todo.splice(indicePrev,1);
      }

    } else {

      if ( event.previousContainer.id === 'cdk-drop-list-2' ){
        const indiceNew = this.todo.findIndex(item => item._id === event.container.data[event.currentIndex]._id);
        const indicePrev = (this.todo.findIndex(item => item._id === event.container.data[event.previousIndex]._id))+1;
        const elementPrev = this.todo[indicePrev];
        if (indiceNew != -1){
           this.todo.splice(indiceNew,0,elementPrev);
          if ( indiceNew < indicePrev ){
            this.todo.splice(indicePrev+1,1);
          } else {
            this.todo.splice(indicePrev,1);
          }
        }
      } else {
        const indiceNew = this.todo.findIndex(item => item._id === event.container.data[event.currentIndex]._id);
        const indicePrev = (this.todo.findIndex(item => item._id === event.container.data[event.previousIndex]._id))-1;
        const elementPrev = this.todo[indicePrev]
        this.todo.splice(indiceNew,0,elementPrev);
        if ( indiceNew < indicePrev ){
          this.todo.splice(indicePrev+1,1);
        } else {
          this.todo.splice(indicePrev,1);
        }
      }
    }


    this.reOrderList();
  }

  getNumberExcercise( e : ejercicio ) : number{
    let r = 0;
    if ( e.nombre != 'c1ecu1t029092005' ){return this.todo.findIndex(item => item._id === e._id) + 1;}
    this.todo.forEach( (element : ejercicio, index) =>{
      if (element.nombre === 'c1ecu1t029092005'){
        if ( ((element.series!)as ejercicio[])[0] === ((e.series!)as ejercicio[])[0])  { r = index };
      }
    });
    return r+1;
  }

  applyFilter( event : Event){
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

  // Restaurar la lista original antes de aplicar el nuevo filtro
  this.tipos = this.tiposConfirmattion.map(grupo => {
    // Aplicar el filtro a los ejercicios dentro de cada grupo
    const ejerciciosFiltrados = grupo.ejercicios.filter(ejercicio =>
      ejercicio.nombre.toLowerCase().includes(filterValue)
    );

    // Mantener el grupo completo si el nombre del grupo coincide o si algún ejercicio coincide
    const nombreCoincide = grupo.name.toLowerCase().includes(filterValue);

    return {
      name: grupo.name,
      ejercicios: nombreCoincide ? grupo.ejercicios : ejerciciosFiltrados
    };
  });

  // Eliminar los grupos musculares que no tienen coincidencias
  this.tipos = this.tipos.filter(grupo =>
    grupo.name.toLowerCase().includes(filterValue) || grupo.ejercicios.length > 0
  );

  // Agregar un grupo especial para agregar nuevos elementos
  this.tipos.push({ name: "Agregar", ejercicios: [] });
  }

  newCir(){
    this.crearNuevoC = 1;
    this.previousTodo = [...this.todo];
    this.previousTodoLeft = [...this.todoLeft];
    this.previousTodoRight = [...this.todoRight];
  }

  getBoxShadow(item: ejercicio): any {
    const boxShadow = this.findItemCirtuico(item) ? `0 0 10px 5px ${this.colorSelect}` : 'none';
    return { 'box-shadow': boxShadow };
  }

  findItemCirtuico(itemEjer:ejercicio):boolean{
    let indice = this.listaPrevia.findIndex( item => item._id === itemEjer._id);
    if ( indice != -1 ) return true;
    return false;
  }

  findIndexCircuitoNew(itemEjer : ejercicio) : number {return this.listaPrevia.findIndex( item => item._id === itemEjer._id)}

  public listaPrevia : ejercicio[] = []
  checkNewCircuito(itemEjer : ejercicio, col: number, izq: number){
    if (this.crearNuevoC > 0 && itemEjer.nombre != 'c1ecu1t029092005'){
      let indice = this.listaPrevia.findIndex( item => item._id === itemEjer._id);
      if ( indice != -1 ){
        this.listaPrevia.splice(indice,1);
      } else { this.listaPrevia.push(itemEjer) }

      const numeroAlAzar = Math.floor(Math.random() * this.colors.length);
      if(this.listaPrevia.length === 1){
        this.colorSelect = this.colors[numeroAlAzar];
        this.indiceCircuitoEnProcess = indice;
      }

      if ( this.listaPrevia.length === 1 ){
        this.crearNuevoC = 2
      } else if ( this.listaPrevia.length > 1 ){
        this.crearNuevoC = 3
      } else { this.crearNuevoC = 1 }

      if ( indice != -1 ){
        itemEjer.description = "aaaa";
      } else { itemEjer.description = this.colorSelect; }
    }
  }

  enoughtLong(){
    let contador = 0;
    this.todo.forEach((element:ejercicio) => {
      if ( element.nombre != 'c1ecu1t029092005' ) contador++;
    })
    if ( contador >= 2 ) return true;
    return false;
  }

  cancelNewCir(){
    this.crearNuevoC = 0;
    this.todo = [...this.previousTodo];
    this.todoLeft = [...this.previousTodoLeft];
    this.todoRight = [...this.previousTodoRight];
    this.listaPrevia = [];
    this.colors.push(this.colorSelect);
    this.colorSelect = '';
    this.todo.forEach( (e : ejercicio) => {
      if (e.series && (+e.series > 100000 || +e.series < -100000)) { e.series = 0 }
    });
  }

  aceptarNewCir(){

    this.listaPrevia.forEach( (itemEjer: ejercicio, indi) => {
      if ( indi === 0 ){
        let indice = this.todo.findIndex( item => item._id === itemEjer._id);
        this.todo[indice] = { nombre: 'c1ecu1t029092005', url:``, description:`${this.colorSelect}`, grupoMuscular:'', series:[itemEjer] }
        this.todo[indi].description = this.colorSelect;
        this.indiceCircuitoEnProcess = indice;
      } else {
        ((this.todo[this.indiceCircuitoEnProcess].series!) as ejercicio[]).push( itemEjer );
      }
    });

    this.crearNuevoC = 0;

    this.todo.forEach( (e : ejercicio, ind) => {


      if (e.nombre === 'c1ecu1t029092005'){
        let indiceCero = +(((e.series) as ejercicio[])[0].series)!;

        ((e.series!) as ejercicio[]).forEach( (ejercicio : ejercicio, indice) => {

          let ind = this.todo.findIndex(item => item._id === ejercicio._id);
          if (ind != -1){
            this.todo.splice(ind,1);
          }
        })
      }
    });

    this.reOrderList();
    this.previousTodo = [...this.todo];
    this.previousTodoLeft = [...this.todoLeft];
    this.previousTodoRight = [...this.todoRight];
    this.listaPrevia = [];
  }

  isPropertyArray(value: ejercicio): ejercicio[] {
    let list : ejercicio[];
    list = value.series as ejercicio[];
    return list;
  }

  isColor(text : string){
    if (text[0] === '#') return '#ffff';
    return text;
  }

  findRealRutina(item : pseaudoEjerciicios){
    let lis :ejercicio[]= [];
    if ( typeof item.series != 'number' )
    (item.series as { iden:string, reps: number }[]).forEach((element:{ iden:string, reps: number }) => {
      let e = (this.ejercicios.find(item=>item._id === element.iden))
      if (e) e.reps=element.reps;
      if (e) lis.push(e);
    });
    return lis
  }

  moverEjerCircu(move: number, indice: number, circuito: ejercicio) {
    const indexEnTodo = this.todo.findIndex(item => item._id === circuito._id);

    if (indexEnTodo !== -1) {
      const series = this.todo[indexEnTodo].series! as ejercicio[];

      if (indice >= 0 && indice < series.length) {
        const newIndex = indice + move;

        // Verificar si el nuevo índice está dentro de los límites de la lista
        if (newIndex >= 0 && newIndex < series.length) {
          // Intercambiar posiciones en la lista de la propiedad series
          [series[indice], series[newIndex]] = [series[newIndex], series[indice]];
        } else {
          // Si el nuevo índice está fuera de los límites, ajustar para circular en la lista
          const lastIndex = series.length - 1;
          const adjustedIndex = newIndex < 0 ? lastIndex : 0;

          // Mover el elemento al principio o al final de la lista
          const movedElement = series.splice(indice, 1)[0];
          series.splice(adjustedIndex, 0, movedElement);
        }
      }
    }
  }

  async deleteExcerciseCir( colum: number, item:ejercicio, indice:number ){
    ((item.series!) as ejercicio[]).splice(indice,1);
    if( ((item.series!) as ejercicio[]).length <= 0 ){
      let index = this.todo.findIndex(item => item._id === item._id);
      this.todo.splice(index,1);
      if ( colum === 0 ){
        index = this.todoLeft.findIndex(item => item._id === item._id);
        this.todoLeft.splice(index,1);
      } else {
        index = this.todoRight.findIndex(item => item._id === item._id);
        this.todoRight.splice(index,1);
      }
    }
    this.reOrderList();

    await this.inicio().then( () => {
      this.tipos.forEach((grupo : grupoMuscular, g) => {
        grupo.ejercicios.forEach((e:ejercicio) => {
          let ind = this.todo.findIndex(item => item._id === e._id);
          if (ind != -1) grupo.ejercicios.splice(ind,1);
        })
        if( grupo.ejercicios.length === 0 ) this.tipos.splice(g,1);
      })
      this.tiposConfirmattion = this.tipos;
    } )

  }

  public colors = [
    'rgba(76, 175, 80,  0.3)', 'rgba(33, 150, 243,  0.3)', 'rgba(255, 82, 82,   0.3)', 'rgba(139, 195, 74,  0.3)', 'rgba(3, 169, 244, 0.3)',
    'rgba(255, 64, 129, 0.3)', 'rgba(205, 220, 57,  0.3)', 'rgba(0, 188, 212,   0.3)', 'rgba(255, 87, 34,   0.3)', 'rgba(0, 150, 136, 0.3)',
    'rgba(103, 58, 183, 0.3)', 'rgba(244, 67, 54,   0.3)', 'rgba(255, 235, 59,  0.3)',
    'rgba(76, 175, 80,  0.3)', 'rgba(121, 85, 72,   0.3)', 'rgba(3, 169, 244,   0.3)', 'rgba(255, 152, 0,   0.3)', 'rgba(96, 125, 139,  0.3)',
    'rgba(139, 195, 74, 0.3)', 'rgba(233, 30, 99,   0.3)', 'rgba(255, 193, 7,   0.3)', 'rgba(156, 39, 176,  0.3)', 'rgba(0, 188, 212,   0.3)',
    'rgba(255, 152, 0,  0.3)', 'rgba(255, 235, 59,  0.3)', 'rgba(0, 150, 136,   0.3)', 'rgba(244, 67, 54,   0.3)',
    'rgba(76, 175, 80,  0.3)', 'rgba(33, 150, 243,  0.3)', 'rgba(255, 82, 82,   0.3)'
]

ngOnInit(){
  this.estadoReceptorNewRutina$.subscribe((estado) => {
    this.shoeMenuNew = estado;
  });

  this.estadoReceptorNewRutinaMobile$.subscribe((estado) => {
    this.shoeMenuNewMobile = estado;
  });

  this.breakpointObserver.observe([
    Breakpoints.Small,
    Breakpoints.HandsetPortrait,
  ]).subscribe(result => {
    this.isSmallScreen = result.matches;
  });
}

  //** MOBILE  */

  public ejercicios : ejercicio[] =[]
  async loadEjercicios(){
    (await this.rutinasService.getAllEjercicios()).subscribe(
      ( res: any ) => {
        for ( let e of res ){
          this.ejercicios.push(e);
        };
      },
      ( err : any ) => {
        this.messageError = err.error.message;
        this.alertService.showAlert("danger","Error", 2000);
      }
    );
  }

  public deletingList:ejercicio[] = [];

  checkNewCircuitoMobil(itemEjer:ejercicio){
    if ( !this.deletingMode ){
      if (this.crearNuevoC > 0 && itemEjer.nombre != 'c1ecu1t029092005'){
        let indice = this.listaPrevia.findIndex( item => item._id === itemEjer._id);
        if ( indice != -1 ){
          this.listaPrevia.splice(indice,1);
        } else { this.listaPrevia.push(itemEjer) }

        const numeroAlAzar = Math.floor(Math.random() * this.colors.length);
        if(this.listaPrevia.length === 1){
          this.colorSelect = this.colors[numeroAlAzar];
          this.indiceCircuitoEnProcess = indice;
        }

        if ( this.listaPrevia.length === 1 ){
          this.crearNuevoC = 2
        } else if ( this.listaPrevia.length > 1 ){
          this.crearNuevoC = 3
        } else { this.crearNuevoC = 1 }

        if ( indice != -1 ){
          itemEjer.description = "aaaa";
        } else { itemEjer.description = this.colorSelect; }
      }
    } else {
      let indice = this.deletingList.findIndex( item => item._id === itemEjer._id);
        if ( indice != -1 ){
          this.deletingList.splice(indice,1);
        } else { this.deletingList.push(itemEjer) }
    }
  }

  addToExercise(reps:number | undefined, add:number){
    if (reps === undefined || reps === null ) {if (add < 0) {return 0} else {return 1}};
    if ( add < 0 && reps <= 0 ) {return 0};
    if (reps) return reps + add;
    return 1;

  }

  deleteListDeleting(){
    this.deletingList.forEach((e:ejercicio) => {
      let indice = this.todo.findIndex( item => item._id === e._id);
      if ( indice != -1 ){
        this.todo.splice(indice,1);
      }
    })
    this.deletingMode = false;
  }

  findItemDeletingList(itemEjer:ejercicio):boolean{
    let indice = this.deletingList.findIndex( item => item._id === itemEjer._id);
    if ( indice != -1 ) return true;
    return false;
  }

  subirEjercicioMobile(itemEjer:ejercicio){
    let index = this.todo.findIndex(item => item._id === itemEjer._id);
    if (index > 0) {
      // Intercambiar el elemento con el que está antes de él
      const temp = this.todo[index];
      this.todo[index] = this.todo[index - 1];
      this.todo[index - 1] = temp;
    } else if (index === 0) {
      // Mover el primer elemento al final de la lista
      const firstElement = this.todo.shift();
      this.todo.push(firstElement!);
    }
  }

  bajarEjercicioMobile(itemEjer:ejercicio){
    let index = this.todo.findIndex(item => item._id === itemEjer._id);
    if (index < this.todo.length - 1) {
      // Intercambiar el elemento con el que está después de él
      const temp = this.todo[index];
      this.todo[index] = this.todo[index + 1];
      this.todo[index + 1] = temp;
    } else if (index === this.todo.length - 1) {
      // Mover el último elemento al principio de la lista
      const lastElement = this.todo.pop();
      this.todo.unshift(lastElement!);
    }
  }


  async openDialogAddExcercise(){
    let prevList : ejercicio[] = [];
    const dialogRef = this.dialog.open(adjuntExcerciseComponent, {data: {e:this.ejercicios}});
    dialogRef.afterClosed().subscribe((result: {exit:boolean, ejercicios:ejercicio[]}) => {
      if (result.exit){
        (result.ejercicios).forEach((element:ejercicio) => {
          let ele : ejercicio = { description:element.description, grupoMuscular: element.grupoMuscular, nombre: element.nombre, url:element.url,_id:element._id }
          prevList.push(ele)
        });
      };
      if (prevList.length > 0){
        prevList.forEach((e:ejercicio) => {
          this.todo.push(e)
        });
      }
    });

  }

  async getEjercicios(){
    /**EJERCICIOS */
    (await this.rutinasService.getAllEjercicios()).subscribe(
      ( res: any ) => {
        for ( let e of res ){
          this.ejercicios.push(e);
        };
      },
      ( err : any ) => {
        this.messageError = err.error.message;
        this.alertService.showAlert("danger","Error", 2000);
      }
    );
  }

  ordenarRutina( r:rutina ){
    let long = this.listaRutinas.length;
    let contador = 0;
    this.listaRutinas.forEach((x) => {
      if ( r.grupoMuscular != x.grupoMuscular ) {contador++} //{this.gruposMusculares.push( { name: e.grupoMuscular, ejercicios: [] } )}
      if ( r.grupoMuscular === x.grupoMuscular ) {x.rutinas.push(r);}
    });
    if ( contador === long ) { this.listaRutinas.unshift( { grupoMuscular: r.grupoMuscular, rutinas: [r] } ) };

  }

  getExcercise( itemEjer:pseaudoEjerciicios ){
    let index = this.ejercicios.findIndex(item => item._id === itemEjer.id);
    return this.ejercicios[index]
  }

  getExcerciseEJER( itemEjer:ejercicio ){
    let index = this.ejercicios.findIndex(item => item._id === itemEjer._id);
    return this.ejercicios[index]
  }

  changeShowNewRutina(){
    const rutinasVerdad = { Lunes:this.getRutina('Lunes'),Martes:this.getRutina('Martes'),Miercoles:this.getRutina('Miercoles'),
    Jueves:this.getRutina('Jueves'),Viernes:this.getRutina('Viernes'),Sabado:this.getRutina('Sabado') }
    const dialogRef = this.dialog.open(newRutinaOrPrevious, {data: {r:rutinasVerdad}});
    dialogRef.afterClosed().subscribe( async (result: {exit:number, selected:string, day : string}) => {
      if ( !result ) { return };
      if ( result.exit === 0 ) { return };
      if ( result.exit === 1){
        if( !this.isSmallScreen ){this.rutinasService.actualizarEstado(true);}else{
          this.rutinasService.actualizarEstadoMobile(true)
        }
      };
      if ( result.exit === 2 ) {
        (await this.rutinasService.setRutinaToClient(this.client._id, result.day, result.selected)).subscribe((res:any)=>{
          this.newRutina.d= result.day;
          this.newRutina.ruti = result.selected;
          this.setNewRutina();
        },(err:any)=>{console.log(err)})
      }

    });
  }

  calcelRutina(){
    this.rutinasService.actualizarEstadoMobile(false);
    this.todo = []
    this.reOrderList();
    this.form.get("nombre")?.setValue('.');
    this.form.get("grupoMuscular")?.setValue('');
    this.form.get("diaSelect")?.setValue('');
    this.form.get("newgrupoMuscular")?.setValue('');
  }

  getResumeExcecise(e:pseaudoEjerciicios[]){
    let text = '';
    if ( this.ejercicios.length > 0 ){
      if (e.length >= 3){
        let index = this.ejercicios.findIndex(item => item._id === e[0].id);
        if (index === -1){ text = 'Ciruito'}else{text = this.ejercicios[index]?.nombre}
        index = this.ejercicios.findIndex(item => item._id === e[1].id);
        if (index === -1){ text = `${text}, Circuito`}else{text = `${text}, ${this.ejercicios[index]?.nombre}`}
        index = this.ejercicios.findIndex(item => item._id === e[2].id);
        if (index === -1){ text = `${text}, Circuito...`}else{text = `${text}, ${this.ejercicios[index]?.nombre}...`}
      } else{
        let index = this.ejercicios.findIndex(item => item._id === e[0].id);
        if (index === -1){ text = `Ciruito...`}else{text = `${this.ejercicios[index]?.nombre}...`}

      }
    }
    return text;
  }



  onClosed(agreed: rutina) {
    if (agreed) {
      this.rutinasService.actualizarEstadoMobile(false)
      this.rutinasService.actualizarEstado(false)
      this.ordenarRutina(agreed);
      this.form.get("nombre")?.setValue(".");
      this.form.get("grupoMuscular")?.setValue("");
      this.form.get("diaSelect")?.setValue("");
      this.form.get("newgrupoMuscular")?.setValue("");
      this.todo = [];
    }
  }

  openShowExcercise(item:pseaudoEjerciicios){
    const ej = this.getExcercise(item);
    if (ej){
      const dialogRef = this.dialog.open(ShowExcerciseComponent, {data: ej});
      dialogRef.afterClosed().subscribe( async (result: any) => {
      });
    }
  }

  openShowExcerciseCircuito(exerCiruito:ejercicio){
    const ej = this.getExcerciseEJER(exerCiruito);
    const dialogRef = this.dialog.open(ShowExcerciseComponent, {data: ej});
    dialogRef.afterClosed().subscribe( async (result: any) => {
    });
  }

 }
