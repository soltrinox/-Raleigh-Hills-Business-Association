'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Member } from '@/lib/types';

L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_CENTER: [number, number] = [45.486, -122.762];
const DEFAULT_ZOOM = 12;

function MapViewSync({
  members,
  focusTarget,
}: {
  members: Member[];
  focusTarget: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusTarget) {
      map.flyTo([focusTarget.lat, focusTarget.lng], 15, { duration: 0.45 });
      return;
    }

    const positions = members.map((m) => [m.lat, m.lng] as [number, number]);
    if (positions.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    const b = L.latLngBounds(positions);
    map.fitBounds(b, { padding: [28, 28], maxZoom: 15 });
  }, [map, members, focusTarget]);

  return null;
}

export type MembersMapProps = {
  members: Member[];
  focusTarget: { lat: number; lng: number } | null;
  onMarkerClick: (id: string) => void;
};

export function MembersMap({ members, focusTarget, onMarkerClick }: MembersMapProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="z-0 h-full min-h-[280px] w-full rounded-lg md:min-h-[420px]"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewSync members={members} focusTarget={focusTarget} />
      {members.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          eventHandlers={{
            click: () => onMarkerClick(m.id),
          }}
        >
          <Popup>
            <div className="min-w-[160px] text-sm">
              <p className="font-semibold">{m.name}</p>
              <p className="text-muted-foreground">{m.category}</p>
              <p className="mt-1 text-xs">{m.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
