import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import * as THREE from "three";
import { useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";

export const useKTX2Texture = (
  textureUrl,
  transparent = false,
  alphaTestValue = 0.6,
  side = "front",
) => {
  const { gl } = useThree();

  const texture = useLoader(KTX2Loader, textureUrl, (loader) => {
    loader.setTranscoderPath("/basis/");
    loader.detectSupport(gl);
  });

  useEffect(() => {
    if (texture) {
      gl.initTexture(texture);
    }
  }, [gl, texture]);

  const material = useMemo(() => {
    if (!texture) return null;

    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent,
      alphaTest: alphaTestValue,
      side: side === "front" ? THREE.FrontSide : THREE.DoubleSide,
    });
  }, [texture, transparent, alphaTestValue]);

  return material;
};

useKTX2Texture.preload = (url) =>
  useLoader.preload(KTX2Loader, url, (loader) => {
    loader.setTranscoderPath("/basis/");
  });
