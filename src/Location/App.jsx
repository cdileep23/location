// App.js
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  MapPin,
  Bird,
  Loader2,
  Search,
} from "lucide-react";
import MapComponent from "./MapComponent";
import BirdObservationsDisplay from "./BirdObservationsDisplay ";

const DEFAULT_LOCATION = { lat: 16.4971, lng: 80.4992 };

const Location = () => {
  const [center, setCenter] = useState(DEFAULT_LOCATION);
  const [zoom, setZoom] = useState(13);
  const [hotspots, setHotspots] = useState([]);
  const [birdData, setBirdData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(25);
  const [locationInitialized, setLocationInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [locationName, setLocationName] = useState("");

  // Function to fetch location data from OpenStreetMap
  const searchLocation = async (query) => {
    if (!query.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for location:", error);
      setError("Location search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to get location name from coordinates
  const getLocationNameFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      
      const data = await response.json();
      if (data && data.display_name) {
        setLocationName(data.display_name);
        setSelectedSearchResult(data.display_name);
      }
    } catch (error) {
      console.error("Error getting location name:", error);
    }
  };

  // Function to handle location selection
  const handleLocationSelect = (result) => {
    const newLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    
    setCenter(newLocation);
    setZoom(13);
    setSelectedSearchResult(result.display_name);
    setLocationName(result.display_name);
    setSearchResults([]);
    fetchBirdData(newLocation.lat, newLocation.lng, searchRadius);
  };

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
            
            // Get location name from coordinates
            getLocationNameFromCoordinates(userLocation.lat, userLocation.lng);
            
            fetchBirdData(userLocation.lat, userLocation.lng, searchRadius);
          },
         // Continuing from the getCurrentPosition error handler
(error) => {
    console.warn("Geolocation Permission Denied:", error);
    setLocationInitialized(true);
    // Use default location
    fetchBirdData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, searchRadius);
    // Try to get location name for the default location
    getLocationNameFromCoordinates(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
  }
  );
  } else {
    console.warn("Geolocation Not Supported");
    setLocationInitialized(true);
    fetchBirdData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, searchRadius);
    // Try to get location name for the default location
    getLocationNameFromCoordinates(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
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
          // Get location name when using "Find Birds Near Me"
          getLocationNameFromCoordinates(newLocation.lat, newLocation.lng);
          fetchBirdData(newLocation.lat, newLocation.lng, searchRadius);
        },
        (error) => {
          console.warn("Geolocation Permission Denied:", error);
          alert("Unable to access your location. Using default location instead.");
        }
      );
    }
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchLocation(searchQuery);
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
  
        {/* Location Search */}
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-white rounded-lg shadow-md border border-green-100">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search for a Location
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="City, State, Country or Address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600 animate-spin" />
                )}
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.place_id}-${index}`}
                        type="button"
                        onClick={() => handleLocationSelect(result)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 border-b border-gray-100 last:border-0"
                      >
                        {result.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          {/* Currently selected location */}
          {selectedSearchResult && (
            <div className="text-sm text-gray-600 bg-green-50 p-2 rounded-lg flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="truncate">Current location: {selectedSearchResult}</span>
            </div>
          )}
  
          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
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
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
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
              type="button"
            >
              <MapPin className="w-5 h-5" />
              Find Birds Near Me
            </button>
          </div>
        </div>
  
        {/* Map Component */}
        <MapComponent 
          center={center} 
          zoom={zoom} 
          searchRadius={searchRadius}
        />
  
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
          <p>© {new Date().getFullYear()} BirdWatch Explorer. Explore, discover, and enjoy nature!</p>
        </footer>
      </div>
    </div>
  );
  };
  
  export default Location;