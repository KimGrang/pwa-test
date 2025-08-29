import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usePWA } from '../hooks/usePWA';
import './PWAUpdatePrompt.css';
const PWAUpdatePrompt = () => {
    const { offlineReady, needRefresh, updateServiceWorker, closePrompt } = usePWA();
    if (!offlineReady && !needRefresh)
        return null;
    return (_jsx("div", { className: 'pwa-update-prompt', children: _jsxs("div", { className: 'pwa-update-toast', children: [_jsx("div", { className: 'pwa-update-message', children: offlineReady
                        ? '앱이 오프라인에서 사용 가능합니다.'
                        : '새 콘텐츠를 사용할 수 있습니다. 새로고침하시겠습니까?' }), _jsxs("div", { className: 'pwa-update-buttons', children: [needRefresh && (_jsx("button", { className: 'pwa-update-button primary', onClick: () => updateServiceWorker(true), children: "\uC0C8\uB85C\uACE0\uCE68" })), _jsx("button", { className: 'pwa-update-button secondary', onClick: closePrompt, children: "\uB2EB\uAE30" })] })] }) }));
};
export default PWAUpdatePrompt;
