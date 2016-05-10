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

        "initParam": "app/initParam",
        "floorCanvas": "app/floorCanvas"
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


require(['initParam', 'floorCanvas'], function (initParam, floorCanvas) {
    var flrId = 'A41AB56E-CCD8-4D54-8C3B-23013BDF1B7F';

    var promise = initParam.queryCenter();
    promise.done(result);

    function result() {
        var center = initParam.getCenter();
        floorCanvas.loadFloor(flrId, center);
    }


});