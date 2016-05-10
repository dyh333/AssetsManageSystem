/**
 * Created by dingyh on 2015/09/01.
 */
define(['jquery', 'url', 'three', 'orbitControls', 'objloader', 'terraformer', 'terraformer_wkt_parser', 'postal', 'load3dBuilding'],
    function ($, url, three, orbitControls, objloader, terraformer, terraformer_wkt_parser, postal, load3dBuilding) {
        var propId, bldgId, floor, center;
        //var cameraPosition = loadInitParam.getCamera();

        var clock = new THREE.Clock();
        var camera, scene, webGLRenderer, trackballControls, orbitControls;
        var autoRotation;
        var roomGroup;

        var loader = new THREE.OBJLoader();


        var subscription = postal.subscribe({
            channel: "3dbuilding",
            topic: "loadInnerRoom",
            callback: function(data, envelope) {
                propId = data.propId;
                bldgId = data.bldgId;
                floor = data.floor;
                center = data.center;

                loadInnerroom();
                loadObj(floor);
            }
        });




        function loadInnerroom() {

            // create a scene, that will hold all our elements such as objects, cameras and lights.
            scene = new THREE.Scene();

            // create a render and set the size
            webGLRenderer = new THREE.WebGLRenderer({
                antialias: true
            });
            webGLRenderer.setClearColor();
            webGLRenderer.setClearColor(new THREE.Color(0x87A0AB, 1.0));
            webGLRenderer.setSize(window.innerWidth, window.innerHeight);

            //addAxes();

            addGridHelper();

            loadObj(floor);

            loadProperty(floor);

            addCamera();

            addLight();

            addOrbitControl();

            render();

            // add the output of the renderer to the html element
            document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);
        }


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

        function loadObj(floor) {
            if (roomGroup == undefined) {
                roomGroup = new THREE.Group();
                roomGroup.name = 'roomGroup';
                scene.add(roomGroup);
            }
            else {
                for (var i = roomGroup.children.length - 1; i >= 0; i--) {
                    obj = roomGroup.children[i];
                    roomGroup.remove(obj);
                }
            }



            loader.load('../data/JW16_G/W{0}.obj'.replace('{0}', floor), function (loadedMesh) {
                var material = new THREE.MeshLambertMaterial({color: 0xffffff});

                loadedMesh.children.forEach(function (child) {
                    child.material = material;

                    var length = child.geometry.attributes.position.length;
                    var itemSize = child.geometry.attributes.position.itemSize;
                    child.geometry.attributes.position.needsUpdate = true;

                    for (var i = 0; i < length; i += itemSize) {
                        child.geometry.attributes.position.array[i] -= parseFloat(center[0]);
                        child.geometry.attributes.position.array[i + 1] -= parseFloat(center[1]);

                    }

                    child.geometry.computeFaceNormals();
                    child.geometry.computeVertexNormals();
                });

                mesh = loadedMesh;
                loadedMesh.rotation.x = THREE.Math.degToRad(-90);
                roomGroup.add(loadedMesh);
            });

            loader.load('../data/JW16_G/T{0}.obj'.replace('{0}', floor), function (loadedMesh) {
                var material = new THREE.MeshLambertMaterial({color: 0xff0000});

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


                    }

                    child.geometry.computeFaceNormals();
                    child.geometry.computeVertexNormals();
                });

                mesh = loadedMesh;
                loadedMesh.rotation.x = THREE.Math.degToRad(-90);
                roomGroup.add(loadedMesh);
            });

            loader.load('../data/JW16_G/S{0}.obj'.replace('{0}', floor), function (loadedMesh) {
                var material = new THREE.MeshLambertMaterial({color: 0x00ff00});

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


                    }

                    child.geometry.computeFaceNormals();
                    child.geometry.computeVertexNormals();
                });

                mesh = loadedMesh;
                loadedMesh.rotation.x = THREE.Math.degToRad(-90);
                roomGroup.add(loadedMesh);
            });
        }

        /**
         * 加载楼层铺位
         * @param floor
         */
        function loadProperty(floor){

        }

        function addCamera() {
            // create a camera, which defines where we're looking at.
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
            // position and point the camera to the center of the scene
            camera.position.x = -60;
            camera.position.y = 60;
            camera.position.z = 80;
        }

        function addLight() {
            // add hemi light
            var pointColor = "#FF8040";
            var hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xCECECE, 1);
            hemiLight.position.set(0, -1000, 700);
            scene.add(hemiLight);
        }

        function addOrbitControl() {
            orbitControls = new THREE.OrbitControls(camera);
            orbitControls.autoRotate = false;
        }

        function render() {
            var delta = clock.getDelta();
            orbitControls.update(delta);
//        trackballControls.update(delta);

            if (autoRotation) {
                boundaryGroup.rotation.z = step;
                group.rotation.z = step;
                frameGroup.rotation.z = step;
                step += 0.005
            }

            // render using requestAnimationFrame
            requestAnimationFrame(render);

            webGLRenderer.render(scene, camera);
        }


        return {
            loadInnerroom: loadInnerroom,
            loadObj: loadObj
        }
    });