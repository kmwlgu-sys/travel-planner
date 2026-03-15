import React, { useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 35.6895,
    lng: 139.6917
};

// 장소 타입별 마커 색상 정의
const typeColors = {
    restaurant: '#FF5E62', // 좀 더 진한 코랄 레드
    food: '#FF5E62',
    cafe: '#966D4A',      // 진한 갈색
    lodging: '#4A90E2',   // 진한 블루
    shopping_mall: '#F5A623', // 진한 오렌지
    store: '#F5A623',
    tourist_attraction: '#27AE60', // 진한 그린
    museum: '#27AE60',
    point_of_interest: '#27AE60'
};

function MapContainer({ places, isLoaded, selectedSearchPlace, onSelectPlace }) {
    const mapRef = useRef(null);
    const path = places.map(p => ({ lat: p.lat, lng: p.lng }));

    // 검색된 장소가 있으면 지도를 해당 위치로 부드럽게 이동(Pan)
    useEffect(() => {
        if (selectedSearchPlace && mapRef.current) {
            mapRef.current.panTo({ lat: selectedSearchPlace.lat, lng: selectedSearchPlace.lng });
            mapRef.current.setZoom(15);
        } else if (places.length > 0 && mapRef.current && !selectedSearchPlace) {
            // 새 날짜 탭 클릭 시 첫 번째 장소로 이동
            mapRef.current.panTo({ lat: places[0].lat, lng: places[0].lng });
            mapRef.current.setZoom(12);
        }
    }, [selectedSearchPlace, places]);

    const onLoad = (map) => {
        mapRef.current = map;
    };

    const handleMapClick = (e) => {
        // POI(장소 아이콘)를 클릭했을 경우 placeId가 들어있음
        if (e.placeId && mapRef.current) {
            // 기본 정보창(Google 기본 팝업) 방지
            if (e.stop) e.stop();

            const service = new window.google.maps.places.PlacesService(mapRef.current);
            service.getDetails({
                placeId: e.placeId,
                fields: ['name', 'formatted_address', 'geometry', 'types']
            }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry && place.geometry.location) {
                    const types = place.types || [];
                    const name = place.name || "";
                    let typeInfo = 'point_of_interest';

                    if (types.includes('lodging') || name.toLowerCase().includes('hotel') || name.toLowerCase().includes('ryokan') || name.toLowerCase().includes('inn')) {
                        typeInfo = 'lodging';
                    } else if (types.includes('restaurant') || types.includes('food') || name.toLowerCase().includes('restaurant')) {
                        typeInfo = 'restaurant';
                    } else if (types.includes('cafe') || name.toLowerCase().includes('cafe') || name.toLowerCase().includes('coffee')) {
                        typeInfo = 'cafe';
                    } else if (types.includes('shopping_mall') || types.includes('store')) {
                        typeInfo = 'shopping_mall';
                    } else if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('park')) {
                        typeInfo = 'tourist_attraction';
                    }

                    onSelectPlace({
                        name: place.name,
                        address: place.formatted_address,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        type: typeInfo
                    });
                }
            });
        }
    };

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={{ ...containerStyle, borderRadius: '24px', overflow: 'hidden', border: '2px solid rgba(161, 196, 253, 0.4)' }}
            center={places.length > 0 ? { lat: places[0].lat, lng: places[0].lng } : center}
            zoom={12}
            onLoad={onLoad}
            onClick={handleMapClick}
            options={{
                disableDefaultUI: false
            }}
        >
            {/* 확정된 장소 리스트 마커 */}
            {places.map((place, index) => {
                const markerColor = typeColors[place.type] || '#FFB6C1';
                return (
                    <Marker
                        key={place.id}
                        position={{ lat: place.lat, lng: place.lng }}
                        label={{
                            text: (index + 1).toString(),
                            color: '#FFFFFF',
                            fontWeight: 'bold',
                            fontSize: '14px',
                        }}
                        icon={{
                            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                            fillColor: markerColor,
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#ffffff",
                            scale: 2,
                            anchor: { x: 12, y: 22 },
                            labelOrigin: { x: 12, y: 9 } // 핀 헤드 중앙으로 번호 이동
                        }}
                    />
                );
            })}

            {/* 가선택 중인 장소 마커 (애니메이션 표출) */}
            {selectedSearchPlace && (
                <Marker
                    position={{ lat: selectedSearchPlace.lat, lng: selectedSearchPlace.lng }}
                    animation={window.google?.maps?.Animation?.BOUNCE}
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    }}
                />
            )}

            {/* 경로(Polyline) */}
            {path.length > 1 && (
                <Polyline
                    path={path}
                    options={{
                        strokeColor: '#FFB6C1', /* 핑크 코랄 */
                        strokeOpacity: 0.9,
                        strokeWeight: 4,
                    }}
                />
            )}
        </GoogleMap>
    ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>지도를 불러오는 중...</div>;
}

export default React.memo(MapContainer);
