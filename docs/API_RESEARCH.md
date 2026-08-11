# Pesquisa de APIs de exercícios — atualização v1.5.0

## Requisito do NeoLift

A fonte secundária deveria permitir leitura de exercícios sem exigir que cada usuário crie conta ou informe uma API key. O app também precisa continuar utilizável offline.

## Wger — selecionado

A documentação oficial atual do Wger informa que **endpoints públicos, como a lista de exercícios, podem ser acessados sem autenticação**. Autenticação fica necessária para objetos pertencentes ao usuário, como rotinas pessoais.

Por isso a v1.5.0 passa a consultar o endpoint público `/api/v2/exerciseinfo/` e não cria conta Wger, não pede API key e não envia perfil/histórico do NeoLift para a API.

O Wger também possui suporte a imagens e vídeos de exercícios. Nem toda entrada possui mídia; o NeoLift usa seu Exercise Coach 3D como fallback.

### Licenciamento

O software Wger é AGPL-3.0-or-later. A documentação oficial identifica o conteúdo inicial de exercícios como CC-BY-SA 3.0 e algumas mídias/entradas podem conter metadados próprios de autoria/licença.

A integração do NeoLift preserva esses metadados para atribuição e não incorpora o código-fonte do Wger.

## free-exercise-db — continua como base principal

O `yuhonas/free-exercise-db` continua sendo a base empacotada/offline por ser um dataset público sob Unlicense/Public Domain e já conter centenas de exercícios, instruções e imagens.

## Arquitetura escolhida

```text
free-exercise-db ──> catálogo offline
                         │
                         ├── equivalência pelo nome ──> exercício híbrido
                         │                               + mídia Wger
Wger público ────────────┤
                         └── exercício novo ──────────> wger:<id>

Vídeo Wger disponível? ──> player interno expo-video
Sem vídeo / offline? ────> Exercise Coach 3D
```

## Fontes verificadas em 10/08/2026

- Documentação da API Wger: `https://wger.readthedocs.io/`
- Repositório oficial Wger: `https://github.com/wger-project/wger`
- free-exercise-db: `https://github.com/yuhonas/free-exercise-db`
- Expo Video: `https://docs.expo.dev/versions/latest/sdk/video/`
