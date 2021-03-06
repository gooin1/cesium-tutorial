(function () {
    "use strict";

    // TODO: Add your ion access token from cesium.com/ion/
    // Cesium.Ion.defaultAccessToken = '<YOUR ACCESS TOKEN HERE>';
    // Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTAwOWM0Ni0zYjk1LTQzZjAtOWRkMy1hYjlkMDU3MWIyYjYiLCJpZCI6MTc0MiwiaWF0IjoxNTI5OTA1MDc4fQ.Zgv4gOWwhVRyOiE5fCsB4_5sM_ONc5i_jIpwD5vVf8M';

    Cesium.BingMapsApi.defaultKey = 'Al5MzGsvMteMn3RBQ7K17HbOnSC1kre0UZE2AxGA752UEXpWG7KB702ZC34uP9EN';

    //////////////////////////////////////////////////////////////////////////
    // Creating the Viewer
    //////////////////////////////////////////////////////////////////////////


    var viewer = new Cesium.Viewer('cesiumContainer', {
        scene3DOnly: true,
        selectionIndicator: false,
        baseLayerPicker: false,
        // timeline: false,
        // animation: false,
        skyAtmosphere: false
    });

    //////////////////////////////////////////////////////////////////////////
    // Loading Imagery
    //////////////////////////////////////////////////////////////////////////


    // imageryProvider: new Cesium.MapboxImageryProvider({
    //     url: 'https://api.mapbox.com/v4/',
    //     // mapId: 'mapbox.streets-satellite',
    //     mapId: 'mapbox.streets',
    //     accessToken: 'pk.eyJ1IjoiZ29vaW4iLCJhIjoiY2ppY3RjcGd5MDRqcjNrbWFlanEyazk2OCJ9.-v6OvStrPvVwu2-Tx9Uogg'
    // })
    viewer.imageryLayers.addImageryProvider(new Cesium.MapboxImageryProvider({
        url: 'https://api.mapbox.com/v4/',
        // mapId: 'mapbox.streets-satellite',
        mapId: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZ29vaW4iLCJhIjoiY2ppY3RjcGd5MDRqcjNrbWFlanEyazk2OCJ9.-v6OvStrPvVwu2-Tx9Uogg'
    }));


    // // Remove default base layer
    // viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

    // // Add Sentinel-2 imagery
    // viewer.imageryLayers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 3954 }));

    //////////////////////////////////////////////////////////////////////////
    // Loading Terrain
    //////////////////////////////////////////////////////////////////////////

    // // Load Cesium World Terrain
    viewer.terrainProvider = Cesium.createWorldTerrain({
        requestWaterMask: false, // 水面效果
        requestVertexNormals: true // required for terrain lighting
    });
    // // Enable depth testing so things behind the terrain disappear.
    // 保证地形后面的物体被遮挡（如地上广告牌等）
    viewer.scene.globe.depthTesstAgainstTerrain = true;

    //////////////////////////////////////////////////////////////////////////
    // Configuring the Scene
    //////////////////////////////////////////////////////////////////////////

    // Enable lighting based on sun/moon positions
    // 亮度配合时间改变而改变
    viewer.scene.globe.enableLighting = true;

    // // Create an initial camera view
    var initialPosition = new Cesium.Cartesian3.fromDegrees(-73.998114468289017509, 40.674512895646692812, 2631.082799425431);
    var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -31.987223091598949054, 0.025883251314954971306);
    var homeCameraView = {
        destination: initialPosition,
        orientation: {
            heading: initialOrientation.heading,
            pitch: initialOrientation.pitch,
            roll: initialOrientation.roll
        }
    };
    // debugger;
    // // Set the initial view
    viewer.scene.camera.setView(homeCameraView);
    console.log(viewer);
    // // Add some camera flight animation options
    homeCameraView.duration = 2.0;
    homeCameraView.maximumHeight = 2000;
    homeCameraView.pitchAdjustHeight = 2000;
    homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;
    // Override the default home button 重写home按钮方法
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        viewer.scene.camera.flyTo(homeCameraView);
    });

    // // 设置时钟和时间轴
    viewer.clock.shouldAnimate = true; // default
    viewer.clock.startTime = Cesium.JulianDate.fromIso8601("20180623"); //  开始时间
    viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("20180823"); // 结束时间
    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("20180624T100603"); // x当前时间
    viewer.clock.multiplier = 0; // 时间倍率 （84600代表一天，即真实世界中过1s，在Cesium中过1天）
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // 设置为上面的时间倍率 
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 在开始和结束时间循环
    viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime); // 设置时间轴开始结束的范围

    //////////////////////////////////////////////////////////////////////////
    // Loading and Styling Entity Data
    //////////////////////////////////////////////////////////////////////////
    // 设置KML参数
    var kmlOptions = {
        camera: viewer.scene.camera,
        canvas: viewer.scene.canvas,
        clampToGround: true // 贴在地表
    }
    var geocachePromise = Cesium.KmlDataSource.load('./Source/SampleData/sampleGeocacheLocations.kml', kmlOptions);
    geocachePromise.then(function (dataSource) {
        viewer.dataSources.add(dataSource);
        // 获取实体数组 Get the array of entities
        var geocacheEntities = dataSource.entities.values;
        geocacheEntities.map(function (entity, index) {
            // console.log(entity);
            if (Cesium.defined(entity.billboard)) {
                // Adjust the vertical origin so pins sit on terrain
                entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                // 关闭标签减少杂乱 Disable the labels to reduce clutter
                entity.label = undefined;
                // Add distance display condition
                entity.billboard.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(10.0, 20000.0);
                // 计算经纬度 
                var cartographicPosition = Cesium.Cartographic.fromCartesian(entity.position.getValue(Cesium.JulianDate.now()));
                var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
                var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
                //             // Modify description
                var description = '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>' +
                    '<tr><th>' + "Longitude" + '</th><td>' + longitude.toFixed(5) + '</td></tr>' +
                    '<tr><th>' + "Latitude" + '</th><td>' + latitude.toFixed(5) + '</td></tr>' +
                    '</tbody></table>';
                entity.description = description;
            }
        });
    });

    var geojsonOptions = {
        clampToGround: true
    };
    // 加载GeoJSON 文件 Load neighborhood boundaries from a GeoJson file
    // // Data from : https://data.cityofnewyork.us/City-Government/Neighborhood-Tabulation-Areas/cpf4-rkhq
    var neighborhoodsPromise = Cesium.GeoJsonDataSource.load('./Source/SampleData/sampleNeighborhoods.geojson', geojsonOptions);
    var neighborhoods;
    neighborhoodsPromise.then(function (dataSource) {
        // 在Viewer中添加数据
        viewer.dataSources.add(dataSource);
        // console.log(dataSource);
        neighborhoods = dataSource.entities;
        var geoJSONEntities = dataSource.entities.values;
        geoJSONEntities.map(function (entity) {
            // 检查每个多边形的定义
            if (Cesium.defined(entity.polygon)) {
                // console.log(entity);
                entity.name = entity.properties.neighborhood;
                entity.polygon.material = Cesium.Color.fromRandom({
                    red: 0.3,
                    minimumBlue: 0.4,
                    minimumGreen: 0.4,
                    alpha: 0.3
                });
                // Tells the polygon to color the terrain. ClassificationType.CESIUM_3D_TILE will color the 3D tileset, and ClassificationType.BOTH will color both the 3d tiles and terrain (BOTH is the default)
                entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
                // Generate Polygon center
                // debugger;
                // 获取多边形的所有顶点
                var polyPositions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
                //计算多边形中心点
                var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
                // 使中心点位于椭球表面上
                polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
                entity.position = polyCenter;
                // Generate labels
                entity.label = {
                    text: entity.name,
                    showBackground: true,
                    scale: 0.6,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 8000.0),
                    disableDepthTestDistance: 100.0
                };
            }
        });
        // debugger;
        // neighborhoods.show = false;
    })


    // 加载CZML动态轨迹
    var drone;
    var dronePromise = Cesium.CzmlDataSource.load('./Source/SampleData/SampleFlight.czml');
    dronePromise.then(function (dataSource) {
        viewer.dataSources.add(dataSource);
        // console.log(dataSource);
        drone = dataSource.entities.values[0];
        // 为CZML加上3D模型
        drone.model = {
            uri: './Source/SampleData/Models/CesiumDrone.gltf',
            minimumPixelSize: 128,
            maximumScale: 1000,
            // silhouetteColor: Cesium.Color.WHITE,
            // silhouetteSize: 2
        }
        // drone.orientation = new Cesium.VelocityOrientationProperty(drone.position);
        drone.orientation = new Cesium.VelocityOrientationProperty(drone.position)
        // 修改插值算法 使飞行路径更平滑
        drone.position.setInterpolationOptions({
            interpolationDegree: 2,
            interpolatAlgorithm: Cesium.HermitePolynomialApproximation
            // interpolatAlgorithm:Cesium.LagrangePolynomialApproximation
            // interpolatAlgorithm:Cesium.LinearApproximation
        });
        drone.viewFrom = new Cesium.Cartesian3(-30, 0, 0);
        // debugger;
    })



    //////////////////////////////////////////////////////////////////////////
    // Load 3D Tileset
    //////////////////////////////////////////////////////////////////////////

    // //   添加3D瓦片数据集 Load the NYC buildings tileset
    var city = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(3839)
    }));

    // 调整瓦片集高度，让其不再浮在地形之上 Adjust the tileset height so it's not floating above terrain
    var heightOffset = -32;
    city.readyPromise.then(function (tileset) {
        // Position tileset
        var boundingSphere = tileset.boundingSphere;
        var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
        var surfacePosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
        var offsetPosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
        var translation = Cesium.Cartesian3.subtract(offsetPosition, surfacePosition, new Cesium.Cartesian3());
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    });

    //////////////////////////////////////////////////////////////////////////
    // Style 3D Tileset
    //////////////////////////////////////////////////////////////////////////

    // // Define a white, opaque building style
    var defaultStyle = new Cesium.Cesium3DTileStyle({
        color: "color('white')",
        show: true
    });

    // Set the tileset style to default
    city.style = defaultStyle;

    // 白色，透明样式
    var transparentStyle = new Cesium.Cesium3DTileStyle({
        color: "color('white', 0.5)",
        show: true
    });

    // 按照高度设置样式
    var heightStyle = new Cesium.Cesium3DTileStyle({
        color: {
            conditions: [
                ["${height} >= 300", "rgba(45, 0, 75, 0.5)"],
                ["${height} >= 200", "rgb(102, 71, 151)"],
                ["${height} >= 100", "rgb(170, 162, 204)"],
                ["${height} >= 50", "rgb(224, 226, 238)"],
                ["${height} >= 25", "rgb(252, 230, 200)"],
                ["${height} >= 10", "rgb(248, 176, 87)"],
                ["${height} >= 5", "rgb(198, 106, 11)"],
                ["true", "rgb(127, 59, 8)"]
            ]
        }
    });

    var tileStyle = document.getElementById('tileStyle');

    function set3DTileStyle() {
        var selectedStyle = tileStyle.options[tileStyle.selectedIndex].value;
        if (selectedStyle === 'none') {
            city.style = defaultStyle;
        } else if (selectedStyle === 'height') {
            city.style = heightStyle;
        } else if (selectedStyle === 'transparent') {
            city.style = transparentStyle;
        }
    }
    tileStyle.addEventListener('change', set3DTileStyle);

    //////////////////////////////////////////////////////////////////////////
    // Custom mouse interaction for highlighting and selecting
    //////////////////////////////////////////////////////////////////////////

    // If the mouse is over a point of interest, change the entity billboard scale and color
    var previousPickedEntity;
    var handler = viewer.screenSpaceEventHandler;
    handler.setInputAction(function (movement) {
        var pickedPrimitive = viewer.scene.pick(movement.endPosition);
        var pickedEntity = Cesium.defined(pickedPrimitive) ? pickedPrimitive.id : undefined;
        // Unhighlight the previously picked entity
        if (Cesium.defined(previousPickedEntity)) {
            previousPickedEntity.billboard.scale = 1.0;
            previousPickedEntity.billboard.color = Cesium.Color.WHITE;
        }
        // Highlight the currently picked entity
        if (Cesium.defined(pickedEntity) && Cesium.defined(pickedEntity.billboard)) {
            pickedEntity.billboard.scale = 2.0;
            pickedEntity.billboard.color = Cesium.Color.ORANGERED;
            previousPickedEntity = pickedEntity;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


    // 屏幕点击事件    
    var scene = viewer.scene;
    var positionHandler;

    function showPosition() {
        positionHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        positionHandler.setInputAction(function (e) {
            viewer.entities.removeAll();
            // 获取屏幕点击位置的笛卡尔坐标
            var position = scene.pickPosition(e.position);
            // 根据笛卡尔坐标(Cartesian3)位置创建一个Cartographic实例。结果数据以弧度为单位
            var cartographic = Cesium.Cartographic.fromCartesian(position);
            // console.log(cartographic);
            // 将弧度转为经纬度
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            //创建弹出框信息
            var entity = new Cesium.Entity({
                name: "位置信息",
                description: createDescription(Cesium, [longitude, latitude, height])
            });
            viewer.selectedEntity = entity;
            viewer.entities.add(new Cesium.Entity({
                point: new Cesium.PointGraphics({
                    color: new Cesium.Color.fromRandom({
                        minimumRed: 0.25,
                        minimumGreen: 0.75,
                        minimumBlue: 0.25,
                        alpha: 1.0
                    }),
                    pixelSize: 10,
                    outlineColor: new Cesium.Color(0, 1, 1)
                }),
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 0.5)
            }));
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }


    //创建描述位置的对话框
    function createDescription(Cesium, properties) {
        var simpleStyleIdentifiers = ['经度', '纬度', '高度'];
        var html = '';
        for (var key in properties) {
            if (properties.hasOwnProperty(key)) {
                if (simpleStyleIdentifiers.indexOf(key) !== -1) {
                    continue;
                }
                var value = properties[key];
                if (Cesium.defined(value) && value !== '') {
                    html += '<tr><td>' + simpleStyleIdentifiers[key] + '</td><td>' + value + '</td></tr>';
                }
            }
        }
        if (html.length > 0) {
            html = '<table class="zebra"><tbody>' + html + '</tbody></table>';
        }
        return html;
    }
    //////////////////////////////////////////////////////////////////////////
    // Setup Camera Modes
    //////////////////////////////////////////////////////////////////////////

    var freeModeElement = document.getElementById('freeMode');
    var droneModeElement = document.getElementById('droneMode');

    // Create a follow camera by tracking the drone entity
    function setViewMode() {
        if (droneModeElement.checked) {
            // 使视图追踪实体(实体位于屏幕中央)
            viewer.trackedEntity = drone;
        } else {
            viewer.trackedEntity = undefined;
            viewer.scene.camera.flyTo(homeCameraView);
        }
    }

    freeModeElement.addEventListener('change', setViewMode);
    droneModeElement.addEventListener('change', setViewMode);

    viewer.trackedEntityChanged.addEventListener(function () {
        if (viewer.trackedEntity === drone) {
            freeModeElement.checked = false;
            droneModeElement.checked = true;
        }
    });



    //////////////////////////////////////////////////////////////////////////
    // 测量功能
    //////////////////////////////////////////////////////////////////////////

    //TODO


    //////////////////////////////////////////////////////////////////////////
    // Setup Display Options
    //////////////////////////////////////////////////////////////////////////

    var shadowsElement = document.getElementById('shadows');
    var neighborhoodsElement = document.getElementById('neighborhoods');
    var positionElement = document.getElementById('position');

    shadowsElement.addEventListener('change', function (e) {
        viewer.shadows = e.target.checked;
    });

    neighborhoodsElement.addEventListener('change', function (e) {
        neighborhoods.show = e.target.checked;
    });

    positionElement.addEventListener('change', function (e) {
        e.target.checked ? showPosition() : positionHandler = positionHandler.destroy();
    });

    // Finally, wait for the initial city to be ready before removing the loading indicator.
    var loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';
    city.readyPromise.then(function () {
        loadingIndicator.style.display = 'none';
    });
}());