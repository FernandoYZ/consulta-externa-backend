import { PacientesRepository } from "./pacientes.repository";
import type { Paciente, PacienteBody } from "./pacientes.types";

export class PacientesService {
  // Inyectamos el repositorio en el constructor
  constructor(private readonly pacientesRepository: PacientesRepository) {}

  async getAll(): Promise<Paciente[]> {
    // Lógica de negocio aquí (si la hubiera)
    console.log("SERVICE: Pidiendo todos los pacientes al repositorio.");
    return this.pacientesRepository.getAll();
  }

  async getById(id: number): Promise<Paciente | undefined> {
    console.log(`SERVICE: Pidiendo paciente con ID ${id} al repositorio.`);
    return this.pacientesRepository.getById(id);
  }

  async create(data: PacienteBody): Promise<Paciente> {
    console.log("SERVICE: Pidiendo la creación de un paciente al repositorio.");
    // Ejemplo de lógica de negocio:
    // const pacienteExistente = await this.pacientesRepository.findByDocumento(data.documento);
    // if (pacienteExistente) {
    //   throw new Error("El paciente ya existe");
    // }
    return this.pacientesRepository.create(data);
  }
}