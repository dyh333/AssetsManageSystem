/**
 * Created by dingyh on 2015/09/02.
 */
define(['jquery', 'url'], function ($, url) {
    var propId = url('?propId');
    var centerX, centerY;
    var cameraX, cameraY, cameraZ;

    var paramUrl = "http://58.210.9.134/zcglserver/getInitParam/{0}";
    $.ajax({
        url: paramUrl.replace('{0}', propId),
        dataType: 'jsonp',
        processData: false,
        type: 'get',
        success: function (data) {
            centerX = data.CENTERX;
            centerY = data.CENTERY;
            cameraX = data.CAMERAX;
            cameraY = data.CAMERAY;
            cameraZ = data.CAMERAZ;

            return data;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            cosole.log('load init param error');
        }
    });

    function loadInitParam() {

        $.ajax({
            url: paramUrl.replace('{0}', propId),
            dataType: 'jsonp',
            processData: false,
            cache: false,
            ifModified: true,
            jsonpCallback: 'getInitParamCB',
            type: 'GET',
            success: function (data) {
                centerX = data.CENTERX;
                centerY = data.CENTERY;
                cameraX = data.CAMERAX;
                cameraY = data.CAMERAY;
                cameraZ = data.CAMERAZ;

                return data;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                cosole.log('load init param error');
            }
        });
    }

    function getCenter() {
        return [centerX, centerY];
    }

    function getCamera() {
        return [cameraX, cameraY, cameraZ];
    }

    return {
        getCenter: getCenter,
        getCamera: getCamera
    };
});