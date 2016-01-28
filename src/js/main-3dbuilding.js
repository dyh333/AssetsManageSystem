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
        "jsrender": "lib/JsRender/jsrender.min",
        "lodash": "lib/postal/lodash.min",
        "postal": "lib/postal/postal.min",
        "amplify": "lib/amplify/amplify.core.min",

        "terraformer": "lib/terraformer/terraformer.min",
        "terraformer_wkt_parser": "lib/terraformer/terraformer-wkt-parser.min",
        //"wicket": "lib/wicket",
        "three": "lib/threejs/three",
        "stats": "lib/threejs/stats",
        "orbitControls": "lib/threejs/OrbitControls",
        "objloader": "lib/threejs/OBJLoader",
        "tween": "lib/threejs/tween.min",
        //"fullScreen": "lib/threejs/THREEx.FullScreen",

        "loadInitParam": "app/loadInitParam",
        "load3dBuilding": "app/load3dBuilding",
        "loadFloorRender": "app/loadFloorRender",
        "loadFloorList": "app/loadFloorList",
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
        "postal": ['lodash'],
        "amplify": {
            deps: ['jquery'],
            exports: 'amplify'
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
        },
        "stats":{
            exports: 'stats'
        },
        "tween": {
            exports: 'tween'
        }
    }
});

require(['load3dBuilding', 'loadFloorRender', 'loadFloorList'], function (load3dBuilding, loadFloorRender, loadFloorList) {
    //var center = loadInitParam.getCenter();

    load3dBuilding.initLoad();

    load3dBuilding.loadBldgs();




    $("#btnRenderRent").click(function () {
        var renderArray = loadFloorRender.getRentRenerArray();

        load3dBuilding.renderByArray(renderArray);
    });

    $("#btnRenderCap").click(function () {
        var renderArray = loadFloorRender.getCapRenerArray();

        load3dBuilding.renderByArray(renderArray);
    });

    $("#btnRenderIncome").click(function () {
        var renderArray = loadFloorRender.getIncomeRenerArray();

        load3dBuilding.renderByArray(renderArray);
    });

    $("#btnTween").click(function(){
        load3dBuilding.tweenTest();
    });
    $("#btnFloorUp").click(function(){
        load3dBuilding.tweenFloorUp();
    });
    $("#btnFloorDown").click(function(){
        load3dBuilding.tweenFloorDown();
    });
});

//require(['url', 'load3dBuilding', 'loadInnerroom', 'loadFloorRender'], function (url, load3dBuilding, loadInnerroom, loadFloorRender) {
//    var propId = url('?propId');
//    var camera333, scene333, webGLRenderer333;
//
//    // create a scene, that will hold all our elements such as objects, cameras and lights.
//    scene333 = new THREE.Scene();
//
//    // create a camera, which defines where we're looking at.
//    camera333 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
//    // position and point the camera to the center of the scene
//    camera333.position.x = 0;
//    camera333.position.y = 70;
//    camera333.position.z = 500;
//
//    // create a render and set the size
//    webGLRenderer333 = new THREE.WebGLRenderer({
//        antialias: true
//    });
//    webGLRenderer333.setClearColor();
//    webGLRenderer333.setClearColor(new THREE.Color(0x87A0AB, 1.0));
//    webGLRenderer333.setSize(window.innerWidth, window.innerHeight);
//
//    //camera = load3dBuilding.addCamera();
//    load3dBuilding.addLight(scene333);
//    load3dBuilding.addGridHelper(scene333);
//    load3dBuilding.addOrbitControl(camera333);
//
//    load3dBuilding.loadBldgs(webGLRenderer333, scene333, camera333, propId);
//
//    //webGLRenderer.render(scene, camera);
//    //// add the output of the renderer to the html element
//    //document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);
//
//    $("#btnRenderRent").click(function () {
//        var renderArray = loadFloorRender.getRentRenerArray();
//
//        load3dBuilding.renderByArray(renderArray);
//    });
//
//    $("#btnRenderCap").click(function () {
//        var renderArray = loadFloorRender.getCapRenerArray();
//
//        load3dBuilding.renderByArray(renderArray);
//    });
//
//    $("#btnRenderIncome").click(function () {
//        var renderArray = loadFloorRender.getIncomeRenerArray();
//
//        load3dBuilding.renderByArray(renderArray);
//    });
//});