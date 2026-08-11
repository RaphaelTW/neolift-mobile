# Fluxo de atualização — NeoLift v1.5.0

## Fonte de versão

O aplicativo consulta releases públicas do GitHub em:

`https://api.github.com/repos/<owner>/<repo>/releases?per_page=100`

Não é necessário token para consultar releases de um repositório público dentro dos limites anônimos do GitHub.

O app ignora drafts e prereleases e compara versões estáveis usando SemVer.
Entre as versões mais novas, seleciona a primeira release que possua um asset `.apk`
publicado e não vazio, priorizando o nome `NeoLift-v<versão>.apk`.

Ao tocar em **Verificar agora** no Android, a consulta e o download acontecem no
mesmo fluxo. Ao final, o botão muda para **Instalar atualização**.

## Regra de defasagem

A defasagem é calculada pelo **número real de releases estáveis mais novas** que a versão instalada, e não apenas pela diferença matemática dos números da versão.

Exemplo:

- instalada: `1.1.0`
- releases publicadas: `1.1.1`, `1.1.2`, `1.2.0`
- defasagem: **3 releases**

### 1 a 3 releases atrás

No Android standalone:

1. o app detecta a nova versão na inicialização;
2. baixa o APK da release mais recente para a pasta privada do app;
3. mostra uma confirmação dentro do NeoLift;
4. ao escolher **Atualizar agora**, abre o instalador nativo do Android.

O usuário pode escolher **Depois** e instalar posteriormente em Configurações.

### 4 ou mais releases atrás

No Android standalone:

1. o app detecta que existem 4+ releases estáveis mais novas;
2. baixa automaticamente **somente a release mais recente**;
3. abre automaticamente o instalador nativo do Android.

Isso evita instalar versões intermediárias uma por uma.

> Android não permite que um aplicativo comum instalado pelo usuário conclua silenciosamente a instalação de outro APK. Mesmo no modo 4+, a tela de instalação do sistema continua exigindo a autorização/confirmação definida pelo Android. Instalação realmente silenciosa exige cenário corporativo Device Owner/MDM, app privilegiado do sistema ou dispositivo modificado, o que não é adotado pelo NeoLift.

## APK da release

A release mais recente precisa possuir um asset terminado em `.apk`, por exemplo:

`NeoLift-v1.1.0.apk`

O arquivo é armazenado em `documentDirectory/updates/v<versão>/`. Cada versão
possui seu próprio cache, impedindo que um APK antigo seja usado para uma release
nova. O download usa a extensão temporária `.download`, valida o tamanho informado
pelo GitHub e só então move o arquivo para o nome definitivo.

Se o arquivo estiver vazio, incompleto ou tiver tamanho diferente do asset da
release, ele é descartado e baixado novamente.

## Permissão Android

`android.permission.REQUEST_INSTALL_PACKAGES` está declarada no `app.json`.

Dependendo da versão/configuração do Android, o usuário também precisa permitir **Instalar apps desconhecidos** para o NeoLift.

## Expo Go

Esse fluxo deve ser testado em build Android standalone/dev build. O Expo Go não substitui o binário do NeoLift e não deve ser usado para validar instalação de APK de release.

## iOS

O iOS pode usar o GitHub para detectar versão/notas, mas não permite que um app comum baixe uma release e substitua silenciosamente seu próprio binário. A distribuição deve usar App Store, TestFlight ou outro canal autorizado pela Apple.
