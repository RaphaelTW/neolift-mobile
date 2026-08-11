# NeoLift v1.5.0 — Open Exercise Library

## Destaques

- Integração pública com o **Wger**, sem conta ou API key para leitura do catálogo de exercícios.
- Catálogo híbrido: `free-exercise-db` + exercícios Wger.
- Deduplicação por nome normalizado: exercícios equivalentes são enriquecidos em vez de duplicados.
- Imagens e vídeos Wger são associados aos exercícios quando disponíveis.
- Galeria visual com reprodução automática de GIF/APNG quando a fonte fornecer mídia animada.
- Novo player de vídeo **dentro do NeoLift** com `expo-video` e cache suportado pela plataforma.
- Tratamento de incompatibilidade de codec com direcionamento seguro para o Coach 3D.
- Exercise Coach 3D permanece como demonstração offline/fallback.
- Filtros de catálogo por **Todos**, **Base offline** e **Wger**.
- Tela de configurações mostra quantos exercícios são offline, Wger e híbridos.
- Fonte, autor e licença das mídias Wger são preservados e exibidos no app.
- Nenhum dado pessoal de treino é enviado ao Wger; histórico e perfil continuam no SQLite local.

## Atualizações e qualidade

- Atualizador Android seleciona somente releases estáveis com APK válido e nome versionado.
- Download antecipado e cache separados por versão, com validação de tamanho e gravação atômica.
- Dependências do Metro estabilizadas para instalações limpas no EAS.
- Verificações automatizadas de versão, TypeScript, dependências e segurança antes da compilação.

## Banco de dados

Migração automática da tabela `exercise_catalog` com os campos:

- `videos`
- `source`
- `source_id`
- `source_url`
- `license`
- `license_url`
- `license_author`
- `media`

Não é necessário apagar o banco local: a migração adiciona as colunas automaticamente.

## Android / iOS

- Android `versionCode`: **6**
- iOS `buildNumber`: **6**

## Observação sobre mídia

Nem todo exercício Wger possui vídeo, GIF ou imagem. Nesses casos, o NeoLift continua oferecendo a demonstração 3D offline e as instruções disponíveis. Alguns vídeos públicos usam MOV/HEVC e podem depender do suporte de codec do aparelho.
