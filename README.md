<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/branding/neolift-wordmark-light.png" />
    <img src="./assets/branding/neolift-wordmark-dark.png" width="390" alt="NeoLift" />
  </picture>

  <p><strong>Treino adaptativo, evolução de carga e acompanhamento corporal — offline-first.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Expo-SDK%2057-111111?logo=expo" alt="Expo SDK 57" />
    <img src="https://img.shields.io/badge/React%20Native-0.86-7C3AED?logo=react" alt="React Native" />
    <img src="https://img.shields.io/badge/SQLite-local-9D5CFF" alt="SQLite" />
    <img src="https://img.shields.io/badge/version-v1.3.0-A855F7" alt="v1.3.0" />
  </p>
</div>

## NeoLift

Aplicativo React Native + Expo para Android e iOS. O catálogo usa o `free-exercise-db`; perfil, treinos, medidas, séries, cargas, progresso e preferências ficam no SQLite do aparelho.

A v1.3.0 adota uma identidade roxa, tema claro realmente claro e tema escuro preto fosco, além de animações ambientes discretas.

<details>
<summary><strong>O que existe nesta versão</strong></summary>

- onboarding com sexo, idade, peso, nível, foco e dias semanais;
- Iniciante, Intermediário e Avançado / profissional;
- objetivos: Emagrecer, Ganhar massa muscular e Ganhar peso e massa;
- plano semanal e rotação mensal de exercícios;
- semanas de Base, Volume, Progressão e Consolidação;
- sugestão de carga baseada no histórico;
- feedback de esforço: Sobrou / Ideal / Pesou;
- histórico detalhado de treinos;
- gráficos por exercício e grupo muscular;
- peso e medidas corporais por data;
- temas Sistema, Claro e Escuro;
- GitHub Releases + política Android de atualização 4+.

</details>

## Motor de recomendação

A primeira carga é sempre escolhida pelo usuário. Depois de concluir sessões, o app usa a carga registrada e o feedback do exercício para sugerir uma próxima carga conservadora.

```text
Pesou                      -> ~ -5%
Ideal                      -> manter
Sobrou uma vez             -> ~ +2,5%
Sobrou duas vezes seguidas -> ~ +5%
```

A sugestão pode ser ignorada a qualquer momento.

O planejamento mensal é explicado em [`docs/TRAINING_ENGINE.md`](docs/TRAINING_ENGINE.md).

## Arquitetura

```mermaid
flowchart TD
  UI[Expo Router UI] --> CTX[AppProvider]
  CTX --> DB[(SQLite local)]
  CTX --> PLAN[Training Plan Engine]
  CTX --> CAT[Exercise Catalog]
  CTX --> UPD[GitHub Update Service]
  DB --> PROFILE[Perfil + medidas]
  DB --> WORKOUT[Workouts + sets + esforço]
  WORKOUT --> LOAD[Sugestão de carga]
  PROFILE --> PLAN
  WORKOUT --> CHARTS[Gráficos]
```

```text
app/
├── (tabs)/
│   ├── index.tsx          # dashboard
│   ├── exercises.tsx      # catálogo
│   ├── workout.tsx        # plano semanal/mensal
│   ├── progress.tsx       # carga + corpo
│   └── settings.tsx       # perfil e ajustes
├── onboarding.tsx
├── profile/
│   ├── edit.tsx
│   └── measurements.tsx
└── workout/
    ├── session.tsx
    └── history.tsx
```

## Rodar o projeto

```bash
npm install
npm run sync:exercises
npx expo start
```

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

Validação:

```bash
npm run typecheck
npm run release:check
```

## Build APK

Instale e autentique o EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Gere APK interno:

```bash
eas build -p android --profile preview
```

O perfil `preview` em `eas.json` usa `buildType: apk`.

## Publicar v1.3.0

```bash
git add .
git commit -m "feat(training): adiciona plano adaptativo e evolução corporal" -m "Cria onboarding físico, planejamento semanal e mensal, sugestão opcional de carga pelo histórico, medidas corporais, histórico detalhado, nova identidade roxa e animações de fundo."
git push origin main

git tag -a v1.3.0 -m "NeoLift v1.3.0 — Adaptive Training"
git push origin v1.3.0

gh release create v1.3.0 --title "NeoLift v1.3.0 — Adaptive Training" --notes-file RELEASE-v1.3.0.md
```

Depois do EAS Build, baixe o APK, renomeie para `NeoLift-v1.3.0.apk` e anexe:

```bash
gh release upload v1.3.0 ./NeoLift-v1.3.0.apk --clobber
```

## Atualização Android

O app lista releases estáveis do GitHub. Com 1–3 releases novas, baixa a mais recente e pergunta se o usuário quer instalar. Com 4+ releases novas, baixa a última e abre o instalador automaticamente. A confirmação final continua pertencendo ao Android.

## Dados e privacidade

Não existe conta obrigatória. O app guarda localmente:

- perfil;
- peso e circunferências;
- treinos;
- séries, repetições e cargas;
- feedback de esforço;
- favoritos e preferências.

## Catálogo

Fonte: `yuhonas/free-exercise-db`. O catálogo pode ser empacotado com:

```bash
npm run sync:exercises
```

## Versão

**NeoLift v1.3.0 — Adaptive Training**
