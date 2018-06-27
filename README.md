# cesium-workshop

Cesium 概览
```
npm intall
npm start
```
浏览 `http://localhost:8000/`

主要包含了：
> 坐标系统
> 
> 相机控件
> 
> 时钟控件
> 
> 加载Kml、CZML、GeoJSON、3D模型
> 
> 设置3D瓦片样式
> 
> 鼠标事件

编辑 `Source/App.js` 即可




What's here?
------------

* [index.html](index.html) - A simple HTML page. Run a local web server, and browse to index.html to run your app, which will show our sample application.
* [Source](Source/) - Contains [App.js](Source/App.js) which is referenced from index.html.  This is where the app's code goes.
* [ThirdParty](ThirdParty/) - A directory for third-party libraries, which here includes just Cesium.
* [server.js](server.js) - A simple node.js server for serving your Cesium app.  See the **Local server** section.
* [package.json](package.json) - Dependencies for the node.js server.
* [LICENSE](LICENSE.md) - A license file already referencing Cesium as a third-party.  This starter app is licensed with [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0.html) (free for commercial and non-commercial use).  You can, of course, license your code however you want.
* [.gitignore](.gitignore) - A small list of files not to include in the git repo.  Add to this as needed.

Cesium resources
----------------

* [Reference Documentation](http://cesiumjs.org/refdoc.html) : A complete guide to the Cesium API containing many code snippets.
* [Sandcastle](http://cesiumjs.org/Cesium/Apps/Sandcastle/index.html) : A live-coding environment with a large gallery of code examples.
* [Tutorials](http://cesiumjs.org/tutorials.html) : Detailed introductions to areas of Cesium development.
* [Cesium Forum](http://cesiumjs.org/forum.html) : A resource for asking and answering Cesium-related questions.
