/**
 * Created by dingyh on 2015/09/17.
 */
define(['serviceConfig', 'jquery', 'url', 'lodash', 'postal'], function (config, $, url, _, postal) {
    var renderData;
    var renderArray = [];
    var propId = url('?propId');


    //var url = "http://58.210.9.134/zcglserver/getFloorRenderValues/{0}";
    //$.ajax({
    //    url: url.replace('{0}', propId),
    //    dataType: 'jsonp',
    //    processData: false,
    //    cache: false,
    //    ifModified: true,
    //    jsonpCallback: 'getFloorRenderCB',
    //    type: 'GET',
    //    success: function (data) {
    //        renderData = data;
    //    },
    //    error: function (XMLHttpRequest, textStatus, errorThrown) {
    //        console.log('load render data error');
    //    }
    //});

    function getRentRenerArray() {
        var min = parseFloat((_.min(renderData, function (o) {
            return parseFloat(o.RENTS);
        })).RENTS);
        var max = parseFloat((_.max(renderData, function (o) {
            return parseFloat(o.RENTS);
        })).RENTS);

        var segSize = 5; //分五段
        var segLen = (max - min) / segSize;

        renderArray = [];
        for (var b = 0; b < _.size(renderData); b++) {
            var data = renderData[b];
            for (var i = 0; i < segSize; i++) {
                if (data.RENTS <= min + (i + 1) * segLen) {
                    var obj = new Object();
                    obj.flrId = data.FLR_ID;
                    obj.seg = i;
                    renderArray.push(obj);
                    break;
                }
            }
        }

        return renderArray;
    }

    function getCapRenerArray() {
        var min = parseFloat((_.min(renderData, function (o) {
            return parseFloat(o.BUILD_AREA);
        })).BUILD_AREA);
        var max = parseFloat((_.max(renderData, function (o) {
            return parseFloat(o.BUILD_AREA);
        })).BUILD_AREA);

        var segSize = 5; //分五段
        var segLen = (max - min) / segSize;

        renderArray = [];
        for (var b = 0; b < _.size(renderData); b++) {
            var data = renderData[b];
            for (var i = 0; i < segSize; i++) {
                if (data.BUILD_AREA <= min + (i + 1) * segLen) {
                    var obj = new Object();
                    obj.flrId = data.FLR_ID;
                    obj.seg = i;
                    renderArray.push(obj);
                    break;
                }
            }
        }

        return renderArray;
    }

    function getIncomeRenerArray() {
        var min = parseFloat((_.min(renderData, function (o) {
            return parseFloat(o.RENTAL_INCOME);
        })).RENTAL_INCOME);
        var max = parseFloat((_.max(renderData, function (o) {
            return parseFloat(o.RENTAL_INCOME);
        })).RENTAL_INCOME);

        var segSize = 5; //分五段
        var segLen = (max - min) / segSize;

        renderArray = [];
        for (var b = 0; b < _.size(renderData); b++) {
            var data = renderData[b];
            for (var i = 0; i < segSize; i++) {
                if (data.RENTAL_INCOME <= min + (i + 1) * segLen) {
                    var obj = new Object();
                    obj.flrId = data.FLR_ID;
                    obj.seg = i;
                    renderArray.push(obj);
                    break;
                }
            }
        }

        return renderArray;
    }

    /**
     * 加载指定楼层的铺位面积
     */
    function loadRoomArea(bldgId, flrId){
        var deferred = $.Deferred();

        $.ajax({
            url: config.roomAreaUrl.replace('{bldgId}', bldgId).replace('{flrId}', flrId),
            dataType: 'jsonp',
            processData: false,
            cache: true,
            ifModified: true,
            jsonpCallback: 'getFloorListCB',
            type: 'get',
            success: function (data) {
                renderArray = [];

                _.each(data,  function (ele, idx) {
                    var obj = new Object();
                    obj.flrId = ele.FLR_ID;
                    obj.roomId = ele.RM_ID;
                    obj.roomArea = parseFloat(ele.ROOM_AREA);
                    renderArray.push(obj);
                });

                deferred.resolve();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('load room area error');
            }
        });

        return deferred.promise();
    }

    function getRoomAreaRenerArray() {
        var min = _.minBy(renderArray, 'roomArea').roomArea;
        var max = _.maxBy(renderArray, 'roomArea').roomArea;

        var segSize = 5; //分五段
        var segLen = (max - min) / segSize;

        _.each(renderArray,  function (ele, idx) {
            for (var i = 0; i < segSize; i++) {
                if (ele.roomArea <= min + (i + 1) * segLen) {
                    ele.seg = i;
                    break;
                }
            }
        });

        return renderArray;
    }

    return {
        getRentRenerArray: getRentRenerArray,
        getCapRenerArray: getCapRenerArray,
        getIncomeRenerArray: getIncomeRenerArray,
        loadRoomArea: loadRoomArea,
        getRoomAreaRenerArray: getRoomAreaRenerArray
    }
});