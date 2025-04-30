import React, { useState, useEffect } from 'react';
import { PieChart , pieArcLabelClasses  } from '@mui/x-charts';
import { ChevronDown, ChevronRight, Check, AlertTriangle, X, Trash2, DiamondPlus, Pencil  } from 'lucide-react';
import './BudgetPlanner.css';
import BudgetIndicator from './BudgetIndicator.tsx';

const BudgetPlanner = () => {

  const [grossIncome, setGrossIncome] = useState(0);
  const [k401Contribution, set401kContribution] = useState(0);
  const [taxRate, setTaxRate] = useState(0.22); // Simulated tax rate (would come from API)
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const [categories, setCategories] = useState({
    'Housing': {
      label: 'Housing',
      recommended: 0.3, // 30% of net income
      color: '#D98245  ',
      subcategories: {
        'Rent/Mortgage': { monthly: 0 },
        'Parking': { monthly: 0 },
        'Insurance': { monthly: 0 },
        'Utilities': { monthly: 0 },
      }
    },
    'Food': {
      label: 'Food',
      recommended: 0.15,
      color: '#C5563F  ',
      subcategories: {
        'Groceries': { monthly: 0 },
        'Dining Out': { monthly: 0 },
      }
    },
    'Transportation': {
      label: 'Transportation',
      recommended: 0.15,
      color: '#237F74  ',
      subcategories: {
        'Car Payment': { monthly: 0 },
        'Gas': { monthly: 0 },
        'Insurance': { monthly: 0 },
        'Maintenance': { monthly: 0 },
      }
    },
    'Subscriptions': {
      label: 'Subscriptions',
      recommended: 0.05,
      color: '#1C3645',
      subcategories: {
        'Phone': { monthly: 0 },
        'Internet': { monthly: 0 },
        'Streaming': { monthly: 0 },
      }
    },
    'Healthcare': {
      label: 'Healthcare',
      recommended: 0.10,
      color: '#C7A653  ',
      subcategories: {
        'Insurance Premium': { monthly: 0 },
        'Medical Expenses': { monthly: 0 },
        'Prescriptions': { monthly: 0 },
      }
    },
    'Savings': {
      label: 'Savings',
      recommended: 0.20,
      color: '#27A25B  ',
      subcategories: {
        'Savings Account': { monthly: 0 },
        'Investment Account': { monthly: 0 },
      }
    },
  });
  const [showGrossInPieChart, setShowGrossInPieChart] = useState(true);


  const startEditing = (categoryKey, subcategoryKey) => {
    setEditingSubcategory({ categoryKey, subcategoryKey });
    setEditingValue(subcategoryKey);
  };

  const saveEdit = () => {
    if (!editingSubcategory || editingValue.trim() === '') return;

    const { categoryKey, subcategoryKey } = editingSubcategory;
    
    setCategories(prev => {
      const newCategories = { ...prev };
      const currentValue = newCategories[categoryKey].subcategories[subcategoryKey];
      
      // Delete old key and add new one with same value
      delete newCategories[categoryKey].subcategories[subcategoryKey];
      newCategories[categoryKey].subcategories[editingValue] = currentValue;
      
        return newCategories;
    });

    setEditingSubcategory(null);
    setEditingValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingSubcategory(null);
      setEditingValue('');
    }
  };

  const toggleCategory = (categoryKey) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  function lightenColor(hex, opacity = 0.2) {
    const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Calculations
  const incomeTax = (grossIncome - k401Contribution) * taxRate;
  const netIncome = grossIncome - k401Contribution - incomeTax;

  const calculateTotalExpenses = () => {
    return Object.values(categories).reduce((total, category) => {
      return total + Object.values(category.subcategories).reduce((catTotal, subcat) =>
        catTotal + (subcat.monthly * 12), 0);
    }, 0);
  };

  // Calculate unallocated amount
  const unallocatedAmount = netIncome - calculateTotalExpenses();
  const unallocatedPercent = ((unallocatedAmount / netIncome) * 100).toFixed(1);

  // Handlers
  const handleExpenseChange = (categoryKey, subcategoryKey, value) => {
    setCategories(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        subcategories: {
          ...prev[categoryKey].subcategories,
          [subcategoryKey]: { monthly: parseFloat(value) || 0 }
        }
      }
    }));
  };

  const addSubcategory = (categoryKey) => {
    const name = prompt('Enter subcategory name:');
    if (name) {
      setCategories(prev => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          subcategories: {
            ...prev[categoryKey].subcategories,
            [name]: { monthly: 0 }
          }
        }
      }));
    }
  };

  const removeSubcategory = (categoryKey, subcategoryKey) => {
    setCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[categoryKey].subcategories[subcategoryKey];
      return newCategories;
    });
  };

  // CSV Export/Import
  const exportToCSV = () => {
    const rows = [['Category', 'Subcategory', 'Monthly Cost']];
    Object.entries(categories).forEach(([catKey, category]) => {
      Object.entries(category.subcategories).forEach(([subKey, subcat]) => {
        rows.push([catKey, subKey, subcat.monthly]);
      });
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget.csv';
    a.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(1); // Skip header

      const newCategories = { ...categories };
      rows.forEach(row => {
        const [category, subcategory, monthly] = row.split(',');
        if (newCategories[category]?.subcategories) {
          newCategories[category].subcategories[subcategory] = {
            monthly: parseFloat(monthly)
          };
        }
      });
      setCategories(newCategories);
    };
    reader.readAsText(file);
  };

  // Prepare data for pie charts
  const prepareCategoryData = () => {
    const categoryData = Object.entries(categories).map(([key, category]) => ({
      label: key,
      value: (Object.values(category.subcategories)
        .reduce((sum, subcat) => sum + (subcat.monthly * 12), 0)/netIncome*100).toFixed(2)
    }));

    // Add unallocated category if there's unallocated money
    if (unallocatedAmount > 0) {
      categoryData.push({
        label: 'Unallocated',
        value: unallocatedPercent
      });
    }

    return categoryData;
  };

  const prepareSubcategoryData = () => {
    const data = [];
    Object.entries(categories).forEach(([catKey, category]) => {
      Object.entries(category.subcategories).forEach(([subKey, subcat]) => {
        if (subcat.monthly > 0) {
          data.push({
            // label: `${subKey} (${catKey})`,
            value: ((subcat.monthly * 12)/netIncome*100).toFixed(2),
            color: lightenColor(category.color)
          });
        }
      });
    });

    // Add unallocated as a subcategory
    if (unallocatedAmount > 0) {
      data.push({
        value: unallocatedPercent,
        color: lightenColor('#808080')
      });
    }
    return data;
  };

  const INCOMECOLORS = ['#008800', '#880000', '#796832'];

  const renderLabel = ({ name, value, percent }) => {
    return `${(percent * 100).toFixed(1)}%`;
  };

  // Calculate category totals
  const getCategoryTotals = (category) => {
    const subcategoryTotal = Object.values(category.subcategories)
      .reduce((sum, subcat) => sum + (subcat.monthly * 12), 0);
    
    const actualPercentage = (subcategoryTotal / netIncome * 100);
    const recommendedPercentage = category.recommended * 100;
    
    return {
      annual: subcategoryTotal,
      monthly: subcategoryTotal / 12,
      percentage: actualPercentage.toFixed(1),
      recommendedPercentage,
      status: getStatus(actualPercentage, recommendedPercentage)
    };
  };

  // Get status indicator based on actual vs recommended percentage
  const getStatus = (actual, recommended, total) => {
    if (total === 0) return 'zero';
    return actual > recommended ? 'over' : 'under';
  };

  // Render status indicator
  const StatusIndicator = ({ status }) => {
    switch (status) {
      case 'under':
        return <Check className="status-icon under" size={20} />;
      case 'over':
        return <AlertTriangle className="status-icon over" size={20} />;
      case 'zero':
        return <X className="status-icon zero" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="budget-creator">
      {/* Income Section */}
      <section className="card income-section">
        <h2>Income Overview</h2>
        <div className='flexbox'>
          <div className='input-section'>
            <div style={{ padding: "0 0 5px" }}>
              Annual Gross Income
            </div>
            <input type="number" value={grossIncome}
              onChange={(e) => setGrossIncome(parseFloat(e.target.value) || 0)}
            />
            <div style={{ padding: "20px 0 5px" }}>
              Annual 401k Contribution
            </div>
            <input type="number" value={k401Contribution}
              onChange={(e) => set401kContribution(parseFloat(e.target.value) || 0)}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>Breakdown</th>
                <th>Per Month</th>
                <th>Per Year</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gross Income</td>
                <td>${(grossIncome / 12).toFixed(0)}</td>
                <td>${grossIncome.toFixed(0)}</td>
              </tr>
              <tr style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
              <td style={{ color: '#28A745', fontWeight: 'bold' }}>401k Contribution</td>
                <td>${(k401Contribution / 12).toFixed(0)}</td>
                <td>${k401Contribution.toFixed(0)}</td>
              </tr>
              <tr style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
              <td style={{ color: '#DC3545', fontWeight: 'bold' }}>Income Tax</td>
                <td>${(incomeTax / 12).toFixed(0)}</td>
                <td>${incomeTax.toFixed(0)}</td>
              </tr>
              <tr style={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}>
              <td style={{ color: '#007BFF', fontWeight: 'bold' }}>Net Income</td>
                <td>${(netIncome / 12).toFixed(0)}</td>
                <td>${netIncome.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>
          <div className='pie'>
          <PieChart
            series={[
              {
                data: [
                  { value: (k401Contribution / grossIncome * 100).toFixed(1), color: '#28A745'},
                  { value: (incomeTax / grossIncome * 100).toFixed(1), color: '#DC3545'},
                  { value: (netIncome / grossIncome * 100).toFixed(1), color: '#007BFF'},
                ],
                highlightScope: { fade: 'global', highlight: 'item' },
                // faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },

                cx: 100,
                innerRadius: 2.5,
                outerRadius: 100,
                paddingAngle: 2.5,
                cornerRadius: 2.5,

                arcLabel: (item) => `${item.value}%`,
                arcLabelMinAngle: 35,
                // arcLabelRadius: '100%',
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: 'white',
              }
            }}
            width={210}
            height={200}
          />
           </div>
        </div>
        <div className='note'>(401k contributions can be deducted from taxable gross income)</div>
      </section>

      <section className="card expenses-section">
        <h2>Expenses</h2>
        <table>
          <thead>
            <tr className='expense-head'>
              <th className='firstCol'>Category</th>
              <th className='centeredCol'>Annual</th>
              <th className='centeredCol'>Monthly</th>
              <th className='centeredCol'>Budget Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categories).map(([categoryKey, category]) => {
              const totals = getCategoryTotals(category);
              const isCollapsed = collapsedCategories[categoryKey];
              
              return (
                <React.Fragment key={categoryKey}>
                  <tr className="category-row" style={{ backgroundColor: lightenColor(category.color, 0.5) }}>
                    <td>
                      <button 
                        className="collapse-btn"
                        onClick={() => toggleCategory(categoryKey)}
                      >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                        {category.label}
                        <DiamondPlus size={20} 
                        onClick={() => addSubcategory(categoryKey)}
                        className='plusIcon'/>
                      </button>
                    </td>
                    <td className='centeredCol'>${totals.annual.toFixed(0)}</td>
                    <td className='centeredCol'>${totals.monthly.toFixed(0)}</td>
                    {/* <td className='centeredCol'>{totals.percentage}%</td> */}
                    <td className='centeredCol'>
                      <BudgetIndicator 
                        actual={parseFloat(totals.percentage)} 
                        target={category.recommended * 100} 
                      />
                      {/* {totals.recommendedPercentage}% */}
                    {/* <StatusIndicator status={totals.status} /> */}
                    </td>
                    <td></td>
                  </tr>
                  {!isCollapsed && Object.entries(category.subcategories).map(([subKey, subcat]) => (
                    <tr key={`${categoryKey}-${subKey}`}
                        className="subcategory-row"
                        style={{ backgroundColor: lightenColor(category.color, 0.2) }}
                    >
                      <td className="subcategory-name">
                        {editingSubcategory?.categoryKey === categoryKey && 
                        editingSubcategory?.subcategoryKey === subKey ? (
                           <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={saveEdit}
                              onKeyDown={handleKeyDown}
                              autoFocus
                            />
                        ) : (
                          <>
                            {subKey}
                            <Pencil
                              size={20}
                              onClick={() => startEditing(categoryKey, subKey)}
                              className='pencilIcon'
                            />
                          </>
                        )}
                      </td>
                      <td className='centeredCol'>${(subcat.monthly * 12).toFixed(0)}</td>
                      <td className='centeredCol'>
                        <input type="number"
                          value={subcat.monthly}
                          onChange={(e) => handleExpenseChange(categoryKey, subKey, e.target.value)}
                        />
                      </td>
                      <td className='centeredCol'>
                        {((subcat.monthly * 12 / netIncome) * 100).toFixed(1)}%
                      </td>
                      <td className='rightCol'>
                        <Trash2 size={20} 
                      onClick={() => removeSubcategory(categoryKey, subKey)}
                      className='trashIcon'/>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            <tr className="category-row" style={{ backgroundColor: '#808080' }}>
              <td>Unallocated</td>
              <td className='centeredCol'>${unallocatedAmount.toFixed(0)}</td>
              <td className='centeredCol'>${(unallocatedAmount / 12).toFixed(0)}</td>
              <td className='centeredCol'>
                <BudgetIndicator 
                        actual={parseFloat(unallocatedPercent)} 
                        target={0} 
                      />
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Charts Section */}
      <div className="">

        <section className="card">
          <h2>Subcategory Breakdown</h2>
          <PieChart
            colors={['#D98245', '#C5563F', '#237F74', '#1C3645', '#C7A653', '#27A25B', '#808080']} // Use palette
            series={[
              {
                cx: 250,
                data: prepareCategoryData(),
                arcLabel: (item) => `${item.value}%`,
                arcLabelMinAngle: 35,
                outerRadius: 175,
                highlightScope: { fade: 'global', highlight: 'item' },
              },
              {
                cx: 250,
                cornerRadius: 10,
                data: prepareSubcategoryData(),
                arcLabel: (item) => `${item.value}%`,
                arcLabelMinAngle: 35,
                innerRadius: 175,
                outerRadius: 250,
                highlightScope: { fade: 'global', highlight: 'item' },
              },
            ]}
            width={750}
            height={500}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: 'white',
              }
            }}
          />
        </section>
      </div>

      {/* Export/Import Section */}
      <div className="actions-section">
        <button className="btn-primary" onClick={exportToCSV}>
          Export to CSV
        </button>
        <label className="btn-primary">
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={importCSV}
            className="hidden-input"
          />
        </label>
      </div>
    </div>
  );
};

export default BudgetPlanner;