import React, { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Shield,
  Home,
  Banknote,
  Landmark,
  CreditCard
} from 'lucide-react';
import SuggestionBox from '../SuggestionBox/SuggestionBox';
import './NetWorthCalculator.css';

const CATEGORY_CONFIG = {
  cash: {
    name: 'Cash & Equivalents',
    color: '#22c55e',
    icon: Banknote,
    description: 'Liquid assets readily available',
    defaultAccounts: [
      { name: 'Emergency Fund', value: 0 },
      { name: 'Checking Account', value: 0 },
      { name: 'Savings Account', value: 0 },
      { name: 'Money Market', value: 0 },
    ]
  },
  investments: {
    name: 'Investments',
    color: '#3b82f6',
    icon: TrendingUp,
    description: 'Stocks, bonds, and other securities',
    defaultAccounts: [
      { name: 'Brokerage Account', value: 0 },
      { name: 'Index Funds', value: 0 },
      { name: 'Individual Stocks', value: 0 },
      { name: 'Cryptocurrency', value: 0 },
      { name: 'Stock Options', value: 0 },
    ]
  },
  realEstate: {
    name: 'Real Estate',
    color: '#8b5cf6',
    icon: Home,
    description: 'Property and real estate investments',
    defaultAccounts: [
      { name: 'Primary Residence', value: 0 },
      { name: 'Rental Property', value: 0 },
      { name: 'REIT Investments', value: 0 },
    ]
  },
  retirement: {
    name: 'Retirement Accounts',
    color: '#f59e0b',
    icon: Shield,
    description: 'Tax-advantaged retirement savings',
    defaultAccounts: [
      { name: '401(k)', value: 0 },
      { name: 'Traditional IRA', value: 0 },
      { name: 'Roth IRA', value: 0 },
      { name: 'Pension Value', value: 0 },
    ]
  },
  other: {
    name: 'Other Assets',
    color: '#6b7280',
    icon: Target,
    description: 'Vehicles, collectibles, and other assets',
    defaultAccounts: [
      { name: 'Vehicles', value: 0 },
      { name: 'Collectibles', value: 0 },
      { name: 'Business Value', value: 0 },
      { name: 'Other Assets', value: 0 },
    ]
  },
  debts: {
    name: 'Debts & Liabilities',
    color: '#ef4444',
    icon: CreditCard,
    description: 'Money owed to creditors',
    defaultAccounts: [
      { name: 'Mortgage', value: 0 },
      { name: 'Car Loans', value: 0 },
      { name: 'Credit Cards', value: 0 },
      { name: 'Student Loans', value: 0 },
      { name: 'Personal Loans', value: 0 },
    ]
  },
};

const NetWorthCalculator = () => {
  const [accounts, setAccounts] = useState(() => {
    const initialAccounts = {};
    Object.keys(CATEGORY_CONFIG).forEach(category => {
      initialAccounts[category] = [...CATEGORY_CONFIG[category].defaultAccounts];
    });
    return initialAccounts;
  });

  const [newAccountName, setNewAccountName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cash');
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Helper functions
  const formatCurrency = (value) => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return Math.round(value).toLocaleString();
  };

  const formatPercent = (value) => {
    if (isNaN(value) || !isFinite(value)) return '0.0';
    return value.toFixed(1);
  };

  const calculateCategoryTotal = (category) => {
    return accounts[category].reduce((sum, account) => sum + (account.value || 0), 0);
  };

  const calculateTotalAssets = () => {
    const assetCategories = ['cash', 'investments', 'realEstate', 'retirement', 'other'];
    return assetCategories.reduce((sum, category) => sum + calculateCategoryTotal(category), 0);
  };

  const calculateTotalDebts = () => {
    return calculateCategoryTotal('debts');
  };

  const calculateNetWorth = () => {
    return calculateTotalAssets() - calculateTotalDebts();
  };

  const calculateLiquidAssets = () => {
    return calculateCategoryTotal('cash') + calculateCategoryTotal('investments') * 0.8; // Assume 80% of investments are liquid
  };

  const calculateDebtToAssetRatio = () => {
    const totalAssets = calculateTotalAssets();
    const totalDebts = calculateTotalDebts();
    return totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 0;
  };

  const calculateAssetAllocation = () => {
    const totalAssets = calculateTotalAssets();
    if (totalAssets === 0) return {};
    
    const allocation = {};
    Object.keys(CATEGORY_CONFIG).forEach(category => {
      if (category !== 'debts') {
        allocation[category] = (calculateCategoryTotal(category) / totalAssets) * 100;
      }
    });
    return allocation;
  };

  const calculateFinancialHealth = () => {
    const netWorth = calculateNetWorth();
    const liquidAssets = calculateLiquidAssets();
    const debtRatio = calculateDebtToAssetRatio();
    const totalAssets = calculateTotalAssets();
    
    let score = 50; // Base score
    
    // Net worth factor (40 points)
    if (netWorth > 500000) score += 40;
    else if (netWorth > 100000) score += 30;
    else if (netWorth > 25000) score += 20;
    else if (netWorth > 0) score += 10;
    else score -= 20;
    
    // Liquidity factor (20 points)
    const liquidityRatio = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;
    if (liquidityRatio > 30) score += 20;
    else if (liquidityRatio > 20) score += 15;
    else if (liquidityRatio > 10) score += 10;
    else score += 5;
    
    // Debt ratio factor (20 points)
    if (debtRatio < 20) score += 20;
    else if (debtRatio < 40) score += 15;
    else if (debtRatio < 60) score += 10;
    else if (debtRatio < 80) score += 5;
    else score -= 10;
    
    // Diversification factor (20 points)
    const allocation = calculateAssetAllocation();
    const diversificationScore = Object.values(allocation).filter(pct => pct > 5).length;
    score += Math.min(20, diversificationScore * 4);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getHealthInfo = (score) => {
    if (score >= 85) return { label: 'Excellent', icon: CheckCircle, class: 'health-excellent' };
    if (score >= 70) return { label: 'Good', icon: Shield, class: 'health-good' };
    if (score >= 50) return { label: 'Fair', icon: Info, class: 'health-fair' };
    return { label: 'Needs Work', icon: AlertTriangle, class: 'health-poor' };
  };

  const getRecommendations = () => {
    const recommendations = [];
    const netWorth = calculateNetWorth();
    const liquidAssets = calculateLiquidAssets();
    const debtRatio = calculateDebtToAssetRatio();
    const allocation = calculateAssetAllocation();
    const totalAssets = calculateTotalAssets();
    
    // Emergency fund recommendation
    const emergencyFund = accounts.cash.find(acc => acc.name.toLowerCase().includes('emergency'))?.value || 0;
    if (emergencyFund < 15000) {
      recommendations.push("Build an emergency fund with 3-6 months of expenses in cash equivalents.");
    }
    
    // Debt ratio recommendation
    if (debtRatio > 50) {
      recommendations.push("Consider reducing debt load. Your debt-to-asset ratio is high at " + formatPercent(debtRatio) + "%.");
    }
    
    // Investment diversification
    if (allocation.investments < 10 && netWorth > 10000) {
      recommendations.push("Consider increasing investment allocation for long-term wealth growth.");
    }
    
    // Retirement savings
    if (allocation.retirement < 15 && totalAssets > 25000) {
      recommendations.push("Boost retirement savings to take advantage of tax benefits and compound growth.");
    }
    
    // Real estate diversification
    if (allocation.realEstate > 60) {
      recommendations.push("Consider diversifying beyond real estate to reduce concentration risk.");
    }
    
    return recommendations;
  };

  // Event handlers
  const handleValueChange = (category, index, value) => {
    const newAccounts = { ...accounts };
    newAccounts[category][index].value = Number(value) || 0;
    setAccounts(newAccounts);
  };

  const startEditing = (category, index) => {
    setEditingAccount({ category, index });
    setEditingValue(accounts[category][index].name);
  };

  const saveEdit = () => {
    if (!editingAccount || editingValue.trim() === '') return;
    
    const { category, index } = editingAccount;
    const newAccounts = { ...accounts };
    newAccounts[category][index].name = editingValue.trim();
    setAccounts(newAccounts);
    setEditingAccount(null);
    setEditingValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingAccount(null);
      setEditingValue('');
    }
  };

  const addAccount = () => {
    if (newAccountName.trim()) {
      const newAccounts = { ...accounts };
      newAccounts[selectedCategory].push({ name: newAccountName.trim(), value: 0 });
      setAccounts(newAccounts);
      setNewAccountName('');
    }
  };

  const removeAccount = (category, index) => {
    if (window.confirm('Are you sure you want to remove this account?')) {
      const newAccounts = { ...accounts };
      newAccounts[category].splice(index, 1);
      setAccounts(newAccounts);
    }
  };

  const exportToCSV = () => {
    const rows = [['Category', 'Account', 'Value']];
    Object.entries(accounts).forEach(([category, accountList]) => {
      accountList.forEach(account => {
        rows.push([category, account.name, account.value]);
      });
    });
    
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'net-worth.csv';
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split('\n').slice(1); // Skip header
        
        const newAccounts = { ...accounts };
        
        rows.forEach(row => {
          const [category, name, value] = row.split(',');
          if (category && name && value && newAccounts[category]) {
            const existingIndex = newAccounts[category].findIndex(acc => acc.name === name);
            if (existingIndex >= 0) {
              newAccounts[category][existingIndex].value = Number(value) || 0;
            } else {
              newAccounts[category].push({ name: name.trim(), value: Number(value) || 0 });
            }
          }
        });
        
        setAccounts(newAccounts);
      } catch (error) {
        alert('Error importing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  // Chart data preparation
  const prepareCategoryData = () => {
    return Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
      const total = calculateCategoryTotal(key);
      if (total === 0) return null;
      
      return {
        id: key,
        label: `${config.name}: $${formatCurrency(total)}`,
        value: Math.abs(total),
        color: config.color
      };
    }).filter(item => item !== null);
  };

  const prepareSubcategoryData = () => {
    const data = [];
    Object.entries(accounts).forEach(([category, accountList]) => {
      const config = CATEGORY_CONFIG[category];
      accountList.forEach(account => {
        if (account.value !== 0) {
          data.push({
            id: `${category}-${account.name}`,
            label: `${account.name}: $${formatCurrency(Math.abs(account.value))}`,
            value: Math.abs(account.value),
            color: config.color + '80' // Add transparency
          });
        }
      });
    });
    return data;
  };

  // Calculate derived metrics
  const netWorth = calculateNetWorth();
  const totalAssets = calculateTotalAssets();
  const totalDebts = calculateTotalDebts();
  const liquidAssets = calculateLiquidAssets();
  const debtRatio = calculateDebtToAssetRatio();
  const healthScore = calculateFinancialHealth();
  const healthInfo = getHealthInfo(healthScore);
  const recommendations = getRecommendations();
  const allocation = calculateAssetAllocation();

  return (
    <div className="net-worth-calculator">
      {/* Header */}
      <div className="networth-header">
        <div className="networth-header-content">
          <h1 className="networth-title">Net Worth Calculator</h1>
          <p className="networth-subtitle">Track your financial progress with comprehensive asset and debt analysis</p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="networth-intro-section">
        <h2 className="intro-title">Complete Financial Picture</h2>
        <p>
          Monitor your wealth building journey with detailed asset tracking, debt management, and personalized financial insights.
        </p>
        <div className="intro-steps">
          <div className="step">
            <span className="step-number">1</span>
            <span>Add all your assets and accounts</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span>Input current values and debts</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span>Review your financial health score</span>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <span>Follow personalized recommendations</span>
          </div>
        </div>
        <p className="intro-note">
          💡 Track multiple account types • 📊 Real-time analysis • 🎯 Actionable insights
        </p>
      </div>

      <div className="networth-content">
        {/* Dashboard */}
        <div className="networth-dashboard">
          <div className={`dashboard-card ${netWorth >= 0 ? 'positive' : 'negative'}`}>
            <div className="dashboard-value">
              <div className="health-indicator">
                <healthInfo.icon size={20} className={healthInfo.class} />
                ${formatCurrency(netWorth)}
              </div>
            </div>
            <div className="dashboard-label">Net Worth</div>
          </div>
          <div className="dashboard-card positive">
            <div className="dashboard-value">${formatCurrency(totalAssets)}</div>
            <div className="dashboard-label">Total Assets</div>
          </div>
          <div className="dashboard-card negative">
            <div className="dashboard-value">${formatCurrency(totalDebts)}</div>
            <div className="dashboard-label">Total Debts</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-value">${formatCurrency(liquidAssets)}</div>
            <div className="dashboard-label">Liquid Assets</div>
          </div>
          <div className={`dashboard-card ${debtRatio < 30 ? 'positive' : debtRatio < 60 ? 'warning' : 'negative'}`}>
            <div className="dashboard-value">{formatPercent(debtRatio)}%</div>
            <div className="dashboard-label">Debt-to-Asset Ratio</div>
          </div>
          <div className={`dashboard-card ${healthScore >= 70 ? 'positive' : healthScore >= 50 ? 'warning' : 'negative'}`}>
            <div className="dashboard-value">
              <div className="health-indicator">
                <healthInfo.icon size={20} className={healthInfo.class} />
                {healthScore}/100
              </div>
            </div>
            <div className="dashboard-label">Financial Health</div>
          </div>
        </div>

        {/* Account Management */}
        <div className="networth-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <Landmark size={16} />
              </div>
              Account Management
            </h2>
          </div>
          <div className="section-content">
            <div className="account-controls">
              <div className="control-group">
                <label className="control-label">New Account Name</label>
                <input
                  type="text"
                  className="control-input"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="Enter account name"
                  onKeyDown={(e) => e.key === 'Enter' && addAccount()}
                />
              </div>
              <div className="control-group">
                <label className="control-label">Category</label>
                <select
                  className="control-input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>
              <button className="control-btn" onClick={addAccount}>
                <Plus size={16} />
                Add Account
              </button>
            </div>

            <div className="table-container">
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>Category & Account</th>
                    <th>Current Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(CATEGORY_CONFIG).map(([categoryKey, config]) => {
                    const CategoryIcon = config.icon;
                    const categoryTotal = calculateCategoryTotal(categoryKey);
                    const accountList = accounts[categoryKey] || [];

                    return (
                      <React.Fragment key={categoryKey}>
                        <tr className={`category-row category-${categoryKey}`} style={{ borderLeftColor: config.color }}>
                          <td>
                            <div className="category-header">
                              <div className="category-name">
                                <CategoryIcon size={18} style={{ color: config.color }} />
                                <span>{config.name}</span>
                              </div>
                              <span className="category-total">${formatCurrency(categoryTotal)}</span>
                            </div>
                          </td>
                          <td colSpan="2">
                            <span style={{ fontSize: '0.875rem', color: 'var(--secondary-text-color)' }}>
                              {config.description}
                            </span>
                          </td>
                        </tr>
                        {accountList.map((account, index) => (
                          <tr key={`${categoryKey}-${index}`} className="account-row">
                            <td>
                              <div className="account-name">
                                {editingAccount?.category === categoryKey && editingAccount?.index === index ? (
                                  <input
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={saveEdit}
                                    onKeyDown={handleKeyDown}
                                    className="account-input editing-input"
                                    autoFocus
                                  />
                                ) : (
                                  <>
                                    {account.name}
                                    <Edit2
                                      size={14}
                                      className="action-icon edit"
                                      onClick={() => startEditing(categoryKey, index)}
                                    />
                                  </>
                                )}
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="account-input"
                                value={account.value || ''}
                                onChange={(e) => handleValueChange(categoryKey, index, e.target.value)}
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                              />
                            </td>
                            <td>
                              <Trash2
                                size={16}
                                className="action-icon delete"
                                onClick={() => removeAccount(categoryKey, index)}
                              />
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  <tr className="total-row">
                    <td><strong>Net Worth</strong></td>
                    <td><strong>${formatCurrency(netWorth)}</strong></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial Analysis */}
        <div className="networth-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <PieChartIcon size={16} />
              </div>
              Financial Analysis
            </h2>
          </div>
          <div className="section-content">
            <div className="analysis-grid">
              <div className="analysis-card">
                <h4 className="analysis-title">
                  <TrendingUp size={16} />
                  Asset Allocation
                </h4>
                {Object.entries(allocation).map(([category, percentage]) => (
                  percentage > 0 && (
                    <div key={category} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>{CATEGORY_CONFIG[category].name}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{formatPercent(percentage)}%</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div
                            className="progress-fill positive"
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div className="analysis-card">
                <h4 className="analysis-title">
                  <Shield size={16} />
                  Financial Strength
                </h4>
                <div className="analysis-value" style={{ color: healthInfo.class.includes('excellent') ? '#22c55e' : healthInfo.class.includes('good') ? '#60a5fa' : healthInfo.class.includes('fair') ? '#f59e0b' : '#ef4444' }}>
                  {healthInfo.label}
                </div>
                <div className="analysis-description">
                  Your financial health score is {healthScore}/100, indicating {healthInfo.label.toLowerCase()} financial position.
                </div>
                <div className="progress-container" style={{ marginTop: '1rem' }}>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${healthScore >= 70 ? 'positive' : 'negative'}`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="analysis-card">
                <h4 className="analysis-title">
                  <Banknote size={16} />
                  Liquidity Analysis
                </h4>
                <div className="analysis-value">${formatCurrency(liquidAssets)}</div>
                <div className="analysis-description">
                  {formatPercent(totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0)}% of your assets are liquid and readily accessible for emergencies or opportunities.
                </div>
              </div>

              <div className="analysis-card">
                <h4 className="analysis-title">
                  <AlertTriangle size={16} />
                  Debt Management
                </h4>
                <div className="analysis-value" style={{ color: debtRatio < 30 ? '#22c55e' : debtRatio < 60 ? '#f59e0b' : '#ef4444' }}>
                  {formatPercent(debtRatio)}%
                </div>
                <div className="analysis-description">
                  Your debt-to-asset ratio. Ratios below 30% are excellent, 30-60% are manageable, above 60% need attention.
                </div>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="chart-section">
              <div className="chart-container-large">
                <PieChart
                  series={[
                    {
                      data: prepareCategoryData(),
                      arcLabel: (item) => `${item.value > 1000 ? '$' + (item.value/1000).toFixed(0) + 'K' : '$' + item.value.toFixed(0)}`,
                      arcLabelMinAngle: 35,
                      outerRadius: 180,
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                    {
                      cornerRadius: 5,
                      data: prepareSubcategoryData(),
                      arcLabel: (item) => item.value > 5000 ? `$${(item.value/1000).toFixed(0)}K` : '',
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
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h3 className="recommendations-title">
              <Lightbulb size={18} />
              Personalized Recommendations
            </h3>
            {recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <Info size={16} className="recommendation-icon" />
                <div className="recommendation-text">{recommendation}</div>
              </div>
            ))}
          </div>
        )}

        {/* Export/Import */}
        <div className="actions-section">
          <button className="btn-primary" onClick={exportToCSV}>
            <Download size={16} />
            Export Data
          </button>
          <label className="btn-primary">
            <Upload size={16} />
            Import Data
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

export default NetWorthCalculator;