import { jsx as _jsx } from "react/jsx-runtime";
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import './PWAInstallButton.css';
const PWAInstallButton = () => {
    const { isInstallable, promptInstall, isInstalled } = useInstallPrompt();
    if (isInstalled) {
        return _jsx("div", { className: 'pwa-install-status', children: "\u2705 \uC571\uC774 \uC124\uCE58\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
    }
    if (!isInstallable)
        return null;
    return (_jsx("button", { className: 'pwa-install-button', onClick: promptInstall, children: "\uD83D\uDCF1 \uD648 \uD654\uBA74\uC5D0 \uCD94\uAC00" }));
};
export default PWAInstallButton;
