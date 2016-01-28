/**
 * Created by dingyh on 2015/08/27.
 */
define(['jquery', 'kendo', 'products'], function ($, kendo, prod) {
    function loadxzl() {
        var dataSource = new kendo.data.DataSource({
            data: products,
            pageSize: 4
        });

        $("#listView-xzl").kendoListView({
            dataSource: dataSource,
            template: kendo.template($("#listview-template").html())
        });
    }
    function loadjzssy() {
        var dataSource = new kendo.data.DataSource({
            data: products,
            pageSize: 2
        });

        $("#listView-jzssy").kendoListView({
            dataSource: dataSource,
            template: kendo.template($("#listview-template").html())
        });
    }

    return {
        loadxzl: loadxzl,
        loadjzssy: loadjzssy
    };
});