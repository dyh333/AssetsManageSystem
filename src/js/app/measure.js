/**
 * Created by sl on 2016/2/14.
 */
define(function () {
    var measureGraphicLayer,measureToolbar,showPt,symbol;
    //面积测量
    var startMeasureArea=function(map) {
        startMeasure(map,'polygon');
    };

    //距离测量
    var startMeasureLength=function(map) {
        startMeasure(map,'polyline');
    };

    var startMeasure=function(map,mType) {
        require([
            'esri/toolbars/draw',
            'esri/layers/GraphicsLayer',
            'esri/symbols/SimpleLineSymbol',
            'esri/symbols/SimpleFillSymbol',
            'esri/graphic',
            'esri/Color',
            'esri/geometry/Point',
        ], function (Draw, GraphicsLayer, SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, Point) {
            //判断图层是否存在，然后移除置顶
            measureGraphicLayer = map.getLayer('measureGraphicLayer');
            if (typeof(measureGraphicLayer) != 'undefined') {
                map.removeLayer(measureGraphicLayer);
            }
            measureGraphicLayer = new GraphicsLayer({id: 'measureGraphicLayer'});
            map.addLayer(measureGraphicLayer);
            //初始化绘图工具
            measureToolbar = new Draw(map, {
                tooltipOffset: 20,
                drawTime: 90
            });
            measureToolbar.deactivate();
            map.setMapCursor("default");
            switch (mType) {
                case "polyline":
                    measureToolbar.activate(Draw.POLYLINE);
                    symbol = new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([253, 128, 68]), 3);
                    break;
                case "polygon":
                    measureToolbar.activate(Draw.POLYGON);
                    var symbolLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([253, 128, 68]), 2);
                    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, symbolLineSymbol, new Color([0, 255, 123, 0.4]));
                    break;
                default:
                    break;
            }
            //绑定事件
            measureToolbar.on("draw-end", function (evt) {
                //取消事件
                measureToolbar.deactivate();
                var geometry = evt.geometry;
                var graphic = new Graphic(geometry, symbol);
                measureGraphicLayer.add(graphic);

                var pointLength;
                //计算距离
                if (geometry.type === "polyline") {
                    pointLength = geometry.paths[0].length;
                    showPt = new Point(geometry.paths[0][pointLength - 1], map.spatialReference);
                    var length = measureLength(geometry.paths[0]);
                    measureInfo(showPt, length, "米", map);
                }

                if (geometry.type === "polygon") {
                    pointLength = geometry.rings[0].length;
                    showPt = new Point(geometry.rings[0][pointLength - 1], map.spatialReference);
                    //showPt = geometry.getCentroid();
                    var area = measureArea(geometry.rings[0]);
                    measureInfo(showPt, area, "平方米", map);
                }
            });
        });
    };

    var measureLength = function(paths) {
        var length = 0;
        var firstPoint = paths[0];
        for (var i = 0; i < paths.length; ++i) {
            var xLength = Math.pow(Math.abs(paths[i][0] - firstPoint[0]), 2);
            var yLength = Math.pow(Math.abs(paths[i][1] - firstPoint[1]), 2);
            length = length + parseFloat(Math.sqrt(xLength + yLength).toFixed(2));
        }
        return length.toFixed(2);
    };

    var measureArea = function(rings) {
        var length = rings.length;
        var s = 0;
        var area;
        for (var i=0; i<length; ++i) {
            var j = (i + 1) % length;
            s+= (rings[i][0] * rings[j][1] - rings[i][1] * rings[j][0]);
        }

        area =Math.abs(s/2);
        return parseFloat(area.toFixed(2));
    };

    /**
     * 显示测量结果
     * @param showPnt
     * @param data
     * @param unit
     * @param map
     */
    var measureInfo = function(showPnt,data,unit,map) {
        if ($('#measure').length ===0)
            $('body').append('<div id="measure" class="floatDom"><span id="result" class="measureResult"></span><a id="infoClose" class="measureInfoClose" href="javascript:void(0)">×</a></div>');
        var measureDiv = $("#measure");
        var isShow = false;
        var screenPnt = map.toScreen(showPnt);
        measureDiv.css("left", (screenPnt.x + 0) + "px");
        measureDiv.css("top", (screenPnt.y + 0) + "px");
        measureDiv.css("position", "absolute");
        measureDiv.css("height", "25px");
        measureDiv.css("line-height", "25px");
        measureDiv.css("display", "block");
        isShow = true;
        measureDiv.css("z-index", "999");
        if (unit === "千米") {
            measureDiv.css("width", "90px");
        } else {
            measureDiv.css("width", "130px");
        }

        $("#result").html(data + unit);
        $("#infoClose").one("click", function (e) {
            measureDiv.css("display", "none");
            isShow = false;
            measureToolbar.deactivate();
            //删除绑定的Graphic
            measureGraphicLayer.clear();
        });

        map.on("pan-start", function () {
            measureDiv.css("display", "none");
        });

        map.on("pan-end", function (panend) {
            if (isShow == true) {
                screenPnt = map.toScreen(showPnt);
                measureDiv.css("left", screenPnt.x + "px");
                measureDiv.css("top", screenPnt.y + "px");
                measureDiv.css("display", "block");
            }
        });

        map.on("zoom-start", function () {
            measureDiv.css("display", "none");
        });

        map.on("zoom-end", function () {
            if (isShow == true) {
                screenPnt = map.toScreen(showPnt);
                measureDiv.css("left", screenPnt.x + 0 + "px");
                measureDiv.css("top", screenPnt.y + 0 + "px");
                measureDiv.css("display", "block");
            }
        });
    };

    return {
        measureArea: function (map) {
            startMeasureArea(map);
        },
        measureLength: function (map) {
            startMeasureLength(map);
        }
    };
});