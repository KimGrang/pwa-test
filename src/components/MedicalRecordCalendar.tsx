import React, { useMemo, useCallback } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { useUIStore } from '../store/uiStore';
import { MedicalRecord } from '../types/medical-record';

interface MedicalRecordCalendarProps {
  medicalRecords: MedicalRecord[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onRecordSelect?: (record: MedicalRecord) => void;
}

/**
 * 커스텀 진료기록 캘린더
 * Tailwind CSS를 활용한 깔끔하고 모던한 달력 UI
 * 진료기록 표시 기능이 포함된 달력
 */
const MedicalRecordCalendar: React.FC<MedicalRecordCalendarProps> = ({
  medicalRecords,
  // selectedDate,
  onDateSelect,
  onRecordSelect,
}) => {
  // UI 스토어에서 캘린더 상태 가져오기
  const { calendar, setCalendarCurrentDate, setCalendarSelectedDate } = useUIStore();
  const currentDate = useMemo(() => new Date(calendar.currentDate), [calendar.currentDate]); // Date 객체로 변환

  // 달력에 표시할 모든 날짜들 생성 (항상 6주 = 42일)
  const calendarDays: Date[] = useMemo(() => {
    // 현재 월의 첫 번째 날
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // 달력 시작 날짜 (이전 월의 일부 날짜 포함)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days: Date[] = [];
    const currentCalendarDate = new Date(startDate);

    // 정확히 42일(6주 × 7일)을 생성
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentCalendarDate));
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // 요일 헤더 배열
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 월 이름 배열
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // 날짜별 진료기록 그룹화
  const recordsByDate = useMemo(() => {
    const grouped: Record<string, MedicalRecord[]> = {};

    medicalRecords.forEach((record) => {
      const dateKey = new Date(record.visitDate).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });

    return grouped;
  }, [medicalRecords]);

  // 헬퍼 함수들
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const isCurrentMonth = useCallback(
    (date: Date) => {
      return date.getMonth() === currentDate.getMonth();
    },
    [currentDate]
  );

  const isSelected = useCallback(
    (date: Date) => {
      const storeSelectedDate = calendar.selectedDate;
      if (!storeSelectedDate) return false;
      const selectedDateObj = new Date(storeSelectedDate); // Date 객체로 변환
      return date.toDateString() === selectedDateObj.toDateString();
    },
    [calendar.selectedDate]
  );

  // 진료기록 타입 추출
  const getRecordType = useCallback((record: MedicalRecord): string => {
    if (record.examinationNotes === '예방접종') return 'vaccination';
    if (record.examinationNotes === '건강검진') return 'examination';
    if (record.examinationNotes === '일반진료') return 'consultation';
    return 'consultation'; // 기본값
  }, []);

  // 월 네비게이션
  const navigateMonth = useCallback(
    (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCalendarCurrentDate(newDate);
    },
    [currentDate, setCalendarCurrentDate]
  );

  // 년 네비게이션
  const navigateYear = useCallback(
    (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setFullYear(newDate.getFullYear() - 1);
      } else {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
      setCalendarCurrentDate(newDate);
    },
    [currentDate, setCalendarCurrentDate]
  );

  // 날짜 클릭 처리
  const handleDateClick = useCallback(
    (date: Date) => {
      const dateKey = date.toISOString().split('T')[0];
      const dayRecords = recordsByDate[dateKey] || [];

      // 스토어에 선택된 날짜 저장
      setCalendarSelectedDate(date);
      onDateSelect?.(date);

      // 진료기록이 있으면 첫 번째 기록 선택
      if (dayRecords.length > 0) {
        onRecordSelect?.(dayRecords[0]);
      }
    },
    [recordsByDate, onDateSelect, onRecordSelect, setCalendarSelectedDate]
  );

  // 진료기록 클릭 처리
  const handleRecordClick = useCallback(
    (record: MedicalRecord, e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      console.log('🔍 진료기록 클릭됨:', record);
      onRecordSelect?.(record);
    },
    [onRecordSelect]
  );

  return (
    <div className='medical-calendar'>
      {/* 헤더 - 월/년 네비게이션 */}
      <div className='calendar-header'>
        {/* 년 네비게이션 */}
        <div className='calendar-year-nav'>
          <button onClick={() => navigateYear('prev')} title='이전 년'>
            <ChevronDoubleLeftIcon className='w-5 h-5' />
          </button>

          <span className='calendar-year-text'>{currentDate.getFullYear()}년</span>

          <button onClick={() => navigateYear('next')} title='다음 년'>
            <ChevronDoubleRightIcon className='w-5 h-5' />
          </button>
        </div>

        {/* 월 네비게이션 */}
        <div className='calendar-month-nav'>
          <button onClick={() => navigateMonth('prev')} title='이전 달'>
            <ChevronLeftIcon className='w-5 h-5' />
          </button>

          <h2 className='calendar-month-text'>{monthNames[currentDate.getMonth()]}</h2>

          <button onClick={() => navigateMonth('next')} title='다음 달'>
            <ChevronRightIcon className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className='calendar-day-names'>
        {dayNames.map((day) => (
          <div key={day} className='calendar-day-name'>
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className='calendar-grid'>
        {calendarDays.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0];
          const dayRecords = recordsByDate[dateKey] || [];

          const getRecordDotClass = (record: MedicalRecord) => {
            const type = getRecordType(record);
            switch (type) {
              case 'consultation':
                return 'consultation';
              case 'vaccination':
                return 'vaccination';
              case 'examination':
                return 'examination';
              default:
                return 'default';
            }
          };

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`calendar-date-cell ${!isCurrentMonth(date) ? 'other-month' : ''} ${
                isToday(date) ? 'today' : ''
              } ${isSelected(date) ? 'selected' : ''}`}
            >
              <span className='calendar-date-number'>{date.getDate()}</span>

              {/* 진료기록 표시 점들 */}
              {dayRecords.length > 0 && (
                <div className='calendar-record-dots'>
                  {dayRecords.slice(0, 3).map((record) => (
                    <div
                      key={record.id}
                      className={`calendar-record-dot ${getRecordDotClass(record)}`}
                      onClick={(e) => handleRecordClick(record, e)}
                      title={`${record.chiefComplaint} - ${date.toLocaleDateString()}`}
                      role='button'
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRecordClick(record, e);
                        }
                      }}
                      aria-label={`진료기록: ${record.chiefComplaint}`}
                    />
                  ))}
                  {dayRecords.length > 3 && <span className='calendar-record-more'>+{dayRecords.length - 3}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 범례 - 진료기록 타입만 */}
      <div className='calendar-legend'>
        <div className='calendar-legend-section'>
          <div className='calendar-legend-title'>진료기록 타입</div>
          <div className='calendar-legend-items'>
            <div className='calendar-legend-item small'>
              <div className='calendar-legend-color small consultation'></div>
              <span className='calendar-legend-text'>일반진료</span>
            </div>
            <div className='calendar-legend-item small'>
              <div className='calendar-legend-color small vaccination'></div>
              <span className='calendar-legend-text'>예방접종</span>
            </div>
            <div className='calendar-legend-item small'>
              <div className='calendar-legend-color small examination'></div>
              <span className='calendar-legend-text'>건강검진</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordCalendar;
