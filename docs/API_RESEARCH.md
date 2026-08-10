# Pesquisa de APIs de treino — v1.1.0

Pesquisa realizada em 07/08/2026 no repositório `public-apis/public-apis`.

## Critérios

- gratuita;
- sem API key, OAuth ou cadastro obrigatório;
- adequada a exercícios de musculação/treino;
- utilizável como fonte complementar sem substituir o banco local do usuário.

## Resultado

Na seção **Sports & Fitness**, a opção diretamente relacionada a treino/exercícios é **Wger** (`Workout manager data as exercises, muscles or equipment`). O próprio catálogo `public-apis` marca a autenticação como `apiKey`, portanto ela não atende ao requisito de operação sem chave.

As opções da mesma seção marcadas como `No` em Auth são majoritariamente placares, automobilismo, bicicletas, locais esportivos, ligas e resultados. Elas não fornecem um catálogo equivalente de musculação.

## Decisão do NeoLift

A v1.1.0 mantém o `yuhonas/free-exercise-db` como fonte do catálogo porque:

1. não exige API key;
2. pode ser empacotado no aplicativo;
3. funciona offline;
4. o histórico do usuário continua 100% local;
5. evita transformar disponibilidade de uma API externa em ponto único de falha.

A arquitetura de `src/services/` continua separada para permitir adicionar um provedor externo futuramente sem migrar o banco de treinos.
