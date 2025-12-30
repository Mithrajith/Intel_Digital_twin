import React from 'react';

export function SHAPBarChart({ shapValues, featureNames, baseValue }) {
  if (!shapValues || !featureNames) return null;

  // Pair features and values, sort by absolute impact
  const pairs = featureNames.map((name, i) => ({
    name,
    value: shapValues[i],
  }))
  .filter(item => Math.abs(item.value) > 0.001)
  .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="font-semibold mb-2 text-sm">Feature Impact (SHAP)</h4>
      <div className="space-y-1">
        {pairs.length === 0 && (
            <div className="text-xs text-gray-500 italic">No significant features</div>
        )}
        {pairs.map(({ name, value }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="w-32 truncate text-xs text-gray-600 dark:text-gray-300">{name}</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded">
              <div
                className={`h-2 rounded ${value > 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(Math.abs(value) * 100, 100)}%` }}
                title={value.toFixed(3)}
              />
            </div>
            <span className="text-xs w-10 text-right tabular-nums">{value.toFixed(3)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">Base value: {baseValue?.toFixed(3)}</div>
    </div>
  );
}
