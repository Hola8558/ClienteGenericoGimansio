export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

export interface ejercicio {
  url: string;
  nombre: string;
  description: string;
  grupoMuscular: string;
  _id ?: string;
  series ?: number | ejercicio[];
  reps ?: number;
  ciruitoseries ?: number;
}

export interface grupoMuscular {
  name: string;
  ejercicios: ejercicio[];
}

export interface rutina {
  _id?: string;
  name: string;
  grupoMuscular: string;
  ejercicios: pseaudoEjerciicios[];
  favorites?:number;
}

export interface pseaudoEjerciicios{
  id:string;
  reps?:number;
  series : number | { iden:string, reps: number }[];
  ciruitoseries ?: number;
  color ?: string;
}

export interface rutinasMusculares {
  grupoMuscular: string;
  rutinas : rutina[];
}
