import type { NoteName } from '../music/noteUtils'
import { noteLabel } from '../music/noteUtils'
import type { Instrument, InstrumentId, StringSpec, Tuning } from './types'

function s(note: NoteName, octave: number): StringSpec {
  return { note, octave, label: noteLabel(note, octave) }
}

// Afinação padrão de violão e guitarra (EADGBE), grave → agudo.
const guitarStandard: Tuning = {
  id: 'standard',
  name: 'Padrão (E A D G B E)',
  strings: [s('E', 2), s('A', 2), s('D', 3), s('G', 3), s('B', 3), s('E', 4)],
}

// Ukulele padrão GCEA (reentrante: a 4ª corda G é aguda).
const ukuleleStandard: Tuning = {
  id: 'standard',
  name: 'Padrão (G C E A)',
  strings: [s('G', 4), s('C', 4), s('E', 4), s('A', 4)],
}

// Baixo de 4 cordas (EADG), grave → agudo.
const bassStandard: Tuning = {
  id: 'standard',
  name: 'Padrão (E A D G)',
  strings: [s('E', 1), s('A', 1), s('D', 2), s('G', 2)],
}

export const INSTRUMENTS: Record<InstrumentId, Instrument> = {
  violao: {
    id: 'violao',
    name: 'Violão',
    shortName: 'Violão',
    tunings: [guitarStandard],
    defaultTuningId: 'standard',
  },
  guitarra: {
    id: 'guitarra',
    name: 'Guitarra',
    shortName: 'Guitarra',
    tunings: [guitarStandard],
    defaultTuningId: 'standard',
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele',
    shortName: 'Ukulele',
    tunings: [ukuleleStandard],
    defaultTuningId: 'standard',
  },
  baixo: {
    id: 'baixo',
    name: 'Baixo',
    shortName: 'Baixo',
    tunings: [bassStandard],
    defaultTuningId: 'standard',
  },
}

export const INSTRUMENT_LIST: Instrument[] = [
  INSTRUMENTS.violao,
  INSTRUMENTS.guitarra,
  INSTRUMENTS.ukulele,
  INSTRUMENTS.baixo,
]

export const DEFAULT_INSTRUMENT_ID: InstrumentId = 'violao'

export function getInstrument(id: InstrumentId): Instrument {
  return INSTRUMENTS[id]
}

export function getActiveTuning(instrument: Instrument): Tuning {
  return (
    instrument.tunings.find((t) => t.id === instrument.defaultTuningId) ?? instrument.tunings[0]
  )
}
