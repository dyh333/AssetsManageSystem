/**
 * Created by dingyh on 2015/09/15.
 */
define(['serviceConfig', 'jquery', 'lodash', 'terraformer', 'terraformer_wkt_parser', 'postal'],
    function (config, $, _, terraformer, terraformer_wkt_parser, postal) {

    function loadFloor(flrId, center){
        $.ajax({
            url: config.floorRoomsUrl.replace('{flrId}', flrId),
            dataType: 'jsonp',
            processData: false,
            cache: true,
            ifModified: true,
            //jsonpCallback: 'getFloorRoomsCB',
            type: 'GET',
            success: function (data) {
                _.each(data,  function (ele, idx) {
                    var geoPoly = Terraformer.WKT.parse(ele.Shape);
                    if (geoPoly.type === 'Polygon') {
                        baseGeo = []; //建筑基底

                        _.each(geoPoly.coordinates[0],  function (ele1, idx1) {
                            ele1[0] = ele1[0] - center[0];
                            ele1[1] = ele1[1] - center[1];

                            baseGeo.push([ele1[0], ele1[1]]);
                        });
                    } else if (geoPoly.type === 'MultiPolygon') {
                        _.each(geoPoly.coordinates,  function (ele1, idx1) {
                            baseGeo = []; //建筑基底

                            var coordinates = ele1[0];
                            _.each(coordinates,  function (ele2, idx2) {
                                ele2[0] = ele2[0] - center[0];
                                ele2[1] = ele2[1] - center[1];

                                baseGeo.push([ele1[0], ele1[1]]);
                            });
                        });
                    }

                    //draw canvas
                    drawFloorRooms(baseGeo);
                });


            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('load floor room error');
            }
        });
    }

    function drawFloorRooms(baseGeo){
        //var c2 = document.getElementById('canvas').getContext('2d');
        //c2.fillStyle = '#f00';
        //c2.beginPath();
        //c2.moveTo(0, 0);
        //
        //_.each(baseGeo,  function (ele, idx) {
        //    c2.lineTo(ele[0], ele[1]);
        //});
        //
        ////c2.scale(1.1, 1.1);
        //c2.closePath();
        //c2.fill();




        var c=document.getElementById("canvas");
        var ctx=c.getContext("2d");
        ctx.strokeRect(5,5,25,15);
        ctx.scale(2,2);
    }

    return {
        loadFloor: loadFloor
    };
});