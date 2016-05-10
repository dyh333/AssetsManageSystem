/**
 * Created by dingyh on 2015/08/29.
 */
define(['jquery', 'jsrender', 'underscore', 'showMap'], function ($, jsrender, _, showMap) {
    var holdTypeJson, propTypeJson;
    var selHoldType = 'all';
    var selPropType = 'all';
    var groupBy = 'byType';

    //加载公司列表
    var holdTypesUrl = "http://58.210.9.134/zcglserver/getAllHoldType";
    //加载业态类型列表
    var propTypesUrl = "http://58.210.9.134/zcglserver/getAllPropType";
    var propsUrl = "http://58.210.9.134/zcglserver/getProps/{0}/{1}";

    loadHoldTypes();

    loadPropTypes();

    addMousedownEvent("#ul_groupby");

    addMousedownEvent("#ul_mode");

    function loadHoldTypes() {
        $.ajax({
            url: holdTypesUrl,
            dataType: 'jsonp',
            processData: false,
            type: 'get',
            success: function (data) {
                holdTypeJson = data;
                var template = $.templates("#li_type_tmpl");
                var htmlOutput = template.render(holdTypeJson);
                $("#ul_holdtype").append(htmlOutput);

                addMousedownEvent("#ul_holdtype");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                cosole.log('load hold type error');
            }
        });
    }

    function loadPropTypes() {
        $.ajax({
            url: propTypesUrl,
            dataType: 'jsonp',
            processData: false,
            type: 'get',
            success: function (data) {
                propTypeJson = data;
                var template = $.templates("#li_type_tmpl");
                var htmlOutput = template.render(propTypeJson);
                $("#ul_proptype").append(htmlOutput);

                addMousedownEvent("#ul_proptype");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                cosole.log('load prop type error');
            }
        });
    }

    function addMousedownEvent(ul_id) {
        $(ul_id).find('li').mousedown(function () {
            if (ul_id === '#ul_holdtype') {
                selHoldType = $(this).attr('value');
                if(selHoldType == undefined){
                    return;
                }
            } else if (ul_id === '#ul_proptype') {
                selPropType = $(this).attr('value');
                if(selPropType == undefined){
                    return;
                }
            } else if (ul_id === '#ul_groupby') {
                groupBy = $(this).attr('value');
            } else if (ul_id === '#ul_mode') {
                if( $(this).attr('value') == 'byList'){
                    $("#div_center").show();
                    $("#div_map").hide();
                } else {
                    $("#div_center").hide();
                    $("#div_map").show();
                }
            }

            $(ul_id).find('li').removeClass('selected');
            $(this).addClass('selected');

            //根据选中的类型加载项目
            loadProps();
        });
    }

    function loadProps() {
        //$("#div_center").css('overflowY', 'auto');

        $.ajax({
            url: propsUrl.replace('{0}', selHoldType).replace('{1}', selPropType),
            dataType: 'jsonp',
            processData: false,
            type: 'get',
            success: function (data) {
                $("#div_center").empty();
                if (groupBy == 'byRight') {
                    showByRightGroup(data);
                } else if (groupBy == 'byType') {
                    showByTypeGroup(data);
                }

                $("#h5_propNums strong").text(data.length);

                $('#div_center').find('.product').click(function () {
                    var propId = $(this).find('p').text();
                    window.open('../webs/propdetail_requirejs.html?propId=' + propId, "_blank");
                });

                //todo 改成事件通知
                showMap.loadProps(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                cosole.log('load props error');
            }
        });
    }

    //按集团类型分组
    function showByRightGroup(data) {
        var groupedData = _.groupBy(data, function (d) {
            return d.PROP_RIGHT_CODE
        });

        $.each(holdTypeJson, function (key, value) {
            var data = groupedData[value.CODE];

            if (data != undefined) {
                //构造数据
                var renderData = new Object();
                renderData.propTypeName = value.NAME;
                renderData.propMembers = data;

                var template = $.templates("#row_prop_tmpl");
                var htmlOutput = template.render(renderData);
                $("#div_center").append(htmlOutput);
            }
        });
    }

    //按业态类型分组
    function showByTypeGroup(data) {
        var groupedData = _.groupBy(data, function (d) {
            return d.PROP_TYPE_CODE
        });

        $.each(propTypeJson, function (key, value) {
            var data = groupedData[value.CODE];

            if (data != undefined) {
                //构造数据
                var renderData = new Object();
                renderData.propTypeName = value.NAME;
                renderData.propMembers = data;

                var template = $.templates("#row_prop_tmpl");
                var htmlOutput = template.render(renderData);
                $("#div_center").append(htmlOutput);
            }
        });
    }

    function getSelHoldType() {
        return selHoldType;
    }

    function getSelPropType() {
        return selPropType;
    }

    return {
        loadProps: loadProps,
        getSelHoldType: getSelHoldType,
        getSelPropType: getSelPropType
    };
});