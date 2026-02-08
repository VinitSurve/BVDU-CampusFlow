/**
 * Google Maps Integration for BVDU CampusFlow
 * Handles location display and venue mapping for events
 */

// Google Maps API Configuration
const GOOGLE_MAPS_CONFIG = {
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your actual API key
  mapOptions: {
    zoom: 15,
    mapTypeId: 'roadmap',
    styles: [
      {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [{"color": "#1a1f3a"}]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#e2e8f0"}]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [{"color": "#0a0e27"}]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{"color": "#4285f4"}, {"lightness": -20}]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{"color": "#2d3548"}]
      }
    ]
  }
};

/**
 * Initialize Google Maps for event location
 * @param {string} containerId - ID of the map container element
 * @param {Object} location - Location object with lat, lng, or address
 * @returns {Object} Map instance
 */
function initializeMap(containerId, location) {
  const mapContainer = document.getElementById(containerId);
  
  if (!mapContainer) {
    console.error(`Map container ${containerId} not found`);
    return null;
  }

  // Default to BVDU Pune if no location provided
  const defaultLocation = {
    lat: 18.4538,
    lng: 73.8636,
    name: 'Bharati Vidyapeeth Deemed University, Pune'
  };

  const mapOptions = {
    ...GOOGLE_MAPS_CONFIG.mapOptions,
    center: location?.lat ? { lat: location.lat, lng: location.lng } : defaultLocation
  };

  const map = new google.maps.Map(mapContainer, mapOptions);

  // Add marker for the location
  const marker = new google.maps.Marker({
    position: mapOptions.center,
    map: map,
    title: location?.name || defaultLocation.name,
    animation: google.maps.Animation.DROP,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2
    }
  });

  // Add info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="color: #1a1f3a; padding: 10px; font-family: 'Inter', sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #4285F4; font-weight: 600;">${location?.name || defaultLocation.name}</h3>
        <p style="margin: 0; font-size: 14px;">${location?.address || 'Event Venue'}</p>
      </div>
    `
  });

  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });

  return { map, marker, infoWindow };
}

/**
 * Geocode an address to get coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} Coordinates {lat, lng}
 */
async function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps not loaded'));
      return;
    }

    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          formattedAddress: results[0].formatted_address
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

/**
 * Get directions from user's location to event venue
 * @param {Object} destination - Destination coordinates {lat, lng}
 */
function getDirections(destination) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Open Google Maps with directions
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
        window.open(url, '_blank');
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback: Just open destination in Google Maps
        const url = `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`;
        window.open(url, '_blank');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser');
  }
}

/**
 * Add location picker to form
 * @param {string} inputId - ID of the input field for location
 * @param {string} mapContainerId - ID of the map container
 */
function addLocationPicker(inputId, mapContainerId) {
  const input = document.getElementById(inputId);
  const mapContainer = document.getElementById(mapContainerId);
  
  if (!input || !mapContainer) return;

  // Initialize autocomplete
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['establishment', 'geocode'],
    componentRestrictions: { country: 'in' }
  });

  // Initialize map
  const map = new google.maps.Map(mapContainer, {
    ...GOOGLE_MAPS_CONFIG.mapOptions,
    center: { lat: 18.4538, lng: 73.8636 },
    zoom: 12
  });

  let marker = new google.maps.Marker({
    map: map,
    draggable: true
  });

  // When place is selected
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    
    if (!place.geometry || !place.geometry.location) {
      return;
    }

    // Update map
    map.setCenter(place.geometry.location);
    map.setZoom(15);
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    // Store coordinates in hidden fields
    document.getElementById('latitude').value = place.geometry.location.lat();
    document.getElementById('longitude').value = place.geometry.location.lng();
  });

  // When marker is dragged
  marker.addListener('dragend', (event) => {
    const position = event.latLng;
    document.getElementById('latitude').value = position.lat();
    document.getElementById('longitude').value = position.lng();

    // Reverse geocode to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results[0]) {
        input.value = results[0].formatted_address;
      }
    });
  });
}

/**
 * Display multiple event locations on a single map
 * @param {string} containerId - ID of the map container
 * @param {Array} events - Array of events with location data
 */
function displayMultipleLocations(containerId, events) {
  const mapContainer = document.getElementById(containerId);
  
  if (!mapContainer || !events || events.length === 0) return;

  const map = new google.maps.Map(mapContainer, {
    ...GOOGLE_MAPS_CONFIG.mapOptions,
    center: { lat: 18.4538, lng: 73.8636 },
    zoom: 12
  });

  const bounds = new google.maps.LatLngBounds();

  events.forEach((event, index) => {
    if (event.latitude && event.longitude) {
      const position = { lat: parseFloat(event.latitude), lng: parseFloat(event.longitude) };
      
      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: event.event_name,
        label: {
          text: `${index + 1}`,
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: '#4285F4',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #1a1f3a; padding: 10px; font-family: 'Inter', sans-serif; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #4285F4; font-weight: 600;">${event.event_name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>Date:</strong> ${event.start_date}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Venue:</strong> ${event.venue}</p>
            <a href="event-details.html?id=${event.id}" style="color: #4285F4; text-decoration: none; font-weight: 500;">View Details →</a>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      bounds.extend(position);
    }
  });

  // Fit map to show all markers
  if (events.length > 1) {
    map.fitBounds(bounds);
  }
}

// Export functions
window.MapsIntegration = {
  initializeMap,
  geocodeAddress,
  getDirections,
  addLocationPicker,
  displayMultipleLocations
};
