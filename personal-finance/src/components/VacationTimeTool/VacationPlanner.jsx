import React, { useState, useEffect } from 'react';
import './VacationPlanner.css';

const VacationPlanner = () => {
  const [settings, setSettings] = useState({
    ptoDaysPerYear: 0,
    payFrequency: 14,
    mostRecentPayDate: new Date().toISOString().split('T')[0],
    ptoAccrual: 'accrual',
    currentPtoBalance: 0,
    ptoRolloverLimit: null,
    enableCompTime: false,
    currentCompBalance: 0,
    compRolloverLimit: null,
    holidays: [],
    allowHolidayBanking: false,
    currentHolidayBalance: 0,
    holidayRolloverLimit: null,
  });

  const [tableData, setTableData] = useState([]);
  const [displayedRows, setDisplayedRows] = useState(10);

  useEffect(() => {
    updateTable(displayedRows);
  }, [settings, displayedRows]);

  const updateTable = (rowCount) => {
    const newTableData = [...tableData];
    let paydate = new Date(settings.mostRecentPayDate);

    const totalPtoPerYear = settings.ptoDaysPerYear;
    const payPeriodsPerYear = Math.ceil(365 / settings.payFrequency);
    const ptoPerPeriod = settings.ptoAccrual === 'accrual' ? totalPtoPerYear / payPeriodsPerYear : totalPtoPerYear;

    let accumulatedPto = settings.currentPtoBalance;
    let accumulatedComp = settings.currentCompBalance;
    let accumulatedHoliday = settings.currentHolidayBalance;

    for (let i = 0; i < rowCount; i++) {
      const ptoGained = settings.ptoAccrual === 'accrual' ? ptoPerPeriod : (i === 0 ? totalPtoPerYear : 0);
      const compGained = settings.enableCompTime ? 0 : null;
      const existingRow = newTableData[i] || {};

      accumulatedPto = i > 0
        ? (parseFloat(newTableData[i - 1].ptoBalance) + ptoGained - (existingRow.ptoSpent || 0)).toFixed(2)
        : (settings.currentPtoBalance + ptoGained).toFixed(2);

      accumulatedComp = settings.enableCompTime && i > 0
        ? (parseFloat(newTableData[i - 1].compBalance) + parseFloat(compGained) - (existingRow.compSpent || 0)).toFixed(2)
        : (settings.enableCompTime ? settings.currentCompBalance : null);

      accumulatedHoliday = settings.allowHolidayBanking && i > 0
        ? (parseFloat(newTableData[i - 1].holidayBalance) + (existingRow.holidayGained || 0) - (existingRow.holidaySpent || 0)).toFixed(2)
        : (settings.allowHolidayBanking ? settings.currentHolidayBalance : null);

      newTableData[i] = {
        ...existingRow,
        paydate: paydate.toLocaleDateString('en-US'),
        ptoGained: ptoGained.toFixed(2),
        ptoBalance: accumulatedPto,
        compGained: settings.enableCompTime ? compGained.toFixed(2) : null,
        compBalance: settings.enableCompTime ? accumulatedComp : null,
        holidayGained: settings.allowHolidayBanking ? 0 : null,
        holidayBalance: settings.allowHolidayBanking ? accumulatedHoliday : null,
        totalBalance: (parseFloat(accumulatedPto) + (accumulatedComp ? parseFloat(accumulatedComp) : 0) + (accumulatedHoliday ? parseFloat(accumulatedHoliday) : 0)).toFixed(2),
      };

      paydate.setDate(paydate.getDate() + settings.payFrequency);
    }

    setTableData(newTableData);
  };

  const handleChange = (e, index, field) => {
    const value = parseFloat(e.target.value) || 0;
    const updatedData = [...tableData];
    updatedData[index][field] = value.toFixed(2);
    updateTable(displayedRows);
    setTableData(updatedData);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const loadMoreRows = () => {
    setDisplayedRows((prevRows) => prevRows + 10);
  };

  return (
    <div className="vacation-planner">
      <h1>Vacation Planner</h1>

      <section className="settings-section">
        <h2>Time Off Settings</h2>
        <div className="settings-grid">
          <div className="input-section">
            <div className="form-group">
              <label>PTO Days per Year</label>
              <input 
                type="number" 
                name="ptoDaysPerYear" 
                value={settings.ptoDaysPerYear} 
                onChange={handleSettingsChange} 
              />
            </div>

            <div className="form-group">
              <label>Pay Frequency (days)</label>
              <input 
                type="number" 
                name="payFrequency" 
                value={settings.payFrequency} 
                onChange={handleSettingsChange} 
              />
            </div>

            <div className="form-group">
              <label>Most Recent Pay Date</label>
              <input 
                type="date" 
                name="mostRecentPayDate" 
                value={settings.mostRecentPayDate} 
                onChange={handleSettingsChange} 
              />
            </div>

            <div className="form-group">
              <label>PTO Accrual Type</label>
              <select 
                name="ptoAccrual" 
                value={settings.ptoAccrual} 
                onChange={handleSettingsChange}
              >
                <option value="accrual">Accrual</option>
                <option value="lumpSum">Lump Sum</option>
              </select>
            </div>
          </div>

          <div className="input-section">
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="enableCompTime" 
                  checked={settings.enableCompTime} 
                  onChange={handleSettingsChange} 
                />
                Enable Comp Time
              </label>
            </div>

            {settings.enableCompTime && (
              <div className="form-group">
                <label>Current Comp Balance</label>
                <input 
                  type="number" 
                  name="currentCompBalance" 
                  value={settings.currentCompBalance} 
                  onChange={handleSettingsChange} 
                />
              </div>
            )}

            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="allowHolidayBanking" 
                  checked={settings.allowHolidayBanking} 
                  onChange={handleSettingsChange} 
                />
                Allow Holiday Banking
              </label>
            </div>

            {settings.allowHolidayBanking && (
              <div className="form-group">
                <label>Current Holiday Balance</label>
                <input 
                  type="number" 
                  name="currentHolidayBalance" 
                  value={settings.currentHolidayBalance} 
                  onChange={handleSettingsChange} 
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="projections-section">
        <h2>Time Off Projections</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Paydate</th>
                <th>PTO +</th>
                <th>PTO -</th>
                <th>PTO Balance</th>
                {settings.enableCompTime && <>
                  <th>Comp +</th>
                  <th>Comp -</th>
                  <th>Comp Balance</th>
                </>}
                {settings.allowHolidayBanking && <>
                  <th>Holiday +</th>
                  <th>Holiday -</th>
                  <th>Holiday Balance</th>
                </>}
                <th>Total Balance</th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td>{data.paydate}</td>
                  <td>{data.ptoGained}</td>
                  <td>
                    <input
                      type="number"
                      step="1"
                      value={data.ptoSpent}
                      onChange={(e) => handleChange(e, index, 'ptoSpent')}
                    />
                  </td>
                  <td>{data.ptoBalance}</td>
                  {settings.enableCompTime && <>
                    <td>{data.compGained}</td>
                    <td>
                      <input
                        type="number"
                        step="1"
                        value={data.compSpent}
                        onChange={(e) => handleChange(e, index, 'compSpent')}
                      />
                    </td>
                    <td>{data.compBalance}</td>
                  </>}
                  {settings.allowHolidayBanking && <>
                    <td>{data.holidayGained}</td>
                    <td>
                      <input
                        type="number"
                        step="1"
                        value={data.holidaySpent}
                        onChange={(e) => handleChange(e, index, 'holidaySpent')}
                      />
                    </td>
                    <td>{data.holidayBalance}</td>
                  </>}
                  <td>{data.totalBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="actions-section">
          <button className="primary-button" onClick={loadMoreRows}>
            Load More Rows
          </button>
        </div>
      </section>
    </div>
  );
};

export default VacationPlanner;