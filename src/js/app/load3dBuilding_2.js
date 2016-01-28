/**
 * Created by dingyh on 2015/09/01.
 */
define(['jquery', 'three', 'orbitControls', 'objloader', 'terraformer', 'terraformer_wkt_parser', 'postal', 'amplify', 'loadInitParam'],
    function ($, three, orbitControls, objloader, terraformer, terraformer_wkt_parser, postal, amplify, loadInitParam) {
        var webGLRenderer, scene, camera;
        var propId;

        var boundaryLineUrl = "http://58.210.9.134/zcglserver/getBoundaryLine/{0}";
        var floorsUrl = "http://58.210.9.134/zcglserver/getFloors/{0}";
        var textNoteUrl = "http://58.210.9.134/zcglserver/getTextNotes/{0}";

        var bldgCenterArray = [];
        var colorBar = [0x24C01E, 0xD5F603, 0xFFE902, 0xFFA513, 0xF7582B];

        var clock = new THREE.Clock();
        var trackballControls, orbitControls;
        var mouse = new THREE.Vector2();
        var step = 0;
        var autoRotation;

        var baseGeo;
        var group = new THREE.Group(),
            frameGroup = new THREE.Group(),
            boundaryGroup = new THREE.Group(),
            textNoteGroup = new THREE.Group();

        var intersected;

        function loadBldgs(_webGLRenderer, _scene, _camera, _propId) {
            webGLRenderer = _webGLRenderer;
            scene = _scene;
            camera = _camera;
            propId = _propId;

            addAxes(scene);

            //addGridHelper();

            //readBoundary();

            readFloors(scene);

            readTextNotes(scene);

            //addOrbitControl();

//        addTrackControl();

            //addMouseEvent();

            render(webGLRenderer, scene, camera);
            //webGLRenderer.render(scene, camera);

            // add the output of the renderer to the html element
            document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);
        }

        function addAxes(scene) {
            var axes = new THREE.AxisHelper(200);
            scene.add(axes);
        }

        function addGridHelper(scene) {
            var gridHelper = new THREE.GridHelper(500, 40); // 500 is grid size, 20 is grid step
            var material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1
            });
            gridHelper.material = material;
            gridHelper.position = new THREE.Vector3(0, 0, 0);
            gridHelper.rotation = new THREE.Euler(0, 0, 0);
            scene.add(gridHelper);
        }

        function readBoundary() {
            boundaryGroup.name = 'boundaryGroup';

            $.ajax({
                url: boundaryLineUrl.replace('{0}', propId),
                dataType: 'jsonp',
                processData: false,
                type: 'get',
                success: function (data) {
                    var data = data[0];
                    var geoPoly = Terraformer.WKT.parse(data.Shape);

                    if (geoPoly.type === 'Polygon') {
                        baseGeo = []; //建筑基底

                        $.each(geoPoly.coordinates[0], function (key1, val1) {
                            val1[0] = val1[0] - center[0];
                            val1[1] = val1[1] - center[1];

                            var vector2 = new THREE.Vector2(val1[0], val1[1]);
                            baseGeo.push(vector2);
                        });

                        addBoundaryPanel(baseGeo, data);
                    } else if (geoPoly.type === 'MultiPolygon') {
                        //TODO
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    cosole.log('load boundary line error');
                }
            });

            boundaryGroup.rotation.x = THREE.Math.degToRad(-90);
            scene.add(boundaryGroup);
        }

        /*
        加载建筑模型
         */
        function readFloors(scene) {
            group.name = 'buildGroup';
            frameGroup.name = 'frameGroup';

            $.ajax({
                url: floorsUrl.replace('{0}', propId),
                dataType: 'jsonp',
                processData: false,
                type: 'get',
                success: function (data) {
                    $.each(data, function (key, val) {
                        var center = loadInitParam.getCenter();
                        var geoPoly = Terraformer.WKT.parse(val.Shape);

                        if (geoPoly.type === 'Polygon') {
                            baseGeo = []; //建筑基底

                            $.each(geoPoly.coordinates[0], function (key1, val1) {
                                val1[0] = val1[0] - center[0];
                                val1[1] = val1[1] - center[1];

                                var vector2 = new THREE.Vector2(val1[0], val1[1]);
                                baseGeo.push(vector2);
                            });

                            createBuild3D(baseGeo, val);
                        }
                        else if (geoPoly.type === 'MultiPolygon') {
                            $.each(geoPoly.coordinates, function (key1, val1) {
                                baseGeo = []; //建筑基底

                                var coordinates = val1[0];
                                $.each(coordinates, function (key2, val2) {
                                    val2[0] = val2[0] - center[0];
                                    val2[1] = val2[1] - center[1];

                                    var vector2 = new THREE.Vector2(val2[0], val2[1]);
                                    baseGeo.push(vector2);
                                });

                                createBuild3D(baseGeo, val);
                            });
                        }
                    });

                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    cosole.log('load floors error');
                }
            });


            group.rotation.x = THREE.Math.degToRad(-90);
            frameGroup.rotation.x = THREE.Math.degToRad(-90);
            scene.add(group);
            scene.add(frameGroup);
        }


        function addBoundaryPanel(baseGeo, val) {
            var shape = new THREE.Shape(baseGeo);

            //var boundaryPanel = new THREE.ShapeGeometry(shape);
            var options = {
                amount: 0.3,
                bevelEnabled: false
            };
            var boundaryPanel = new THREE.ExtrudeGeometry(shape, options);

            var meshMaterial =
                new THREE.MeshLambertMaterial({
                    color: 0x000000,
                    wireframe: false,
                    overdraw: true,
                    needsUpdate: true,
                    transparent: true,
                    opacity: 0.1
                });
            meshMaterial.side = THREE.DoubleSide;

            var mesh = new THREE.Mesh(boundaryPanel, meshMaterial);
            //mesh.userData = val;

            mesh.position.z = 0.15;
            boundaryGroup.add(mesh);
        }

        function createBuild3D(baseGeo, val) {
            var shape = new THREE.Shape(baseGeo);
            var height = val.HEIGHT;

            //TOOD: val不要把shape带过去
            var build3D = createMesh(shape, height, val);
            // 绘制建筑物
            addBuildToGroup(build3D);
            // 绘制外轮廓
            addFrameToGroup(build3D);
        }

        function createMesh(shape, height, properties) {
            var options = {
                amount: height,
                bevelEnabled: false
            };

            var geom = new THREE.ExtrudeGeometry(shape, options);
            var meshMaterial =
                new THREE.MeshLambertMaterial({
                    color: 0xFFffff,
                    wireframe: false,
                    overdraw: true,
                    needsUpdate: true,
                    transparent: true,
                    opacity: 0.9
                });
            meshMaterial.side = THREE.DoubleSide;

            var mesh = new THREE.Mesh(geom, meshMaterial);
            mesh.matrixWorldNeedsUpdate = true;

            var meshUserData = new Object();
            meshUserData.shape = shape;
            meshUserData.height = height;
            meshUserData.properties = properties;
            mesh.userData = meshUserData;
            return mesh;
        }

        function addBuildToGroup(build3D) {
            var baseHeight = build3D.userData.properties.BASE_HEIGHT;
            build3D.position.z = baseHeight;

            group.add(build3D);
        }

        function addFrameToGroup(build3D) {
            var baseHeight = build3D.userData.properties.BASE_HEIGHT;
            build3D.position.z = baseHeight;

            var material = new THREE.LineBasicMaterial({
                color: 0xffffff
            });

            var geometry = new THREE.Geometry();
            var p0;
            $.each(build3D.geometry.vertices, function (key, val) {
                if (val.z == 0) {
                    var point = new THREE.Vector3(val.x, val.y, baseHeight);
                    geometry.vertices.push(point);

                    if (p0 == undefined) {
                        p0 = point;
                    }
                }
            });

            geometry.vertices.push(p0);
            var line = new THREE.Line(geometry, material, THREE.LineStrip);
            frameGroup.add(line);
        }

        /*
         加载建筑文字注记
         */
        function readTextNotes(scene) {
            textNoteGroup.name = 'textNoteGroup';

            $.ajax({
                url: textNoteUrl.replace('{0}', propId),
                dataType: 'jsonp',
                processData: false,
                type: 'get',
                success: function (data) {
                    var center = loadInitParam.getCenter();
                    $.each(data, function (key, val) {
                        var h = 20;
                        var x = val.CENTERX - center[0];
                        var y = val.CENTERY - center[1];
                        var z = parseFloat(val.HEIGHT) + h;

                        var obj = new Object();
                        obj.bldgId = val.BLDG_ID;
                        obj.center = [val.CENTERX, val.CENTERY];
                        bldgCenterArray.push(obj);

                        addTextNoteToGroup(val.CONS_NUM, x, y, z);

                    });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    cosole.log('load text note error');
                }
            });

            textNoteGroup.rotation.x = THREE.Math.degToRad(-90);
            scene.add(textNoteGroup);
        }

        function addTextNoteToGroup(text, x, y, z) {
            var c = document.createElement('canvas');
            c.width = 300;
            c.height = 100;

            var ctx = c.getContext('2d');
            ctx.font = '50px Microsoft Yahei';

            // get size data (height depends only on font size)
            var metrics = ctx.measureText(text);
            var textWidth = metrics.width;
            var xPos = (c.width - textWidth) / 2; // center

            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, xPos, 50);

            var texture = new THREE.Texture(c);
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial({map: texture}); // depthTest: false
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(60, 20, 1.0);
            sprite.position.set(x, y, z);

            textNoteGroup.add(sprite);
        }

        function addCamera() {
            // create a camera, which defines where we're looking at.
            var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
            // position and point the camera to the center of the scene
            camera.position.x = 0;
            camera.position.y = 70;
            camera.position.z = 500;

            return camera;
        }

        function addLight(scene) {
            // add hemi light
            var pointColor = "#FF8040";
            var hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xCECECE, 1);
            hemiLight.position.set(0, -1000, 0);
            scene.add(hemiLight);
        }

        function addOrbitControl(camera) {
            orbitControls = new THREE.OrbitControls(camera);

            orbitControls.minPolarAngle = THREE.Math.degToRad(20); // radians
            orbitControls.maxPolarAngle = THREE.Math.degToRad(80); // radians

            orbitControls.autoRotate = false;
        }

        function addTrackControl() {
            trackballControls = new THREE.TrackballControls(camera);
            trackballControls.rotateSpeed = 3.0;
            trackballControls.zoomSpeed = 3.0;
            trackballControls.panSpeed = 3.0;
            trackballControls.staticMoving = true;
//        trackballControls.target = new THREE.Vector3(63872.230600000359, 37687.36930000037, 0);
        }


        function render(webGLRenderer, scene, camera) {
            var delta = clock.getDelta();
            //orbitControls.update(delta);
//        trackballControls.update(delta);

            if (autoRotation) {
                boundaryGroup.rotation.z = step;
                group.rotation.z = step;
                frameGroup.rotation.z = step;
                textNoteGroup.rotation.z = step;
                step += 0.01;
            }

            // render using requestAnimationFrame
            requestAnimationFrame(render);


            webGLRenderer.render(scene, camera);

            //// add the output of the renderer to the html element
            //document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);
        }


        function addMouseEvent() {
            webGLRenderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
            webGLRenderer.domElement.addEventListener('mousedown', onDocumentMouseUp, false);
        }

        function onDocumentMouseMove(event) {
            var intersects = queryIntersects(event);

            if (intersects != undefined && intersected != intersects[0].object) {
                if (intersected) {
                    intersected.material.color.setHex(intersected.currentHex);
                }

                // store reference to closest object as current intersection object
                intersected = intersects[0].object;
                // store color of closest object (for later restoration)
                intersected.currentHex = intersected.material.color.getHex();
                // set a new color for closest object
                intersected.material.color.setHex(0x53B0EA); // originally 0xff0000

                var text = intersected.userData.properties.CONS_NUM + "幢-" + intersected.userData.properties.FLOOR + "层";
                $("#td_text").html(text);
                $("#td_rent").html(intersected.userData.properties.RENTS + "%");
                $("#td_area").html(parseFloat(intersected.userData.properties.BUILD_AREA).toFixed(2));
                $("#td_income").html(parseFloat(intersected.userData.properties.RENTAL_INCOME).toFixed(2));
            }
        }

        function onDocumentMouseUp(event) {
            event.preventDefault();

            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            var projector = new THREE.Projector();
            projector.unprojectVector(vector, camera);

            var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

            var intersects = raycaster.intersectObjects(group.children);
            if (intersects.length > 0) {
                intersected = intersects[0].object;
                var bldgId = intersected.userData.properties.BLDG_ID;
                var floor = intersected.userData.properties.FLOOR;
                var center = (_.filter(bldgCenterArray, function (o) {
                    return o.bldgId == bldgId;
                }))[0].center;

                // dingyh 2016-01-12  //
                //var pageUrl = 'innerroom_requirejs.html'.concat('?propId=' + propId).concat('&bldgId=' + bldgId)
                //    .concat('&floor=' + floor).concat('&center=' + center);
                //$(window.parent.document).find("#iframe_3d").attr("src", pageUrl);


                //group.traverse( function ( object ) { object.visible = false; } );
                //frameGroup.traverse( function ( object ) { object.visible = false; } );
                //textNoteGroup.traverse( function ( object ) { object.visible = false; } );
                //
                //var center1 = ["68757.873943621", "44431.9911534256"];
                //loadObj(3, center1);
                //
                //
                postal.publish({
                    channel: "3dbuilding",
                    topic: "loadInnerRoom",
                    data: {
                        propId: propId,
                        bldgId: bldgId,
                        floor: floor,
                        center: center
                    }
                });
                // dingyh 2016-01-12  end //
            }
        }




        function queryIntersects(event) {
            // normalized device coordinates
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

            raycaster = new THREE.Raycaster();
            var vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(camera);
            raycaster.set(camera.position, vector.sub(camera.position).normalize());
            var intersects = raycaster.intersectObjects(group.children);
            if (intersects.length > 0) {
                return intersects;
            }
        }

        /* intersect test */
        $("#btnLocate").click(function () {
            var mesh = scene.getObjectByName(intersected.name);
            $("#pCheckBuild").text(mesh.location);
        });

        $("#btnColor").click(function () {
            intersected.color.setHex(0x53B0EA);
        });

        $("#btnHeight").click(function () {
            var group = scene.getObjectByName('buildGroup');

            //remove old mesh
            var mesh = scene.getObjectByName(intersected.name);
            group.remove(mesh);

            //add new mesh
            var shape = intersected.userData.shape;
            var height = intersected.userData.height + 10;
            var build3D = createMesh(shape, height);
            // add the sphere to the scene
            group.add(build3D);
        })

        $("#btnRenderColor").click(function () {
            var segSize = 5; //分五段
            var segLen = (maxSTLe - minSTLe) / segSize;

            for (var b = 0; b < group.children.length; b++) {
                var build = group.children[b];
//            var line = frameGroup.children[b];

                for (var i = 0; i < segSize; i++) {
                    if (build.userData.properties.SHAPE_STLe <= minSTLe + (i + 1) * segLen) {
                        build.material.color.setHex(colorBar[i]);
//                    line.material.color.setHex(colorBar[i]);
                        break;
                    }
                }
            }
        });

        $("#btnRotate").click(function () {
            autoRotation = !autoRotation;
        });

        $("#btnFullScreen").click(function () {
            var ele = document.getElementById("WebGL-output"); //$("#WebGL-output");
            THREEx.FullScreen.request();
//        THREEx.FullScreen.request(document.getElementById("WebGL-output"));
        });

        function renderByArray(renderArray) {
            for (var b = 0; b < group.children.length; b++) {
                var build = group.children[b];
                var flrId = build.userData.properties.FLR_ID;

                var colorSeg = (_.filter(renderArray, function (o) {
                    return o.flrId == flrId;
                }))[0].seg;

                build.material.color.setHex(colorBar[colorSeg]);
            }
        }

        return {
            addCamera: addCamera,
            addLight: addLight,
            addOrbitControl: addOrbitControl,
            addGridHelper: addGridHelper,
            loadBldgs: loadBldgs,
            renderByArray: renderByArray
        };
    });