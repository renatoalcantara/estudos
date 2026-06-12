import { PIX_KEY } from '../routes/paths'

// Doações via Pix.
// TODO: substituir `pixKey` pela chave Pix real e, se quiser um QR Pix oficial,
// preencher `pixPayload` com o código "copia e cola" (BR Code EMV) gerado pelo banco.
// Enquanto `pixPayload` estiver vazio, o QR codifica a própria chave (apenas como texto).
export const DONATIONS = {
  intro:
    'Esse app roda a café e boa vontade ☕. Se ele te salvou antes de um show, manda um Pix de qualquer valor. Vai pra gasolina dos próximos updates 🙏',
  pixKeyLabel: 'Chave Pix (é o meu e-mail)',
  pixKey: PIX_KEY,
  pixPayload: '',
}

/** O que o QR Code deve codificar: o payload "copia e cola" se houver, senão a chave. */
export function pixQrValue(): string {
  return DONATIONS.pixPayload.trim() || DONATIONS.pixKey
}
