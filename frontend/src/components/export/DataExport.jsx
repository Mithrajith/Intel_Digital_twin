import React, { useState, useEffect } from 'react';
import { Download, FileText, Database, Calendar, Filter, Check } from 'lucide-react';
import { format, subDays } from 'date-fns';
import * as XLSX from 'xlsx';

const DataExport = ({ machineId = 'robot_01' }) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'csv',
    dateRange: {
      start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    },
    dataTypes: {
      sensor_data: true,
      predictions: true,
      maintenance_tasks: true,
      anomalies: true
    },
    machines: {
      robot_01: true,
      cnc_01: true,
      conveyor_01: true
    },
    timeResolution: '1hour' // 1min, 5min, 1hour, 1day
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastExport, setLastExport] = useState(null);

  // Mock data generation
  const generateMockData = (type, machine, startDate, endDate) => {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const interval = exportConfig.timeResolution === '1min' ? 70000 :
                    exportConfig.timeResolution === '5min' ? 300000 :
                    exportConfig.timeResolution === '1hour' ? 3700000 :
                    86400000; // 1day
    
    for (let time = start.getTime(); time <= end.getTime(); time += interval) {
      const timestamp = new Date(time);
      
      switch (type) {
        case 'sensor_data':
          data.push({
            timestamp: timestamp.toISOString(),
            machine_id: machine,
            temperature: 45 + Math.random() * 15,
            vibration: 0.5 + Math.random() * 0.5,
            power: 120 + Math.random() * 80,
            status: 'running'
          });
          break;
          
        case 'predictions':
          if (Math.random() > 0.8) { // Only some time points have predictions
            data.push({
              timestamp: timestamp.toISOString(),
              machine_id: machine,
              rul_hours: 500 + Math.random() * 1500,
              health_score: 60 + Math.random() * 40,
              confidence: 0.7 + Math.random() * 0.3
            });
          }
          break;
          
        case 'anomalies':
          if (Math.random() > 0.95) { // Rare anomalies
            data.push({
              timestamp: timestamp.toISOString(),
              machine_id: machine,
              anomaly_type: ['vibration', 'temperature', 'power'][Math.floor(Math.random() * 3)],
              severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
              confidence: 0.8 + Math.random() * 0.2
            });
          }
          break;
      }
    }
    
    return data;
  };

  const generateMaintenanceData = () => {
    const tasks = [
      {
        id: 1,
        machine_id: 'robot_01',
        task: 'Bearing replacement',
        scheduled_date: '2026-01-03T10:00:00Z',
        status: 'pending',
        priority: 'high',
        estimated_cost: 350
      },
      {
        id: 2,
        machine_id: 'cnc_01',
        task: 'Tool calibration',
        scheduled_date: '2026-01-05T14:00:00Z',
        status: 'completed',
        priority: 'medium',
        estimated_cost: 150
      }
    ];
    
    return tasks.filter(task => 
      exportConfig.machines[task.machine_id] &&
      new Date(task.scheduled_date) >= new Date(exportConfig.dateRange.start) &&
      new Date(task.scheduled_date) <= new Date(exportConfig.dateRange.end)
    );
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        typeof row[header] === 'string' && row[header].includes(',') 
          ? `"${row[header]}"` 
          : row[header]
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify({
      export_info: {
        timestamp: new Date().toISOString(),
        date_range: exportConfig.dateRange,
        machines: Object.keys(exportConfig.machines).filter(m => exportConfig.machines[m]),
        data_types: Object.keys(exportConfig.dataTypes).filter(t => exportConfig.dataTypes[t]),
        time_resolution: exportConfig.timeResolution
      },
      data
    }, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (dataSheets, filename) => {
    const workbook = XLSX.utils.book_new();
    
    Object.entries(dataSheets).forEach(([sheetName, data]) => {
      if (data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });
    
    XLSX.writeFile(workbook, filename);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      const selectedMachines = Object.keys(exportConfig.machines).filter(m => exportConfig.machines[m]);
      const selectedDataTypes = Object.keys(exportConfig.dataTypes).filter(t => exportConfig.dataTypes[t]);
      
      let allData = {};
      let progressStep = 100 / (selectedMachines.length * selectedDataTypes.length + 1);
      let currentProgress = 0;
      
      // Collect data
      for (const machine of selectedMachines) {
        for (const dataType of selectedDataTypes) {
          setExportProgress(currentProgress);
          
          if (dataType === 'maintenance_tasks') {
            if (!allData[dataType]) allData[dataType] = [];
            allData[dataType].push(...generateMaintenanceData());
          } else {
            const data = generateMockData(
              dataType, 
              machine, 
              exportConfig.dateRange.start, 
              exportConfig.dateRange.end
            );
            
            if (!allData[dataType]) allData[dataType] = [];
            allData[dataType].push(...data);
          }
          
          currentProgress += progressStep;
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setExportProgress(95);
      
      // Export based on format
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const baseFilename = `digital_twin_export_${timestamp}`;
      
      if (exportConfig.format === 'csv') {
        // Separate CSV files for each data type
        Object.entries(allData).forEach(([dataType, data]) => {
          if (data.length > 0) {
            exportToCSV(data, `${baseFilename}_${dataType}.csv`);
          }
        });
      } else if (exportConfig.format === 'json') {
        exportToJSON(allData, `${baseFilename}.json`);
      } else if (exportConfig.format === 'excel') {
        exportToExcel(allData, `${baseFilename}.xlsx`);
      }
      
      setLastExport({
        timestamp: new Date(),
        filename: baseFilename,
        format: exportConfig.format,
        recordCount: Object.values(allData).reduce((sum, data) => sum + data.length, 0)
      });
      
      setExportProgress(100);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Download className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-bold">Data Export</h2>
        </div>
        {lastExport && (
          <div className="text-sm text-green-600 flex items-center">
            <Check size={16} className="mr-1" />
            Last export: {lastExport.timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Filter className="mr-2" size={20} />
            Export Configuration
          </h3>
          
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <div className="flex space-x-4">
              {[
                { value: 'csv', label: 'CSV', icon: FileText },
                { value: 'json', label: 'JSON', icon: Database },
                { value: 'excel', label: 'Excel', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setExportConfig(prev => ({ ...prev, format: value }))}
                  className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                    exportConfig.format === value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={exportConfig.dateRange.start}
                onChange={(e) => setExportConfig(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                value={exportConfig.dateRange.end}
                onChange={(e) => setExportConfig(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          {/* Time Resolution */}
          <div>
            <label className="block text-sm font-medium mb-2">Time Resolution</label>
            <select
              value={exportConfig.timeResolution}
              onChange={(e) => setExportConfig(prev => ({ ...prev, timeResolution: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="1min">1 Minute</option>
              <option value="5min">5 Minutes</option>
              <option value="1hour">1 Hour</option>
              <option value="1day">1 Day</option>
            </select>
          </div>
        </div>
        
        {/* Selection Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data Selection</h3>
          
          {/* Data Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Data Types</label>
            <div className="space-y-2">
              {Object.entries(exportConfig.dataTypes).map(([type, enabled]) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setExportConfig(prev => ({
                      ...prev,
                      dataTypes: { ...prev.dataTypes, [type]: e.target.checked }
                    }))}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Machine Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Machines</label>
            <div className="space-y-2">
              {Object.entries(exportConfig.machines).map(([machine, enabled]) => (
                <label key={machine} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setExportConfig(prev => ({
                      ...prev,
                      machines: { ...prev.machines, [machine]: e.target.checked }
                    }))}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">{machine}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Export Progress */}
      {isExporting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Exporting data...</span>
            <span>{exportProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
          isExporting
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Download size={20} className="mr-2" />
        {isExporting ? 'Exporting...' : `Export Data (${exportConfig.format.toUpperCase()})`}
      </button>
      
      {/* Last Export Info */}
      {lastExport && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Last Export Summary</h4>
          <div className="text-sm text-green-700 space-y-1">
            <div>Format: {lastExport.format.toUpperCase()}</div>
            <div>Records: {lastExport.recordCount.toLocaleString()}</div>
            <div>Time: {lastExport.timestamp.toLocaleString()}</div>
            <div>File: {lastExport.filename}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataExport;