import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import { useCurveProgressStore } from "../../store/useCurveProgressStore";

const CustomCamera = () => {
  const { camera } = useThree();
  const curves = useCurveProgressStore((state) => state.curves);

  useFrame(() => {
    const scrollProgressPosition =
      useCurveProgressStore.getState().scrollProgress;

    const offsetScrollCameraPosition = (scrollProgressPosition + 0.5) % 1;

    const cameraCurvePosition = curves.cameraPathCurve.getPointAt(
      offsetScrollCameraPosition,
    );

    const cameraLookAtCurvePosition = curves.cameraLookAtCurve.getPointAt(
      scrollProgressPosition,
    );

    camera.position.copy(cameraCurvePosition);
    camera.lookAt(cameraLookAtCurvePosition);
  });

  return <></>;
};

export default CustomCamera;
