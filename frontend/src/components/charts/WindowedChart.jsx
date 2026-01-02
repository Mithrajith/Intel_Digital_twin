import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useDataWindow } from '../../hooks/useDataWindow';
import { Settings, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

const WindowedChart = ({
  data = [],
  title = "Chart",
  chartType = 'realtime',
  metrics = ['value'],
  colors = ['#3b82f6'],
  yAxisLabels = ['Value'],
  showControls = true,
  height = 400,
  className = ""
}) => {
  const {
    applyDataWindow,
    optimizeDataForRendering,
    windowSize,
    setWindowSize,
    timeWindow,
    setTimeWindow,
    updateStrategy,
    setUpdateStrategy,
    getChartTypeConfig,
    chartConfig
  } = useDataWindow();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMetrics, setSelectedMetrics] = useState(
    metrics.reduce((acc, metric) => ({ ...acc, [metric]: true }), {})
  );

  // Auto-configure based on chart type
  useEffect(() => {
    const config = getChartTypeConfig(chartType);
    setWindowSize(config.windowSize);
    setTimeWindow(config.timeWindow);
    setUpdateStrategy(config.updateStrategy);
  }, [chartType, getChartTypeConfig, setWindowSize, setTimeWindow, setUpdateStrategy]);

  // Process data with windowing
  const processedData = useMemo(() => {
    const windowed = applyDataWindow(data, {
      countLimit: Math.floor(windowSize * zoomLevel),
      timeWindowSeconds: timeWindow * zoomLevel,
      strategy: updateStrategy
    });
    
    return optimizeDataForRendering(windowed);
  }, [data, windowSize, timeWindow, zoomLevel, updateStrategy, applyDataWindow, optimizeDataForRendering]);

  // Generate plot traces
  const generateTraces = () => {
    const traces = [];
    
    metrics.forEach((metric, index) => {
      if (!selectedMetrics[metric]) return;
      
      const yData = processedData.map(item => item[metric]).filter(val => val !== undefined && val !== null);
      const xData = processedData.map(item => item.timestamp || item.time || item.x);
      
      if (yData.length === 0) return;
      
      traces.push({
        x: xData.slice(-yData.length), // Ensure x and y have same length
        y: yData,
        type: 'scatter',
        mode: chartType === 'realtime' || processedData.length <= 50 ? 'lines+markers' : 'lines',
        name: yAxisLabels[index] || metric,
        line: { 
          color: colors[index % colors.length], 
          width: 2 
        },
        marker: { 
          size: chartType === 'realtime' ? 4 : (processedData.length > 100 ? 2 : 4),
          opacity: 0.8,
          symbol: 'circle'
        },
        yaxis: index === 0 ? 'y' : `y${index + 1}`,
        connectgaps: false
      });
    });
    
    return traces;
  };

  // Generate layout
  const generateLayout = () => {
    const layout = {
      title: {
        text: title,
        font: { size: 16 }
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1.1,
        orientation: 'h'
      },
      xaxis: {
        title: 'Time',
        showgrid: true,
        gridwidth: 1,
        gridcolor: '#e5e7eb',
        tickmode: 'auto',
        nticks: Math.min(10, Math.max(5, Math.floor(processedData.length / 10)))
      },
      height: height,
      margin: { t: 60, r: 60, b: 50, l: 60 },
      plot_bgcolor: 'rgba(248, 250, 252, 0.8)',
      paper_bgcolor: 'white',
      font: { size: 12 }
    };

    // Configure Y-axes for multiple metrics
    metrics.forEach((metric, index) => {
      if (!selectedMetrics[metric]) return;
      
      const yAxisKey = index === 0 ? 'yaxis' : `yaxis${index + 1}`;
      layout[yAxisKey] = {
        title: yAxisLabels[index] || metric,
        titlefont: { color: colors[index % colors.length] },
        tickfont: { color: colors[index % colors.length] },
        showgrid: index === 0,
        gridwidth: 1,
        gridcolor: '#e5e7eb',
        side: index % 2 === 0 ? 'left' : 'right',
        overlaying: index === 0 ? undefined : 'y',
        position: index === 0 ? 0 : (index % 2 === 0 ? index * 0.1 : 1 - (index * 0.1))
      };
    });

    return layout;
  };

  const config = {
    responsive: true,
    displayModeBar: showControls,
    modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`,
      height: height,
      width: 800,
      scale: 1
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.max(0.1, prev * 0.7));
  const handleZoomOut = () => setZoomLevel(prev => Math.min(5, prev * 1.4));
  const handleReset = () => {
    setZoomLevel(1);
    setWindowSize(chartConfig.windowSize);
    setTimeWindow(chartConfig.timeWindow);
  };

  const exportData = () => {
    const exportData = processedData.map(item => ({
      timestamp: item.timestamp || item.time,
      ...Object.fromEntries(
        metrics.filter(metric => selectedMetrics[metric])
          .map(metric => [metric, item[metric]])
      )
    }));

    const csvContent = [
      ['timestamp', ...metrics.filter(m => selectedMetrics[m])].join(','),
      ...exportData.map(row => 
        [row.timestamp, ...metrics.filter(m => selectedMetrics[m]).map(m => row[m] || '')].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {showControls && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomIn}
                className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Reset View"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={exportData}
                className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Export Data"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label htmlFor="windowSize">Window Size:</label>
              <input
                id="windowSize"
                type="range"
                min="25"
                max="200"
                value={windowSize}
                onChange={(e) => setWindowSize(parseInt(e.target.value))}
                className="w-20"
              />
              <span>{windowSize}pts</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label>Zoom:</label>
              <span>{zoomLevel.toFixed(1)}x</span>
            </div>

            <div className="flex items-center gap-2">
              <label>Points:</label>
              <span>{processedData.length}</span>
            </div>
          </div>

          {/* Metric Selection */}
          <div className="mt-3 flex flex-wrap gap-2">
            {metrics.map(metric => (
              <label key={metric} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={selectedMetrics[metric]}
                  onChange={(e) => setSelectedMetrics(prev => ({ ...prev, [metric]: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span style={{ color: colors[metrics.indexOf(metric) % colors.length] }}>
                  {metric}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: height, padding: showControls ? '0' : '1rem' }}>
        <Plot
          data={generateTraces()}
          layout={generateLayout()}
          config={config}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default WindowedChart;