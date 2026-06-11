import { CONTACT_EMAIL } from '../routes/paths'

// Doações via Pix.
// TODO: substituir `pixKey` pela chave Pix real e, se quiser um QR Pix oficial,
// preencher `pixPayload` com o código "copia e cola" (BR Code EMV) gerado pelo banco.
// Enquanto `pixPayload` estiver vazio, o QR codifica a própria chave (apenas como texto).
export const DONATIONS = {
  intro:
    'O Afinador é gratuito e sem anúncios. Se ele te ajuda, considere apoiar o projeto com qualquer valor via Pix. Obrigado! 🙏',
  pixKeyLabel: 'Chave Pix (e-mail)',
  pixKey: CONTACT_EMAIL,
  pixPayload: '',
}

/** O que o QR Code deve codificar: o payload "copia e cola" se houver, senão a chave. */
export function pixQrValue(): string {
  return DONATIONS.pixPayload.trim() || DONATIONS.pixKey
}
