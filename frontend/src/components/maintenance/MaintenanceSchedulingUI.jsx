import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export const MaintenanceSchedulingUI = ({ machineId }) => {
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