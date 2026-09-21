import { hora } from "@/lib/formato";

/**
 * Relógio congelado do mock. Todas as telas consideram que "agora" é este
 * instante, para os números serem estáveis em qualquer dia de validação.
 * Terça-feira, 15 de setembro de 2026, 14:32 (fuso de Mato Grosso do Sul).
 */
export const AGORA = new Date(2026, 8, 15, 14, 32);
export const HOJE_ISO = "2026-09-15";
export const HORA_ATUAL = 14;

/** Horário do último sync leve concluído e intervalo configurado. */
export const ULTIMO_SYNC = new Date(2026, 8, 15, 14, 30);
export const INTERVALO_SYNC_MIN = 2;

/** Sync é da conta, não de uma tela: qualquer aba do Dashboard mostra o mesmo horário. */
export const ATUALIZADO_AS = hora(ULTIMO_SYNC);

/** "há 2 min" — para o subtítulo do Dashboard, no lugar de uma frase fixa. */
const MINUTOS_DESDE_SYNC = Math.floor((AGORA.getTime() - ULTIMO_SYNC.getTime()) / 60000);
export const SYNC_RELATIVO = MINUTOS_DESDE_SYNC <= 0 ? "agora mesmo" : `há ${MINUTOS_DESDE_SYNC} min`;
