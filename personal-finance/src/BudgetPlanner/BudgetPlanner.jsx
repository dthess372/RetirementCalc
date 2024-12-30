import React, { useState, useEffect } from 'react';
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../components/ui/alert-dialog";
import { Progress } from "../components/ui/progress";
import { PieChart , pieArcLabelClasses  } from '@mui/x-charts';
import './BudgetPlanner.css';

const BudgetPlanner = () => {
  // State management
  const [grossIncome, setGrossIncome] = useState(0);
  const [k401Contribution, set401kContribution] = useState(0);
  const [taxRate, setTaxRate] = useState(0.22); // Simulated tax rate (would come from API)
  const [categories, setCategories] = useState({
    'Housing': {
      label: 'Housing',
      recommended: 0.3, // 30% of net income
      subcategories: {
        'Rent/Mortgage': { monthly: 0 },
        'Parking': { monthly: 0 },
        'Insurance': { monthly: 0 },
        'Utilities': { monthly: 0 },
      }
    },
    'Transportation': {
      label: 'Transportation',
      recommended: 0.15,
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
      subcategories: {
        'Phone': { monthly: 0 },
        'Internet': { monthly: 0 },
        'Streaming': { monthly: 0 },
      }
    },
    'Savings': {
      label: 'Savings',
      recommended: 0.20,
      subcategories: {
        'Savings Account': { monthly: 0 },
        'Investment Account': { monthly: 0 },
      }
    },
    'Food': {
      label: 'Food',
      recommended: 0.15,
      subcategories: {
        'Groceries': { monthly: 0 },
        'Dining Out': { monthly: 0 },
      }
    },
    'Healthcare': {
      label: 'Healthcare',
      recommended: 0.10,
      subcategories: {
        'Insurance Premium': { monthly: 0 },
        'Medical Expenses': { monthly: 0 },
        'Prescriptions': { monthly: 0 },
      }
    }
  });
  const [showGrossInPieChart, setShowGrossInPieChart] = useState(true);
  
  // Calculations
  const incomeTax = (grossIncome - k401Contribution) * taxRate;
  const netIncome = grossIncome - k401Contribution - incomeTax;

  const calculateTotalExpenses = () => {
    return Object.values(categories).reduce((total, category) => {
      return total + Object.values(category.subcategories).reduce((catTotal, subcat) => 
        catTotal + (subcat.monthly * 12), 0);
    }, 0);
  };

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
    return Object.entries(categories).map(([key, category]) => ({
      name: key,
      value: Object.values(category.subcategories)
        .reduce((sum, subcat) => sum + (subcat.monthly * 12), 0)
    }));
  };

  const prepareSubcategoryData = () => {
    const data = [];
    Object.entries(categories).forEach(([catKey, category]) => {
      Object.entries(category.subcategories).forEach(([subKey, subcat]) => {
        if (subcat.monthly > 0) {
          data.push({
            name: `${subKey} (${catKey})`,
            value: subcat.monthly * 12
          });
        }
      });
    });
    return data;
  };

  const INCOMECOLORS = ['#008800', '#880000', '#796832'];
  const COLORS = ['#008800', '#880000', '#FFBB28', '#FF8042', '#8884D8'];

  const renderLabel = ({ name, value, percent }) => {
    return `${(percent * 100).toFixed(1)}%`;
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
          {/* <div className='vertiflex'> */}
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
           </div>{/*</div> */}
        </div>
        <div className='note'>(401k contributions can be deducted from taxable gross income)</div>
      </section>

      {/* Expenses Section */}
      <section className="card expenses-section">
        <h2>Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Annual</th>
              <th>Monthly</th>
              <th></th>
              <th>% of Net</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categories).map(([categoryKey, category]) => (
              <React.Fragment key={categoryKey}>
                <tr className="category-row">
                  <td colSpan="6">
                    {category.label}
                    <button 
                      className="btn-icon"
                      onClick={() => addSubcategory(categoryKey)}
                    >
                      +
                    </button>
                  </td>
                </tr>
                {Object.entries(category.subcategories).map(([subKey, subcat]) => (
                  <tr key={`${categoryKey}-${subKey}`} className="subcategory-row">
                    <td>{subKey}</td>
                    <td>${(subcat.monthly * 12).toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        value={subcat.monthly}
                        onChange={(e) => handleExpenseChange(categoryKey, subKey, e.target.value)}
                      />
                    </td>
                    <td>
                      {((subcat.monthly * 12 / grossIncome) * 100).toFixed(1)}%
                    </td>
                    <td>
                      {((subcat.monthly * 12 / netIncome) * 100).toFixed(1)}%
                    </td>
                    <td>
                      <button
                        className="btn-icon delete"
                        onClick={() => removeSubcategory(categoryKey, subKey)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
              
            ))}
          </tbody>
        </table>
      </section>

      {/* Charts Section */}
      <div className="charts-section">

        <section className="card">
          <h2>Subcategory Breakdown</h2>
          {/* <PieChart width={1000} height={1000}>
            <Pie
              data={prepareSubcategoryData()}
              cx='50%'
              cy='50%'
              innerRadius={200}
              outerRadius={250}
              dataKey="value"
              label
            >
              {prepareSubcategoryData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Pie
              data={prepareCategoryData()}
              cx='50%'
              cy='50%'
              outerRadius={175}
              dataKey="value"
              // label
            >
              {prepareCategoryData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart> */}
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: 10, label: 'series A' },
                  { id: 1, value: 15, label: 'series B' },
                  { id: 2, value: 20, label: 'series C' },
                ],
              },
            ]}
            width={400}
            height={200}
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