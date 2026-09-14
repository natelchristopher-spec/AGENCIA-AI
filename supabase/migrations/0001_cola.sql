-- Cola de contenido. Una fila por pieza, desde que es solo un ángulo propuesto
-- hasta que se publicó o se descartó.

create table if not exists cola_contenido (
  id            uuid primary key default gen_random_uuid(),
  perfil_id     text not null,
  estado        text not null default 'propuesta',
  canal         text not null,

  -- El ángulo, definido antes de generar.
  persona_id    text not null,
  creencia_id   text,
  objetivo      text not null,
  tematica      text,
  fuente        text,

  -- La pieza generada.
  contenido     jsonb,
  -- El aprendizaje de la ficha: la clave semántica para anti-redundancia.
  aprendizaje   text,

  -- Qué dijo el crítico. Se guarda aunque haya aprobado.
  veredicto     text,
  violaciones   jsonb,
  rondas        int,

  -- Qué dijo el humano. Comparado con `veredicto` da la tasa de coincidencia,
  -- que es el dato que decide si el sistema puede publicar sin supervisión.
  humano_decision text,
  humano_motivo   text,
  humano_fecha    timestamptz,

  programada_para timestamptz,
  publicada_en    timestamptz,
  url_publicada   text,
  error           text,

  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- La cola de trabajo: lo pendiente de decisión, por perfil.
create index if not exists cola_pendientes_idx
  on cola_contenido (perfil_id, estado, creado_en desc);

-- El scheduler: qué toca publicar.
create index if not exists cola_programadas_idx
  on cola_contenido (estado, programada_para)
  where estado = 'programada';

-- Anti-redundancia: las últimas piezas publicadas de un perfil.
create index if not exists cola_publicadas_idx
  on cola_contenido (perfil_id, publicada_en desc)
  where estado = 'publicada';

-- Freno de emergencia. Una fila por perfil; si `activo` es false, el
-- scheduler no publica nada. Frenar no requiere un deploy.
create table if not exists operacion_config (
  perfil_id     text primary key,
  activo        boolean not null default false,
  -- Piezas por semana que genera el cron.
  cadencia      int not null default 3,
  -- Horas de ventana de veto antes de publicar. 0 = publica sin esperar.
  ventana_veto  int not null default 24,
  actualizado_en timestamptz not null default now()
);
