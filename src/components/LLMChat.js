import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useWllama } from '../hooks/useWllama';
import './LLMChat.css';
const LLMChat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedModel, setSelectedModel] = useState('https://www.dwon.store/models/euro_gguf.gguf');
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [modelStatus, setModelStatus] = useState('none');
    const [modelInfo, setModelInfo] = useState('');
    const [loadingType, setLoadingType] = useState('remote');
    // wllama 훅
    const { loadModel, chatCompletion, isLoaded, isLoading, progress, modelInfo: wllamaModelInfo, getAvailableModels, loadModelFromFile, } = useWllama({
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 512,
        repetitionPenalty: 1.1,
    });
    // 모델 상태 업데이트
    React.useEffect(() => {
        if (isLoading) {
            setModelStatus('loading');
        }
        else if (isLoaded) {
            setModelStatus('loaded');
            setModelInfo(wllamaModelInfo);
        }
        else {
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
        }
        catch (error) {
            setModelStatus('error');
            setModelInfo('모델 로딩에 실패했습니다');
            alert('모델 로딩에 실패했습니다: ' + error);
        }
        finally {
            setIsModelLoading(false);
        }
    };
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        // GGUF 파일인지 확인
        if (!file.name.endsWith('.gguf')) {
            alert('GGUF 파일만 업로드 가능합니다.');
            return;
        }
        try {
            setIsModelLoading(true);
            setLoadingType('local');
            setModelStatus('loading');
            await loadModelFromFile(file);
            setModelInfo(`업로드된 모델 (${file.name})이 로드되었습니다`);
        }
        catch (error) {
            setModelStatus('error');
            setModelInfo('파일 로딩에 실패했습니다');
            alert('파일 로딩에 실패했습니다: ' + error);
        }
        finally {
            setIsModelLoading(false);
        }
    };
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !isLoaded)
            return;
        const userMessage = {
            role: 'user',
            content: inputMessage,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        // 어시스턴트 메시지를 먼저 생성하고 스트리밍으로 업데이트
        const assistantMessage = {
            role: 'assistant',
            content: '',
        };
        setMessages((prev) => [...prev, assistantMessage]);
        try {
            let streamedContent = '';
            await chatCompletion([...messages, userMessage], (token) => {
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
        }
        catch (error) {
            console.error('채팅 오류:', error);
            alert('메시지 전송에 실패했습니다.');
            // 오류 발생 시 빈 메시지 제거
            setMessages((prev) => prev.slice(0, -1));
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const clearChat = () => {
        setMessages([]);
    };
    const availableModels = getAvailableModels();
    return (_jsxs("div", { className: 'llm-chat', children: [_jsxs("div", { className: 'chat-header', children: [_jsx("h2", { children: "\uD83E\uDD16 wllama \uC628\uB514\uBC14\uC774\uC2A4 LLM \uCC44\uD305" }), _jsxs("div", { className: `model-status-indicator ${modelStatus}`, children: [modelStatus === 'none' && _jsx("span", { children: "\uD83D\uDCCB \uBAA8\uB378\uC744 \uC120\uD0DD\uD558\uACE0 \uB85C\uB4DC\uD574\uC8FC\uC138\uC694" }), modelStatus === 'loading' && (_jsxs("span", { children: ["\u23F3 \uBAA8\uB378 \uB85C\uB529 \uC911... ", progress.toFixed(1), "%", _jsx("div", { className: 'progress-bar', children: _jsx("div", { className: 'progress-fill', style: { width: `${progress}%` } }) }), _jsxs("div", { className: 'loading-details', children: [loadingType === 'remote' && (_jsxs(_Fragment, { children: [progress < 25 && '모델 다운로드 중...', progress >= 25 && progress < 50 && '모델 초기화 중...', progress >= 50 && 'WebGPU 설정 중...'] })), loadingType === 'local' && (_jsxs(_Fragment, { children: [progress < 25 && '로컬 파일 로딩 중...', progress >= 25 && progress < 50 && '모델 초기화 중...', progress >= 50 && 'WebGPU 설정 중...'] }))] })] })), modelStatus === 'loaded' && (_jsxs("span", { children: ["\u2705 ", modelInfo, _jsx("div", { className: 'model-details', children: _jsx("small", { children: "\uD83C\uDF10 nginx \uC11C\uBC84\uC5D0\uC11C \uB2E4\uC6B4\uB85C\uB4DC \uC644\uB8CC" }) })] })), modelStatus === 'error' && _jsxs("span", { children: ["\u274C ", modelInfo] })] }), _jsxs("div", { className: 'model-loading-methods', children: [_jsxs("div", { className: 'model-section', children: [_jsx("h3", { children: "\uD83C\uDF10 \uC6D0\uACA9 \uBAA8\uB378" }), _jsxs("div", { className: 'model-controls', children: [_jsx("select", { value: selectedModel, onChange: (e) => setSelectedModel(e.target.value), className: 'model-select', disabled: isModelLoading || isLoaded, children: availableModels.map((model) => {
                                                    // URL에서 파일명 추출하여 표시
                                                    const fileName = model.split('/').pop() || model;
                                                    return (_jsxs("option", { value: model, children: [fileName, " (1.64GB)"] }, model));
                                                }) }), _jsx("button", { onClick: handleLoadRemoteModel, disabled: isModelLoading || isLoaded, className: 'load-model-btn', children: isModelLoading && loadingType === 'remote' ? `로딩 중... ${progress.toFixed(1)}%` : '원격 모델 로드' })] })] }), _jsx("div", { className: 'model-divider', children: _jsx("span", { children: "\uB610\uB294" }) }), _jsxs("div", { className: 'model-section', children: [_jsx("h3", { children: "\uD83D\uDCC1 \uD30C\uC77C \uC5C5\uB85C\uB4DC" }), _jsx("div", { className: 'model-warning', children: _jsx("p", { children: "\u2705 \uCEF4\uD4E8\uD130\uC5D0\uC11C GGUF \uD30C\uC77C\uC744 \uC9C1\uC811 \uC120\uD0DD\uD558\uC5EC \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }) }), _jsxs("div", { className: 'model-controls', children: [_jsx("input", { type: 'file', accept: '.gguf', onChange: handleFileUpload, disabled: isModelLoading || isLoaded, className: 'file-input', id: 'model-file-input' }), _jsx("label", { htmlFor: 'model-file-input', className: 'file-input-label', children: isModelLoading && loadingType === 'local' ? `로딩 중... ${progress.toFixed(1)}%` : 'GGUF 파일 선택' })] })] })] })] }), isLoaded && (_jsxs("div", { className: 'chat-interface', children: [_jsxs("div", { className: 'chat-controls', children: [_jsx("h3", { children: "\uD83D\uDCAC \uCC44\uD305" }), _jsx("button", { onClick: clearChat, className: 'clear-chat-btn', children: "\uD83D\uDDD1\uFE0F \uB300\uD654 \uCD08\uAE30\uD654" })] }), _jsxs("div", { className: 'chat-messages', children: [messages.length === 0 ? (_jsx("div", { className: 'empty-state', children: _jsx("p", { children: "\uC548\uB155\uD558\uC138\uC694! \uBB34\uC5C7\uC744 \uB3C4\uC640\uB4DC\uB9B4\uAE4C\uC694?" }) })) : (messages.map((message, index) => (_jsx("div", { className: `message ${message.role === 'user' ? 'user' : 'assistant'}`, children: _jsx("div", { className: 'message-content', children: message.content }) }, index)))), isLoading && (_jsx("div", { className: 'message assistant', children: _jsx("div", { className: 'message-content', children: _jsxs("div", { className: 'typing-indicator', children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }) }) }))] }), _jsxs("div", { className: 'chat-input', children: [_jsx("textarea", { value: inputMessage, onChange: (e) => setInputMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: '\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694...', disabled: isLoading, className: 'message-input' }), _jsx("button", { onClick: handleSendMessage, disabled: isLoading || !inputMessage.trim(), className: 'send-btn', children: "\uC804\uC1A1" })] })] })), !isLoaded && modelStatus !== 'loading' && (_jsx("div", { className: 'model-loading-guide', children: _jsxs("div", { className: 'guide-content', children: [_jsx("h3", { children: "\uD83D\uDE80 wllama \uBAA8\uB378 \uB85C\uB529 \uAC00\uC774\uB4DC" }), _jsxs("div", { className: 'guide-steps', children: [_jsxs("div", { className: 'step', children: [_jsx("span", { className: 'step-number', children: "1" }), _jsx("p", { children: "\uC6D0\uACA9 \uBAA8\uB378: \uB4DC\uB86D\uB2E4\uC6B4\uC5D0\uC11C \uC6D0\uD558\uB294 \uBAA8\uB378\uC744 \uC120\uD0DD\uD558\uACE0 \"\uC6D0\uACA9 \uBAA8\uB378 \uB85C\uB4DC\" \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC138\uC694" })] }), _jsxs("div", { className: 'step', children: [_jsx("span", { className: 'step-number', children: "2" }), _jsx("p", { children: "\uB85C\uCEEC \uBAA8\uB378: \uB85C\uCEEC GGUF \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uACE0 \"\uB85C\uCEEC \uBAA8\uB378 \uB85C\uB4DC\" \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC138\uC694" })] }), _jsxs("div", { className: 'step', children: [_jsx("span", { className: 'step-number', children: "3" }), _jsx("p", { children: "\uBAA8\uB378 \uB85C\uB529\uC774 \uC644\uB8CC\uB418\uBA74 \uCC44\uD305 \uC778\uD130\uD398\uC774\uC2A4\uAC00 \uB098\uD0C0\uB0A9\uB2C8\uB2E4" })] })] }), _jsxs("div", { className: 'model-suggestions', children: [_jsx("h4", { children: "\u2705 wllama \uD2B9\uC9D5:" }), _jsxs("ul", { children: [_jsx("li", { children: "wllama\uB294 \uB85C\uCEEC GGUF \uD30C\uC77C\uC744 \uC9C1\uC811 \uC9C0\uC6D0\uD569\uB2C8\uB2E4" }), _jsx("li", { children: "WebAssembly\uB97C \uC0AC\uC6A9\uD558\uC5EC \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC9C1\uC811 \uC2E4\uD589\uB429\uB2C8\uB2E4" }), _jsx("li", { children: "\uB124\uD2B8\uC6CC\uD06C \uC5C6\uC774\uB3C4 \uB85C\uCEEC \uBAA8\uB378\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4" })] })] })] }) }))] }));
};
export default LLMChat;
