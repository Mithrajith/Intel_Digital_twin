import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useSimulatedSensor } from '../hooks/useSimulatedSensor';
import RealTimeCharts from '../components/charts/RealTimeCharts';
import { AIPredictionPanel } from '../components/charts/AIPredictionPanel';
import { MachineTypeSelector } from '../components/common/MachineTypeSelector';
import HistoricalPlayback from '../components/playback/HistoricalPlayback';
import DataExport from '../components/export/DataExport';
import ControlButtons from '../components/controls/ControlButtons';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { getMachineTypeConfig } from '../config/machineTypes';
import { Calendar } from 'lucide-react';

// Multi-scenario Simulation Component
const MultiScenarioSimulation = ({ machineId }) => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [comparisonData, setComparisonData] = useState({});
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    setLoadingScenarios(true);
    try {
      const response = await fetch('http://localhost:7000/scenarios');
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
    } finally {
      setLoadingScenarios(false);
    }
  };

  const activateScenario = async (scenarioId) => {
    try {
      const response = await fetch(`http://localhost:7000/scenarios/${scenarioId}/activate`, {
        method: 'POST'
      });
      if (response.ok) {
        setActiveScenario(scenarioId);
        const scenario = scenarios.find(s => s.id === scenarioId);
        console.log(`Activated scenario: ${scenario?.name}`);
      }
    } catch (error) {
      console.error('Failed to activate scenario:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Multi-Scenario Simulation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {scenarios.map(scenario => (
            <div 
              key={scenario.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                activeScenario === scenario.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => activateScenario(scenario.id)}
            >
              <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  scenario.severity === 'high' ? 'bg-red-100 text-red-700' :
                  scenario.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {scenario.severity}
                </span>
                {activeScenario === scenario.id && (
                  <span className="text-xs text-blue-600 font-medium">ACTIVE</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Scenario Comparison Tools */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-700 mb-3">Scenario Comparison</h4>
          <div className="grid grid-cols-2 gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Compare Scenarios
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
              Export Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Failure Mode Injection Component  
const FailureModeInjection = ({ machineId }) => {
  const [failureModes, setFailureModes] = useState([]);
  const [activeFailures, setActiveFailures] = useState([]);
  const [progressiveFailures, setProgressiveFailures] = useState([]);

  useEffect(() => {
    fetchFailureModes();
  }, []);

  const fetchFailureModes = async () => {
    try {
      const response = await fetch('http://localhost:7000/failure-modes');
      if (response.ok) {
        const data = await response.json();
        setFailureModes(data);
      }
    } catch (error) {
      console.error('Failed to fetch failure modes:', error);
    }
  };

  const injectFailure = async (failureId) => {
    try {
      const response = await fetch(`http://localhost:7000/failure-modes/${failureId}/activate`, {
        method: 'POST'
      });
      if (response.ok) {
        setActiveFailures(prev => [...prev, failureId]);
      }
    } catch (error) {
      console.error('Failed to inject failure:', error);
    }
  };

  const removeFailure = async (failureId) => {
    try {
      const response = await fetch(`http://localhost:7000/failure-modes/${failureId}/deactivate`, {
        method: 'POST'
      });
      if (response.ok) {
        setActiveFailures(prev => prev.filter(id => id !== failureId));
      }
    } catch (error) {
      console.error('Failed to remove failure:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Failure Mode Injection</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Failure Modes */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Available Failure Modes</h4>
            <div className="space-y-3">
              {failureModes.map(failure => (
                <div 
                  key={failure.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{failure.name}</h5>
                      <p className="text-sm text-gray-600">{failure.description}</p>
                    </div>
                    <button
                      onClick={() => activeFailures.includes(failure.id) 
                        ? removeFailure(failure.id) 
                        : injectFailure(failure.id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        activeFailures.includes(failure.id)
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {activeFailures.includes(failure.id) ? 'Remove' : 'Inject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progressive Failure Modeling */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Progressive Failure Modeling</h4>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-800">Bearing Degradation</h5>
                <div className="mt-2">
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '35%'}}></div>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">35% degraded - 6 months remaining</p>
                </div>
              </div>
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h5 className="font-medium text-red-800">Motor Overheating</h5>
                <div className="mt-2">
                  <div className="w-full bg-red-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                  <p className="text-xs text-red-700 mt-1">Critical - Immediate attention required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Maintenance Scheduling UI Component
const MaintenanceSchedulingUI = ({ machineId }) => {
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [costOptimization, setCostOptimization] = useState(null);

  useEffect(() => {
    fetchMaintenanceTasks();
    fetchCalendarData();
    calculateCostOptimization();
  }, []);

  const fetchMaintenanceTasks = async () => {
    try {
      const response = await fetch('http://localhost:7000/maintenance-tasks');
      if (response.ok) {
        const data = await response.json();
        setMaintenanceTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance tasks:', error);
    }
  };

  const fetchCalendarData = async () => {
    // Mock calendar data
    const mockCalendar = [
      { date: '2026-01-05', task: 'Bearing Inspection', priority: 'high', duration: '4h' },
      { date: '2026-01-10', task: 'Cooling System Check', priority: 'medium', duration: '2h' },
      { date: '2026-01-15', task: 'Motor Calibration', priority: 'low', duration: '1h' },
    ];
    setCalendar(mockCalendar);
  };

  const calculateCostOptimization = () => {
    const optimization = {
      currentCost: 15000,
      optimizedCost: 12500,
      savings: 2500,
      recommendations: [
        'Combine bearing inspection with motor calibration',
        'Schedule cooling system maintenance during regular downtime',
        'Use predictive maintenance to extend intervals'
      ]
    };
    setCostOptimization(optimization);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Calendar */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Maintenance Calendar
          </h3>
          
          <div className="space-y-3">
            {calendar.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{event.task}</h4>
                  <p className="text-sm text-gray-600">{event.date} - {event.duration}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  event.priority === 'high' ? 'bg-red-100 text-red-700' :
                  event.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {event.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Prioritization */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4">Task Prioritization</h3>
          
          <div className="space-y-3">
            {maintenanceTasks.slice(0, 5).map((task, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  <span>Est. Duration: {task.estimated_duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Optimization Dashboard */}
      {costOptimization && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4">Cost Optimization Dashboard</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Current Annual Cost</p>
              <p className="text-2xl font-bold text-gray-900">${costOptimization.currentCost.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Optimized Cost</p>
              <p className="text-2xl font-bold text-green-600">${costOptimization.optimizedCost.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Potential Savings</p>
              <p className="text-2xl font-bold text-blue-600">${costOptimization.savings.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">Optimization Recommendations</h4>
            <ul className="space-y-2">
              {costOptimization.recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export function ComprehensivePage() {
  const [selectedMachineId, setSelectedMachineId] = useState('robot_01');
  const [selectedMachineType, setSelectedMachineType] = useState('robotic_arm_2axis');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Get machine type configuration
  const machineConfig = getMachineTypeConfig(selectedMachineType);
  
  const data = useSimulatedSensor(isPlaying, 1000, selectedMachineId);

  const tabs = [
    { name: 'Real-time Charts', key: 'realtime' },
    { name: 'AI Predictions', key: 'ai' },
    { name: 'Historical Playback', key: 'historical' },
    { name: 'Data Export', key: 'export' },
    { name: 'Control Panel', key: 'controls' },
    { name: 'Multi-Scenario', key: 'scenarios' },
    { name: 'Failure Injection', key: 'failures' },
    { name: 'Maintenance', key: 'maintenance' }
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    // Additional reset logic
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comprehensive Digital Twin Platform</h1>
          <p className="text-gray-600 mt-1">Complete suite of industrial IoT, AI prediction, and maintenance management tools</p>
        </div>
        
        {/* Machine Type Selector */}
        <div className="min-w-[300px]">
          <MachineTypeSelector 
            selectedMachineType={selectedMachineType}
            onMachineTypeChange={setSelectedMachineType}
          />
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 px-3 text-sm font-medium leading-5 transition-all
                 ${selected
                   ? 'bg-white text-blue-700 shadow'
                   : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                 }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {/* Real-time Charts */}
          <Tab.Panel>
            <div className="space-y-6">
              <RealTimeCharts machineId={selectedMachineId} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeSeriesChart 
                  title="Temperature Trends"
                  data={data}
                  dataKey="temperature"
                  color="#ef4444"
                  height={300}
                  yDomain={[20, 100]}
                  threshold={70}
                  chartType="realtime"
                />
                <TimeSeriesChart 
                  title="Vibration Analysis"
                  data={data}
                  dataKey="vibration"
                  color="#3b82f6"
                  height={300}
                  yDomain={[0, 5]}
                  threshold={3}
                  chartType="realtime"
                />
              </div>
            </div>
          </Tab.Panel>

          {/* AI Predictions */}
          <Tab.Panel>
            <AIPredictionPanel data={data} machineId={selectedMachineId} />
          </Tab.Panel>

          {/* Historical Playback */}
          <Tab.Panel>
            <HistoricalPlayback data={data} machineId={selectedMachineId} />
          </Tab.Panel>

          {/* Data Export */}
          <Tab.Panel>
            <DataExport data={data} machineId={selectedMachineId} />
          </Tab.Panel>

          {/* Control Panel */}
          <Tab.Panel>
            <ControlButtons 
              machineId={selectedMachineId}
              onStateChange={(state) => console.log('State changed:', state)}
            />
          </Tab.Panel>

          {/* Multi-Scenario Simulation */}
          <Tab.Panel>
            <MultiScenarioSimulation machineId={selectedMachineId} />
          </Tab.Panel>

          {/* Failure Mode Injection */}
          <Tab.Panel>
            <FailureModeInjection machineId={selectedMachineId} />
          </Tab.Panel>

          {/* Maintenance Scheduling */}
          <Tab.Panel>
            <MaintenanceSchedulingUI machineId={selectedMachineId} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default ComprehensivePage;