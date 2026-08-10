# NeoLift v1.4.0 — Exercise Coach 3D

A v1.4.0 transforma o NeoLift em um guia de execução dentro do próprio treino.

## Destaques

- botão **Como fazer** na ficha do exercício e na sessão ativa;
- escolha visual entre **Ver exemplo em 3D** e **Ver exemplo em vídeo**;
- avatar humano 3D procedural disponível offline;
- cobertura de todo o catálogo por famílias biomecânicas de movimento;
- pausa, velocidades 0,65x / 1x / 1,45x e câmera frente / 3/4 / lado;
- instruções específicas do exercício exibidas abaixo do 3D;
- vídeos online sem API key, usando busca contextual pelo nome do exercício;
- detecção offline com retorno automático para o modo 3D;
- alertas e confirmações redesenhados com a identidade roxa/preto fosco do NeoLift;
- atualização de versão para Android `versionCode 5` e iOS `buildNumber 5`.

## Arquitetura do 3D

O app não embarca 873 modelos ou vídeos separados. Existe um único avatar procedural e um classificador que converte cada exercício em uma família de movimento, como agachamento, passada, hinge, empurrar/puxar, rosca, tríceps, elevação, abdominal, prancha, panturrilha, adução/abdução, cardio, carry e alongamento.

Isso mantém o modo offline leve e garante que todo exercício tenha uma referência visual, enquanto o passo a passo original continua sendo a fonte específica para detalhes de execução.

## Vídeo online

A opção de vídeo consulta apenas a conectividade e abre uma busca contextual no YouTube usando o nome do exercício. Não há API key, login obrigatório ou backend do NeoLift.

## Instalação

```bash
npm install
npm run sync:exercises
npm run typecheck
npm run release:check
```

## Build APK

```bash
eas build --platform android --profile preview
```
