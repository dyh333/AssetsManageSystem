/**
 * Created by dingyh on 2015/09/01.
 */
require.config({
    baseUrl: '../js',
    paths: {
        "jquery": "lib/jquery.min",
        "url": "lib/js-url/url.min",
        "lodash": "lib/lodash/lodash.min",
        "postal": "lib/postal/postal.min",
        "terraformer": "lib/terraformer/terraformer.min",
        "terraformer_wkt_parser": "lib/terraformer/terraformer-wkt-parser.min",
        "d3": "lib/d3/d3.min",

        "initParam": "app/initParam",
        "floorSvg": "app/floorSvg"
    },
    shim: {
        "url": {
            deps: ['jquery'],
            exports: 'url'
        },
        "postal": ['lodash'],
        "terraformer_wkt_parser": {
            deps: ['terraformer'],
            exports: 'terraformer_wkt_parser'
        }
    }
});


require([], function () {
    alert();
    //var map;
    //
    //parser.parse();
    //
    ////snapping is enabled for this sample - change the tooltip to reflect this
    //i18n.toolbars.draw.start += "<br/>Press <b>CTRL</b> to enable snapping";
    //i18n.toolbars.draw.addPoint += "<br/>Press <b>CTRL</b> to enable snapping";
    //
    ////This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to
    ////replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic
    ////for details on setting up a proxy page.
    //esriConfig.defaults.io.proxyUrl = "/proxy/";
    //
    ////This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications
    //esriConfig.defaults.geometryService = new GeometryService("https://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
    //
    //map = new Map("map", {
    //    basemap: "topo",
    //    center: [-77.036, 38.891],
    //    zoom: 16
    //});
    //
    //map.on("layers-add-result", initEditing);
    //
    //var operationsPointLayer = new FeatureLayer("https://sampleserver5.arcgisonline.com/ArcGIS/rest/services/Energy/HSEC/FeatureServer/0", {
    //    mode: FeatureLayer.MODE_ONDEMAND,
    //    outFields: ["*"]
    //});
    //var operationsLineLayer = new FeatureLayer("https://sampleserver5.arcgisonline.com/ArcGIS/rest/services/Energy/HSEC/FeatureServer/1",{
    //    mode: FeatureLayer.MODE_ONDEMAND,
    //    outFields: ["*"]
    //});
    //var operationsPolygonLayer = new FeatureLayer("https://sampleserver5.arcgisonline.com/ArcGIS/rest/services/Energy/HSEC/FeatureServer/2", {
    //    mode: FeatureLayer.MODE_ONDEMAND,
    //    outFields: ["*"]
    //});
    //
    //map.addLayers([
    //    operationsPointLayer, operationsPolygonLayer, operationsLineLayer
    //]);
    //map.infoWindow.resize(400, 300);
    //
    //function initEditing (event) {
    //    var featureLayerInfos = arrayUtils.map(event.layers, function (layer) {
    //        return {
    //            "featureLayer": layer.layer
    //        };
    //    });
    //
    //    var settings = {
    //        map: map,
    //        layerInfos: featureLayerInfos
    //    };
    //    var params = {
    //        settings: settings
    //    };
    //    var editorWidget = new Editor(params, 'editorDiv');
    //    editorWidget.startup();
    //
    //    //snapping defaults to Cmd key in Mac & Ctrl in PC.
    //    //specify "snapKey" option only if you want a different key combination for snapping
    //    map.enableSnapping();
    //}

});