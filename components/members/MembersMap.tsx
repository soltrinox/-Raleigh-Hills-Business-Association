'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Member } from '@/lib/types';

const DEFAULT_CENTER: [number, number] = [45.486, -122.762];
const DEFAULT_ZOOM = 12;

function pinHtml(color: string) {
  return `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`;
}

const greenIcon = L.divIcon({
  className: 'rhba-marker',
  html: pinHtml('#16a34a'),
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -8],
});

const redIcon = L.divIcon({
  className: 'rhba-marker',
  html: pinHtml('#dc2626'),
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -8],
});

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
  selectedId: string | null;
  focusTarget: { lat: number; lng: number } | null;
  onMarkerClick: (id: string) => void;
};

export function MembersMap({ members, selectedId, focusTarget, onMarkerClick }: MembersMapProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-green-600 ring-1 ring-white" aria-hidden />
            Members
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-red-600 ring-1 ring-white" aria-hidden />
            Selected
          </span>
        </span>
        <span className="shrink-0 tabular-nums">{members.length} on map</span>
      </div>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="z-0 h-[min(52vh,320px)] min-h-[240px] w-full sm:h-[min(50vh,400px)] sm:min-h-[300px] lg:h-[min(48vh,480px)] lg:min-h-[380px]"
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
            icon={selectedId === m.id ? redIcon : greenIcon}
            eventHandlers={{
              click: () => onMarkerClick(m.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px] text-sm">
                <p className="font-semibold text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.category}</p>
                <p className="mt-1 text-xs leading-snug">{m.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
