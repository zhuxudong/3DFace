import * as BABYLON from 'babylonjs';
import faceJSON from './face'

class App {
  constructor() {
    this.easing = {
      easeIn: (t, b, c, d) => {
        return c * (t /= d) * t + b;
      },
      easeOutQuad: (t, b, c, d) => {
        return -c * (t /= d) * (t - 2) + b;
      }
    }
    this.initScene();
    this.initFace();
    this.initInertia();
  }

  initScene() {
    // Get the canvas DOM element
    this.canvas = document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true, {preserveDrawingBuffer: true, stencil: true});
    this.scene = new BABYLON.Scene(this.engine);
    this.camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, 1.7, 13000, new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.maxZ = 100000;
    this.camera.targetScreenOffset.y = -1;
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    this.scene.clearColor = new BABYLON.Color3(0, 0, 0);
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  initFace() {
    const MINX = -1608;
    const MAXX = 1806;
    const MINY = -1803;
    const MAXY = 2878;
    const MINZ = -1659;
    const MAXZ = 2017;
    const WIDTH = MAXX - MINX;
    const HEIGHT = MAXY - MINY;
    /**duration*/
    const MAXDELAY = 1.2;
    /**custom mesh*/
    let face = new BABYLON.Mesh("face", this.scene);
    let vertexData = new BABYLON.VertexData();
    vertexData.positions = faceJSON;
    vertexData.indices = faceJSON.map((a, i) => {
      return (Math.floor(i / 3))
    })
    vertexData.applyToMesh(face)
    let alpha = new Float32Array(faceJSON.length / 3)
    let aRotation = new Float32Array(faceJSON.length / 3)
    let aDelay = new Float32Array(faceJSON.length / 3)
    for (let i = 0; i < aRotation.length; i++) {
      aRotation[i] = Math.PI * 2 * Math.ceil(Math.random() * 5);
    }
    for (let i = 0; i < aDelay.length; i++) {
      let y = faceJSON[i * 3 + 1]
      let yDelay = (1 - ((y - MINY) / HEIGHT)) * MAXDELAY;
      aDelay[i] = yDelay
    }
    face.setVerticesBuffer(new BABYLON.VertexBuffer(this.engine, alpha, "alpha", true, false, 1));
    face.setVerticesBuffer(new BABYLON.VertexBuffer(this.engine, aRotation, "aRotation", true, false, 1));
    face.setVerticesBuffer(new BABYLON.VertexBuffer(this.engine, aDelay, "aDelay", true, false, 1));

    /**shader material*/
    let mat = new BABYLON.ShaderMaterial(face.name + "_mat", this.scene, "/static/shader/particle",
      {
        uniforms: ["worldViewProjection", "pointSize", "baseColor", "uTime", "duration"],
        attributes: ["position", "alpha", "aRotation", "aDelay"],
        needAlphaBlending: true
      });
    mat.fillMode = 2;
    mat.alphaMode = 1;
    mat.setFloat("pointSize", 2);
    mat.setFloat("uTime", MAXDELAY);
    mat.setFloat("duration", MAXDELAY);
    mat.setVector2("resolution", new BABYLON.Vector2(window.innerWidth, window.innerHeight));
    mat.setColor3("baseColor", BABYLON.Color3.FromHexString("#4AAAEF"));

    face.material = mat;
    /**enter*/
    let uTime = MAXDELAY;
    let _render = () => {
      mat.setFloat("uTime", uTime)
      if ((uTime -= .01) <= 0) {
        mat.setFloat("uTime", 0)
        this.scene.unregisterBeforeRender(_render)
      }
    }
    this.scene.registerBeforeRender(_render)
    /**animate*/
    let delta = 0;
    let gutter = Math.PI * 40 / WIDTH;
    this.scene.registerBeforeRender(() => {
      face.setVerticesData("position", faceJSON.map((p, i) => {
        if (i % 3 == 1) {
          return p + Math.sin(delta + i * gutter) * 100 - 50
        } else {
          return p
        }
      }))
      face.setVerticesData("alpha", alpha.map((p, i) => {
        return Math.sin(delta * 6 + i * gutter) * .4
      }), true, 1)
      delta += .02;
    })
  }

  initInertia() {
    let camera = this.camera;
    let engine = this.engine;
    const minAlpha = Math.PI / 2 - .6
    const maxAlpha = Math.PI / 2 + .6
    const minBeta = 1.2
    const maxBeta = 2.2
    const alphaStep = maxAlpha - minAlpha;
    const betaStep = maxBeta - minBeta;
    // scene.onPointerObservable.add(() => {
    //     let width = engine.getRenderWidth()
    //     let height = engine.getRenderHeight()
    //     let alpha = (1 - scene.pointerX / width) * alphaStep + minAlpha;
    //     let beta = (1 - scene.pointerY / height) * betaStep + minBeta;
    //     this.tween(camera, "alpha", alpha, 30, "easeOutQuad")
    //     this.tween(camera, "beta", beta, 30, "easeOutQuad")
    // }, 4)
    document.body.addEventListener("mousemove", (e) => {
      let x = e.clientX;
      let y = e.clientY;
      let width = engine.getRenderWidth()
      let height = engine.getRenderHeight()
      let alpha = (1 - x / width) * alphaStep + minAlpha;
      let beta = (1 - y / height) * betaStep + minBeta;
      this.tween(camera, "alpha", alpha, 20, "easeOutQuad")
      this.tween(camera, "beta", beta, 20, "easeOutQuad")
    })
  }

  tween(target, prop, to, duration, type) {
    let eventName = "__" + prop + "__"
    if (target.hasOwnProperty(eventName)) {
      this.scene.unregisterBeforeRender(target[eventName])
      delete target[eventName]
    }
    let b = target[prop];
    let t = 0;
    let c = to - b;
    let _render = () => {
      if (++t > duration) {
        this.scene.unregisterBeforeRender(_render)
        delete target[eventName]
      }
      target[prop] = this.easing[type](t, b, c, duration)

    }
    this.scene.registerBeforeRender(_render)
    target[eventName] = _render;
  }
}

let app = new App()