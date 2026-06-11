/**
 * Configuração do Capacitor — INERTE por enquanto.
 *
 * O app ainda NÃO instala dependências do Capacitor (mantém a árvore de deps limpa).
 * Este arquivo documenta a configuração para quando empacotarmos como app iOS/Android.
 *
 * Passos futuros para o app nativo:
 *   1. npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
 *   2. Gerar o bundle web com base relativa:  VITE_DEPLOY_TARGET=native npm run build
 *   3. npx cap add ios && npx cap add android && npx cap sync
 *
 * Permissões de microfone a adicionar no projeto nativo:
 *   - iOS  (ios/App/App/Info.plist):
 *       <key>NSMicrophoneUsageDescription</key>
 *       <string>O Afinador usa o microfone para detectar a afinação do seu instrumento.</string>
 *   - Android (android/app/src/main/AndroidManifest.xml):
 *       <uses-permission android:name="android.permission.RECORD_AUDIO" />
 */
const config = {
  appId: 'com.renatoalcantara.afinador',
  appName: 'Afinador',
  webDir: 'dist',
}

export default config
