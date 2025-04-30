import React, { useState } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts';
import './NetWorthCalculator.css';

const COLORS = {
  cash: '#D98245',
  investments: '#C5563F',
  assets: '#237F74',
  retirement: '#1C3645',
  debts: '#C7A653'
};

function lightenColor(hex, opacity = 0.2) {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const initialAccounts = {
  cash: [
    { name: 'Emergency Fund', value: 0 },
    { name: 'Checking', value: 0 },
    { name: 'Savings', value: 0 },
  ],
  investments: [
    { name: 'Brokerage', value: 0 },
    { name: 'Crypto', value: 0 },
    { name: 'Stock Options', value: 0 },
  ],
  assets: [
    { name: 'Primary Home', value: 0 },
    { name: 'Vehicles', value: 0 },
    { name: 'Other Assets', value: 0 },
  ],
  retirement: [
    { name: 'Roth IRA', value: 0 },
    { name: '401(k)', value: 0 },
  ],
  debts: [
    { name: 'Mortgage', value: 0 },
    { name: 'Car Loans', value: 0 },
    { name: 'Credit Cards', value: 0 },
    { name: 'Other Loans', value: 0 },
  ],
};

const NetWorthCalculator = () => {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [newAccountName, setNewAccountName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cash');

  const calculateCategoryTotal = (category) => {
    return accounts[category].reduce((sum, account) => sum + account.value, 0);
  };

  const calculateNetWorth = () => {
    const assets = ['cash', 'investments', 'assets', 'retirement'];
    const totalAssets = assets.reduce((sum, category) => sum + calculateCategoryTotal(category), 0);
    const totalDebts = calculateCategoryTotal('debts');
    return totalAssets - totalDebts;
  };

  const handleValueChange = (category, index, value) => {
    const newAccounts = { ...accounts };
    newAccounts[category][index].value = Number(value) || 0;
    setAccounts(newAccounts);
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
    const newAccounts = { ...accounts };
    newAccounts[category].splice(index, 1);
    setAccounts(newAccounts);
  };

  const exportToCSV = () => {
    let csvContent = 'Category,Account,Value\n';
    Object.entries(accounts).forEach(([category, accountList]) => {
      accountList.forEach(account => {
        csvContent += `${category},${account.name},${account.value}\n`;
      });
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'net-worth.csv';
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(1);
      
      const newAccounts = { ...initialAccounts };
      
      rows.forEach(row => {
        const [category, name, value] = row.split(',');
        if (category && name && value) {
          const accountIndex = newAccounts[category].findIndex(a => a.name === name);
          if (accountIndex >= 0) {
            newAccounts[category][accountIndex].value = Number(value);
          }
        }
      });
      
      setAccounts(newAccounts);
    };
    
    reader.readAsText(file);
  };

  const prepareCategoryData = () => {
    return Object.entries(accounts).map(([key, accountList]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: Math.abs(calculateCategoryTotal(key))
    }));
  };

  const prepareSubcategoryData = () => {
    const data = [];
    Object.entries(accounts).forEach(([category, accountList]) => {
      accountList.forEach(account => {
        if (account.value !== 0) {
          data.push({
            value: Math.abs(account.value),
            label: account.name,
            color: lightenColor(COLORS[category])
          });
        }
      });
    });
    return data;
  };

  return (
    <div className="net-worth-calculator">
      <section className="accounts-section">
        <h2>Net Worth Calculator</h2>
        
        <div className="controls">
          <input
            type="text"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            placeholder="New account name"
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {Object.keys(accounts).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={addAccount} className="add-button">Add Account</button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Account</th>
                <th>Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(accounts).map(([category, accountList]) => (
                <React.Fragment key={category}>
                  <tr className="category-row" style={{ backgroundColor: COLORS[category] }}>
                    <td colSpan="4">
                      <div className="catrow-flex">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                        <span>${calculateCategoryTotal(category).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                  {accountList.map((account, index) => (
                    <tr 
                      key={`${category}-${account.name}`}
                      style={{ backgroundColor: lightenColor(COLORS[category]) }}
                    >
                      <td></td>
                      <td>{account.name}</td>
                      <td>
                        <input
                          type="number"
                          value={account.value}
                          onChange={(e) => handleValueChange(category, index, e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          className="expense-btn remove-cat"
                          onClick={() => removeAccount(category, index)}
                        >
                          -
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              <tr className="total-row">
                <td colSpan="2">Net Worth</td>
                <td colSpan="2">${calculateNetWorth().toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="chart-section">
        <h2>Asset Distribution</h2>
        <PieChart
          colors={Object.values(COLORS)}
          series={[
            {
              cx: 250,
              data: prepareCategoryData(),
              arcLabel: (item) => `${item.label}: $${item.value.toLocaleString()}`,
              arcLabelMinAngle: 35,
              outerRadius: 175,
              highlightScope: { fade: 'global', highlight: 'item' },
            },
            {
              cx: 250,
              cornerRadius: 10,
              data: prepareSubcategoryData(),
              arcLabel: (item) => `${item.label}: $${item.value.toLocaleString()}`,
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

      <div className="actions-section">
        <button className="primary-button" onClick={exportToCSV}>
          Export to CSV
        </button>
        <label className="primary-button">
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

export default NetWorthCalculator;