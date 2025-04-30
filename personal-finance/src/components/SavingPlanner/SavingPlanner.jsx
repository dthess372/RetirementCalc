import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SavingPlanner.css';

const SavingPlanner = () => {
  const [formData, setFormData] = useState({
    startingIncome: 50000,
    annualRaise: 3,
    savingsRate: 20,
  });

  const [projections, setProjections] = useState([]);

  const calculateProjections = () => {
    const { startingIncome, annualRaise, savingsRate } = formData;
    const years = 30;
    const monthlyData = [];
    let currentIncome = startingIncome;
    let cumulativeSavings = 0;

    for (let year = 0; year < years; year++) {
      const yearlyIncome = currentIncome;
      const yearlySavings = (yearlyIncome * savingsRate) / 100;
      const monthlySavings = yearlySavings / 12;
      
      for (let month = 0; month < 12; month++) {
        cumulativeSavings += monthlySavings;
        monthlyData.push({
          year,
          month: month + 1,
          monthlySavings: monthlySavings.toFixed(2),
          cumulativeSavings: cumulativeSavings.toFixed(2),
          yearlyIncome: yearlyIncome.toFixed(2),
        });
      }

      currentIncome *= (1 + annualRaise / 100);
    }

    setProjections(monthlyData);
  };

  useEffect(() => {
    calculateProjections();
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const exportToCSV = () => {
    const headers = ['Year', 'Month', 'Monthly Savings', 'Cumulative Savings', 'Yearly Income'];
    const csvContent = [
      headers.join(','),
      ...projections.map(row => 
        [row.year, row.month, row.monthlySavings, row.cumulativeSavings, row.yearlyIncome].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'savings-projections.csv';
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const [headers, ...rows] = text.split('\n');
      if (rows.length > 0) {
        const firstRow = rows[0].split(',');
        setFormData({
          startingIncome: Number(firstRow[4]),
          annualRaise: 3,
          savingsRate: (Number(firstRow[2]) * 12 / Number(firstRow[4]) * 100).toFixed(1)
        });
      }
    };
    reader.readAsText(file);
  };

  const getChartData = () => {
    return projections.filter(data => data.month === 12).map(data => ({
      year: data.year + 1,
      savings: Number(data.cumulativeSavings)
    }));
  };

  return (
    <div className="savings-calculator">
      <h1>Savings Calculator</h1>

      <section className="input-overview">
        <h2>Input Parameters</h2>
        <div className="flexbox">
          <div className="input-section">
            <div style={{ padding: "0 0 5px" }}>
              Starting Annual Income
            </div>
            <input
              type="number"
              id="startingIncome"
              name="startingIncome"
              value={formData.startingIncome}
              onChange={handleInputChange}
              min="0"
            />
            <div style={{ padding: "20px 0 5px" }}>
              Annual Raise (%)
            </div>
            <input
              type="number"
              id="annualRaise"
              name="annualRaise"
              value={formData.annualRaise}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
            <div style={{ padding: "20px 0 5px" }}>
              Savings Rate (%)
            </div>
            <input
              type="number"
              id="savingsRate"
              name="savingsRate"
              value={formData.savingsRate}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <table>
            <thead>
              <tr>
                <th>Time Period</th>
                <th>Monthly Savings</th>
                <th>Annual Savings</th>
                <th>Annual Income</th>
              </tr>
            </thead>
            <tbody>
              {projections
                .filter(data => data.month === 1)
                .slice(0, 5)
                .map((data, index) => (
                  <tr key={index}>
                    <td>Year {data.year + 1}</td>
                    <td>${Number(data.monthlySavings).toLocaleString()}</td>
                    <td>${(Number(data.monthlySavings) * 12).toLocaleString()}</td>
                    <td>${Number(data.yearlyIncome).toLocaleString()}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="projections-section">
        <h2>Detailed Projections</h2>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th>Monthly Savings</th>
              <th>Cumulative Savings</th>
              <th>Yearly Income</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((data, index) => (
              <tr key={index}>
                <td>{data.year + 1}</td>
                <td>{data.month}</td>
                <td>${Number(data.monthlySavings).toLocaleString()}</td>
                <td>${Number(data.cumulativeSavings).toLocaleString()}</td>
                <td>${Number(data.yearlyIncome).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="chart-section">
        <h2>Savings Growth Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="year" 
              stroke="#fff"
              label={{ value: 'Year', position: 'bottom', fill: '#fff' }} 
            />
            <YAxis 
              stroke="#fff"
              label={{ value: 'Savings ($)', angle: -90, position: 'insideLeft', fill: '#fff' }} 
            />
            <Tooltip 
              formatter={(value) => `$${value.toLocaleString()}`}
              contentStyle={{ backgroundColor: '#111', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#27A25B"
              name="Cumulative Savings"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
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
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
};

export default SavingPlanner;