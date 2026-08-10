# Changelog

Todas as mudanças relevantes do NeoLift serão registradas aqui.

## [1.4.0] - 2026-08-10

### Added
- Exercise Coach com escolha entre demonstração 3D offline e exemplo em vídeo online.
- Avatar humano 3D procedural reutilizável renderizado com React Three Fiber + Expo GL.
- Classificador biomecânico que dá cobertura 3D a todo o catálogo local, distribuindo exercícios por famílias de movimento.
- Controles 3D de pausa, velocidade e câmera frontal, lateral ou 3/4.
- Vídeo online contextual sem API key: abre busca específica do exercício no navegador integrado do sistema.
- Detecção de conexão; quando offline, o app oferece imediatamente a demonstração 3D.
- Sistema próprio de diálogos NeoLift com fundo fosco, superfícies do tema e ações roxas.

### Changed
- Todos os `Alert.alert` do aplicativo foram substituídos por diálogos com a identidade visual NeoLift.
- Tela de exercício ganhou ação principal “Como fazer”.
- Cada exercício da sessão ativa ganhou acesso direto ao Exercise Coach.
- Android `versionCode` e iOS `buildNumber` incrementados para 5.

### Notes
- O avatar 3D representa a família biomecânica do exercício e não substitui orientação individual de um profissional.
- Instruções específicas do `free-exercise-db` continuam exibidas junto da demonstração para detalhes de pegada, máquina e posicionamento.

## [1.3.0] - 2026-08-10

### Added
- Onboarding local com sexo, idade, peso inicial, experiência, objetivo e dias de treino.
- Perfil de treino com níveis Iniciante, Intermediário e Avançado / profissional.
- Plano semanal adaptativo e ciclo mensal com troca de variações de exercícios.
- Semanas de Base, Volume, Progressão e Consolidação.
- Sugestão de carga baseada no histórico real e feedback “Sobrou / Ideal / Pesou”.
- Histórico detalhado de cada treino com carga máxima por exercício.
- Histórico corporal com peso, peito, cintura, quadril, braços, coxas e panturrilhas.
- Gráficos de peso e circunferências com variação desde o primeiro registro.
- Animação ambiente de fundo em todas as telas principais.
- Nova identidade visual roxa e ícone com pessoa levantando peso.

### Changed
- Tema escuro agora usa preto fosco e superfícies grafite.
- Tema claro usa superfícies claras e roxo como cor principal.
- Aba Treinar virou Plano e passa a apresentar o treino sugerido do mês.
- Aba Ajustes virou Perfil e concentra perfil físico, medidas, tema e atualizações.
- Android `versionCode` e iOS `buildNumber` incrementados para 4.

### Safety
- O app não inventa carga inicial a partir de sexo, idade ou peso corporal.
- Progressão de carga é conservadora e opcional, usando somente desempenho registrado.
- Perfis abaixo de 18 e a partir de 65 anos recebem volume inicial mais conservador.

## [1.2.0] - 2026-08-10

### Added
- Nova identidade visual com símbolo ascendente exclusivo do NeoLift.
- Wordmarks para fundos claros e escuros em `assets/branding`.

### Changed
- Ícone principal, adaptive icon Android e splash atualizados.
- Expo, Expo Router, React Native e módulos nativos alinhados ao Expo SDK 57.
- Android `versionCode` e iOS `buildNumber` incrementados para 3.

### Maintenance
- Dependências obrigatórias do Expo Router e do `@expo/vector-icons` declaradas diretamente.
- Configuração TypeScript atualizada para TypeScript 6.
- Arquivos locais do IntelliJ/Android Studio removidos do controle de versão.

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
