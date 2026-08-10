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
