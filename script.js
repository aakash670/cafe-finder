let map;
let markers = [];

function initMap() {
  // Default: New Delhi
  map = L.map('map').setView([28.6139, 77.2090], 14);

  // OpenStreetMap Tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Load cafes near default location
  searchCafes(28.6139, 77.2090);
}

// Search cafes using Overpass API
function searchCafes(lat, lon) {
  const overpassUrl = `
    https://overpass-api.de/api/interpreter?data=[out:json];
    node[amenity=cafe](around:2000,${lat},${lon});
    out;`;

  fetch(overpassUrl)
    .then(res => res.json())
    .then(data => {
      clearMarkers();
      displayPlaces(data.elements);
    });
}

// Display cafes on map + sidebar
function displayPlaces(places) {
  const list = document.getElementById("placesList");
  list.innerHTML = "";

  places.forEach((place) => {
    const marker = L.marker([place.lat, place.lon]).addTo(map);
    marker.bindPopup(`<strong>${place.tags.name || "Unnamed Cafe"}</strong>`);
    markers.push(marker);

    const li = document.createElement("li");
    li.textContent = place.tags.name || "Unnamed Cafe";
    li.onclick = () => {
      map.setView([place.lat, place.lon], 17);
      marker.openPopup();
    };
    list.appendChild(li);
  });
}

// Clear old markers
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// Search by location name using Nominatim
function searchLocation() {
  const input = document.getElementById("searchBox").value;
  if (!input) return;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.setView([lat, lon], 14);
        searchCafes(lat, lon);
      } else {
        alert("Location not found");
      }
    });
}

// Find user’s current location
function findMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      map.setView([lat, lon], 14);

      L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(map).bindPopup("You are here").openPopup();

      searchCafes(lat, lon);
    });
  } else {
    alert("Geolocation not supported!");
  }
}

// Initialize map when page loads
window.onload = initMap;
