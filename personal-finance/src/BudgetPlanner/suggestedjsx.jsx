import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
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
        'Emergency Fund': { monthly: 0 },
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
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

  const totalExpenses = calculateTotalExpenses();
  const remainingBudget = netIncome - totalExpenses;

  // Budget health check
  useEffect(() => {
    if (netIncome > 0) {
      setAlertMessage(''); // Reset message before checking
      Object.entries(categories).forEach(([key, category]) => {
        const categoryTotal = Object.values(category.subcategories)
          .reduce((sum, subcat) => sum + (subcat.monthly * 12), 0);
        
        const recommendedAmount = netIncome * category.recommended;
        if (categoryTotal > recommendedAmount) {
          setAlertMessage(prev => 
            prev + `\n${category.label} spending (${((categoryTotal/netIncome)*100).toFixed(1)}%) exceeds recommended ${(category.recommended*100)}%`
          );
          setShowAlert(true);
        }
      });
    }
  }, [categories, netIncome]);

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
    const rows = [
      ['Budget Summary'],
      ['Gross Income', grossIncome],
      ['401k Contribution', k401Contribution],
      ['Tax', incomeTax],
      ['Net Income', netIncome],
      ['Total Expenses', totalExpenses],
      ['Remaining Budget', remainingBudget],
      [],
      ['Category', 'Subcategory', 'Monthly Cost', 'Annual Cost', '% of Net Income', 'Recommended %']
    ];

    Object.entries(categories).forEach(([catKey, category]) => {
      Object.entries(category.subcategories).forEach(([subKey, subcat]) => {
        const annualCost = subcat.monthly * 12;
        rows.push([
          catKey,
          subKey,
          subcat.monthly,
          annualCost,
          ((annualCost / netIncome) * 100).toFixed(2),
          (category.recommended * 100).toFixed(0)
        ]);
      });
    });
    
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_${new Date().toISOString().split('T')[0]}.csv`;
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
        <div className='horiflex'>
          <div className='input-section'>
            <div style={{ padding: "0 0 5px" }}>
              Annual Gross Income
            </div>
            <input type="number" value={grossIncome}
              onChange={(e) => setGrossIncome(parseFloat(e.target.value) || 0)}
            />
            <div style={{ padding: "20px 0 5px" }}>Monthly Gross Income</div>
            <div>${(grossIncome / 12).toFixed(0)}</div>
            <div style={{ padding: "20px 0 5px" }}>
              Annual 401k Contribution
            </div>
            <input type="number" value={k401Contribution}
              onChange={(e) => set401kContribution(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className='vertiflex'>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Annual</th>
                  <th>Monthly</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gross Income</td>
                  <td>${grossIncome.toFixed(0)}</td>
                  <td>${(grossIncome / 12).toFixed(0)}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>401k Contributions</td>
                  <td>${k401Contribution.toFixed(0)}</td>
                  <td>${(k401Contribution / 12).toFixed(0)}</td>
                  <td>{((k401Contribution / grossIncome) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>Income Tax</td>
                  <td>${incomeTax.toFixed(0)}</td>
                  <td>${(incomeTax / 12).toFixed(0)}</td>
                  <td>{((incomeTax / grossIncome) * 100).toFixed(1)}%</td>
                </tr>
                <tr className="total-row">
                  <td>Net Income</td>
                  <td>${netIncome.toFixed(0)}</td>
                  <td>${(netIncome / 12).toFixed(0)}</td>
                  <td>{((netIncome / grossIncome) * 100).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
            <div className='pie'>
              <PieChart width={250} height={250}>
                <Pie
                  data={[
                    {name: '401k Contributions', value: k401Contribution},
                    {name: 'Income Tax', value: incomeTax},
                    {name: 'Net Income', value: netIncome}
                  ]}
                  outerRadius={75}
                  label={renderLabel}
                  labelLine={false}
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INCOMECOLORS[index % INCOMECOLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>
      </section>

      {/* Budget Overview Section */}
      <section className="card overview-section">
        <h2>Budget Overview</h2>
        <div className="budget-status">
          <div className="status-item">
            <h3>Monthly Net Income</h3>
            <div className="amount">${(netIncome / 12).toFixed(2)}</div>
          </div>
          <div className="status-item">
            <h3>Monthly Expenses</h3>
            <div className="amount">${(totalExpenses / 12).toFixed(2)}</div>
          </div>
          <div className="status-item">
            <h3>Remaining Budget</h3>
            <div className={`amount ${remainingBudget < 0 ? 'negative' : ''}`}>
              ${(remainingBudget / 12).toFixed(2)}
            </div>
          </div>
        </div>
        <Progress 
          value={(totalExpenses / netIncome) * 100} 
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-2">
          <span>0%</span>
          <span className={totalExpenses / netIncome > 1 ? 'text-red-500' : ''}>
            {((totalExpenses / netIncome) * 100).toFixed(1)}% Used
          </span>
          <span>100%</span>
        </div>
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
              <th>% of Net</th>
              <th>Recommended</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categories).map(([categoryKey, category]) => {
              const categoryTotal = Object.values(category.subcategories)
                .reduce((sum, subcat) => sum + (subcat.monthly * 12), 0);
              const percentOfNet = (categoryTotal / netIncome) * 100;
              const recommendedPercent = category.recommended * 100;
              
              return (
                <React.Fragment key={categoryKey}>
                  <tr className="category-row">
                    <td>{category.label}</td>
                    <td>${categoryTotal.toFixed(2)}</td>
                    <td>${(categoryTotal / 12).toFixed(2)}</td>
                    <td className={percentOfNet > recommendedPercent ? 'text-red-500' : 'text-green-500'}>
                      {percentOfNet.toFixed(1)}%
                    </td>
                    <td>{recommendedPercent}%</td>
                    <td>
                      <Progress 
                        value={(percentOfNet / recommendedPercent) * 100}
                        className="w-full"
                      />
                    </td>
                    <td>
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
              );
            })}
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareCategoryData()}
                cx="50%"
                cy="50%"
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
          </ResponsiveContainer>
        </section>

        <section className="card">
          <h2>Subcategory Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareSubcategoryData()}
                cx="50%"
                cy="50%"
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
          </ResponsiveContainer>
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

      {/* Budget Alerts Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Budget Warnings</AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage.split('\n').map((msg, i) => (
                <div key={i} className="text-red-500">{msg}</div>
              ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BudgetPlanner;