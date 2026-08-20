# Exercise Coach — 3D offline + vídeo interno

## Fluxo

1. O usuário toca em **Como fazer**.
2. O NeoLift mostra um diálogo com a mesma identidade visual do app.
3. Se houver mídia oficial Wger, o usuário escolhe **Assistir vídeo interno** ou **Ver animação 3D**.
4. O 3D funciona sem internet.
5. O vídeo remoto exige internet, mas é reproduzido somente dentro do NeoLift; offline, o app oferece o 3D.

## Cobertura 3D

`src/services/exerciseCoach.ts` classifica todo exercício do catálogo em uma família biomecânica. `src/components/Exercise3D.tsx` anima um avatar procedural usando a família escolhida.

Famílias implementadas:

- squat;
- lunge;
- hinge;
- horizontal_press;
- vertical_press;
- horizontal_pull;
- vertical_pull;
- curl;
- triceps;
- raise;
- crunch;
- plank;
- rotation;
- calf;
- leg_extension;
- leg_curl;
- hip_abduction;
- hip_adduction;
- carry;
- cardio;
- olympic;
- jump;
- stretch;
- generic.

A família `generic` garante fallback visual para qualquer item novo que seja adicionado ao catálogo no futuro.

## Limite intencional

A animação 3D é uma referência biomecânica, não uma reprodução milimétrica de cada máquina existente. Para isso, a tela sempre preserva as instruções específicas do exercício e identifica músculos principais/secundários.

## Vídeos

Desde a v1.6.0, a rota `/exercise/video/[id]` reproduz somente URLs oficiais de mídia Wger dentro do NeoLift com `expo-video` e cache quando suportado. `@react-native-community/netinfo` verifica conectividade. Exercícios sem vídeo interno usam o Coach 3D; não existe busca externa ou abertura de navegador.

## Imagens

`ExerciseImage` prioriza a imagem específica do exercício e troca automaticamente para `assets/exercise-fallback.webp` quando não houver mídia ou ocorrer falha de carregamento. A mesma regra vale no catálogo, no plano semanal, nos detalhes e na sessão ativa.

## Alertas

`src/components/NeoDialog.tsx` substitui os alertas nativos do React Native por um modal temático com suporte a ações normal, cancelamento, destaque e destrutiva.
