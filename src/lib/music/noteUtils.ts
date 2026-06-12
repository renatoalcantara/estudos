// Conversões entre frequência, número MIDI, nota e cents (temperamento igual).

export const A4 = 440

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export const SOLFEGE = ['Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si'] as const

export type NoteName = (typeof NOTE_NAMES)[number]

/** MIDI 69 = A4. */
export function freqToMidi(freq: number, a4 = A4): number {
  return 69 + 12 * Math.log2(freq / a4)
}

export function midiToFreq(midi: number, a4 = A4): number {
  return a4 * Math.pow(2, (midi - 69) / 12)
}

/** C-1 corresponde ao MIDI 0. */
export function noteToMidi(name: NoteName, octave: number): number {
  return (octave + 1) * 12 + NOTE_NAMES.indexOf(name)
}

export interface NoteInfo {
  midi: number
  noteName: NoteName
  solfege: string
  octave: number
  /** desvio em cents da nota temperada mais próxima */
  centsOff: number
  /** frequência ideal da nota temperada mais próxima */
  targetFreq: number
}

/** Analisa uma frequência: nota temperada mais próxima + desvio em cents. */
export function analyzeFrequency(freq: number, a4 = A4): NoteInfo {
  const midiFloat = freqToMidi(freq, a4)
  const midi = Math.round(midiFloat)
  const index = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  const targetFreq = midiToFreq(midi, a4)
  const centsOff = 1200 * Math.log2(freq / targetFreq)
  return {
    midi,
    noteName: NOTE_NAMES[index],
    solfege: SOLFEGE[index],
    octave,
    centsOff,
    targetFreq,
  }
}

/** Cents entre uma frequência e um alvo fixo. */
export function centsBetween(freq: number, targetFreq: number): number {
  return 1200 * Math.log2(freq / targetFreq)
}

/** Rótulo letra+oitava, ex.: "E2". */
export function noteLabel(name: NoteName, octave: number): string {
  return `${name}${octave}`
}

/** Solfejo da nota, ex.: "Mi". */
export function solfegeOf(name: NoteName): string {
  return SOLFEGE[NOTE_NAMES.indexOf(name)]
}
