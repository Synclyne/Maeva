import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
// CSS is imported in main.jsx to avoid lazy-chunk timing race
import { countyCoordinates, formatPrice } from '../data/locations';

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Pre-create icons at module scope — avoids throwing during React render
const defaultIcon = new L.Icon.Default();

// Custom coloured marker for featured listings
const featuredIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
});

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=300&h=200&fit=crop';

const POI_COLORS = {
  school:      '#3b82f6', // blue
  hospital:    '#ef4444', // red
  supermarket: '#22c55e', // green
  bank:        '#f59e0b', // amber
  restaurant:  '#a855f7', // purple
  bus_stop:    '#06b6d4', // cyan
  default:     '#6b7280', // gray
};

const POI_ICONS = {
  school:      '🏫',
  hospital:    '🏥',
  supermarket: '🛒',
  bank:        '🏦',
  restaurant:  '🍽',
  bus_stop:    '🚌',
  default:     '📍',
};

export default function MapView({ listings, pois = [] }) {
  // Attach county coords to listings that don't have exact lat/lng
  const mapped = listings
    .map(l => {
      const lat = l.lat ?? countyCoordinates[l.county]?.lat;
      const lng = l.lng ?? countyCoordinates[l.county]?.lng;
      return lat && lng ? { ...l, _lat: lat, _lng: lng } : null;
    })
    .filter(Boolean);

  if (mapped.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400 text-sm">
        No listings with location data to show on map.
      </div>
    );
  }

  // Centre on the average position
  const avgLat = mapped.reduce((s, l) => s + l._lat, 0) / mapped.length;
  const avgLng = mapped.reduce((s, l) => s + l._lng, 0) / mapped.length;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 520 }}>
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapped.map(l => (
          <Marker
            key={l.id}
            position={[l._lat, l._lng]}
            icon={l.is_featured ? featuredIcon : defaultIcon}
          >
            <Popup minWidth={220}>
              <div className="text-sm">
                <img
                  src={l.images?.[0] || PLACEHOLDER}
                  alt={l.title}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                  onError={e => { e.target.src = PLACEHOLDER; }}
                />
                <div className="font-semibold text-gray-900 leading-snug mb-0.5 line-clamp-2">{l.title}</div>
                <div className="text-primary font-bold mb-0.5">{formatPrice(l.price, l.price_period)}</div>
                <div className="text-gray-500 text-xs mb-2">{l.area}, {l.county}</div>
                <Link
                  to={`/listings/${l.id}`}
                  className="block text-center bg-primary text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  View Property
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nearby amenity POI markers */}
        {pois.map((poi, i) => {
          const color = POI_COLORS[poi.type] || POI_COLORS.default;
          const icon  = POI_ICONS[poi.type]  || POI_ICONS.default;
          return (
            <CircleMarker
              key={`poi-${i}`}
              center={[poi.lat, poi.lng]}
              radius={7}
              pathOptions={{ fillColor: color, color: '#fff', fillOpacity: 0.9, weight: 2 }}
            >
              <Popup>
                <div className="text-xs">
                  <span className="text-base">{icon}</span>{' '}
                  <span className="font-medium">{poi.name || poi.type}</span>
                  {poi.distance && <div className="text-gray-500 mt-0.5">{(poi.distance / 1000).toFixed(1)} km away</div>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
