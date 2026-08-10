import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

export type NeoDialogAction = {
  label: string;
  style?: 'default' | 'cancel' | 'danger' | 'accent';
  onPress?: () => void | Promise<void>;
};

export type NeoDialogConfig = {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actions?: NeoDialogAction[];
};

type Listener = (config: NeoDialogConfig | null) => void;
let listener: Listener | null = null;
let queued: NeoDialogConfig | null = null;

export function setNeoDialogListener(next: Listener | null) {
  listener = next;
  if (listener && queued) {
    const pending = queued;
    queued = null;
    listener(pending);
  }
}

export function showNeoDialog(config: NeoDialogConfig) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  if (listener) listener(config);
  else queued = config;
}

export function dismissNeoDialog() {
  if (listener) listener(null);
  queued = null;
}
