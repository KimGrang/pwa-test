import { useState, useEffect } from 'react';
/**
 * Service Worker 기능들을 제공하는 커스텀 훅
 * Background Sync, Periodic Sync, Push Notifications 지원
 */
export const useServiceWorker = () => {
    const [registration, setRegistration] = useState(null);
    const [isSupported, setIsSupported] = useState({
        serviceWorker: false,
        backgroundSync: false,
        periodicSync: false,
        pushNotifications: false,
    });
    useEffect(() => {
        const checkSupport = async () => {
            const support = {
                serviceWorker: 'serviceWorker' in navigator,
                backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
                periodicSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
                pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
            };
            setIsSupported(support);
            if (support.serviceWorker) {
                try {
                    const reg = await navigator.serviceWorker.register('/sw.js');
                    setRegistration(reg);
                    console.log('Service Worker 등록 성공:', reg);
                }
                catch (error) {
                    console.error('Service Worker 등록 실패:', error);
                }
            }
        };
        checkSupport();
    }, []);
    /**
     * Background Sync 등록
     * @param tag - 동기화 태그
     * @param options - 옵션
     */
    const registerBackgroundSync = async (tag = 'background-sync', options) => {
        if (!isSupported.backgroundSync || !registration) {
            throw new Error('Background Sync가 지원되지 않습니다.');
        }
        try {
            await registration.sync.register(tag, options);
            console.log('Background Sync 등록 성공');
        }
        catch (error) {
            console.error('Background Sync 등록 실패:', error);
            throw error;
        }
    };
    /**
     * Periodic Sync 등록
     * @param tag - 동기화 태그
     * @param options - 옵션
     */
    const registerPeriodicSync = async (tag = 'periodic-sync', options) => {
        if (!isSupported.periodicSync || !registration) {
            throw new Error('Periodic Sync가 지원되지 않습니다.');
        }
        try {
            await registration.periodicSync.register(tag, options);
            console.log('Periodic Sync 등록 성공');
        }
        catch (error) {
            console.error('Periodic Sync 등록 실패:', error);
            throw error;
        }
    };
    /**
     * Push Notifications 구독
     * @param vapidPublicKey - VAPID 공개 키
     */
    const subscribeToPushNotifications = async (vapidPublicKey) => {
        if (!isSupported.pushNotifications || !registration) {
            throw new Error('Push Notifications가 지원되지 않습니다.');
        }
        try {
            // 기존 구독 확인
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                // 새로운 구독 생성
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidPublicKey,
                });
            }
            console.log('Push Notifications 구독 성공:', subscription);
            return subscription;
        }
        catch (error) {
            console.error('Push Notifications 구독 실패:', error);
            throw error;
        }
    };
    /**
     * Push Notifications 구독 해제
     */
    const unsubscribeFromPushNotifications = async () => {
        if (!registration) {
            throw new Error('Service Worker가 등록되지 않았습니다.');
        }
        try {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                console.log('Push Notifications 구독 해제 성공');
            }
        }
        catch (error) {
            console.error('Push Notifications 구독 해제 실패:', error);
            throw error;
        }
    };
    /**
     * 알림 권한 요청
     */
    const requestNotificationPermission = async () => {
        if (!isSupported.pushNotifications) {
            throw new Error('Push Notifications가 지원되지 않습니다.');
        }
        try {
            const permission = await Notification.requestPermission();
            console.log('알림 권한:', permission);
            return permission;
        }
        catch (error) {
            console.error('알림 권한 요청 실패:', error);
            throw error;
        }
    };
    /**
     * 로컬 알림 표시
     * @param title - 알림 제목
     * @param options - 알림 옵션
     */
    const showLocalNotification = (title, options = {}) => {
        if (!isSupported.pushNotifications) {
            throw new Error('Push Notifications가 지원되지 않습니다.');
        }
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/pwa-192x192.svg',
                badge: '/pwa-64x64.svg',
                ...options,
            });
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            return notification;
        }
        else {
            throw new Error('알림 권한이 없습니다.');
        }
    };
    /**
     * Service Worker 업데이트 확인
     */
    const checkForUpdate = async () => {
        if (!registration) {
            throw new Error('Service Worker가 등록되지 않았습니다.');
        }
        try {
            await registration.update();
            console.log('Service Worker 업데이트 확인 완료');
        }
        catch (error) {
            console.error('Service Worker 업데이트 확인 실패:', error);
            throw error;
        }
    };
    return {
        registration,
        isSupported,
        registerBackgroundSync,
        registerPeriodicSync,
        subscribeToPushNotifications,
        unsubscribeFromPushNotifications,
        requestNotificationPermission,
        showLocalNotification,
        checkForUpdate,
    };
};
