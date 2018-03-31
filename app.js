if(!markers) var markers = []
if (!key) var key = 'AIzaSyAhQfMo_WF9YjXqjv8OJhjDRGsNtS2ADMU'

$(document).ready(function(){
  $("#pac-input").keypress(e => {
    let key = e.which || e.keyCode
    if(key != 13) return
    retrieveJSONData()
  })

  $(document).on("mousedown", ".pac-item", () => retrieveJSONData())
})

function retrieveJSONData() {
  $(".alloptions").show()
  $.getJSON(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent($("#pac-input").val())}&key=${key}`,
  json => {
    if(json.status === "OK"){
      let lat = json.results[0].geometry.location.lat
      let long = json.results[0].geometry.location.lng
      $.ajax({
        url: `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=500&type=parking&key=${key}`,
        dataType: 'JSON',
        type: 'GET',
        success: function (data) {
            if(data.status === "OK"){
              alert(JSON.stringify(data, undefined, 2))
              $(".alloptions").html("")
              console.log(data)
              data.results.forEach(elem => {
                if(elem.rating){
                  let color;
                  if(elem.rating >= 4)
                    color = 'green'
                  else if(elem.rating < 3)
                    color = 'red'
                  else
                    color = 'black'
                  $(".alloptions").append(`<div class="options">
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
              })
            } else if(data.status === "ZERO_RESULTS"){
              $(".alloptions").text("No available parking lots at this time.")
            }
        },
        error: e => alert(`Error, ${e}`)
      })
    } else {
      alert(`Error, ${json.status}`)
    }
  })
}

// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

function initAutocomplete() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 10,
    mapTypeId: 'roadmap'
  });

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
  });
}
