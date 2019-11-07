'use strict';
var map, saved_lat, saved_lon, bbox;
var kondom_icon, strip_icon, shop_icon, brothel_icon, register_icon;
var poi_markers = new Array();

function jumpto(lat, lon) {
	$("#autocomplete").hide();
	map.panTo([lat, lon]);
}

function geocode() {
	var searchword = $("#searchfield").val();

	if(searchword.length > 3) {
		$.getJSON("https://photon.komoot.de/api/", {
			"q": searchword,
			"lat": saved_lat,
			"lon": saved_lon,
			"limit": 5,
			"lang": navigator.language
		}, function(data) {
			var current_bounds = map.getBounds();
			var autocomplete_content = "<li>";

			$.each(data.features, function(number, feature) {
				var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

				autocomplete_content += "<ul onclick='jumpto(" + latlng[0] + ", " + latlng[1] + ")'>" + feature.properties.name + ", " + feature.properties.country + "</ul>";
			});

			$("#autocomplete").html(autocomplete_content+"</li>");
			$("#autocomplete").show();
		});
	}
}

function setPoiMarker(poi_type, icon, lat, lon, tags, osmid, osmtype) {
	var mrk = L.marker([lat, lon], {icon: icon});
	var osmlink = "https://www.openstreetmap.org/"+osmtype+"/"+osmid;

	if(tags.name == undefined) {
		var popup_content = "<strong>"+ poi_type +"</strong>";	
	} else {
		var popup_content = "<strong>" + tags.name + " ("+ poi_type +")</strong>";
	}

	popup_content += "<div class='more_on_osm'><a href='"+osmlink+"'>more on OpenStreetMap.org</a></div>";

	mrk.bindPopup(popup_content);
	poi_markers.push(mrk);
	mrk.addTo(map);
}

function element_to_map(data) {
	$.each(poi_markers, function(_, mrk) {
		map.removeLayer(mrk);
	});

	$.each(data.elements, function(_, el) {
		if(el.lat == undefined) {
			el.lat = el.center.lat;
			el.lon = el.center.lon;
		}

		if(el.tags != undefined && el.tags.entrance != "yes") {
			var mrk, popup_content;

			if(el.tags.vending != undefined) {
				mrk = L.marker([el.lat, el.lon], {icon: kondom_icon});
				mrk.bindPopup("Kondomautomat");
			} else if(el.tags.amenity == "stripclub") {
				setPoiMarker("Strip Club", strip_icon, el.lat, el.lon, el.tags, el.id, el.type);
			} else if(el.tags.shop == "erotic" || el.tags.shop == "adult" || el.tags.shop == "sex") {
				setPoiMarker("Sex shop", shop_icon, el.lat, el.lon, el.tags, el.id, el.type);
			} else if(el.tags.amenity == "brothel") {
				setPoiMarker("Brothel", brothel_icon, el.lat, el.lon, el.tags, el.id, el.type);
			} else if(el.tags.amenity == "love_hotel") {
				setPoiMarker("Love Hotel", brothel_icon, el.lat, el.lon, el.tags, el.id, el.type);
			} else if(el.tags.amenity == "swingerclub") {
				setPoiMarker("Swinger Club", brothel_icon, el.lat, el.lon, el.tags, el.id, el.type);
			} else if(el.tags.amenity == "register_office" || el.tags.office == "register") {
				setPoiMarker("Register Office", register_icon, el.lat, el.lon, el.tags, el.id, el.type);
			}
		}
	});
}


function get_op_elements() {
	if(map.getZoom() < 12) {
		return null;
	}

	bbox = map.getBounds().getSouth() + "," + map.getBounds().getWest() + "," + map.getBounds().getNorth() +  "," + map.getBounds().getEast();

	localStorage.setItem("pos_lat", map.getCenter().lat)
	localStorage.setItem("pos_lon", map.getCenter().lng)

	$.ajax({
		url: "https://overpass-api.de/api/interpreter",
		data: {
			"data": '[bbox:'+bbox+'][out:json][timeout:25];(nwr[vending=condoms];nwr[amenity~"^(brothel|love_hotel|swingerclub|stripclub|register_office)$"];nwr[shop~"^(erotic|adult|sex)$"];nwr[office=register];);out body center;'
		},
		success: element_to_map
	});
}


function go_to_current_pos() {
	navigator.geolocation.getCurrentPosition(function(pos) {
		map.setView([pos.coords.latitude, pos.coords.longitude]);
	});
}


$(function() {
	kondom_icon = L.icon({
		iconUrl: '/static/img/kondom.png',
		iconSize: [30, 30],
		iconAnchor: [15, 15],
		popupAnchor: [0, -15]
	});

	strip_icon = L.icon({
		iconUrl: '/static/img/stripclub2.png',
		iconSize: [30, 30],
		iconAnchor: [15, 15],
		popupAnchor: [0, -15]
	});

	shop_icon = L.icon({
		iconUrl: '/static/img/shop.png',
		iconSize: [30, 30],
		iconAnchor: [15, 15],
		popupAnchor: [0, -15]
	});

	brothel_icon = L.icon({
		iconUrl: '/static/img/brothel.png',
		iconSize: [30, 30],
		iconAnchor: [15, 15],
		popupAnchor: [0, -15]
	});

	register_icon = L.icon({
		iconUrl: '/static/img/register.png',
		iconSize: [30, 30],
		iconAnchor: [15, 15],
		popupAnchor: [0, -15]
	});

	// init map
	map = L.map('bigmap')
	
	saved_lat = localStorage.getItem("pos_lat")
	saved_lon = localStorage.getItem("pos_lon")

	if(saved_lat != undefined) {
		map.setView([saved_lat, saved_lon], 13)
	} else {
		map.setView([51.0474, 13.7384], 13);
	}

	var hash = new L.Hash(map);

	if(L.Browser.retina) var tp = "lr";
	else var tp = "ls";
	L.tileLayer('https://tiles.lyrk.org/'+tp+'/{z}/{x}/{y}?apikey=299723017f344e81866878c8f2fb0678', {
		attribution: 'powered by <a href="https://geodienste.lyrk.de">Lyrk Geodienste</a>, <a href="http://geodienste.lyrk.de/copyright">Lizenzinformationen</a>',
		maxZoom: 18
	}).addTo(map);

	// init search
	$("#searchfield").keyup(function() {
		geocode();
	});

	// poi reload on map move
	map.on('moveend', get_op_elements);

	// initial poi load
	get_op_elements();
});
