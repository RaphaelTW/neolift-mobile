# Wger no NeoLift v1.5.0

## Objetivo

O NeoLift mantém o `free-exercise-db` como biblioteca principal e offline, e usa o Wger como segunda fonte pública para ampliar o catálogo e aproveitar imagens/vídeos quando estiverem disponíveis.

## Autenticação

A leitura dos endpoints públicos do Wger, incluindo a lista de exercícios, não exige conta, API key nem JWT. Autenticação é necessária apenas para objetos ligados a um usuário, como rotinas pessoais.

O NeoLift consulta apenas endpoints públicos de leitura e **não envia os dados pessoais do usuário ao Wger**.

## Sincronização

Em **Configurações → Catálogo → Wger Open Exercise Library**, o usuário pode tocar em **Sincronizar exercícios do Wger**. O app também tenta atualizar essa fonte em segundo plano no máximo uma vez a cada 7 dias, sem bloquear a abertura.

Fluxo:

1. O app pagina `https://wger.de/api/v2/exerciseinfo/` em inglês (`language=2`) para facilitar a deduplicação com a base offline atual.
2. Converte os registros para o formato interno do NeoLift.
3. Normaliza nomes para encontrar equivalências com o `free-exercise-db`.
4. Se houver equivalência, mantém o exercício original e adiciona as mídias/metadados Wger (`source = hybrid`).
5. Se não houver equivalência, adiciona um registro próprio com ID `wger:<id>`.
6. Persiste os dados textuais no SQLite local.

## Mídia

Quando o exercício possui vídeo Wger, a tela oferece **Assistir vídeo do Wger** e reproduz o arquivo dentro do NeoLift com `expo-video`. O player usa cache quando a plataforma permitir. Como alguns vídeos públicos podem usar MOV/HEVC, uma falha de codec é tratada e direciona o usuário para o Coach 3D ou para outra demonstração online.

As imagens disponíveis são exibidas em uma galeria. O `expo-image` reproduz automaticamente GIF, APNG ou WebP animado quando alguma fonte compatível fornecer esse formato. O catálogo Wger observado atualmente é formado principalmente por imagens estáticas, portanto o app não apresenta imagens estáticas como se fossem GIFs.

Se o exercício não possui vídeo ou estiver offline sem o arquivo em cache, o NeoLift mantém o **Exercise Coach 3D** como alternativa para todos os exercícios.

As imagens Wger também podem complementar exercícios que já existiam na base offline.

## Licenças e atribuição

O software Wger é AGPL-3.0-or-later. O conteúdo de exercícios é disponibilizado sob licenças livres/Creative Commons; a documentação do projeto identifica o conjunto inicial como CC-BY-SA 3.0 e entradas/mídias podem conter seus próprios metadados.

Por isso, o NeoLift guarda, quando fornecidos pela API:

- fonte;
- autor/licence author;
- nome da licença;
- URL da licença;
- URL de origem;
- licença individual da mídia.

Esses dados são exibidos na tela do exercício/vídeo quando aplicável.

## Privacidade

A sincronização Wger baixa apenas catálogo público. Perfil, sexo, idade, peso, medidas corporais, cargas, séries e histórico de treino permanecem no SQLite local do aparelho.

## Fallbacks

A ordem de disponibilidade visual é:

1. vídeo Wger, quando existe e está acessível;
2. imagens da biblioteca;
3. demonstração 3D offline do NeoLift;
4. instruções textuais.

Assim, uma indisponibilidade do Wger não impede o uso do app ou dos treinos já salvos.
