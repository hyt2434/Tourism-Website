import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, Navigation, X } from "lucide-react";
import HotelIcon from "@mui/icons-material/Hotel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import ReactDOMServer from "react-dom/server";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function TourMap({ locations = [], centerCoords, hotelInfo, destinationCityName }) {
  const defaultCenter = centerCoords || [21.0285, 105.8542];
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cityCoords, setCityCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // --- Geocode destination city name to get coordinates ---
  useEffect(() => {
    const geocodeCity = async () => {
      if (destinationCityName) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              destinationCityName + ", Vietnam"
            )}&limit=1`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            setCityCoords(coords);
            setMapCenter(coords);
          }
        } catch (error) {
          console.error('Error geocoding city:', error);
        }
      } else if (centerCoords) {
        setMapCenter(centerCoords);
      }
    };
    geocodeCity();
  }, [destinationCityName, centerCoords]);

  // --- Tự động cập nhật view khi centerCoords thay đổi ---
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (mapCenter) map.setView(mapCenter, 13);
    }, [mapCenter, map]);
    return null;
  };

  // --- Tạo icon tùy chỉnh từ MUI Icon ---
  const createCustomIcon = (IconJSX, color = "#2563eb") => {
    const iconHTML = ReactDOMServer.renderToString(
      <div
        style={{
          backgroundColor: color,
          width: "36px",
          height: "36px",
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-45deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            transform: "rotate(45deg)",
            color: "white",
            fontSize: "20px",
          }}
        >
          {IconJSX}
        </div>
      </div>
    );

    return L.divIcon({
      html: iconHTML,
      className: "custom-div-icon",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  };

  // --- Tạo markers ---
  const markers = useMemo(() => {
    const allMarkers = [];

    // Add destination city marker if coordinates are available
    if (cityCoords) {
      allMarkers.push({
        position: cityCoords,
        popup: `
          <div style="min-width:180px">
            <h3 style="font-weight:bold;margin-bottom:5px;">${destinationCityName || 'Destination'}</h3>
            <p style="color:#555;font-size:14px;">Điểm đến chính</p>
          </div>
        `,
        icon: createCustomIcon(<LocationOnIcon fontSize="small" />, "#2563eb"),
      });
    }

    if (hotelInfo?.coordinates?.length === 2) {
      allMarkers.push({
        position: hotelInfo.coordinates,
        popup: `
          <div style="min-width:180px">
            <h3 style="font-weight:bold;margin-bottom:5px;">${hotelInfo.name}</h3>
            <p style="color:#555;font-size:14px;">${hotelInfo.address}</p>
          </div>
        `,
        icon: createCustomIcon(<HotelIcon fontSize="small" />, "#0ea5e9"),
      });
    }

    locations.forEach((loc) => {
      if (loc.coordinates?.length === 2) {
        allMarkers.push({
          position: loc.coordinates,
          popup: `
            <div style="min-width:180px">
              <h3 style="font-weight:bold;margin-bottom:5px;">${loc.name}</h3>
              ${
                loc.description
                  ? `<p style="font-size:13px;color:#555">${loc.description}</p>`
                  : ""
              }
            </div>
          `,
          icon: createCustomIcon(
            <LocationOnIcon fontSize="small" />,
            "#ef4444"
          ),
        });
      }
    });

    if (selectedLocation) {
      allMarkers.push({
        position: [selectedLocation.lat, selectedLocation.lon],
        popup: `<strong>${selectedLocation.display_name}</strong>`,
        icon: createCustomIcon(<LocationOnIcon fontSize="small" />, "#10b981"),
      });
    }

    return allMarkers;
  }, [locations, hotelInfo, selectedLocation, cityCoords, destinationCityName]);

  // --- Hàm tìm kiếm ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}`
    );
    const data = await res.json();
    setSearchResults(data.slice(0, 5)); // chỉ lấy 5 kết quả đầu
  };

  // --- Khi chọn địa điểm trong kết quả ---
  const handleSelect = (loc) => {
    setSelectedLocation(loc);
    setSearchResults([]);
    setSearchQuery(loc.display_name);
  };

  return (
    <div className="relative">
      {/* === Thanh tìm kiếm nổi === */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] sm:w-[420px]">
        <form
          onSubmit={handleSearch}
          className="relative flex items-center bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all"
        >
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm địa điểm, ví dụ: Đà Lạt..."
            className="flex-1 px-4 py-2 bg-transparent border-none focus-visible:ring-0 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white  rounded-full px-4 flex items-center justify-center h-full transition-colors"
          >
            <SearchIcon fontSize="small" />
          </Button>
        </form>

        {/* === Dropdown kết quả tìm kiếm === */}
        {searchResults.length > 0 && (
          <div className="absolute top-12 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-3 flex items-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-none"
              >
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* === Bản đồ === */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
        }}
        key={mapCenter.join(',')}
      >
        <MapUpdater />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
          OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m, idx) => (
          <Marker key={idx} position={m.position} icon={m.icon}>
            <Popup>
              <div dangerouslySetInnerHTML={{ __html: m.popup }} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
