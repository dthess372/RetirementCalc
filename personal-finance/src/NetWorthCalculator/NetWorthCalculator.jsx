import React, { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
      const rows = text.split('\n').slice(1); // Skip header
      
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

  const getPieData = (category) => {
    return accounts[category].map(account => ({
      name: account.name,
      value: Math.abs(account.value)
    }));
  };

  const getCategoryPieData = () => {
    return Object.keys(accounts).map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: Math.abs(calculateCategoryTotal(category))
    }));
  };

  return (
    <div className="net-worth-calculator">
      <h1 className="title">Net Worth Calculator</h1>
      
      <div className="controls">
        <input
          type="text"
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
          placeholder="New account name"
          className="input"
        />
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select"
        >
          {Object.keys(accounts).map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        <button onClick={addAccount} className="button">Add Account</button>
      </div>

      <div className="import-export">
        <button onClick={exportToCSV} className="button">Export CSV</button>
        <input
          type="file"
          accept=".csv"
          onChange={importCSV}
          className="file-input"
        />
      </div>

      <div className="table-container">
        <table className="accounts-table">
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
                <tr className="category-row">
                  <td colSpan="2">{category.charAt(0).toUpperCase() + category.slice(1)}</td>
                  <td>${calculateCategoryTotal(category).toLocaleString()}</td>
                  <td></td>
                </tr>
                {accountList.map((account, index) => (
                  <tr key={`${category}-${account.name}`}>
                    <td></td>
                    <td>{account.name}</td>
                    <td>
                      <input
                        type="number"
                        value={account.value}
                        onChange={(e) => handleValueChange(category, index, e.target.value)}
                        className="value-input"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => removeAccount(category, index)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            <tr className="total-row">
              <td colSpan="2">Net Worth</td>
              <td>${calculateNetWorth().toLocaleString()}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="charts-container">
        <div className="category-charts">
          {Object.keys(accounts).map(category => (
            <div key={category} className="chart">
              <h3>{category.charAt(0).toUpperCase() + category.slice(1)} Breakdown</h3>
              <PieChart width={300} height={300}>
                <Pie
                  data={getPieData(category)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {getPieData(category).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          ))}
        </div>
        
        <div className="total-chart">
          <h3>Overall Distribution</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={getCategoryPieData()}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {getCategoryPieData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default NetWorthCalculator;