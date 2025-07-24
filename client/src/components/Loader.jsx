import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Loader = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('Initializing...');

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
    camera.position.z = 8;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    // Create multiple particle systems
    const particleSystems = [];

    // Main particle system - floating particles
    const createParticleSystem = (count, color, size, speed) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const velocities = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Position in sphere
        const radius = Math.random() * 15 + 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Color variations
        colors[i3] = color.r + (Math.random() - 0.5) * 0.2;
        colors[i3 + 1] = color.g + (Math.random() - 0.5) * 0.2;
        colors[i3 + 2] = color.b + (Math.random() - 0.5) * 0.2;
        
        // Size
        sizes[i] = Math.random() * size + 1;
        
        // Velocity
        velocities[i3] = (Math.random() - 0.5) * speed;
        velocities[i3 + 1] = (Math.random() - 0.5) * speed;
        velocities[i3 + 2] = (Math.random() - 0.5) * speed;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          opacity: { value: 1.0 }
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          attribute vec3 velocity;
          varying vec3 vColor;
          varying float vAlpha;
          uniform float time;
          
          void main() {
            vColor = color;
            vec3 pos = position;
            
            // Complex movement patterns
            pos += velocity * time * 0.5;
            pos.x += sin(time * 2.0 + position.y * 0.1) * 2.0;
            pos.y += cos(time * 1.5 + position.z * 0.1) * 2.0;
            pos.z += sin(time * 1.8 + position.x * 0.1) * 1.5;
            
            // Pulsing effect
            float pulse = sin(time * 3.0 + length(position) * 0.1) * 0.5 + 0.5;
            vAlpha = pulse * 0.8 + 0.2;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (400.0 / -mvPosition.z) * (pulse * 0.5 + 0.5);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          uniform float opacity;
          
          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float distance = length(center);
            
            // Create a glowing effect
            float glow = 1.0 - smoothstep(0.0, 0.5, distance);
            float core = 1.0 - smoothstep(0.0, 0.2, distance);
            
            float alpha = (glow * 0.3 + core * 0.7) * vAlpha * opacity;
            
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      return new THREE.Points(geometry, material);
    };

    // Create multiple particle systems with different colors and behaviors
    particleSystems.push(createParticleSystem(200, {r: 0.0, g: 0.83, b: 1.0}, 4, 0.5)); // Cyan
    particleSystems.push(createParticleSystem(150, {r: 0.2, g: 0.6, b: 1.0}, 3, 0.3)); // Light blue
    particleSystems.push(createParticleSystem(100, {r: 1.0, g: 1.0, b: 1.0}, 2, 0.2)); // White
    particleSystems.push(createParticleSystem(80, {r: 0.8, g: 0.2, b: 1.0}, 5, 0.1)); // Purple

    particleSystems.forEach(system => scene.add(system));

    // Create central energy sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float time;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          vec3 pos = position;
          pos += normal * sin(time * 4.0 + position.x * 10.0) * 0.1;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float time;
        uniform float opacity;
        
        void main() {
          vec3 color1 = vec3(0.0, 0.83, 1.0);
          vec3 color2 = vec3(0.8, 0.2, 1.0);
          
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 color = mix(color1, color2, fresnel);
          
          float pulse = sin(time * 3.0) * 0.3 + 0.7;
          
          gl_FragColor = vec4(color, opacity * pulse);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const energySphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(energySphere);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Update all particle systems
      particleSystems.forEach((system, index) => {
        if (system.material.uniforms) {
          system.material.uniforms.time.value = time;
        }
        
        // Different rotation speeds for each system
        system.rotation.x = time * (0.1 + index * 0.05);
        system.rotation.y = time * (0.15 + index * 0.03);
        system.rotation.z = time * (0.08 + index * 0.02);
      });
      
      // Update energy sphere
      if (sphereMaterial.uniforms) {
        sphereMaterial.uniforms.time.value = time;
      }
      energySphere.rotation.x = time * 0.5;
      energySphere.rotation.y = time * 0.7;
      
      // Camera movement
      camera.position.x = Math.sin(time * 0.2) * 2;
      camera.position.y = Math.cos(time * 0.15) * 1;
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

    // Progress simulation
    const progressTexts = [
      'Initializing...',
      'Loading Assets...',
      'Preparing Experience...',
      'Almost Ready...',
      'Welcome to PIARA!'
    ];

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep++;
      if (currentStep < progressTexts.length) {
        setCurrentText(progressTexts[currentStep]);
        setProgress((currentStep / (progressTexts.length - 1)) * 100);
      }
    }, 800);

    // Auto-complete after 5 seconds
    const timer = setTimeout(() => {
      setProgress(100);
      setCurrentText('Welcome to PIARA!');
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 5000);

    // Cleanup
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        particleSystems.forEach(system => {
          scene.remove(system);
          system.geometry.dispose();
          system.material.dispose();
        });
        scene.remove(energySphere);
        sphereGeometry.dispose();
        sphereMaterial.dispose();
      }
    };
  }, [onComplete]);

  return (
    <div className="loader">
      <div className="loader-content">
        <div className="piara-logo">
          <div className="letter" data-letter="P">P</div>
          <div className="letter" data-letter="I">I</div>
          <div className="letter" data-letter="A">A</div>
          <div className="letter" data-letter="R">R</div>
          <div className="letter" data-letter="A">A</div>
        </div>
        <div className="loader-text">AGENCY</div>
        <div className="loading-bar">
          <div className="loading-progress" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="loader-status">{currentText}</div>
        <div className="loader-subtitle">Turning Market Potential Into Market Presence</div>
      </div>
      <canvas ref={canvasRef} className="loader-canvas"></canvas>
    </div>
  );
};

export default Loader;

