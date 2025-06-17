import React, { useState } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  DiamondPlus, 
  Pencil,
  DollarSign,
  TrendingUp,
  Calculator,
  Download,
  Upload,
  Shield,
  AlertCircle,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import SuggestionBox from '../SuggestionBox/SuggestionBox';
import './BudgetPlanner.css';

// Import data modules
import { getDefaultCategories } from './BudgetCategories';
import { 
  calculateFederalTax, 
  getMarginalRate, 
  STANDARD_DEDUCTIONS 
} from './FEDERAL_TAX_BRACKETS';
import { 
  STATE_TAX_RATES, 
  calculateAllTaxes 
} from './STATE_TAX_RATES';

const BudgetPlanner = () => {
  const [grossIncome, setGrossIncome] = useState('');
  const [k401Contribution, set401kContribution] = useState('');
  const [isRoth401k, setIsRoth401k] = useState(false);
  const [iraContribution, setIraContribution] = useState('');
  const [isRothIra, setIsRothIra] = useState(false);
  const [filingStatus, setFilingStatus] = useState('single');
  const [selectedState, setSelectedState] = useState('MI'); // Default to Michigan
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Initialize categories from the data module
  const [categories, setCategories] = useState(getDefaultCategories());

  // Helper function to safely parse numbers
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to safely format percentages
  const formatPercent = (value) => {
    if (isNaN(value) || !isFinite(value)) return '0.0';
    return value.toFixed(1);
  };

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return Math.round(value).toLocaleString();
  };

  // Expand/Collapse all categories
  const expandAllCategories = () => {
    setCollapsedCategories({});
  };

  const collapseAllCategories = () => {
    const allCollapsed = Object.keys(categories).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setCollapsedCategories(allCollapsed);
  };

  // Handle input changes with proper clearing
  const handleIncomeChange = (setter) => (e) => {
    const value = e.target.value;
    // If the field is empty or just contains 0, clear it
    if (value === '' || value === '0') {
      setter('');
    } else {
      setter(value);
    }
  };

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
      
      delete newCategories[categoryKey].subcategories[subcategoryKey];
      newCategories[categoryKey].subcategories[editingValue] = currentValue;
      
      return newCategories;
    });

    setEditingSubcategory(null);
    setEditingValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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

  // Tax calculations using imported functions
  const grossIncomeNum = parseNumber(grossIncome);
  const k401ContributionNum = parseNumber(k401Contribution);
  const iraContributionNum = parseNumber(iraContribution);
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  
  // Calculate taxable income
  const traditionalRetirementContributions = (isRoth401k ? 0 : k401ContributionNum) + (isRothIra ? 0 : iraContributionNum);
  const adjustedGrossIncome = grossIncomeNum - traditionalRetirementContributions;
  const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);
  
  // Calculate all taxes using imported helper
  const federalTax = calculateFederalTax(taxableIncome, filingStatus);
  const marginalRate = getMarginalRate(taxableIncome, filingStatus);
  const taxDetails = calculateAllTaxes(grossIncomeNum, taxableIncome, filingStatus, selectedState);
  
  const totalTax = federalTax + taxDetails.totalPayrollTax + taxDetails.totalStateTax;
  const totalRetirementContributions = k401ContributionNum + iraContributionNum;
  const netIncome = grossIncomeNum - totalRetirementContributions - totalTax;
  
  // Calculate effective rates
  const effectiveFederalRate = grossIncomeNum > 0 ? federalTax / grossIncomeNum : 0;
  const effectiveTotalRate = grossIncomeNum > 0 ? totalTax / grossIncomeNum : 0;

  const calculateTotalExpenses = () => {
    return Object.values(categories).reduce((total, category) => {
      // Don't count savings as expenses
      if (category.label.includes('Savings')) return total;
      return total + Object.values(category.subcategories).reduce((catTotal, subcat) =>
        catTotal + (subcat.monthly * 12), 0);
    }, 0);
  };

  const calculateTotalSavings = () => {
    const savingsCategory = categories['Savings'];
    if (!savingsCategory) return 0;
    return Object.values(savingsCategory.subcategories).reduce((total, subcat) => 
      total + (subcat.monthly * 12), 0);
  };

  const totalExpenses = calculateTotalExpenses();
  const totalSavings = calculateTotalSavings();
  const availableAfterExpenses = netIncome - totalExpenses;
  const excessSavings = Math.max(0, availableAfterExpenses - totalSavings);
  const totalSavingsWithExcess = totalSavings + excessSavings;
  const savingsRate = netIncome > 0 ? (totalSavingsWithExcess / netIncome * 100) : 0;

  // Calculate budget health score
  const calculateBudgetHealth = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(categories).forEach(([key, category]) => {
      // Skip savings from penalty calculation
      if (category.label.includes('Savings')) return;
      
      const totals = getCategoryTotals(category);
      const actualPercent = parseFloat(totals.percentage);
      const recommendedPercent = category.recommended * 100;
      const weight = recommendedPercent;
      
      let categoryScore = 100;
      if (actualPercent > recommendedPercent) {
        const overage = actualPercent - recommendedPercent;
        categoryScore = Math.max(0, 100 - (overage * 3));
      } else if (actualPercent < recommendedPercent * 0.5) {
        categoryScore = 90;
      }
      
      totalWeightedScore += categoryScore * weight;
      totalWeight += weight;
    });

    // Add savings bonus
    let savingsBonus = 0;
    if (savingsRate >= 20) savingsBonus = 10;
    else if (savingsRate >= 15) savingsBonus = 5;

    const baseScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 100;
    return Math.min(100, Math.max(0, Math.round(baseScore + savingsBonus)));
  };

  const getBudgetHealthInfo = (score) => {
    if (score >= 90) return { label: 'Excellent', icon: CheckCircle, class: 'health-excellent' };
    if (score >= 75) return { label: 'Good', icon: Shield, class: 'health-good' };
    if (score >= 60) return { label: 'Fair', icon: AlertCircle, class: 'health-fair' };
    return { label: 'Needs Work', icon: TrendingDown, class: 'health-poor' };
  };

  // Handlers
  const handleExpenseChange = (categoryKey, subcategoryKey, value) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setCategories(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        subcategories: {
          ...prev[categoryKey].subcategories,
          [subcategoryKey]: { monthly: isNaN(numValue) ? 0 : numValue }
        }
      }
    }));
  };

  const addSubcategory = (categoryKey) => {
    const name = window.prompt('Enter subcategory name:');
    if (name && name.trim()) {
      setCategories(prev => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          subcategories: {
            ...prev[categoryKey].subcategories,
            [name.trim()]: { monthly: 0 }
          }
        }
      }));
    }
  };

  const removeSubcategory = (categoryKey, subcategoryKey) => {
    if (window.confirm(`Are you sure you want to remove "${subcategoryKey}"?`)) {
      setCategories(prev => {
        const newCategories = { ...prev };
        delete newCategories[categoryKey].subcategories[subcategoryKey];
        return newCategories;
      });
    }
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
      const rows = text.split('\n').slice(1);

      const newCategories = { ...categories };
      rows.forEach(row => {
        const [category, subcategory, monthly] = row.split(',');
        if (newCategories[category]?.subcategories) {
          newCategories[category].subcategories[subcategory] = {
            monthly: parseFloat(monthly) || 0
          };
        }
      });
      setCategories(newCategories);
    };
    reader.readAsText(file);
  };

  // Prepare data for pie charts
  const prepareCategoryData = () => {
    const categoryData = Object.entries(categories).map(([key, category]) => {
      const categoryTotal = Object.values(category.subcategories).reduce((sum, subcat) => sum + (subcat.monthly * 12), 0);
      const actualTotal = category.label.includes('Savings') ? categoryTotal + (key === 'Savings' ? excessSavings : 0) : categoryTotal;
      const percentage = netIncome > 0 ? (actualTotal / netIncome * 100) : 0;
      return {
        id: key,
        label: `${key}: ${formatPercent(percentage)}%`,
        value: Math.max(0, percentage),
        color: category.color
      };
    }).filter(item => item.value > 0);

    return categoryData;
  };

  const prepareSubcategoryData = () => {
    const data = [];
    Object.entries(categories).forEach(([catKey, category]) => {
      Object.entries(category.subcategories).forEach(([subKey, subcat]) => {
        if (subcat.monthly > 0) {
          const percentage = netIncome > 0 ? ((subcat.monthly * 12) / netIncome * 100) : 0;
          data.push({
            id: `${catKey}-${subKey}`,
            label: `${subKey}: ${formatPercent(percentage)}%`,
            value: Math.max(0, percentage),
            color: lightenColor(category.color, 0.7)
          });
        }
      });
    });

    if (excessSavings > 0) {
      const percentage = netIncome > 0 ? (excessSavings / netIncome * 100) : 0;
      data.push({
        id: 'excess-savings',
        label: `Extra Savings: ${formatPercent(percentage)}%`,
        value: Math.max(0, percentage),
        color: lightenColor('#27A25B', 0.4)
      });
    }
    return data;
  };

  // Calculate category totals
  const getCategoryTotals = (category) => {
    const subcategoryTotal = Object.values(category.subcategories)
      .reduce((sum, subcat) => sum + (subcat.monthly * 12), 0);
    
    const actualTotal = category.label.includes('Savings') ? subcategoryTotal + excessSavings : subcategoryTotal;
    const actualPercentage = netIncome > 0 ? (actualTotal / netIncome * 100) : 0;
    const recommendedPercentage = category.recommended * 100;
    
    return {
      annual: actualTotal,
      monthly: actualTotal / 12,
      percentage: formatPercent(actualPercentage),
      recommendedPercentage,
      status: getStatus(actualPercentage, recommendedPercentage, actualTotal)
    };
  };

  const getStatus = (actual, recommended, total) => {
    if (total === 0) return 'zero';
    return actual > recommended ? 'over' : 'under';
  };

  // Progress bar component
  const ProgressBar = ({ actual, target, className = '' }) => {
    const maxScale = Math.max(target * 1.1, actual * 1.1);
    const actualWidth = Math.min(100, (actual / maxScale) * 100);
    const targetPosition = Math.min(90, (target / maxScale) * 100);
    const isOver = actual > target;
    
    return (
      <div className={`budget-progress ${className}`}>
        <div className="progress-info">
          <span>Actual: {formatPercent(actual)}%</span>
          <span>Target: {formatPercent(target)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${isOver ? 'over' : 'under'}`}
            style={{ width: `${actualWidth}%` }}
          />
          <div
            className="progress-target"
            style={{ left: `${targetPosition}%` }}
          />
        </div>
      </div>
    );
  };

  const budgetHealth = calculateBudgetHealth();
  const healthInfo = getBudgetHealthInfo(budgetHealth);

  return (
    <div className="budget-creator">
      {/* Header */}
      <div className="budget-header">
        <div className="budget-header-content">
          <h1 className="budget-title">Smart Budget Planner</h1>
          <p className="budget-subtitle">Intelligent financial planning with real-time tax calculations</p>
        </div>
      </div>

      {/* Overview Section */}
      <div className="budget-intro-section">
        <h2 className="intro-title">Smart Budget Planning Made Simple</h2>
        <p>
          Track income, calculate taxes automatically, manage expenses, and visualize your financial health with real-time insights.
        </p>
        <div className="intro-steps">
          <div className="step">
            <span className="step-number">1</span>
            <span>Enter your income and retirement contributions</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span>Review your calculated net income and taxes</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span>Add monthly expenses by category</span>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <span>Monitor your budget health score and tips</span>
          </div>
        </div>
        <p className="intro-note">
          📊 Uses 2024 tax rates • 🔒 All data stays in your browser • 💾 Export/import CSV files
        </p>
      </div>

      <div className="budget-content">
  
        {/* Income Section */}
        <div className="budget-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <DollarSign size={16} />
              </div>
              Income & Tax Calculator
            </h2>
          </div>
          <div className="section-content">
            <div className="income-layout-grid">
              {/* Input Section */}
              <div className="income-inputs-container">
                <div className="input-section-wide">
                  <div className="input-group">
                    <label className="input-label">Annual Gross Income</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input 
                        type="number" 
                        className="input-field"
                        value={grossIncome}
                        onChange={handleIncomeChange(setGrossIncome)}
                        placeholder="0"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  </div>
                  
                  <div className="retirement-inputs-grid">
                    <div className="retirement-section">
                      <h4 className="retirement-title">401(k) Contributions</h4>
                      <div className="input-group">
                        <label className="input-label">Annual Contribution</label>
                        <div className="input-wrapper">
                          <span className="input-prefix">$</span>
                          <input 
                            type="number" 
                            className="input-field"
                            value={k401Contribution}
                            onChange={handleIncomeChange(set401kContribution)}
                            placeholder="0"
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                        <div className="checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            id="roth401k"
                            checked={isRoth401k}
                            onChange={(e) => setIsRoth401k(e.target.checked)}
                          />
                          <label htmlFor="roth401k">Roth 401(k) (after-tax)</label>
                        </div>
                      </div>
                    </div>

                    <div className="retirement-section">
                      <h4 className="retirement-title">IRA Contributions</h4>
                      <div className="input-group">
                        <label className="input-label">Annual Contribution</label>
                        <div className="input-wrapper">
                          <span className="input-prefix">$</span>
                          <input 
                            type="number" 
                            className="input-field"
                            value={iraContribution}
                            onChange={handleIncomeChange(setIraContribution)}
                            placeholder="0"
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                        <div className="checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            id="rothIra"
                            checked={isRothIra}
                            onChange={(e) => setIsRothIra(e.target.checked)}
                          />
                          <label htmlFor="rothIra">Roth IRA (after-tax)</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tax-inputs-grid">
                    <div className="input-group">
                      <label className="input-label">Filing Status</label>
                      <select 
                        className="input-field no-prefix"
                        value={filingStatus}
                        onChange={(e) => setFilingStatus(e.target.value)}
                      >
                        <option value="single">Single</option>
                        <option value="married">Married Filing Jointly</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">State</label>
                      <select 
                        className="input-field no-prefix"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                      >
                        {Object.entries(STATE_TAX_RATES).map(([code, data]) => (
                          <option key={code} value={code}>{data.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Income Breakdown Table */}
              <div className="table-container">
                <table className="income-table">
                  <thead>
                    <tr>
                      <th>Income Summary</th>
                      <th>Monthly</th>
                      <th>Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="income-row">
                      <td style={{ fontWeight: 'bold' }}>Gross Income</td>
                      <td>${formatCurrency(grossIncomeNum / 12)}</td>
                      <td>${formatCurrency(grossIncomeNum)}</td>
                    </tr>
                    <tr className="income-row positive">
                      <td style={{ color: '#22c55e', fontWeight: 'bold' }}>
                        Total Retirement Contributions
                      </td>
                      <td>${formatCurrency(totalRetirementContributions / 12)}</td>
                      <td>${formatCurrency(totalRetirementContributions)}</td>
                    </tr>
                    <tr className="income-row negative">
                      <td style={{ color: '#e63946', fontWeight: 'bold' }}>
                        Total Tax ({formatPercent(effectiveTotalRate * 100)}%)
                      </td>
                      <td>${formatCurrency(totalTax / 12)}</td>
                      <td>${formatCurrency(totalTax)}</td>
                    </tr>
                    <tr className="income-row net">
                      <td style={{ color: '#af953e', fontWeight: 'bold' }}>Net Income</td>
                      <td>${formatCurrency(netIncome / 12)}</td>
                      <td>${formatCurrency(netIncome)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="tax-breakdown-container">
              <div className="table-container">
                <table className="tax-table">
                  <thead>
                    <tr>
                      <th>Tax Breakdown</th>
                      <th>Amount</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="tax-row">
                      <td>Federal Income Tax</td>
                      <td>${formatCurrency(federalTax)}</td>
                      <td>{formatPercent(effectiveFederalRate * 100)}% (marginal: {formatPercent(marginalRate * 100)}%)</td>
                    </tr>
                    <tr className="tax-row">
                      <td>Social Security</td>
                      <td>${formatCurrency(taxDetails.socialSecurityTax)}</td>
                      <td>6.2%</td>
                    </tr>
                    <tr className="tax-row">
                      <td>Medicare</td>
                      <td>${formatCurrency(taxDetails.medicareTax + taxDetails.additionalMedicareTax)}</td>
                      <td>1.45%{taxDetails.additionalMedicareTax > 0 && ' + 0.9%'}</td>
                    </tr>
                    <tr className="tax-row">
                      <td>{STATE_TAX_RATES[selectedState].name} State Tax</td>
                      <td>${formatCurrency(taxDetails.stateTax)}</td>
                      <td>{formatPercent(STATE_TAX_RATES[selectedState].rate * 100)}%</td>
                    </tr>
                    <tr className="tax-total">
                      <td>Total Tax</td>
                      <td>${formatCurrency(totalTax)}</td>
                      <td>{formatPercent(effectiveTotalRate * 100)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="income-note">
              💡 Standard deduction: ${formatCurrency(standardDeduction)} | 
              Traditional retirement contributions reduce taxable income
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="budget-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <TrendingUp size={16} />
              </div>
              Expense Categories
            </h2>
            <div className="category-controls">
              <button className="control-btn" onClick={expandAllCategories}>
                Expand All
              </button>
              <button className="control-btn" onClick={collapseAllCategories}>
                Collapse All
              </button>
            </div>
          </div>
          <div className="section-content">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th className="firstCol">Category</th>
                  <th className="centeredCol">Annual</th>
                  <th className="centeredCol">Monthly</th>
                  <th className="centeredCol">Budget Progress</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categories).map(([categoryKey, category]) => {
                  const totals = getCategoryTotals(category);
                  const isCollapsed = collapsedCategories[categoryKey];
                  const isSavings = category.label.includes('Savings');
                  
                  return (
                    <React.Fragment key={categoryKey}>
                      <tr className={`category-row ${isSavings && excessSavings > 0 ? 'savings-boost-row' : ''}`} style={{ 
                        backgroundColor: lightenColor(category.color, 0.3),
                        borderLeftColor: category.color 
                      }}>
                        <td>
                          <button 
                            className="collapse-btn"
                            onClick={() => toggleCategory(categoryKey)}
                          >
                            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                            {category.label}
                            {isSavings && excessSavings > 0 && (
                              <span style={{ marginLeft: '0.5rem', color: '#22c55e', fontSize: '0.75rem' }}>
                                +${formatCurrency(excessSavings)} auto
                              </span>
                            )}
                            <DiamondPlus 
                              size={16} 
                              onClick={(e) => {
                                e.stopPropagation();
                                addSubcategory(categoryKey);
                              }}
                              className="action-icon plusIcon"
                            />
                          </button>
                        </td>
                        <td className="centeredCol">${formatCurrency(totals.annual)}</td>
                        <td className="centeredCol">${formatCurrency(totals.monthly)}</td>
                        <td className="centeredCol">
                          <ProgressBar 
                            actual={parseFloat(totals.percentage)} 
                            target={category.recommended * 100}
                          />
                        </td>
                        <td></td>
                      </tr>
                      {!isCollapsed && Object.entries(category.subcategories).map(([subKey, subcat]) => (
                        <tr key={`${categoryKey}-${subKey}`}
                            className="subcategory-row"
                            style={{ backgroundColor: lightenColor(category.color, 0.1) }}
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
                                  size={14}
                                  onClick={() => startEditing(categoryKey, subKey)}
                                  className="action-icon pencilIcon"
                                />
                              </>
                            )}
                          </td>
                          <td className="centeredCol">${formatCurrency(subcat.monthly * 12)}</td>
                          <td className="centeredCol">
                            <div className="input-wrapper" style={{ display: 'inline-block', width: '100px' }}>
                              <span className="input-prefix" style={{ fontSize: '0.875rem' }}>$</span>
                              <input 
                                type="number"
                                value={subcat.monthly || ''}
                                onChange={(e) => handleExpenseChange(categoryKey, subKey, e.target.value)}
                                placeholder="0"
                                style={{ paddingLeft: '1.5rem', width: '100%' }}
                                onFocus={(e) => e.target.select()}
                              />
                            </div>
                          </td>
                          <td className="centeredCol">
                            {formatPercent(netIncome > 0 ? ((subcat.monthly * 12 / netIncome) * 100) : 0)}%
                          </td>
                          <td className="rightCol">
                            <Trash2 
                              size={14} 
                              onClick={() => removeSubcategory(categoryKey, subKey)}
                              className="action-icon trashIcon"
                            />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            
            <div className="category-controls-bottom">
              <button className="control-btn" onClick={expandAllCategories}>
                Expand All
              </button>
              <button className="control-btn" onClick={collapseAllCategories}>
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Budget Tips */}
        {budgetHealth < 80 && (
          <div className="budget-tips">
            <h4>💡 Budget Improvement Tips</h4>
            <p>
              {budgetHealth < 60 && "Consider reviewing your largest expense categories to identify areas for reduction. "}
              {savingsRate < 15 && "Aim for a savings rate of at least 15-20% of your income for healthy financial growth. "}
              {availableAfterExpenses < 0 && "Your expenses exceed your income - consider reducing spending or increasing income. "}
              {savingsRate >= 15 && budgetHealth < 80 && "Good savings rate! Try optimizing spending categories to match recommended percentages."}
            </p>
          </div>
        )}

        {/* Budget Dashboard & Visualization */}
        <div className="budget-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <Calculator size={16} />
              </div>
              Budget Dashboard & Visualization
            </h2>
          </div>
          <div className="section-content">
            {/* Dashboard Summary */}
            <div className="budget-dashboard">
              <div className={`dashboard-card ${budgetHealth >= 80 ? 'success' : budgetHealth >= 60 ? '' : 'danger'}`}>
                <div className="dashboard-value">
                  <span className="financial-health-indicator">
                    <healthInfo.icon size={20} className={healthInfo.class} />
                    {budgetHealth}/100
                  </span>
                </div>
                <div className="dashboard-label">Budget Health</div>
              </div>
              <div className="dashboard-card">
                <div className="dashboard-value">${formatCurrency(netIncome)}</div>
                <div className="dashboard-label">Annual Net Income</div>
              </div>
              <div className="dashboard-card">
                <div className="dashboard-value">${formatCurrency(totalExpenses)}</div>
                <div className="dashboard-label">Total Expenses</div>
              </div>
              <div className={`dashboard-card ${availableAfterExpenses < 0 ? 'danger' : 'success'}`}>
                <div className="dashboard-value">${formatCurrency(availableAfterExpenses)}</div>
                <div className="dashboard-label">Available for Savings</div>
              </div>
              <div className="dashboard-card success">
                <div className="dashboard-value">{formatPercent(savingsRate)}%</div>
                <div className="dashboard-label">Savings Rate</div>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="chart-container-large">
              <PieChart
                series={[
                  {
                    data: prepareCategoryData(),
                    arcLabel: (item) => `${item.value.toFixed(1)}%`,
                    arcLabelMinAngle: 25,
                    outerRadius: 180,
                    highlightScope: { fade: 'global', highlight: 'item' },
                  },
                  {
                    cornerRadius: 5,
                    data: prepareSubcategoryData(),
                    arcLabel: (item) => item.value > 4 ? `${item.value.toFixed(1)}%` : '',
                    arcLabelMinAngle: 40,
                    innerRadius: 180,
                    outerRadius: 240,
                    highlightScope: { fade: 'global', highlight: 'item' },
                  },
                ]}
                width={800}
                height={500}
                sx={{
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: '#f1faee',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }
                }}
                margin={{ top: 50, bottom: 50, left: 100, right: 100 }}
                slotProps={{ legend: { hidden: true } }}
              />
            </div>
          </div>
        </div>

        {/* Export/Import Section */}
        <div className="actions-section">
          <button className="btn-primary" onClick={exportToCSV}>
            <Download size={16} />
            Export Budget
          </button>
          <label className="btn-primary">
            <Upload size={16} />
            Import Budget
            <input
              type="file"
              accept=".csv"
              onChange={importCSV}
              className="hidden-input"
            />
          </label>
        </div>

        <SuggestionBox />
      </div>
    </div>
  );
};

export default BudgetPlanner;