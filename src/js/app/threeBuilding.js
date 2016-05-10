/**
 * Created by dingyh on 2015/09/01.
 */
define(['serviceConfig', 'jquery', 'lodash', 'url', 'three', 'orbitControls', 'objloader', 'stats', 'tween', 'terraformer', 'terraformer_wkt_parser', 'postal', 'initParam'],
    function (config, $, _, url, three, orbitControls, objloader, stats, tween, terraformer, terraformer_wkt_parser, postal, initParam) {
        var propId = url('?propId');
        var bldgCenterArray = [];
        var selectedBldgId;

        var camera, scene, webGLRenderer, stats;
        var trackballControls, orbitControls;
        var loader = new THREE.OBJLoader();
        var mouse = new THREE.Vector2();
        var clock = new THREE.Clock();
        var step = 0;
        var autoRotation;

        var center, baseGeo, intersected, cameraLastPos;

        var group = new THREE.Group(),
            frameGroup = new THREE.Group(),
            boundaryGroup = new THREE.Group(),
            textNoteGroup = new THREE.Group(),
            roomGroup;

        var colorBar = [0x24C01E, 0xD5F603, 0xFFE902, 0xFFA513, 0xF7582B];


        var subscription = postal.subscribe({
            channel: "3dbuilding",
            topic: "setBldgShow",
            callback: function(data, envelope) {
                setBldgShow();
            }
        });
        var subscription2 = postal.subscribe({
            channel: "3dbuilding",
            topic: "loadInnerRoom",
            callback: function(data, envelope) {
                clearRoomGroup();

                loadInnerObj(data.floor, data.baseHeight);
            }
        });
        var subscription3 = postal.subscribe({
            channel: "3dbuilding",
            topic: "loadAllFloors",
            callback: function(data, envelope) {
                var floorList = data.floorList;

                for(i = 0; i < _.size(floorList); i++){
                    var flrId = floorList[i].FLR_ID;
                    var floor = floorList[i].FLOOR;
                    var baseHeight = parseFloat(floorList[i].BASE_HEIGHT); // + (3 * i)
                    loadInnerObj(flrId, floor, baseHeight);
                }
            }
        });

        /*
         初始化参数，并加载相机、灯光、飞行器等
         */
        function initLoad() {
            // create a scene, that will hold all our elements such as objects, cameras and lights.
            scene = new THREE.Scene();

            // create a render and set the size
            webGLRenderer = new THREE.WebGLRenderer({
                antialias: true
            });
            //webGLRenderer.setClearColor();
            webGLRenderer.setClearColor(new THREE.Color(0x87A0AB, 1.0));
            webGLRenderer.setSize(window.innerWidth, window.innerHeight);

            // add the output of the renderer to the html element
            document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);

            //addAxes();

            addGridHelper();

            addCamera();

            addLight();

            addOrbitControl();
//          addTrackControl();

            addStats();
        }

        function loadBldgs() {
            //readBoundary();

            loadBldgFloors();

            loadTextNotes();

            addBldgMouseEvent();

            render();
        }

/************************* threejs 函数 *********************************************************/
        function addAxes() {
            var axes = new THREE.AxisHelper(200);
            scene.add(axes);
        }

        function addGridHelper() {
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

        function addCamera() {
            //cameraPosition = initParam.getCamera();

            // create a camera, which defines where we're looking at.
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
            //camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2,
            //    window.innerHeight / 2, window.innerHeight / -2, -200, 500);

            // position and point the camera to the center of the scene
            camera.position.x = 0;
            camera.position.y = 70;
            camera.position.z = 500;
        }

        function addLight() {
            // add ambient light
            //var ambientColor = "#FF8040";
            //var ambientLight = new THREE.AmbientLight(ambientColor);
            //scene.add(ambientLight);

            // add hemi light
            var pointColor = "#FF8040";
            var hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xCECECE, 1);
            hemiLight.position.set(0, -1000, 0);
            scene.add(hemiLight);
        }

        function addOrbitControl() {
            orbitControls = new THREE.OrbitControls(camera);

            orbitControls.minPolarAngle = THREE.Math.degToRad(50); // radians
            orbitControls.maxPolarAngle = THREE.Math.degToRad(50); // radians

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

        function addStats(){
            stats = new Stats();
            stats.domElement.style.position = "absolute";
            stats.domElement.style.left = "0px";
            stats.domElement.style.bottom = "0px";
            document.getElementById('WebGL-output').appendChild(stats.domElement);
        }

        function render() {
            stats.begin();

            var delta = clock.getDelta();
            orbitControls.update(delta);
//        trackballControls.update(delta);

            if (autoRotation) {
                boundaryGroup.rotation.z = step;
                group.rotation.z = step;
                frameGroup.rotation.z = step;
                textNoteGroup.rotation.z = step;
                step += 0.01;
            }

            TWEEN.update();

            // render using requestAnimationFrame
            requestAnimationFrame(render);

            webGLRenderer.render(scene, camera);

            stats.end();
        }
/************************* threejs end *********************************************************/

/************************* 鼠标事件 函数 *********************************************************/
        function addBldgMouseEvent() {
            webGLRenderer.domElement.addEventListener('mousemove', onDocumentMouseMove);
            //webGLRenderer.domElement.addEventListener('mousedown', onDocumentMouseDown);
            webGLRenderer.domElement.addEventListener('mouseup', onDocumentMouseUp);
        }

        function removeBldgMouseEvent() {
            webGLRenderer.domElement.removeEventListener('mousemove', onDocumentMouseMove);
            //webGLRenderer.domElement.removeEventListener('mousedown', onDocumentMouseDown);
            webGLRenderer.domElement.removeEventListener('mouseup', onDocumentMouseUp);
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

                selectedBldgId = intersected.userData.properties.BLDG_ID;
            }
        }

        function onDocumentMouseUp(event) {
            var intersects = queryIntersects(event);

            if (intersects != undefined && intersects.length > 0) {
                intersected = intersects[0].object;
                var bldgId = intersected.userData.properties.BLDG_ID;
                var flrId = intersected.userData.properties.FLR_ID;
                var floor = intersected.userData.properties.FLOOR;
                var baseHeight = intersected.userData.properties.BASE_HEIGHT;

                //var center = (_.filter(bldgCenterArray, function (o) {
                //    return o.bldgId == bldgId;
                //}))[0].center;

                //group.traverse( function ( object ) { object.visible = false; } );
                frameGroup.traverse(function (object) {
                    object.visible = false;
                });
                textNoteGroup.traverse(function (object) {
                    object.visible = false;
                });

                removeBldgMouseEvent();

                loadInnerObj(flrId, floor, parseFloat(baseHeight));

                postal.publish({
                    channel: "3dbuilding",
                    topic: "loadFloorList",
                    data: {
                        bldgId: bldgId,
                        floor: floor
                    }
                });

                //TODO: 根据相对位置调整相机视角
                tweenTest(68757.873943621 - 68740.1506005879, 44431.9911534256 - 44431.9911534256, parseFloat(baseHeight));
            }
        }

        function queryIntersects(event) {
            // normalized device coordinates
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

            raycaster = new THREE.Raycaster();
            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.1).unproject(camera);
            raycaster.set(camera.position, vector.sub(camera.position).normalize());
            var intersects = raycaster.intersectObjects(group.children);
            if (intersects.length > 0) {
                return intersects;
            }
        }
/************************* 鼠标事件 函数 end *********************************************************/

/************************* 三维建筑函数 *********************************************************/
        /**
         加载建筑地块轮廓
         */
        function readBoundary() {
            boundaryGroup.name = 'boundaryGroup';

            $.ajax({
                url: config.boundaryLineUrl.replace('{0}', propId),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                jsonpCallback: 'getBoundaryLineCB',
                type: 'GET',
                success: function (data) {
                    var data = data[0];
                    var geoPoly = Terraformer.WKT.parse(data.Shape);

                    if (geoPoly.type === 'Polygon') {
                        baseGeo = []; //建筑基底

                        _.each(geoPoly.coordinates[0],  function (ele, idx) {
                            ele[0] = ele[0] - center[0];
                            ele[1] = ele[1] - center[1];

                            var vector2 = new THREE.Vector2(ele[0], ele[1]);
                            baseGeo.push(vector2);
                        });

                        addBoundaryPanel(baseGeo, data);
                    } else if (geoPoly.type === 'MultiPolygon') {
                        //TODO
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load boundary line error');
                }
            });

            boundaryGroup.rotation.x = THREE.Math.degToRad(-90);
            scene.add(boundaryGroup);
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

        /**
         * 加载建筑模型
         */
        function loadBldgFloors() {
            group.name = 'buildGroup';
            frameGroup.name = 'frameGroup';

            $.ajax({
                url: config.floorsUrl.replace('{0}', propId),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                jsonpCallback: 'getFloorsCB',
                type: 'GET',
                success: function (data) {
                    _.each(data,  function (ele, idx) {
                        center = initParam.getCenter();
                        var geoPoly = Terraformer.WKT.parse(ele.Shape);

                        if (geoPoly.type === 'Polygon') {
                            baseGeo = []; //建筑基底

                            _.each(geoPoly.coordinates[0],  function (ele1, idx1) {
                                ele1[0] = ele1[0] - center[0];
                                ele1[1] = ele1[1] - center[1];

                                var vector2 = new THREE.Vector2(ele1[0], ele1[1]);
                                baseGeo.push(vector2);
                            });

                            createBuild3D(baseGeo, ele);
                        }
                        else if (geoPoly.type === 'MultiPolygon') {
                            //$.each(geoPoly.coordinates, function (key1, val1) {
                            _.each(geoPoly.coordinates,  function (ele1, idx1) {
                                baseGeo = []; //建筑基底

                                var coordinates = ele1[0];
                                _.each(coordinates,  function (ele2, idx2) {
                                    ele2[0] = ele2[0] - center[0];
                                    ele2[1] = ele2[1] - center[1];

                                    var vector2 = new THREE.Vector2(ele2[0], ele2[1]);
                                    baseGeo.push(vector2);
                                });

                                createBuild3D(baseGeo, ele);
                            });
                        }
                    });

                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load floors error');
                }
            });

            group.rotation.x = THREE.Math.degToRad(-90);
            frameGroup.rotation.x = THREE.Math.degToRad(-90);
            scene.add(group);
            scene.add(frameGroup);
        }

        /**
         * 加载建筑文字注记
         */
        function loadTextNotes() {
            textNoteGroup.name = 'textNoteGroup';

            $.ajax({
                url: config.textNoteUrl.replace('{0}', propId),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                jsonpCallback: 'getTextNotesCB',
                type: 'GET',
                success: function (data) {
                    var center = initParam.getCenter();
                    _.each(data,  function (ele, idx) {
                        var h = 20;
                        var x = ele.CENTERX - center[0];
                        var y = ele.CENTERY - center[1];
                        var z = parseFloat(ele.HEIGHT) + h;

                        var obj = new Object();
                        obj.bldgId = ele.BLDG_ID;
                        obj.center = [ele.CENTERX, ele.CENTERY];
                        bldgCenterArray.push(obj);

                        addTextNoteToGroup(ele.CONS_NUM, x, y, z);

                    });
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load text note error');
                }
            });

            textNoteGroup.rotation.x = THREE.Math.degToRad(-90);
            scene.add(textNoteGroup);
        }

        function createBuild3D(baseGeo, properties) {
            var shape = new THREE.Shape(baseGeo);

            var build3D = createMesh(shape, properties);
            // 绘制建筑物
            addBuildToGroup(build3D);
            // 绘制外轮廓
            addFrameToGroup(build3D);
        }

        function createMesh(shape, properties) {
            var options = {
                amount: properties.HEIGHT,
                bevelEnabled: false
            };

            var geom = new THREE.ExtrudeGeometry(shape, options);
            var meshMaterial =
                new THREE.MeshLambertMaterial({
                    color: 0xFFffff,
                    wireframe: false,
                    overdraw: true,
                    needsUpdate: true
                    //transparent: true,
                    //opacity: 0.9
                });
            meshMaterial.side = THREE.DoubleSide;

            var mesh = new THREE.Mesh(geom, meshMaterial);
            mesh.matrixWorldNeedsUpdate = true;

            var meshUserData = new Object();
            //meshUserData.shape = shape;
            //meshUserData.height = height;
            meshUserData.properties = properties;
            mesh.userData = meshUserData;
            return mesh;
        }

        function addBuildToGroup(build3D) {
            var baseHeight = parseFloat(build3D.userData.properties.BASE_HEIGHT) + 0.001;  //加0.01是为了让建筑不要贴到底面，隐藏后会遮住地板的方格线
            build3D.position.z = baseHeight;

            group.add(build3D);
        }

        function addFrameToGroup(build3D) {
            var baseHeight = parseFloat(build3D.userData.properties.BASE_HEIGHT) + 0.001;  //加0.01是为了让建筑不要贴到底面，隐藏后会遮住地板的方格线
            //build3D.position.z = baseHeight;

            var material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true
            });

            var geometry = new THREE.Geometry();
            var p0;
            //$.each(build3D.geometry.vertices, function (key, val) {
            _.each(build3D.geometry.vertices,  function (ele, idx) {
                if (ele.z == 0) {
                    var point = new THREE.Vector3(ele.x, ele.y, baseHeight);
                    geometry.vertices.push(point);

                    if (p0 == undefined) {
                        p0 = point;
                    }
                }
            });

            geometry.vertices.push(p0);
            var line = new THREE.Line(geometry, material, THREE.LineStrip);
            line.matrixWorldNeedsUpdate = true;
            frameGroup.add(line);
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

        function getSelectedBldgId(){
            return selectedBldgId;
        }

/************************* 三维建筑函数 end *********************************************************/

/************************* 室内楼层函数 *********************************************************/
        /**
         * 加载室内单层建筑
         */
        function loadInnerObj(flrId, floor, baseHeight) {
            if (roomGroup == undefined) {
                roomGroup = new THREE.Group();
                roomGroup.name = 'roomGroup';
                scene.add(roomGroup);
            }

            var roomSubGroup = new THREE.Group();
            roomSubGroup.name = 'R_' + floor;

            //TODO: 加载楼层铺位
            $.ajax({
                url: config.floorRoomsUrl.replace('{flrId}', flrId),
                dataType: 'jsonp',
                processData: false,
                cache: true,
                ifModified: true,
                //jsonpCallback: 'getFloorRoomsCB',
                type: 'GET',
                success: function (data) {
                    _.each(data,  function (ele, idx) {
                        var geoPoly = Terraformer.WKT.parse(ele.Shape);
                        if (geoPoly.type === 'Polygon') {
                            baseGeo = []; //建筑基底

                            _.each(geoPoly.coordinates[0],  function (ele1, idx1) {
                                ele1[0] = ele1[0] - center[0];
                                ele1[1] = ele1[1] - center[1];

                                var vector2 = new THREE.Vector2(ele1[0], ele1[1]);
                                baseGeo.push(vector2);
                            });
                        } else if (geoPoly.type === 'MultiPolygon') {
                            _.each(geoPoly.coordinates,  function (ele1, idx1) {
                                baseGeo = []; //建筑基底

                                var coordinates = ele1[0];
                                _.each(coordinates,  function (ele2, idx2) {
                                    ele2[0] = ele2[0] - center[0];
                                    ele2[1] = ele2[1] - center[1];

                                    var vector2 = new THREE.Vector2(ele2[0], ele2[1]);
                                    baseGeo.push(vector2);
                                });
                            });
                        }

                        var shape = new THREE.Shape(baseGeo);
                        var properties = ele;
                        properties.HEIGHT = 3; //默认3m高度
                        var room = createMesh(shape, properties);
                        room.position.y = baseHeight;
                        room.rotation.x = THREE.Math.degToRad(-90);

                        roomSubGroup.add(room);

                        //加载外轮廓线
                        var material = new THREE.LineBasicMaterial({
                            color: 0xffffff,
                            transparent: true
                        });
                        var geometry = new THREE.Geometry();
                        var p0;
                        _.each(room.geometry.vertices,  function (ele, idx) {
                            if (ele.z == 0) {
                                var point = new THREE.Vector3(ele.x, ele.y, baseHeight); // + 4.5
                                geometry.vertices.push(point);

                                if (p0 == undefined) {
                                    p0 = point;
                                }
                            }
                        });
                        geometry.vertices.push(p0);
                        var line = new THREE.Line(geometry, material, THREE.LineStrip);
                        line.matrixWorldNeedsUpdate = true;
                        line.rotation.x = THREE.Math.degToRad(-90);
                        roomSubGroup.add(line);
                        //加载外轮廓线 end
                    });

                    roomGroup.add(roomSubGroup);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log('load floor room error');
                }
            });

            loader.load('../data/JW16_G/W{0}.obj'.replace('{0}', floor), function (loadedMesh) {
                var material = new THREE.MeshLambertMaterial({color: 0xffffff, transparent: true, opacity: 0.2});

                loadedMesh.children.forEach(function (child) {
                    child.material = material;

                    var length = child.geometry.attributes.position.length;
                    var itemSize = child.geometry.attributes.position.itemSize;
                    child.geometry.attributes.position.needsUpdate = true;

                    for (var i = 0; i < length; i += itemSize) {
                        child.geometry.attributes.position.array[i] -= parseFloat(center[0]);
                        child.geometry.attributes.position.array[i + 1] -= parseFloat(center[1]);
                        child.geometry.attributes.position.array[i + 2] += baseHeight;
                    }

                    //child.geometry.computeFaceNormals();
                    //child.geometry.computeVertexNormals();
                });

                //loadedMesh.scale.z = baseHeight;
                loadedMesh.rotation.x = THREE.Math.degToRad(-90);

                roomSubGroup.add(loadedMesh);
                roomGroup.add(roomSubGroup);
            });

            loader.load('../data/JW16_G/T{0}.obj'.replace('{0}', floor), function (loadedMesh) {
                var material = new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.2});

                // loadedMesh is a group of meshes. For
                // each mesh set the material, and compute the information
                // three.js needs for rendering.
                loadedMesh.children.forEach(function (child) {
                    child.material = material;

                    var length = child.geometry.attributes.position.length;
                    var itemSize = child.geometry.attributes.position.itemSize;
                    child.geometry.attributes.position.needsUpdate = true;

                    for (var i = 0; i < length; i += itemSize) {
                        child.geometry.attributes.position.array[i] -= parseFloat(center[0]);
                        child.geometry.attributes.position.array[i + 1] -= parseFloat(center[1]);
                        child.geometry.attributes.position.array[i + 2] += baseHeight;
                    }

                    child.geometry.computeFaceNormals();
                    child.geometry.computeVertexNormals();
                });

                //loadedMesh.scale.z = baseHeight;
                loadedMesh.rotation.x = THREE.Math.degToRad(-90);

                roomSubGroup.add(loadedMesh);
                roomGroup.add(roomSubGroup);
            });

            loader.load('../data/JW16_G/S{0}.obj'.replace('{0}', floor), function (loadedMesh) {
                var material = new THREE.MeshLambertMaterial({color: 0x00ff00, transparent: true, opacity: 0.2});

                // loadedMesh is a group of meshes. For
                // each mesh set the material, and compute the information
                // three.js needs for rendering.
                loadedMesh.children.forEach(function (child) {
                    child.material = material;

                    var length = child.geometry.attributes.position.length;
                    var itemSize = child.geometry.attributes.position.itemSize;
                    child.geometry.attributes.position.needsUpdate = true;

                    for (var i = 0; i < length; i += itemSize) {
                        child.geometry.attributes.position.array[i] -= parseFloat(center[0]);
                        child.geometry.attributes.position.array[i + 1] -= parseFloat(center[1]);
                        child.geometry.attributes.position.array[i + 2] += baseHeight;
                    }

                    child.geometry.computeFaceNormals();
                    child.geometry.computeVertexNormals();
                });

                //loadedMesh.scale.z = baseHeight;
                loadedMesh.rotation.x = THREE.Math.degToRad(-90);

                roomSubGroup.add(loadedMesh);
                roomGroup.add(roomSubGroup);
            });


        }

        /**
         * 加载所有室内楼层
         */
        function loadAllFloors() {
            frameGroup.traverse(function (object) {
                object.visible = false;
            });
            textNoteGroup.traverse(function (object) {
                object.visible = false;
            });
            group.traverse(function (object) {
                object.visible = false;
            });

            removeBldgMouseEvent();

            //加载所有楼层信息
            postal.publish({
                channel: "3dbuilding",
                topic: "loadFloorList",
                data: {
                    bldgId: selectedBldgId,
                    floor: null
                }
            });
        }

        function clearRoomGroup() {
            for (var i = roomGroup.children.length - 1; i >= 0; i--) {
                obj = roomGroup.children[i];
                roomGroup.remove(obj);
            }
        }

        function renderRooms(renderArray) {
            for (var b = 0; b < roomGroup.children.length; b++) {
                var room = roomGroup.children[b];

                if(room.userData.properties != undefined){
                    var roomId = room.userData.properties.RM_ID;

                    var colorSeg = (_.filter(renderArray, function (o) {
                        return o.roomId == roomId;
                    }))[0].seg;

                    room.material.color.setHex(colorBar[colorSeg]);
                }
            }
        }

/************************* 室内楼层函数 end *********************************************************/





        function setBldgShow(){
            tweenBackTest();


        }






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

/************************* tween *********************************************************/
        function tweenTest(Fx, Fy, Fz) {
            cameraLastPos = $.extend(true, {}, camera.position);

            var tween = new TWEEN.Tween(camera.position).to({
                x: -137,
                y: 102,
                z: 140
            }, 1000).easing(TWEEN.Easing.Quadratic.In).start();

            _.each(group.children, function (ele, idx) {
                var tween2 = new TWEEN.Tween(ele.material).to({opacity: 0}, 1000).start();
            });
        }

        function tweenBackTest() {
            var tween = new TWEEN.Tween(camera.position).to({
                x: cameraLastPos.x,
                y: cameraLastPos.y,
                z: cameraLastPos.z
            }, 1000).easing(TWEEN.Easing.Quadratic.Out).onComplete(function () {
                frameGroup.traverse(function (object) {
                    object.visible = true;
                });
                textNoteGroup.traverse(function (object) {
                    object.visible = true;
                });

                addBldgMouseEvent();

                clearRoomGroup();

                postal.publish({
                    channel: "3dbuilding",
                    topic: "hideFloorList",
                    data: {
                    }
                });
            }).start();


            _.each(group.children, function (ele, idx) {
                var tween = new TWEEN.Tween(ele.material).to({opacity: 1}, 1000).start();
            });
        }


        function tweenFloorUp() {
            _.each(roomGroup.children, function (ele, idx) {
                var tween = new TWEEN.Tween(ele.position).to({
                    //x: -137,
                    y: ele.position.y + 1000
                    //z: 140
                }, 1000).easing(TWEEN.Easing.Quadratic.In)
                    .onComplete(function () {
                        _.each(roomGroup.children, function (ele2, idx2) {
                            roomGroup.remove(ele2);
                        });
                    }).start();
            });


            var center1 = ["68740.1506005879", "44316.5674314554"]; //["68757.873943621", "44431.9911534256"];
            loadInnerObj(4, center1, 60);
        }

        function tweenFloorDown() {
            var array = new Array();

            for (var i = 0; i < 1000; i++) {
                array.push(i);
            }
        }

        function stretchFloors() {
            _.each(roomGroup.children, function (ele, idx) {
                var floor = parseInt(ele.name.split('_')[1]);

                var tween = new TWEEN.Tween(ele.position).to({
                    y: ele.position.y + floor * 6   //拉开的间隔 为 6m
                }, 1000).easing(TWEEN.Easing.Quadratic.In)
                    .start();
            });
        }
/************************* tween end *********************************************************/




        return {
            initLoad: initLoad,
            loadBldgs: loadBldgs,
            renderByArray: renderByArray,
            //tweenTest: tweenTest,
            tweenFloorUp: tweenFloorUp,
            tweenFloorDown: tweenFloorDown,
            getSelectedBldgId: getSelectedBldgId,
            loadAllFloors:loadAllFloors,
            renderRooms: renderRooms,
            stretchFloors: stretchFloors
        };
    });