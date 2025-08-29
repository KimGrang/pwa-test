import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '../types/pwa';

// wllama 타입 정의
interface Wllama {
  loadModelFromUrl: (
    url: string,
    options: { progressCallback?: (progress: { loaded: number; total: number }) => void }
  ) => Promise<void>;
  createCompletion: (
    prompt: string,
    options: { nPredict: number; sampling: { temp: number; top_k: number; top_p: number; repeat_penalty: number } }
  ) => Promise<string>;
}

export interface WllamaHookConfig {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  repetitionPenalty?: number;
}

export function useWllama(config: WllamaHookConfig = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<string>('');
  const wllamaRef = useRef<Wllama | null>(null);

  // 기본 설정
  const defaultConfig: WllamaHookConfig = {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 512,
    repetitionPenalty: 1.1,
    ...config,
  };

  // wllama 초기화
  const initializeWllama = useCallback(async () => {
    if (wllamaRef.current) return wllamaRef.current;

    try {
      console.log('🚀 wllama 초기화 시작...');

      // 동적 import로 wllama 로드
      const { Wllama, LoggerWithoutDebug } = await import('@wllama/wllama');

      // wllama 설정 경로 (CDN에서 wasm 파일 로드)
      const CONFIG_PATHS = {
        'single-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.4/esm/single-thread/wllama.wasm',
        'multi-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.4/esm/multi-thread/wllama.wasm',
      };

      // wllama 인스턴스 생성 (LoggerWithoutDebug로 디버그 메시지 억제)
      const wllama = new Wllama(CONFIG_PATHS, {
        logger: LoggerWithoutDebug,
      });

      wllamaRef.current = wllama;

      console.log('✅ wllama 초기화 완료');
      return wllama;
    } catch (error) {
      console.error('❌ wllama 초기화 실패:', error);
      throw error;
    }
  }, []);

  // 모델 로딩
  const loadModel = useCallback(
    async (modelPath: string) => {
      try {
        setIsLoading(true);
        setProgress(0);
        setModelInfo(`모델 로딩 중: ${modelPath}`);
        console.log('🚀 wllama 모델 로딩 시작...', modelPath);

        const wllama = await initializeWllama();

        // 진행률 콜백
        const progressCallback = ({ loaded, total }: { loaded: number; total: number }) => {
          const progressPercent = Math.round((loaded / total) * 100);
          setProgress(progressPercent);
          console.log(`📊 로딩 진행률: ${progressPercent}%`);
        };

        console.log('📁 모델 로딩 시작:', modelPath);

        // 로컬 파일 URL로 모델 로딩
        const modelUrl = new URL(modelPath, window.location.origin).href;
        console.log('🔗 모델 URL:', modelUrl);

        await wllama.loadModelFromUrl(modelUrl, {
          progressCallback,
        });

        setIsLoaded(true);
        setProgress(100);
        setModelInfo(`✅ ${modelPath} 모델 로딩 완료`);
        console.log('✅ wllama 모델 로딩 완료');
      } catch (error) {
        console.error('❌ wllama 모델 로딩 실패:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setModelInfo(`❌ 모델 로딩 실패: ${errorMessage}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [initializeWllama]
  );

  // 채팅 완료
  const chatCompletion = useCallback(
    async (messages: ChatMessage[], onStream?: (text: string) => void) => {
      if (!isLoaded || !wllamaRef.current) {
        throw new Error('모델이 로드되지 않았습니다. 먼저 모델을 로드해주세요.');
      }

      try {
        setIsLoading(true);
        console.log('🚀 wllama 채팅 시작...');

        // 마지막 사용자 메시지 추출
        const lastUserMessage = messages.filter((msg) => msg.role === 'user').pop()?.content || '';

        console.log('📝 사용자 메시지:', lastUserMessage);

        // 채팅 완료 옵션
        const completionOptions = {
          nPredict: defaultConfig.maxTokens || 512,
          sampling: {
            temp: defaultConfig.temperature || 0.7,
            top_k: 40,
            top_p: defaultConfig.topP || 0.9,
            repeat_penalty: defaultConfig.repetitionPenalty || 1.1,
          },
        };

        console.log('⚙️ 채팅 옵션:', completionOptions);

        // 스트리밍 채팅
        const outputText = await wllamaRef.current.createCompletion(lastUserMessage, completionOptions);

        console.log('✅ 채팅 완료, 전체 응답:', outputText);

        // 스트리밍 시뮬레이션 (wllama는 스트리밍을 직접 지원하지 않음)
        if (onStream) {
          const words = outputText.split(' ');
          for (const word of words) {
            onStream(word + ' ');
            await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms 지연
          }
        }

        return outputText;
      } catch (error) {
        console.error('❌ wllama 채팅 완료 실패:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, defaultConfig]
  );

  // 모델 언로드
  const unloadModel = useCallback(() => {
    if (wllamaRef.current) {
      // wllama는 모델 언로드 메서드가 없으므로 참조만 제거
      wllamaRef.current = null;
    }
    setIsLoaded(false);
    setProgress(0);
    setModelInfo('');
  }, []);

  // 사용 가능한 모델 목록 (로컬 파일들)
  const getAvailableModels = useCallback(() => {
    return [
      '/models/euro_gguf.gguf',
      // 추가 로컬 모델들을 여기에 추가할 수 있습니다
    ];
  }, []);

  // 로컬 모델 목록 (wllama는 로컬 파일을 직접 지원)
  const getLocalModels = useCallback(() => {
    return ['/models/euro_gguf.gguf'];
  }, []);

  return {
    loadModel,
    chatCompletion,
    unloadModel,
    isLoaded,
    isLoading,
    progress,
    modelInfo,
    getAvailableModels,
    getLocalModels,
  };
}
