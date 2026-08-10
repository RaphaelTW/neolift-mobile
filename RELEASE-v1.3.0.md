# NeoLift v1.3.0 — Adaptive Training

A v1.3.0 transforma o NeoLift de um log de treino em um app de acompanhamento pessoal offline-first.

## Destaques

- nova identidade roxa com tema claro e preto fosco no escuro;
- novo ícone/logo com pessoa levantando peso;
- animações ambientes de fundo;
- onboarding com sexo, idade, peso, nível, objetivo e dias de treino;
- níveis Iniciante, Intermediário e Avançado / profissional;
- plano semanal sugerido e rotação mensal de exercícios;
- ciclo de quatro semanas: Base, Volume, Progressão e Consolidação;
- sugestão opcional de carga usando histórico real e feedback “Sobrou / Ideal / Pesou”;
- histórico detalhado por sessão;
- peso e medidas corporais com histórico e gráficos;
- atualização Android pelo GitHub preservada, incluindo política 4+.

## Banco local

Novas tabelas:
- `user_profile`
- `body_measurements`
- `workout_exercise_feedback`

A migração é automática ao abrir o app.

## Versões de build

- App: `1.3.0`
- Android versionCode: `4`
- iOS buildNumber: `4`

## Observação de segurança

O NeoLift não calcula carga inicial a partir de sexo, idade ou peso corporal. A recomendação só começa depois que o usuário registra desempenho real no exercício e continua sendo opcional.
