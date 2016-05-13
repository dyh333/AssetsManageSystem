/**
 * Created by dingyh on 2016/4/11.
 */
define(function () {
    //var spatialReference, map111, roomLayer;
    //var roomLayerClick;
    //var comp, sect, floor;
    var selectedRoom, selectedRoom2, splitLine;
    var operate;


    var loadBaseMap = function(){
        require(["../js/serviceConfig.js", "esri/config", "esri/SpatialReference", "esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer",
                "esri/layers/ImageParameters", "esri/geometry/Point",
                "esri/toolbars/draw",
                "dojo/parser", "dojo/domReady!"],
            function (config, esriConfig, SpatialReference, Map, Tiled, ArcGISDynamicMapServiceLayer, ImageParameters, Point, Draw, parser) {
                var token = "YLIEDFmJGyp9i8TO4ORnuNOyFCxnH0dDeOQkN6VI4CHfyHTEvsZ63NW8Rt0EiZSc7K6c1kp7l7fbrC7CamF4VJfk1YKILD7WTx5Puw4kLJQYU79XLB9nGQ==";

                parser.parse();

                //esriConfig.defaults.io.proxyUrl = "/proxy/";

                var baseMap = config.baseMapUrl.replace("{token}", token);

                $.getJSON(baseMap+"&f=json", function(data) {

                    spatialReference = new SpatialReference(data.spatialReference["wkt"]);

                    map = new Map("div_map",
                        {
                            logo:false,
                            showAttribution: false,
                            slider: false,
                            minScale: 2000,
                            maxScale: 125
                        });

                    //var tiled = new Tiled("http://58.210.9.131/sipsd/rest/services/SIPSD/ZNJTMAP/MapServer");
                    //map.addLayer(tiled);

                    var imageParameters = new ImageParameters();
                    imageParameters.format = "jpeg";
                    var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer(baseMap, {
                        "opacity" : 1,
                        "imageParameters" : imageParameters
                    });
                    map.addLayer(dynamicMapServiceLayer);

                    map.setScale(500);
                    map.centerAt(new Point(68702.1717334873, 44424.0472624344, spatialReference));

                    map.on("load", createToolbar);

                    function createToolbar() {
                        toolbar = new Draw(map);
                        toolbar.on("draw-end", showTempSplitRoom);
                    }

                    function showTempSplitRoom(evt){
                        addSplitLineToMap(evt);
                        cutRoomByLine();
                    }
                });
            });
    };

    var loadFloorRooms = function(_comp, _sect, _floor){
        //var deferred = $.Deferred();

        comp = _comp;
        sect = _sect;
        floor = _floor;

        require([
            "../js/serviceConfig.js",
            "../js/lib/arcgis-to-geojson.js",
            "esri/map",
            "esri/layers/GraphicsLayer",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/Font",
            "esri/symbols/TextSymbol",
            "esri/Color",
            "esri/geometry/Polygon",
            "esri/graphic",
            "dojo/domReady!"
        ], function (config, arcgisToGeojsonUtils, Map, GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, Font, TextSymbol, Color, Polygon, Graphic)  {

            if(map._layers["roomLayer"] == undefined){
                roomLayer = new GraphicsLayer({id: 'roomLayer'});
                map.addLayer(roomLayer);
            }
            if(map._layers["textLayer"] == undefined){
                textLayer = new GraphicsLayer({id: 'textLayer'});
                map.addLayer(textLayer);
            }

            $.ajax({
                url: config.floorRoomsUrl.replace('{comp}', comp).replace('{sect}', sect).replace('{floor}', floor),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                //jsonpCallback: 'getFloorRoomsCB',
                type: 'GET',
                success: function (data) {
                    //clear roomLayer graphics and textLayer graphics
                    roomLayer.clear();
                    textLayer.clear();

                    var geojsonToArcGIS = arcgisToGeojsonUtils.geojsonToArcGIS;
                    var arcgis = geojsonToArcGIS(data);

                    //var polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    //    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    //        new Color([118, 209, 2]), 2), new Color([118, 209, 2, 0.5])
                    //);

                    var font = new Font("12px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL);

                    $.each(arcgis, function (i, val) {
                        var geometry0 = new Polygon(spatialReference);
                        geometry0.addRing(val.geometry.rings[0]);

                        var isHooked = val.attributes.DM_PROPERTY != "" ? true : false;
                        var isRented =  val.attributes.RENTSTATUS == "1" ? true : false;
                        var alpha = isRented == true ? 0.5 : 0.2;
                        var polygonSymbol;
                        if(isHooked){
                            polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                    new Color([118, 209, 2]), 2), new Color([118, 209, 2, alpha]));
                        } else {
                            polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                    new Color([185,185,185]), 2), new Color([185,185,185, alpha]));
                        }

                        var attr = {"roomId": val.attributes.RM_ID, "dmProperty": val.attributes.DM_PROPERTY,
                                    "propertyName": val.attributes.PROPERTYNAME, "rentStatus": val.attributes.RENTSTATUS};
                        var graphic = new Graphic(geometry0, polygonSymbol, attr);
                        roomLayer.add(graphic);

                        var textSymbol = new TextSymbol(val.attributes.PROPERTYNAME, font, new Color([0, 0, 0, 1]));
                        var textGraphic = new Graphic(geometry0, textSymbol);
                        textLayer.add(textGraphic);

                    });

                    //deferred.resolve();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load floor room error');
                }
            });
        });

        //return deferred.promise();
    };

    var loadFloorWalls = function(comp, sect, floor){
        //var deferred = $.Deferred();

        require([
            "../js/serviceConfig.js",
            "../js/lib/arcgis-to-geojson.js",
            "esri/map",
            "esri/layers/GraphicsLayer",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/Color",
            "esri/geometry/Polygon",
            "esri/graphic",
            "dojo/domReady!"
        ], function (
            config,
            arcgisToGeojsonUtils,
            Map,
            GraphicsLayer,
            SimpleFillSymbol, SimpleLineSymbol, Color,
            Polygon, Graphic
        )  {

            if(map._layers["wallLayer"] == undefined){
                wallLayer = new GraphicsLayer({id: 'wallLayer'});
                map.addLayer(wallLayer);
            }

            $.ajax({
                url: config.floorWallsUrl.replace('{comp}', comp).replace('{sect}', sect).replace('{floor}', floor),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                //jsonpCallback: 'getFloorRoomsCB',
                type: 'GET',
                success: function (data) {
                    //clear roomLayer graphics
                    wallLayer.clear();

                    var geojsonToArcGIS = arcgisToGeojsonUtils.geojsonToArcGIS;
                    var arcgis = geojsonToArcGIS(data);

                    var polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([117, 117, 117]), 1),new Color([117, 117, 117, 0.25])
                    );

                    $.each(arcgis, function (i, val) {
                        var geometry0 = new Polygon(spatialReference);
                        geometry0.addRing(val.geometry.rings[0]);

                        var graphic = new Graphic(geometry0, polygonSymbol);

                        wallLayer.add(graphic);
                    });

                    //deferred.resolve();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load floor room error');
                }
            });
        });

        //return deferred.promise();
    };

    function loadHookSelectList(data){
        $("#sel_hook option").remove();

        var template = $.templates("#sel_hook_tmpl");
        var htmlOutput = template.render(data);
        $("#sel_hook").append(htmlOutput);

        $('#sel_hook').selectpicker('refresh');
    }



    function selectRoom(){
        operate = "select";

        renderRoomByDefault();

        roomLayerClick = roomLayer.on("click", roomLayerClickEvent);

        roomLayerMouseOver = roomLayer.on("mouse-over", function(){
            map.setMapCursor("pointer");
        });
        roomLayerMouseOut = roomLayer.on("mouse-out", function(){
            map.setMapCursor("default");
        });
    }

    function renderRoomByDefault(){
        require([
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/Color",
            "dojo/domReady!"
        ], function (SimpleFillSymbol, SimpleLineSymbol, Color) {
            //将房间渲染成默认的symbol
            $.each(roomLayer.graphics, function (idx, item) {
                var isHooked = item.attributes.dmProperty != "" ? true : false;
                var isRented = item.attributes.rentStatus == "1" ? true : false;
                var alpha = isRented == true ? 0.5 : 0.2;
                var polygonSymbol;
                if (isHooked) {
                    polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([118, 209, 2]), 2), new Color([118, 209, 2, alpha]));
                } else {
                    polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([185, 185, 185]), 2), new Color([185, 185, 185, alpha]));
                }
                item.setSymbol(polygonSymbol);
            });
        });
    }

    var roomLayerClickEvent = function (evt) {
        require([
            "esri/map",
            "esri/layers/GraphicsLayer",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/Color",
            "dojo/domReady!"
        ], function (Map, GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, Color) {
            if (evt.graphic.attributes != undefined && evt.graphic.attributes.roomId != undefined) {
                //高亮选中的room
                var highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([98,194,204]), 2), new Color([98,194,204,0.5])
                );
                evt.graphic.setSymbol(highlightSymbol);

                selectedRoom = evt.graphic.attributes.roomId;

                roomLayerClick.remove();

                //切换默认鼠标样式
                roomLayerMouseOver.remove();
                roomLayerMouseOut.remove();
                map.setMapCursor("default");

                setOperateBtnGroup(["cutRoom", "mergeRoom", "linkRoom", "clear"], ["selRoom", "save"]);

                //return selectedRoom;
            }
        });
    };

    var centerToRoom = function(property){
        require([
            "esri/map",
            "esri/layers/GraphicsLayer",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/Color",
            "dojo/domReady!"
        ], function (Map, GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, Color) {
            $.each(roomLayer.graphics, function(idx, item){
                if(item.attributes["dmProperty"] == property){
                    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([98,194,204]), 2), new Color([98,194,204,0.5])
                    );
                    item.setSymbol(symbol);

                    var centerP = item.geometry.getCentroid();
                    map.setScale(500);
                    map.centerAt(centerP);
                } else {
                    var isHooked = item.attributes.dmProperty != "" ? true : false;
                    var isRented =  item.attributes.rentStatus == "1" ? true : false;
                    var alpha = isRented == true ? 0.5 : 0.2;
                    var polygonSymbol;
                    if(isHooked){
                        polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([118, 209, 2]), 2), new Color([118, 209, 2, alpha]));
                    } else {
                        polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                new Color([185,185,185]), 2), new Color([185,185,185, alpha]));
                    }
                    item.setSymbol(polygonSymbol);
                }
            });

        });
    };

    function startCutRoom(){
        require([
            "esri/toolbars/draw",
            "esri/SnappingManager",
            "dojo/domReady!"
        ], function (Draw, SnappingManager){
            operate = "cut";

            map.enableSnapping();
            map.setMapCursor("default");
            toolbar.activate(Draw["POLYLINE"]);
        });
    }

    function addSplitLineToMap(evt) {
        require([
            "esri/symbols/SimpleLineSymbol",
            "esri/graphic",
            "dojo/domReady!"
        ], function (SimpleLineSymbol,  Graphic){
            map.setMapCursor("default");
            toolbar.deactivate();

            var symbol = new SimpleLineSymbol();
            var graphic = new Graphic(evt.geometry, symbol);
            map.graphics.add(graphic);

            splitLine = evt.geometry.paths[0];
        });
    }

    function cutRoomByLine(){
        require(["../js/serviceConfig.js", "dojo/domReady!"], function (config){
            $.ajax({
                url: config.cutRoomByLine,
                dataType: 'json',
                processData: false,
                cache: true,
                ifModified: true,
                type: 'POST',
                data: "roomId=" + selectedRoom + "&splitLine=" + JSON.stringify(splitLine),
                success: function (data) {
                    if(data == true){
                        addTempSplitRoom();

                        operate = "cutRoom";

                        setOperateBtnGroup(["cancel", "save"], ["selRoom", "cutRoom", "mergeRoom", "linkRoom", "clear"]);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('cut Room By Line error');
                }
            });
        });
    }

    function addTempSplitRoom(){
        require([
            "../js/serviceConfig.js",
            "../js/lib/arcgis-to-geojson.js",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/Color",
            "esri/geometry/Polygon",
            "esri/graphic",
            "esri/layers/GraphicsLayer",
            "dojo/domReady!"
        ], function (
            config, arcgisToGeojsonUtils, SimpleFillSymbol, SimpleLineSymbol, Color, Polygon, Graphic, GraphicsLayer){
            if(map._layers["tempRoomLayer"] == undefined){
                tempRoomLayer = new GraphicsLayer();
                map.addLayer(tempRoomLayer);
            }

            $.ajax({
                url: config.loadTempSplitRoomUrl.replace("{roomFatId}", selectedRoom),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                type: 'GET',
                success: function (data) {
                    //清除临时绘制的线
                    map.graphics.clear();

                    var geojsonToArcGIS = arcgisToGeojsonUtils.geojsonToArcGIS;
                    var arcgis = geojsonToArcGIS(data);

                    var polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([255,0,0]), 2),new Color([0,255,255,0.25])
                    );

                    $.each(arcgis, function(i,val){
                        var geometry0 = new Polygon(spatialReference);
                        geometry0.addRing(val.geometry.rings[0]);

                        var attr = {"roomId": val.attributes.RM_ID};
                        var graphic = new Graphic(geometry0, polygonSymbol, attr);

                        tempRoomLayer.add(graphic);
                    });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('add Temp SplitRoom error');
                }
            });
        });
    }

    function cancelCutRoom(){
        require(["../js/serviceConfig.js"], function (config){
            $.ajax({
                url: config.cancelCutRoom.replace("{roomId}", selectedRoom),
                dataType: 'jsonp',
                processData: false,
                cache: false,
                ifModified: true,
                type: 'GET',
                success: function (data) {
                    if(data == true){
                        tempRoomLayer.clear();

                        alert("取消裁切成功");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('cancel Cut Room error');
                }
            });
        });
    }

    function saveCutRoom(){
        require(["../js/serviceConfig.js", "../js/app/floorRoomsEditor/propertyTree.js", "dojo/domReady!"],
            function (config, tree){
            $.ajax({
                //TODO: user->loginName
                url: config.saveCutRoomUrl.replace("{roomId}", selectedRoom).replace("{user}", "dingyh"),
                dataType: 'jsonp',
                processData: false,
                cache: false,
                ifModified: true,
                type: 'GET',
                success: function (data) {
                    if(data == true){
                        tempRoomLayer.clear();

                        //刷新地图
                        loadFloorRooms(comp, sect, floor);
                        //刷新铺位列表
                        var floorStr = $("#tbl_floorlist .selected").attr("data-value");
                        tree.loadFloorPropertyList(comp, sect, floorStr);

                        alert("保存裁切成功");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('save Cut Room error');
                }
            });
        });
    }

    /**
     * 合并房间
     */
    function startMergeRoom(){
        operate = "merge";

        roomLayerClick2 = roomLayer.on("click", roomLayerClickEvent2);

        roomLayerMouseOver = roomLayer.on("mouse-over", function(){
            map.setMapCursor("pointer");
        });
        roomLayerMouseOut = roomLayer.on("mouse-out", function(){
            map.setMapCursor("default");
        });
    }

    var roomLayerClickEvent2 = function (evt) {
        require([
            "esri/map",
            "esri/layers/GraphicsLayer",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/Color",
            "dojo/domReady!"
        ], function (Map, GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, Color) {
            if (evt.graphic.attributes != undefined && evt.graphic.attributes.roomId != undefined) {
                //高亮选中的room
                var highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([98,194,204]), 2), new Color([98,194,204,0.5])
                );
                evt.graphic.setSymbol(highlightSymbol);

                selectedRoom2 = evt.graphic.attributes.roomId;

                roomLayerClick2.remove();

                //切换默认鼠标样式
                roomLayerMouseOver.remove();
                roomLayerMouseOut.remove();
                map.setMapCursor("default");

                setOperateBtnGroup(["selRoom"], ["cutRoom", "mergeRoom", "linkRoom", "cancel", "save", "clear"]);

                //确认合并提示
                //var r = confirm("确认合并吗？");
                //if (r == true) {
                //    mergeRoomsById(selectedRoom, selectedRoom2);
                //
                //} else {
                //    selectedRoom = undefined;
                //    selectedRoom2 = undefined;
                //
                //    renderRoomByDefault();
                //}
                mergeRoomsById(selectedRoom, selectedRoom2);
            }
        });
    };

    function mergeRoomsById(selectedRoom1, selectedRoom2){
        require(["../js/serviceConfig.js", "../js/app/floorRoomsEditor/propertyTree.js", "dojo/domReady!"],
            function (config, tree){
            $.ajax({
                url: config.mergeRoomsById.replace("{roomId1}", selectedRoom1).replace("{roomId2}", selectedRoom2),
                dataType: 'jsonp',
                processData: false,
                cache: false,
                ifModified: true,
                type: 'GET',
                success: function (data) {
                    if(data == true){
                        //刷新地图
                        //loadFloorRooms(comp, sect, floor);
                        ////刷新铺位列表
                        //var floorStr = $("#tbl_floorlist .selected").attr("data-value");
                        //tree.loadFloorPropertyList(comp, sect, floorStr);

                        addTempMergeRoom();

                        operate = "mergeRoom";

                        setOperateBtnGroup(["cancel", "save"], ["selRoom", "cutRoom", "mergeRoom", "linkRoom", "clear"]);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('merge Room error');
                }
            });
        });
    }

    function addTempMergeRoom(){
        require([
            "../js/serviceConfig.js",
            "../js/lib/arcgis-to-geojson.js",
            "esri/symbols/SimpleFillSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/Color",
            "esri/geometry/Polygon",
            "esri/graphic",
            "esri/layers/GraphicsLayer",
            "dojo/domReady!"
        ], function (
            config, arcgisToGeojsonUtils, SimpleFillSymbol, SimpleLineSymbol, Color, Polygon, Graphic, GraphicsLayer){
            if(map._layers["tempRoomLayer"] == undefined){
                tempRoomLayer = new GraphicsLayer();
                map.addLayer(tempRoomLayer);
            }

            $.ajax({
                url: config.loadTempMergeRoomUrl.replace("{roomFatId1}", selectedRoom).replace("{roomFatId2}", selectedRoom2),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                type: 'GET',
                success: function (data) {

                    var geojsonToArcGIS = arcgisToGeojsonUtils.geojsonToArcGIS;
                    var arcgis = geojsonToArcGIS(data);

                    var polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([255,0,0]), 2),new Color([0,255,255,0.25])
                    );

                    $.each(arcgis, function(i,val){
                        var geometry0 = new Polygon(spatialReference);
                        geometry0.addRing(val.geometry.rings[0]);

                        var attr = {"roomId": val.attributes.RM_ID};
                        var graphic = new Graphic(geometry0, polygonSymbol, attr);

                        tempRoomLayer.add(graphic);
                    });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('add Temp MergeRoom error');
                }
            });
        });
    }

    function cancelMergeRoom(){
        require(["../js/serviceConfig.js"], function (config){
            $.ajax({
                url: config.cancelMergeRoom.replace("{roomId1}", selectedRoom).replace("{roomId2}", selectedRoom2),
                dataType: 'jsonp',
                processData: false,
                cache: false,
                ifModified: true,
                type: 'GET',
                success: function (data) {
                    if(data == true){
                        tempRoomLayer.clear();

                        alert("取消合并成功");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('cancel Merge Room error');
                }
            });
        });
    }

    function saveMergeRoom(){
        require(["../js/serviceConfig.js", "../js/app/floorRoomsEditor/propertyTree.js", "dojo/domReady!"],
            function (config, tree){
                $.ajax({
                    //TODO: user->loginName
                    url: config.saveMergeRoomUrl.replace("{roomId1}", selectedRoom).replace("{roomId2}", selectedRoom2).replace("{user}", "dingyh"),
                    dataType: 'jsonp',
                    processData: false,
                    cache: false,
                    ifModified: true,
                    type: 'GET',
                    success: function (data) {
                        if(data == true){
                            tempRoomLayer.clear();

                            //刷新地图
                            loadFloorRooms(comp, sect, floor);
                            //刷新铺位列表
                            var floorStr = $("#tbl_floorlist .selected").attr("data-value");
                            tree.loadFloorPropertyList(comp, sect, floorStr);

                            alert("保存合并成功");
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        console.log('save Cut Room error');
                    }
                });
            });
    }

    function hookRoom(){
        require(["../js/serviceConfig.js", "../js/app/floorRoomsEditor/propertyTree.js", "dojo/domReady!"], function (config, tree){

            var selectedProperty = $('#sel_hook option:selected').val();

            $.ajax({
                url: config.hookRoomUrl.replace("{propertyId}", selectedProperty).replace("{roomId}", selectedRoom),
                dataType: 'jsonp',
                processData: false,
                cache: false,
                ifModified: true,
                type: 'GET',
                success: function (data) {
                    if(data == true){
                        alert("挂接成功");

                        //刷新地图
                        loadFloorRooms(comp, sect, floor);
                        //刷新铺位列表
                        var floorStr = $("#tbl_floorlist .selected").attr("data-value");
                        tree.loadFloorPropertyList(comp, sect, floorStr);

                        clearOperate();
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('hook Room error');
                }
            });
        });
    }

    function setOperateBtnGroup(enables, disables){
        _.mapValues(enables, function(item) {
            var buttonId = "#btn_" + item;
            $(buttonId).removeClass("disabled");
        });

        _.mapValues(disables, function(item) {
            var buttonId = "#btn_" + item;
            $(buttonId).addClass("disabled");
        });
    }

    function cancelOperate(){
        if(operate == "cutRoom"){
            cancelCutRoom();
        } else if(operate == "mergeRoom"){
            cancelMergeRoom();
        } else if(operate == "link"){

        }

        setOperateBtnGroup(["selRoom"], ["cutRoom", "mergeRoom", "linkRoom", "cancel", "save", "clear"]);
    }

    function saveOperate(){
        if(operate == "cutRoom"){
            saveCutRoom();
        } else if(operate == "mergeRoom"){
            saveMergeRoom();
        }

        setOperateBtnGroup(["selRoom"], ["cutRoom", "mergeRoom", "linkRoom", "cancel", "save", "clear"]);
    }

    function clearOperate() {
        operate = null;

        renderRoomByDefault();

        $("#div_link").hide();

        setOperateBtnGroup(["selRoom"], ["cutRoom", "mergeRoom", "linkRoom", "cancel", "save", "clear"]);
    }

    return {
        loadBaseMap: loadBaseMap,
        loadFloorRooms: loadFloorRooms,
        loadFloorWalls: loadFloorWalls,
        loadHookSelectList: loadHookSelectList,
        selectRoom: selectRoom,
        centerToRoom: centerToRoom,
        startCutRoom: startCutRoom,
        startMergeRoom: startMergeRoom,
        hookRoom: hookRoom,
        cancelOperate: cancelOperate,
        saveOperate: saveOperate,
        clearOperate: clearOperate
    }

});