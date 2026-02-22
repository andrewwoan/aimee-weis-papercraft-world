import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import { useCurveProgressStore } from "../../store/useCurveProgressStore";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";
import { useCameraStore } from "../../store/useCameraStore";
import { useResponsiveStore } from "../../store/useResponsiveStore";

const CustomCamera = () => {
  const { camera, pointer } = useThree();
  const curves = useCurveProgressStore((state) => state.curves);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const currentPointer = useRef(new THREE.Vector2(0, 0));

  const isInitialLerping = useRef(true);

  const cameraGroupRef = useRef();
  const cameraRef = useRef();

  const zoom = useCameraStore((state) => state.zoom);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.updateProjectionMatrix();
    }
  }, [zoom]);

  useFrame(() => {
    const scrollProgressPosition =
      useCurveProgressStore.getState().scrollProgress;
    // const offsetScrollCameraPosition = (scrollProgressPosition + 0.5) % 1;

    curves.cameraPathCurve.getPointAt(
      scrollProgressPosition,
      targetPosition.current,
    );
    curves.cameraLookAtCurve.getPointAt(
      scrollProgressPosition,
      targetLookAt.current,
    );

    if (isInitialLerping.current) {
      cameraGroupRef.current.position.copy(targetPosition.current);
      cameraGroupRef.current.lookAt(targetLookAt.current);
      currentLookAt.current.copy(targetLookAt.current);

      cameraRef.current.rotation.set(0, Math.PI, 0);

      isInitialLerping.current = false;

      return;
    }

    cameraGroupRef.current.position.lerp(targetPosition.current, 0.1);
    currentLookAt.current.lerp(targetLookAt.current, 0.1);

    cameraGroupRef.current.lookAt(currentLookAt.current);

    const isMobile = useResponsiveStore.getState().isMobile;

    currentPointer.current.lerp(isMobile ? { x: 0, y: 0 } : pointer, 0.1);

    cameraRef.current.position.set(
      isMobile ? 0.3 : currentPointer.current.x * 0.1,
      isMobile ? 0 : currentPointer.current.y * 0.1,
      0,
    );
    cameraRef.current.rotation.set(
      isMobile ? 0 : -currentPointer.current.y * 0.1,
      isMobile ? +Math.PI : -currentPointer.current.x * 0.1 + Math.PI,
      0,
    );

    const zoom = useCameraStore.getState().zoom;

    if (cameraRef.current && cameraRef.current.zoom !== zoom) {
      cameraRef.current.zoom = zoom;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <>
      <group ref={cameraGroupRef}>
        <PerspectiveCamera makeDefault fov={50} ref={cameraRef} />
      </group>
    </>
  );
};

export default CustomCamera;
