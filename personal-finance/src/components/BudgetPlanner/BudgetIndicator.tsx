import React from 'react';

const BudgetIndicator = ({ actual, target }) => {
  const isOverBudget = actual > target;
  const percentOfTarget = (actual / target) * 100;
  
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {/* Labels */}
      <div className="text-sm text-white">
        Target: {target.toFixed(1)}% | Actual: 
        <span className={isOverBudget ? 'text-red-400 font-medium' : 'text-green-400 font-medium'}>
          {' '}{actual.toFixed(1)}%
        </span>
      </div>
      
      {/* Progress bar container */}
      <div className="w-full h-2 bg-gray-700 rounded-full">
        {/* Progress bar */}
        <div 
          className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(Math.max(percentOfTarget, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

export default BudgetIndicator;
