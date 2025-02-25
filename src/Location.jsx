/* eslint-disable react/prop-types */

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import {
  MapPin,
  Bird,
  Calendar,
  Hash,
  Loader2,
  Eye,
  Info,
  Search,
} from "lucide-react";

// Custom bird marker icon (unused on map)


// User location marker
const userMarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png", // New icon URL
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});


const DEFAULT_LOCATION = { lat: 16.4971, lng: 80.4992 };

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const BirdObservationsDisplay = ({ hotspots, observations }) => {
  const [selectedTab, setSelectedTab] = useState("observations");

  // Create a unique key for each observation
  const createUniqueKey = (obs) => {
    return `${obs.subId}-${obs.obsDt}-${obs.comName}`.replace(/\s+/g, "-");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-green-200">
        <button
          onClick={() => setSelectedTab("observations")}
          className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
            selectedTab === "observations"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 hover:text-green-600"
          }`}
        >
          <Bird className="w-5 h-5" />
          Recent Sightings
        </button>
        <button
          onClick={() => setSelectedTab("hotspots")}
          className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
            selectedTab === "hotspots"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-blue-600"
          }`}
        >
          <MapPin className="w-5 h-5" />
          Birding Hotspots
        </button>
      </div>

      {/* Bird Observations Section */}
      {selectedTab === "observations" && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700">
            <Bird className="text-green-600" />
            Recent Bird Sightings
          </h2>
          {observations.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {observations.map((obs) => (
                <div
                  key={createUniqueKey(obs)}
                  className="bg-gradient-to-br from-white to-green-50 rounded-lg shadow-md p-6 border border-green-100 hover:shadow-lg transition-shadow relative overflow-hidden group"
                >
                  {/* Decorative bird silhouette */}
                  <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Bird className="w-16 h-16 text-green-700" />
                  </div>

                  <div className="space-y-2 relative">
                    <h3 className="text-lg font-semibold text-green-700">
                      {obs.comName}
                    </h3>
                    <p className="text-sm text-gray-600 italic">
                      {obs.sciName}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        {new Date(obs.obsDt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-600" />
                        Count: {obs.howMany || "Not specified"}
                      </p>
                      <p className="flex items-center gap-2 text-xs mt-1">
                        <MapPin className="w-4 h-4 text-green-600" />
                        {obs.locName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 p-6 rounded-lg border border-green-100 text-center">
              <p className="text-green-700">
                No bird sightings found in this area. Try adjusting your search
                radius or location.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Hotspots Section */}
      {selectedTab === "hotspots" && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700">
            <MapPin className="text-blue-600" />
            Birding Hotspots
          </h2>
          {hotspots.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {hotspots.map((hotspot, index) => (
                <div
                  key={`${hotspot.locId}-${index}`}
                  className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-md p-6 border border-blue-100 hover:shadow-lg transition-shadow relative overflow-hidden group"
                >
                  {/* Decorative map pin silhouette */}
                  <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MapPin className="w-16 h-16 text-blue-700" />
                  </div>

                  <div className="space-y-2 relative">
                    <h3 className="text-lg font-semibold text-blue-700">
                      {hotspot.locName}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        {new Date(hotspot.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        {hotspot.count} species observed
                      </p>
                      <p className="flex items-center gap-2 text-xs mt-1">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
              <p className="text-blue-700">
                No birding hotspots found in this area. Try adjusting your search
                radius or location.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const MarkersMap = () => {
  const [center, setCenter] = useState(DEFAULT_LOCATION);
  const [zoom, setZoom] = useState(13);
  const [hotspots, setHotspots] = useState([]);
  const [birdData, setBirdData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(25);
  const [locationInitialized, setLocationInitialized] = useState(false);

  // Function to fetch bird data and hotspots
  const fetchBirdData = async (lat, lng, radius) => {
    setLoading(true);
    setError(null);
    try {
      const birdDataResponse = await fetch(
        `https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${radius}`,
        {
          headers: {
            "X-eBirdApiToken": "lv9ldei00jf0",
          },
        }
      );
      const hotspotsResponse = await fetch(
        `https://api.ebird.org/v2/ref/hotspot/geo?lat=${lat}&lng=${lng}&dist=${radius}`,
        {
          headers: {
            "X-eBirdApiToken": "lv9ldei00jf0",
          },
        }
      );

      if (!birdDataResponse.ok || !hotspotsResponse.ok) {
        throw new Error("Failed to fetch bird or hotspot data");
      }

      const birdData = await birdDataResponse.json();
      const hotspotsData = await hotspotsResponse.text();

      Papa.parse(hotspotsData, {
        complete: (result) => {
          const parsedData = result.data
            .map((row) => ({
              locId: row[0],
              locName: row[6],
              lat: parseFloat(row[4]),
              lng: parseFloat(row[5]),
              date: row[7],
              count: row[8],
            }))
            .filter(
              (hotspot) =>
                !isNaN(hotspot.lat) &&
                !isNaN(hotspot.lng) &&
                hotspot.locName &&
                hotspot.locId &&
                hotspot.date &&
                hotspot.count !== undefined
            );

          setHotspots(parsedData);
          setBirdData(birdData);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    }
  };

  // Initialize location and fetch data on first load
  useEffect(() => {
    if (!locationInitialized) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCenter(userLocation);
            setLocationInitialized(true);
            fetchBirdData(userLocation.lat, userLocation.lng, searchRadius);
          },
          (error) => {
            console.warn("Geolocation Permission Denied:", error);
            setLocationInitialized(true);
            fetchBirdData(
              DEFAULT_LOCATION.lat,
              DEFAULT_LOCATION.lng,
              searchRadius
            );
          }
        );
      } else {
        console.warn("Geolocation Not Supported");
        setLocationInitialized(true);
        fetchBirdData(
          DEFAULT_LOCATION.lat,
          DEFAULT_LOCATION.lng,
          searchRadius
        );
      }
    }
  }, [locationInitialized, searchRadius]);

  // When radius changes, fetch new data with existing location
  useEffect(() => {
    if (locationInitialized) {
      fetchBirdData(center.lat, center.lng, searchRadius);
    }
  }, [searchRadius, locationInitialized, center]);

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(newLocation);
          setZoom(13);
          fetchBirdData(newLocation.lat, newLocation.lng, searchRadius);
        },
        (error) => {
          console.warn("Geolocation Permission Denied:", error);
          alert(
            "Unable to access your location. Using default location instead."
          );
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-green-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-800 mb-4 flex items-center justify-center gap-3">
            <Bird className="text-green-600 w-10 h-10" />
            BirdWatch Explorer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover bird species in your area, find popular birding hotspots,
            and track your sightings with our interactive map.
          </p>
        </header>

        {/* Search Controls */}
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-white rounded-lg shadow-md border border-green-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Radius (km)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={searchRadius}
                  onChange={(e) =>
                    setSearchRadius(Number(e.target.value))
                  }
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-green-800 font-medium">
                  {searchRadius}
                </span>
              </div>
            </div>

            <button
              className="w-full md:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={handleLocateMe}
            >
              <MapPin className="w-5 h-5" />
              Find Birds Near Me
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full max-w-4xl h-[500px] mx-auto rounded-xl overflow-hidden shadow-lg border-4 border-green-200 mb-8">
          <MapContainer center={center} zoom={zoom} className="w-full h-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView center={center} zoom={zoom} />

            {/* Only display the user location marker */}
            <Marker position={center} icon={userMarkerIcon}>
              <Popup>
                <div className="font-sans">
                  <div className="font-semibold text-center">
                    Your Location
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Searching for birds within {searchRadius}km
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Search Radius Visualization */}
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-green-100 text-sm text-gray-600 flex items-center gap-2">
            <Search className="w-4 h-4 text-green-600" />
            Searching within {searchRadius}km radius of selected location
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-green-600 mb-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Searching for birds in your area...</span>
          </div>
        )}
        {error && (
          <div className="max-w-4xl mx-auto text-red-500 mb-8 p-4 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Results Section */}
        {!loading && !error && (
          <div className="rounded-xl bg-white shadow-lg p-6 border border-green-100">
            <BirdObservationsDisplay
              hotspots={hotspots}
              observations={birdData}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Data provided by eBird. Happy birding!</p>
        </footer>
      </div>
    </div>
  );
};

export default MarkersMap;
