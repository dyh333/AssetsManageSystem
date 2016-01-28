/**
 * Created by dingyh on 2015/09/01.
 */
require.config({
    baseUrl: '../js',
    paths: {
        "jquery": "lib/jquery.min",
        "url": "lib/js-url/url.min",
        "underscore": "lib/underscore/underscore-min",
        "jsrender": "lib/JsRender/jsrender.min",

        "loadIndex": "app/loadIndex"
    },
    shim: {
        "url": {
            deps: ['jquery'],
            exports: 'url'
        }
    }
});


require(['loadIndex'], function (loadIndex) {

});