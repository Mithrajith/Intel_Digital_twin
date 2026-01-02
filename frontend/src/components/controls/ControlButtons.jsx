import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  AlertTriangle, 
  Activity, 
  Settings,
  Power,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ControlButtons = ({ machineId = 'robot_01', onStateChange }) => {
  const [systemState, setSystemState] = useState({
    simulation: {
      status: 'stopped', // stopped, running, paused
      scenario: null,
      failures: []
    },
    machine: {
      status: 'offline', // offline, online, error, maintenance
      uptime: 0,
      emergency_stop: false
    },
    ai: {
      predictions_enabled: true,
      anomaly_detection: true,
      auto_maintenance: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Mock API calls
  const apiCall = async (action, params = {}) => {
    setIsLoading(true);
    console.log(`API Call: ${action}`, params);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let newState = { ...systemState };
    
    switch (action) {
      case 'start_simulation':
        newState.simulation.status = 'running';
        newState.machine.status = 'online';
        break;
        
      case 'pause_simulation':
        newState.simulation.status = 'paused';
        break;
        
      case 'stop_simulation':
        newState.simulation.status = 'stopped';
        newState.machine.status = 'offline';
        newState.simulation.scenario = null;
        newState.simulation.failures = [];
        break;
        
      case 'emergency_stop':
        newState.simulation.status = 'stopped';
        newState.machine.status = 'error';
        newState.machine.emergency_stop = true;
        break;
        
      case 'reset_system':
        newState = {
          simulation: {
            status: 'stopped',
            scenario: null,
            failures: []
          },
          machine: {
            status: 'offline',
            uptime: 0,
            emergency_stop: false
          },
          ai: {
            predictions_enabled: true,
            anomaly_detection: true,
            auto_maintenance: false
          }
        };
        break;
        
      case 'activate_scenario':
        try {
          const response = await fetch(`http://localhost:7000/scenarios/${params.scenarioId}/activate`, {
            method: 'POST'
          });
          if (response.ok) {
            const result = await response.json();
            newState.simulation.scenario = result.scenario;
          }
        } catch (error) {
          console.error('Failed to activate scenario:', error);
        }
        break;
        
      case 'inject_failure':
        try {
          const response = await fetch(`http://localhost:7000/failure-modes/${params.failureId}/activate`, {
            method: 'POST'
          });
          if (response.ok) {
            newState.simulation.failures.push(params.failureId);
          }
        } catch (error) {
          console.error('Failed to inject failure:', error);
        }
        break;
    }
    
    setSystemState(newState);
    setLastAction({ action, timestamp: new Date(), params });
    
    if (onStateChange) {
      onStateChange(newState);
    }
    
    setIsLoading(false);
  };

  const handleAction = (action, params = {}) => {
    if (['emergency_stop', 'reset_system'].includes(action)) {
      setConfirmAction({ action, params });
    } else {
      apiCall(action, params);
    }
  };

  const confirmCriticalAction = () => {
    if (confirmAction) {
      apiCall(confirmAction.action, confirmAction.params);
      setConfirmAction(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': case 'online': return 'text-green-600 bg-green-100';
      case 'paused': case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'stopped': case 'offline': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': case 'online': return <CheckCircle size={16} />;
      case 'paused': case 'maintenance': return <Pause size={16} />;
      case 'stopped': case 'offline': return <Square size={16} />;
      case 'error': return <XCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  // Quick action scenarios and failures
  const quickScenarios = [
    { id: 2, name: 'High Load', description: 'High operational load' },
    { id: 3, name: 'Precision Mode', description: 'Low vibration precision' },
    { id: 4, name: 'Cold Environment', description: 'Cold temperature operation' }
  ];

  const quickFailures = [
    { id: 1, name: 'Bearing Wear', description: 'Early stage bearing wear' },
    { id: 3, name: 'Motor Heat', description: 'Motor overheating' },
    { id: 5, name: 'Sensor Noise', description: 'Sensor interference' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Power className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-bold">System Control - {machineId}</h2>
        </div>
        
        {lastAction && (
          <div className="text-sm text-gray-600">
            Last: {lastAction.action} at {lastAction.timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Simulation</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(systemState.simulation.status)}`}>
              {getStatusIcon(systemState.simulation.status)}
              <span className="ml-1 capitalize">{systemState.simulation.status}</span>
            </div>
          </div>
          {systemState.simulation.scenario && (
            <div className="text-xs text-blue-600">
              Scenario: {systemState.simulation.scenario.name}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Machine</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(systemState.machine.status)}`}>
              {getStatusIcon(systemState.machine.status)}
              <span className="ml-1 capitalize">{systemState.machine.status}</span>
            </div>
          </div>
          {systemState.machine.emergency_stop && (
            <div className="text-xs text-red-600 flex items-center">
              <AlertTriangle size={12} className="mr-1" />
              Emergency Stop Active
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">AI Systems</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
              systemState.ai.predictions_enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
            }`}>
              <Activity size={12} />
              <span className="ml-1">{systemState.ai.predictions_enabled ? 'Active' : 'Disabled'}</span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Anomaly Detection: {systemState.ai.anomaly_detection ? 'On' : 'Off'}
          </div>
        </div>
      </div>

      {/* Main Control Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => handleAction('start_simulation')}
          disabled={isLoading || systemState.simulation.status === 'running'}
          className="flex flex-col items-center p-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          <Play size={24} className="mb-2" />
          <span className="text-sm font-medium">Start</span>
        </button>
        
        <button
          onClick={() => handleAction(
            systemState.simulation.status === 'running' ? 'pause_simulation' : 'start_simulation'
          )}
          disabled={isLoading || systemState.simulation.status === 'stopped'}
          className="flex flex-col items-center p-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          <Pause size={24} className="mb-2" />
          <span className="text-sm font-medium">Pause</span>
        </button>
        
        <button
          onClick={() => handleAction('stop_simulation')}
          disabled={isLoading || systemState.simulation.status === 'stopped'}
          className="flex flex-col items-center p-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          <Square size={24} className="mb-2" />
          <span className="text-sm font-medium">Stop</span>
        </button>
        
        <button
          onClick={() => handleAction('reset_system')}
          disabled={isLoading}
          className="flex flex-col items-center p-4 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          <RotateCcw size={24} className="mb-2" />
          <span className="text-sm font-medium">Reset</span>
        </button>
      </div>

      {/* Emergency Controls */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3 text-red-600 flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          Emergency Controls
        </h3>
        <button
          onClick={() => handleAction('emergency_stop')}
          disabled={isLoading || systemState.machine.emergency_stop}
          className="w-full flex items-center justify-center p-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-bold text-lg transition-colors"
        >
          <Zap size={24} className="mr-2" />
          EMERGENCY STOP
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Scenarios</h3>
          <div className="space-y-2">
            {quickScenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => handleAction('activate_scenario', { scenarioId: scenario.id })}
                disabled={isLoading || systemState.simulation.status !== 'running'}
                className="w-full text-left p-3 border border-gray-300 hover:bg-blue-50 disabled:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium">{scenario.name}</div>
                <div className="text-sm text-gray-600">{scenario.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Failure Injection</h3>
          <div className="space-y-2">
            {quickFailures.map(failure => (
              <button
                key={failure.id}
                onClick={() => handleAction('inject_failure', { failureId: failure.id })}
                disabled={isLoading || systemState.simulation.status !== 'running'}
                className="w-full text-left p-3 border border-orange-300 hover:bg-orange-50 disabled:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-orange-700">{failure.name}</div>
                <div className="text-sm text-gray-600">{failure.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Controls */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Settings className="mr-2" size={20} />
          AI System Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(systemState.ai).map(([key, enabled]) => (
            <label key={key} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => {
                  setSystemState(prev => ({
                    ...prev,
                    ai: { ...prev.ai, [key]: e.target.checked }
                  }));
                }}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <div>
                <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
                <div className="text-sm text-gray-600">
                  {enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-3" size={24} />
              <h3 className="text-lg font-bold">Confirm Critical Action</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to perform: <strong>{confirmAction.action.replace('_', ' ')}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCriticalAction}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlButtons;