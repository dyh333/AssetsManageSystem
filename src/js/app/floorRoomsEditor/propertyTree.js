/**
 * Created by dingyh on 2016/4/11.
 */
define(function () {
    var numPerCol = 10;

    var loadPropertyTree_0 = function(){
        require(["../js/serviceConfig.js", "dojo/domReady!"], function (config) {
            $.ajax({
                url: config.getDMPropertyTree,
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                jsonpCallback: 'getPropertyTreeCB',
                type: 'GET',
                success: function (data) {
                    $('#div_propertyTree').treeview({
                        color: "#428bca",
                        expandIcon: 'glyphicon glyphicon-chevron-right',
                        collapseIcon: 'glyphicon glyphicon-chevron-down',
                        nodeIcon: 'glyphicon glyphicon-bookmark',
                        onNodeSelected: function(event, node) {
                            var parentNode = $('#div_propertyTree').treeview('getNode', node.parentId);
                            if(node.nodes == null){
                               //get floor list
                                loadSectFloorList(parentNode.tags, node.tags);
                            }
                        },
                        data: data
                    });

                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load property tree error');
                }
            });
        });
    };

    function loadPropertyTree(parentId){
        require(["../js/serviceConfig.js", "dojo/domReady!"], function (config) {
            var treeDataSource = new kendo.data.HierarchicalDataSource({
                transport: {
                    read: {
                        url: config.getDMPropertyTree, //.replace("{parentId}", parentId)
                        dataType: "jsonp"
                    }
                },
                schema: {
                    model: {
                        id: "id",
                        hasChildren: "hasChild"
                    }
                }
            });

            $("#treeview").kendoTreeView({
                dataSource: treeDataSource,
                dataTextField: "name",
                dataImageUrlField: "imgUrl",
                select: onSelect
            });

            function onSelect(e) {
                var dataItem = this.dataItem(e.node);
                if(dataItem.hasChild == false){
                    var comp = dataItem.children.data.id.split('.')[1];
                    var sect = dataItem.id;

                    loadSectFloorList(comp, sect);
                }

            }
        });
    }

    function loadSectFloorList(comp, sect){
        require(["../js/serviceConfig.js", "../js/app/floorRoomsEditor/roomEditor.js", "dojo/domReady!"],
            function (config, roomEditor) {
            $.ajax({
                url: config.getDMSectFloorList.replace('{comp}', comp).replace('{sect}', sect),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                jsonpCallback: 'getDMSectFloorListCB',
                type: 'GET',
                success: function (data) {
                    $("#tbl_floorlist tr").remove();

                    var size = _.size(data);
                    for (var col = 0; col < Math.ceil(size / numPerCol); col++) {
                        var parArray = _.slice(data, col * numPerCol, (col + 1) * numPerCol);
                        var renderData = _.reverse(parArray);

                        var template = $.templates("#btn_floor_tmpl");
                        var htmlOutput = "<td>" + template.render(renderData) + "</td>";
                        $("#tbl_floorlist").append("<tr style='display: none;'>" + htmlOutput + "</tr>");
                    }

                    $("#tbl_floorlist tr:first").show();


                    $("#tbl_floorlist input").click(function(){
                        $("#tbl_floorlist input").removeClass('selected');
                        $(this).addClass('selected');

                        //get floor property list
                        var floor = $(this).attr("data-value");
                        loadFloorPropertyList(comp, sect, floor);

                        //load inner room and wall
                        var floorInt = $(this).val();
                        roomEditor.loadFloorRooms(comp, sect, floorInt);
                        roomEditor.loadFloorWalls(comp, sect, floorInt);
                    });

                    //默认打开第一个楼层
                    loadFloorPropertyList(comp, sect, data[0].FLOOR);

                    roomEditor.loadFloorRooms(comp, sect, parseInt(data[0].FLOOR_INT));
                    roomEditor.loadFloorWalls(comp, sect, parseInt(data[0].FLOOR_INT));

                    $("#div_propertyTree").hide();
                    $("#div_propertyPanel").show();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load sect floor list error');
                }
            });
        });
    }

    function changeFloorPage(preOrNext){
        if(preOrNext == -1){
            if($("#tbl_floorlist tr:visible").prev().length > 0) {
                $("#tbl_floorlist tr:visible").prev().show();
                $("#tbl_floorlist tr:visible").last().hide();
            }
        } else {
            if($("#tbl_floorlist tr:visible").next().length > 0){
                $("#tbl_floorlist tr:visible").next().show();
                $("#tbl_floorlist tr:visible").first().hide();
            }
        }
    }

    function loadFloorPropertyList(comp, sect, floor){
        require(["../js/serviceConfig.js", "../js/app/floorRoomsEditor/roomEditor.js", "dojo/domReady!"],
            function (config, roomEditor) {
            $.ajax({
                url: config.getDMFloorPropertyList.replace('{comp}', comp).replace('{sect}', sect).replace('{floor}', floor),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                jsonpCallback: 'getDMFloorPropertyListCB',
                type: 'GET',
                success: function (data) {

                    $("#tbody_property_list tr").remove();

                    var template = $.templates("#tbl_property_tmpl");
                    var htmlOutput = template.render(data);
                    $("#tbody_property_list").append(htmlOutput);

                    $("#tbody_property_list tr").click(function(){
                        var selectedProperty = $(this).attr("data-value");

                        //地图定位
                        roomEditor.centerToRoom(selectedProperty);


                        $('#div_selIcon').css({ "position": "absolute", "left": -5, "top": $(this).position().top});
                    });

                    //渲染挂接下拉菜单
                    roomEditor.loadHookSelectList(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load floor property list error');
                }
            });
        });
    }

    function filterFloorPropertyList(word){
        $("#tbody_property_list > tr").each(function() {
            var propertyName = $(this).find("td:last").text();
            if (propertyName.indexOf(word) >= 0) {
                $(this).show();
            } else {
                $(this).hide();
            }

            //$(this).hide();
        });
    }

   return {
       loadPropertyTree: loadPropertyTree,
       loadSectFloorList: loadSectFloorList,
       changeFloorPage: changeFloorPage,
       loadFloorPropertyList: loadFloorPropertyList,
       filterFloorPropertyList: filterFloorPropertyList
   }

});