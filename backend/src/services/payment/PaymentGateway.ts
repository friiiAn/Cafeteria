export interface CargoParams {
  monto: number;
  token: string;
  referencia: string;
}

export interface CargoResultado {
  aprobado: boolean;
  referencia?: string;
  mensaje?: string;
}

export interface PaymentGateway {
  cobrar(params: CargoParams): Promise<CargoResultado>;
}
