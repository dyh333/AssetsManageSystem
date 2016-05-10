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


require(['initParam', 'floorSvg'], function (initParam, floorSvg) {



});