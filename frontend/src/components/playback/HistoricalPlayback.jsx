import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { Play, Pause, Square, SkipBack, SkipForward, Download, Settings, RotateCcw } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const HistoricalPlayback = ({ machineId = 'robot_01' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState({
    temperature: true,
    vibration: true,
    power: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  
  const playbackRef = useRef(null);
  const intervalRef = useRef(null);
  const timelineRef = useRef(null);

  // Generate mock historical data
  const generateHistoricalData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const data = [];
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const totalHours = (endDate - startDate) / (1000 * 60 * 60);
      
      // Generate data points every hour
      for (let i = 0; i <= totalHours; i++) {
        const timestamp = new Date(startDate.getTime() + i * 60 * 60 * 1000);
        const dayProgress = (timestamp.getHours() / 24);
        
        data.push({
          timestamp,
          temperature: 45 + 10 * Math.sin(dayProgress * Math.PI * 2) + Math.random() * 5,
          vibration: 0.5 + 0.3 * Math.sin(dayProgress * Math.PI * 4) + Math.random() * 0.2,
          power: 120 + 50 * Math.sin(dayProgress * Math.PI * 2) + Math.random() * 20,
          anomalies: Math.random() > 0.95 ? {
            type: 'warning',
            message: 'Elevated vibration detected'
          } : null
        });
      }
      
      setHistoricalData(data);
      setCurrentPosition(0);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    generateHistoricalData();
  }, [dateRange]);

  useEffect(() => {
    if (isPlaying && historicalData.length > 0) {
      const interval = 100 / playbackSpeed; // Base 100ms, adjusted by speed
      
      intervalRef.current = setInterval(() => {
        setCurrentPosition(prev => {
          const next = prev + 1;
          if (next >= historicalData.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, interval);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playbackSpeed, historicalData.length]);

  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentPosition(0);
  };

  const skipForward = () => {
    setCurrentPosition(prev => Math.min(prev + Math.floor(historicalData.length / 10), historicalData.length - 1));
  };

  const skipBackward = () => {
    setCurrentPosition(prev => Math.max(prev - Math.floor(historicalData.length / 10), 0));
  };

  // Timeline scrubber click handler
  const handleTimelineClick = (event) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newPosition = Math.floor(percentage * (historicalData.length - 1));
      setCurrentPosition(Math.max(0, Math.min(historicalData.length - 1, newPosition)));
    }
  };

  // Enhanced export functionality
  const exportSession = () => {
    const currentData = historicalData.slice(0, currentPosition + 1);
    const exportData = currentData.map(item => ({
      timestamp: item.timestamp,
      ...Object.fromEntries(
        Object.entries(selectedMetrics)
          .filter(([_, isSelected]) => isSelected)
          .map(([metric, _]) => [metric, item[metric]])
      )
    }));

    if (exportFormat === 'csv') {
      const headers = ['timestamp', ...Object.keys(selectedMetrics).filter(k => selectedMetrics[k])];
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => row[h] || '').join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historical_playback_${machineId}_${dateRange.start}_${dateRange.end}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'json') {
      const jsonContent = JSON.stringify({
        machineId,
        dateRange,
        playbackSession: {
          totalFrames: historicalData.length,
          currentFrame: currentPosition,
          speed: playbackSpeed,
          data: exportData
        }
      }, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historical_playback_${machineId}_${dateRange.start}_${dateRange.end}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getCurrentData = () => {
    if (historicalData.length === 0) return { timestamps: [], temperature: [], vibration: [], power: [] };
    
    const dataSlice = historicalData.slice(0, currentPosition + 1);
    return {
      timestamps: dataSlice.map(d => d.timestamp),
      temperature: dataSlice.map(d => d.temperature),
      vibration: dataSlice.map(d => d.vibration),
      power: dataSlice.map(d => d.power)
    };
  };

  const generatePlotData = () => {
    const data = getCurrentData();
    const traces = [];
    
    if (selectedMetrics.temperature) {
      traces.push({
        x: data.timestamps,
        y: data.temperature,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Temperature (°C)',
        line: { color: '#ef4444', width: 2 },
        marker: { size: 4 },
        yaxis: 'y'
      });
    }
    
    if (selectedMetrics.vibration) {
      traces.push({
        x: data.timestamps,
        y: data.vibration,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Vibration (g)',
        line: { color: '#3b82f6', width: 2 },
        marker: { size: 4 },
        yaxis: 'y2'
      });
    }
    
    if (selectedMetrics.power) {
      traces.push({
        x: data.timestamps,
        y: data.power,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Power (W)',
        line: { color: '#10b981', width: 2 },
        marker: { size: 4 },
        yaxis: 'y3'
      });
    }
    
    // Add current time indicator
    if (data.timestamps.length > 0) {
      const currentTime = data.timestamps[data.timestamps.length - 1];
      traces.push({
        x: [currentTime, currentTime],
        y: [0, 100],
        type: 'scatter',
        mode: 'lines',
        name: 'Current Time',
        line: { color: '#fbbf24', width: 3, dash: 'dash' },
        showlegend: false,
        yaxis: 'y'
      });
    }
    
    return traces;
  };

  const layout = {
    title: `Historical Playback - ${machineId}`,
    showlegend: true,
    legend: { x: 0, y: 1 },
    xaxis: {
      title: 'Time',
      type: 'date',
      showgrid: true
    },
    yaxis: {
      title: 'Temperature (°C)',
      titlefont: { color: '#ef4444' },
      tickfont: { color: '#ef4444' },
      side: 'left'
    },
    yaxis2: {
      title: 'Vibration (g)',
      titlefont: { color: '#3b82f6' },
      tickfont: { color: '#3b82f6' },
      overlaying: 'y',
      side: 'right'
    },
    yaxis3: {
      title: 'Power (W)',
      titlefont: { color: '#10b981' },
      tickfont: { color: '#10b981' },
      overlaying: 'y',
      side: 'right',
      anchor: 'free',
      position: 0.95
    },
    margin: { t: 50, r: 100, b: 100, l: 60 },
    height: 500
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Historical Playback</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading historical data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Historical Playback - {machineId}</h2>
        <button
          onClick={exportSession}
          className="flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
        >
          <Download size={16} className="mr-2" />
          Export Session
        </button>
      </div>

      {/* Date Range Selection */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">From:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">To:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={generateHistoricalData}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
        >
          Load Data
        </button>
      </div>

      {/* Metrics Selection */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">Show:</span>
        {Object.entries(selectedMetrics).map(([metric, enabled]) => (
          <label key={metric} className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setSelectedMetrics(prev => ({
                ...prev,
                [metric]: e.target.checked
              }))}
              className="mr-1"
            />
            <span className="text-sm capitalize">{metric}</span>
          </label>
        ))}
      </div>

      {/* Chart */}
      <Plot
        data={generatePlotData()}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />

      {/* Timeline Scrubber */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{historicalData.length > 0 ? format(historicalData[0].timestamp, 'MMM dd, HH:mm') : ''}</span>
          <span>Position: {currentPosition + 1} / {historicalData.length}</span>
          <span>{historicalData.length > 0 ? format(historicalData[historicalData.length - 1].timestamp, 'MMM dd, HH:mm') : ''}</span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(0, historicalData.length - 1)}
          value={currentPosition}
          onChange={(e) => handleTimelineClick(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={skipBackward}
          className="flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          disabled={currentPosition === 0}
        >
          <SkipBack size={16} />
        </button>
        
        <button
          onClick={togglePlayback}
          className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPlaying ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={stopPlayback}
          className="flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Square size={16} />
        </button>
        
        <button
          onClick={skipForward}
          className="flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          disabled={currentPosition >= historicalData.length - 1}
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center justify-center space-x-4">
        <span className="text-sm font-medium">Speed:</span>
        {[0.5, 1, 2, 4].map(speed => (
          <button
            key={speed}
            onClick={() => setPlaybackSpeed(speed)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              playbackSpeed === speed 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="text-center text-sm text-gray-600">
        Status: {isPlaying ? '▶️ Playing' : '⏸️ Paused'} | 
        Current: {historicalData[currentPosition] ? format(historicalData[currentPosition].timestamp, 'MMM dd, HH:mm:ss') : 'N/A'} | 
        Speed: {playbackSpeed}x
      </div>
    </div>
  );
};

export default HistoricalPlayback;