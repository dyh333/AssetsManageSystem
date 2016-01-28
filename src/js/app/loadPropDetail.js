/**
 * Created by dingyh on 2015/09/01.
 */
define(['jquery', 'url', 'jsrender', 'underscore', 'postal', 'amplify'], function ($, url, jsrender, _, postal, amplify) {
    var propId = url('?propId');

    $('#btnRotate').click(function(){
        $("#iframe_3d").contents().find('#btnRotate').click();
    });




    refresh3DPage();
    loadPropById();
    loadRentCompany();

    function loadPropById() {
        var propUrl = "http://58.210.9.134/zcglserver/getProp/{0}";
        $.ajax({
            url: propUrl.replace('{0}', propId),
            dataType: 'jsonp',
            processData: false,
            type: 'get',
            success: function (data) {
                var titleTmp = $.templates("#ul_prop_tmpl");
                var titleHtml = titleTmp.render(data);
                $("#div_prop_title").html(titleHtml);

                var detailTmp = $.templates("#panel_prop_tmpl");
                var detailHtml = detailTmp.render(data);
                $("#div_prop_detail").html(detailHtml);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                cosole.log('load prop error');
            }
        });
    }

    function refresh3DPage() {
        var pageUrl = '3dbuilding_requirejs.html?propId='+ propId;
        $("#iframe_3d").attr("src", pageUrl);
    }

    function loadRentCompany(){
        $.ajax({
            url: '../data/rent_company.json',
            dataType: 'json',
            processData: false,
            type: 'get',
            success: function (data) {
                var template = $.templates("#panel_rent_tmpl");
                var htmlOutput = template.render(data);
                $("#tbody_rent_companies").append(htmlOutput);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                cosole.log('load rent company error');
            }
        });
    }

    function loadIncomeIndex(){
        $.ajax({
            url: '../data/rent_stats.json',
            dataType: 'json',
            processData: false,
            type: 'get',
            success: function (data) {
                var template = $.templates("#panel_income_tmpl");
                var htmlOutput = template.render(data);
                $("#tbody_rent_companies").append(htmlOutput);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                cosole.log('load income index error');
            }
        });
    }
});