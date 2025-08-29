import { useRegisterSW } from 'virtual:pwa-register/react';
export function usePWA() {
    const { offlineReady: [offlineReady, setOfflineReady], needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker, } = useRegisterSW();
    return {
        offlineReady,
        needRefresh,
        updateServiceWorker,
        closePrompt: () => {
            setOfflineReady(false);
            setNeedRefresh(false);
        },
    };
}
