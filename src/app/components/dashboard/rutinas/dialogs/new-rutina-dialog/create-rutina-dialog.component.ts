import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { AlertService } from 'src/app/components/shared/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatDividerModule} from '@angular/material/divider';
import { RutinasService } from '../../rutinas.service';
import { grupoMuscular, ejercicio, rutina, pseaudoEjerciicios } from '../../interfaces/ejercicios.interface';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { adjuntExcerciseComponent } from '../adjuntExcercise/adjuntExcercise-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-create-rutina-fake-dialog',
  templateUrl: './create-rutina-dialog-fake.component.html',
  styleUrls: ['./create-rutina-dialog-fake.component.css'],
  standalone: true, //MatDialogModule,
  imports: [ MatInputModule, FormsModule, MatButtonModule, ReactiveFormsModule, CommonModule, NgClass, MatProgressSpinnerModule, MatFormFieldModule, MatDatepickerModule,
    MatSelectModule, MatNativeDateModule, CommonModule, MatIconModule, MatTooltipModule, MatDividerModule, MatCardModule, CdkDropListGroup, CdkDropList, CdkDrag,
  ],
})
export class createNewRutinaDialogFakeComponent{

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
  public tipos : grupoMuscular[] = [];
  public tiposConfirmattion : grupoMuscular[] = [];
  public closeAnimation = false;
  public slideLeft = { i: 0, estado :false };
  public slideRight = { i: 0, estado :false };

  public crearNuevoC = 0;
  public indiceCircuitoEnProcess : number = 0;
  @Output() closed = new EventEmitter<rutina>();
  public deletingMode = false;
  public firstLoad = 0

  //AGREGADOS INESCESARIOS
  public dayToAsignNewRutina: string = '';
  public SocioToAsignNewRutina: string = '';

  constructor(
    private fb: FormBuilder,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private alertService: AlertService,
    private rutinasService : RutinasService,
    public dialog: MatDialog
  ) {
    this.form = this.fb.group({
      nombre: ['.', Validators.required],
      grupoMuscular: ['.', Validators.required],
      newgrupoMuscular: [''],
    })
    this.loadMuscularGroups();
    this.closeAnimation = false;
    this.inicio();
    this.rutinasService.getDayToAsign().subscribe((res:any) => {
      this.dayToAsignNewRutina = res.split('--::--')[0];
      this.SocioToAsignNewRutina = res.split('--::--')[1];
     })
     console.log(this.dayToAsignNewRutina);
     console.log(this.SocioToAsignNewRutina);


}

  async inicio(){
    await this.loadEjercicios()
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
  };

  asignEjerciciosToTodo(){
    this.todo = [];
    this.reOrderList();
    this.rutinasService.newListEditEjercicios.forEach((res:any)=>{
      let index = this.ejercicios.findIndex(item=>item._id === res.id);
      if (index === -1 && res.id != 'c1ecu1t029092005')return;
      if (res.id === 'c1ecu1t029092005'){
        this.todo.push({ _id:'c1ecu1t029092005',nombre:'c1ecu1t029092005', url:res.url, grupoMuscular:'', series:res.series, reps:res.ciruitoseries, description: res.color });
        let ejerciciosList : ejercicio[] = [];
        res.series.forEach((eje:any)=>{
          let index = this.ejercicios.findIndex(item=>item._id===eje.iden);
          if (index != -1){
            ejerciciosList.push(this.ejercicios[index])
            ejerciciosList[ejerciciosList.length-1].reps = eje.reps
          }
        })
        if ( ejerciciosList.length > 0 )
        this.todo[this.todo.length-1].series = ejerciciosList;
      }else{
        this.todo.push(this.ejercicios[index]);
        this.todo[this.todo.length-1].reps = res.reps;
        this.todo[this.todo.length-1].series = res.series;
      }
      this.reOrderList()
    })
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

  closeDialogToCode(res:any): void {
    this.rutinasService.actualizarRutina(res);
    this.closeAnimation = true;
    this.uploadRutina = {name:'',grupoMuscular:'', ejercicios:[]};
    setTimeout(() => {
      this.rutinasService.actualizarEstado(false);
      this.closeAnimation = false;
    }, 200);
  }

  public error : { e:boolean, msg: string } = { e:false, msg:'' }

  public uploadRutina : rutina = {name:'',grupoMuscular:'', ejercicios:[]}


  async ingresar(){
    //if ( this.form.invalid ) { this.loadErrorMsg('Debe colocar un nombre y seleccionar un grupo muscular'); return; };
    if ( this.todo.length <= 0 ) { this.loadErrorMsg('Debe haber al menos un ejercicio'); return; };
    this.uploadRutina.name = this.form.get("nombre")!.value;
    //if ( this.form.get("newgrupoMuscular")?.value != '' ){ this.uploadRutina.grupoMuscular = this.form.get("newgrupoMuscular")?.value } else {
    //  this.uploadRutina.grupoMuscular = this.form.get("grupoMuscular")?.value.name
    //}
    this.uploadRutina.grupoMuscular = '.';
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
          if ( index === 0){ color = ejercicio.description }
        })
        if(listaEjercicios.length > 0){
          this.uploadRutina.ejercicios.push({ id:'c1ecu1t029092005', series:listaEjercicios, ciruitoseries:ejercicio.reps, color: color });
        }

      }
    });

    if ( this.uploadRutina.ejercicios.length > 0 && errors === 0 ){
      this.closed.emit(this.uploadRutina);
      if (this.dayToAsignNewRutina === 'Principiante' || this.dayToAsignNewRutina === 'Intermedio ' || this.dayToAsignNewRutina === 'Avanzado ' ){
        (await this.rutinasService.updateRutina(this.SocioToAsignNewRutina, this.uploadRutina.ejercicios)).subscribe((res:any)=> {
          this.rutinasService.actualizarRutina(res);
          this.alertService.showAlert("inf", "Rutina actualizada correctamente");
          this.closeAnimation = true;
          setTimeout(() => {
            this.rutinasService.actualizarEstado(false);
            this.closeAnimation = false;
          }, 200);
        })
      }else {
        (await this.rutinasService.addRutina(this.uploadRutina)).subscribe( (res:any) =>{
        },async (err : any) => {
          console.log(err);
          (await this.rutinasService.setRutinaToClient(this.SocioToAsignNewRutina,this.dayToAsignNewRutina,err.error.text)).subscribe((res:any) => {
            console.log(res)
            this.closeDialogToCode(res);
          })
        })

        this.alertService.showAlert("suc", "Rutina creada correctamente")
      }
    }
    //this.closed.emit(true);
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
        if (this.firstLoad === 0){
          if (this.dayToAsignNewRutina === 'Principiante' || this.dayToAsignNewRutina === 'Intermedio ' || this.dayToAsignNewRutina === 'Avanzado ' ){
            this.asignEjerciciosToTodo()
          }
          this.firstLoad = 1;
        }

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
    if (reps === undefined) {if (add < 0) {return 0} else {return 1}};
    if ( add < 0 && reps <= 0 ) {return 0};
    if (reps)return reps + add;
    if (add < 0 ){ return 0 }
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

}

