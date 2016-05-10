//import $ from 'jquery';
//import firstName from 'profile';

require(['../js/app/floorRoomsEditor/propertyTree.js', '../js/app/floorRoomsEditor/roomEditor.js', '../js/app/mapToolBox.js', 'dojo/domReady!'],
    function (tree, roomEditor, mapToolBox) {
        var totalH = $(window).height();
        var topH = $("#div_top").height();
        var menuH = $("#div_editMenu").height();
        $("#div_center").css("height", totalH - topH);
        $("#div_map").css("height", totalH - topH - menuH);


        $("#mapToolBox img").click(function(){
           var tool = $(this).attr("id");
           mapToolBox.handle(tool);
        });

        $("#btn_preFloorPage").click(function(){
            tree.changeFloorPage(-1);
        });
        $("#btn_nextFloorPage").click(function(){
            tree.changeFloorPage(1);
        });

        $("#treeview").kendoTreeView({
            select:
                function onSelect(e) {
                    //alert("Selecting: " + this.text(e.node));
                    var comp = 'JW16', sect = '011', floor='011-01', floorInt = '1';

                    tree.loadSectFloorList(comp, sect);
                    tree.loadFloorPropertyList(comp, sect, floor);

                    roomEditor.loadFloorRooms(comp, sect, floorInt);
                    roomEditor.loadFloorWalls(comp, sect, floorInt);


                    $("#div_propertyTree").hide();
                    $("#div_propertyPanel").show();
                }
        });

        //tree.loadPropertyTree();

        roomEditor.loadBaseMap();

        $("#btn_propertySearch").click(function(){
            var word = $("#input_search").val();
            tree.filterFloorPropertyList(word);
        });

        $("#btn_selRoom").click(function(){
            roomEditor.selectRoom();
        });

        $("#btn_cutRoom").click(function(){
            roomEditor.startCutRoom();
        });

        $("#btn_mergeRoom").click(function(){
            roomEditor.startMergeRoom();
        });

        $("#btn_cancel").click(function(){
            roomEditor.cancelOperate();
        });

        $("#btn_save").click(function(){
            roomEditor.saveOperate();
        });

        $("#btn_clear").click(function(){
            roomEditor.clearOperate();
        });

        $("#btn_linkRoom").click(function(){
            //var selectedProperty = tree.getSelectedProperty();

            $("#div_link").show();
        });

        $("#btn_confirmHook").click(function(){
            roomEditor.hookRoom(selectedProperty);
        });
});