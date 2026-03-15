import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Plus, Trash2, GripVertical, Check, Save, Utensils, Coffee, BedDouble, ShoppingBag, Landmark, Map } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format, differenceInDays, addDays } from 'date-fns';
import { useJsApiLoader } from '@react-google-maps/api';
import MapContainer from './components/MapContainer';
import PlaceSearch from './components/PlaceSearch';
import DateRangePicker from './components/DateRangePicker';
import './index.css';

const libraries = ['places'];

function App() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });

  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem('startDate');
    return saved ? new Date(saved) : new Date();
  });
  const [endDate, setEndDate] = useState(() => {
    const saved = localStorage.getItem('endDate');
    return saved ? new Date(saved) : addDays(new Date(), 3);
  });
  const [itinerary, setItinerary] = useState(() => {
    const saved = localStorage.getItem('itinerary');
    return saved ? JSON.parse(saved) : {};
  }); // { '2026-03-10': [places] }
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedSearchPlace, setSelectedSearchPlace] = useState(null); // 새 장소 가선택 임시 핀
  const [placeNote, setPlaceNote] = useState(""); // 추가할 장소의 비고 (최대 5자)

  // 검색창 초기화 트리거
  const [searchClearTrigger, setSearchClearTrigger] = useState(0);
  const [savedStatus, setSavedStatus] = useState({}); // { '2026-03-10': boolean }

  // 로컬 스토리지 자동 저장
  useEffect(() => {
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  useEffect(() => {
    localStorage.setItem('startDate', startDate.toISOString());
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem('endDate', endDate.toISOString());
  }, [endDate]);

  const daysCount = differenceInDays(endDate, startDate) + 1;
  const days = Array.from({ length: Math.max(0, daysCount) }, (_, i) => {
    const date = addDays(startDate, i);
    return format(date, 'yyyy-MM-dd');
  });

  const activeDate = days[activeDayIndex] || days[0];

  // 샘플 데이터 삽입 (처음 방문 시에만 한 번)
  useEffect(() => {
    const hasData = localStorage.getItem('itinerary');
    if (!hasData && Object.keys(itinerary).length === 0 && activeDate) {
      const samplePlaces = [
        { id: 'sample-1', name: '도쿄 타워', address: '관광지 샘플', lat: 35.6586, lng: 139.7454, type: 'tourist_attraction', note: '관광지' },
        { id: 'sample-2', name: '이치란 라멘', address: '식당 샘플', lat: 35.6610, lng: 139.7480, type: 'restaurant', note: '맛있어' },
        { id: 'sample-3', name: '블루보틀 커피', address: '카페 샘플', lat: 35.6650, lng: 139.7400, type: 'cafe', note: '커피한잔' },
        { id: 'sample-4', name: '그랜드 하얏트', address: '숙소 샘플', lat: 35.6590, lng: 139.7280, type: 'lodging', note: '꿀잠' },
        { id: 'sample-5', name: '시부야 109', address: '쇼핑 샘플', lat: 35.6610, lng: 139.7000, type: 'shopping_mall', note: '지름신' },
      ];
      setItinerary({ [activeDate]: samplePlaces });
    }
  }, [activeDate, itinerary]);

  // 장소 검색 시 임시 보관
  const handleSelectSearchPlace = (place) => {
    setSelectedSearchPlace(place);
  };

  // 장소 확정 추가
  const handleConfirmAddPlace = () => {
    if (!selectedSearchPlace) return;
    setItinerary(prev => ({
      ...prev,
      [activeDate]: [...(prev[activeDate] || []), { ...selectedSearchPlace, note: placeNote, id: crypto.randomUUID() }]
    }));
    setSelectedSearchPlace(null);
    setPlaceNote(""); // 비고 초기화
    setSearchClearTrigger(prev => prev + 1); // 추가 후 검색창 리셋
    setSavedStatus(prev => ({ ...prev, [activeDate]: false })); // 변경사항 발생 시 저장 상태 해제
  };

  // 장소 삭제
  const handleRemovePlace = (placeId) => {
    setItinerary(prev => ({
      ...prev,
      [activeDate]: prev[activeDate].filter(p => p.id !== placeId)
    }));
    setSavedStatus(prev => ({ ...prev, [activeDate]: false }));
  };

  // 순서 변경
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(itinerary[activeDate] || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setItinerary(prev => ({
      ...prev,
      [activeDate]: items
    }));
    setSavedStatus(prev => ({ ...prev, [activeDate]: false }));
  };

  // 일정(DAY) 저장
  const handleSaveDay = () => {
    // 실제 서버가 있다면 이 곳에 API 호출 로직 작성
    // 현재는 로컬 상태 관리 기반이므로 시각적 피드백만 제공
    setSavedStatus(prev => ({ ...prev, [activeDate]: true }));
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [activeDate]: false }));
    }, 2000);
  };

  // 장소 타입별 설정을 중앙 관리 (색상, 아이콘)
  const placeTypeConfig = {
    restaurant: { color: '#FF5E62', icon: <Utensils size={14} color="#FF5E62" /> },
    food: { color: '#FF5E62', icon: <Utensils size={14} color="#FF5E62" /> },
    cafe: { color: '#966D4A', icon: <Coffee size={14} color="#966D4A" /> },
    lodging: { color: '#4A90E2', icon: <BedDouble size={14} color="#4A90E2" /> },
    shopping_mall: { color: '#F5A623', icon: <ShoppingBag size={14} color="#F5A623" /> },
    store: { color: '#F5A623', icon: <ShoppingBag size={14} color="#F5A623" /> },
    tourist_attraction: { color: '#27AE60', icon: <Landmark size={14} color="#27AE60" /> },
    museum: { color: '#27AE60', icon: <Landmark size={14} color="#27AE60" /> },
    point_of_interest: { color: '#27AE60', icon: <Landmark size={14} color="#27AE60" /> },
    default: { color: '#A0AEC0', icon: <Map size={14} color="#A0AEC0" /> }
  };

  // 장소 타입에 따른 아이콘 및 색상 반환 함수
  const getPlaceTypeIcon = (type) => {
    const config = placeTypeConfig[type] || placeTypeConfig.default;
    return config.icon;
  };

  const getPlaceTypeColor = (type) => {
    const config = placeTypeConfig[type] || placeTypeConfig.default;
    return config.color;
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <h1 style={{ fontSize: '28px', margin: 0 }}>
            <span style={{ color: 'var(--mumu-color)' }}>뮤뮤</span>{' '}
            <span style={{ color: 'var(--chouchou-color)' }}>슈슈</span>
          </h1>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>TRAVEL PLANNER ✈️</span>
        </header>

        <section className="calendar-section glass-panel" style={{ padding: '16px', position: 'relative', zIndex: 10 }}>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
              // 날짜 범위 변경 시 탭 인덱스 초과 리셋 방지
              if (activeDayIndex >= differenceInDays(endDate, startDate) + 1) {
                setActiveDayIndex(0);
              }
            }}
          />
        </section >

        <div className="day-tabs">
          {days.map((date, index) => (
            <button key={date} className={`day-tab ${activeDayIndex === index ? 'active' : ''}`} onClick={() => setActiveDayIndex(index)}>
              DAY {index + 1} ({format(new Date(date), 'MM/dd')})
            </button>
          ))}
        </div>

        <section className="itinerary-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{activeDate} 일정</h3>
            <button
              onClick={handleSaveDay}
              style={{
                background: savedStatus[activeDate] ? 'var(--secondary)' : '#ffffff',
                border: '1px solid rgba(255, 182, 193, 0.3)',
                color: savedStatus[activeDate] ? '#fff' : 'var(--text-main)',
                padding: '8px 16px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(255, 182, 193, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              {savedStatus[activeDate] ? <><Check size={14} /> 저장됨</> : <><Save size={14} /> 저장</>}
            </button>
          </div>

          <PlaceSearch
            onSelectPlace={handleSelectSearchPlace}
            isLoaded={isLoaded}
            clearTrigger={searchClearTrigger}
          />

          {selectedSearchPlace && (
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '16px', background: '#ffffff', border: '2px solid var(--accent)' }}>
              <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> 지도 중심 가선택
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getPlaceTypeIcon(selectedSearchPlace.type)} {selectedSearchPlace.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '4px' }}>{selectedSearchPlace.address}</div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={placeNote}
                  onChange={(e) => setPlaceNote(e.target.value)}
                  placeholder="메모 (최대 5자. 예: 점심, 숙소)"
                  maxLength={5}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 182, 193, 0.5)',
                    background: '#FFF9F5',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 182, 193, 0.5)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleConfirmAddPlace} className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> 일정에 추가할래!
                </button>
                <button onClick={() => { setSelectedSearchPlace(null); setPlaceNote(""); }} style={{ flex: 1, padding: '10px', background: '#f5f5f5', border: 'none', color: 'var(--text-muted)', fontWeight: 600, borderRadius: '16px', cursor: 'pointer', transition: 'background 0.2s' }}>
                  취소
                </button>
              </div>
            </div>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="itinerary">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {(itinerary[activeDate] || []).map((place, index) => (
                    <Draggable key={place.id} draggableId={place.id} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="itinerary-item glass-panel">
                          <div {...provided.dragHandleProps}>
                            <GripVertical size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {getPlaceTypeIcon(place.type)}
                              {place.name}
                              {place.note && (
                                <span style={{
                                  background: getPlaceTypeColor(place.type), color: 'white', fontSize: '10px',
                                  padding: '2px 6px', borderRadius: '8px', marginLeft: '4px',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                  {place.note}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '20px' }}>{place.address}</div>
                          </div>
                          <button onClick={() => handleRemovePlace(place.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}>
                            <Trash2 size={18} color="var(--accent)" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </section>
      </aside >

      <main className="map-container">
        <MapContainer
          places={itinerary[activeDate] || []}
          isLoaded={isLoaded}
          selectedSearchPlace={selectedSearchPlace}
          onSelectPlace={handleSelectSearchPlace}
        />
      </main>
    </div >
  );
}

export default App;
