import React, { useState, useEffect } from 'react';

export const FailureModeInjection = ({ machineId }) => {
  const [failureModes, setFailureModes] = useState([]);
  const [activeFailures, setActiveFailures] = useState([]);

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