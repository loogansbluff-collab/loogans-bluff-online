"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Euler, MathUtils } from "three";

const EYE_HEIGHT = 1.7;
const ENTRY_Z = 3.5;
const ROOM_BACK_Z = -6;
const LOOK_SENSITIVITY = 0.0045;
const MAX_PITCH = MathUtils.degToRad(75);

export default function InteriorTouchLook() {
  const { camera, gl } = useThree();
  const activePointer = useRef<number | null>(null);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const yaw = useRef(0);
  const pitch = useRef(0);
  const euler = useRef(new Euler(0, 0, 0, "YXZ"));

  useEffect(() => {
    const touchCapable = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    if (!touchCapable) return;

    const frame = window.requestAnimationFrame(() => {
      camera.position.set(0, EYE_HEIGHT, ENTRY_Z);
      camera.lookAt(0, EYE_HEIGHT, ROOM_BACK_Z);
      euler.current.setFromQuaternion(camera.quaternion, "YXZ");
      pitch.current = euler.current.x;
      yaw.current = euler.current.y;
    });

    const element = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      activePointer.current = event.pointerId;
      lastX.current = event.clientX;
      lastY.current = event.clientY;
      element.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || activePointer.current !== event.pointerId) return;

      const dx = event.clientX - lastX.current;
      const dy = event.clientY - lastY.current;
      lastX.current = event.clientX;
      lastY.current = event.clientY;

      yaw.current -= dx * LOOK_SENSITIVITY;
      pitch.current = MathUtils.clamp(pitch.current - dy * LOOK_SENSITIVITY, -MAX_PITCH, MAX_PITCH);
      euler.current.set(pitch.current, yaw.current, 0, "YXZ");
      camera.quaternion.setFromEuler(euler.current);
    };

    const endPointer = (event: PointerEvent) => {
      if (activePointer.current === event.pointerId) activePointer.current = null;
    };

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", endPointer);
    element.addEventListener("pointercancel", endPointer);

    return () => {
      window.cancelAnimationFrame(frame);
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", endPointer);
      element.removeEventListener("pointercancel", endPointer);
    };
  }, [camera, gl]);

  return null;
}
