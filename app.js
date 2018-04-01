if(!markers) var markers = []
if (!key) var key = 'AIzaSyAhQfMo_WF9YjXqjv8OJhjDRGsNtS2ADMU'
if(!parkingArr) var parkingArr = []
var directionsService;
var directionsDisplay;
var ucla;
var infoWindow;
var map;
let markerIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'

$(document).ready(function(){
  $("#pac-input").keypress(e => {
    let key = e.which || e.keyCode
    if(key != 13) return
    retrieveJSONData()
  })

  $(document).on("mousedown", ".pac-item", () => retrieveJSONData())

  $(document).on("mousedown", ".options", function(){
    console.log(markers)
    let index = Number.parseInt(this.id)
    if(index >= parkingArr.length) return console.log('Index outside of array')
    if(markers.length == 2){
      let removeMarker = markers.pop()
      console.log('removeMarker', removeMarker)
      removeMarker.setMap(null)
    }
    markers.push(parkingArr[index])
    if(map)
      parkingArr[index].setMap(map)
    console.log(parkingArr[index].position.lat(), parkingArr[index].position.lng())
    console.log(parkingArr)
    console.log(markers)
  })
})

function retrieveJSONData() {
  parkingArr = []
  $(".alloptions").css('display', 'flex')
  $.ajax({
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent($("#pac-input").val())}&key=${key}`,
    dataType: 'JSON',
    async: false,
    type: 'GET',
    success: data => getParking(data),
    error: e => $(".alloptions").text(`Cannot connect to Google servers, ${e.statusText} status: ${e.status}`)
  })
}

function getParking(json) {
  //console.log(JSON.stringify(json))
  if(json.status === "OK"){
    let lat = json.results[0].geometry.location.lat
    let long = json.results[0].geometry.location.lng
    $.ajax({
      url: `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=500&type=parking&key=${key}`,
      dataType: 'JSON',
      async: false,
      type: 'GET',
      success: data => appendData(data),
      error: e => $(".alloptions").text("Cannot connect to Google servers.")
    })
  }
}

function appendData(data) {
  if(data.status === "OK"){
    //alert(JSON.stringify(data, undefined, 2))
    $(".alloptions").html("")
    console.log(data)
    for(let i = 0; i < data.results.length; i++){
      let elem = data.results[i]
      if(elem.rating){
        let color;
        if(elem.rating >= 4)
          color = 'green'
        else if(elem.rating < 3)
          color = 'red'
        else
          color = 'black'
        $(".alloptions").append(`<div class="options" id="${i}">
          <button class="option-boxes">
            <p class="name">${elem.name}</p>
            <p class="rating" style="color: ${color}">${elem.rating}/5</p>
          </button>
        </div>`)
      } else if(elem.name) {
        $(".alloptions").append(`<div class="options">
          <button class="option-boxes">
            <p class="name">${elem.name}</p>
          </button>
        </div>`)
      }

      var icon = {
        url: elem.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      }

      parkingArr.push(new google.maps.Marker({
        map: null,
        icon: markerIcon,
        title: elem.name,
        position: elem.geometry.location
      }))
    }
  } else if(data.status === "ZERO_RESULTS"){
    $(".alloptions").text("No available parking lots at this time.")
  }
  //debugger
  console.log('parkingArr:')
  console.log(parkingArr)
}

// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

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

  markers = [];
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
      alert('b')
			currentLatitude = position.coords.latitude;
			currentLongitude = position.coords.longitude;
			//var infoWindowHTML = "Latitude: " + currentLatitude + "<br>Longitude: " + currentLongitude;
			//infoWindow = new google.maps.InfoWindow({map: map, content: infoWindowHTML});
			currentLocation = { lat: currentLatitude, lng: currentLongitude };
			initAutocomplete(currentLocation);

			//alert(currentcoord[0]);
			//alert(currentLatitude);
			//infoWindow.setPosition(currentLocation);
		}, function(err) {
      alert("error", JSON.stringify(err))
    });

	}
	//alert(currentLatitude);
	//return [currentLatitude, currentLongitude];
}
