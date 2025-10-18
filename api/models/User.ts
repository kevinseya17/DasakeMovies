export interface User {
  id?: string;
  nombre: string;
  apellidos: string;
  edad: number;
  email: string;
  password: string;
  direccion?: string;
  telefono?: string;
  created_at?: string;
}
