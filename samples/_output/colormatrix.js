(function (console) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var pixi_plugins_app_Application = function() {
	this.pixelRatio = 1;
	this.set_skipFrame(false);
	this.autoResize = true;
	this.transparent = false;
	this.antialias = false;
	this.forceFXAA = false;
	this.roundPixels = false;
	this.clearBeforeRender = true;
	this.preserveDrawingBuffer = false;
	this.backgroundColor = 16777215;
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.set_fps(60);
};
pixi_plugins_app_Application.prototype = {
	set_fps: function(val) {
		this._frameCount = 0;
		return val >= 1 && val < 60?this.fps = val | 0:this.fps = 60;
	}
	,set_skipFrame: function(val) {
		if(val) {
			console.log("pixi.plugins.app.Application > Deprecated: skipFrame - use fps property and set it to 30 instead");
			this.set_fps(30);
		}
		return this.skipFrame = val;
	}
	,start: function(rendererType,parentDom) {
		if(rendererType == null) rendererType = "auto";
		var _this = window.document;
		this.canvas = _this.createElement("canvas");
		this.canvas.style.width = this.width + "px";
		this.canvas.style.height = this.height + "px";
		this.canvas.style.position = "absolute";
		if(parentDom == null) window.document.body.appendChild(this.canvas); else parentDom.appendChild(this.canvas);
		this.stage = new PIXI.Container();
		var renderingOptions = { };
		renderingOptions.view = this.canvas;
		renderingOptions.backgroundColor = this.backgroundColor;
		renderingOptions.resolution = this.pixelRatio;
		renderingOptions.antialias = this.antialias;
		renderingOptions.forceFXAA = this.forceFXAA;
		renderingOptions.autoResize = this.autoResize;
		renderingOptions.transparent = this.transparent;
		renderingOptions.clearBeforeRender = this.clearBeforeRender;
		renderingOptions.preserveDrawingBuffer = this.preserveDrawingBuffer;
		if(rendererType == "auto") this.renderer = PIXI.autoDetectRenderer(this.width,this.height,renderingOptions); else if(rendererType == "canvas") this.renderer = new PIXI.CanvasRenderer(this.width,this.height,renderingOptions); else this.renderer = new PIXI.WebGLRenderer(this.width,this.height,renderingOptions);
		if(this.roundPixels) this.renderer.roundPixels = true;
		window.document.body.appendChild(this.renderer.view);
		if(this.autoResize) window.onresize = $bind(this,this._onWindowResize);
		window.requestAnimationFrame($bind(this,this._onRequestAnimationFrame));
		this._addStats();
	}
	,_onWindowResize: function(event) {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.renderer.resize(this.width,this.height);
		this.canvas.style.width = this.width + "px";
		this.canvas.style.height = this.height + "px";
		if(this.onResize != null) this.onResize();
	}
	,_onRequestAnimationFrame: function(elapsedTime) {
		this._frameCount++;
		if(this._frameCount == (60 / this.fps | 0)) {
			this._frameCount = 0;
			if(this.onUpdate != null) this.onUpdate(elapsedTime);
			this.renderer.render(this.stage);
		}
		window.requestAnimationFrame($bind(this,this._onRequestAnimationFrame));
		if(this._stats != null) this._stats.update();
	}
	,_addStats: function() {
		if(window.Stats != null) {
			var container;
			var _this = window.document;
			container = _this.createElement("div");
			window.document.body.appendChild(container);
			this._stats = new Stats();
			this._stats.domElement.style.position = "absolute";
			this._stats.domElement.style.top = "14px";
			this._stats.domElement.style.right = "0px";
			container.appendChild(this._stats.domElement);
			this._stats.begin();
			this._addRenderStats(null);
		} else console.log("Unable to find stats.js");
	}
	,_addRenderStats: function(top) {
		if(top == null) top = 0;
		var ren;
		var _this = window.document;
		ren = _this.createElement("div");
		ren.style.position = "absolute";
		ren.style.width = "76px";
		ren.style.top = top + "px";
		ren.style.right = "0px";
		ren.style.background = "#CCCCC";
		ren.style.backgroundColor = "#105CB6";
		ren.style.fontFamily = "Helvetica,Arial";
		ren.style.padding = "2px";
		ren.style.color = "#0FF";
		ren.style.fontSize = "9px";
		ren.style.fontWeight = "bold";
		ren.style.textAlign = "center";
		window.document.body.appendChild(ren);
		ren.innerHTML = ["UNKNOWN","WEBGL","CANVAS"][this.renderer.type] + " - " + this.pixelRatio;
	}
};
var samples_filters_colormatrix_Main = function() {
	pixi_plugins_app_Application.call(this);
	this._init();
	this.stage.interactive = true;
	this._container = new PIXI.Container();
	this._container.position.set(window.innerWidth / 2,window.innerHeight / 2);
	this.stage.addChild(this._container);
	this._bg = PIXI.Sprite.fromImage("assets/filters/BGrotate.jpg");
	this._bg.anchor.set(0.5);
	this._colorMatrix = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	this._filter = new PIXI.filters.ColorMatrixFilter();
	this._bgFront = PIXI.Sprite.fromImage("assets/filters/SceneRotate.jpg");
	this._bgFront.anchor.set(0.5);
	this._container.addChild(this._bgFront);
	this._light2 = PIXI.Sprite.fromImage("assets/filters/LightRotate2.png");
	this._light2.anchor.set(0.5);
	this._container.addChild(this._light2);
	this._light1 = PIXI.Sprite.fromImage("assets/filters/LightRotate1.png");
	this._light1.anchor.set(0.5);
	this._container.addChild(this._light1);
	this._panda = PIXI.Sprite.fromImage("assets/filters/panda.png");
	this._panda.anchor.set(0.5);
	this._container.addChild(this._panda);
	this._count = 0;
	this._switchy = false;
	this._container.filters = [this._filter];
	this.stage.on("click",$bind(this,this._onClick));
	this.stage.on("tap",$bind(this,this._onClick));
	var style = { font : "bold 12pt Arial", fill : "#FFFFFF"};
	var help = new PIXI.Text("Click to turn filters on / off.",style);
	this.stage.addChild(help);
};
samples_filters_colormatrix_Main.main = function() {
	new samples_filters_colormatrix_Main();
};
samples_filters_colormatrix_Main.__super__ = pixi_plugins_app_Application;
samples_filters_colormatrix_Main.prototype = $extend(pixi_plugins_app_Application.prototype,{
	_init: function() {
		this.backgroundColor = 65382;
		this.onUpdate = $bind(this,this._onUpdate);
		pixi_plugins_app_Application.prototype.start.call(this);
	}
	,_onUpdate: function(elapsedTime) {
		this._count += 0.01;
		this._bg.rotation += 0.01;
		this._bgFront.rotation -= 0.01;
		this._light1.rotation += 0.02;
		this._light2.rotation += 0.01;
		this._panda.scale.x = 1 + Math.sin(this._count) * 0.04;
		this._panda.scale.y = 1 + Math.cos(this._count) * 0.04;
		this._count += 0.1;
		this._colorMatrix[1] = Math.sin(this._count) * 3;
		this._colorMatrix[2] = Math.cos(this._count);
		this._colorMatrix[3] = Math.cos(this._count) * 1.5;
		this._colorMatrix[4] = Math.sin(this._count / 3) * 2;
		this._colorMatrix[5] = Math.sin(this._count / 2);
		this._colorMatrix[6] = Math.sin(this._count / 4);
		this._filter.matrix = this._colorMatrix;
	}
	,_onClick: function(data) {
		this._switchy = !this._switchy;
		if(!this._switchy) this._container.filters = [this._filter]; else this._container.filters = null;
	}
});
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
samples_filters_colormatrix_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});

//# sourceMappingURL=colormatrix.js.map