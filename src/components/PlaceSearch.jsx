import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Autocomplete } from '@react-google-maps/api';
function PlaceSearch({ onSelectPlace, isLoaded, clearTrigger }) {
    const [autocomplete, setAutocomplete] = useState(null);
    const inputRef = React.useRef(null);

    const onLoad = (autoC) => setAutocomplete(autoC);

    // clearTrigger가 변경될 때마다 입력값 초기화
    useEffect(() => {
        if (clearTrigger > 0 && inputRef.current) {
            inputRef.current.value = "";
        }
    }, [clearTrigger]);

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry || !place.geometry.location) {
                // 사용자가 리스트에서 선택하지 않고 엔터를 친 경우 등 처리 생략
                return;
            }

            // 장소 타입 판별 강화 로직
            const types = place.types || [];
            const name = place.name || "";
            let typeInfo = 'point_of_interest';

            if (types.includes('lodging') || name.toLowerCase().includes('hotel') || name.toLowerCase().includes('ryokan') || name.toLowerCase().includes('inn')) {
                typeInfo = 'lodging';
            } else if (types.includes('restaurant') || types.includes('food') || name.toLowerCase().includes('restaurant')) {
                typeInfo = 'restaurant';
            } else if (types.includes('cafe') || name.toLowerCase().includes('cafe') || name.toLowerCase().includes('coffee')) {
                typeInfo = 'cafe';
            } else if (types.includes('shopping_mall') || types.includes('store') || types.includes('establishment')) {
                if (name.toLowerCase().includes('mall') || name.toLowerCase().includes('shop')) {
                    typeInfo = 'shopping_mall';
                }
            } else if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('park')) {
                typeInfo = 'tourist_attraction';
            }

            onSelectPlace({
                name: place.name || (place.formatted_address ? place.formatted_address.split(',')[0] : 'Unknown Place'),
                address: place.formatted_address || '',
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                type: typeInfo
            });
        }
    };

    if (!isLoaded) return <div style={{ color: 'var(--text-muted)' }}>장소 검색 불러오는 중...</div>;

    return (
        <div style={{ marginBottom: '20px', position: 'relative' }}>
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <input
                    type="text"
                    ref={inputRef}
                    placeholder="장소 검색 (예: 도쿄 타워, 이치란 라멘)"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault();
                    }}
                    style={{
                        width: '100%',
                        padding: '16px 48px 16px 20px',
                        borderRadius: '24px',
                        background: '#ffffff',
                        border: '2px solid rgba(161, 196, 253, 0.3)', /* 파스텔 블루 보더 */
                        color: 'var(--text-main)',
                        fontSize: '15px',
                        fontWeight: 500,
                        outline: 'none',
                        boxShadow: '0 4px 16px rgba(161, 196, 253, 0.15)',
                        transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--secondary)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(161, 196, 253, 0.3)'}
                />
            </Autocomplete>
            <Search size={20} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', pointerEvents: 'none', fontWeight: 'bold' }} />
        </div>
    );
}

export default PlaceSearch;
