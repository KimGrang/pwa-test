export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallPromptProps {
  onInstall?: () => void;
  onCancel?: () => void;
}

export interface UpdateAvailableEvent {
  type: 'UPDATE_AVAILABLE';
  payload: any;
}
