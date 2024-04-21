import { Component, OnInit } from '@angular/core';
import { AlertService } from './components/shared/alert.service';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(1000px)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ transform: 'translateX(1000px)', opacity: 0 })),
      ]),
    ]),
  ],

})
export class AppComponent implements OnInit {
  title = 'client';

  public showAlrt = '';
  public message = '';
  public ENLACE_GLOBAL = 'https://backendsporthouse.onrender.com/'

  constructor( private alertService : AlertService ){}

  ngOnInit(){
    this.alertService.alert$.subscribe( (res: any) => {
      this.message = res.message;
      this.showAlrt = res.type;
      setTimeout(() => {
        this.showAlrt = '';
      }, res.time);
    });
  }

}
