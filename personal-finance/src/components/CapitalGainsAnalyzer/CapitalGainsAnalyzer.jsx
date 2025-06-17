import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  Download,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Info,
  Edit2
} from 'lucide-react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import SuggestionBox from '../SuggestionBox/SuggestionBox';
import './CapitalGainsAnalyzer.css';

// Tax brackets for capital gains (2024)
const CAPITAL_GAINS_BRACKETS = {
  longTerm: {
    single: [
      { min: 0, max: 47025, rate: 0 },
      { min: 47025, max: 518900, rate: 0.15 },
      { min: 518900, max: Infinity, rate: 0.20 }
    ],
    married: [
      { min: 0, max: 94050, rate: 0 },
      { min: 94050, max: 583750, rate: 0.15 },
      { min: 583750, max: Infinity, rate: 0.20 }
    ]
  },
  shortTerm: {
    // Short-term gains are taxed as ordinary income
    single: [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 },
      { min: 100525, max: 191950, rate: 0.24 },
      { min: 191950, max: 243725, rate: 0.32 },
      { min: 243725, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 }
    ],
    married: [
      { min: 0, max: 23200, rate: 0.10 },
      { min: 23200, max: 94300, rate: 0.12 },
      { min: 94300, max: 201050, rate: 0.22 },
      { min: 201050, max: 383900, rate: 0.24 },
      { min: 383900, max: 487450, rate: 0.32 },
      { min: 487450, max: 731200, rate: 0.35 },
      { min: 731200, max: Infinity, rate: 0.37 }
    ]
  }
};

// State capital gains tax rates
const STATE_CAPITAL_GAINS = {
  'AL': { rate: 0.05, name: 'Alabama' },
  'AK': { rate: 0, name: 'Alaska' },
  'AZ': { rate: 0.025, name: 'Arizona' },
  'AR': { rate: 0.059, name: 'Arkansas' },
  'CA': { rate: 0.133, name: 'California' },
  'CO': { rate: 0.044, name: 'Colorado' },
  'CT': { rate: 0.0699, name: 'Connecticut' },
  'DE': { rate: 0.066, name: 'Delaware' },
  'FL': { rate: 0, name: 'Florida' },
  'GA': { rate: 0.0575, name: 'Georgia' },
  'HI': { rate: 0.079, name: 'Hawaii' },
  'ID': { rate: 0.058, name: 'Idaho' },
  'IL': { rate: 0.0495, name: 'Illinois' },
  'IN': { rate: 0.0323, name: 'Indiana' },
  'IA': { rate: 0.086, name: 'Iowa' },
  'KS': { rate: 0.057, name: 'Kansas' },
  'KY': { rate: 0.05, name: 'Kentucky' },
  'LA': { rate: 0.0425, name: 'Louisiana' },
  'ME': { rate: 0.0715, name: 'Maine' },
  'MD': { rate: 0.0575, name: 'Maryland' },
  'MA': { rate: 0.05, name: 'Massachusetts' },
  'MI': { rate: 0.0425, name: 'Michigan' },
  'MN': { rate: 0.0985, name: 'Minnesota' },
  'MS': { rate: 0.05, name: 'Mississippi' },
  'MO': { rate: 0.054, name: 'Missouri' },
  'MT': { rate: 0.069, name: 'Montana' },
  'NE': { rate: 0.0684, name: 'Nebraska' },
  'NV': { rate: 0, name: 'Nevada' },
  'NH': { rate: 0, name: 'New Hampshire' },
  'NJ': { rate: 0.1075, name: 'New Jersey' },
  'NM': { rate: 0.059, name: 'New Mexico' },
  'NY': { rate: 0.0882, name: 'New York' },
  'NC': { rate: 0.0525, name: 'North Carolina' },
  'ND': { rate: 0.029, name: 'North Dakota' },
  'OH': { rate: 0.0399, name: 'Ohio' },
  'OK': { rate: 0.05, name: 'Oklahoma' },
  'OR': { rate: 0.099, name: 'Oregon' },
  'PA': { rate: 0.0307, name: 'Pennsylvania' },
  'RI': { rate: 0.0599, name: 'Rhode Island' },
  'SC': { rate: 0.07, name: 'South Carolina' },
  'SD': { rate: 0, name: 'South Dakota' },
  'TN': { rate: 0, name: 'Tennessee' },
  'TX': { rate: 0, name: 'Texas' },
  'UT': { rate: 0.0485, name: 'Utah' },
  'VT': { rate: 0.0875, name: 'Vermont' },
  'VA': { rate: 0.0575, name: 'Virginia' },
  'WA': { rate: 0.07, name: 'Washington' }, // Only on high earners
  'WV': { rate: 0.065, name: 'West Virginia' },
  'WI': { rate: 0.0765, name: 'Wisconsin' },
  'WY': { rate: 0, name: 'Wyoming' },
  'DC': { rate: 0.0895, name: 'District of Columbia' }
};

const CapitalGainsAnalyzer = () => {
  const [trades, setTrades] = useState([]);
  const [taxSettings, setTaxSettings] = useState({
    filingStatus: 'single',
    state: 'MI',
    taxableIncome: 100000,
    niitApplies: false // Net Investment Income Tax
  });
  
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [newTrade, setNewTrade] = useState({
    asset: '',
    purchaseDate: '',
    purchasePrice: '',
    quantity: '',
    saleDate: '',
    salePrice: '',
    fees: 0
  });

  // Helper functions
  const formatCurrency = (value) => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return Math.round(value).toLocaleString();
  };

  const formatPercent = (value) => {
    if (isNaN(value) || !isFinite(value)) return '0.0';
    return value.toFixed(1);
  };

  const calculateDaysHeld = (purchaseDate, saleDate) => {
    const purchase = new Date(purchaseDate);
    const sale = new Date(saleDate);
    const diffTime = Math.abs(sale - purchase);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isLongTerm = (purchaseDate, saleDate) => {
    return calculateDaysHeld(purchaseDate, saleDate) > 365;
  };

  const calculateGainLoss = (trade) => {
    const totalPurchase = (trade.purchasePrice * trade.quantity) + (trade.fees || 0);
    const totalSale = trade.salePrice * trade.quantity;
    return totalSale - totalPurchase;
  };

  const calculateTaxRate = (income, isLongTermGain, filingStatus) => {
    const brackets = isLongTermGain 
      ? CAPITAL_GAINS_BRACKETS.longTerm[filingStatus]
      : CAPITAL_GAINS_BRACKETS.shortTerm[filingStatus];
    
    for (const bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate;
      }
    }
    return 0;
  };

  // Calculate totals
  const calculateTotals = () => {
    let shortTermGains = 0;
    let shortTermLosses = 0;
    let longTermGains = 0;
    let longTermLosses = 0;

    trades.forEach(trade => {
      const gainLoss = calculateGainLoss(trade);
      const isLT = isLongTerm(trade.purchaseDate, trade.saleDate);
      
      if (isLT) {
        if (gainLoss > 0) longTermGains += gainLoss;
        else longTermLosses += Math.abs(gainLoss);
      } else {
        if (gainLoss > 0) shortTermGains += gainLoss;
        else shortTermLosses += Math.abs(gainLoss);
      }
    });

    // Net out gains and losses
    const netShortTerm = shortTermGains - shortTermLosses;
    const netLongTerm = longTermGains - longTermLosses;
    
    // Apply loss limitations
    let taxableShortTerm = netShortTerm;
    let taxableLongTerm = netLongTerm;
    let carryforwardLoss = 0;
    
    if (netShortTerm < 0 && netLongTerm < 0) {
      const totalLoss = netShortTerm + netLongTerm;
      const maxDeductible = -3000;
      if (totalLoss < maxDeductible) {
        carryforwardLoss = totalLoss - maxDeductible;
        taxableShortTerm = maxDeductible * (netShortTerm / totalLoss);
        taxableLongTerm = maxDeductible * (netLongTerm / totalLoss);
      }
    }

    // Calculate taxes
    const shortTermRate = calculateTaxRate(
      taxSettings.taxableIncome + Math.max(0, taxableShortTerm),
      false,
      taxSettings.filingStatus
    );
    const longTermRate = calculateTaxRate(
      taxSettings.taxableIncome,
      true,
      taxSettings.filingStatus
    );
    
    const federalShortTermTax = Math.max(0, taxableShortTerm) * shortTermRate;
    const federalLongTermTax = Math.max(0, taxableLongTerm) * longTermRate;
    const stateTax = (Math.max(0, taxableShortTerm) + Math.max(0, taxableLongTerm)) * 
                     STATE_CAPITAL_GAINS[taxSettings.state].rate;
    
    // Net Investment Income Tax (3.8% on investment income for high earners)
    let niitTax = 0;
    if (taxSettings.niitApplies) {
      const niitThreshold = taxSettings.filingStatus === 'married' ? 250000 : 200000;
      if (taxSettings.taxableIncome > niitThreshold) {
        niitTax = (Math.max(0, taxableShortTerm) + Math.max(0, taxableLongTerm)) * 0.038;
      }
    }
    
    const totalTax = federalShortTermTax + federalLongTermTax + stateTax + niitTax;
    const effectiveRate = (taxableShortTerm + taxableLongTerm) > 0 
      ? totalTax / (taxableShortTerm + taxableLongTerm) 
      : 0;

    return {
      shortTermGains,
      shortTermLosses,
      longTermGains,
      longTermLosses,
      netShortTerm,
      netLongTerm,
      taxableShortTerm,
      taxableLongTerm,
      carryforwardLoss,
      federalShortTermTax,
      federalLongTermTax,
      shortTermRate,
      longTermRate,
      stateTax,
      niitTax,
      totalTax,
      effectiveRate,
      totalGainLoss: taxableShortTerm + taxableLongTerm,
      afterTaxProfit: (taxableShortTerm + taxableLongTerm) - totalTax
    };
  };

  // Trade management
  const handleAddTrade = () => {
    if (newTrade.asset && newTrade.purchaseDate && newTrade.saleDate && 
        newTrade.purchasePrice && newTrade.salePrice && newTrade.quantity) {
      
      const trade = {
        id: editingTrade ? editingTrade.id : Date.now(),
        ...newTrade,
        purchasePrice: parseFloat(newTrade.purchasePrice),
        salePrice: parseFloat(newTrade.salePrice),
        quantity: parseFloat(newTrade.quantity),
        fees: parseFloat(newTrade.fees) || 0
      };
      
      if (editingTrade) {
        setTrades(trades.map(t => t.id === editingTrade.id ? trade : t));
      } else {
        setTrades([...trades, trade]);
      }
      
      setNewTrade({
        asset: '',
        purchaseDate: '',
        purchasePrice: '',
        quantity: '',
        saleDate: '',
        salePrice: '',
        fees: 0
      });
      setEditingTrade(null);
      setShowTradeModal(false);
    }
  };

  const handleEditTrade = (trade) => {
    setNewTrade({
      asset: trade.asset,
      purchaseDate: trade.purchaseDate,
      purchasePrice: trade.purchasePrice.toString(),
      quantity: trade.quantity.toString(),
      saleDate: trade.saleDate,
      salePrice: trade.salePrice.toString(),
      fees: trade.fees.toString()
    });
    setEditingTrade(trade);
    setShowTradeModal(true);
  };

  const handleDeleteTrade = (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      setTrades(trades.filter(t => t.id !== id));
    }
  };

  // CSV Export/Import
  const exportToCSV = () => {
    const headers = ['Asset', 'Purchase Date', 'Purchase Price', 'Quantity', 'Sale Date', 'Sale Price', 'Fees', 'Gain/Loss', 'Type'];
    const rows = trades.map(trade => {
      const gainLoss = calculateGainLoss(trade);
      const type = isLongTerm(trade.purchaseDate, trade.saleDate) ? 'Long-term' : 'Short-term';
      return [
        trade.asset,
        trade.purchaseDate,
        trade.purchasePrice,
        trade.quantity,
        trade.saleDate,
        trade.salePrice,
        trade.fees || 0,
        gainLoss.toFixed(2),
        type
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capital-gains-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const [headers, ...rows] = text.split('\n');
        
        const importedTrades = rows.map(row => {
          const [asset, purchaseDate, purchasePrice, quantity, saleDate, salePrice, fees] = row.split(',');
          if (asset && purchaseDate && saleDate) {
            return {
              id: Date.now() + Math.random(),
              asset: asset.trim(),
              purchaseDate: purchaseDate.trim(),
              purchasePrice: parseFloat(purchasePrice) || 0,
              quantity: parseFloat(quantity) || 0,
              saleDate: saleDate.trim(),
              salePrice: parseFloat(salePrice) || 0,
              fees: parseFloat(fees) || 0
            };
          }
          return null;
        }).filter(Boolean);
        
        setTrades([...trades, ...importedTrades]);
        alert(`Imported ${importedTrades.length} trades successfully!`);
      } catch (error) {
        alert('Error importing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Chart data preparation
  const prepareMonthlyData = () => {
    const monthlyData = {};
    
    trades.forEach(trade => {
      const saleMonth = new Date(trade.saleDate).toISOString().slice(0, 7);
      const gainLoss = calculateGainLoss(trade);
      const type = isLongTerm(trade.purchaseDate, trade.saleDate) ? 'longTerm' : 'shortTerm';
      
      if (!monthlyData[saleMonth]) {
        monthlyData[saleMonth] = { month: saleMonth, shortTerm: 0, longTerm: 0 };
      }
      
      monthlyData[saleMonth][type] += gainLoss;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const prepareAssetData = () => {
    const assetData = {};
    
    trades.forEach(trade => {
      const gainLoss = calculateGainLoss(trade);
      if (!assetData[trade.asset]) {
        assetData[trade.asset] = { gains: 0, losses: 0 };
      }
      
      if (gainLoss > 0) {
        assetData[trade.asset].gains += gainLoss;
      } else {
        assetData[trade.asset].losses += Math.abs(gainLoss);
      }
    });
    
    return Object.entries(assetData).map(([asset, data]) => ({
      asset,
      gains: data.gains,
      losses: -data.losses,
      net: data.gains - data.losses
    }));
  };

  const totals = calculateTotals();
  const monthlyData = prepareMonthlyData();
  const assetData = prepareAssetData();

  // Tax optimization tips
  const getTaxOptimizationTips = () => {
    const tips = [];
    
    if (totals.netShortTerm > 0 && totals.shortTermRate > totals.longTermRate) {
      tips.push({
        icon: AlertCircle,
        type: 'warning',
        text: `Consider holding assets for over 1 year to qualify for lower long-term capital gains rates (${formatPercent(totals.longTermRate * 100)}% vs ${formatPercent(totals.shortTermRate * 100)}%).`
      });
    }
    
    if (totals.carryforwardLoss < 0) {
      tips.push({
        icon: Info,
        type: 'info',
        text: `You have ${formatCurrency(Math.abs(totals.carryforwardLoss))} in losses that will carry forward to next year.`
      });
    }
    
    if (totals.netLongTerm > 0 && totals.netShortTerm < 0) {
      tips.push({
        icon: CheckCircle,
        type: 'success',
        text: 'Your short-term losses are offsetting some long-term gains, reducing your overall tax liability.'
      });
    }
    
    if (STATE_CAPITAL_GAINS[taxSettings.state].rate === 0) {
      tips.push({
        icon: CheckCircle,
        type: 'success',
        text: `${STATE_CAPITAL_GAINS[taxSettings.state].name} has no state capital gains tax, saving you money.`
      });
    }
    
    if (totals.netShortTerm > 10000) {
      tips.push({
        icon: Info,
        type: 'info',
        text: 'Consider tax-loss harvesting strategies to offset some of your short-term gains.'
      });
    }
    
    return tips;
  };

  return (
    <div className="capital-gains-analyzer">
      {/* Header */}
      <div className="capital-header">
        <div className="capital-header-content">
          <h1 className="capital-title">Capital Gains Tax Analyzer</h1>
          <p className="capital-subtitle">Track trades and optimize your tax strategy with real-time calculations</p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="capital-intro-section">
        <h2 className="intro-title">Smart Capital Gains Management</h2>
        <p>
          Track your investment trades, calculate short-term and long-term capital gains, 
          and understand your tax obligations with comprehensive analysis tools.
        </p>
        <div className="intro-steps">
          <div className="step">
            <span className="step-number">1</span>
            <span>Add your stock, crypto, or asset trades</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span>View automatic gain/loss calculations</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span>See federal and state tax implications</span>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <span>Get tax optimization strategies</span>
          </div>
        </div>
        <p className="intro-note">
          📊 Real-time tax calculations • 📈 Short vs long-term analysis • 💡 Tax optimization tips • 💾 Export capabilities
        </p>
      </div>

      <div className="capital-content">
        {/* Dashboard */}
        <div className="capital-dashboard">
          <div className={`dashboard-card ${totals.totalGainLoss >= 0 ? 'success' : 'danger'}`}>
            <div className="dashboard-value">
              ${formatCurrency(Math.abs(totals.totalGainLoss))}
            </div>
            <div className="dashboard-label">
              Net {totals.totalGainLoss >= 0 ? 'Gain' : 'Loss'}
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-value">${formatCurrency(totals.totalTax)}</div>
            <div className="dashboard-label">Estimated Tax</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-value">${formatCurrency(totals.afterTaxProfit)}</div>
            <div className="dashboard-label">After-Tax Profit</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-value">{formatPercent(totals.effectiveRate * 100)}%</div>
            <div className="dashboard-label">Effective Tax Rate</div>
          </div>
          <div className={`dashboard-card ${totals.carryforwardLoss < 0 ? 'warning' : ''}`}>
            <div className="dashboard-value">${formatCurrency(Math.abs(totals.carryforwardLoss))}</div>
            <div className="dashboard-label">Loss Carryforward</div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="capital-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <Calculator size={16} />
              </div>
              Tax Settings
            </h2>
          </div>
          <div className="section-content">
            <div className="settings-grid">
              <div className="input-group">
                <label className="input-label">Filing Status</label>
                <select 
                  className="input-field no-prefix"
                  value={taxSettings.filingStatus}
                  onChange={(e) => setTaxSettings({...taxSettings, filingStatus: e.target.value})}
                >
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">State</label>
                <select 
                  className="input-field no-prefix"
                  value={taxSettings.state}
                  onChange={(e) => setTaxSettings({...taxSettings, state: e.target.value})}
                >
                  {Object.entries(STATE_CAPITAL_GAINS).map(([code, data]) => (
                    <option key={code} value={code}>{data.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Taxable Income (for rate calculation)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input 
                    type="number" 
                    className="input-field"
                    value={taxSettings.taxableIncome}
                    onChange={(e) => setTaxSettings({...taxSettings, taxableIncome: parseFloat(e.target.value) || 0})}
                    placeholder="100000"
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    checked={taxSettings.niitApplies}
                    onChange={(e) => setTaxSettings({...taxSettings, niitApplies: e.target.checked})}
                  />
                  <span>Subject to Net Investment Income Tax (3.8%)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Trades Section */}
        <div className="capital-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <TrendingUp size={16} />
              </div>
              Investment Trades
            </h2>
            <button className="btn-primary" onClick={() => setShowTradeModal(true)}>
              <Plus size={16} />
              Add Trade
            </button>
          </div>
          <div className="section-content">
            {trades.length === 0 ? (
              <div className="empty-state">
                <p>No trades added yet. Click "Add Trade" to get started.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="trades-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Purchase Date</th>
                      <th>Sale Date</th>
                      <th>Quantity</th>
                      <th>Purchase Price</th>
                      <th>Sale Price</th>
                      <th>Gain/Loss</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(trade => {
                      const gainLoss = calculateGainLoss(trade);
                      const isLT = isLongTerm(trade.purchaseDate, trade.saleDate);
                      const daysHeld = calculateDaysHeld(trade.purchaseDate, trade.saleDate);
                      
                      return (
                        <tr key={trade.id} className={gainLoss >= 0 ? 'gain-row' : 'loss-row'}>
                          <td className="asset-cell">{trade.asset}</td>
                          <td>{new Date(trade.purchaseDate).toLocaleDateString()}</td>
                          <td>{new Date(trade.saleDate).toLocaleDateString()}</td>
                          <td>{trade.quantity}</td>
                          <td>${formatCurrency(trade.purchasePrice)}</td>
                          <td>${formatCurrency(trade.salePrice)}</td>
                          <td className={gainLoss >= 0 ? 'gain-amount' : 'loss-amount'}>
                            {gainLoss >= 0 ? '+' : '-'}${formatCurrency(Math.abs(gainLoss))}
                          </td>
                          <td>
                            <span className={`type-badge ${isLT ? 'long-term' : 'short-term'}`}>
                              {isLT ? 'Long-term' : 'Short-term'}
                              <span className="days-held">({daysHeld} days)</span>
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Edit2 
                                size={16} 
                                className="action-icon edit"
                                onClick={() => handleEditTrade(trade)}
                              />
                              <Trash2 
                                size={16} 
                                className="action-icon delete"
                                onClick={() => handleDeleteTrade(trade.id)}
                              />
                            </div>
                          </td>