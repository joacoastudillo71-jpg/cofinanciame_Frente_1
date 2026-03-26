/// <reference types="google.maps" />
import React, { useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-ignore
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface Map3DViewerProps {
  asset: any;
  activeView?: string;
  onLoad?: () => void;
}

export interface Map3DViewerHandle {
  moveMapCamera: (options: google.maps.CameraOptions) => void;
}

const MapComponent = React.forwardRef<Map3DViewerHandle, Map3DViewerProps>(({ asset, activeView, onLoad }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<google.maps.WebGLOverlayView | null>(null);

  // Exponer funcionalidad a través de la ref (opcional ahora, pero útil)
  React.useImperativeHandle(ref, () => ({
    moveMapCamera: (options: google.maps.CameraOptions) => {
      if (googleMapInstance.current) {
        googleMapInstance.current.moveCamera(options);
      }
    }
  }));

  // LÓGICA REACTIVA DE CÁMARA
  useEffect(() => {
    const map = googleMapInstance.current;
    if (!map || !asset) return;

    const lat = parseFloat(asset?.geoLat ?? asset?.latitud ?? -2.8974);
    const lng = parseFloat(asset?.geoLng ?? asset?.longitud ?? -79.0045);
    const rot = parseFloat(asset?.geoRotation ?? asset?.rotacion ?? 0);
    const center = { lat, lng };
    
    // Extracción dinámica con Fallbacks
    const viewsConfig = asset?.metadata?.cameraViews || {};

    if (activeView === 'Ciudad') {
      map.moveCamera({ 
        center, 
        zoom: viewsConfig.ciudad?.zoom ?? 15, 
        tilt: viewsConfig.ciudad?.tilt ?? 45, 
        heading: viewsConfig.ciudad?.heading ?? 0 
      });
    } else if (activeView === 'Sector') {
      map.moveCamera({ 
        center, 
        zoom: viewsConfig.sector?.zoom ?? 17.5, 
        tilt: viewsConfig.sector?.tilt ?? 0, 
        heading: viewsConfig.sector?.heading ?? 0 
      });
    } else if (activeView === 'Barrio') {
      map.moveCamera({ 
        center, 
        zoom: viewsConfig.barrio?.zoom ?? 19.5, 
        tilt: viewsConfig.barrio?.tilt ?? 65, 
        heading: viewsConfig.barrio?.heading ?? rot 
      });
    }
  }, [activeView, asset]);

  useEffect(() => {
    if (!mapRef.current) {
      if (onLoad) onLoad();
      return;
    }

    const lat = asset?.geoLat !== undefined && asset?.geoLat !== null ? asset.geoLat : -2.8974;
    const lng = asset?.geoLng !== undefined && asset?.geoLng !== null ? asset.geoLng : -79.0045;

    // 1. Inicialización de Google Maps
    const mapOptions: google.maps.MapOptions = {
      center: { lat, lng },
      zoom: 18,
      tilt: 67,
      heading: asset?.geoRotation || 0,
      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '1ec0ca5f1906a599',
      mapTypeId: 'satellite',
      disableDefaultUI: true,
      gestureHandling: 'greedy',
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    googleMapInstance.current = map;

    // 2. Setup Base de Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);

    let renderer: THREE.WebGLRenderer;

    // 3. Inicialización del WebGLOverlayView
    const webglOverlayView = new google.maps.WebGLOverlayView();

    webglOverlayView.onAdd = () => { };

    webglOverlayView.onContextRestored = ({ gl }: any) => {
      renderer = new THREE.WebGLRenderer({
        canvas: gl.canvas,
        context: gl,
        ...gl.getContextAttributes(),
      });
      renderer.autoClear = false;

      // 1. CONFIGURACIÓN FOTORREALISTA (PBR)
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2; // Ajuste de brillo dinámico

      // CONFIGURACIÓN DEL LOADER CON DRACO DECOMPRESSION
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      loader.setDRACOLoader(dracoLoader);

      const modelUrl = asset?.r2Url || asset?.url;

      if (!modelUrl || modelUrl === 'undefined') {
        console.warn('[Map3DViewer] URL del modelo .glb no definida. Renderizando solo el mapa base.');
        if (onLoad) onLoad();
        return;
      }

      loader.load(
        modelUrl,
        (gltf: any) => {
          const model = gltf.scene;

          // 1. CARACTERIZACIÓN GEOMÉTRICA (Pivote Centralizado)
          const box = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          box.getCenter(center);

          // 2. CREACIÓN DE GRUPO CONTENEDOR (Pivote)
          const pivotGroup = new THREE.Group();
          pivotGroup.add(model);

          // 3. COMPENSACIÓN DE OFFSET: 
          // Movemos el modelo dentro del grupo para que su centro horizontal (X, Z) 
          // y su base (min Y) coincidan con el origen local (0,0,0) del pivote.
          model.position.set(-center.x, -box.min.y, -center.z);

          // 4. TRANSFORMACIONES DE ORIENTACIÓN (Aplicadas al Pivote)
          const scale = asset.geoScale || 1;
          pivotGroup.scale.set(scale, scale, scale);

          // Alineación con el sistema de coordenadas de Google Maps
          pivotGroup.rotation.x = Math.PI / 2;
          pivotGroup.rotation.y = (asset.geoRotation || 0) * (Math.PI / 180);

          scene.add(pivotGroup);

          // 5. ILUMINACIÓN BASADA EN IMÁGENES (IBL)
          // Generamos un mapa de entorno a partir de las luces de la escena
          const pmremGenerator = new THREE.PMREMGenerator(renderer);
          pmremGenerator.compileEquirectangularShader();
          
          // Creamos una textura de entorno a partir de los parámetros de escena
          scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture;

          // Forzamos actualización de materiales para PBR
          model.traverse((child: any) => {
            if (child.isMesh && child.material) {
              child.material.envMapIntensity = 1.5;
              child.material.needsUpdate = true;
            }
          });

          webglOverlayView.requestRedraw();

          if (onLoad) onLoad(); // Quita el loader de pantalla
        },
        undefined,
        (error: any) => {
          console.error('[Map3DViewer] Error cargando modelo .glb:', error);
          if (onLoad) onLoad(); // Previene que se quede colgado si falla
        }
      );
    };

    webglOverlayView.onDraw = ({ gl, transformer }: any) => {
      const lat = asset?.geoLat !== undefined && asset?.geoLat !== null ? asset.geoLat : -2.8974;
      const lng = asset?.geoLng !== undefined && asset?.geoLng !== null ? asset.geoLng : -79.0045;

      const matrix = transformer.fromLatLngAltitude({
        lat,
        lng,
        altitude: asset?.geoAlt || 0,
      });

      camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

      webglOverlayView.requestRedraw();
      renderer.render(scene, camera);
      renderer.resetState();
    };

    webglOverlayView.onRemove = () => {
      if (renderer) {
        renderer.dispose();
      }
      scene.clear();
      googleMapInstance.current = null;
    };

    webglOverlayView.setMap(map);
    overlayRef.current = webglOverlayView;

    return () => {
      webglOverlayView.setMap(null);
      if (map) {
        map.unbindAll();
      }
      googleMapInstance.current = null;
    };
  }, [asset?.id]);

  return <div ref={mapRef} className="w-full h-full rounded-md shadow-lg" />;
});

export const Map3DViewer = React.forwardRef<Map3DViewerHandle, Map3DViewerProps>(({ asset, activeView, onLoad }, ref) => {
  return (
    <div className="w-full h-full relative">
      <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <MapComponent ref={ref} asset={asset} activeView={activeView} onLoad={onLoad} />
      </Wrapper>
    </div>
  );
});

export default Map3DViewer;
