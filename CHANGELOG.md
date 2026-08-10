# Changelog

Todas as mudanças relevantes do NeoLift serão registradas aqui.

## [1.1.0] - 2026-08-07

### Added
- Contagem de releases estáveis mais novas usando a API pública do GitHub.
- Download antecipado do APK mais recente no Android.
- Estado de atualização e defasagem exibidos em Configurações.
- Política de atualização 4+: baixa diretamente a última release e abre o instalador.
- Documentação `docs/API_RESEARCH.md` sobre APIs gratuitas de treino sem chave.

### Changed
- Atualizador passou de `releases/latest` para listagem das releases estáveis, permitindo saber quantas versões o aparelho está atrasado.
- APK é preservado em armazenamento privado do aplicativo e reaproveitado quando já foi baixado.
- Catálogo principal permanece `free-exercise-db`, sem API key e com funcionamento offline.

### Security / Platform
- O fluxo respeita a segurança do Android: a confirmação nativa de instalação continua obrigatória para apps comuns.
- Drafts e prereleases são ignorados pelo atualizador automático.

## [1.0.0] - 2026-08-06

### Added
- Aplicativo Expo/React Native para Android e iOS.
- Tema claro, escuro e modo automático.
- Persistência offline-first com SQLite.
- Catálogo de exercícios baseado no free-exercise-db.
- Busca, filtros musculares, detalhes, imagens e favoritos.
- Sessão de treino persistente com séries, cargas, repetições e conclusão.
- Dashboard com sessões, volume semanal e marcas.
- Histórico e gráficos de carga por exercício.
- Evolução por grupo muscular e painel de corpo completo.
- Sincronização opcional do catálogo completo.
- Verificação automática de GitHub Releases.
- Download de APK + abertura do instalador no Android standalone.
- Fluxo compatível com App Store/TestFlight no iOS.
