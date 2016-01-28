/**
 * Created by dingyh on 2015/08/27.
 */
require.config({
    baseUrl: '../js',
    paths: {
        "jquery": "lib/jquery.min",
        "url": "lib/js-url/url.min",
        "underscore": "lib/underscore/underscore-min",
        "jsrender": "lib/JsRender/jsrender.min",
        "bootstrap": "lib/bootstrap/js/bootstrap.min",
        "lodash": "lib/postal/lodash.min",
        "postal": "lib/postal/postal.min",
        "amplify": "lib/amplify/amplify.core.min",

        "loadPropDetail": "app/loadPropDetail"
    },
    shim: {
        "url": {
            deps: ['jquery'],
            exports: 'url'
        },
        "bootstrap": ['jquery'],
        "jsrender": ['jquery'],
        "postal": ['lodash'],
        "amplify": {
            deps: ['jquery'],
            exports: 'amplify'
        }
    }
});




require(['bootstrap', 'loadPropDetail'], function (bootstrap, loadPropDetail) {
    var totalH = $(window).height();
    var topH = $("#div_top").height();
    var bannerH = $("#div_banner").height();
    $("#div_center").css("height", totalH - topH - bannerH);

    $('#tabs').tab();
});