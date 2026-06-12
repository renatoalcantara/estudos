# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev            # Vite dev server (http://localhost:5173)
npm run build          # tsc (typecheck que FALHA o build) + vite build → dist/
npm run typecheck      # tsc --noEmit (verificação isolada)
npm run preview        # serve o build de produção localmente
npm run generate-icons # regenera os ícones PWA com sharp a partir de public/
```

Não há suíte de testes nem linter configurados. **`npm run build` é o portão de qualidade**: o `tsc` roda antes do bundle e qualquer erro de tipo aborta o build. Rode-o (ou `npm run typecheck`) antes de concluir uma mudança.

No Windows/PowerShell os binários do `.bin` não resolvem como no Unix — use sempre os scripts npm (`npm run build`), nunca `tsc` direto.

## Arquitetura

PWA de afinador (pt-BR) em React 18 + Vite + TypeScript estrito + Tailwind. Todo o processamento de áudio é local (nada vai para a rede). Roteamento via `HashRouter` (compatível com Capacitor e subdiretórios).

### Cadeia de áudio (o coração do app)

O sinal flui por uma pilha de hooks, cada um numa camada de abstração:

```
useMicrophone  → getUserMedia + AudioContext + AnalyserNode (+ GainNode de entrada)
   ↓ analyser
usePitchDetection → laço requestAnimationFrame: RMS/gate de ruído + detectPitch() → RawReading {frequency, clarity, rms}
   ↓ raw reading
useTuner       → suavização, correção de oitava, trava de nota, histerese de "afinado" → TunerReading (estado de UI)
```

- **`useMicrophone`** (`src/hooks/useMicrophone.ts`): ciclo de vida do microfone. `start()` **deve** ser chamado dentro de um gesto do usuário (exigência do iOS Safari). Faz auto-recuperação: se a faixa de áudio "morre" (bloqueio de tela, app rouba o mic) ou ao voltar do segundo plano, readquire o microfone sozinho. Áudio capturado com `echoCancellation`/`autoGainControl`/`noiseSuppression` **desligados** (atrapalhariam a detecção de tom).
- **`usePitchDetection`** (`src/hooks/usePitchDetection.ts`): laço rAF que lê o domínio do tempo, calcula RMS e chama o detector. Modelo de persistência "último quadro bom": enquanto chegam quadros válidos a nota nunca some; só vira `silent` após `HOLD_MS` sem detecção. `level` (medidor VU) é independente da detecção de nota.
- **`detectPitch`** (`src/lib/audio/pitchDetector.ts`): YIN (pitchfinder) como primário, **autocorrelação como fallback** (crucial para o grave do baixo). `clarity` vem sempre da periodicidade no período detectado. Detectores YIN são cacheados por sample rate (iOS usa 48000).
- **`useTuner`** (`src/hooks/useTuner.ts`): orquestra tudo e produz o `TunerReading` que a UI consome. Lógica não-óbvia concentrada aqui:
  - **Correção de oitava**: testa freq × {0.5, 1, 2} contra os alvos das cordas e escolhe o mais próximo — evita o ponteiro cravar quando o detector pega um harmônico no lugar da fundamental.
  - **Trava de nota** (`NOTE_LOCK_FRAMES`): só troca a nota exibida após N quadros consecutivos confirmando a nova nota; segura a anterior durante o transiente da palhetada.
  - **Histerese de afinado** (`IN_TUNE_CENTS` para travar / `IN_TUNE_RELEASE_CENTS` para soltar): o estado "afinado" não pisca na borda.

**Todas as constantes de afinação fina** (janela FFT, gate de ruído, limiares de clareza, quadros de trava, faixa de frequência) vivem em `src/lib/audio/audioConstants.ts` com comentários explicando cada uma. Ajuste o comportamento lá, não espalhado pelo código.

### Estado e configuração

- **`SettingsContext`** (`src/context/SettingsContext.tsx`): fonte única de tema, instrumento ativo, **afinação por instrumento** (`tuningId` mapeado por instrumento), modo (instrumento/cromático) e A4. Tudo persiste em `localStorage` sob o prefixo `afinador:`.
- O **modo** (Instrumento ↔ Cromático) é estado do contexto, **não uma rota** — alternar não desmonta a tela do afinador, então o microfone continua rodando. "Ajustes" é a única seção que é rota de fato (ver `BottomNav`).

### Instrumentos e afinações

`src/lib/instruments/instruments.ts` é o catálogo: cada `Instrument` tem uma lista de `Tuning`s (cada `Tuning` tem `shortName` para os chips e `strings` ordenadas grave→agudo). Para adicionar uma afinação, defina o `Tuning` e inclua na lista do instrumento — a UI (`TuningSelector`, chips de corda) deriva tudo daí automaticamente. Frequências-alvo das cordas são derivadas via `noteToMidi`/`midiToFreq` usando o A4 atual; nada de Hz hardcoded.

### Build / deploy

- **`base` do Vite é a única fonte da verdade** de onde o app é servido (`vite.config.ts`): `/` para web (Vercel), `./` para nativo. Defina `VITE_DEPLOY_TARGET=native` para o bundle do Capacitor — isso ajusta `base`, `start_url` e `scope` do manifesto PWA juntos.
- Deploy web na Vercel (`vercel.json`): SPA rewrite para `index.html`, `dist/assets/*` com cache imutável de 1 ano, `sw.js` sempre revalidado. PWA com auto-update do service worker (`registerType: 'autoUpdate'`) — o `UpdateToast` avisa o usuário.
- **`capacitor.config.ts` está inerte** de propósito: documenta os passos do empacotamento iOS/Android (incluindo as permissões de microfone do Info.plist / AndroidManifest) sem instalar as dependências do Capacitor.

### Design / estilização

Tailwind com tokens **semânticos** via CSS variables (`bg`, `surface`, `text`, `text-soft`, `text-faint`, `border`, `brand`, `success`, `error`) que trocam entre claro/escuro pela classe `.dark` no `<html>`. Use os tokens, não cores cruas — assim os dois temas funcionam de graça. O tema é aplicado antes da primeira pintura por um script inline no `index.html` (evita flash). `DESIGN.md` descreve um design system de marketing genérico do qual o app usa só o esquema de cores; não é a referência da UI funcional.
