# Fluxo de atualização

## Consulta

O `AppProvider` chama `checkGithubRelease()` ao iniciar. O serviço consulta:

`https://api.github.com/repos/<owner>/<repo>/releases/latest`

A comparação é semântica (`1.2.0` > `1.1.9`).

## Android

Se a release mais nova tiver um asset terminado em `.apk`, o app:

1. baixa o APK para o cache privado com `expo-file-system`;
2. converte o caminho local para um `content://` URI;
3. abre `android.intent.action.VIEW` com MIME `application/vnd.android.package-archive`;
4. entrega a decisão final ao instalador do Android.

O `REQUEST_INSTALL_PACKAGES` está declarado em `app.json`. Em aparelhos que bloqueiam fontes desconhecidas, o Android solicitará/configurará a permissão apropriada.

Esse fluxo exige um **build standalone/dev build**. O Expo Go não é um canal de distribuição do seu APK.

## iOS

iOS não permite que um app comum baixe de uma GitHub Release e substitua silenciosamente seu próprio binário. Mantenha a detecção de versão via GitHub, mas publique a instalação por App Store/TestFlight (ou outro canal permitido para sua organização).

## Release recomendada

- `v1.0.1` como tag;
- notas em `RELEASE-v1.0.1.md`;
- APK com nome `NeoLift-v1.0.1.apk` anexado à release Android;
- `app.json` atualizado em `version`, `android.versionCode` e `ios.buildNumber`.
