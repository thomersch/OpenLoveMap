function all_to_nodes(osmJSON) {
	osm = osmJSON;
	allnodes = {};
	for (var i=0;i<osm["elements"].length;i++) {

		if (osm["elements"][i]["type"]=="node") {
			var elementid = osm["elements"][i]["id"];
			allnodes[elementid] = osm["elements"][i];
		}

		if (osm["elements"][i]["type"]=="way") {
			//alle mitglieder
			var elementid = osm["elements"][i]["id"];
			var memebernotes = osm["elements"][i]["nodes"];
			var maxlat = -9999;
			var maxlon = -9999;
			var minlat = 9999;
			var minlon = 9999;
			for (var j=0;j<memebernotes.length;j++){
				if (allnodes[memebernotes[j]]["lat"]>maxlat) maxlat = allnodes[memebernotes[j]]["lat"];
				if (allnodes[memebernotes[j]]["lat"]<minlat) minlat = allnodes[memebernotes[j]]["lat"];
				if (allnodes[memebernotes[j]]["lon"]>maxlon) maxlon = allnodes[memebernotes[j]]["lon"];
				if (allnodes[memebernotes[j]]["lon"]<minlon) minlon = allnodes[memebernotes[j]]["lon"];
			}
			osm["elements"][i]["lat"] = ((maxlat - minlat)/2) + parseFloat(minlat)
    		osm["elements"][i]["lon"] = ((maxlon - minlon)/2) + parseFloat(minlon)
    		allnodes[elementid] = osm["elements"][i];
		}

		if (osm["elements"][i]["type"]=="relation") {
			//alle mitglieder
			var elementid = osm["elements"][i]["id"];
			var memebernotes = osm["elements"][i]["members"];
			var maxlat = -9999;
			var maxlon = -9999;
			var minlat = 9999;
			var minlon = 9999;
			for (var j=0;j<memebernotes.length;j++){
				if (memebernotes[j]["type"]!="relation"){
					if (allnodes[memebernotes[j]["ref"]]["lat"]>maxlat) maxlat = allnodes[memebernotes[j]["ref"]]["lat"];
					if (allnodes[memebernotes[j]["ref"]]["lat"]<minlat) minlat = allnodes[memebernotes[j]["ref"]]["lat"];
					if (allnodes[memebernotes[j]["ref"]]["lon"]>maxlon) maxlon = allnodes[memebernotes[j]["ref"]]["lon"];
					if (allnodes[memebernotes[j]["ref"]]["lon"]<minlon) minlon = allnodes[memebernotes[j]["ref"]]["lon"];
				}
			}
			osm["elements"][i]["lat"] = ((maxlat - minlat)/2) + parseFloat(minlat)
    		osm["elements"][i]["lon"] = ((maxlon - minlon)/2) + parseFloat(minlon)
    		allnodes[elementid] = osm["elements"][i];
		}
	}
	return osm;
}
