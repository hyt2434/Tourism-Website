import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HotelIcon from "@mui/icons-material/Hotel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReactDOMServer from "react-dom/server";

export default function TourMap({ locations = [], centerCoords, hotelInfo }) {
  const defaultCenter = centerCoords || [21.0285, 105.8542];

  // --- Tự động cập nhật view khi centerCoords thay đổi ---
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (centerCoords) map.setView(centerCoords, 13);
    }, [centerCoords, map]);
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

    return allMarkers;
  }, [locations, hotelInfo]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
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
  );
}
