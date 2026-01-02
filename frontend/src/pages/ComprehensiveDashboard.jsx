import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import RealTimeCharts from '../components/charts/RealTimeCharts';
import AIPredictionPanel from '../components/ai/AIPredictionPanel';
import HistoricalPlayback from '../components/playback/HistoricalPlayback';
import DataExport from '../components/export/DataExport';
import ControlButtons from '../components/controls/ControlButtons';
import { 
  Activity, 
  Brain, 
  History, 
  Download, 
  Settings,
  Gauge,
  TrendingUp
} from 'lucide-react';

const ComprehensiveDashboard = () => {
  const [selectedMachine, setSelectedMachine] = useState('robot_01');
  const [systemState, setSystemState] = useState(null);

  const machines = [
    { id: 'robot_01', name: 'Robotic Arm', type: 'robotic_arm' },
    { id: 'cnc_01', name: 'CNC Machine', type: 'cnc_milling' },
    { id: 'conveyor_01', name: 'Conveyor Belt', type: 'conveyor_belt' }
  ];

  const handleSystemStateChange = (newState) => {
    setSystemState(newState);
    console.log('System state updated:', newState);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comprehensive Digital Twin Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time monitoring, AI predictions, and system control</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Machine:</label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name}
                  </option>
                ))}
              </select>
            </div>
            
            {systemState && (
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${
                  systemState.simulation.status === 'running' ? 'bg-green-500' :
                  systemState.simulation.status === 'paused' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="capitalize">{systemState.simulation?.status || 'Unknown'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="realtime" className="flex items-center space-x-2">
            <Activity size={16} />
            <span>Real-time</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Brain size={16} />
            <span>AI Predictions</span>
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center space-x-2">
            <History size={16} />
            <span>Historical</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download size={16} />
            <span>Data Export</span>
          </TabsTrigger>
          <TabsTrigger value="control" className="flex items-center space-x-2">
            <Settings size={16} />
            <span>Control</span>
          </TabsTrigger>
        </TabsList>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="xl:col-span-2">
              <RealTimeCharts machineId={selectedMachine} />
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Gauge className="mr-2" size={20} />
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Machine Status</span>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium">247 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Health Score</span>
                    <span className="text-sm font-medium text-green-600">89%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next Maintenance</span>
                    <span className="text-sm font-medium text-orange-600">2 days</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2" size={20} />
                  Performance Trends
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Efficiency</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Reliability</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Quality</span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="ai">
          <AIPredictionPanel machineId={selectedMachine} />
        </TabsContent>

        {/* Historical Playback Tab */}
        <TabsContent value="historical">
          <HistoricalPlayback machineId={selectedMachine} />
        </TabsContent>

        {/* Data Export Tab */}
        <TabsContent value="export">
          <DataExport machineId={selectedMachine} />
        </TabsContent>

        {/* Control Tab */}
        <TabsContent value="control">
          <ControlButtons 
            machineId={selectedMachine} 
            onStateChange={handleSystemStateChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveDashboard;