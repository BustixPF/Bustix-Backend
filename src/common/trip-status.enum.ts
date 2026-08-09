export enum TripStatus {
  ON_TIME = 'A_TIEMPO', // Programado y sin retrasos
  BOARDING = 'EMBARCANDO', // Pasajeros abordando
  DEPARTED = 'SALIO', // El bus ya salió
  DELAYED = 'RETRASADO', // Retraso confirmado
  CANCELLED = 'CANCELADO', // Viaje cancelado
  ARRIVED = 'LLEGÓ', // El bus llegó a destino
  IN_TRANSIT = 'EN_RUTA', // El bus está viajando actualmente
  RESCHEDULED = 'REPROGRAMADO', // Cambio de horario oficial
}
