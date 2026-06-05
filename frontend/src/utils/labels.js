export const CONTRACT_LABELS = {
  FULL_TIME: 'Tempo pieno',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contratto',
  INTERNSHIP: 'Stage',
  FREELANCE: 'Freelance',
}

export const APPLICATION_STATUS_LABELS = {
  SUBMITTED: 'Inviata',
  REVIEWED: 'In revisione',
  ACCEPTED: 'Accettata',
  REJECTED: 'Rifiutata',
}

export const TONE_LABELS = {
  FORMAL: 'Formale',
  FRIENDLY: 'Amichevole',
  ENTHUSIASTIC: 'Entusiasta',
  CONCISE: 'Conciso',
}

export const contractLabel = (v) => CONTRACT_LABELS[v] || v
export const statusLabel = (v) => APPLICATION_STATUS_LABELS[v] || v
export const toneLabel = (v) => TONE_LABELS[v] || v
