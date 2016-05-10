/**
 * Created by dingyh on 2015/09/02.
 */
define(['serviceConfig', 'jquery', 'url'], function (config, $, url) {
    var propId = url('?propId');
    var centerX, centerY;
    var cameraX, cameraY, cameraZ;

    $.ajax({
        url: config.initParamUrl.replace('{propId}', propId),
        dataType: 'jsonp',
        processData: false,
        cache: true,
        ifModified: true,
        jsonpCallback: 'getInitParamCB',
        success: function (data) {
            centerX = data.CENTERX;
            centerY = data.CENTERY;
            cameraX = data.CAMERAX;
            cameraY = data.CAMERAY;
            cameraZ = data.CAMERAZ;

            return data;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('load init param error');
        }
    });

    function queryCenter(){
        var deferred = $.Deferred();

        $.ajax({
            url: config.initParamUrl.replace('{propId}', propId),
            dataType: 'jsonp',
            processData: false,
            cache: true,
            ifModified: true,
            //jsonpCallback: 'getInitParamCB',
            success: function (data) {
                centerX = data.CENTERX;
                centerY = data.CENTERY;
                cameraX = data.CAMERAX;
                cameraY = data.CAMERAY;
                cameraZ = data.CAMERAZ;

                deferred.resolve();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('load init param error');
            }
        });

        return deferred.promise();
    }


    function getCenter() {
        return [centerX, centerY];
    }

    function getCamera() {
        return [cameraX, cameraY, cameraZ];
    }

    return {
        queryCenter: queryCenter,
        getCenter: getCenter,
        getCamera: getCamera
    };
});