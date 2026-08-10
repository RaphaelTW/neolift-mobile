<div align="center">
  <img src="./assets/icon.png" width="112" alt="NeoLift logo" />
  <h1>NeoLift</h1>
  <p><strong>Treino offline-first, progresso visual e catálogo aberto de exercícios.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Expo-SDK%2057-111827?logo=expo" alt="Expo SDK 57" />
    <img src="https://img.shields.io/badge/React%20Native-0.86-087EA4?logo=react" alt="React Native 0.86" />
    <img src="https://img.shields.io/badge/Android-7%2B-3DDC84?logo=android" alt="Android 7+" />
    <img src="https://img.shields.io/badge/iOS-16.4%2B-111111?logo=apple" alt="iOS 16.4+" />
    <img src="https://img.shields.io/badge/storage-SQLite%20local-4F46E5" alt="SQLite local" />
    <img src="https://img.shields.io/badge/version-v1.0.0-42D4FF" alt="Version" />
  </p>

  <p>
    <a href="#-começando">Começar</a> ·
    <a href="#-experiência">Experiência</a> ·
    <a href="#-arquitetura">Arquitetura</a> ·
    <a href="#-atualizações-pelo-github">Atualizações</a> ·
    <a href="#-release-v100">Release</a>
  </p>
</div>

---

## ✦ O que é

**NeoLift** é um app de treino para Android e iOS criado do zero com React Native + Expo. O catálogo de exercícios é baseado no projeto público **free-exercise-db**, enquanto toda a experiência de treino, persistência, gráficos e interface é própria.

A direção visual mistura interface mobile contemporânea com referências Y2K/anos 2000: superfícies limpas, brilho cromado discreto, azul elétrico/ciano, micro-rótulos técnicos e contraste alto — sem sacrificar legibilidade.

> **Privacidade por padrão:** treino, séries, cargas, favoritos, unidades e preferências ficam no SQLite do aparelho. Não existe conta obrigatória nem backend próprio.

## ✦ Experiência

| Área | O que entrega |
|---|---|
| Início | resumo de treinos, volume semanal, marcas registradas, última sessão e atalho para treino ativo |
| Exercícios | busca por nome/equipamento, filtro muscular, imagem, nível, instruções e favoritos |
| Treino | sessão persistente, exercícios, séries, carga, repetições e conclusão por toque |
| Evolução | gráfico por exercício, gráfico por músculo e painel de regiões do corpo |
| Tema | automático, claro ou escuro com a mesma estrutura visual em Android/iOS |
| Atualização | consulta a última GitHub Release e avisa dentro do app |
| Catálogo | seed offline + sincronização do catálogo completo do free-exercise-db |

<details>
<summary><strong>Como o gráfico de progressão funciona</strong></summary>

Ao concluir uma série, o app salva a carga e as repetições localmente. Quando o treino é finalizado, esses registros passam a alimentar os gráficos.

Exemplo: se no supino você registrar **5 kg** no início e, duas semanas depois, registrar **10 kg**, o gráfico do exercício mostra a evolução entre as datas. O músculo principal do exercício também alimenta o gráfico daquela região, como **Peitoral**.

O painel de corpo completo acompanha: peitoral, dorsais, costas, ombros, bíceps, tríceps, antebraços, abdômen, lombar, glúteos, quadríceps, posteriores, panturrilhas, adutores, abdutores, trapézio e pescoço.
</details>

<details>
<summary><strong>Offline e sincronização</strong></summary>

O projeto inclui um catálogo inicial para abrir offline. Em desenvolvimento/produção você pode executar `npm run sync:exercises` para empacotar o JSON completo dentro do app. Além disso, quando houver internet, o app tenta atualizar o catálogo público e grava os exercícios no SQLite.

As imagens usam cache em disco via `expo-image`.
</details>

## ✦ Começando

### Requisitos

- Node.js **22.13+**
- npm
- Android Studio para emulador Android, ou dispositivo físico com Expo Go/dev build
- macOS + Xcode para build local de iOS, ou EAS Build

### Instalação

```bash
git clone https://github.com/RaphaelTW/neolift-mobile.git
cd neolift-mobile
npm install
npm run sync:exercises
npx expo start
```

Atalhos:

```bash
npm run android
npm run ios
npm run typecheck
npm run release:check
```

> `npm run sync:exercises` baixa o JSON combinado do free-exercise-db e substitui `assets/data/exercises.full.json`. Se você pular essa etapa, o app continua utilizável com o seed local e tenta sincronizar o catálogo depois.

## ✦ Arquitetura

```mermaid
flowchart TD
    UI[Expo Router / React Native UI] --> CTX[AppProvider]
    CTX --> DB[(SQLite local)]
    CTX --> CAT[Exercise Catalog Service]
    CTX --> UPD[GitHub Update Service]
    CAT --> SEED[Bundled JSON]
    CAT -. quando online .-> FREE[free-exercise-db]
    UPD -. release metadata .-> GH[GitHub Releases]
    DB --> HIST[Workouts / Sets / Preferences]
    HIST --> CHART[Progress Charts]
```

```text
app/
├── (tabs)/
│   ├── index.tsx          # dashboard
│   ├── exercises.tsx      # catálogo
│   ├── workout.tsx        # entrada do treino
│   ├── progress.tsx       # evolução muscular
│   └── settings.tsx       # tema, unidade, sync, updates
├── exercise/[id].tsx      # detalhe + histórico do exercício
└── workout/session.tsx    # sessão ativa

src/
├── components/            # UI e gráficos
├── context/               # estado e serviços da aplicação
├── db/                    # schema + repository SQLite
├── services/              # catálogo + GitHub updater
├── theme/                 # light/dark
├── types/
└── utils/
```

## ✦ Banco local

O arquivo `neolift.db` contém:

- `settings`
- `exercise_catalog`
- `favorites`
- `workouts`
- `workout_exercises`
- `workout_sets`

Não existe API própria para enviar histórico do usuário.

## ✦ Atualizações pelo GitHub

Na inicialização, o app consulta a **última release** configurada em:

```text
EXPO_PUBLIC_GITHUB_OWNER=RaphaelTW
EXPO_PUBLIC_GITHUB_REPO=neolift-mobile
```

Quando existe versão maior que a instalada:

- **Android standalone:** se a release possuir um `.apk`, o NeoLift pode baixar o arquivo e abrir o instalador do Android. A confirmação final continua sendo do usuário/sistema.
- **iOS:** o app detecta a nova release, mas a instalação precisa passar por App Store, TestFlight ou canal autorizado pela Apple. A release do GitHub pode servir como fonte de versão/notas, não como instalador silencioso.

Veja também [`docs/UPDATE_FLOW.md`](./docs/UPDATE_FLOW.md).

## ✦ Build

### Android APK para testes

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

### Produção

```bash
eas build -p android --profile production
eas build -p ios --profile production
```

## ✦ Release v1.0.0

Primeiro commit profissional:

```bash
git add app.json package.json eas.json tsconfig.json expo-env.d.ts .gitignore .env.example README.md CHANGELOG.md RELEASE-v1.0.0.md LICENSE THIRD_PARTY_NOTICES.md app src assets scripts docs .github
git commit -m "feat(neolift): lança app mobile offline-first de treinos" -m "Adiciona catálogo de exercícios, sessões persistentes em SQLite, evolução por exercício e grupo muscular, temas claro/escuro, integração com GitHub Releases e experiência unificada para Android e iOS."
git branch -M main
git remote add origin https://github.com/RaphaelTW/neolift-mobile.git
git push -u origin main
```

Tag e release:

```bash
git tag -a v1.0.0 -m "NeoLift v1.0.0 — Initial Mobile Release"
git push origin v1.0.0

gh release create v1.0.0 \
  --title "NeoLift v1.0.0 — Initial Mobile Release" \
  --notes-file RELEASE-v1.0.0.md
```

Para o atualizador Android encontrar um instalador, anexe o APK à release:

```bash
gh release upload v1.0.0 ./NeoLift-v1.0.0.apk --clobber
```

<details>
<summary><strong>Checklist antes de uma release</strong></summary>

- [ ] `package.json` e `app.json` estão na mesma versão
- [ ] `android.versionCode` foi incrementado
- [ ] `ios.buildNumber` foi incrementado
- [ ] `npm run release:check` passa
- [ ] `npm run typecheck` passa
- [ ] build Android/iOS testado
- [ ] changelog atualizado
- [ ] tag segue `vX.Y.Z`
- [ ] release do GitHub publicada
- [ ] APK anexado se o canal Android direto for usado
</details>

## ✦ Fonte dos exercícios

Dados e caminhos de imagens vêm de [`yuhonas/free-exercise-db`](https://github.com/yuhonas/free-exercise-db), projeto publicado sob **Unlicense / domínio público**. O projeto NeoLift mantém um aviso separado em [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

## ✦ Licença

Código do NeoLift: **MIT**. Consulte [`LICENSE`](./LICENSE).
