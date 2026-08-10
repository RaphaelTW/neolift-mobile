# NeoLift v1.1.0 — Smart GitHub Updates

## Destaques

- novo atualizador Android baseado no histórico real de GitHub Releases;
- download antecipado do APK quando existe nova versão;
- confirmação de atualização quando o aparelho está 1–3 releases atrás;
- política 4+: ao ficar 4 ou mais releases atrás, baixa diretamente a versão mais recente e abre o instalador automaticamente;
- reutilização do APK já baixado no armazenamento privado do aplicativo;
- tela de Configurações mostra quantidade de releases de defasagem e estado do download;
- documentação técnica sobre limites de instalação silenciosa do Android;
- pesquisa de APIs de treino sem chave no `public-apis` documentada;
- `free-exercise-db` mantido como catálogo principal offline-first por não exigir API key.

## Atualização Android

A aplicação consulta as releases estáveis públicas do repositório e conta quantas versões novas existem acima da instalada.

- **1–3 releases:** download -> pergunta ao usuário -> instalador Android.
- **4+ releases:** download automático da última -> abre instalador Android.

O Android ainda apresenta sua própria confirmação de instalação. Aplicativos comuns não podem instalar silenciosamente um APK sem autorização do sistema/usuário.

## Dados

Nenhum histórico pessoal é enviado ao GitHub ou a qualquer API externa. Treinos, séries, cargas, favoritos e preferências continuam no SQLite local.
