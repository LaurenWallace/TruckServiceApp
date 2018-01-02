function serviceTruckMap() {
	
	var mapProperties = {
			center: new google.maps.LatLng(40.0583, 74.4057),
			zoom: 5,
	};
	
	var tmap = new google.maps.Map(document.getElementById("truckGoogleMap"), mapProperties);
}