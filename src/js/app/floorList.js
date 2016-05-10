/**
 * Created by dingyh on 2015/09/15.
 */
define(['serviceConfig', 'jquery', 'lodash', 'jsrender',  'postal'],
    function (config, $, _, jsrender, postal) {

    var floorList = [];

    $("#img_bldgMode").click(function(){
        //var propId = url('?propId');
        //var pageUrl = '3dbuilding_requirejs.html'.concat('?propId=' + propId);
        //$(window.parent.document).find("#iframe_3d").attr("src", pageUrl);

        postal.publish({
            channel: "3dbuilding",
            topic: "setBldgShow",
            data: {
            }
        });
    });


    var subscription = postal.subscribe({
        channel: "3dbuilding",
        topic: "loadFloorList",
        callback: function(data, envelope) {
            bldgId = data.bldgId;
            floor = data.floor;

            loadFloorList(bldgId, floor);
        }
    });
    var subscription2 = postal.subscribe({
        channel: "3dbuilding",
        topic: "hideFloorList",
        callback: function(data, envelope) {
            $("#div_floor").hide();
        }
    });


    function loadFloorList(bldg_id, floor) {
        $("#div_floor").show();

        $.ajax({
            url: config.floorListUrl.replace('{0}', bldg_id),
            dataType: 'jsonp',
            processData: false,
            cache: true,
            ifModified: true,
            jsonpCallback: 'getFloorListCB',
            type: 'get',
            success: function (data) {
                floorList = [];
                $("#tbl_floorlist td").remove();

                var size = _.size(data);

                var numPerCol = size > 15 ? size / 2 : size;

                for (var col = 0; col < Math.ceil(size / numPerCol); col++) {
                    //var parArray = _.partition(data, function (item, index) {
                    //    return index >= numPerCol * (col) && index < numPerCol * (col + 1);
                    //});
                    var renderData = _.slice(data, numPerCol * (col), numPerCol * (col + 1));

                    //var renderData = _.sortBy(parArray[0], function (item) {
                    //    return -item.FLOOR;
                    //});
                    var template = $.templates("#btn_floor_tmpl");
                    var htmlOutput = "<td>" + template.render(renderData) + "</td>";
                    $("#tr_floorlist").append(htmlOutput);

                    floorList = _.concat(floorList, renderData);
                }

                $("#tr_floorlist input").click(function(){
                    $("#tr_floorlist input").removeClass('selected');
                    $(this).addClass('selected');
                });

                if(floor != undefined && floor != null) { //只加载单层
                    $("#tr_floorlist input[value='" + floor + "']").addClass('selected');
                } else { //加载所有楼层

                    postal.publish({
                        channel: "3dbuilding",
                        topic: "loadAllFloors",
                        data: {
                            floorList: floorList
                        }
                    });
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                cosole.log('load floor list error');
            }
        });
    }

    return {
        loadFloorList: loadFloorList
    };
});