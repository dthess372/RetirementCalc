import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import './BudgetCreator.css';

const BudgetCreator = () => {
  // State management
  const [grossIncome, setGrossIncome] = useState(0);
  const [taxRate, setTaxRate] = useState(0.25); // Simulated tax rate (would come from API)
  const [categories, setCategories] = useState({
    'Housing': {
      label: 'Housing',
      subcategories: {
        'Rent/Mortgage': { monthly: 0 },
        'Parking': { monthly: 0 },
        'Insurance': { monthly: 0 },
        'Utilities': { monthly: 0 },
      }
    },
    'Transportation': {
      label: 'Transportation',
      subcategories: {
        'Car Payment': { monthly: 0 },
        'Gas': { monthly: 0 },
        'Insurance': { monthly: 0 },
        'Maintenance': { monthly: 0 },
      }
    },
    'Subscriptions': {
      label: 'Subscriptions',
      subcategories: {
        'Phone': { monthly: 0 },
        'Internet': { monthly: 0 },
        'Streaming': { monthly: 0 },
      }
    },
    'Savings': {
      label: 'Savings',
      subcategories: {
        '401k': { monthly: 0 },
        'Emergency Fund': { monthly: 0 },
        'Investment': { monthly: 0 },
      }
    }
  });
  const [showGrossInPieChart, setShowGrossInPieChart] = useState(true);
  
  // Calculations
  const incomeTax = grossIncome * taxRate;
  const netIncome = grossIncome - incomeTax;

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="budget-creator">
      {/* Income Section */}
      <section className="card income-section">
        <h2>Income Overview</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Annual</th>
              <th>Monthly</th>
              <th>% of Gross</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gross Income</td>
              <td>
                <input
                  type="number"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(parseFloat(e.target.value) || 0)}
                />
              </td>
              <td>${(grossIncome / 12).toFixed(2)}</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>Income Tax</td>
              <td>${incomeTax.toFixed(2)}</td>
              <td>${(incomeTax / 12).toFixed(2)}</td>
              <td>{(taxRate * 100).toFixed(1)}%</td>
            </tr>
            <tr className="total-row">
              <td>Net Income</td>
              <td>${netIncome.toFixed(2)}</td>
              <td>${(netIncome / 12).toFixed(2)}</td>
              <td>{((netIncome / grossIncome) * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Expenses Section */}
      <section className="card expenses-section">
        <h2>Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Annual</th>
              <th>Monthly</th>
              <th>% of Gross</th>
              <th>% of Net</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categories).map(([categoryKey, category]) => (
              <React.Fragment key={categoryKey}>
                <tr className="category-row">
                  <td colSpan="7">
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
                    <td></td>
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
          <h2>
            Category Breakdown
            <button
              className="btn-secondary"
              onClick={() => setShowGrossInPieChart(!showGrossInPieChart)}
            >
              Show {showGrossInPieChart ? 'Net' : 'Gross'} Income
            </button>
          </h2>
          <PieChart width={400} height={300}>
            <Pie
              data={prepareCategoryData()}
              cx={200}
              cy={150}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {prepareCategoryData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </section>

        <section className="card">
          <h2>Subcategory Breakdown</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={prepareSubcategoryData()}
              cx={200}
              cy={150}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {prepareSubcategoryData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
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

export default BudgetCreator;