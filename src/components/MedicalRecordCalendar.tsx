import React, { useState, useMemo, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/MedicalRecordCalendar.css';

// recordStore의 MedicalRecord 타입과 호환되는 인터페이스
interface MedicalRecord {
  id: number;
  petId: number;
  hospitalId: number;
  vetId: number;
  visitDate: string;
  chiefComplaint: string;
  examinationNotes: string;
  treatmentPlan: string;
  followUp: string;
  createdAt: string;
}

interface MedicalRecordCalendarProps {
  medicalRecords: MedicalRecord[];
  onDateSelect?: (date: Date) => void;
  onRecordSelect?: (record: MedicalRecord) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

/**
 * React Calendar를 사용한 진료기록 캘린더
 * 커스텀 타일로 진료기록을 시각적으로 표시
 */
const MedicalRecordCalendar: React.FC<MedicalRecordCalendarProps> = ({
  medicalRecords,
  onDateSelect,
  onRecordSelect,
}) => {
  const [value, setValue] = useState<Value>(new Date());

  // 날짜별 진료기록 그룹화
  const recordsByDate = useMemo(() => {
    const grouped: Record<string, MedicalRecord[]> = {};

    medicalRecords.forEach((record) => {
      const dateKey = new Date(record.visitDate).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });

    return grouped;
  }, [medicalRecords]);

  // 날짜 변경 처리
  const handleDateChange = useCallback(
    (newValue: Value) => {
      setValue(newValue);
      if (newValue instanceof Date) {
        onDateSelect?.(newValue);
      }
    },
    [onDateSelect]
  );

  // 진료기록 클릭 처리
  const handleRecordClick = useCallback(
    (record: MedicalRecord, e: React.MouseEvent) => {
      e.stopPropagation();
      onRecordSelect?.(record);
    },
    [onRecordSelect]
  );

  // 커스텀 타일 렌더링
  const tileContent = useCallback(
    ({ date, view }: { date: Date; view: string }) => {
      if (view !== 'month') return null;

      const dateKey = date.toDateString();
      const dayRecords = recordsByDate[dateKey] || [];

      if (dayRecords.length === 0) return null;

      return (
        <div className='calendar-tile-content'>
          <div className='records-indicator'>
            {dayRecords.slice(0, 2).map((record) => (
              <div
                key={record.id}
                className={`record-dot record-${getRecordType(record).toLowerCase()}`}
                onClick={(e) => handleRecordClick(record, e)}
                title={`${record.chiefComplaint} - ${new Date(record.visitDate).toLocaleDateString()}`}
              />
            ))}
            {dayRecords.length > 2 && <div className='more-records'>+{dayRecords.length - 2}</div>}
          </div>
        </div>
      );
    },
    [recordsByDate, handleRecordClick]
  );

  // 진료기록 타입 추출 (실제로는 record에서 추출해야 함)
  const getRecordType = (record: MedicalRecord): string => {
    // 실제 구현에서는 record의 필드를 기반으로 타입을 결정
    if (record.treatmentPlan?.includes('예방') || record.chiefComplaint?.includes('예방')) return 'VACCINATION';
    if (record.treatmentPlan?.includes('수술') || record.chiefComplaint?.includes('수술')) return 'SURGERY';
    if (record.treatmentPlan?.includes('검진') || record.chiefComplaint?.includes('검진')) return 'EXAMINATION';
    return 'CONSULTATION';
  };

  // 오늘 날짜 하이라이트
  const tileClassName = useCallback(
    ({ date, view }: { date: Date; view: string }) => {
      if (view !== 'month') return '';

      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const dateKey = date.toDateString();
      const hasRecords = recordsByDate[dateKey] && recordsByDate[dateKey].length > 0;

      let className = '';
      if (isToday) className += ' today';
      if (hasRecords) className += ' has-records';

      return className.trim();
    },
    [recordsByDate]
  );

  return (
    <div className='medical-record-calendar'>
      <Calendar
        onChange={handleDateChange}
        value={value}
        tileContent={tileContent}
        tileClassName={tileClassName}
        locale='ko-KR'
        formatDay={(locale, date) => date.getDate().toString()}
        showNeighboringMonth={false}
        maxDetail='month'
        minDetail='month'
        className='react-calendar'
      />

      {/* 진료기록 타입별 범례 */}
      <div className='calendar-legend'>
        <div className='legend-title'>진료 유형</div>
        <div className='legend-items'>
          <div className='legend-item'>
            <div className='legend-dot record-consultation'></div>
            <span>상담</span>
          </div>
          <div className='legend-item'>
            <div className='legend-dot record-vaccination'></div>
            <span>예방접종</span>
          </div>
          <div className='legend-item'>
            <div className='legend-dot record-surgery'></div>
            <span>수술</span>
          </div>
          <div className='legend-item'>
            <div className='legend-dot record-examination'></div>
            <span>검사</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordCalendar;
