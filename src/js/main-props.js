/**
 * Created by dingyh on 2015/08/27.
 */
require.config({
    baseUrl: '../js',
    paths: {
        "jquery": "lib/jquery.min",
        "html5shiv": "lib/html5shiv.min",
        "respond": "lib/respond.min",
        "format": "lib/stringformat/string-format",
        "underscore": "lib/underscore/underscore-min",
        "jsrender": "lib/JsRender/jsrender.min",
        "bootstrap": "lib/bootstrap/js/bootstrap.min",
        "kendo": "lib/kendo/js/kendo.all.min",
        "leaflet": "lib/leaflet/leaflet",

        "loadProps": "app/loadProps",
        "showMap": "app/showMap"

    },
    shim: {
        "jsrender": {
            deps: ['jquery']
        }
    }
});


require(['loadProps', 'showMap'], function (loadProps, showMap) {
    var totalH = $(window).height();
    $("#div_center").css("height", totalH - 156);
    $("#div_map").css("height", totalH - 156);

    //$("#btnForm").click(function(){
    //    //loadProps.loadProps();
    //    $("#div_center").show();
    //    $("#div_map").hide();
    //});
    //$("#btnMap").click(function(){
    //    $("#div_center").hide();
    //    $("#div_map").show();
    //});

    loadProps.loadProps();
    showMap.loadBaseMap();
    showMap.addLegendPanel();
});