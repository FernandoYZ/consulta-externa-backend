// src/utils/database.util.ts
import type { IRecordSet } from "mssql";

let TIPOS_SQL_CACHE: any = null;

export async function cargarTiposSQL() {
  if (!TIPOS_SQL_CACHE) {
    const sql = await import('mssql');
    TIPOS_SQL_CACHE = {
      Int: sql.Int,
      BigInt: sql.BigInt,
      SmallInt: sql.SmallInt,
      TinyInt: sql.TinyInt,
      Bit: sql.Bit,
      Float: sql.Float,
      Real: sql.Real,
      Decimal: sql.Decimal,
      Numeric: sql.Numeric,
      Money: sql.Money,
      SmallMoney: sql.SmallMoney,
      VarChar: sql.VarChar,
      NVarChar: sql.NVarChar,
      Text: sql.Text,
      NText: sql.NText,
      Char: sql.Char,
      NChar: sql.NChar,
      Date: sql.Date,
      DateTime: sql.DateTime,
      DateTime2: sql.DateTime2,
      DateTimeOffset: sql.DateTimeOffset,
      Time: sql.Time,
      SmallDateTime: sql.SmallDateTime,
      UniqueIdentifier: sql.UniqueIdentifier,
      Binary: sql.Binary,
      VarBinary: sql.VarBinary,
      Image: sql.Image,
      Xml: sql.Xml,
    };
  }
  return TIPOS_SQL_CACHE;
}

/**
 * Tipo de parámetro SQL
 */
export type ParamSQL = {
  tipo: any; // Tipo de mssql (ej: sql.Int, sql.NVarChar(100))
  valor: any;
};

/**
 * Tipo de parámetro de salida para SP
 */
export type ParamSalidaSQL = {
  tipo: any; // Tipo de mssql para output
};

/**
 * Resultado de ejecución de SP con parámetros de salida
 */
export type ResultadoSP<T = any> = {
  recordset: T[];
  output: Record<string, any>;
  returnValue: number;
};

/**
 * Infiere el tipo SQL basado en el valor de JavaScript
 */
export async function inferirTipoSQL(valor: any) {
  const sql = await cargarTiposSQL();

  if (valor === null || valor === undefined) {
    return sql.NVarChar;
  }

  switch (typeof valor) {
    case 'number':
      return Number.isInteger(valor) ? sql.Int : sql.Float;
    case 'boolean':
      return sql.Bit;
    case 'string':
      return sql.NVarChar;
    case 'object':
      if (valor instanceof Date) {
        return sql.DateTime;
      }
      if (Buffer.isBuffer(valor)) {
        return sql.VarBinary;
      }
      return sql.NVarChar;
    default:
      return sql.NVarChar;
  }
}

/**
 * Procesa el resultado de una query según el modo
 * Si retornarPrimero es true y no hay datos, retorna null en lugar de {}
 */
export function procesarResultado<T>(
  recordset: IRecordSet<T> | undefined,
  retornarPrimero: boolean
): T[] | T | null {
  const registros = recordset || [];

  if (retornarPrimero) {
    return registros[0] || null;
  }

  return registros;
}
