import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MortgageTool.css';

const MortgageTool = () => {
  const [loanDetails, setLoanDetails] = useState({
    principal: 300000,
    interestRate: 4.5,
    loanTerm: 30
  });

  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const calculateAmortizationSchedule = () => {
    const { principal, interestRate, loanTerm } = loanDetails;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    setMonthlyPayment(payment);

    let remainingBalance = principal;
    const schedule = [];
    let totalInterestPaid = 0;

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = payment - interestPayment;
      totalInterestPaid += interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment: payment.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interestPayment.toFixed(2),
        totalInterest: totalInterestPaid.toFixed(2),
        balance: Math.max(0, remainingBalance).toFixed(2)
      });
    }

    setAmortizationSchedule(schedule);
  };

  useEffect(() => {
    calculateAmortizationSchedule();
  }, [loanDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const exportToCSV = () => {
    const headers = ['Month', 'Payment', 'Principal', 'Interest', 'Total Interest', 'Remaining Balance'];
    const csvContent = [
      headers.join(','),
      ...amortizationSchedule.map(row => 
        [row.month, row.payment, row.principal, row.interest, row.totalInterest, row.balance].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mortgage-amortization.csv';
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const [headers, firstRow] = text.split('\n');
      if (firstRow) {
        const [, payment, , , , balance] = firstRow.split(',');
        const principal = Number(balance);
        setLoanDetails(prev => ({
          ...prev,
          principal
        }));
      }
    };
    reader.readAsText(file);
  };

  const getChartData = () => {
    return amortizationSchedule
      .filter(data => data.month % 12 === 0)
      .map(data => ({
        year: data.month / 12,
        interest: Number(data.totalInterest)
      }));
  };

  return (
    <div className="mortgage-calculator">
      <section>
        <h2>Mortgage Calculator</h2>
        <div className="flexbox">
          <div className="input-section">
            <div style={{ padding: "0 0 5px" }}>
              Loan Amount ($)
            </div>
            <input
              type="number"
              id="principal"
              name="principal"
              value={loanDetails.principal}
              onChange={handleInputChange}
              min="0"
            />
            <div style={{ padding: "20px 0 5px" }}>
              Interest Rate (%)
            </div>
            <input
              type="number"
              id="interestRate"
              name="interestRate"
              value={loanDetails.interestRate}
              onChange={handleInputChange}
              min="0"
              step="0.1"
            />
            <div style={{ padding: "20px 0 5px" }}>
              Loan Term (years)
            </div>
            <input
              type="number"
              id="loanTerm"
              name="loanTerm"
              value={loanDetails.loanTerm}
              onChange={handleInputChange}
              min="1"
              max="50"
            />
          </div>

          <div className="monthly-payment">
            Monthly Payment: ${monthlyPayment.toFixed(2)}
          </div>
        </div>

        <div className="csv-controls">
          <button onClick={exportToCSV}>Export CSV</button>
          <input
            type="file"
            accept=".csv"
            onChange={importCSV}
            className="import-csv"
          />
        </div>
      </section>

      <section className="amortization-schedule">
        <h2>Amortization Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Payment</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Total Interest</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {amortizationSchedule.map((payment) => (
              <tr key={payment.month}>
                <td>{payment.month}</td>
                <td>${payment.payment}</td>
                <td>${payment.principal}</td>
                <td>${payment.interest}</td>
                <td>${payment.totalInterest}</td>
                <td>${payment.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="interest-chart">
        <h2>Total Interest Paid Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Year', position: 'bottom', fill: 'white' }} stroke="white" />
            <YAxis label={{ value: 'Total Interest ($)', angle: -90, position: 'insideLeft', fill: 'white' }} stroke="white" />
            <Tooltip 
              formatter={(value) => `$${value.toLocaleString()}`}
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              labelStyle={{ color: 'white' }}
            />
            <Legend wrapperStyle={{ color: 'white' }} />
            <Bar dataKey="interest" fill="#28a745" name="Total Interest Paid" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default MortgageTool;