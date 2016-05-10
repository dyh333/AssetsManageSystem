/**
 * Created by dingyh on 2016/4/22.
 */
define(function () {

    function map_reset(){
        //map
    }

    function map_zoomIn(){
        var currentZoom = map.getZoom();
        map.setZoom(currentZoom + 1);
    }

    function map_zoomIn(){
        var currentZoom = map.getZoom();
        map.setZoom(currentZoom - 1);
    }

    function map_ruleDistance(){
        require(['../js/app/measure.js', 'dojo/domReady!'], function (measure) {
            measure.measureLength(map);
        });
    }

    function map_ruleArea(){

    }

    function mapHandle(tool){
        switch(tool){
            case "map_zoomIn":
                map_zoomIn();
            case "map_zoomOut":
                map_zoomOut();
            case "map_ruleDistance":
                map_ruleDistance();
            case "map_ruleArea":
                map_ruleArea();

        }
    }

    return {
        handle: mapHandle
    }
});