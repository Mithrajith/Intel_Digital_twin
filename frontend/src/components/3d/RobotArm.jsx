import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Grid, Environment, ContactShadows } from '@react-three/drei';

// Simple material for the robot
const RobotMaterial = ({ color = "#4f46e5" }) => (
  <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
);

const JointMaterial = () => (
  <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
);

export function RobotArm({ jointAngles = {} }) {
  // Default angles if not provided
  const {
    joint_1 = 0,
    joint_2 = 0,
    joint_3 = 0,
    joint_4 = 0,
    joint_5 = 0
  } = jointAngles;

  // Convert degrees to radians if necessary, but assuming input is radians or we convert here
  // The simulation usually provides degrees in the flat object, let's assume radians for 3D rotation
  const j1 = joint_1 * (Math.PI / 180);
  const j2 = joint_2 * (Math.PI / 180);
  const j3 = joint_3 * (Math.PI / 180);
  const j4 = joint_4 * (Math.PI / 180);
  const j5 = joint_5 * (Math.PI / 180);

  return (
    <group position={[0, -1, 0]}>
      {/* Base Link */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 32]} />
        <RobotMaterial color="#64748b" />
      </mesh>

      {/* Joint 1 (Waist) - Rotates around Y axis (Z in URDF usually, but Y is up in Three.js) */}
      <group position={[0, 0.2, 0]} rotation={[0, -j1, 0]}>
        {/* Link 1 Visual */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.3, 0.4, 0.3]} />
          <RobotMaterial />
        </mesh>
        
        {/* Joint 2 (Shoulder) - Rotates around X axis */}
        <group position={[0, 0.4, 0]} rotation={[j2, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
            <JointMaterial />
          </mesh>
          
          {/* Link 2 Visual (Upper Arm) */}
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.2, 1.6, 0.2]} />
            <RobotMaterial />
          </mesh>

          {/* Joint 3 (Elbow) */}
          <group position={[0, 1.6, 0]} rotation={[j3, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.35, 16]} />
              <JointMaterial />
            </mesh>

            {/* Link 3 Visual (Forearm) */}
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.15, 1.2, 0.15]} />
              <RobotMaterial />
            </mesh>

            {/* Joint 4 (Wrist Pitch) */}
            <group position={[0, 1.2, 0]} rotation={[j4, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
                <JointMaterial />
              </mesh>

              {/* Link 4 Visual */}
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[0.12, 0.6, 0.12]} />
                <RobotMaterial />
              </mesh>

              {/* Joint 5 (Wrist Roll) */}
              <group position={[0, 0.6, 0]} rotation={[0, j5, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
                  <JointMaterial />
                </mesh>

                {/* Gripper Base */}
                <mesh position={[0, 0.2, 0]}>
                  <boxGeometry args={[0.2, 0.1, 0.4]} />
                  <RobotMaterial color="#333" />
                </mesh>

                {/* Fingers */}
                <mesh position={[0, 0.4, 0.15]}>
                  <boxGeometry args={[0.05, 0.4, 0.05]} />
                  <meshStandardMaterial color="#999" />
                </mesh>
                <mesh position={[0, 0.4, -0.15]}>
                  <boxGeometry args={[0.05, 0.4, 0.05]} />
                  <meshStandardMaterial color="#999" />
                </mesh>
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
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
      <Canvas>
        <PerspectiveCamera makeDefault position={[4, 4, 4]} fov={50} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, -5]} intensity={0.5} angle={0.5} penumbra={1} />
        
        <Environment preset="city" />
        
        <RobotArm jointAngles={jointAngles} />
        
        <Grid infiniteGrid fadeDistance={30} sectionColor="#4f46e5" cellColor="#333" />
        <ContactShadows opacity={0.5} scale={10} blur={1} far={10} resolution={256} color="#000000" />
      </Canvas>
    </div>
  );
}
