import React, { useState } from 'react';
import { useWllama } from '../hooks/useWllama';
import { ChatMessage } from '../types/pwa';
import './LLMChat.css';

const LLMChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('TinyLlama-1.1B-Chat-v1.0-q4f16_1');
  const [selectedLocalModel, setSelectedLocalModel] = useState('/models/euro_gguf.gguf');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<'none' | 'loading' | 'loaded' | 'error'>('none');
  const [modelInfo, setModelInfo] = useState<string>('');
  const [loadingType, setLoadingType] = useState<'remote' | 'local'>('remote');

  // wllama 훅
  const {
    loadModel,
    chatCompletion,
    isLoaded,
    isLoading,
    progress,
    modelInfo: wllamaModelInfo,
    getAvailableModels,
    getLocalModels,
  } = useWllama({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 512,
    repetitionPenalty: 1.1,
  });

  // 모델 상태 업데이트
  React.useEffect(() => {
    if (isLoading) {
      setModelStatus('loading');
    } else if (isLoaded) {
      setModelStatus('loaded');
      setModelInfo(wllamaModelInfo);
    } else {
      setModelStatus('none');
      setModelInfo('');
    }
  }, [isLoaded, isLoading, wllamaModelInfo]);

  const handleLoadRemoteModel = async () => {
    if (!selectedModel) {
      alert('모델을 선택해주세요.');
      return;
    }

    try {
      setIsModelLoading(true);
      setLoadingType('remote');
      setModelStatus('loading');
      await loadModel(selectedModel);
      setModelInfo(`wllama 모델 (${selectedModel})이 로드되었습니다`);
    } catch (error) {
      setModelStatus('error');
      setModelInfo('모델 로딩에 실패했습니다');
      alert('모델 로딩에 실패했습니다: ' + error);
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleLoadLocalModel = async () => {
    if (!selectedLocalModel) {
      alert('로컬 모델을 선택해주세요.');
      return;
    }

    try {
      setIsModelLoading(true);
      setLoadingType('local');
      setModelStatus('loading');
      await loadModel(selectedLocalModel);
      setModelInfo(`로컬 모델 (${selectedLocalModel})이 로드되었습니다`);
    } catch (error) {
      setModelStatus('error');
      setModelInfo('로컬 모델 로딩에 실패했습니다');
      alert('로컬 모델 로딩에 실패했습니다: ' + error);
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isLoaded) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // 어시스턴트 메시지를 먼저 생성하고 스트리밍으로 업데이트
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      let streamedContent = '';

      await chatCompletion([...messages, userMessage], (token: string) => {
        // 빈 토큰이나 공백만 있는 토큰은 건너뛰기
        if (token.trim() === '') {
          return;
        }

        streamedContent += token;

        // 실시간으로 콘솔에 전체 응답 출력
        console.log('📝 전체 AI 응답:', streamedContent);

        // 메시지 배열의 마지막 항목(어시스턴트 메시지)을 업데이트
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: streamedContent,
            };
          }
          return newMessages;
        });
      });
    } catch (error) {
      console.error('채팅 오류:', error);
      alert('메시지 전송에 실패했습니다.');

      // 오류 발생 시 빈 메시지 제거
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const availableModels = getAvailableModels();
  const localModels = getLocalModels();

  return (
    <div className='llm-chat'>
      <div className='chat-header'>
        <h2>🤖 wllama 온디바이스 LLM 채팅</h2>

        {/* 모델 상태 표시 */}
        <div className={`model-status-indicator ${modelStatus}`}>
          {modelStatus === 'none' && <span>📋 모델을 선택하고 로드해주세요</span>}
          {modelStatus === 'loading' && (
            <span>
              ⏳ 모델 로딩 중... {progress.toFixed(1)}%
              <div className='progress-bar'>
                <div className='progress-fill' style={{ width: `${progress}%` }} />
              </div>
              <div className='loading-details'>
                {loadingType === 'remote' && (
                  <>
                    {progress < 25 && '모델 다운로드 중...'}
                    {progress >= 25 && progress < 50 && '모델 초기화 중...'}
                    {progress >= 50 && 'WebGPU 설정 중...'}
                  </>
                )}
                {loadingType === 'local' && (
                  <>
                    {progress < 25 && '로컬 파일 로딩 중...'}
                    {progress >= 25 && progress < 50 && '모델 초기화 중...'}
                    {progress >= 50 && 'WebGPU 설정 중...'}
                  </>
                )}
              </div>
            </span>
          )}
          {modelStatus === 'loaded' && <span>✅ {modelInfo}</span>}
          {modelStatus === 'error' && <span>❌ {modelInfo}</span>}
        </div>

        {/* 모델 로딩 방법들 */}
        <div className='model-loading-methods'>
          {/* 원격 모델 로딩 */}
          <div className='model-section'>
            <h3>🌐 원격 모델</h3>
            <div className='model-controls'>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className='model-select'
                disabled={isModelLoading || isLoaded}
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <button onClick={handleLoadRemoteModel} disabled={isModelLoading || isLoaded} className='load-model-btn'>
                {isModelLoading && loadingType === 'remote' ? `로딩 중... ${progress.toFixed(1)}%` : '원격 모델 로드'}
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className='model-divider'>
            <span>또는</span>
          </div>

          {/* 로컬 모델 로딩 */}
          <div className='model-section'>
            <h3>📁 로컬 모델</h3>
            <div className='model-warning'>
              <p>✅ wllama는 로컬 GGUF 파일을 직접 지원합니다. 로컬 모델을 선택하면 실제 파일이 로드됩니다.</p>
            </div>
            <div className='model-controls'>
              <select
                value={selectedLocalModel}
                onChange={(e) => setSelectedLocalModel(e.target.value)}
                className='model-select'
                disabled={isModelLoading || isLoaded}
              >
                {localModels.map((model) => (
                  <option key={model} value={model}>
                    {model.split('/').pop()} (로컬)
                  </option>
                ))}
              </select>
              <button onClick={handleLoadLocalModel} disabled={isModelLoading || isLoaded} className='load-model-btn'>
                {isModelLoading && loadingType === 'local' ? `로딩 중... ${progress.toFixed(1)}%` : '로컬 모델 로드'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 채팅 인터페이스 - 모델이 로드된 후에만 표시 */}
      {isLoaded && (
        <div className='chat-interface'>
          <div className='chat-controls'>
            <h3>💬 채팅</h3>
            <button onClick={clearChat} className='clear-chat-btn'>
              🗑️ 대화 초기화
            </button>
          </div>

          <div className='chat-messages'>
            {messages.length === 0 ? (
              <div className='empty-state'>
                <p>안녕하세요! 무엇을 도와드릴까요?</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}>
                  <div className='message-content'>{message.content}</div>
                </div>
              ))
            )}
            {isLoading && (
              <div className='message assistant'>
                <div className='message-content'>
                  <div className='typing-indicator'>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='chat-input'>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='메시지를 입력하세요...'
              disabled={isLoading}
              className='message-input'
            />
            <button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} className='send-btn'>
              전송
            </button>
          </div>
        </div>
      )}

      {/* 모델이 로드되지 않은 경우 안내 메시지 */}
      {!isLoaded && modelStatus !== 'loading' && (
        <div className='model-loading-guide'>
          <div className='guide-content'>
            <h3>🚀 wllama 모델 로딩 가이드</h3>
            <div className='guide-steps'>
              <div className='step'>
                <span className='step-number'>1</span>
                <p>원격 모델: 드롭다운에서 원하는 모델을 선택하고 "원격 모델 로드" 버튼을 클릭하세요</p>
              </div>
              <div className='step'>
                <span className='step-number'>2</span>
                <p>로컬 모델: 로컬 GGUF 파일을 선택하고 "로컬 모델 로드" 버튼을 클릭하세요</p>
              </div>
              <div className='step'>
                <span className='step-number'>3</span>
                <p>모델 로딩이 완료되면 채팅 인터페이스가 나타납니다</p>
              </div>
            </div>
            <div className='model-suggestions'>
              <h4>💡 추천 모델들:</h4>
              <ul>
                <li>
                  <code>TinyLlama-1.1B-Chat-v1.0-q4f16_1</code> - 빠른 응답, 경량 모델 (권장)
                </li>
                <li>
                  <code>Phi-2-q4f16_1</code> - Microsoft의 효율적인 모델
                </li>
                <li>
                  <code>Mistral-7B-Instruct-v0.2-q4f16_1</code> - 고품질 응답, 중간 크기
                </li>
              </ul>
              <h4>✅ wllama 특징:</h4>
              <ul>
                <li>wllama는 로컬 GGUF 파일을 직접 지원합니다</li>
                <li>WebAssembly를 사용하여 브라우저에서 직접 실행됩니다</li>
                <li>네트워크 없이도 로컬 모델을 사용할 수 있습니다</li>
              </ul>
              <h4>⚡ 성능 팁:</h4>
              <ul>
                <li>첫 번째 로딩은 시간이 걸릴 수 있습니다 (모델 다운로드/로딩)</li>
                <li>WebGPU를 지원하는 브라우저에서 더 빠른 성능을 얻을 수 있습니다</li>
                <li>로컬 모델은 네트워크 없이도 사용할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMChat;
