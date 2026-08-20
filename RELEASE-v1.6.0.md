# NeoLift v1.6.0 — Internal Media

## Destaques

- Vídeos somente dentro do NeoLift, sem redirecionamento para YouTube, navegador ou outro aplicativo.
- Player aceita apenas URLs oficiais de mídia de exercícios do Wger.
- Exercise Coach 3D passa a ser a ação principal quando não existe vídeo interno.
- Todo exercício exibe uma imagem no catálogo, no plano semanal, nos detalhes e durante a sessão ativa.
- Imagem local NeoLift substitui automaticamente mídia ausente ou indisponível.
- Galerias continuam priorizando as imagens específicas fornecidas pelos catálogos.

## Refatoração

- Novo componente único `ExerciseImage` concentra carregamento, cache, acessibilidade e fallback.
- Removidos busca externa, integração com navegador e `expo-web-browser`.
- Fluxos de detalhe, Coach 3D, player e sessão compartilham a mesma política de mídia.

## Android / iOS

- Android `versionCode`: **7**
- iOS `buildNumber`: **7**

## Privacidade e experiência

O NeoLift não envia consultas de exercícios para mecanismos de busca nem abre resultados externos. Os vídeos disponíveis continuam hospedados pelo Wger, mas são reproduzidos exclusivamente pelo player interno do aplicativo.
