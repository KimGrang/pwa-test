export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface LLMConfig {
  modelUrl: string;
  temperature?: number;
  topP?: number;
  contextSize?: number;
}
