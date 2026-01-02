import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, Wrench, Brain, CheckCircle, XCircle } from 'lucide-react';

const AIPredictionPanel = ({ machineId = 'robot_01' }) => {
  const [predictions, setPredictions] = useState({
    rul: { value: 0, confidence: 0, unit: 'hours' },
    anomalies: [],
    recommendations: [],
    health_score: 0,
    last_updated: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock AI predictions (in real system, this would call ML models)
  const generatePredictions = () => {
    const health_score = Math.random() * 100;
    const rul_hours = Math.random() * 2000 + 100; // 100-2100 hours
    
    const anomalies = [];
    if (health_score < 30) {
      anomalies.push({
        type: 'critical',
        message: 'Bearing temperature trending upward - immediate attention required',
        confidence: 0.92,
        timestamp: new Date()
      });
    }
    if (health_score < 50) {
      anomalies.push({
        type: 'warning',
        message: 'Vibration levels showing irregular patterns',
        confidence: 0.78,
        timestamp: new Date()
      });
    }
    if (health_score < 70) {
      anomalies.push({
        type: 'info',
        message: 'Power consumption slightly elevated',
        confidence: 0.65,
        timestamp: new Date()
      });
    }
    
    const recommendations = [];
    if (health_score < 40) {
      recommendations.push({
        action: 'Schedule immediate bearing replacement',
        priority: 'critical',
        estimated_cost: 350,
        estimated_time: 180
      });
    }
    if (health_score < 60) {
      recommendations.push({
        action: 'Perform lubrication maintenance',
        priority: 'medium',
        estimated_cost: 50,
        estimated_time: 45
      });
    }
    if (health_score < 80) {
      recommendations.push({
        action: 'Schedule routine inspection',
        priority: 'low',
        estimated_cost: 100,
        estimated_time: 60
      });
    }
    
    return {
      rul: {
        value: rul_hours,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        unit: 'hours'
      },
      anomalies,
      recommendations,
      health_score,
      last_updated: new Date()
    };
  };

  useEffect(() => {
    // Initial load
    setTimeout(() => {
      setPredictions(generatePredictions());
      setIsLoading(false);
    }, 1000);
    
    // Update predictions periodically
    const interval = setInterval(() => {
      setPredictions(generatePredictions());
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [machineId]);

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'critical': return <XCircle className="text-red-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'info': return <CheckCircle className="text-blue-500" size={20} />;
      default: return <AlertTriangle className="text-gray-500" size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Brain className="mr-2 text-purple-600" size={24} />
          <h2 className="text-xl font-bold">AI Predictions</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Analyzing sensor data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="mr-2 text-purple-600" size={24} />
          <h2 className="text-xl font-bold">AI Predictions - {machineId}</h2>
        </div>
        <div className="text-sm text-gray-500">
          Updated: {predictions.last_updated?.toLocaleTimeString()}
        </div>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Health Score</p>
              <p className={`text-2xl font-bold ${getHealthColor(predictions.health_score).split(' ')[0]}`}>
                {predictions.health_score.toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${getHealthColor(predictions.health_score)}`}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                predictions.health_score >= 80 ? 'bg-green-500' :
                predictions.health_score >= 60 ? 'bg-yellow-500' :
                predictions.health_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${predictions.health_score}%` }}
            ></div>
          </div>
        </div>

        {/* RUL Prediction */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Remaining Useful Life</p>
              <p className="text-2xl font-bold text-green-600">
                {predictions.rul.value.toFixed(0)} {predictions.rul.unit}
              </p>
              <p className="text-xs text-gray-500">
                Confidence: {(predictions.rul.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Maintenance Alert */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Maintenance Status</p>
              <p className={`text-lg font-bold ${
                predictions.recommendations.length === 0 ? 'text-green-600' :
                predictions.recommendations.some(r => r.priority === 'critical') ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {predictions.recommendations.length === 0 ? 'Good' :
                 predictions.recommendations.some(r => r.priority === 'critical') ? 'Critical' :
                 'Attention Needed'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              predictions.recommendations.length === 0 ? 'bg-green-100 text-green-600' :
              predictions.recommendations.some(r => r.priority === 'critical') ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              <Wrench size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Detection */}
      {predictions.anomalies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <AlertTriangle className="mr-2 text-yellow-600" size={20} />
            Anomaly Detection
          </h3>
          <div className="space-y-2">
            {predictions.anomalies.map((anomaly, index) => (
              <div key={index} className="flex items-start p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="mr-3 mt-0.5">
                  {getAnomalyIcon(anomaly.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{anomaly.message}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>Confidence: {(anomaly.confidence * 100).toFixed(0)}%</span>
                    <span className="mx-2">•</span>
                    <span>{anomaly.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {predictions.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Wrench className="mr-2 text-blue-600" size={20} />
            Maintenance Recommendations
          </h3>
          <div className="space-y-3">
            {predictions.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{rec.action}</p>
                    <div className="flex items-center mt-2 text-sm space-x-4">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {rec.estimated_time} min
                      </span>
                      <span className="flex items-center">
                        💰 ${rec.estimated_cost}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionPanel;