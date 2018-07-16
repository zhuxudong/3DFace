precision mediump float;
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec3 baseColor;
uniform vec2 resolution;
varying float v_alpha;
varying float v_progress;
void main() {
//    if(distance(gl_PointCoord,vec2(.5,.5))>.5){
//        discard;
//    }
    float x=gl_FragCoord.x/resolution.x;
    float y=gl_FragCoord.y/resolution.y;
    gl_FragColor=vec4(baseColor+5.*v_progress*vec3(y,x,x*y),v_alpha);
//    float color=pow(vuv.x,2.)+pow(vuv.y,2.)+.3;
//    gl_FragColor=alpha*.3*vec4(color,color,color,1);
    gl_FragColor=mix(gl_FragColor,vec4(0,0,0,0),distance(gl_PointCoord,vec2(.5,.5)));

}








