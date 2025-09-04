'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GlobeComponent() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);  

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mountRef.current) return;

    const initGlobe = async () => {
      try {
        // Import three-globe dynamically
        const ThreeGlobe = (await import('three-globe')).default;
        console.log('ThreeGlobe loaded successfully');

        // Sample data for mentorship network
        const arcsData = [
          {
            startLat: 40.7128, startLng: -74.0060, // NYC
            endLat: 51.5074, endLng: -0.1278,      // London
            color: '#f97316'
          },
          {
            startLat: 40.7128, startLng: -74.0060, // NYC
            endLat: 35.6762, endLng: 139.6503,     // Tokyo
            color: '#10b981'
          },
          {
            startLat: 51.5074, startLng: -0.1278,  // London
            endLat: 37.7749, endLng: -122.4194,    // San Francisco
            color: '#8b5cf6'
          },
          {
            startLat: 35.6762, startLng: 139.6503, // Tokyo
            endLat: 52.5200, endLng: 13.4050,      // Berlin
            color: '#ef4444'
          },
          {
            startLat: 37.7749, startLng: -122.4194, // San Francisco
            endLat: 43.6532, endLng: -79.3832,      // Toronto
            color: '#06b6d4'
          },
          {
            startLat: 52.5200, startLng: 13.4050,   // Berlin
            endLat: 25.2048, endLng: 55.2708,       // Dubai
            color: '#f59e0b'
          },
          {
            startLat: 43.6532, startLng: -79.3832,  // Toronto
            endLat: 19.0760, endLng: 72.8777,       // Mumbai
            color: '#ec4899'
          }
        ];

        // Create Globe instance
        const Globe = new ThreeGlobe({
            waitForGlobeReady: true,
            animateIn: true,
        })
          .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
          .arcsData(arcsData)
          .arcColor('color')
          .arcDashLength(0.4)
          .arcDashGap(0.2)
          .arcDashAnimateTime(1500)
          .arcStroke(0.5)
          .arcAltitude(0.3);

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current?.clientWidth || 0, mountRef.current?.clientHeight || 0);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.setClearColor(0x000000, 0);
        mountRef.current?.appendChild(renderer.domElement);

        // Setup scene
        const scene = new THREE.Scene();
        scene.add(Globe);
        scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
        scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));

        // Setup camera
        const height = mountRef.current?.clientHeight || 1;
        const width = mountRef.current?.clientWidth || 1;
        const camera = new THREE.PerspectiveCamera();
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        // Look at North America
        camera.position.y = 100; // Move camera up slightly
        camera.position.x = -300; // Move camera to the left for North America view
        camera.position.z = -1; // Extremely close zoom - negative values go through the globe surface

        // Add camera controls
        const { TrackballControls } = await import('three/examples/jsm/controls/TrackballControls.js');
        const tbControls = new TrackballControls(camera, renderer.domElement);
        tbControls.minDistance = -100; // Allow much closer zooming
        tbControls.rotateSpeed = 0;
        tbControls.zoomSpeed = 0;

        // Handle resize
        const handleResize = () => {
          if (mountRef.current) {
            const width = mountRef.current?.clientWidth || 1;
            const height = mountRef.current?.clientHeight || 1;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          tbControls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };

      } catch (error) {
        console.error('Failed to initialize globe:', error);
      }
    };

    initGlobe();
  }, [isClient]);

  return (
    <div className="hidden sm:block h-[400px] sm:h-[500px] lg:h-[600px] mb-2">
      {!isClient ? (
        // Loading state for SSR
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-mfr-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading global network...</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mountRef} className="w-full h-full" />
        </>
      )}
    </div>
  );
}
