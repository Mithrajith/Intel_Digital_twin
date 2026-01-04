import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Grid, Environment, ContactShadows, Stage, Edges, Html, useProgress } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import * as THREE from 'three';

function Loader() {
  const { progress } = useProgress()
  return <Html center><div className="text-slate-800 font-mono">{progress.toFixed(1)} % loaded</div></Html>
}

// Robot Link Component
const RobotLink = ({ url, color = "#e2e8f0", ...props }) => {
  const geom = useLoader(STLLoader, url);
  
  return (
    <group {...props}>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshPhysicalMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.2} 
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
        {/* Add edges to make the geometry pop */}
        <Edges threshold={30} color="black" opacity={0.1} />
      </mesh>
      {props.children}
    </group>
  );
};

// Cargo Component
const Cargo = ({ position, color = "#f59e0b" }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[0.04, 0.04, 0.04]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    <Edges color="black" />
  </mesh>
);

// Debug Bone Component
const Bone = ({ length }) => (
  <mesh position={[0, 0, length / 2]}>
    <cylinderGeometry args={[0.005, 0.005, length, 8]} />
    <meshBasicMaterial color="yellow" depthTest={false} transparent opacity={0.5} />
  </mesh>
);

export function RobotArm({ jointAngles = {} }) {
  const {
    joint_1 = 0,
    joint_2 = -15,
    joint_3 = 45,
    joint_4 = 30,
    joint_5 = 0
  } = jointAngles;

  // Convert to radians
  const j1 = joint_1 * (Math.PI / 180);
  const j2 = joint_2 * (Math.PI / 180);
  const j3 = joint_3 * (Math.PI / 180);
  const j4 = joint_4 * (Math.PI / 180);
  const j5 = joint_5 * (Math.PI / 180);

  // Refs for logic
  const gripperRef = useRef();
  
  // Cargo State (Removed for now)
  // const [cargoPos, setCargoPos] = useState(new THREE.Vector3(0, 0.02, 0.21)); 
  // const [isAttached, setIsAttached] = useState(false);
  // const [debugDist, setDebugDist] = useState(0);

  useFrame(() => {
    if (!gripperRef.current) return;

    // Get Gripper World Position
    const gripperPos = new THREE.Vector3();
    gripperRef.current.getWorldPosition(gripperPos);
    
    // Logic:
    // 1. Check if gripper is "Closed" (Joint 5 > 45 deg)
    // const isClosed = Math.abs(joint_5) > 45;

    // 2. Check distance to cargo
    // const dist = gripperPos.distanceTo(cargoPos);
    // setDebugDist(dist); // Update debug info
    
    // const pickThreshold = 0.3; // Increased threshold

    // DEBUG: Magnet Mode - Attach if close, regardless of gripper state
    // if (dist < pickThreshold && !isAttached) {
    //   setIsAttached(true);
    // } 
    // Drop only if gripper is explicitly OPEN (and we were attached)
    // But since we are in magnet mode, let's just hold it forever for this test
    // else if (!isClosed && isAttached) {
    //   setIsAttached(false);
    // }

    // 3. Update Cargo Position
    // if (isAttached) {
    //   setCargoPos(gripperPos.clone());
    // } else {
    //   // Fall to ground (simple physics)
    //   if (cargoPos.y > 0.02) {
    //     setCargoPos(p => new THREE.Vector3(p.x, Math.max(0.02, p.y - 0.01), p.z));
    //   }
    // }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Debug Info */}
      <Html position={[0.5, 0.5, 0]}>
        <div className="bg-white/80 p-2 rounded text-xs font-mono">
          <div>J1: {joint_1.toFixed(1)}</div>
          <div>J2: {joint_2.toFixed(1)}</div>
          <div>J3: {joint_3.toFixed(1)}</div>
          {/* <div>Cargo: {cargoPos.x.toFixed(2)}, {cargoPos.y.toFixed(2)}, {cargoPos.z.toFixed(2)}</div>
          <div>Dist: {debugDist.toFixed(3)}</div>
          <div>Closed: {Math.abs(joint_5) > 45 ? 'YES' : 'NO'}</div>
          <div>Attached: {isAttached ? 'YES' : 'NO'}</div> */}
        </div>
      </Html>

      {/* Cargo Object */}
      {/* <Cargo position={cargoPos} /> */}

      {/* Robot Base - Rotate -90 X to align Z-up meshes to Y-up world */}
      <group rotation={[-Math.PI / 2, 0, 0]}> 
        
        {/* Base Link Visual */}
        <RobotLink url="/meshes/base_link.STL" color="#334155" />

        {/* Joint 1 (Waist) */}
        <group position={[0, 0, 0.01]} rotation={[0, 0, j1]}>
            <RobotLink url="/meshes/link1.STL" color="#475569" />

            {/* Joint 2 (Shoulder) */}
            <group position={[0, 0, 0.0361]} rotation={[j2, 0, 0]}>
                <RobotLink url="/meshes/link2.STL" color="#2563eb" />

                {/* Joint 3 (Elbow) */}
                <group position={[0, 0, 0.1005]} rotation={[j3, 0, 0]}>
                    <RobotLink url="/meshes/link3.STL" color="#2563eb" />

                    {/* Joint 4 (Wrist Pitch) */}
                    <group position={[0, 0, 0.0947]} rotation={[j4, 0, 0]}>
                        <RobotLink url="/meshes/link4.STL" color="#2563eb" />

                        {/* Joint 5 (Wrist Roll) */}
                        <group position={[0, 0, 0.0507]} rotation={[0, 0, j5]}>
                            <RobotLink url="/meshes/link5.STL" color="#0f172a" />

                            {/* Gripper Ref */}
                            <group ref={gripperRef} position={[0, 0, 0.04]} />
                        </group>
                    </group>
                </group>
            </group>
        </group>
      </group>
    </group>
  );
}

export function RobotScene({ jointAngles }) {
  return (
    <div className="w-full h-full min-h-[500px] bg-gray-100 rounded-lg overflow-hidden shadow-2xl border border-slate-200">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0.8, 0.6, 0.8], fov: 45 }}>
        <Suspense fallback={<Loader />}>
          <group position={[0, 0, 0]}>
            <RobotArm jointAngles={jointAngles} />
          </group>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Environment preset="city" />
          
          <Grid 
            renderOrder={-1} 
            position={[0, -0.01, 0]} 
            infiniteGrid 
            cellSize={0.1} 
            sectionSize={0.5} 
            fadeDistance={2} 
            sectionColor="#94a3b8" 
            cellColor="#e2e8f0" 
          />
          <ContactShadows opacity={0.4} scale={10} blur={2} far={2} resolution={256} color="#000000" />
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}
