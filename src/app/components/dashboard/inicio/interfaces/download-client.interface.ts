export interface downloadClient {
  _id: string;
  nombre: string;
  apellidos: string;
  ncuenta: string;
  ultimoPago: string;
  fechaVencimiento: string;
  tipoMensualidad: string;
  numeroCelular: string;
  numeroCelularEmergencia: string;
  profileImg?: string;
  rutinas?:{l:string,M:string,Mi:string,J:string,V:string,S:string};
  gender ?: string;
}

export interface clientsRutinas {
  _id: string;
  nombre: string;
  apellidos: string;
  ncuenta: string;
  rutinas?:{l:string,M:string,Mi:string,J:string,V:string,S:string};
}
