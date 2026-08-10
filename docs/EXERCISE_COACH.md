# Exercise Coach — 3D offline + vídeo online

## Fluxo

1. O usuário toca em **Como fazer**.
2. O NeoLift mostra um diálogo com a mesma identidade visual do app.
3. O usuário escolhe **Ver exemplo em 3D** ou **Ver exemplo em vídeo**.
4. O 3D funciona sem internet.
5. O vídeo exige internet; offline, o NeoLift oferece retornar ao 3D.

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

O serviço `openExerciseVideo()` usa `@react-native-community/netinfo` para verificar conectividade e `expo-web-browser` para abrir a busca online. Nenhuma API key é necessária.

## Alertas

`src/components/NeoDialog.tsx` substitui os alertas nativos do React Native por um modal temático com suporte a ações normal, cancelamento, destaque e destrutiva.
