import type { Cita, CitaBody } from "./citas.types";

// Datos de ejemplo en memoria
let citasDB: Cita[] = [
  {
    id: 1,
    fecha: new Date("2024-08-15T10:00:00.000Z").toISOString(),
    paciente: "Juan Pérez",
    motivo: "Consulta de rutina",
  },
  {
    id: 2,
    fecha: new Date("2024-08-15T11:30:00.000Z").toISOString(),
    paciente: "Ana Gómez",
    motivo: "Dolor de cabeza persistente",
  },
];

let nextId = 3;

export class CitasService {
  /**
   * Devuelve todas las citas.
   */
  async getAll(): Promise<Cita[]> {
    return citasDB;
  }

  /**
   * Busca una cita por su ID.
   */
  async getById(id: number): Promise<Cita | undefined> {
    return citasDB.find((c) => c.id === id);
  }

  /**
   * Crea una nueva cita.
   */
  async create(data: CitaBody): Promise<Cita> {
    const nuevaCita: Cita = { id: nextId++, ...data };
    citasDB.push(nuevaCita);
    return nuevaCita;
  }

  /**
   * Actualiza una cita existente.
   */
  async update(id: number, data: CitaBody): Promise<Cita | undefined> {
    const index = citasDB.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    citasDB[index] = { ...citasDB[index], ...data };
    return citasDB[index];
  }

  /**
   * Elimina una cita.
   */
  async delete(id: number): Promise<boolean> {
    const initialLength = citasDB.length;
    citasDB = citasDB.filter((c) => c.id !== id);
    return citasDB.length < initialLength;
  }
}