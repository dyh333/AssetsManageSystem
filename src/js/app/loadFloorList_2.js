/**
 * Created by dingyh on 2015/09/15.
 */
define(['jquery', 'url', 'underscore', 'jsrender',  'postal', 'amplify', 'loadInnerroom'], function ($, url, _, jsrender, postal, amplify, loadInnerroom) {

    $("#img_bldgMode").click(function(){
        var propId = url('?propId');
        var pageUrl = '3dbuilding_requirejs.html'.concat('?propId=' + propId);
        $(window.parent.document).find("#iframe_3d").attr("src", pageUrl);
    });

    var floorListUrl = "http://58.210.9.134/zcglserver/getFloorList/{0}";

    var subscription = postal.subscribe({
        channel: "3dbuilding",
        topic: "loadFloorList",
        callback: function(data, envelope) {
            bldgId = data.bldgId;
            floor = data.floor;

            loadFloorList(bldgId, floor);
        }
    });


    function loadFloorList(bldg_id, floor) {
        //var bldg_id = url('?bldgId');
        //var floor = url('?floor');

        $.ajax({
            //TODO： use format lib
            url: floorListUrl.replace('{0}', bldg_id),
            dataType: 'jsonp',
            processData: false,
            type: 'get',
            success: function (data) {
                var size = _.size(data);

                var numPerCol = size > 15 ? size / 2 : size;

                for (var col = 0; col < (size / numPerCol + 1); col++) {
                    var parArray = _.partition(data, function (item, index) {
                        return index >= numPerCol * (col) && index < numPerCol * (col + 1);
                    });

                    var renderData = _.sortBy(parArray[0], function (item) {
                        return -item.FLOOR;
                    });
                    var template = $.templates("#btn_floor_tmpl");
                    var htmlOutput = "<td>" + template.render(renderData) + "</td>";
                    $("#tr_floorlist").append(htmlOutput);
                }

                $("#tr_floorlist input[value='" + floor + "']").addClass('selected');

                $("#tr_floorlist input").click(function(){
                    $("#tr_floorlist input").removeClass('selected');
                    $(this).addClass('selected');

                    loadInnerroom.loadObj($(this).val());
                });
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