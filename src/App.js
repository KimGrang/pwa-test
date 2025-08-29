import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import PWAInstallButton from './components/PWAInstallButton';
import LLMChat from './components/LLMChat';
import './App.css';
const App = () => {
    return (_jsxs("div", { className: 'App', children: [_jsxs("header", { className: 'App-header', children: [_jsx("h1", { children: "\uD83E\uDD16 wllama AI \uCC44\uD305 PWA" }), _jsx("p", { children: "wllama\uB97C \uC0AC\uC6A9\uD55C \uC628\uB514\uBC14\uC774\uC2A4 AI \uBAA8\uB378\uB85C \uB300\uD654\uD558\uC138\uC694" }), _jsx(PWAInstallButton, {})] }), _jsxs("main", { children: [_jsx("div", { className: 'app-description', children: _jsx("p", { children: "\uC774 \uC571\uC740 \uC624\uD504\uB77C\uC778\uC5D0\uC11C\uB3C4 \uB3D9\uC791\uD558\uBA70, \uD648 \uD654\uBA74\uC5D0 \uC124\uCE58\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }) }), _jsx("div", { className: 'llm-section', children: _jsx(LLMChat, {}) })] }), _jsx(PWAUpdatePrompt, {})] }));
};
export default App;
