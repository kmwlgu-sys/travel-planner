import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

function DateRangePicker({ startDate, endDate, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        // 외부 클릭 시 달력 닫기
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    const handleSelect = (ranges) => {
        onChange({
            startDate: ranges.selection.startDate,
            endDate: ranges.selection.endDate,
        });

        // 날짜를 두 번 클릭(시작일 -> 종료일)하면 달력을 자동으로 닫음
        setClickCount(prev => {
            if (prev === 1) {
                setTimeout(() => {
                    setIsOpen(false);
                    setClickCount(0);
                }, 150); // 자연스럽게 색상이 채워지는 애니메이션을 볼 수 있도록 약간의 딜레이
                return 0;
            }
            return prev + 1;
        });
    };

    const selectionRange = {
        startDate: startDate,
        endDate: endDate,
        key: 'selection',
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', flex: 1 }}>
            <div
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) setClickCount(0); // 열릴 때마다 클릭 카운트 초기화
                }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#ffffff',
                    padding: '12px 18px',
                    borderRadius: '20px',
                    border: '2px solid rgba(255, 182, 193, 0.4)',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    boxShadow: '0 4px 12px rgba(255, 182, 193, 0.1)',
                    transition: 'all 0.3s ease',
                    width: '100%'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 182, 193, 0.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
                <CalendarIcon size={22} color="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>여행 기간 설정</span>
                    <span style={{ fontWeight: 700, marginTop: '2px' }}>
                        {format(startDate, 'yyyy.MM.dd')} ~ {format(endDate, 'yyyy.MM.dd')}
                    </span>
                </div>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: isMobile ? '50%' : 0,
                    transform: isMobile ? 'translateX(-50%)' : 'none',
                    marginTop: '12px',
                    zIndex: 50,
                    borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(255,182,193,0.3)',
                    maxWidth: '100vw'
                }}>
                    <DateRange
                        key={isMobile ? 'mobile' : 'desktop'}
                        locale={ko}
                        ranges={[selectionRange]}
                        onChange={handleSelect}
                        months={isMobile ? 1 : 2}
                        direction={isMobile ? "vertical" : "horizontal"}
                        rangeColors={['#ff4e50']}
                        showDateDisplay={false}
                    />
                </div>
            )}
        </div>
    );
}

export default DateRangePicker;
