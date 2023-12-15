import {useState, useRef, useMemo} from "react";
import {createRoot} from "react-dom/client";
import {Canvas, extend, useFrame} from "@react-three/fiber";
import {Edges, OrbitControls} from "@react-three/drei";
import * as THREE from "three";
import "../App.css";
import {
  IcosahedronGeometry,
  MeshBasicMaterial,
  Mesh,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  BufferGeometry,
  BufferAttribute,
  Points,
  PointsMaterial,
  ShaderMaterial,
} from "three";
import {AxesHelper} from "three";

const GeodesicPolyhedronComponent = ({
  radius,
  detail,
  color,
  rotationSpeed,
  wireframe,
  meshRef,
  materialIdx,
}) => {
  // const meshRef = useRef();
  const edgesRef = useRef();
  const clock = new THREE.Clock();
  const GeodesicPolyhedron = ({
    radius,
    detail,
    color,
    rotationSpeed,
    wireframe,
    meshRef,
    materialIdx,
  }) => {
    useFrame(() => {
      // Rotate the polyhedron for animation
      // meshRef.current.rotation.x += rotationSpeed;
      // meshRef.current.rotation.y += rotationSpeed;
      // edgesRef.current.rotation.x += rotationSpeed;
      // edgesRef.current.rotation.y += rotationSpeed;
      const time = clock.getElapsedTime();
      meshRef.current.material[1].uniforms.uTime.value = time;
      meshRef.current.material[2].uniforms.uTime.value = time;
      // edgesRef.current.material.uniforms.uTime.value = time;
    });

    const icosahedronGeometry = new IcosahedronGeometry(radius, detail);

    const edgesGeometry = new EdgesGeometry(icosahedronGeometry);
    const edgesMaterial = new LineBasicMaterial({color: 0x000000});
    const newEdgesMaterial = new ShaderMaterial({
      vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normal;
        vPosition = position;
        float scale = 1.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
      }
    `,
      fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;

      void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, smoothstep(0.0, 1.0, sin((uTime + vPosition.y) / 0.25)));
      }
      `,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {value: 1.0},
      },
      transparent: true,
      depthWrite: false,
    });
    const edgesMesh = new LineSegments(edgesGeometry, newEdgesMaterial);

    const position = icosahedronGeometry.getAttribute("position");
    const materials = [];
    for (let i = 0; i < position.count; i++) {
      if (i % 3 == 0) {
        const x = position.getX(i);
        const y = position.getY(i);
        const z = position.getZ(i);
        const newMaterial = new MeshBasicMaterial({
          // wireframe: true,
          color: "yellow",
          side: THREE.DoubleSide,
        });

        // const newMaterial2 = new MeshBasicMaterial({
        //   wireframe: false,
        //   color: "red",
        //   side: THREE.DoubleSide,
        // });
        const newMaterial2 = new ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            uniform float uTime;
            varying vec3 vPosition;
            void main () {
              vPosition = position;
              vec3 newPos = position;
              // newPos.xyz += sin(uTime);
              vNormal = normal;
              float scaleFactor = 0.15 * sin(uTime) + 1.15;
              // vec4 scaledPos = modelViewMatrix * vec4(newPos, 1.0);
              vec4 scaledPos = modelViewMatrix * vec4(position * scaleFactor, 1.0);
              // scaledPos.xyz *= scaleFactor;
              gl_Position = projectionMatrix * scaledPos;
            }
          `,
          fragmentShader: `
          varying vec3 vNormal;

          void main () {
            float r = abs(vNormal.x);
            float g = abs(vNormal.y);
            float b = abs(vNormal.z);
            gl_FragColor = vec4(r, g, b, 1.0);
          }
        `,
          side: THREE.DoubleSide,
          uniforms: {
            uTime: {value: 1.0},
          },
          wireframe: true,
        });

        const newMaterial3 = new ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
              vNormal = normal;
              vPosition = position;
              float scale = 1.5;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform float uTime;

            void main() {
              gl_FragColor = vec4(1.0, 0.0, 0.0, smoothstep(0.0, 1.0, sin((uTime + vPosition.y) / 0.25)));
              // if(vPosition.y > 1.5) {
              //   gl_FragColor = vec4(1.0, 0.0, 0.0, smoothstep(0.0, 1.0, sin((uTime + vPosition.y) / 0.25)));
              //   // gl_FragColor = vec4(1.0, 0.0, 0.0, sin((uTime + 2.0) / 0.25));
              // } else if (vPosition.y > 1.0 && vPosition.y < 1.5) {
              //   gl_FragColor = vec4(0.0, 1.0, 0.0, smoothstep(0.0, 1.0, sin((uTime + 1.90) / 0.25)));
              //   // gl_FragColor = vec4(0.0, 1.0, 0.0, sin((uTime + 1.75) / 0.25));
              // } else if (vPosition.y > 0.5 && vPosition.y < 1.0) {
              //   gl_FragColor = vec4(0.0, 0.0, 1.0, smoothstep(0.0, 1.0, sin((uTime + 1.8) / 0.25)));
              //   // gl_FragColor = vec4(0.0, 0.0, 1.0, sin((uTime + 1.5) / 0.25));
              // } else if (vPosition.y > 0.0 && vPosition.y < 0.5) {
              //   gl_FragColor = vec4(1.0, 1.0, 0.0, smoothstep(0.0, 1.0, sin((uTime + 1.7) / 0.25)));
              //   // gl_FragColor = vec4(1.0, 1.0, 0.0, sin((uTime + 1.25) / 0.25));
              // } else if (vPosition.y > -0.5 && vPosition.y < 0.0){
              //   gl_FragColor = vec4(0.0, 0.0, 1.0, smoothstep(0.0, 1.0, sin((uTime + 1.6) / 0.25)));
              //   // gl_FragColor = vec4(0.0, 0.0, 1.0, sin((uTime + 1.0) / 0.25));
              // } else if (vPosition.y > -1.0 && vPosition.y < -0.5) {
              //   gl_FragColor = vec4(0.0, 1.0, 0.0, smoothstep(0.0, 1.0, sin((uTime + 1.5) / 0.25)));
              //   // gl_FragColor = vec4(0.0, 1.0, 0.0, sin((uTime + 0.75) / 0.25));
              // } else if (vPosition.y > -1.5 && vPosition.y < -1.0) {
              //   gl_FragColor = vec4(1.0, 0.0, 0.0, smoothstep(0.0, 1.0, sin((uTime + 1.4) / 0.25 )));
              //   // gl_FragColor = vec4(1.0, 0.0, 0.0, sin((uTime + 0.5) / 0.25 ));
              // } else {
              //   gl_FragColor = vec4(0.5, 0.5, 0.5, smoothstep(0.0, 1.0, sin((uTime + 1.3) / 0.25)));
              //   // gl_FragColor = vec4(0.5, 0.5, 0.5, sin((uTime + 0.25) / 0.25));
              // }
            }
          `,
          side: THREE.DoubleSide,
          uniforms: {
            uTime: {value: 1.0},
          },
          transparent: true,
          depthWrite: false,
          // wireframe: true,
        });

        // if (z > 0.5 && z < 1.5) {
        //   icosahedronGeometry.addGroup(i, 3, 1);
        // }
        // if (i == 0) {
        //   icosahedronGeometry.addGroup(i, 3, 1);
        //   edgesGeometry.addGroup(i, 3, 1);
        // } else {
        //   icosahedronGeometry.addGroup(i, 3, 0);
        //   edgesGeometry.addGroup(i, 3, 0);
        // }

        icosahedronGeometry.addGroup(i, 3, materialIdx);
        materials.push(newMaterial);
        materials.push(newMaterial2);
        materials.push(newMaterial3);
        // materials.push(numberMaterial);
        // icosahedronGeometry.material = materials;
        icosahedronGeometry.needsUpdate = true;
        edgesGeometry.material = materials;
        edgesGeometry.needsUpdate = true;
      }
    }

    const posAttribute = icosahedronGeometry.getAttribute("position");

    const colors = [];
    const colorNew = new THREE.Color();

    for (let i = 0; i < posAttribute.count; i++) {
      colorNew.set(0xffffff * Math.random());
      const opacity = Math.random() * 0.7 + 0.7;

      // Define same color for each vertex of a triangle
      colors.push(colorNew.r, colorNew.g, colorNew.b, opacity);
      colors.push(colorNew.r, colorNew.g, colorNew.b, opacity);
      colors.push(colorNew.r, colorNew.g, colorNew.b, opacity);
      colors.push(colorNew.r, colorNew.g, colorNew.b, opacity);
    }

    // icosahedronGeometry.setAttribute(
    //   "color",
    //   new BufferAttribute(new Float32Array(colors), 4)
    // );

    const icosahedronGeometryMesh = new Mesh(
      icosahedronGeometry,
      // icosahedronGeometryMaterial
      materials
    );

    // icosahedronGeometryMesh.position.set(-4, 0.5, 0.5);

    return (
      <group>
        <primitive object={icosahedronGeometryMesh} ref={meshRef} />
        {/* <primitive object={edgesMesh} ref={edgesRef} /> */}
      </group>
    );
  };
  return (
    <group>
      <GeodesicPolyhedron
        radius={radius}
        detail={detail}
        color={color}
        rotationSpeed={rotationSpeed}
        wireframe={wireframe}
        meshRef={meshRef}
        // edgesRef={edgesRef}
        materialIdx={materialIdx}
      />
    </group>
  );
};

export default GeodesicPolyhedronComponent;
