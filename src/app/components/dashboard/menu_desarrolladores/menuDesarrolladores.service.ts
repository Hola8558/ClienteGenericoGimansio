import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor( private http : HttpClient){ }

  private URL : string =  environment.domain + 'clientes';

  async getAllClients(){
    return await this.http.get(this.URL)
  }

}
