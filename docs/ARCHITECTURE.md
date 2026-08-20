# Arquitetura NeoLift

O projeto é um aplicativo local-first. A UI usa Expo Router; o estado de alto nível fica em `AppProvider`; o repositório SQLite concentra consultas e gravações.

## Fluxos principais

### Catálogo
`assets/data` → `ensureCatalog()` → `exercise_catalog` → telas de busca/detalhe.

Quando há internet, `syncCatalogFromGithub()` pode substituir/completar os registros locais com o JSON público.

### Treino
`workouts` → `workout_exercises` → `workout_sets`.

Treinos sem `finished_at` são considerados ativos e podem ser retomados após fechar o app.

### Progresso
As consultas consideram somente séries `completed=1` dentro de treinos finalizados. O histórico por exercício e por músculo usa a maior carga registrada por dia.

## Exercise Coach e mídia interna

```text
Exercise detail / Active session
          ↓
     chooseExerciseDemo
       ↙          ↘
  3D offline     vídeo interno
      ↓               ↓
Exercise3D       expo-video → Wger
      ↓
coachProfile(exercise)
      ↓
família biomecânica → avatar procedural
```

O 3D utiliza `@react-three/fiber/native` sobre `expo-gl`. O catálogo não precisa armazenar um modelo 3D por exercício: `coachProfile()` resolve uma família de movimento e o `BodyRig` anima o mesmo avatar procedural.

Vídeos são reproduzidos somente na rota interna `/exercise/video/[id]`. `preferredExerciseVideo()` rejeita URLs fora do diretório oficial de mídia de exercícios Wger. `ExerciseImage` garante imagem local quando uma mídia específica não existir ou não carregar.

## Diálogos

Os fluxos de confirmação e aviso chamam `showNeoDialog()` em `src/services/dialog.ts`. `NeoDialogHost` fica montado na raiz e aplica as cores do `AppProvider`, evitando `Alert.alert` nativo nas mensagens do produto.
