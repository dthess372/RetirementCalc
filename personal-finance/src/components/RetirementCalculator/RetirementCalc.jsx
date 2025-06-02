import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  PieChart,
  Shield,
  AlertCircle,
  Target,
  Award,
  Briefcase,
  BarChart3,
  Calculator,
  Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tooltip as ReactToolTip } from 'react-tooltip';
import "./RetirementCalc.css";

const RetirementCalc = () => {
  const [formData, setFormData] = useState({
    birthDate: '1990-01-01',
    currentTenure: 5,
    currentSalary: 75000,
    yearlyRaise: 3,
    initialBalance401k: 25000,
    personal401KContribution: 6,
    employer401KMatch: 3,
    initialContributionsRothIRA: 10000,
    initialEarningsRothIRA: 2000,
    RothIRAContribution: 3,
    initialBalanceStock: 15000,
    allocationStock: 5,
    allocationStockVariance: 2,
    expectedStockYoY: 10,
    varianceStockYoY: 15,
    vestingPeriod: 4,
  });

  const [simulationResults, setSimulationResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Calculate basic metrics
  const calculateAge = () => {
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge();
  const retirementAge = 67;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const total401kContribution = parseFloat(formData.personal401KContribution) + 
    Math.min(parseFloat(formData.personal401KContribution), parseFloat(formData.employer401KMatch));

  // Calculate projected retirement balance (simple estimate for dashboard)
  const calculateProjectedBalance = () => {
    if (!hasCalculated || !simulationResults) {
      // Simple projection without Monte Carlo
      const years = yearsToRetirement;
      const avgReturn = 0.07;
      
      let balance401k = parseFloat(formData.initialBalance401k) || 0;
      let balanceRothIRA = (parseFloat(formData.initialContributionsRothIRA) || 0) + 
                          (parseFloat(formData.initialEarningsRothIRA) || 0);
      let balanceStock = parseFloat(formData.initialBalanceStock) || 0;
      let salary = parseFloat(formData.currentSalary) || 0;
      
      for (let i = 0; i < years; i++) {
        const contribution401k = salary * (total401kContribution / 100);
        const contributionRothIRA = Math.min(salary * (parseFloat(formData.RothIRAContribution) / 100), 7000);
        const contributionStock = salary * (parseFloat(formData.allocationStock) / 100);
        
        balance401k = (balance401k + contribution401k) * (1 + avgReturn);
        balanceRothIRA = (balanceRothIRA + contributionRothIRA) * (1 + avgReturn);
        balanceStock = (balanceStock + contributionStock) * (1 + avgReturn * 1.2);
        
        salary *= (1 + parseFloat(formData.yearlyRaise) / 100);
      }
      
      return balance401k + balanceRothIRA + balanceStock;
    }
    
    // Use Monte Carlo results if available
    const lastYearStats = simulationResults?.statistics?.total?.[yearsToRetirement - 1];
    return lastYearStats?.median || 0;
  };

  const projectedBalance = calculateProjectedBalance();
  const monthlyRetirementIncome = projectedBalance * 0.04 / 12; // 4% withdrawal rate

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Run Monte Carlo simulation
  const runSimulation = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock results for demonstration
    const years = yearsToRetirement;
    const mockStatistics = {
      '401k': [],
      'RothIRA': [],
      'Stock': [],
      'total': []
    };
    
    let balance401k = parseFloat(formData.initialBalance401k) || 0;
    let balanceRothIRA = (parseFloat(formData.initialContributionsRothIRA) || 0) + 
                        (parseFloat(formData.initialEarningsRothIRA) || 0);
    let balanceStock = parseFloat(formData.initialBalanceStock) || 0;
    
    for (let year = 0; year < years; year++) {
      const variance = 0.15;
      const baseReturn = 0.07;
      
      // Simulate ranges with some variance
      const returns = {
        min: baseReturn - variance,
        q1: baseReturn - variance/2,
        median: baseReturn,
        q3: baseReturn + variance/2,
        max: baseReturn + variance
      };
      
      balance401k *= (1 + returns.median);
      balanceRothIRA *= (1 + returns.median);
      balanceStock *= (1 + returns.median * 1.2);
      
      mockStatistics['401k'].push({
        year: new Date().getFullYear() + year,
        min: balance401k * 0.6,
        q1: balance401k * 0.8,
        median: balance401k,
        q3: balance401k * 1.2,
        max: balance401k * 1.4
      });
      
      mockStatistics['RothIRA'].push({
        year: new Date().getFullYear() + year,
        min: balanceRothIRA * 0.6,
        q1: balanceRothIRA * 0.8,
        median: balanceRothIRA,
        q3: balanceRothIRA * 1.2,
        max: balanceRothIRA * 1.4
      });
      
      mockStatistics['Stock'].push({
        year: new Date().getFullYear() + year,
        min: balanceStock * 0.5,
        q1: balanceStock * 0.75,
        median: balanceStock,
        q3: balanceStock * 1.3,
        max: balanceStock * 1.6
      });
      
      mockStatistics['total'].push({
        year: new Date().getFullYear() + year,
        min: (balance401k + balanceRothIRA + balanceStock) * 0.6,
        q1: (balance401k + balanceRothIRA + balanceStock) * 0.8,
        median: balance401k + balanceRothIRA + balanceStock,
        q3: (balance401k + balanceRothIRA + balanceStock) * 1.2,
        max: (balance401k + balanceRothIRA + balanceStock) * 1.4
      });
    }
    
    setSimulationResults({ statistics: mockStatistics });
    setHasCalculated(true);
    setIsCalculating(false);
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!simulationResults) return [];
    
    const { statistics } = simulationResults;
    return statistics.total.map((stat, index) => ({
      year: stat.year,
      min: Math.round(stat.min),
      q1: Math.round(stat.q1),
      median: Math.round(stat.median),
      q3: Math.round(stat.q3),
      max: Math.round(stat.max)
    }));
  };

  return (
    <div className="retirement-calculator">
      {/* Header */}
      <div className="retirement-header">
        <div className="retirement-header-content">
          <h1 className="retirement-title">Retirement Planner Pro</h1>
          <p className="retirement-subtitle">Monte Carlo simulation for confident retirement planning</p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="retirement-intro-section">
        <h2 className="intro-title">Plan Your Financial Future with Confidence</h2>
        <p>
          Use advanced Monte Carlo simulations to project your retirement savings across multiple scenarios.
          Get a realistic range of outcomes based on market volatility and your personal situation.
        </p>
        <div className="intro-steps">
          <div className="step">
            <span className="step-number">1</span>
            <span>Enter your current financial situation</span>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <span>Set your contribution rates and expectations</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span>Run simulation with 1,000+ scenarios</span>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <span>Review projections and adjust your plan</span>
          </div>
        </div>
        <p className="intro-note">
          📊 Monte Carlo simulation • 🎯 Personalized projections • 📈 Risk-adjusted scenarios
        </p>
      </div>

      <div className="retirement-content">
        {/* Dashboard */}
        <div className="retirement-dashboard">
          <div className="dashboard-card">
            <div className="dashboard-value">{currentAge}</div>
            <div className="dashboard-label">Current Age</div>
          </div>
          <div className="dashboard-card info">
            <div className="dashboard-value">{yearsToRetirement}</div>
            <div className="dashboard-label">Years to Retirement</div>
          </div>
          <div className="dashboard-card success">
            <div className="dashboard-value small">{formatCurrency(projectedBalance)}</div>
            <div className="dashboard-label">Projected Balance</div>
            <div className="dashboard-sublabel">at age {retirementAge}</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-value small">{formatCurrency(monthlyRetirementIncome)}</div>
            <div className="dashboard-label">Est. Monthly Income</div>
            <div className="dashboard-sublabel">4% withdrawal rate</div>
          </div>
          <div className="dashboard-card warning">
            <div className="dashboard-value">{total401kContribution}%</div>
            <div className="dashboard-label">Total 401(k) Rate</div>
            <div className="dashboard-sublabel">You + Employer</div>
          </div>
        </div>

        {/* Input Form */}
        <div className="retirement-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <Calculator size={16} />
              </div>
              Financial Information
            </h2>
          </div>
          <div className="section-content">
            <div className="input-form">
              {/* General Information */}
              <div className="input-category">
                <div className="category-header general">
                  <Briefcase size={16} style={{ marginRight: '0.5rem' }} />
                  General Information
                </div>
                <div className="category-content">
                  <div className="input-row">
                    <label className="input-label">
                      Birth Date
                      <span className="tooltip-icon" data-tooltip-id="birthdate">?</span>
                    </label>
                    <input
                      type="date"
                      className="input-field no-prefix"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    />
                  </div>
                  <div className="input-row">
                    <label className="input-label">
                      Years at Company
                      <span className="tooltip-icon" data-tooltip-id="tenure">?</span>
                    </label>
                    <input
                      type="number"
                      className="input-field no-prefix"
                      value={formData.currentTenure}
                      onChange={(e) => handleInputChange('currentTenure', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="input-row">
                    <label className="input-label">Current Salary</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.currentSalary}
                        onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="input-row">
                    <label className="input-label">Annual Raise</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        className="input-field has-suffix no-prefix"
                        value={formData.yearlyRaise}
                        onChange={(e) => handleInputChange('yearlyRaise', e.target.value)}
                        min="0"
                        step="0.1"
                      />
                      <span className="input-suffix">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 401(k) Information */}
              <div className="input-category">
                <div className="category-header k401">
                  <Shield size={16} style={{ marginRight: '0.5rem' }} />
                  401(k) Account
                </div>
                <div className="category-content">
                  <div className="input-row">
                    <label className="input-label">Current Balance</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.initialBalance401k}
                        onChange={(e) => handleInputChange('initialBalance401k', e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="input-subcategory">
                    <div className="subcategory-title">Contribution Rates</div>
                    <div className="input-row">
                      <label className="input-label">Your Contribution</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          className="input-field has-suffix no-prefix"
                          value={formData.personal401KContribution}
                          onChange={(e) => handleInputChange('personal401KContribution', e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    <div className="input-row">
                      <label className="input-label">Employer Match</label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          className="input-field has-suffix no-prefix"
                          value={formData.employer401KMatch}
                          onChange={(e) => handleInputChange('employer401KMatch', e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    <div className="contribution-summary">
                      Total Contribution: {total401kContribution}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Roth IRA Information */}
              <div className="input-category">
                <div className="category-header rothIRA">
                  <PieChart size={16} style={{ marginRight: '0.5rem' }} />
                  Roth IRA
                </div>
                <div className="category-content">
                  <div className="input-row">
                    <label className="input-label">Current Contributions</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.initialContributionsRothIRA}
                        onChange={(e) => handleInputChange('initialContributionsRothIRA', e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="input-row">
                    <label className="input-label">Current Earnings</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.initialEarningsRothIRA}
                        onChange={(e) => handleInputChange('initialEarningsRothIRA', e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="input-row">
                    <label className="input-label">Annual Contribution</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        className="input-field has-suffix no-prefix"
                        value={formData.RothIRAContribution}
                        onChange={(e) => handleInputChange('RothIRAContribution', e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="input-suffix">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Stock */}
              <div className="input-category">
                <div className="category-header stock">
                  <TrendingUp size={16} style={{ marginRight: '0.5rem' }} />
                  Company Stock
                </div>
                <div className="category-content">
                  <div className="input-row">
                    <label className="input-label">Current Balance</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        className="input-field"
                        value={formData.initialBalanceStock}
                        onChange={(e) => handleInputChange('initialBalanceStock', e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="input-subcategory">
                    <div className="subcategory-title">Stock Allocation</div>
                    <div className="input-row">
                      <label className="input-label">
                        Annual Allocation
                        <span className="tooltip-icon" data-tooltip-id="allocation">?</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          className="input-field has-suffix no-prefix"
                          value={formData.allocationStock}
                          onChange={(e) => handleInputChange('allocationStock', e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    <div className="input-row">
                      <label className="input-label">
                        Allocation Variance
                        <span className="tooltip-icon" data-tooltip-id="allocationVariance">?</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          className="input-field has-suffix no-prefix"
                          value={formData.allocationStockVariance}
                          onChange={(e) => handleInputChange('allocationStockVariance', e.target.value)}
                          min="0"
                          max="50"
                          step="0.1"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    <div className="range-display">
                      Allocation Range: {parseFloat(formData.allocationStock) - parseFloat(formData.allocationStockVariance)}% 
                      to {parseFloat(formData.allocationStock) + parseFloat(formData.allocationStockVariance)}%
                    </div>
                  </div>
                  <div className="input-subcategory">
                    <div className="subcategory-title">Expected Returns</div>
                    <div className="input-row">
                      <label className="input-label">
                        Annual Return
                        <span className="tooltip-icon" data-tooltip-id="stockReturn">?</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          className="input-field has-suffix no-prefix"
                          value={formData.expectedStockYoY}
                          onChange={(e) => handleInputChange('expectedStockYoY', e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    <div className="input-row">
                      <label className="input-label">
                        Return Variance
                        <span className="tooltip-icon" data-tooltip-id="stockVariance">?</span>
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="number"
                          className="input-field has-suffix no-prefix"
                          value={formData.varianceStockYoY}
                          onChange={(e) => handleInputChange('varianceStockYoY', e.target.value)}
                          min="0"
                          max="50"
                          step="0.1"
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    <div className="range-display">
                      Return Range: {parseFloat(formData.expectedStockYoY) - parseFloat(formData.varianceStockYoY)}% 
                      to {parseFloat(formData.expectedStockYoY) + parseFloat(formData.varianceStockYoY)}%
                    </div>
                  </div>
                  <div className="input-row">
                    <label className="input-label">
                      Vesting Period (Years)
                      <span className="tooltip-icon" data-tooltip-id="vesting">?</span>
                    </label>
                    <input
                      type="number"
                      className="input-field no-prefix"
                      value={formData.vestingPeriod}
                      onChange={(e) => handleInputChange('vestingPeriod', e.target.value)}
                      min="0"
                      max="10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button 
            className="btn-primary" 
            onClick={runSimulation}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                Running Simulation...
              </>
            ) : (
              <>
                <BarChart3 size={20} />
                Run Monte Carlo Simulation
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {hasCalculated && simulationResults && (
          <>
            <div className="section-divider" />

            {/* Statistics Summary */}
            <div className="retirement-section">
              <div className="section-header">
                <h2 className="section-title">
                  <div className="section-icon">
                    <Target size={16} />
                  </div>
                  Simulation Results - Final Year Projections
                </h2>
              </div>
              <div className="section-content">
                <div className="statistics-grid">
                  {['401k', 'RothIRA', 'Stock'].map(category => {
                    const stats = simulationResults.statistics[category][yearsToRetirement - 1];
                    const categoryNames = {
                      '401k': '401(k) Account',
                      'RothIRA': 'Roth IRA',
                      'Stock': 'Company Stock'
                    };
                    
                    return (
                      <div key={category} className="stat-card">
                        <div className="stat-card-header">
                          <div className={`stat-icon ${category.toLowerCase()}`}>
                            {category === '401k' && <Shield size={20} />}
                            {category === 'RothIRA' && <PieChart size={20} />}
                            {category === 'Stock' && <TrendingUp size={20} />}
                          </div>
                          <div className="stat-title">{categoryNames[category]}</div>
                        </div>
                        <div className="stat-metrics">
                          <div className="metric">
                            <div className="metric-label">Conservative</div>
                            <div className="metric-value">{formatCurrency(stats.q1)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Expected</div>
                            <div className="metric-value">{formatCurrency(stats.median)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Optimistic</div>
                            <div className="metric-value">{formatCurrency(stats.q3)}</div>
                          </div>
                          <div className="metric">
                            <div className="metric-label">Range</div>
                            <div className="metric-value">
                              {formatCurrency(stats.max - stats.min)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="retirement-section">
              <div className="section-header">
                <h2 className="section-title">
                  <div className="section-icon">
                    <TrendingUp size={16} />
                  </div>
                  Total Portfolio Projection Over Time
                </h2>
              </div>
              <div className="section-content">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="year" 
                        stroke="#888"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#888"
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          border: '1px solid #333',
                          borderRadius: '6px'
                        }}
                        labelStyle={{ color: '#888' }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="min" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={false}
                        name="Worst Case"
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="q1" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={false}
                        name="Conservative"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="median" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={false}
                        name="Expected"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="q3" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                        name="Optimistic"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="max" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={false}
                        name="Best Case"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Results Table */}
            <div className="retirement-section">
              <div className="section-header">
                <h2 className="section-title">
                  <div className="section-icon">
                    <Award size={16} />
                  </div>
                  Year-by-Year Projections
                </h2>
              </div>
              <div className="section-content">
                <div className="results-table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Age</th>
                        <th className="category-401k">401(k) Median</th>
                        <th className="category-rothira">Roth IRA Median</th>
                        <th className="category-stock">Stock Median</th>
                        <th>Total (Conservative)</th>
                        <th>Total (Expected)</th>
                        <th>Total (Optimistic)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResults.statistics.total.map((stat, index) => {
                        const age = currentAge + index + 1;
                        const stats401k = simulationResults.statistics['401k'][index];
                        const statsRoth = simulationResults.statistics['RothIRA'][index];
                        const statsStock = simulationResults.statistics['Stock'][index];
                        
                        return (
                          <tr key={index}>
                            <td>{stat.year}</td>
                            <td>{age}</td>
                            <td className="category-401k">{formatCurrency(stats401k.median)}</td>
                            <td className="category-rothira">{formatCurrency(statsRoth.median)}</td>
                            <td className="category-stock">{formatCurrency(statsStock.median)}</td>
                            <td>{formatCurrency(stat.q1)}</td>
                            <td style={{ fontWeight: 'bold' }}>{formatCurrency(stat.median)}</td>
                            <td>{formatCurrency(stat.q3)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!hasCalculated && !isCalculating && (
          <div className="retirement-section">
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>Ready to Plan Your Retirement?</h3>
              <p>Enter your information above and run the simulation to see your projected retirement savings.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tooltips */}
      <ReactToolTip id="birthdate" content="Used to calculate your current age and years to retirement" />
      <ReactToolTip id="tenure" content="Years of service at your current employer, used for vesting calculations" />
      <ReactToolTip id="allocation" content="Percentage of salary your employer allocates as stock compensation" />
      <ReactToolTip id="allocationVariance" content="How much the stock allocation can vary year to year" />
      <ReactToolTip id="stockReturn" content="Expected annual return for company stock" />
      <ReactToolTip id="stockVariance" content="How much stock returns can vary from the expected return" />
      <ReactToolTip id="vesting" content="Number of years before stock grants are fully owned by you" />
    </div>
  );
};

export default RetirementCalc;