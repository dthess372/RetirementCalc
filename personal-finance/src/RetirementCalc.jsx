import React from 'react';
import "./RetirementCalc.css";
import { Tooltip as ReactToolTip} from 'react-tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class RetirementCalc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      birthDate: '01/01/2000', currentTenure: 0, currentSalary: 50000, yearlyRaise: 5,
      initialBalance401k: 0, personal401KContribution: 5, employer401KMatch: 0, expected401kYoY: 7, variance401kYoY: 10,
      initialBalanceStock: 0, allocationStock: 10, allocationStockVariance: 1, expectedStockYoY: 20, varianceStockYoY: 10, vestingPeriodStock: 5
    }; 

    this.handleBDayChange = this.handleBDayChange.bind(this);
    this.handleTenureChange = this.handleTenureChange.bind(this);    
    this.handleSalaryChange = this.handleSalaryChange.bind(this);
    this.handleRaiseChange = this.handleRaiseChange.bind(this);

    this.handle401KBalanceChange = this.handle401KBalanceChange.bind(this);
    this.handlePersonal401kContributionChange = this.handlePersonal401kContributionChange.bind(this);
    this.handleEmployer401kMatchChange = this.handleEmployer401kMatchChange.bind(this);
    this.handleExpected401kYoYChange = this.handleExpected401kYoYChange.bind(this);
    this.handle401kYoYVarianceChange = this.handle401kYoYVarianceChange.bind(this);

    this.handleStockBalanceChange = this.handleStockBalanceChange.bind(this);
    this.handleStockAllocationChange = this.handleStockAllocationChange.bind(this);
    this.handleStockAllocationVarianceChange = this.handleStockAllocationVarianceChange.bind(this);
    this.handleExpectedStockYoYChange = this.handleExpectedStockYoYChange.bind(this);
    this.handleStockYoYVarianceChange = this.handleStockYoYVarianceChange.bind(this);
    this.handleVestingPeriodChange = this.handleVestingPeriodChange.bind(this);
  }

  handleBDayChange(event) {
    event.preventDefault();
    this.setState({ birthDate: event.target.value })}
  handleTenureChange(event) {
    event.preventDefault();
    this.setState({ currentTenure: event.target.value })}
  handleRaiseChange(event) {
    event.preventDefault();
    this.setState({ yearlyRaise: event.target.value })}
  handleSalaryChange(event) {
    event.preventDefault();
    this.setState({ currentSalary: event.target.value })}

  handlePersonal401kContributionChange(event) {
    event.preventDefault();
    this.setState({ personal401KContribution: event.target.value })}
  handleEmployer401kMatchChange(event) {
    event.preventDefault();
    this.setState({ employer401KMatch: event.target.value })}
  handle401KBalanceChange(event) {
    event.preventDefault();
    this.setState({ initialBalance401k: event.target.value })}
  handleExpected401kYoYChange(event) {
    event.preventDefault();
    this.setState({ expected401kYoY: event.target.value })}
  handle401kYoYVarianceChange(event) {
    event.preventDefault();
    this.setState({ variance401kYoY: event.target.value })}

  handleStockBalanceChange(event) {
    event.preventDefault();
    this.setState({ initialBalanceStock: event.target.value })}
    handleStockAllocationChange(event) {
      event.preventDefault();
      this.setState({ allocPercentStock: event.target.value })}
    handleStockAllocationVarianceChange(event) {
      event.preventDefault();
      this.setState({ allocationStockVariance: event.target.value })}
  handleExpectedStockYoYChange(event) {
    event.preventDefault();
    this.setState({ expectedStockYoY: event.target.value })}
  handleStockYoYVarianceChange(event) {
    event.preventDefault();
    this.setState({ varianceStockYoY: event.target.value })}
    handleVestingPeriodChange(event) {
    event.preventDefault();
    this.setState({ vestingPeriodStock: event.target.value })}
  calculateTable(){
    
  }
  

  render() {
    const contributionLimit401k = 22500;

    const tableData = [];

    const birthDate = new Date(this.state.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    let tenure = this.state.currentTenure;
    let salary = this.state.currentSalary;

    let balance401k = this.state.initialBalance401k; 
    let balanceStock = this.state.initialBalanceStock; 

    const vestingPeriod = this.state.vestingPeriodStock; 

    let year = today.getFullYear();
    let balanceYearVestedStock;
    for (; age <= 67; tenure++) {

      let employerContributionPercent401k = Math.min(this.state.employer401KMatch, this.state.personal401KContribution);
      let totalContributionPercent401k = (this.state.personal401KContribution + employerContributionPercent401k) /100; 
      let contributionDollars401k = Math.min(salary * totalContributionPercent401k , contributionLimit401k);
      //if(contributionDollars401k === contributionLimit401k){ // not exactly right
        //totalContributionPercent401k = contributionLimit401k / salary;
        // personal401KContribution = totalContributionPercent401k/2;
        //employerContributionPercent401k = Math.min(this.state.employer401KMatch, this.state.personal401KContribution);
      //}

      const YoY401k = ( Math.random() * (this.state.variance401kYoY*2) - (this.state.variance401kYoY-this.state.expected401kYoY) ) / 100 ;
      const YoYStock = ( Math.random() * (this.state.varianceStockYoY*2) - (this.state.varianceStockYoY-this.state.expectedStockYoY) ) / 100 ;

      let appreciation401k = balance401k * YoY401k;
      let appreciationStock = balanceStock * YoYStock;

      const allocPercentStock = ( Math.random() * (this.state.allocationStockVariance*2) - (this.state.allocationStockVariance-this.state.allocationStock) ) / 100 ;
      const allocDollarsStock = salary * this.state.allocationStock;

      balance401k = balance401k + contributionDollars401k + appreciation401k;
      balanceStock = balanceStock + allocDollarsStock + appreciationStock;

      const vestedPercentStock = Math.min(tenure / vestingPeriod, 1);
      const vestedBalanceStock = vestedPercentStock * balanceStock;

      const totalRetirement = balance401k + vestedBalanceStock;

      tableData.push({
        year,
        age,
        tenure,
        salary,

        totalContributionPercent401k,
        contributionDollars401k,
        YoY401k,
        appreciation401k,
        balance401k,

        allocPercentStock,
        allocDollarsStock,
        YoYStock,     
        appreciationStock,
        balanceStock,
        vestedPercentStock,
        vestedBalanceStock,

        totalRetirement,
      });

      year++;
      age++;
      salary *= 1 + this.state.yearlyRaise / 100;

      if(tenure === vestingPeriod+1){
        balanceYearVestedStock = balanceStock;
      }
    }

    const dollarFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

    const percentFormat = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1
    });

    return( 
    <>
      <form>
        <div className='test'>

          <h2 className='input-sectionTitle'>
            Input Fields
            <p className='input-subtitle'>
            Fill in your own info or enter some sample info just to check out the results
            </p>
            <p className='input-subtitle'>
            After you're done, check out the generated table and graphs to calculate your retirement
            </p>
            <p className='input-subtitle'>
            *None of the information on this site is saved*
            </p>
          </h2>

      <div className='input-flexcol'>
        <div className='input-group'>
          <div className='input-title general'>General</div> 
          <label className='inputRow'>Birthdate 
          <input type="date" value={this.state.birthDate} onChange={this.handleBDayChange}/>
          <a data-tooltip-id='birthdate' data-tooltip-content={"Used to determine age and how long to retirement"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
          </label>
          <label className='inputRow'>Current Tenure 
          <input type="number" value={this.state.currentTenure} onChange={this.handleTenureChange}/>
          <a data-tooltip-id='tenure' data-tooltip-content={"Used with vesting period (if applicable) to determine vesting schedule"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
          </label>
          <label className='inputRow'>Current Salary <input type="number" value={this.state.currentSalary} onChange={this.handleSalaryChange}/></label>
          <label className='inputRow'>Expected Annual Raise <input type="number" value={this.state.yearlyRaise} onChange={this.handleRaiseChange}/><span className='perc'>%</span></label>
        </div>
        <div className='input-group'>
        <div className='input-title k401'>401K</div> 
        <label className='inputRow'>Current Balance <input type="number" value={this.state.initialBalance401k} onChange={this.handle401KBalanceChange}/></label>
        <label className='inputRow'>Personal Contribution <input type="number" value={this.state.personal401KContribution} onChange={this.handlePersonal401kContributionChange}/><span className='perc'>%</span></label>
        <label className='inputRow'>Employer Match <input type="number" value={this.state.employer401KMatch} onChange={this.handleEmployer401kMatchChange}/><span className='perc'>%</span></label>
        <label className='inputRow'>
          Average Annual ROI 
          <input type="number" value={this.state.expected401kYoY} onChange={this.handleExpected401kYoYChange}/>
          <span className='perc'>%</span>
          <a data-tooltip-id='roi401k' data-tooltip-content={"The average amount this account is expected to appreciate in a year (typically 6-8%)"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
          </label>
        <label className='inputRow'>
          ROI Variance 
          <input type="number" value={this.state.variance401kYoY} onChange={this.handle401kYoYVarianceChange}/>
          <span className='perc'>%</span>
          <a data-tooltip-id='variance401k' data-tooltip-content={"The max percentage (±) the Annual 401k ROI might differ from the number above"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
          </label>
        </div>
        <div className='input-group'>          
        <div className='input-title Stock'>Company Stock</div> 
        <label className='inputRow'>Current Balance <input type="number" value={this.state.initialBalanceStock} onChange={this.handleStockBalanceChange}/></label>
        <label className='inputRow'>Annual Allocation 
          <input type="number" value={this.state.allocationStock} onChange={this.handleStockAllocationChange}/>
          <span className='perc'>%</span>
          <a data-tooltip-id='allocation' data-tooltip-content={"The expected percentage of an employee's salary a company allocates in stock annually"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        </label>
        <label className='inputRow'>Allocation Variance 
        <input type="number" value={this.state.allocationStockVariance} onChange={this.handleStockAllocationVarianceChange}/>
        <span className='perc'>%</span>
        <a data-tooltip-id='allocationVariance' data-tooltip-content={"The max percentage (±) the Annual Stock Allocation might differ from the number above"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        </label>
        <label className='inputRow'>Annual ROI 
        <input type="number" value={this.state.expectedStockYoY} onChange={this.handleExpectedStockYoYChange}/>
        <span className='perc'>%</span>
        <a data-tooltip-id='roiStock' data-tooltip-content={"The average amount this account is expected to appreciate in a year"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        </label>
        <label className='inputRow'>ROI Variance 
        <input type="number" value={this.state.varianceStockYoY} onChange={this.handleStockYoYVarianceChange}/>
        <span className='perc'>%</span>
        <a data-tooltip-id='varianceStock' data-tooltip-content={"The max percentage (±) the Annual Stock ROI might differ from the number above"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        </label>
        <label className='inputRow'>Vesting Period 
        <input type="number" value={this.state.vestingPeriodStock} onChange={this.handleVestingPeriodChange}/>
        <a data-tooltip-id='vesting' data-tooltip-content={"The number of years it takes the company stock to vest"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        </label>
        </div>
      </div>     

      <ReactToolTip id='birthdate'/>
      <ReactToolTip id='tenure'/>
      <ReactToolTip id='roi401k'/>
      <ReactToolTip id='variance401k'/>
      <ReactToolTip id='allocation'/>
      <ReactToolTip id='allocationVariance'/>
      <ReactToolTip id='roiStock'/>
      <ReactToolTip id='varianceStock'/>
      <ReactToolTip id='vesting'/>

      </div>

      <table>

        <thead>
          <tr>
            <th className="headers general" colSpan={4}>General</th>
            <th className="headers k401" colSpan={4}>401k</th>
            <th className="headers Stock" colSpan={7}>Stock</th>
            <th className="headers total" colSpan={3}>Total</th>
          </tr>

          <tr>
            <th rowSpan={2}>Year</th>
            <th rowSpan={2}>Age</th>
            <th rowSpan={2}>Tenure</th>
            <th rowSpan={2} className='thickBorder'>Salary</th>
            <th rowSpan={2}>Contributions</th>
            <th colSpan={2}>YoY</th>
            <th rowSpan={2} className='thickBorder'>Balance</th>
            <th colSpan={2}>Allocation</th>
            <th colSpan={2}>YoY</th>
            <th rowSpan={2}>Balance</th>
            <th colSpan={2} className='thickBorder'>Vested</th>
            <th rowSpan={2}>Balance</th>
            {/* <th rowSpan={2}>Retirement Salary</th> */}
          </tr>

          <tr className='smolrow'>
            <th>%</th>
            <th>$</th>
            <th>%</th>
            <th>$</th>
            <th>%</th>
            <th>$</th>
            <th>%</th>
            <th className='thickBorder'>$</th>            
          </tr>

        </thead>

        <tbody>
          {tableData.map((data, index) => (
            <tr key={index}>
              <td >{data.year}</td>
              <td >{data.age}</td>
              <td >{data.tenure}</td>
              <td className='thickBorder'>{dollarFormat.format(data.salary)}</td>
              <td >{dollarFormat.format(data.contributionDollars401k)}</td>
              <td >{percentFormat.format(data.YoY401k)}</td>
              <td >{dollarFormat.format(data.appreciation401k)}</td>
              <td  className='thickBorder'>{dollarFormat.format(data.balance401k)}</td>
              <td >{percentFormat.format(data.allocPercentStock)}</td>
              <td >{dollarFormat.format(data.allocDollarsStock)}</td>
              <td >{percentFormat.format(data.YoYStock)}</td>
              <td >{dollarFormat.format(data.appreciationStock)}</td>
              <td >{dollarFormat.format(data.balanceStock)}</td>
              <td >{percentFormat.format(data.vestedPercentStock)}</td>
              <td className='thickBorder'>{dollarFormat.format(data.vestedBalanceStock)}</td>
              <td>{dollarFormat.format(data.totalRetirement)}</td>
              {/* <td>{dollarFormat.format(data.retirementSalary)}</td> */}
            </tr>
          ))} 
        </tbody>

      </table>



      <div className='chartHolder'>
      .<h2 className='chartTitle'>Total Balances</h2>
      <LineChart
        className='chart'
        width={1500}
        height={750}
        data={tableData}
        margin={{
            left: 25, bottom: 50
        }}
      >
        <CartesianGrid stroke="#333" strokeDasharray="5 5" />
        <XAxis dataKey="tenure" stroke='#880000'/>
        <YAxis stroke='#880000'/>
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalRetirement" stroke="#ff0000" strokeWidth={3} />
        <Line type="monotone" dataKey="balanceStock" stroke="#8884d8" />
        <Line type="monotone" dataKey="balance401k" stroke="#0084d8"/>
      </LineChart>

      <h2 className='chartTitle'>Income</h2>
      <LineChart
        className='chart'
        width={1500}
        height={750}
        data={tableData}
        margin={{
            left: 25, bottom: 50
        }}
      >
        <CartesianGrid stroke="#333" strokeDasharray="5 5" />
        <XAxis dataKey="tenure" end={20} stroke='#880000'/>
        <YAxis stroke='#880000' allowDecimals={false}/>
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="salary" stroke="#ff0000" strokeWidth={3} />
        <Line type="monotone" dataKey="appreciationStock" stroke="#8884d8"/>
        <Line type="monotone" dataKey="appreciation401k" stroke="#0084d8"/>
      </LineChart>

      <h2 className='chartTitle'>Vesting Schedule</h2>
      <LineChart
        className='chart'
        width={1500}
        height={750}
        data={tableData}
        margin={{
            left: 25, bottom: 50
        }}
      >
        <CartesianGrid stroke="#333" strokeDasharray="5 5" />
        <XAxis type="number" dataKey="tenure" stroke='#880000' domain={[0, vestingPeriod+1]} allowDataOverflow={true}/>
        <YAxis  type="number" domain={[0, balanceYearVestedStock]} allowDataOverflow={true} stroke='#880000'/>
        <Tooltip />
        <Legend />
        <Line type="linear" dataKey="vestedBalanceStock" stroke="#8884d8" strokeWidth={3} />
        <Line type="linear" dataKey="balanceStock" stroke="#ff0000"  />
      </LineChart>
      </div>
      </form>
    </>);
  }
}

export default RetirementCalc;
