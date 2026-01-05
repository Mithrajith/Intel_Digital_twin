import React from 'react';
import HistoricalPlayback from '../playback/HistoricalPlayback';
import DataExport from '../export/DataExport';

export const AnalyticsSection = ({ data, machineId }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Historical Playback */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4">Historical Analysis</h3>
          <HistoricalPlayback data={data} machineId={machineId} />
        </div>

        {/* Data Export */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4">Data Export Tools</h3>
          <DataExport data={data} machineId={machineId} />
        </div>
      </div>
    </div>
  );
};