//import $ from 'jquery';
//import firstName from 'profile';

require(['../js/app/floorRoomsEditor/propertyTree.js', '../js/app/floorRoomsEditor/roomEditor.js', 'dojo/domReady!'],
    function (tree, roomEditor) {
        var totalH = $(window).height();
        var topH = $("#div_top").height();
        var menuH = $("#div_editMenu").height();
        $("#div_center").css("height", totalH - topH);
        $("#div_map").css("height", totalH - topH - menuH);

        tree.loadPropertyTree();

        roomEditor.loadBaseMap();


        $("#btn_selRoom").click(function(){
            selectedRoom = roomEditor.selectRoom();
        });

        $("#btn_cutRoom").click(function(){
            roomEditor.startCutRoom();
        });

        $("#btn_mergeRoom").click(function(){
            roomEditor.startMergeRoom();
        });

        $("#btn_cancelCut").click(function(){
            roomEditor.cancelCutRoom();
        });

        $("#btn_saveCut").click(function(){
            roomEditor.saveCutRoom();
        });

        $("#btn_hookRoom").click(function(){
            var selectedProperty = tree.getSelectedProperty();
            roomEditor.hookRoom(selectedProperty);
        });
});