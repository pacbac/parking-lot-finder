$(document).ready(function(){
  $("input[name='dest-search']").keypress(function() {
    let key = e.which || e.keyCode
    if(key == 13 && $(this).val().length > 0){

    }
  })

  $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=&key=AIzaSyBIRXiPdmla65u0r8fkCx6xUMh46NIa8uM', json => {
    
  })
})
