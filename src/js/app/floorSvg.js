/**
 * Created by dingyh on 2015/09/15.
 */
define(['serviceConfig', 'jquery', 'd3', 'lodash', 'postal'],
    function (config, $, d3, _, postal) {

        var w = 1000;
        var h = 600;
        var proj = d3.geo.mercator();
        var path = d3.geo.path().projection(proj);
        var t = proj.translate(); // the projection's default translation
        var s = proj.scale(); // the projection's default scale

        var map = d3.select("#vis").append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .call(d3.behavior.zoom().on("zoom", redraw));

        var axes = map.append("svg:g").attr("id", "axes");

        var xAxis = axes.append("svg:line")
            .attr("x1", t[0])
            .attr("y1", 0)
            .attr("x2", t[0])
            .attr("y2", h);

        var yAxis = axes.append("svg:line")
            .attr("x1", 0)
            .attr("y1", t[1])
            .attr("x2", w)
            .attr("y2", t[1]);

        var uk = map.append("svg:g").attr("id", "uk");

        d3.json("../data/uk.json", function (json) {
            uk.selectAll("path1")
                .data(json.features)
                .enter().append("svg:path")
                .attr("d", path);
        });
        //var flrId = 'A41AB56E-CCD8-4D54-8C3B-23013BDF1B7F';
        //d3.json("http://localhost:51596/getFloorRooms/{flrId}".replace('{flrId}', flrId), function (json) {
        //    uk.selectAll("path")
        //        .data(json.features)
        //        .enter().append("svg:path")
        //        .attr("d", path);
        //});


        function redraw() {
            // d3.event.translate (an array) stores the current translation from the parent SVG element
            // t (an array) stores the projection's default translation
            // we add the x and y vales in each array to determine the projection's new translation
            var tx = t[0] * d3.event.scale + d3.event.translate[0];
            var ty = t[1] * d3.event.scale + d3.event.translate[1];
            proj.translate([tx, ty]);

            // now we determine the projection's new scale, but there's a problem:
            // the map doesn't 'zoom onto the mouse point'
            proj.scale(s * d3.event.scale);

            // redraw the map
            uk.selectAll("path").attr("d", path);

            // redraw the x axis
            xAxis.attr("x1", tx).attr("x2", tx);

            // redraw the y axis
            yAxis.attr("y1", ty).attr("y2", ty);


            //redraw line
            var line =  map.select("path.line");
            line.attr("d", path);
        }



        /*********** draw line test ************/

        var points = d3.range(1, 5).map(function(i) {
            return [i * w / 5, 50 + Math.random() * (h - 100)];
        });

        var dragged = null,
            selected = points[0];

        var line = d3.svg.line();

        map.append("rect")
            .attr("width", w)
            .attr("height", h)
            .on("mousedown", mousedown);

        map.append("path")
            .datum(points)
            .attr("class", "line")
            .call(redraw2);

        d3.select(window)
            .on("mousemove", mousemove)
            .on("mouseup", mouseup)
            .on("keydown", keydown);

        //map.node().focus();

        function redraw2() {
            map.select("path.line").attr("d", line);

            var circle = map.selectAll("circle")
                .data(points, function(d) { return d; });

            circle.enter().append("circle")
                .attr("r", 1e-6)
                .on("mousedown", function(d) { selected = dragged = d; redraw2(); })
                .transition()
                .duration(750)
                .ease("elastic")
                .attr("r", 6.5);

            circle
                .classed("selected", function(d) { return d === selected; })
                .attr("cx", function(d) { return d[0]; })
                .attr("cy", function(d) { return d[1]; });

            circle.exit().remove();

            //if (d3.event) {
            //    d3.event.preventDefault();
            //    d3.event.stopPropagation();
            //}
        }

        function change() {
            line.interpolate(this.value);
            redraw2();
        }

        function mousedown() {
            points.push(selected = dragged = d3.mouse(map.node()));
            redraw2();
        }

        function mousemove() {
            if (!dragged) return;
            var m = d3.mouse(map.node());
            dragged[0] = Math.max(0, Math.min(w, m[0]));
            dragged[1] = Math.max(0, Math.min(h, m[1]));
            redraw2();
        }

        function mouseup() {
            if (!dragged) return;
            mousemove();
            dragged = null;
        }

        function keydown() {
            if (!selected) return;
            switch (d3.event.keyCode) {
                case 8: // backspace
                case 46: { // delete
                    var i = points.indexOf(selected);
                    points.splice(i, 1);
                    selected = points.length ? points[i > 0 ? i - 1 : 0] : null;
                    redraw2();
                    break;
                }
            }
        }
});