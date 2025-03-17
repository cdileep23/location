// MapComponent.js
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

// User location marker
const userMarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const MapComponent = ({ center, zoom, searchRadius }) => {
  return (
    <div className="w-full max-w-4xl h-[500px] mx-auto rounded-xl overflow-hidden shadow-lg border-4 border-green-200 mb-8">
      <MapContainer center={center} zoom={zoom} className="w-full h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ChangeView center={center} zoom={zoom} />

        {/* Only display the user location marker */}
        <Marker position={center} icon={userMarkerIcon}>
          <Popup>
            <div className="font-sans">
              <div className="font-semibold text-center">Your Location</div>
              <div className="text-xs text-gray-500 mt-1">
                Searching for birds within {searchRadius}km
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;