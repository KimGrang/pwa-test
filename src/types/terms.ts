export type TermsKey = 'privacy' | 'id' | 'tos' | 'ai';

export const TERMS_METADATA: Record<
  TermsKey,
  { title: string; required: boolean; content: string }
> = {
  privacy: {
    title: '개인정보 수집/이용 동의',
    required: true,
    content:
      '개인정보의 수집 및 이용 목적, 보유 및 이용 기간, 제3자 제공 등에 관한 사항을 안내합니다. 서비스 제공을 위해 최소한의 정보가 수집됩니다.',
  },
  id: {
    title: '고유식별정보 처리 동의',
    required: true,
    content:
      '고유식별정보(예: 주민등록번호 등)를 처리하는 경우의 목적과 범위, 보관 및 파기 절차를 안내합니다.',
  },
  tos: {
    title: '서비스 이용약관 동의',
    required: true,
    content:
      '서비스 이용을 위한 권리와 의무, 금지 행위, 책임 제한, 분쟁 해결 절차와 관할에 대해 규정합니다.',
  },
  ai: {
    title: 'AI 데이터 수집·활용 동의',
    required: true,
    content:
      'AI 상담 품질 향상을 위해 대화 내용 일부가 익명화되어 모델 개선에 활용될 수 있습니다. 민감정보는 저장/학습되지 않도록 최선을 다합니다.',
  },
};

export const TERMS_ORDER: TermsKey[] = ['privacy', 'id', 'tos', 'ai'];
