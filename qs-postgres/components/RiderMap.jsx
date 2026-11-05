'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
const icon = L.divIcon({className:'live-location-icon',html:'<span>🛵</span>',iconSize:[36,36],iconAnchor:[18,18]});
export default function RiderMap({location}) {return <MapContainer key={`${location.latitude}:${location.longitude}`} center={[location.latitude, location.longitude]} zoom={14} scrollWheelZoom={false} className="leaflet-container"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Marker position={[location.latitude,location.longitude]} icon={icon}><Popup>Most recent rider location</Popup></Marker></MapContainer>}
