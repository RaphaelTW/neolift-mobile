# Exercise Coach — cobertura do catálogo v1.4.0

Validação executada sobre `assets/data/exercises.full.json` em 10/08/2026.

- Exercícios no catálogo: **873**
- Exercícios com família 3D resolvida: **873**
- Exercícios caindo no fallback genérico nesta base: **0**

Distribuição atual das famílias:

| Família | Exercícios |
|---|---:|
| crunch | 121 |
| horizontal_press | 92 |
| stretch | 85 |
| curl | 75 |
| horizontal_pull | 66 |
| squat | 66 |
| hinge | 59 |
| triceps | 51 |
| olympic | 40 |
| vertical_press | 39 |
| raise | 33 |
| hip_abduction | 30 |
| calf | 21 |
| vertical_pull | 21 |
| hip_adduction | 16 |
| cardio | 16 |
| lunge | 13 |
| jump | 11 |
| rotation | 7 |
| leg_curl | 5 |
| carry | 4 |
| leg_extension | 2 |

O serviço ainda mantém um fallback `generic` para proteger o app caso um exercício futuro possua metadados novos que não correspondam às regras atuais.
