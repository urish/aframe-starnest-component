var vertexShader = "\nvoid main( void ) {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n";

var fragmentShader = "\nprecision highp float;\nprecision highp int;\n\n// Star Nest by Pablo RomÃ¡n Andrioli\n\nuniform vec3      iResolution;\nuniform vec4      iMouse;\nuniform float     time;\n\n// This content is under the MIT License.\n\n#define iterations 17\n#define formuparam 0.53\n\n#define volsteps 4\n#define stepsize 0.1\n\n#define zoom   0.800\n#define tile   0.850\n#define speed  0.010\n\n#define brightness 0.0015\n#define darkmatter 0.300\n#define distfading 0.730\n#define saturation 0.850\n\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n\t//get coords and direction\n\tvec2 uv=fragCoord.xy/iResolution.xy-.5;\n\tuv.y*=iResolution.y/iResolution.x;\n\tvec3 dir=vec3(uv*zoom,1.);\n\tfloat adjTime=time*speed+.25;\n\n\t//mouse rotation\n\tfloat a1=.5+iMouse.x/iResolution.x*2.;\n\tfloat a2=.8+iMouse.y/iResolution.y*2.;\n\tmat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));\n\tmat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));\n\tdir.xz*=rot1;\n\tdir.xy*=rot2;\n\tvec3 from=vec3(1.,.5,0.5);\n\tfrom+=vec3(adjTime*2.,adjTime,-2.);\n\tfrom.xz*=rot1;\n\tfrom.xy*=rot2;\n\n\t//volumetric rendering\n\tfloat s=0.1,fade=1.;\n\tvec3 v=vec3(0.);\n\tfor (int r=0; r<volsteps; r++) {\n\t\tvec3 p=from+s*dir*.5;\n\t\tp = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold\n\t\tfloat pa,a=pa=0.;\n\t\tfor (int i=0; i<iterations; i++) {\n\t\t\tp=abs(p)/dot(p,p)-formuparam; // the magic formula\n\t\t\ta+=abs(length(p)-pa); // absolute sum of average change\n\t\t\tpa=length(p);\n\t\t}\n\t\tfloat dm=max(0.,darkmatter-a*a*.001); //dark matter\n\t\ta*=a*a; // add contrast\n\t\tif (r>6) fade*=1.-dm; // dark matter, don't render near\n\t\t//v+=vec3(dm,dm*.5,0.);\n\t\tv+=fade;\n\t\tv+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance\n\t\tfade*=distfading; // distance fading\n\t\ts+=stepsize;\n\t}\n\tv=mix(vec3(length(v)),v,saturation); //color adjust\n\tfragColor = vec4(v*.01,1.);\n\n}\n\nvoid main( void ) {\n  mainImage(gl_FragColor, gl_FragCoord.xy );\n}\n";

AFRAME.registerComponent('starnest', {
  schema: {
  },

  init: function () {
    var this$1 = this;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        iResolution: { value: [250, 250, 0] },
        iMouse: { value: [0, 0, 0, 0] },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    this.applyToMesh();
    this.el.addEventListener('model-loaded', function () { return this$1.applyToMesh(); });
  },

  update: function () {
  },

  applyToMesh: function () {
    var mesh = this.el.getObject3D('mesh');
    if (mesh) {
      mesh.material = this.material;
    }
  },

  tick: function (t) {
    this.material.uniforms.time.value = t / 1000;
  }
});

