/**
 * Created by dingyh on 2015/09/17.
 */
define(['jquery', 'url', 'underscore', 'postal', 'amplify'], function ($, url, _, postal, amplify) {
    var renderData;
    var renderArray = [];
    var propId = url('?propId');


    //amplify.subscribe( "nodataexample", function() {
    //    alert( "nodataexample topic published!" );
    //});
    //var channel = postal.channel("custom");
    //$('#btnRotate').click(function(){
    //    channel.publish( "name.change", { name: "Dr. Who" } );
    //    //amplify.publish( "nodataexample" );
    //})

    var url = "http://58.210.9.134/zcglserver/getFloorRenderValues/{0}";
    $.ajax({
        url: url.replace('{0}', propId),
        dataType: 'jsonp',
        processData: false,
        cache: false,
        ifModified: true,
        jsonpCallback: 'getFloorRenderCB',
        type: 'GET',
        success: function (data) {
            renderData = data;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            cosole.log('load render data error');
        }
    });

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

    return {
        getRentRenerArray: getRentRenerArray,
        getCapRenerArray: getCapRenerArray,
        getIncomeRenerArray: getIncomeRenerArray
    }
});