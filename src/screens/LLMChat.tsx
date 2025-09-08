import React, { useState, useEffect, useRef } from 'react';

// import { useWllama } from '../hooks/useWllama';

/**
 * AI 상담 화면 컴포넌트
 * AI 채팅 인터페이스와 상담 기능을 제공
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const LLMChat: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // wllama 훅 사용
  // const { isLoaded, isLoading, error, loadModel, chatCompletion } = useWllama({
  //   temperature: 0.7,
  //   maxTokens: 512,
  // });

  // 임시 상태값들 (LLM 없이 테스트용)
  // const isLoaded = false;
  // const isLoading = false;
  // const error = null;

  // axios를 사용한 API 통신 함수

  // 제안 질문들
  const suggestedQuestions = [
    '강아지가 밥을 안 먹어요',
    '예방접종 주기는 어떻게 되나요?',
    '강아지가 이상 행동을 보이고 있어요',
    '오늘 식욕이 없어요',
  ];

  // 메시지 목록 끝으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 모델 자동 로드 (한 번만 실행) - LLM 기능 주석처리
  // useEffect(() => {
  //   if (!isLoaded && !isLoading && !error) {
  //     console.log('🚀 wllama 모델 자동 로드 시작...');
  //     loadModel('https://www.dwon.store/models/euro_gguf.gguf');
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isLoaded, isLoading, error]); // loadModel 제거로 무한 루프 방지

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsStreaming(true);

    // axios를 사용한 API 통신
    try {
      // API로 메시지 전송 (실제 서버 구현 시 사용)
      // const apiResponse = await sendMessageToAPI(inputMessage);

      // 임시 AI 응답 (테스트용 - API 서버 없을 때)
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: `[테스트 응답] "${inputMessage}"에 대한 답변입니다. 실제 API 서버가 연결되면 이 부분이 실제 응답으로 교체됩니다.`,
          timestamp: new Date(),
        };
        setMessages([...newMessages, assistantMessage]);
        setIsStreaming(false);
      }, 1000);
    } catch (error) {
      console.error('❌ 채팅 오류:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'API 통신 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMessage]);
      setIsStreaming(false);
    }

    /* LLM 관련 로직 주석처리
    try {
      // AI 응답 메시지 미리 추가 (스트리밍용)
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages([...newMessages, assistantMessage]);

      // wllama 채팅 완료 호출
      const response = await chatCompletion(
        newMessages.map((msg) => ({ role: msg.role, content: msg.content })),
        (chunk: string) => {
          // 스트리밍 응답 업데이트
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content += chunk;
            }
            return updatedMessages;
          });
        }
      );

      // 최종 응답으로 업데이트
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = response || '죄송합니다. 응답을 생성할 수 없습니다.';
        }
        return updatedMessages;
      });
    } catch (error) {
      console.error('❌ 채팅 오류:', error);
      // 오류 메시지 추가
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 모델이 로드되었는지 확인해주세요.',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages.slice(0, -1), errorMessage]);
    } finally {
      setIsStreaming(false);
    }
    */
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='screen-container'>
      {/* 상단 헤더 */}
      <div className='screen-header'>
        <div className='header-left'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
        <div className='header-center'>
          <span className='title'>AI 상담</span>
        </div>
        <div className='header-right'>{/* 빈 공간 - 중앙 정렬을 위한 플레이스홀더 */}</div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='screen-scrollable-content'>
        {/* 상태 표시 - axios API 통신 준비 */}
        <div className='status-section'>
          <div className='status-message success'>✅ API 통신 준비 완료! (테스트 모드)</div>
        </div>

        {/* LLM 상태 표시 주석처리
        <div className='status-section'>
          {!isLoaded && !isLoading && (
            <div className='status-message warning'>AI 모델이 로드되지 않았습니다. 로딩을 시작합니다...</div>
          )}
          {isLoading && (
            <div className='status-message loading'>🔄 AI 모델 로딩 중... (최대 몇 분 소요될 수 있습니다)</div>
          )}
          {error && <div className='status-message error'>❌ 오류: {error}</div>}
          {isLoaded && <div className='status-message success'>✅ AI 상담 준비 완료!</div>}
        </div>
        */}
        {/* 채팅 메시지 목록 */}
        <div className='chat-messages'>
          {messages.length === 0 ? (
            <div className='welcome-section'>
              {/* 경고 배너 */}
              <div className='warning-banner'>
                본 AI 상담은 참고용으로 제공되며, 정확한 진단과 치료는 반드시 수의사와 상담 후 진행해주세요.
              </div>

              {/* AI 인사말 */}
              <div className='ai-greeting'>
                <div className='ai-avatar'>🤖</div>
                <div className='ai-message'>안녕하세요! 반려동물 건강 상담 AI입니다. 무엇을 도와드릴까요?</div>
              </div>

              {/* 제안 질문들 */}
              <div className='suggested-questions'>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className='suggested-question'
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={false}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}>
                <div className='message-content'>{message.content}</div>
                <div className='message-time'>
                  {message.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 필드 */}
        <div className='chat-input-section'>
          <input
            type='text'
            placeholder='메시지를 입력하세요... (API 통신 테스트 모드)'
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className='chat-input'
            disabled={false}
          />
          <button className='send-button' onClick={handleSendMessage} disabled={!inputMessage.trim() || isStreaming}>
            {isStreaming ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMChat;
