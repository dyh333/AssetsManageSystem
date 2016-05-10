/**
 * Created by dingyh on 2015/09/02.
 */
define(['serviceConfig', 'jquery', 'url'], function (config, $, url) {
    var bldgId = url('?bldgId');
    var centerX, centerY;
    var cameraX, cameraY, cameraZ;

    $.ajax({
        url: config.paramUrl.replace('{bldgId}', bldgId),
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