'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { cn } from '@/lib/utils';

interface ChatbotRobot3DProps {
  size?: number | string;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  autoRotate?: boolean;
  modelUrl?: string;
}

export function ChatbotRobot3D({
  size = 64,
  className,
  onClick,
  interactive = true,
  autoRotate = true,
  modelUrl = '/models/futuristic_robot/scene.glb',
}: ChatbotRobot3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const container = containerRef.current;
    let animationFrameId: number;
    let isDisposed = false;

    // Dimensions
    const width = container.clientWidth || (typeof size === 'number' ? size : 80);
    const height = container.clientHeight || (typeof size === 'number' ? size : 80);

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 1.85);

    // Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL initialization failed, falling back:', err);
      setHasError(true);
      return;
    }

    // ToolCart Brand V3 Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    // Main Studio Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // ToolCart Cobalt Rim Fill Light (#2450B8)
    const cobaltFillLight = new THREE.DirectionalLight(0x2450b8, 1.4);
    cobaltFillLight.position.set(-4, -2, -3);
    scene.add(cobaltFillLight);

    // Front soft light
    const frontLight = new THREE.DirectionalLight(0xeaf0ff, 1.0);
    frontLight.position.set(0, 2, 4);
    scene.add(frontLight);

    // ToolCart Action Lime Anti-Gravity Thruster Glow Light (#DDF16A)
    const limeGlowLight = new THREE.PointLight(0xddf16a, 3.2, 5);
    limeGlowLight.position.set(0, -0.65, 0.2);
    scene.add(limeGlowLight);

    // Soft Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(0.35, 32);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(24, 35, 54, 0.45)');
      gradient.addColorStop(0.6, 'rgba(24, 35, 54, 0.15)');
      gradient.addColorStop(1, 'rgba(24, 35, 54, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.58;
    scene.add(shadowMesh);

    // Model Container Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Cursor tracking state
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      // Normalise coordinates between -1 and 1
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Load Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (isDisposed) return;
        const loadedScene = gltf.scene;

        // Brand V3 Material Tuning & Color Grading
        loadedScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat) {
              const matName = (mat.name || '').toLowerCase();
              if (matName.includes('lime') || matName.includes('light') || matName.includes('glow')) {
                // Action Lime Radiance
                mat.color.setHex(0xddf16a);
                mat.emissive.setHex(0xddf16a);
                mat.emissiveIntensity = 2.0;
              } else if (matName.includes('cobalt') || matName.includes('white_glossy') || matName.includes('chassis')) {
                // ToolCart Industrial Cobalt Metallic Chassis
                mat.color.setHex(0x2450b8);
                mat.metalness = 0.25;
                mat.roughness = 0.35;
              } else if (matName.includes('ink') || matName.includes('black') || matName.includes('face')) {
                // Deep Ink Faceplate & Antenna
                mat.color.setHex(0x182336);
                mat.metalness = 0.15;
                mat.roughness = 0.2;
              }
            }
          }
        });

        // Compute exact bounding box and center the model
        const box = new THREE.Box3().setFromObject(loadedScene);
        const center = box.getCenter(new THREE.Vector3());
        const boxSize = box.getSize(new THREE.Vector3());

        // Center within group
        loadedScene.position.x = -center.x;
        loadedScene.position.y = -center.y + 0.05;
        loadedScene.position.z = -center.z;

        // Auto-scale to fit camera frame
        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
        if (maxDim > 0) {
          const scale = 1.05 / maxDim;
          modelGroup.scale.set(scale, scale, scale);
        }

        modelGroup.add(loadedScene);
        setIsLoaded(true);
      },
      undefined,
      (err) => {
        console.warn('Failed to load 3D robot GLTF/GLB:', err);
        setHasError(true);
      }
    );

    // Resize Observer for responsive layouts
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!renderer || isDisposed) return;
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Render Loop
    const startTime = performance.now();
    const animate = () => {
      if (isDisposed || !renderer) return;

      const elapsed = (performance.now() - startTime) / 1000;

      // Floating / Anti-Gravity Hover Sine Wave
      if (autoRotate) {
        modelGroup.position.y = Math.sin(elapsed * 2.2) * 0.035;

        // Dynamic Thruster Light Pulse
        limeGlowLight.intensity = 2.8 + Math.sin(elapsed * 4.5) * 0.7;

        // Interactive Cursor Tracking & Head-Turning Interpolation (Lerp)
        const targetRotY = (mouseX * 0.45) + Math.sin(elapsed * 0.9) * 0.04;
        const targetRotX = -(mouseY * 0.28) + 0.05;
        const targetRotZ = (mouseX * -0.15) + Math.sin(elapsed * 1.3) * 0.02;

        modelGroup.rotation.y += (targetRotY - modelGroup.rotation.y) * 0.08;
        modelGroup.rotation.x += (targetRotX - modelGroup.rotation.x) * 0.08;
        modelGroup.rotation.z += (targetRotZ - modelGroup.rotation.z) * 0.08;

        // Soft shadow breathes with hover height
        const shadowScale = 1.0 - Math.sin(elapsed * 2.2) * 0.08;
        shadowMesh.scale.set(shadowScale, shadowScale, 1);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      resizeObserver.disconnect();

      if (renderer) {
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }

      // Geometries & materials disposal
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
    };
  }, [isClient, interactive, autoRotate, modelUrl, size]);

  if (hasError || !isClient) {
    // Graceful fallback to static high-res 3D render
    return (
      <div
        className={cn('relative inline-flex items-center justify-center select-none', className)}
        style={{ width: size, height: size }}
        onClick={onClick}
      >
        <img
          src="/images/3d/icons/icon-ai-robot.webp"
          alt="ToolCart 3D AI Robot"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block select-none overflow-visible',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Subtle loader shimmer before WebGL is ready */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-tc-primary/5 animate-pulse"
        />
      )}
    </div>
  );
}

export default ChatbotRobot3D;
