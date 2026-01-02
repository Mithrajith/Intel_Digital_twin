import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, Wrench, Activity, Zap, Shield } from 'lucide-react';

export const AIPredictionPanel = ({ data, machineId = 'robot_01' }) => {
  const [predictions, setPredictions] = useState({
    rul: { value: 0, confidence: 0, trend: 'stable' },
    anomaly: { score: 0, alerts: [], severity: 'low' },
    maintenance: { recommendations: [], priority: 'normal', cost: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [confidenceIntervals, setConfidenceIntervals] = useState({
    rul_lower: 0,
    rul_upper: 0,
    anomaly_lower: 0,
    anomaly_upper: 0
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      generatePredictions(latest);
    }
  }, [data]);

  const generatePredictions = async (latestData) => {
    setLoading(true);
    try {
      // RUL Prediction with confidence
      const rulValue = latestData.rul_hours || Math.max(0, 1000 - (latestData.temperature * 10) - (latestData.vibration * 100));
      const rulConfidence = Math.max(0.5, 1 - (latestData.anomaly_score || 0));
      
      // Anomaly Detection
      const anomalyScore = latestData.anomaly_score || (latestData.temperature > 70 || latestData.vibration > 3 ? 0.8 : 0.2);
      const alerts = generateAnomalyAlerts(latestData);
      
      // Maintenance Recommendations
      const recommendations = generateMaintenanceRecommendations(latestData);
      
      // Confidence Intervals (±15% for demonstration)
      setConfidenceIntervals({
        rul_lower: Math.max(0, rulValue * 0.85),
        rul_upper: rulValue * 1.15,
        anomaly_lower: Math.max(0, anomalyScore - 0.15),
        anomaly_upper: Math.min(1, anomalyScore + 0.15)
      });
      
      setPredictions({
        rul: {
          value: rulValue,
          confidence: rulConfidence,
          trend: rulValue < 100 ? 'declining' : rulValue > 500 ? 'stable' : 'moderate'
        },
        anomaly: {
          score: anomalyScore,
          alerts: alerts,
          severity: anomalyScore > 0.7 ? 'high' : anomalyScore > 0.4 ? 'medium' : 'low'
        },
        maintenance: {
          recommendations: recommendations,
          priority: anomalyScore > 0.6 || rulValue < 200 ? 'high' : 'normal',
          cost: calculateMaintenanceCost(recommendations)
        }
      });
    } catch (error) {
      console.error('Prediction generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnomalyAlerts = (data) => {
    const alerts = [];
    if (data.temperature > 70) alerts.push({ type: 'Temperature', message: 'High core temperature detected', severity: 'warning' });
    if (data.vibration > 3) alerts.push({ type: 'Vibration', message: 'Excessive vibration levels', severity: 'critical' });
    if (data.torque > 35) alerts.push({ type: 'Torque', message: 'Motor overload condition', severity: 'warning' });
    return alerts;
  };

  const generateMaintenanceRecommendations = (data) => {
    const recommendations = [];
    if (data.temperature > 60) recommendations.push({ task: 'Cooling System Check', urgency: 'medium', duration: '2h' });
    if (data.vibration > 2) recommendations.push({ task: 'Bearing Inspection', urgency: 'high', duration: '4h' });
    if (data.torque > 30) recommendations.push({ task: 'Motor Calibration', urgency: 'low', duration: '1h' });
    if (predictions.rul.value < 200) recommendations.push({ task: 'Preventive Replacement', urgency: 'high', duration: '8h' });
    return recommendations;
  };

  const calculateMaintenanceCost = (recommendations) => {
    const costMap = { 'low': 500, 'medium': 1200, 'high': 2500 };
    return recommendations.reduce((total, rec) => total + (costMap[rec.urgency] || 500), 0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          AI Prediction Panel - {machineId}
        </h3>
        {loading && <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
      </div>

      {/* RUL Prediction with Confidence Intervals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              predictions.rul.trend === 'declining' ? 'bg-red-100 text-red-700' :
              predictions.rul.trend === 'stable' ? 'bg-green-100 text-green-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {predictions.rul.trend}
            </span>
          </div>
          <h4 className="font-semibold text-gray-700 mb-1">Remaining Useful Life</h4>
          <p className="text-2xl font-bold text-blue-600">{predictions.rul.value.toFixed(0)} hrs</p>
          <div className="text-xs text-gray-500 mt-1">
            Range: {confidenceIntervals.rul_lower.toFixed(0)} - {confidenceIntervals.rul_upper.toFixed(0)} hrs
            <br />Confidence: {(predictions.rul.confidence * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              predictions.anomaly.severity === 'high' ? 'bg-red-100 text-red-700' :
              predictions.anomaly.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
              'bg-green-100 text-green-700'
            }`}>
              {predictions.anomaly.severity}
            </span>
          </div>
          <h4 className="font-semibold text-gray-700 mb-1">Anomaly Score</h4>
          <p className="text-2xl font-bold text-red-600">{(predictions.anomaly.score * 100).toFixed(1)}%</p>
          <div className="text-xs text-gray-500 mt-1">
            Range: {(confidenceIntervals.anomaly_lower * 100).toFixed(1)}% - {(confidenceIntervals.anomaly_upper * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Wrench className="h-5 w-5 text-green-600" />
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              predictions.maintenance.priority === 'high' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {predictions.maintenance.priority}
            </span>
          </div>
          <h4 className="font-semibold text-gray-700 mb-1">Maintenance Cost</h4>
          <p className="text-2xl font-bold text-green-600">${predictions.maintenance.cost.toLocaleString()}</p>
          <div className="text-xs text-gray-500 mt-1">
            {predictions.maintenance.recommendations.length} tasks recommended
          </div>
        </div>
      </div>

      {/* Anomaly Alerts */}
      {predictions.anomaly.alerts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Active Anomaly Alerts
          </h4>
          <div className="space-y-2">
            {predictions.anomaly.alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{alert.type}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Recommendations */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Predictive Maintenance Recommendations
        </h4>
        <div className="space-y-3">
          {predictions.maintenance.recommendations.map((rec, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{rec.task}</p>
                <p className="text-sm text-gray-600">Estimated duration: {rec.duration}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.urgency === 'high' ? 'bg-red-100 text-red-700' :
                  rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {rec.urgency} priority
                </span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          ))}
          {predictions.maintenance.recommendations.length === 0 && (
            <p className="text-gray-500 text-center py-4">No maintenance recommendations at this time</p>
          )}
        </div>
      </div>
    </div>
  );
};