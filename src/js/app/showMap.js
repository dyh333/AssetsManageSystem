/**
 * Created by dingyh on 2015/08/29.
 */
define(['jquery', 'leaflet'], function ($, leaflet) {
    var map;
    var markers = new L.FeatureGroup();


    var propsUrl = "http://58.210.9.134/zcglserver/getProps/{0}/{1}";

    var jwIcon = L.icon({
        iconUrl: '../imgs/icons/poi_jw.png',
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    }), yrIcon = L.icon({
        iconUrl: '../imgs/icons/poi_yr.png',
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    }), slIcon = L.icon({
        iconUrl: '../imgs/icons/poi_sl.png',
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    }), llIcon = L.icon({
        iconUrl: '../imgs/icons/poi_ll.png',
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    });

    function loadBaseMap() {
        map = L.map('div_map').setView([31.320402, 120.690741], 12);

        var accessToken = 'pk.eyJ1IjoiZHloMzMzIiwiYSI6ImNpaGRpZTFscTBibWx0dGx6OXZwMXNjOTMifQ.8UuOcbeRS65i41ceOjLR5w';
        var tiles = L.tileLayer('https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + accessToken, {
            maxZoom: 15,
            id: 'mapBoxTiles'
        }).addTo(map);

        map.addLayer(markers);
    }

    function addLegendPanel() {
        var legend = L.control({position: 'bottomleft'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = ['jw', 'yr', 'sl', 'll'];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<image src="../imgs/icons/legend_'+grades[i]+'.png"></image><br>';
            }

            return div;
        };

        legend.addTo(map);
    }

    function loadProps(data) {
        markers.clearLayers();

        $.each(data, function (key, value) {
            var l = value.L, b = value.B, icon;
            if (l != "" && b != "") {
                switch (value.PROP_RIGHT_CODE) {
                    case "10001":
                        icon = jwIcon;
                        break;
                    case "10002":
                        icon = yrIcon;
                        break;
                    case "10003":
                        icon = slIcon;
                        break;
                    case "10004":
                        icon = llIcon;
                        break;
                }

                var marker = L.marker([l, b], {icon: icon, title: value.PROP_ID})
                    .bindPopup(value.PROP_NAME)
                    .on('mouseover', function(e){
                        e.target.openPopup();
                    }).on('click', function(e){
                        var propId = e.target.options.title;
                        window.open('../webs/propdetail_requirejs.html?propId=' + propId, "_blank");
                    });

                markers.addLayer(marker);
            }
        });
    }

    return {
        loadBaseMap: loadBaseMap,
        addLegendPanel: addLegendPanel,
        loadProps: loadProps
    };
});