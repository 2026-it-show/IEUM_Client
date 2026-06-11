import { useEffect, useMemo, useState } from 'react';
import * as S from './LocationDebugOverlay.styled';

type LocationSample = {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracy: number;
  readonly heading: number | null;
  readonly speed: number | null;
  readonly timestamp: number;
};

type CompassEvent = DeviceOrientationEvent & {
  readonly webkitCompassHeading?: number;
};

type DeviceOrientationPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

function formatNumber(value: number, digits: number): string {
  return value.toFixed(digits);
}

function formatNullable(value: number | null, digits: number, suffix = ''): string {
  return value === null ? '-' : `${formatNumber(value, digits)}${suffix}`;
}

function readCompassHeading(event: CompassEvent): number | null {
  if (typeof event.webkitCompassHeading === 'number') {
    return event.webkitCompassHeading;
  }
  if (typeof event.alpha === 'number') {
    return (360 - event.alpha + 360) % 360;
  }
  return null;
}

function getOrientationPermission(): DeviceOrientationPermission | null {
  if (typeof DeviceOrientationEvent === 'undefined') return null;
  return DeviceOrientationEvent as DeviceOrientationPermission;
}

function LocationDebugOverlay() {
  const [sample, setSample] = useState<LocationSample | null>(null);
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [message, setMessage] = useState('현재 위치를 불러오는 중');
  const isGeolocationSupported = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setSample({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
        setMessage('좌표 측정 중');
      },
      (error) => {
        setMessage(`${error.code}: ${error.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const onOrientation = (event: DeviceOrientationEvent) => {
      setCompassHeading(readCompassHeading(event as CompassEvent));
    };
    window.addEventListener('deviceorientation', onOrientation, true);
    return () => window.removeEventListener('deviceorientation', onOrientation, true);
  }, []);

  const coordinateText = useMemo(() => {
    if (!sample) return '';
    return [
      `lat=${formatNumber(sample.latitude, 7)}`,
      `lng=${formatNumber(sample.longitude, 7)}`,
      `accuracy=${formatNumber(sample.accuracy, 1)}m`,
      `heading=${formatNullable(compassHeading ?? sample.heading, 1, 'deg')}`,
    ].join(', ');
  }, [compassHeading, sample]);

  const requestDirectionPermission = async () => {
    const orientation = getOrientationPermission();
    if (!orientation?.requestPermission) {
      setMessage('방향 권한 요청이 필요 없는 브라우저');
      return;
    }
    const result = await orientation.requestPermission();
    setMessage(result === 'granted' ? '방향 권한 허용됨' : '방향 권한 거부됨');
  };

  const copyCoordinate = async () => {
    if (!coordinateText) return;
    await navigator.clipboard?.writeText(coordinateText);
    setMessage('좌표 복사됨');
  };

  return (
    <S.Panel>
      <S.Header>
        <S.Title>위치 디버그</S.Title>
        <S.Button type="button" onClick={copyCoordinate} disabled={!coordinateText}>
          복사
        </S.Button>
      </S.Header>
      <S.Grid>
        <S.Term>위도</S.Term>
        <S.Value>{sample ? formatNumber(sample.latitude, 7) : '-'}</S.Value>
        <S.Term>경도</S.Term>
        <S.Value>{sample ? formatNumber(sample.longitude, 7) : '-'}</S.Value>
        <S.Term>정확도</S.Term>
        <S.Value>{sample ? `${formatNumber(sample.accuracy, 1)}m` : '-'}</S.Value>
        <S.Term>방향</S.Term>
        <S.Value>{formatNullable(compassHeading ?? sample?.heading ?? null, 1, 'deg')}</S.Value>
        <S.Term>속도</S.Term>
        <S.Value>{formatNullable(sample?.speed ?? null, 2, 'm/s')}</S.Value>
      </S.Grid>
      <S.Message>{isGeolocationSupported ? message : '이 브라우저는 위치 정보를 지원하지 않음'}</S.Message>
      <S.Button type="button" onClick={requestDirectionPermission}>
        방향 권한 요청
      </S.Button>
    </S.Panel>
  );
}

export default LocationDebugOverlay;
