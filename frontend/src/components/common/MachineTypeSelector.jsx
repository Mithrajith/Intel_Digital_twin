import React, { useState } from 'react';
import { getAllMachineTypes } from '../../config/machineTypes';
import { ChevronDown, Check } from 'lucide-react';

export const MachineTypeSelector = ({ selectedMachineType, onMachineTypeChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const machineTypes = getAllMachineTypes();
  const currentType = machineTypes.find(type => type.id === selectedMachineType) || machineTypes[0];

  const handleSelectType = (machineType) => {
    onMachineTypeChange(machineType.id);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentType.icon}</span>
          <div className="text-left">
            <p className="font-medium text-gray-900">{currentType.name}</p>
            <p className="text-sm text-gray-500">{currentType.description}</p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {machineTypes.map((machineType) => (
            <button
              key={machineType.id}
              onClick={() => handleSelectType(machineType)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                machineType.id === selectedMachineType ? 'bg-blue-50' : ''
              }`}
            >
              <span className="text-2xl">{machineType.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{machineType.name}</p>
                <p className="text-sm text-gray-500">{machineType.description}</p>
              </div>
              {machineType.id === selectedMachineType && (
                <Check className="h-5 w-5 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MachineTypeSelector;