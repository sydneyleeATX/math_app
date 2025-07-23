import React, { useState, useEffect } from 'react';
import { OperationType, type AllPracticeSettings, type PracticeSettings, ALL_OPERATIONS } from '../types';

interface SettingsFormProps {
  initialSettings: AllPracticeSettings;
  onStartPractice: (operations: OperationType[], settings: AllPracticeSettings) => void;
}

const defaultSettingsForOperation = (op: OperationType): PracticeSettings => {
  switch(op) {
    case OperationType.EXPONENT:
      return { lower: 1, upper: 10, exponentPowerLower: 0, exponentPowerUpper: 3 };
    case OperationType.FRACTIONS:
      return { 
        lower: 1, upper: 10, // Not directly used for generation but for consistency
        fractionNumeratorLower: 1, fractionNumeratorUpper: 10,
        fractionDenominatorLower: 2, fractionDenominatorUpper: 10
      };
    case OperationType.SQUARE_ROOT:
      return { lower: 4, upper: 100 }; // Radicand range
    case OperationType.DECIMALS:
      return { lower: 1, upper: 10, decimalPlaces: 1 };
    default: // Addition, Subtraction, Multiplication, Division
      return { lower: 1, upper: 10 };
  }
};

const SettingsForm: React.FC<SettingsFormProps> = ({ initialSettings, onStartPractice }) => {
  const [currentSettings, setCurrentSettings] = useState<AllPracticeSettings>(initialSettings);
  const [selectedOperations, setSelectedOperations] = useState<OperationType[]>([ALL_OPERATIONS[0]]);

  // Sync currentSettings with initialSettings when prop changes
  useEffect(() => {
    setCurrentSettings(initialSettings);
  }, [initialSettings]);

  const handleOperationToggle = (opToToggle: OperationType) => {
    setSelectedOperations(prev =>
      prev.includes(opToToggle)
        ? prev.filter(op => op !== opToToggle)
        : [...prev, opToToggle]
    );
  };

  const handleInputChange = (op: OperationType, field: keyof PracticeSettings, value: string) => {
    const numValue = parseInt(value, 10);
    const processedValue = (value === "" || value === "-") ? value : (isNaN(numValue) ? currentSettings[op][field] : numValue);

    setCurrentSettings(prev => ({
      ...prev,
      [op]: {
        ...prev[op],
        [field]: processedValue
      }
    }));
  };
  
  const validateAndParseLimits = (opType: OperationType, field: keyof PracticeSettings, fallback: number, sourceSettings: AllPracticeSettings): number => {
    const val = sourceSettings[opType][field];
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? fallback : parsed;
    }
    return val;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOperations.length === 0) {
      alert("Please select at least one operation type to practice.");
      return;
    }

    const settingsToSubmit = JSON.parse(JSON.stringify(currentSettings)) as AllPracticeSettings;

    for (const op of selectedOperations) {
      const opSettingsRef = settingsToSubmit[op];

      opSettingsRef.lower = validateAndParseLimits(op, 'lower', 1, settingsToSubmit);
      opSettingsRef.upper = validateAndParseLimits(op, 'upper', 10, settingsToSubmit);

      if (opSettingsRef.upper < opSettingsRef.lower) {
         if (op === OperationType.SQUARE_ROOT && opSettingsRef.upper === opSettingsRef.lower) {
            // allow if for sqrt, upper can be equal to lower for a specific radicand
         } else {
            alert(`For ${op}, upper limit (${opSettingsRef.upper}) cannot be less than lower limit (${opSettingsRef.lower}).`);
            return;
         }
      }
      
      if (op === OperationType.SQUARE_ROOT) {
        if (opSettingsRef.lower <= 0) {
            alert(`For ${op}, radicand lower limit must be greater than 0.`);
            return;
        }
      }


      if (op === OperationType.EXPONENT) {
        opSettingsRef.exponentPowerLower = validateAndParseLimits(op, 'exponentPowerLower', 0, settingsToSubmit);
        opSettingsRef.exponentPowerUpper = validateAndParseLimits(op, 'exponentPowerUpper', 3, settingsToSubmit);
        if (opSettingsRef.exponentPowerUpper! < opSettingsRef.exponentPowerLower!) {
          alert(`For ${op} exponents, power upper limit (${opSettingsRef.exponentPowerUpper}) cannot be less than power lower limit (${opSettingsRef.exponentPowerLower}).`);
          return;
        }
      }

      if (op === OperationType.FRACTIONS) {
        opSettingsRef.fractionNumeratorLower = validateAndParseLimits(op, 'fractionNumeratorLower', 1, settingsToSubmit);
        opSettingsRef.fractionNumeratorUpper = validateAndParseLimits(op, 'fractionNumeratorUpper', 10, settingsToSubmit);
        opSettingsRef.fractionDenominatorLower = validateAndParseLimits(op, 'fractionDenominatorLower', 2, settingsToSubmit);
        opSettingsRef.fractionDenominatorUpper = validateAndParseLimits(op, 'fractionDenominatorUpper', 10, settingsToSubmit);

        if (opSettingsRef.fractionNumeratorUpper! < opSettingsRef.fractionNumeratorLower!) {
          alert(`For ${op} fractions, numerator upper limit cannot be less than numerator lower limit.`);
          return;
        }
        if (opSettingsRef.fractionDenominatorUpper! < opSettingsRef.fractionDenominatorLower!) {
          alert(`For ${op} fractions, denominator upper limit cannot be less than denominator lower limit.`);
          return;
        }
        if (opSettingsRef.fractionDenominatorLower! <= 0) {
          alert(`For ${op} fractions, denominator lower limit must be greater than 0.`);
          return;
        }
      }
      
      if (op === OperationType.DECIMALS) {
        opSettingsRef.decimalPlaces = validateAndParseLimits(op, 'decimalPlaces', 1, settingsToSubmit);
        if (opSettingsRef.decimalPlaces! <= 0 || opSettingsRef.decimalPlaces! > 5) {
            alert(`For ${op}, number of decimal places must be between 1 and 5.`);
            return;
        }
      }
    }
    onStartPractice(selectedOperations, settingsToSubmit);
  };

  const renderLimitInputs = (op: OperationType, opSettings: PracticeSettings) => {
    switch(op) {
        case OperationType.ADDITION:
        case OperationType.SUBTRACTION:
        case OperationType.MULTIPLICATION:
        case OperationType.DIVISION:
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor={`${op}-lower`} className="block text-sm font-medium text-gray-700">Lower Limit</label>
                        <input type="number" id={`${op}-lower`} value={opSettings.lower ?? ''}
                               onChange={e => handleInputChange(op, 'lower', e.target.value)}
                               className="number-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2"/>
                    </div>
                    <div>
                        <label htmlFor={`${op}-upper`} className="block text-sm font-medium text-gray-700">Upper Limit</label>
                        <input type="number" id={`${op}-upper`} value={opSettings.upper ?? ''}
                               onChange={e => handleInputChange(op, 'upper', e.target.value)}
                               className="number-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2"/>
                    </div>
                </div>
            );
        case OperationType.EXPONENT:
            return (
                <>
                  <p className="text-xs text-gray-500 mb-2 mt-1">Base number limits:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`${op}-exp-base-lower`} className="block text-sm font-medium text-gray-700">Lower</label>
                      <input type="number" id={`${op}-exp-base-lower`} value={opSettings.lower ?? ''} onChange={e => handleInputChange(op, 'lower', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                    <div>
                      <label htmlFor={`${op}-exp-base-upper`} className="block text-sm font-medium text-gray-700">Upper</label>
                      <input type="number" id={`${op}-exp-base-upper`} value={opSettings.upper ?? ''} onChange={e => handleInputChange(op, 'upper', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 mb-2">Exponent power limits:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`${op}-exp-power-lower`} className="block text-sm font-medium text-gray-700">Min Power</label>
                      <input type="number" id={`${op}-exp-power-lower`} value={opSettings.exponentPowerLower ?? ''} onChange={e => handleInputChange(op, 'exponentPowerLower', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                    <div>
                      <label htmlFor={`${op}-exp-power-upper`} className="block text-sm font-medium text-gray-700">Max Power</label>
                      <input type="number" id={`${op}-exp-power-upper`} value={opSettings.exponentPowerUpper ?? ''} onChange={e => handleInputChange(op, 'exponentPowerUpper', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                  </div>
                </>
            );
        case OperationType.FRACTIONS:
             return (
                <>
                  <p className="text-xs text-gray-500 mb-2 mt-1">Numerator limits:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`${op}-frac-num-lower`} className="block text-sm font-medium text-gray-700">Lower</label>
                      <input type="number" id={`${op}-frac-num-lower`} value={opSettings.fractionNumeratorLower ?? ''} onChange={e => handleInputChange(op, 'fractionNumeratorLower', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                    <div>
                      <label htmlFor={`${op}-frac-num-upper`} className="block text-sm font-medium text-gray-700">Upper</label>
                      <input type="number" id={`${op}-frac-num-upper`} value={opSettings.fractionNumeratorUpper ?? ''} onChange={e => handleInputChange(op, 'fractionNumeratorUpper', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 mb-2">Denominator limits (must be &gt; 0):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`${op}-frac-den-lower`} className="block text-sm font-medium text-gray-700">Lower</label>
                      <input type="number" id={`${op}-frac-den-lower`} min="1" value={opSettings.fractionDenominatorLower ?? ''} onChange={e => handleInputChange(op, 'fractionDenominatorLower', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                    <div>
                      <label htmlFor={`${op}-frac-den-upper`} className="block text-sm font-medium text-gray-700">Upper</label>
                      <input type="number" id={`${op}-frac-den-upper`} min="1" value={opSettings.fractionDenominatorUpper ?? ''} onChange={e => handleInputChange(op, 'fractionDenominatorUpper', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                  </div>
                </>
            );
        case OperationType.SQUARE_ROOT:
            return (
                <>
                  <p className="text-xs text-gray-500 mb-2 mt-1">Radicand (number under root) limits (must be &gt; 0):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`${op}-sqrt-lower`} className="block text-sm font-medium text-gray-700">Lower</label>
                      <input type="number" min="1" id={`${op}-sqrt-lower`} value={opSettings.lower ?? ''} onChange={e => handleInputChange(op, 'lower', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                    <div>
                      <label htmlFor={`${op}-sqrt-upper`} className="block text-sm font-medium text-gray-700">Upper</label>
                      <input type="number" min="1" id={`${op}-sqrt-upper`} value={opSettings.upper ?? ''} onChange={e => handleInputChange(op, 'upper', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                  </div>
                </>
            );
        case OperationType.DECIMALS:
            return (
                <>
                  <p className="text-xs text-gray-500 mb-2 mt-1">Operand limits:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`${op}-dec-lower`} className="block text-sm font-medium text-gray-700">Lower</label>
                      <input type="number" id={`${op}-dec-lower`} value={opSettings.lower ?? ''} onChange={e => handleInputChange(op, 'lower', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                    <div>
                      <label htmlFor={`${op}-dec-upper`} className="block text-sm font-medium text-gray-700">Upper</label>
                      <input type="number" id={`${op}-dec-upper`} value={opSettings.upper ?? ''} onChange={e => handleInputChange(op, 'upper', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Decimal Places for Each Operation (1-5):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`${op}-addition-places`} className="block text-xs font-medium text-gray-600">Addition (+)</label>
                        <input type="number" id={`${op}-addition-places`} min="1" max="5" value={opSettings.decimalAdditionPlaces ?? ''} onChange={e => handleInputChange(op, 'decimalAdditionPlaces', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                      </div>
                      <div>
                        <label htmlFor={`${op}-subtraction-places`} className="block text-xs font-medium text-gray-600">Subtraction (-)</label>
                        <input type="number" id={`${op}-subtraction-places`} min="1" max="5" value={opSettings.decimalSubtractionPlaces ?? ''} onChange={e => handleInputChange(op, 'decimalSubtractionPlaces', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                      </div>
                      <div>
                        <label htmlFor={`${op}-multiplication-places`} className="block text-xs font-medium text-gray-600">Multiplication (×)</label>
                        <input type="number" id={`${op}-multiplication-places`} min="1" max="5" value={opSettings.decimalMultiplicationPlaces ?? ''} onChange={e => handleInputChange(op, 'decimalMultiplicationPlaces', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                      </div>
                      <div>
                        <label htmlFor={`${op}-division-places`} className="block text-xs font-medium text-gray-600">Division (÷)</label>
                        <input type="number" id={`${op}-division-places`} min="1" max="5" value={opSettings.decimalDivisionPlaces ?? ''} onChange={e => handleInputChange(op, 'decimalDivisionPlaces', e.target.value)} className="number-input mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"/>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Leave blank to use default (1 decimal place)</p>
                  </div>
                </>
            );
        default: return null;
    }
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto w-full">
      <h2 className="text-2xl font-semibold text-sky-700 mb-6 text-center">Practice Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">
            Choose Operation(s)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ALL_OPERATIONS.map(op => (
              <label key={op} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-md hover:bg-sky-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedOperations.includes(op)}
                  onChange={() => handleOperationToggle(op)}
                  className="form-checkbox h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
                  aria-labelledby={`label-${op}`}
                />
                <span id={`label-${op}`} className="text-sm font-medium text-gray-700">{op}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedOperations.length > 0 && (
          <h3 className="text-lg font-medium text-gray-800 pt-4 border-t mt-6">Configure Limits</h3>
        )}

        {ALL_OPERATIONS.map(op => {
          if (!selectedOperations.includes(op)) return null;
          const currentOpSettings = currentSettings[op];
          return (
            <fieldset key={op} className="border border-gray-300 p-4 rounded-md mt-4">
              <legend className="text-md font-semibold text-sky-700 px-2">{op} Limits</legend>
              {renderLimitInputs(op, currentOpSettings)}
            </fieldset>
          )
        })}
        
        <button
          type="submit"
          disabled={selectedOperations.length === 0}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Start Practice
        </button>
      </form>
    </div>
  );
};

export const initialGlobalSettings = ALL_OPERATIONS.reduce((acc, op) => {
  acc[op] = defaultSettingsForOperation(op);
  return acc;
}, {} as AllPracticeSettings);


export default SettingsForm;