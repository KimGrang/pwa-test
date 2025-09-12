import { useUserStore } from '../store/userStore';
import { useHospitalStore } from '../store/hospitalStore';
import type { Hospital } from '../types/hospital';

// User 타입 정의
interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'HOSPITAL_ADMIN' | 'VET' | 'OWNER';
  hospitalId?: number;
  hospital?: Hospital;
  SNS?: string;
  isTestAccount?: boolean;
}

/**
 * 공통 로그인 후처리 함수
 * 사용자 정보와 병원 정보를 처리하는 공통 로직
 */
export const processLoginData = async (user: User, getMyHospital: () => Promise<unknown>) => {
  const { setCurrentUser } = useUserStore.getState();
  const { setMyHospital } = useHospitalStore.getState();

  try {
    // console.log('🔄 로그인 후처리 시작:', user);
    // console.log('📋 사용자 정보 상세:', JSON.stringify(user, null, 2));
    // console.log('🏥 사용자 병원 ID:', user.hospitalId);
    // console.log('🏥 사용자 병원 정보:', user.hospital);

    // 사용자 정보 저장
    setCurrentUser(user as import('../types/user').User);

    // 병원 정보 처리
    if (user.hospital) {
      // 병원 정보가 이미 포함되어 있는 경우
      // console.log('🏥 병원 정보를 병원 스토어에 저장:', user.hospital);
      setMyHospital(user.hospital);
    } else if (user.hospitalId) {
      // 병원 ID만 있는 경우, 별도 API로 병원 정보 조회
      // console.log('🏥 병원 ID만 존재, 병원 정보 조회 API 호출:', user.hospitalId);
      try {
        const hospitalResponse = (await getMyHospital()) as { success: boolean; data?: Hospital };
        if (hospitalResponse && hospitalResponse.success && hospitalResponse.data) {
          // console.log('🏥 병원 정보 조회 성공:', hospitalResponse.data);
          setMyHospital(hospitalResponse.data);
        } else {
          // console.log('🏥 병원 정보 조회 결과 없음');
        }
      } catch (error) {
        console.error('❌ 병원 정보 조회 실패:', error);
      }
    } else {
      // console.log('🏥 병원 정보 없음');
    }

    // console.log('✅ 로그인 후처리 완료');
  } catch (error) {
    console.error('❌ 로그인 후처리 실패:', error);
  }
};
