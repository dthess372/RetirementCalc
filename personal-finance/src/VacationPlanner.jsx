import React from 'react';
import './VacationPlanner.css';

class VacationPlanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
    };
  }

  componentDidMount() {
    this.makeTable();
  }

  makeTable() {
    const tableData = [];
    const today = new Date(); // Get today's date
    let paydate = new Date(today); // Create a copy of today's date

    for (let i = 0; i <= 30; i++) {
      // Push the current paydate and increment by 14 days for the next entry
      tableData.push({
        paydate: paydate.toLocaleDateString('en-US'), // Format date (MM/DD/YYYY)
        ptoGained: 0,
        ptoSpent: 0,
        ptoBalance: 0,
        compGained: 0,
        compSpent: 0,
        compBalance: 0,
        holidayGained: 0,
        holidaySpent: 0,
        holidayBalance: 0,
        totalGained: 0,
        totalSpent: 0,
        totalBalance: 0,
      });

      // Increment the paydate by 14 days
      paydate.setDate(paydate.getDate() + 14);
    }

    this.setState({ tableData });
  }

  render() {
    const { tableData } = this.state;

    return (
      <>
        <table>
          <thead>
            <tr>
              <th rowSpan={2} className=''>Paydate</th>
              <th colSpan={3} className='tableHeadSection thick'>PTO</th>
              <th colSpan={3} className='tableHeadSection thick'>Comp</th>
              <th colSpan={3} className='tableHeadSection thick'>Holiday</th>
              <th colSpan={3} className='tableHeadSection thick'>Total</th>
            </tr>
            <tr>
              <th className='thick'>+</th>
              <th>-</th>
              <th>Balance</th>
              <th className='thick'>+</th>
              <th>-</th>
              <th>Balance</th>
              <th className='thick'>+</th>
              <th>-</th>
              <th>Balance</th>
              <th className='thick'>+</th>
              <th>-</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((data, index) => (
              <tr key={index}>
                <td className='alignLeft'>{data.paydate}</td>
                <td className='thick'>{data.ptoGained}</td>
                <td className='editable'>{data.ptoSpent}</td>
                <td>{data.ptoBalance}</td>
                <td className='editable thick'>{data.compGained}</td>
                <td className='editable'>{data.compSpent}</td>
                <td>{data.compBalance}</td>
                <td className='thick'>{data.holidayGained}</td>
                <td className='editable'>{data.holidaySpent}</td>
                <td>{data.holidayBalance}</td>
                <td className='thick'>{data.totalGained}</td>
                <td>{data.totalSpent}</td>
                <td>{data.totalBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}

export default VacationPlanner;
