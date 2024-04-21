import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertSource = new Subject();
  public alert$ = this.alertSource.asObservable();

  constructor() { }

  showAlert( type: string, message : string, time : number = 3000 ) {
    this.alertSource.next({type, message, time});
  }

}
