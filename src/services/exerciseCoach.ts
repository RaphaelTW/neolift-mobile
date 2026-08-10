import NetInfo from '@react-native-community/netinfo';
import * as WebBrowser from 'expo-web-browser';
import type { Exercise } from '@/types';
import { showNeoDialog } from '@/services/dialog';

export type MotionFamily =
  | 'squat' | 'lunge' | 'hinge' | 'horizontal_press' | 'vertical_press'
  | 'horizontal_pull' | 'vertical_pull' | 'curl' | 'triceps' | 'raise'
  | 'crunch' | 'plank' | 'rotation' | 'calf' | 'leg_extension' | 'leg_curl'
  | 'hip_abduction' | 'hip_adduction' | 'carry' | 'cardio' | 'olympic' | 'jump' | 'stretch' | 'generic';

export type CoachProfile = {
  family: MotionFamily;
  label: string;
  cue: string;
  camera: 'front' | 'side' | 'three-quarter';
};

const includesAny = (text: string, values: string[]) => values.some(value => text.includes(value));

export function coachProfile(exercise: Exercise): CoachProfile {
  const text = `${exercise.name} ${exercise.primaryMuscles.join(' ')} ${exercise.secondaryMuscles.join(' ')} ${exercise.equipment || ''} ${exercise.mechanic || ''} ${exercise.force || ''} ${exercise.category || ''}`.toLowerCase();
  if (includesAny(text, ['squat', 'hack squat', 'leg press'])) return { family: 'squat', label: 'Agachamento / extensão de quadril e joelho', cue: 'Desça com controle, mantenha o tronco estável e empurre o chão na volta.', camera: 'three-quarter' };
  if (includesAny(text, ['lunge', 'split squat', 'step-up', 'step up'])) return { family: 'lunge', label: 'Passada unilateral', cue: 'Controle o joelho da perna da frente e mantenha o tronco estável.', camera: 'side' };
  if (includesAny(text, ['deadlift', 'romanian', 'stiff', 'good morning', 'hip thrust', 'glute bridge', 'pull through'])) return { family: 'hinge', label: 'Hinge / extensão de quadril', cue: 'Leve o quadril para trás mantendo coluna neutra e volte estendendo o quadril.', camera: 'side' };
  if (includesAny(text, ['bench press', 'chest press', 'push-up', 'push up', 'dip', 'fly', 'flye', 'pec deck'])) return { family: 'horizontal_press', label: 'Empurrar horizontal', cue: 'Estabilize as escápulas e empurre sem perder o alinhamento do tronco.', camera: 'three-quarter' };
  if (includesAny(text, ['shoulder press', 'military press', 'overhead press', 'arnold press', 'push press'])) return { family: 'vertical_press', label: 'Empurrar vertical', cue: 'Mantenha o abdômen firme e leve a carga acima da cabeça de forma controlada.', camera: 'front' };
  if (includesAny(text, ['row', 'rowing', 'rear delt'])) return { family: 'horizontal_pull', label: 'Puxar horizontal', cue: 'Puxe conduzindo pelos cotovelos e termine aproximando as escápulas.', camera: 'three-quarter' };
  if (includesAny(text, ['pull-up', 'pull up', 'chin-up', 'chin up', 'pulldown', 'lat pull'])) return { family: 'vertical_pull', label: 'Puxar vertical', cue: 'Inicie deprimindo as escápulas e puxe os cotovelos em direção ao tronco.', camera: 'front' };
  if (includesAny(text, ['leg extension'])) return { family: 'leg_extension', label: 'Extensão de joelho', cue: 'Estenda o joelho sem tirar o quadril do apoio e retorne devagar.', camera: 'side' };
  if (includesAny(text, ['leg curl', 'hamstring curl'])) return { family: 'leg_curl', label: 'Flexão de joelho', cue: 'Flexione o joelho sem levantar o quadril e controle o retorno.', camera: 'side' };
  if (includesAny(text, ['curl']) || exercise.primaryMuscles.includes('biceps')) return { family: 'curl', label: 'Flexão de cotovelo', cue: 'Mantenha o braço estável e mova principalmente o antebraço.', camera: 'front' };
  if (includesAny(text, ['tricep', 'triceps', 'skull crusher', 'extension']) && exercise.primaryMuscles.includes('triceps')) return { family: 'triceps', label: 'Extensão de cotovelo', cue: 'Fixe o braço e estenda o cotovelo sem usar impulso do tronco.', camera: 'side' };
  if (includesAny(text, ['lateral raise', 'front raise', 'reverse fly', 'shoulder raise'])) return { family: 'raise', label: 'Elevação dos braços', cue: 'Eleve com controle e evite transformar o movimento em balanço do corpo.', camera: 'front' };
  if (includesAny(text, ['crunch', 'sit-up', 'sit up', 'abdominal'])) return { family: 'crunch', label: 'Flexão do tronco', cue: 'Contraia o abdômen e evite puxar o pescoço durante a subida.', camera: 'side' };
  if (includesAny(text, ['plank', 'hover'])) return { family: 'plank', label: 'Estabilização isométrica', cue: 'Mantenha costelas, pelve e cabeça alinhadas durante todo o tempo.', camera: 'side' };
  if (includesAny(text, ['twist', 'rotation', 'wood chop', 'windmill', 'side bend'])) return { family: 'rotation', label: 'Rotação / inclinação do tronco', cue: 'Gire com controle sem deixar a lombar assumir toda a amplitude.', camera: 'three-quarter' };
  if (includesAny(text, ['calf', 'toe raise'])) return { family: 'calf', label: 'Flexão plantar', cue: 'Suba pelos dedos, pause no topo e desça controlando a amplitude.', camera: 'side' };
  if (includesAny(text, ['abductor', 'abduction'])) return { family: 'hip_abduction', label: 'Abdução do quadril', cue: 'Afaste a perna mantendo pelve e tronco estáveis.', camera: 'front' };
  if (includesAny(text, ['adductor', 'adduction', 'groin'])) return { family: 'hip_adduction', label: 'Adução do quadril', cue: 'Aproxime a perna sem girar a pelve ou acelerar o retorno.', camera: 'front' };
  if (includesAny(text, ['walk', 'carry', 'farmer', 'yoke', 'atlas stone'])) return { family: 'carry', label: 'Deslocamento / transporte de carga', cue: 'Mantenha o tronco firme e controle a carga durante todo o deslocamento.', camera: 'three-quarter' };
  if (includesAny(text, ['clean', 'snatch', 'jerk', 'thruster'])) return { family: 'olympic', label: 'Movimento explosivo integrado', cue: 'Gere força a partir das pernas e quadril e mantenha a trajetória da carga próxima ao corpo.', camera: 'three-quarter' };
  if (includesAny(text, ['jump', 'hop', 'bound', 'box jump', 'depth jump'])) return { family: 'jump', label: 'Salto / potência', cue: 'Carregue quadril e joelhos, salte com controle e aterrisse absorvendo o impacto.', camera: 'side' };
  if (exercise.category === 'cardio' || includesAny(text, ['run', 'bike', 'jump rope', 'elliptical', 'sprint', 'mountain climber', 'battling rope', 'bear crawl', 'sled drag', 'backward drag'])) return { family: 'cardio', label: 'Movimento cíclico', cue: 'Mantenha ritmo confortável e padrão de movimento consistente.', camera: 'side' };
  if (exercise.category === 'stretching' || exercise.force === 'static' || includesAny(text, ['stretch', 'foam roll', 'isometric neck'])) return { family: 'stretch', label: 'Alongamento / controle estático', cue: 'Entre na amplitude gradualmente, sem rebotes e sem forçar dor aguda.', camera: 'three-quarter' };

  const primary = exercise.primaryMuscles[0] || '';
  if (primary === 'chest') return { family: 'horizontal_press', label: 'Empurrar horizontal', cue: 'Controle a descida e empurre mantendo escápulas e tronco estáveis.', camera: 'three-quarter' };
  if (primary === 'shoulders') return exercise.mechanic === 'isolation' || includesAny(text, ['raise', 'scaption', 'iron cross'])
    ? { family: 'raise', label: 'Elevação / controle do ombro', cue: 'Mova os braços com controle e sem balanço do tronco.', camera: 'front' }
    : { family: 'vertical_press', label: 'Empurrar vertical', cue: 'Mantenha abdômen firme e controle a carga acima da cabeça.', camera: 'front' };
  if (primary === 'triceps') return { family: 'triceps', label: 'Extensão de cotovelo', cue: 'Fixe o braço e estenda o cotovelo sem usar impulso.', camera: 'side' };
  if (primary === 'biceps' || primary === 'forearms') return { family: 'curl', label: 'Flexão / controle do antebraço', cue: 'Mantenha o braço estável e controle o movimento do antebraço.', camera: 'front' };
  if (['lats', 'middle back', 'traps'].includes(primary)) return includesAny(text, ['chin', 'pull-up', 'pull up', 'pulldown'])
    ? { family: 'vertical_pull', label: 'Puxar vertical', cue: 'Conduza o movimento pelos cotovelos e controle as escápulas.', camera: 'front' }
    : { family: 'horizontal_pull', label: 'Puxar horizontal', cue: 'Puxe conduzindo pelos cotovelos e aproxime as escápulas.', camera: 'three-quarter' };
  if (['glutes', 'hamstrings', 'lower back'].includes(primary)) return { family: 'hinge', label: 'Extensão de quadril / cadeia posterior', cue: 'Mantenha coluna neutra e controle a flexão e extensão do quadril.', camera: 'side' };
  if (primary === 'quadriceps') return { family: 'squat', label: 'Extensão de joelho / padrão de agachamento', cue: 'Controle joelhos e quadril e mantenha apoio firme dos pés.', camera: 'three-quarter' };
  if (primary === 'calves') return { family: 'calf', label: 'Flexão plantar', cue: 'Suba pelos dedos e controle a descida em toda a amplitude.', camera: 'side' };
  if (primary === 'abdominals') return { family: 'crunch', label: 'Controle do tronco', cue: 'Mantenha o abdômen ativo e evite compensar com o pescoço ou lombar.', camera: 'side' };
  if (primary === 'abductors') return { family: 'hip_abduction', label: 'Abdução do quadril', cue: 'Afaste a perna mantendo pelve e tronco estáveis.', camera: 'front' };
  if (primary === 'adductors') return { family: 'hip_adduction', label: 'Adução do quadril', cue: 'Aproxime a perna com controle sem girar a pelve.', camera: 'front' };
  if (primary === 'neck') return { family: 'stretch', label: 'Controle cervical', cue: 'Use amplitude confortável e evite movimentos bruscos do pescoço.', camera: 'side' };
  if (includesAny(text, ['press', 'pushdown', 'crossover', 'pullover', 'chest squeeze'])) return { family: 'horizontal_press', label: 'Empurrar / aproximar', cue: 'Controle a carga e mantenha o tronco estável.', camera: 'three-quarter' };
  if (includesAny(text, ['pull', 'shrug'])) return { family: 'horizontal_pull', label: 'Puxar / estabilizar escápulas', cue: 'Conduza o movimento pelas costas e evite usar impulso.', camera: 'three-quarter' };
  if (includesAny(text, ['raise', 'kickback', 'bridge', 'hyperextension'])) return primary === 'glutes' || primary === 'hamstrings' || primary === 'lower back'
    ? { family: 'hinge', label: 'Extensão de quadril / cadeia posterior', cue: 'Controle a extensão sem hiperestender a lombar.', camera: 'side' }
    : { family: 'raise', label: 'Elevação controlada', cue: 'Execute a elevação sem balanço e com amplitude confortável.', camera: 'front' };
  return { family: 'generic', label: 'Movimento guiado', cue: 'Use a demonstração como referência visual e siga as instruções específicas abaixo.', camera: 'three-quarter' };
}

export function videoSearchUrl(exercise: Exercise) {
  const query = encodeURIComponent(`${exercise.name} execução correta exercício academia`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

export async function openExerciseVideo(exercise: Exercise, onOffline3D?: () => void) {
  const state = await NetInfo.fetch();
  if (!state.isConnected || state.isInternetReachable === false) {
    showNeoDialog({
      title: 'Você está offline',
      message: 'O vídeo precisa de internet. A demonstração 3D continua disponível no aparelho.',
      icon: 'cloud-offline-outline',
      actions: [
        { label: 'Cancelar', style: 'cancel' },
        { label: 'Ver em 3D', style: 'accent', onPress: onOffline3D }
      ]
    });
    return false;
  }
  await WebBrowser.openBrowserAsync(videoSearchUrl(exercise), {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: '#9D5CFF',
    toolbarColor: '#0B0A0D'
  });
  return true;
}

export function chooseExerciseDemo(exercise: Exercise, on3D: () => void) {
  showNeoDialog({
    title: 'Como quer ver o exercício?',
    message: `${exercise.name}\n\nO 3D funciona offline. O vídeo usa a internet e abre exemplos de execução para você comparar o movimento.`,
    icon: 'body-outline',
    actions: [
      { label: 'Ver exemplo em 3D', style: 'accent', onPress: on3D },
      { label: 'Ver exemplo em vídeo', onPress: async () => {
        await openExerciseVideo(exercise, on3D);
      } },
      { label: 'Agora não', style: 'cancel' }
    ]
  });
}
