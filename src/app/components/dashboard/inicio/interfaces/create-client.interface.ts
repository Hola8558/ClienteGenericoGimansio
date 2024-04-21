export interface createClient {
    nombre: string;
    apellidos: string;
    ncuenta: string;
    ultimoPago:string;
    fechaVencimiento:string;
    tipoMensualidad:string;
    numeroCelular: string;
    numeroCelularEmergencia: string;
    precioConvenio?:number;
    gender ?: string;
    pass ?: string;
}
