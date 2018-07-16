precision mediump float;
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform mat4 worldViewProjection;
uniform float pointSize;
uniform float uTime;
uniform float duration;
attribute vec3 position;
attribute float alpha;
attribute float aRotation;
attribute float aDelay;
varying float v_alpha;
varying float v_progress;

vec3 rotateVector(vec4 q, vec3 v)
{
    return v +  cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

vec4 quatFromAxisAngle(vec3 axis, float angle)
{
    float halfAngle = angle * 0.5;
    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));
}

void main()	{
     v_alpha=alpha;
     vec3 tPosition=position;
     float progress=smoothstep(0.,duration,uTime - aDelay);
     progress=sin(radians(90.*progress));
     v_progress=progress;
     tPosition = rotateVector(quatFromAxisAngle(vec3(0,-1,0), aRotation * progress), tPosition);
     tPosition = tPosition + vec3(0,6000,0) *progress;
     gl_Position = worldViewProjection* vec4(tPosition, 1.0);
     gl_PointSize=pointSize;
}
