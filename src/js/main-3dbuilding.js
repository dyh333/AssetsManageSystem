/**
 * Created by dingyh on 2015/09/01.
 */
require.config({
    baseUrl: '../js',
    paths: {
        "serviceConfig": "serviceConfig",

        "jquery": "lib/jquery.min",
        "url": "lib/js-url/url.min",
        "underscore": "lib/underscore/underscore-min",
        "lodash": "lib/lodash/lodash.min",
        "jsrender": "lib/JsRender/jsrender.min",
        "postal": "lib/postal/postal.min",
        //"amplify": "lib/amplify/amplify.core.min",

        "terraformer": "lib/terraformer/terraformer.min",
        "terraformer_wkt_parser": "lib/terraformer/terraformer-wkt-parser.min",
        //"wicket": "lib/wicket",
        "three": "lib/threejs/three",
        "stats": "lib/threejs/stats",
        "orbitControls": "lib/threejs/OrbitControls",
        "objloader": "lib/threejs/OBJLoader",
        "tween": "lib/threejs/tween.min",
        //"fullScreen": "lib/threejs/THREEx.FullScreen",

        "initParam": "app/initParam",
        "threeBuilding": "app/threeBuilding",
        "floorRender": "app/floorRender",
        "floorList": "app/floorList"
        //"loadInnerroom": "app/loadInnerroom"
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
        "postal": ['lodash'],
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
        },
        "stats":{
            exports: 'stats'
        },
        "tween": {
            exports: 'tween'
        }
    }
});

require(['threeBuilding', 'floorRender', 'floorList'], function (threeBuilding, floorRender, floorList) {

    threeBuilding.initLoad();

    threeBuilding.loadBldgs();

    $("#btnRenderRent").click(function () {
        var renderArray = floorRender.getRentRenerArray();

        threeBuilding.renderByArray(renderArray);
    });

    $("#btnRenderCap").click(function () {
        var renderArray = floorRender.getCapRenerArray();

        threeBuilding.renderByArray(renderArray);
    });

    $("#btnRenderIncome").click(function () {
        var renderArray = floorRender.getIncomeRenerArray();

        threeBuilding.renderByArray(renderArray);
    });

    $("#btnTween").click(function(){
        //threeBuilding.tweenTest();
    });
    $("#btnFloorUp").click(function(){
        threeBuilding.tweenFloorUp();
    });
    $("#btnFloorDown").click(function(){
        threeBuilding.tweenFloorDown();
    });
    $("#btnAllFloors").click(function(){
        var selectedBldgId = threeBuilding.getSelectedBldgId();

        threeBuilding.loadAllFloors(selectedBldgId);
    });
    $("#btnRenderFloors").click(function(){
        var selectedBldgId = threeBuilding.getSelectedBldgId();

        var promise = floorRender.loadRoomArea(selectedBldgId, null);
        promise.done(result);

        function result() {
            var renderArray = floorRender.getRoomAreaRenerArray();
            threeBuilding.renderRooms(renderArray);
        }
    });
    $("#btnStretchFloors").click(function(){
        threeBuilding.stretchFloors();
    });


});
