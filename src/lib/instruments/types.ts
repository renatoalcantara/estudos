import type { NoteName } from '../music/noteUtils'

export interface StringSpec {
  note: NoteName
  octave: number
  /** rótulo exibido, ex.: "E2" */
  label: string
}

export interface Tuning {
  id: string
  name: string
  /** ordenadas da corda mais grave (índice 0) à mais aguda */
  strings: StringSpec[]
}

export type InstrumentId = 'violao' | 'guitarra' | 'ukulele' | 'baixo'

export interface Instrument {
  id: InstrumentId
  name: string
  shortName: string
  tunings: Tuning[]
  defaultTuningId: string
}
