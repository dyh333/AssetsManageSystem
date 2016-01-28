/**
 * Created by dingyh on 2015/09/08.
 */
require.config({
    baseUrl: '../js',
    paths: {
        "jquery": "lib/jquery.min",
        "url": "lib/js-url/url.min",
        "jsrender": "lib/JsRender/jsrender.min",
        "underscore": "lib/underscore/underscore-min",

        "terraformer": "lib/terraformer/terraformer.min",
        "terraformer_wkt_parser": "lib/terraformer/terraformer-wkt-parser.min",
        "three": "lib/threejs/three",
        "stats":"lib/threejs/stats",
        "orbitControls": "lib/threejs/OrbitControls",
        "objloader": "lib/threejs/OBJLoader",
        //"fullScreen": "lib/threejs/THREEx.FullScreen",

        "loadFloorList": "app/loadFloorList",
        "loadBuildInitParam": "app/loadBuildInitParam",
        "loadInnerroom": "app/loadInnerroom"
    },
    shim: {
        "url": {
            deps: ['jquery'],
            exports: 'url'
        },
        "jsrender": {
            deps: ['jquery'],
            exports: 'jsrender'
        },
        "terraformer_wkt_parser": {
            deps: ['terraformer'],
            exports: 'terraformer_wkt_parser'
        },
        "orbitControls": {
            deps: ['three'],
            exports: 'orbitControls'
        },
        "objloader": {
            deps: ['three'],
            exports: 'objloader'
        }
    }
});


require(['loadBuildInitParam', 'loadFloorList', 'loadInnerroom'], function (loadBuildInitParam, loadFloorList, loadInnerroom) {
    loadFloorList.loadFloorList();

    loadInnerroom.loadInnerroom();
});