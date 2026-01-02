// Machine Types Configuration
export const MACHINE_TYPES = {
  ROBOTIC_ARM_2AXIS: {
    id: 'robotic_arm_2axis',
    name: '2-Axis Robotic Arm',
    description: 'Industrial robotic arm with 2 degrees of freedom',
    icon: '🤖',
    sensors: {
      joint_1_angle: { name: 'Joint 1 Angle', unit: '°', range: [0, 180], color: '#3b82f6' },
      joint_2_angle: { name: 'Joint 2 Angle', unit: '°', range: [0, 180], color: '#10b981' },
      motor_torque: { name: 'Motor Torque', unit: 'Nm', range: [0, 50], color: '#f59e0b' },
      temperature_core: { name: 'Core Temperature', unit: '°C', range: [20, 100], color: '#ef4444' },
      vibration_level: { name: 'Vibration Level', unit: 'g', range: [0, 5], color: '#8b5cf6' },
      power_consumption: { name: 'Power Consumption', unit: 'W', range: [0, 1000], color: '#06b6d4' }
    },
    failureModes: [
      { id: 'bearing_wear', name: 'Bearing Wear', component: 'Joint Bearing', severity: 'medium' },
      { id: 'motor_overheat', name: 'Motor Overheating', component: 'Drive Motor', severity: 'high' },
      { id: 'encoder_drift', name: 'Encoder Drift', component: 'Position Sensor', severity: 'low' }
    ],
    maintenanceTasks: [
      { task: 'Bearing Lubrication', interval: 30, duration: '1h', cost: 150 },
      { task: 'Motor Inspection', interval: 90, duration: '2h', cost: 300 },
      { task: 'Calibration Check', interval: 180, duration: '4h', cost: 500 }
    ]
  },
  CNC_MACHINE: {
    id: 'cnc_machine',
    name: 'CNC Milling Machine',
    description: '3-axis CNC milling machine for precision manufacturing',
    icon: '⚙️',
    sensors: {
      spindle_speed: { name: 'Spindle Speed', unit: 'RPM', range: [0, 12000], color: '#3b82f6' },
      feed_rate: { name: 'Feed Rate', unit: 'mm/min', range: [0, 1000], color: '#10b981' },
      cutting_force: { name: 'Cutting Force', unit: 'N', range: [0, 2000], color: '#f59e0b' },
      spindle_temperature: { name: 'Spindle Temperature', unit: '°C', range: [20, 120], color: '#ef4444' },
      vibration_spindle: { name: 'Spindle Vibration', unit: 'g', range: [0, 10], color: '#8b5cf6' },
      coolant_flow: { name: 'Coolant Flow', unit: 'L/min', range: [0, 50], color: '#06b6d4' }
    },
    failureModes: [
      { id: 'tool_wear', name: 'Tool Wear', component: 'Cutting Tool', severity: 'medium' },
      { id: 'spindle_bearing', name: 'Spindle Bearing Failure', component: 'Spindle', severity: 'high' },
      { id: 'coolant_leak', name: 'Coolant System Leak', component: 'Coolant Pump', severity: 'low' }
    ],
    maintenanceTasks: [
      { task: 'Tool Replacement', interval: 7, duration: '30m', cost: 80 },
      { task: 'Spindle Maintenance', interval: 60, duration: '3h', cost: 800 },
      { task: 'Coolant System Check', interval: 14, duration: '1h', cost: 120 }
    ]
  },
  CONVEYOR_SYSTEM: {
    id: 'conveyor_system',
    name: 'Conveyor Belt System',
    description: 'Automated conveyor belt for material handling',
    icon: '📦',
    sensors: {
      belt_speed: { name: 'Belt Speed', unit: 'm/min', range: [0, 100], color: '#3b82f6' },
      motor_load: { name: 'Motor Load', unit: '%', range: [0, 100], color: '#10b981' },
      belt_tension: { name: 'Belt Tension', unit: 'N', range: [0, 5000], color: '#f59e0b' },
      bearing_temperature: { name: 'Bearing Temperature', unit: '°C', range: [20, 80], color: '#ef4444' },
      vibration_motor: { name: 'Motor Vibration', unit: 'g', range: [0, 8], color: '#8b5cf6' },
      current_draw: { name: 'Current Draw', unit: 'A', range: [0, 30], color: '#06b6d4' }
    },
    failureModes: [
      { id: 'belt_slip', name: 'Belt Slippage', component: 'Drive Belt', severity: 'medium' },
      { id: 'roller_seizure', name: 'Roller Seizure', component: 'Drive Roller', severity: 'high' },
      { id: 'sensor_failure', name: 'Sensor Malfunction', component: 'Speed Sensor', severity: 'low' }
    ],
    maintenanceTasks: [
      { task: 'Belt Inspection', interval: 21, duration: '1h', cost: 100 },
      { task: 'Roller Lubrication', interval: 45, duration: '2h', cost: 200 },
      { task: 'Motor Maintenance', interval: 120, duration: '4h', cost: 600 }
    ]
  },
  PUMP_SYSTEM: {
    id: 'pump_system',
    name: 'Centrifugal Pump',
    description: 'Industrial centrifugal pump for fluid handling',
    icon: '💧',
    sensors: {
      flow_rate: { name: 'Flow Rate', unit: 'L/min', range: [0, 1000], color: '#3b82f6' },
      pressure_discharge: { name: 'Discharge Pressure', unit: 'bar', range: [0, 20], color: '#10b981' },
      pump_efficiency: { name: 'Pump Efficiency', unit: '%', range: [0, 100], color: '#f59e0b' },
      bearing_temperature: { name: 'Bearing Temperature', unit: '°C', range: [20, 90], color: '#ef4444' },
      vibration_pump: { name: 'Pump Vibration', unit: 'g', range: [0, 12], color: '#8b5cf6' },
      cavitation_index: { name: 'Cavitation Index', unit: '-', range: [0, 5], color: '#06b6d4' }
    },
    failureModes: [
      { id: 'impeller_wear', name: 'Impeller Wear', component: 'Impeller', severity: 'medium' },
      { id: 'seal_leak', name: 'Mechanical Seal Leak', component: 'Mechanical Seal', severity: 'high' },
      { id: 'cavitation', name: 'Cavitation Damage', component: 'Impeller/Volute', severity: 'high' }
    ],
    maintenanceTasks: [
      { task: 'Seal Inspection', interval: 60, duration: '2h', cost: 300 },
      { task: 'Impeller Check', interval: 90, duration: '3h', cost: 500 },
      { task: 'Alignment Verification', interval: 180, duration: '4h', cost: 400 }
    ]
  }
};

export const getMachineTypeConfig = (machineTypeId) => {
  return MACHINE_TYPES[machineTypeId.toUpperCase()] || MACHINE_TYPES.ROBOTIC_ARM_2AXIS;
};

export const getAllMachineTypes = () => {
  return Object.values(MACHINE_TYPES);
};

export const getMachineTypeSensors = (machineTypeId) => {
  const config = getMachineTypeConfig(machineTypeId);
  return config.sensors;
};

export const getMachineTypeFailures = (machineTypeId) => {
  const config = getMachineTypeConfig(machineTypeId);
  return config.failureModes;
};

export const getMachineTypeMaintenance = (machineTypeId) => {
  const config = getMachineTypeConfig(machineTypeId);
  return config.maintenanceTasks;
};