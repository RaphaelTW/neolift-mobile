# Motor de treino — NeoLift v1.3.0

O NeoLift usa um motor local e determinístico. Nenhum dado físico é enviado para um backend.

## Personalização

O perfil registra sexo, idade, experiência, objetivo e frequência semanal. O plano usa principalmente experiência, objetivo, idade e dias disponíveis. Sexo é registrado como dado de perfil, mas não multiplica nem reduz carga automaticamente. Peso corporal e circunferências são usados para acompanhar o objetivo ao longo do tempo, não para “adivinhar” a carga de um exercício.

## Ciclo mensal

Cada mês possui uma rotação de variações de exercícios. Dentro do mês:

1. Semana 1 — Base: técnica e cargas confortáveis.
2. Semana 2 — Volume: uma série extra em movimentos principais quando apropriado.
3. Semana 3 — Progressão: topo da faixa de repetições e uso da sugestão de carga.
4. Semana 4 — Consolidação: volume reduzido antes da troca mensal.

Iniciantes tendem a 2–3 dias; intermediários a 4; avançados/profissionais a 5, mas o usuário pode selecionar de 2 a 6 dias.

## Sugestão de carga

A sugestão só aparece quando já existe histórico concluído do exercício.

- “Pesou”: sugestão de aproximadamente -5%.
- “Ideal”: mantém a carga.
- “Sobrou” em uma sessão: aproximadamente +2,5%.
- “Sobrou” em duas sessões consecutivas: aproximadamente +5%.

A carga é arredondada para 0,5 kg ou 1 lb. O usuário pode ignorar a recomendação e registrar qualquer carga.

## Base científica usada como limite de projeto

A atualização de 2026 do American College of Sports Medicine (ACSM) reforça consistência, treinamento dos principais grupos musculares pelo menos duas vezes por semana, individualização e progressão gradual. Para hipertrofia, o material complementar destaca volume semanal mais alto (~10 séries por grupo muscular); para força, cargas mais altas podem ser usadas por praticantes adequados.

A OMS recomenda fortalecimento dos principais grupos musculares em pelo menos dois dias por semana para adultos e também destaca equilíbrio para adultos mais velhos quando necessário.

Fontes oficiais:
- https://acsm.org/resistance-training-guidelines-update-2026/
- https://acsm.org/wp-content/uploads/2026/03/Resistance-Training-Position-Stand-infographic.pdf
- https://www.who.int/initiatives/behealthy/physical-activity

## Limites

O NeoLift entrega sugestões gerais para pessoas saudáveis. Dor, lesão, gestação, doença crônica, limitação funcional ou recomendação médica individual não devem ser substituídas pelo algoritmo do app.
