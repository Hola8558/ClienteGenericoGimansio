import { Component, ElementRef, ViewChild } from '@angular/core';
import { ClientService } from '../inicio/clientes.service';

@Component({
  selector: 'app-entrada-socios',
  templateUrl: './entrada-socios.component.html',
  styleUrls: ['./entrada-socios.component.css']
})
export class EntradaSociosComponent {
  @ViewChild('myInput') myInput!: ElementRef;

  constructor( private rutinaService : ClientService ) { }

  public idUsuario='';
  public inputFocused = true

  ngAfterViewInit() {
    // Enfocar el input cuando se carga el componente
    this.myInput.nativeElement.focus();
  }

  public show = false;

  async onEnter() {
    // Acción a realizar cuando se presiona Enter
    this.myInput.nativeElement.focus();

    if ( this.idUsuario != '' ){
      await (await this.rutinaService.findOneClientByCuenta(this.idUsuario)).subscribe( async(res:any) => {
        (await this.rutinaService.registrarAsistencia(res._id)).subscribe(
          (res:any) => {
            const audio = document.getElementById("myAudio") as HTMLAudioElement;
            audio.play();
          }
        )

      }, (err:any) => {
        const audio = document.getElementById("myAudio") as HTMLAudioElement;
            audio.play();

      })
      const audio = document.getElementById("myAudio") as HTMLAudioElement;
            audio.play();

      this.show = true;
      setTimeout((x:any) => {
          this.show = false;
      })
      //this.rutinaService.registrarAsistencia(this.idUsuario)
      this.idUsuario = '';
    }
  }
  focusInput() {
    // Enfocar el input cuando se hace clic en cualquier parte de la página
    this.myInput.nativeElement.focus();
  }
}
