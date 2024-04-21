import { Component, EventEmitter, Input, NgZone, OnChanges, Output, SimpleChanges } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { ClientService } from '../../clientes.service';
import { downloadClient } from '../../interfaces/download-client.interface';

@Component({
  selector: 'app-cdk-bolsa-info-client',
  templateUrl: './cdk-bolsa-info-client.component.html',
  styleUrls: ['./cdk-bolsa-info-client.component.css'],
  animations: [
    trigger('scaleInTl', [
      state('void', style({ transform: 'scale(0)', 'transform-origin': 'top left', opacity: 0 })),
      state('show', style({ transform: 'scale(1)', 'transform-origin': 'top left', opacity: 1 })),
      transition('void => show', animate('0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940)')),
    ]),
    trigger('scaleOutTr',[
      state('void', style({ transform: 'scale(1)',  'transform-origin': 'top right', opacity: 1 })),
      state('show', style({ transform: 'scale(0)', 'transform-origin': 'top right', opacity: 0 })),
      transition('void => show', animate('0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530)')),
    ]),
    trigger('flipVerticalRight', [
      state('void', style({
        'transform-origin': 'center',
        transform: 'rotateY(0) rotateY(0)',
      })),
      state('show', style({
        'transform-origin': 'center',
        transform: 'rotateY(-180deg) rotateY(-180deg)',
      })),
      transition('void => show', animate('0.4s cubic-bezier(0.455, 0.030, 0.515, 0.955)')),
    ]),
  ]
})
export class CdkBolsaInfoClientComponent implements OnChanges {

  constructor(private ngZone: NgZone, private clientService : ClientService) {}

  @Input() show: { show : string, posX : number, posY: number, aplicarAnimacion: string, _id: string, changeInfo:string, entrada:string } = { show: 'void', posX: 0, posY: 0, aplicarAnimacion: 'void', _id: '',changeInfo: 'void', entrada: '' };
  @Output() showChange: EventEmitter<{ show: string, posX: number, posY: number, aplicarAnimacion: string, _id: string, changeInfo: string, entrada:string }> = new EventEmitter();

  public changeInfloClientReal = 'void';
  public _id = '';
  public client : downloadClient = { _id: '', ncuenta: '', nombre: '', apellidos: '', ultimoPago: '', fechaVencimiento: '', tipoMensualidad: '', numeroCelular: '', numeroCelularEmergencia: '', profileImg: '', gender:'' };
  public error = {e : false, m: ''};
  public change = false;
  public base64Image = '';

  async ngOnChanges(changes: SimpleChanges): Promise<void> {

    // Verifica si la propiedad 'show' ha cambiado
    if (changes['show'] && changes['show'].currentValue['show'] === 'show' && changes['show'] && changes['show'].currentValue['changeInfo'] != 'show' ) {
      this.X = 0;
      this.Y = 0;
    }

    if ( this.show.changeInfo === 'show' ){
      this.show.posX = this.show.posX + this.X;
      this.show.posY = this.show.posY + this.Y;
      this.changeInfloClientReal = 'show';
      setTimeout(() => {
        this.show = { ...this.show,changeInfo: 'void' };
        this.changeInfloClientReal = 'void';
        this.showChange.emit(this.show);
        this.changePosition( this.X, this.Y )
        this.dragPosition = {x: 0, y: 0};
      }, 400);

    }

    if ( this.show._id != this._id ){
      (await this.clientService.getClient(this.show._id)).subscribe(
        ( res : any ) => {
          this.client = res;
          this.client.ultimoPago = this.getRealDate(this.client.ultimoPago);
          this.client.fechaVencimiento = this.getRealDate(this.client.fechaVencimiento);
          this.base64Image = this.client.profileImg?? '';
        },
        err => {
          this.error = { e: true, m: err.error.message };
        }
      );
      localStorage.setItem("id_cdk", `${this.show._id}`);
      if(this.X === 0 && this.Y === 0){
        localStorage.setItem("postionY",`${this.show.posY}` )
        localStorage.setItem("postionX",`${this.show.posX}` )
      }

      if (this.show.entrada){
        setTimeout(() => {
          this.show.entrada = '';
        }, 500);
      }
    }
  }

  dragPosition = {x: 0, y: 0};

  changePosition(x: number, y: number) {
    this.dragPosition = {x: this.show.posX + x, y: this.show.posY + y};
  }

  public X = 0;
  public Y = 0;

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

  closeWindow(){
    this.show.posX = this.show.posX + this.X;
    this.show.posY = this.show.posY + this.Y;
    this.show.aplicarAnimacion = 'show';

    localStorage.removeItem("id_cdk");
    localStorage.removeItem("postionX");
    localStorage.removeItem("postionY");

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.show = { show: 'void', posX: 0, posY: 0, aplicarAnimacion: 'void', _id: '',changeInfo: 'void', entrada:'' };
        this.showChange.emit(this.show);
      }, 500);
    });
  }

  onDragStarted() { }

  dragEnd($event: CdkDragEnd) {
    this.X = $event.source.getFreeDragPosition().x;
    this.Y = $event.source.getFreeDragPosition().y;
    localStorage.setItem("postionY",`${this.show.posY + this.Y}` )
    localStorage.setItem("postionX",`${this.show.posX + this.X}` )
  }

}
