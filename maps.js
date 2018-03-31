// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var directionsService;
var directionsDisplay;
var ucla;
var infoWindow;
var map;

function calcRoute(start, end) {
  var selectedMode = "DRIVING";
  var request = {
      origin: start,
      destination: end,
      // Note that Javascript allows us to access the constant
      // using square brackets and a string value as its
      // "property."
      travelMode: google.maps.TravelMode[selectedMode]
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(response);
    }
  });
}

function initAutocomplete(currentloc) {
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  //ucla = new google.maps.LatLng(34.0689, -118.4452);
  //var currentcoord = locate();
  //alert(currentcoord[0]);
  var mapOptions = {
    zoom: 14,
    center: currentloc
  }
  //alert(currentcoord[0]);

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsDisplay.setMap(map);
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  //map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
	
	var endlat = places[0].geometry.location.lat();
	var endlng = places[0].geometry.location.lng();
	var endloc = new google.maps.LatLng(endlat, endlng);
	calcRoute(currentloc, endloc);
	
	
  });
}

// Try HTML5 geolocation.
function locate(){
	if ("geolocation" in navigator){
		var currentLatitude;
		var currentLongitude;
		var currentLocation
		navigator.geolocation.getCurrentPosition(function(position){ 
			currentLatitude = position.coords.latitude;
			currentLongitude = position.coords.longitude;

			//var infoWindowHTML = "Latitude: " + currentLatitude + "<br>Longitude: " + currentLongitude;
			//infoWindow = new google.maps.InfoWindow({map: map, content: infoWindowHTML});
			currentLocation = { lat: currentLatitude, lng: currentLongitude };
			initAutocomplete(currentLocation);

			//alert(currentcoord[0]);
			//alert(currentLatitude);
			//infoWindow.setPosition(currentLocation);
		});

	}
	//alert(currentLatitude);
	//return [currentLatitude, currentLongitude];
}

