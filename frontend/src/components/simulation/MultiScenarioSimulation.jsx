import React, { useState, useEffect } from 'react';

export const MultiScenarioSimulation = ({ machineId }) => {
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