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

  // Generate PTO Gained and update balances but preserve editable data
  useEffect(() => {
    updateTable(displayedRows);
  }, [settings, displayedRows]);

  const updateTable = (rowCount) => {
    const newTableData = [...tableData]; // Copy existing data
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

      // If this row already exists, preserve the user-entered data (e.g., ptoSpent, compSpent)
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
        ...existingRow, // Preserve user-entered data
        paydate: paydate.toLocaleDateString('en-US'),
        ptoGained: ptoGained.toFixed(2), // Auto-generated and non-editable
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

    // Update balances based on this change
    updateTable(displayedRows); // This will recalculate all the balances reactively

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
    <>
<form className='flexbox'>
  <label>
    PTO Days per Year:
    <input type="number" name="ptoDaysPerYear" value={settings.ptoDaysPerYear} onChange={handleSettingsChange} />
  </label>
  <label>
    Pay Frequency (days):
    <input type="number" name="payFrequency" value={settings.payFrequency} onChange={handleSettingsChange} />
  </label>
  <label>
    Most Recent Pay Date:
    <input type="date" name="mostRecentPayDate" value={settings.mostRecentPayDate} onChange={handleSettingsChange} />
  </label>
  <label>
    PTO Accrual or Lump Sum:
    <select name="ptoAccrual" value={settings.ptoAccrual} onChange={handleSettingsChange}>
      <option value="accrual">Accrual</option>
      <option value="lumpSum">Lump Sum</option>
    </select>
  </label>
  <label>
    Enable Comp Time:
    <input type="checkbox" name="enableCompTime" checked={settings.enableCompTime} onChange={handleSettingsChange} />
  </label>
  {settings.enableCompTime && (
    <>
      <label>
        Current Comp Balance:
        <input type="number" name="currentCompBalance" value={settings.currentCompBalance} onChange={handleSettingsChange} />
      </label>
    </>
  )}
  <label>
    Allow Holiday Banking:
    <input type="checkbox" name="allowHolidayBanking" checked={settings.allowHolidayBanking} onChange={handleSettingsChange} />
  </label>
  {settings.allowHolidayBanking && (
    <>
      <label>
        Current Holiday Balance:
        <input type="number" name="currentHolidayBalance" value={settings.currentHolidayBalance} onChange={handleSettingsChange} />
      </label>
    </>
  )}
</form>


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
              <td>{data.ptoGained}</td> {/* Non-editable column */}
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
                <td>{data.compGained}</td> {/* Non-editable column */}
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
                <td>{data.holidayGained}</td> {/* Non-editable column */}
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

      <button onClick={loadMoreRows}>Load More</button>
    </>
  );
};

export default VacationPlanner;
