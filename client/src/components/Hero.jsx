import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import dubaiSkyline from '../assets/images/dubai1.jpg';

const Hero = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Create multiple geometric elements
    const geometries = [];

    // 1. Animated wireframe plane
    const planeGeometry = new THREE.PlaneGeometry(25, 25, 50, 50);
    const planeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.1 }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vUv = uv;
          
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          
          // Create wave patterns
          float elevation = sin(modelPosition.x * 0.3 + time * 2.0) * 0.8;
          elevation += sin(modelPosition.y * 0.2 + time * 1.5) * 0.6;
          elevation += sin(modelPosition.x * 0.1 + modelPosition.y * 0.1 + time) * 0.4;
          
          modelPosition.z += elevation;
          vElevation = elevation;
          
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectedPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          // Create dynamic colors based on elevation
          vec3 color1 = vec3(0.0, 0.83, 1.0); // Cyan
          vec3 color2 = vec3(0.8, 0.2, 1.0);  // Purple
          vec3 color3 = vec3(0.2, 0.6, 1.0);  // Light blue
          
          float mixFactor = sin(vElevation * 2.0 + time) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, mixFactor);
          color = mix(color, color3, sin(time + vUv.x * 10.0) * 0.3 + 0.3);
          
          float alpha = (vElevation + 1.0) * 0.3 * opacity;
          alpha += sin(vUv.x * 20.0 + time * 3.0) * 0.1;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      wireframe: true
    });

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = -Math.PI * 0.4;
    planeMesh.position.y = -3;
    planeMesh.position.z = -5;
    scene.add(planeMesh);
    geometries.push(planeMesh);

    // 2. Floating geometric shapes
    const createFloatingShape = (geometry, color, position, scale) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(color) },
          opacity: { value: 0.6 }
        },
        vertexShader: `
          uniform float time;
          varying vec3 vPosition;
          varying vec3 vNormal;
          
          void main() {
            vPosition = position;
            vNormal = normal;
            
            vec3 pos = position;
            
            // Add floating animation
            pos.y += sin(time * 2.0 + position.x) * 0.2;
            pos.x += cos(time * 1.5 + position.z) * 0.1;
            pos.z += sin(time * 1.8 + position.y) * 0.15;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          uniform float opacity;
          varying vec3 vPosition;
          varying vec3 vNormal;
          
          void main() {
            // Fresnel effect
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            
            // Pulsing effect
            float pulse = sin(time * 3.0 + length(vPosition)) * 0.3 + 0.7;
            
            vec3 finalColor = color * (fresnel * 0.5 + 0.5) * pulse;
            float alpha = opacity * fresnel * pulse;
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      geometries.push(mesh);
      return mesh;
    };

    // Create various floating shapes
    createFloatingShape(
      new THREE.IcosahedronGeometry(1, 1),
      '#00d4ff',
      new THREE.Vector3(-8, 2, -3),
      0.8
    );

    createFloatingShape(
      new THREE.OctahedronGeometry(1.2),
      '#66e6ff',
      new THREE.Vector3(6, -1, -4),
      0.6
    );

    createFloatingShape(
      new THREE.TetrahedronGeometry(1),
      '#cc77ff',
      new THREE.Vector3(-4, -2, -2),
      0.7
    );

    createFloatingShape(
      new THREE.DodecahedronGeometry(0.8),
      '#99efff',
      new THREE.Vector3(8, 3, -6),
      0.9
    );

    // 3. Particle field
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Spread particles in a large area
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 20 - 10;
      
      // Color variations
      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        colors[i3] = 0.0; colors[i3 + 1] = 0.83; colors[i3 + 2] = 1.0; // Cyan
      } else if (colorChoice < 0.7) {
        colors[i3] = 0.4; colors[i3 + 1] = 0.7; colors[i3 + 2] = 1.0; // Light blue
      } else {
        colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0; // White
      }
      
      sizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Gentle floating motion
          pos.y += sin(time * 0.5 + position.x * 0.01) * 2.0;
          pos.x += cos(time * 0.3 + position.z * 0.01) * 1.0;
          
          // Distance-based alpha
          float distance = length(pos);
          vAlpha = 1.0 - smoothstep(10.0, 25.0, distance);
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * vAlpha;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float distance = length(center);
          
          if (distance > 0.5) discard;
          
          float alpha = (1.0 - distance * 2.0) * vAlpha * 0.6;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    geometries.push(particles);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Update all materials with time
      geometries.forEach((geometry, index) => {
        if (geometry.material.uniforms && geometry.material.uniforms.time) {
          geometry.material.uniforms.time.value = time;
        }
        
        // Individual rotations for floating shapes
        if (geometry.geometry instanceof THREE.IcosahedronGeometry ||
            geometry.geometry instanceof THREE.OctahedronGeometry ||
            geometry.geometry instanceof THREE.TetrahedronGeometry ||
            geometry.geometry instanceof THREE.DodecahedronGeometry) {
          geometry.rotation.x = time * (0.2 + index * 0.1);
          geometry.rotation.y = time * (0.3 + index * 0.05);
          geometry.rotation.z = time * (0.1 + index * 0.08);
        }
      });
      
      // Gentle camera movement
      camera.position.x = Math.sin(time * 0.1) * 2;
      camera.position.y = Math.cos(time * 0.08) * 1;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        geometries.forEach(geometry => {
          scene.remove(geometry);
          if (geometry.geometry) geometry.geometry.dispose();
          if (geometry.material) geometry.material.dispose();
        });
      }
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <img src={dubaiSkyline} alt="Dubai Skyline" className="hero-image" />
        <div className="hero-overlay"></div>
        <canvas ref={canvasRef} className="hero-canvas"></canvas>
      </div>
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="title-line">Turning Market Potential</span>
            <span className="title-line">Into Market <span className="highlight">Presence</span></span>
          </h1>
          <p className="hero-subtitle">
            Empowering startups and growing companies with innovative advertising, media, and marketing solutions through cinematic storytelling and data-driven strategies.
          </p>
          <div className="hero-buttons">
            <a href="#portfolio" className="btn btn-primary" onClick={() => scrollToSection('portfolio')}>
              Discover Our Work
            </a>
            <a href="#contact" className="btn btn-secondary" onClick={() => scrollToSection('contact')}>
              Get Started
            </a>
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <div className="scroll-arrow"></div>
      </div>
    </section>
  );
};

export default Hero;

