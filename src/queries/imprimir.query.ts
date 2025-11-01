// src/queries/imprimir.query.ts
export const QUERY_ATENCION = `
  select
    a.IdAtencion,
    a.IdCuentaAtencion as NroCuenta,
    s.Nombre as Servicio,
    FORMAT(a.FechaIngreso, 'dd/MM/yyyy') as FechaConsulta,
    a.HoraIngreso as HoraAtencion,
    CASE a.idFuenteFinanciamiento
      WHEN 9 THEN 'Estrategia'
      WHEN 5 THEN 'Particular'
      WHEN 4 THEN 'SOAT'
      WHEN 3 THEN 'SIS'
      WHEN 7 THEN 'SALUDPOL'
      ELSE 'Otro'
    END AS Financiamiento
  from Atenciones a
  inner join Servicios s on a.IdServicioIngreso = s.IdServicio
  where a.IdCuentaAtencion = @idCuentaAtencion
`;

export const QUERY_PACIENTE = `
  select
    FCA.IdPaciente,
    RTRIM(LTRIM(P.ApellidoPaterno + ' ' + ISNULL(P.ApellidoMaterno, '') + ' ' + P.PrimerNombre)) AS NombrePaciente,
    RTRIM(LTRIM(P.NroDocumento)) as Documento,
    P.NroHistoriaClinica AS Historia,
    A.Edad,
    case a.IdTipoEdad
    when 1 then 'años'
    when 2 then 'meses'
    when 3 then 'días'
    when 4 then 'horas'
    else 'otro'
    end as TipoEdad,
      ISNULL(PDA.antecedQuirurgico, 'No refiere') AS Quirurgico,
      ISNULL(PDA.antecedPatologico, 'No refiere') AS Patologico,
      ISNULL(PDA.antecedAlergico, 'No refiere') AS Alergia,
      ISNULL(PDA.antecedObstetrico, 'No refiere') AS Obstetrico,
      ISNULL(PDA.antecedFamiliar, 'No refiere') AS Familiar,
      ISNULL(PDA.antecedentes, 'No refiere') AS Otros,
      RTRIM(LTRIM(E.ApellidoPaterno + ' ' + E.ApellidoMaterno + ' ' + E.Nombres)) AS NombreMedico,
      M.colegiatura
  from Pacientes P
  inner join FacturacionCuentasAtencion FCA on p.IdPaciente = FCA.IdPaciente
  inner join Atenciones a on fca.IdCuentaAtencion = a.IdCuentaAtencion
  inner join PacientesDatosAdicionales PDA on p.IdPaciente = pda.idPaciente
  inner join Medicos m on a.IdMedicoIngreso = m.IdMedico
  inner join Empleados e on m.IdEmpleado = e.IdEmpleado
  where FCA.IdCuentaAtencion = @idCuentaAtencion
    `;

export const QUERY_TRIAJE = `
  select
    ISNULL(ACE.TriajePeso, 0) AS Peso,
    ISNULL(ACE.TriajeTalla, 0) AS Talla,
    ISNULL(ACE.TriajePerimCefalico, 0) AS PCef,
    ISNULL(ACE.TriajePerimAbdominal, 0) AS Pab,
    ISNULL(ACE.TriajeTemperatura, 0) AS Temp,
    ACE.TriajePresion AS Presion,
    ISNULL(ACE.TriajePulso, 0) AS Pulso,
    ISNULL(ACE.TriajeFrecRespiratoria, 0) AS FrecResp,
    ISNULL(ACE.TriajeSaturacion, 0) AS Saturacion,
    ISNULL(ACE.TriajeHemoglobina, 0) AS HB,
    ISNULL(ACE.CitaMotivo, '-') AS MotivoConsulta,
    ISNULL(ACE.CitaExamenClinico, '-') AS ExamenClinico,
    ISNULL(ACE.CitaTratamiento, '-') AS Tratamiento,
    ISNULL(ACE.CitaObservaciones, '-') AS Observaciones,
    -- Cálculo del IMC
    CASE 
      WHEN ISNUMERIC(ACE.TriajePeso) = 1 AND ISNUMERIC(ACE.TriajeTalla) = 1 AND CONVERT(FLOAT, ACE.TriajeTalla) > 0
      THEN ROUND(
        CONVERT(FLOAT, ACE.TriajePeso) / POWER(CONVERT(FLOAT, ACE.TriajeTalla) / 100.0, 2), 2
      )
      ELSE NULL
    END AS IMC
  from SIGH_EXTERNA..atencionesCE ace
  LEFT JOIN SIGH..Atenciones A ON A.IdAtencion=ACE.idAtencion
  WHERE a.IdCuentaAtencion =@idCuentaAtencion
`;

export const QUERY_DIAGNOSTICO = `
  select
    Ate.IdCuentaAtencion,
    RTRIM(LTRIM(D.CodigoCIE10)) AS CodigoCIE10,
    RTRIM(LTRIM(D.Descripcion)) AS DescripcionDx,
    SD.Codigo COLLATE Modern_Spanish_CI_AS AS Tipo_Dx
  from AtencionesDiagnosticos as AD
  LEFT JOIN SIGH..Diagnosticos AS D ON D.IdDiagnostico = AD.IdDiagnostico
  left join SIGH..Atenciones ate on ad.IdAtencion = ate.IdAtencion
  LEFT JOIN SIGH..SubclasificacionDiagnosticos AS SD ON SD.IdSubclasificacionDx = AD.IdSubclasificacionDx
  where ate.IdCuentaAtencion = @idCuentaAtencion
`;

export const QUERY_CPT = `
SELECT DISTINCT top 10
    fos.IdCuentaAtencion,
    fc.Codigo,
    fc.Nombre
FROM dbo.FactOrdenServicio AS fos
INNER JOIN dbo.FacturacionServicioDespacho AS fsd ON fsd.IdOrden = fos.IdOrden
LEFT JOIN dbo.FactCatalogoServicios AS fc ON fc.IdProducto = fsd.IdProducto
left join SIGH..Atenciones ate on fos.IdCuentaAtencion = ate.IdCuentaAtencion
WHERE fos.IdCuentaAtencion = @idCuentaAtencion
  AND fc.Codigo NOT IN ('992031','99203','99207','056','CO005','9703501','99215.28','99215.31','99215.16', '99215.32','59515','99215.35','99215.36','99215.02','99215.30','99215.11','99215.21', '99215.07',
  '99215.26','99215.12','99215.27','58605','070','59410','0555','58611','59812','99215.04')
  AND fos.IdPuntoCarga NOT IN ('2','3','4','11','20','21','22','23','31','32','33','34')
`;

export const QUERY_MEDICAMENTOS = `
select
    RTRIM(LTRIM(fcbi.Codigo)) AS Codigo,
    RTRIM(LTRIM(fcbi.Nombre)) as Medicamento,
    rd.CantidadPedida
  from RecetaCabecera rc
  INNER JOIN dbo.RecetaDetalle AS rd ON rd.idReceta = rc.idReceta
  INNER JOIN dbo.FactCatalogoBienesInsumos AS fcbi ON rd.idItem = fcbi.IdProducto
  inner join dbo.FactPuntosCarga as fpun on rc.IdPuntoCarga = fpun.IdPuntoCarga
left join SIGH..Atenciones ate on rc.IdCuentaAtencion = ate.IdCuentaAtencion
WHERE rc.idCuentaAtencion = @idCuentaAtencion
and fpun.IdPuntoCarga = 5
`;

export const QUERY_PUNTOS = `
  select
      RTRIM(LTRIM(fcbi.Codigo)) AS Codigo,
      RTRIM(LTRIM(fcbi.Nombre)) as Medicamento,
      rd.CantidadPedida
    from RecetaCabecera rc
    INNER JOIN dbo.RecetaDetalle AS rd ON rd.idReceta = rc.idReceta
    INNER JOIN dbo.FactCatalogoServicios AS fcbi ON rd.idItem = fcbi.IdProducto
    inner join dbo.FactPuntosCarga as fpun on rc.IdPuntoCarga = fpun.IdPuntoCarga
  left join SIGH..Atenciones ate on rc.IdCuentaAtencion = ate.IdCuentaAtencion
  WHERE rc.idCuentaAtencion = @idCuentaAtencion
  and fpun.IdPuntoCarga = @puntoCarga
`;

export const QUERY_DATOS_HOSPITAL = `
SELECT
    MAX(CASE WHEN Codigo = 'NOMBRE' THEN ValorTexto END) AS nombre,
    MAX(CASE WHEN Codigo = 'DIRECCION' THEN ValorTexto END) AS direccion,
    MAX(CASE WHEN Codigo = 'TELEFONO' THEN ValorTexto END) AS telefono,
    MAX(CASE WHEN Codigo = 'RUC_EESS' THEN ValorTexto END) AS ruc
FROM Parametros
WHERE Tipo = 'DATOS_GENERALES'
  AND Codigo IN ('RUC_EESS', 'DIRECCION', 'TELEFONO', 'NOMBRE');
`;

export const QUERY_ESPECIALIDADES_INTERCONSULTA = `
SELECT
	MAX(CASE WHEN rn = 1 THEN LTRIM(RTRIM(Nombre)) END) AS Especialidad1,
	MAX(CASE WHEN rn = 2 THEN LTRIM(RTRIM(Nombre)) END) AS Especialidad2,
	MAX(CASE WHEN rn = 3 THEN LTRIM(RTRIM(Nombre)) END) AS Especialidad3
FROM (
	SELECT 
		e.Nombre,
		ROW_NUMBER() OVER (ORDER BY e.Nombre) AS rn
	FROM AtencionesSolicitudEspecialidades ase
	INNER JOIN Especialidades e ON ase.IdEspecialidad = e.IdEspecialidad
	INNER JOIN Atenciones a on ase.IdAtencion = a.IdAtencion
	WHERE a.IdCuentaAtencion = @idCuentaAtencion and ase.IdEstado=1
) AS sub;
`;