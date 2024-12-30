import React from 'react';
import "./RetirementCalc.css";
import { Tooltip as ReactToolTip } from 'react-tooltip';
import { validateForm } from './formValidation';
import DynamicChart from './DynamicChart';

class RetirementCalc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      birthDate: '1999-01-01',
      currentTenure: 0,
      currentSalary: 75000,
      yearlyRaise: 4,
      initialBalance401k: 0,
      personal401KContribution: 3,
      employer401KMatch: 3,
      initialContributionsRothIRA: 0,
      initialEarningsRothIRA: 0,
      RothIRAContribution: 3,
      initialBalanceStock: 0,
      allocationStock: 5,
      allocationStockVariance: 2,
      vestingPeriod: 5,
      numSimulations: 1000,
      simulationResults: {
        "401k": [],
        RothIRA: [],
        Stock: []
      },
      statistics: {
        "401k": {},
        RothIRA: {},
        Stock: {}
      },
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  runMonteCarloSimulations() {
    const categories = ["401k", "RothIRA", "Stock"];
    const results = {};
    categories.forEach((category) => {
      results[category] = this.runCategorySimulations(category);
    });

    const statistics = this.calculateStatistics(results);
    this.setState({ simulationResults: results, statistics });
  }

  runCategorySimulations(category) {
    const simulations = [];
    for (let i = 0; i < this.state.numSimulations; i++) {
      const result = this.calculateTable(category, true);
      simulations.push(result.map((year) => year[category].balance));
    }
    return simulations;
  }

  calculateStatistics(results) {
    const stats = {};
    Object.keys(results).forEach((category) => {
      const allSimulations = results[category];
      const yearlyStats = [];

      for (let yearIndex = 0; yearIndex < allSimulations[0].length; yearIndex++) {
        const balances = allSimulations.map((sim) => sim[yearIndex]);
        yearlyStats.push(this.computeQuartiles(balances));
      }

      stats[category] = yearlyStats;
    });
    return stats;
  }

  computeQuartiles(data) {
    data.sort((a, b) => a - b);
    const min = data[0];
    const max = data[data.length - 1];
    const median = this.calculatePercentile(data, 50);
    const q1 = this.calculatePercentile(data, 25);
    const q3 = this.calculatePercentile(data, 75);
    return { min, max, median, q1, q3 };
  }

  calculatePercentile(data, percentile) {
    const index = (percentile / 100) * (data.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) {
      return data[lower];
    }
    return data[lower] + (index - lower) * (data[upper] - data[lower]);
  }

  calculateTable(category, isSimulation = false) {
    const INFLATION_RATE = 0.02;

    const contributionLimit401k = 22500;
    const contributionLimitRothIRA = 7000;
    const retirementAge = 67;

    const birthDate = new Date(this.state.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    let tenure = this.state.currentTenure;
    let salary = this.state.currentSalary;

    const balance = {
      "401k": parseFloat(this.state.initialBalance401k),
      RothIRA: parseFloat(this.state.initialContributionsRothIRA) + parseFloat(this.state.initialEarningsRothIRA),
      Stock: parseFloat(this.state.initialBalanceStock)
    };

    const yearlyData = [];
    let year = today.getFullYear();

    while (age <= retirementAge) {
      const YoY = isSimulation
        ? this.generateRealisticReturn(
            this.state[`expected401kYoY`], // Fixed to hardcoded future expected conditions
            this.state[`variance401kYoY`]
          )
        : 0.07; // Assumes a standard market return

      const appreciation = balance[category] * YoY;
      balance[category] += appreciation;

      yearlyData.push({
        year,
        age,
        [category]: {
          balance: balance[category],
          appreciation
        }
      });

      year++;
      age++;
      salary *= (1 + this.state.yearlyRaise / 100) * (1 + INFLATION_RATE);
    }

    return yearlyData;
  }

  generateRealisticReturn(expectedReturn, variance) {
    const standardDeviation = variance / 2;
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return (expectedReturn + z0 * standardDeviation) / 100;
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  handleFormSubmit(event) {
    event.preventDefault();
    if (validateForm(this.state)) {
      this.runMonteCarloSimulations();
    } else {
      console.error("Form submission failed due to validation errors");
    }
  }

  render() {
    // const { tableData } = this.state;
    const { statistics } = this.state;

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
<form onSubmit={this.handleFormSubmit}>

  <div className='input-section'>
    {/* <h2 className='input-sectionTitle'>
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
    </h2> */}


    <div className='input-group'>
      <div className='input-title general'>General</div> 
      <label className='inputRow'>Birthdate 
      <input type="date" name="birthDate" value={this.state.birthDate} onChange={this.handleChange}/>
      <a data-tooltip-id='birthdate' data-tooltip-content={"Used to determine age and how long to retirement"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
      </label>
      <label className='inputRow'>Tenure 
      <input type="number" name="currentTenure" value={this.state.currentTenure} onChange={this.handleChange}/>
      <a data-tooltip-id='tenure' data-tooltip-content={"Used with vesting period (if applicable) to determine vesting schedule"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
      </label>
      <label className='inputRow'>Current Salary 
      <input type="number" name="currentSalary" value={this.state.currentSalary} onChange={this.handleChange}/>
      </label>
      <label className='inputRow'>Annual Raise <input type="number" name="yearlyRaise" value={this.state.yearlyRaise} onChange={this.handleChange}/><span className='perc'>%</span></label>
    </div>

    <div className='input-group'>
    <div className='input-title k401'>401K</div> 
    <label className='inputRow'>Current Balance <input type="number" name="initialBalance401k" value={this.state.initialBalance401k} onChange={this.handleChange}/></label>
    <div className='input-subcat'>
    <label className='inputRow'>Personal Contribution <input type="number" name="personal401KContribution" value={this.state.personal401KContribution} onChange={this.handleChange}/><span className='perc'>%</span></label>
    <label className='inputRow'>Employer Match <input type="number" name="employer401KMatch" value={this.state.employer401KMatch} onChange={this.handleChange}/><span className='perc'>%</span></label>
    <label>Total Contribution: {parseFloat(this.state.personal401KContribution) + Math.min(parseFloat(this.state.employer401KMatch), parseFloat(this.state.personal401KContribution)) 
} %</label>
    </div>

    </div>

    <div className='input-group'>
    <div className='input-title rothIRA'>Roth IRA</div> 
    <label className='inputRow'>Total Current Contributions<input type="number" name="initialContributionsRothIRA" value={this.state.initialContributionsRothIRA} onChange={this.handleChange}/></label>
    <label className='inputRow'>Total Current Earnings<input type="number" name="initialEarningsRothIRA" value={this.state.initialEarningsRothIRA} onChange={this.handleChange}/></label>
    <label className='inputRow'>Personal Contribution <input type="number" name="RothIRAContribution" value={this.state.RothIRAContribution} onChange={this.handleChange}/><span className='perc'>%</span></label>

    </div>

    <div className='input-group'>          
    <div className='input-title stock'>Company Stock</div> 
    <label className='inputRow'>Current Balance <input type="number" name="initialBalanceStock" value={this.state.initialBalanceStock} onChange={this.handleChange}/></label>
    <div className='input-subcat'>
    <label className='inputRow'>Annual Allocation 
      <input type="number" name="allocationStock" value={this.state.allocationStock} onChange={this.handleChange}/>
      <span className='perc'>%</span>
      <a data-tooltip-id='allocation' data-tooltip-content={"The expected percentage of an employee's salary a company allocates in stock annually"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
    </label>
    <label className='inputRow'>Allocation Variance 
    <input type="number" name="allocationStockVariance" value={this.state.allocationStockVariance} onChange={this.handleChange}/>
    <span className='perc'>%</span>
    <a data-tooltip-id='allocationVariance' data-tooltip-content={"The max percentage (±) the Annual Stock Allocation might differ from the number above"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
    </label>
    <label>Allocation Range: {parseFloat(this.state.allocationStock)-parseFloat(this.state.allocationStockVariance)} to {parseFloat(this.state.allocationStock)+parseFloat(this.state.allocationStockVariance)} %</label>
    </div>
    <div className='input-subcat'>
    <label className='inputRow'>Annual APR 
    <input type="number" name="expectedStockYoY" value={this.state.expectedStockYoY} onChange={this.handleChange}/>
    <span className='perc'>%</span>
    <a data-tooltip-id='APRStock' data-tooltip-content={"The average amount this account is expected to appreciate in a year"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
    </label>
    <label className='inputRow'>Variance 
    <input type="number" name="varianceStockYoY" value={this.state.varianceStockYoY} onChange={this.handleChange}/>
    <span className='perc'>%</span>
    <a data-tooltip-id='varianceStock' data-tooltip-content={"The max percentage (±) the Annual Stock APR might differ from the number above"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
    </label>
    <label>APR Range: {parseFloat(this.state.expectedStockYoY)-parseFloat(this.state.varianceStockYoY)} to {parseFloat(this.state.expectedStockYoY)+parseFloat(this.state.varianceStockYoY)} %</label>

    </div>
    <label className='inputRow'>Vesting Period 
    <input type="number" name="vestingPeriod" value={this.state.vestingPeriod} onChange={this.handleChange}/>
    <a data-tooltip-id='vesting' data-tooltip-content={"The number of years it takes the company stock to vest"} data-tooltip-place='right'>?</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
    </label>
    </div>

  <ReactToolTip id='birthdate'/>
  <ReactToolTip id='tenure'/>
  <ReactToolTip id='APR'/>
  <ReactToolTip id='variance'/>
  <ReactToolTip id='allocation'/>
  <ReactToolTip id='allocationVariance'/>
  <ReactToolTip id='APRStock'/>
  <ReactToolTip id='varianceStock'/>
  <ReactToolTip id='vesting'/>

  </div>

  <button className="RunTheNumbers" type="submit">Run The Numbers</button> 

  </form>

  <div className='sectionDivide'/>

  <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Year</th>
              <th>Min</th>
              <th>Q1</th>
              <th>Median</th>
              <th>Q3</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(statistics).map((category) =>
              statistics[category] &&
              Object.keys(statistics[category]).map((yearIndex) => {
                const stat = statistics[category][yearIndex];
                return (
                  <tr key={`${category}-${yearIndex}`}>
                    <td>{category}</td>
                    <td>{parseInt(yearIndex) + new Date().getFullYear()}</td>
                    <td>{stat.min.toFixed(2)}</td>
                    <td>{stat.q1.toFixed(2)}</td>
                    <td>{stat.median.toFixed(2)}</td>
                    <td>{stat.q3.toFixed(2)}</td>
                    <td>{stat.max.toFixed(2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className='sectionDivide'/> 

  {/* <table>

    <thead>
      <tr>
        <th className="headers" colSpan={3}>General</th>
        <th className="headers" colSpan={4}>401k</th>
        <th className="headers" colSpan={6}>RothIRA</th>
        <th className="headers" colSpan={5}>Stock</th>
        <th className="headers" colSpan={3}>Total</th>
      </tr>

      <tr>
        <th rowSpan={2}>Year</th>
        <th rowSpan={2}>Age</th>
        <th rowSpan={2} className='thickBorder'>Salary</th>
        <th rowSpan={2}>Contrib.</th>
        <th colSpan={2}>Earnings</th>
        <th rowSpan={2} className='thickBorder'>Balance</th>
        <th colSpan={2} >Contrib.</th>
        <th colSpan={3}>Earnings</th>
        <th rowSpan={2} className='thickBorder'>Balance</th>
        <th colSpan={2}>Allocation</th>
        <th colSpan={2}>Earnings</th>
        <th className='thickBorder'>Balance</th>
        <th rowSpan={2}>Balance</th>
      </tr>        

      <tr className='smolrow'>
        <th>Percent</th>
        <th>USD</th>
        <th>Yearly</th>
        <th>Total</th>
        <th>Percent</th>
        <th>USD</th>
        <th>Total</th>
        <th>Percent</th>
        <th>USD</th>   
        <th>Percent</th>
        <th>USD</th>  
        <th className='thickBorder'>(Vested)</th>                     
      </tr>

    </thead>

    <tbody>
      {tableData.map((data, index) => (
        <tr key={index}>
          <td> {data.year}</td>
          <td> {data.age}</td>
          <td className='thickBorder dark'>{dollarFormat.format(data.salary)}</td>

          <td> {dollarFormat.format(data.contributionDollars401k)}</td>
          <td> {data.YoY401k >=0  ? <img src={TickerArrow} className='upArrow' alt=''/> : <img src={TickerArrow} className='downArrow' alt=''/>} {percentFormat.format(data.YoY401k)}</td>
          <td> {dollarFormat.format(data.appreciation401k)}</td>
          <td  className='thickBorder dark'>{dollarFormat.format(data.balance401k)}</td>

          <td> {dollarFormat.format(data.contributionDollarsRothIRA)}</td>
          <td> {dollarFormat.format(data.totalRothIRAContributions)}</td>
          <td> {data.YoYRothIRA >=0  ? <img src={TickerArrow} className='upArrow' alt=''/> : <img src={TickerArrow} className='downArrow' alt=''/>} {percentFormat.format(data.YoYRothIRA)}</td>
          <td> {dollarFormat.format(data.appreciationRothIRA)}</td>
          <td> {dollarFormat.format(data.totalEarningsRothIRA)}</td>
          <td  className='thickBorder dark'>{dollarFormat.format(data.balanceRothIRA)}</td>

          <td> {percentFormat.format(data.allocPercentStock)}</td>
          <td> {dollarFormat.format(data.allocDollarsStock)}</td>
          <td> {data.YoYStock >=0  ? <img src={TickerArrow} className='upArrow'alt=''/> : <img src={TickerArrow} className='downArrow' alt=''/>} {percentFormat.format(data.YoYStock)}</td>
          <td> {dollarFormat.format(data.appreciationStock)}</td>
          <td className='thickBorder dark'>{dollarFormat.format(data.vestedBalanceStock)}</td>

          <td className='total-dark'>{dollarFormat.format(data.totalRetirement)}</td>
        </tr>
      ))} 
    </tbody>

  </table> */}


   <div className='sectionDivide'/> {/* BEGIN CHART */}

   {/* <DynamicChart        
      title="Account Balances"
      data={tableData}
      lines={[
        {dataKey: "totalRetirement",    color: "#CC0000", name: "Total"},
        {dataKey: "balance401k",        color: "#008800", name: "401k"},
        {dataKey: "vestedBalanceStock", color: "#880000", name: "Stock"}
      ]}
      tooltipContent={({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return ( <div className="custom-tooltip" 
          style={{ backgroundColor: 'black', paddingInline: '20px', paddingBlock: '1px', 
          color: 'white', borderRadius: '10px', opacity: '75%'}}>
              <p>{`Year: ${data.year}`}<span> {`Age: ${data.age}`}</span></p>
              <p style={{color: '#CC0000'}}>{`Total Retirement Balance: $${Math.round(payload[0].value).toLocaleString()}`}</p>
              <p style={{color: '#008800'}}>{`401K Balance: $${Math.round(payload[1].value).toLocaleString()}`}</p>
              <p style={{color: '#880000'}}>{`Company Stock Balance: $${Math.round(payload[2].value).toLocaleString()}`}</p> 
      </div> ); } return null; }}
    />      

   <DynamicChart
      title="Annual Income"
      data={tableData}
      lines={[
        {dataKey: "salary",             color:"#CC6102",  name:'Salary'},
        {dataKey: "appreciation401k",   color:"#008800",  name:'401k Appreciation'},
        {dataKey: "appreciationStock",  color:"#880000",  name:'Stock Appreciation'}
      ]}
      tooltipContent={({ active, payload }) => {
        if (active && payload && payload.length) {
          const data = payload[0].payload;
          return ( 
            <div className="custom-tooltip"
              style={{ backgroundColor: 'black', paddingInline: '20px', paddingBlock: '1px',
              color: 'white', borderRadius: '10px', opacity: '75%'}}>
              <p>{`Year: ${data.year}`}<span> {`Age: ${data.age}`}</span></p>
              <p style={{color: '#CC6102'}}>{`Salary: $${Math.round(payload[0].value).toLocaleString()}`}</p>
              <p style={{color: '#008800'}}>{`401K Appreciation: $${Math.round(payload[1].value).toLocaleString()}`}</p>
              <p style={{color: '#880000'}}>{`Company Stock Appreciation: $${Math.round(payload[2].value).toLocaleString()}`}</p> 
            </div> );
        } return null; }}
    />  */}

</>);
  }
}

export default RetirementCalc;
