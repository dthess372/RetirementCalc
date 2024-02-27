import React from 'react';
import "./RetirementCalc.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class RetirementCalc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //birthDate: '', age: null, currentTenure: 0, currentSalary: 75000,
      //personal401KContribution:  0, employer401KMatch: 0, intialBalance401k: 0, initialBalanceESOP: 0

       // my info - > replace with default values 
      birthDate: '1999-04-03', age: null, currentTenure: 1, currentSalary: 95130,
      personal401KContribution: 0.03, employer401KMatch: 0.03, initialBalance401k: 5300, initialBalanceESOP: 0 
    }; 

    this.handleBDayChange = this.handleBDayChange.bind(this);
    this.handleTenureChange = this.handleTenureChange.bind(this);
    this.handleSalaryChange = this.handleSalaryChange.bind(this);
    this.handlePersonal401kContributionChange = this.handlePersonal401kContributionChange.bind(this);
    this.handleEmployer401kMatchChange = this.handleEmployer401kMatchChange.bind(this);
    this.handle401KBalanceChange = this.handle401KBalanceChange.bind(this);
    this.handleESOPBalanceChange = this.handleESOPBalanceChange.bind(this);
  }

  handleBDayChange(event) {
    event.preventDefault();
    this.setState({ birthDate: event.target.value })
  }
  handleTenureChange(event) {
    event.preventDefault();
    this.setState({ currentTenure: event.target.value })
  }
  handleSalaryChange(event) {
    event.preventDefault();
    this.setState({ currentSalary: event.target.value })
  }
  handlePersonal401kContributionChange(event) {
    event.preventDefault();
    this.setState({ personal401KContribution: event.target.value })
  }
  handleEmployer401kMatchChange(event) {
    event.preventDefault();
    this.setState({ employer401KMatch: event.target.value })
  }
  handle401KBalanceChange(event) {
    event.preventDefault();
    this.setState({ initialBalance401k: event.target.value })
  }
  handleESOPBalanceChange(event) {
    event.preventDefault();
    this.setState({ initialBalanceESOP: event.target.value })
  }

  calculateTable(){
    
  }
  

  render() {
    const tableData = [];

    const birthDate = new Date(this.state.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    let tenure = this.state.currentTenure;
    let salary = this.state.currentSalary;

    let personal401KContribution = this.state.personal401KContribution; // changing breaks logic -> move logic outside of render method and include in onChange
    const employer401KMatch = this.state.employer401KMatch; // changing breaks logic -> move logic outside of render method and include in onChange
    const contributionLimit401k = 22500;

    
    const annualRaise = 0.05; // table input

    let balance401k = this.state.initialBalance401k; // changing breaks logic -> move logic outside of render method and include in onChange
    let balanceESOP = this.state.initialBalanceESOP; // changing breaks logic -> move logic outside of render method and include in onChange

    let allocPercentESOP = 0.2; // input?
    const vestingPeriod = 5; // input

    const assumedDeathAge = 100; // input
    //const retirementSalaryGoal = 150000; // input
    const retirementAge = 67; // input

    let year = today.getFullYear(); // getYear?
    let balanceYearVestedESOP;
    let firstRow = true;
    for (; age <= retirementAge; tenure++) {

      let employerContributionPercent401k = Math.min(employer401KMatch, personal401KContribution);
      let totalContributionPercent401k = personal401KContribution + employerContributionPercent401k; 
      let contributionDollars401k = Math.min(salary * totalContributionPercent401k, contributionLimit401k);
      if(contributionDollars401k === contributionLimit401k){ // not exactly right
        totalContributionPercent401k = contributionLimit401k / salary;
        personal401KContribution = totalContributionPercent401k/2;
        employerContributionPercent401k = Math.min(employer401KMatch, personal401KContribution);
      }

      const YoY401k = (Math.random()*12- 1)/100 ; // -1% to 11% range -> 5% benchmark
      const YoYESOP = (Math.random()*30)/100 ; // 0% to 30% range -> 20% benchmark (make these parameters inputs to eliminate any potential proprietary info)

      let appreciation401k = balance401k * YoY401k;
      let appreciationESOP = balanceESOP * YoYESOP;

      if(firstRow){
        appreciation401k = 0;
        contributionDollars401k = 0;

        appreciationESOP = 0;
        allocPercentESOP = 0;
      } else {
        allocPercentESOP = 0.2;
      }
      
      const allocDollarsESOP = salary * allocPercentESOP;
      //const YoYESOP = 0.15;

      balance401k = balance401k + contributionDollars401k + appreciation401k;
      balanceESOP = balanceESOP + allocDollarsESOP + appreciationESOP;

      const vestedPercentESOP = Math.min(tenure / vestingPeriod, 1);
      const vestedBalanceESOP = vestedPercentESOP * balanceESOP;

      const totalRetirement = balance401k + vestedBalanceESOP;
      const retirementSalary = totalRetirement/(assumedDeathAge - age);

      tableData.push({
        year,
        age,
        tenure,
        annualRaise,
        salary,
        personal401KContribution,
        employerContributionPercent401k,
        totalContributionPercent401k,
        contributionDollars401k,
        YoY401k,
        appreciation401k,
        balance401k,
        allocPercentESOP,
        allocDollarsESOP,
        YoYESOP,
        appreciationESOP,
        vestedPercentESOP,
        balanceESOP,
        vestedBalanceESOP,
        totalRetirement,
        retirementSalary,
      });

      year++;
      age++;
      salary *= 1+ annualRaise;
      firstRow = false;

      if(tenure === vestingPeriod+1){ // log balance at vesting time
        balanceYearVestedESOP = balanceESOP;
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
      <label>Birthday: <input type="date" value={this.state.birthDate} onChange={this.handleBDayChange}/></label>
      <label>Personal 401k Contribution: <input type="text" value={this.state.personal401KContribution} onChange={this.handlePersonal401kContributionChange}/></label>
      <label>Employer 401k Match: <input type="text" value={this.state.employer401KMatch} onChange={this.handleEmployer401kMatchChange}/></label>

      
      <table>
        <thead>
          <tr>
            <th className="headers" colSpan={5}>General</th>
            <th className="headers" colSpan={7}>401k</th>
            <th className="headers" colSpan={7}>ESOP</th>
            <th className="headers" colSpan={3}>Total</th>
          </tr>
          <tr>
            <th rowSpan={2}>Year</th>
            <th rowSpan={2}>Age</th>
            <th rowSpan={2}>Tenure</th>
            <th rowSpan={2}>Raise</th>
            <th rowSpan={2}>Salary</th>
            <th colSpan={4}>Contributions</th>
            <th colSpan={2}>YoY</th>
            <th rowSpan={2}>Balance</th>
            <th colSpan={2}>Allocation</th>
            <th colSpan={2}>YoY</th>
            <th rowSpan={2}>Balance</th>
            <th colSpan={2}>Vested</th>

            <th rowSpan={2}>Total Retirement</th>
            <th rowSpan={2}>Retirement Salary</th>
            {/* //<th>salary+retirement_increase</th> */}
          </tr>
          <tr className='smolrow'>
            <th>Personal</th>            
            <th>Employer</th>            
            <th colSpan={2}>Total</th>   
            <th>% (rand)</th>
            <th>$</th>
            <th>%</th>
            <th>$</th>
            <th>%</th>
            <th>$</th>
            <th>%</th>
            <th>$</th>            
          </tr>
        </thead>
        <tbody>
          {tableData.map((data, index) => (
            <tr key={index}>
              <td >{data.year}</td>
              <td >{data.age}</td>
              <td >{ index === 0 ? <input className="smallInput" type="number" value={this.state.currentTenure} onChange={this.handleTenureChange}/>: data.tenure}</td>
              <td >{ index === 0 ? '-' : percentFormat.format(data.annualRaise) }</td>
              <td className='thickBorder'>{ index === 0 ? <input className="largeInput" type="text" value={this.state.currentSalary} onChange={this.handleSalaryChange}/> : dollarFormat.format(data.salary)}</td>
              <td >{ index === 0 ? '-' : percentFormat.format(data.personal401KContribution)}</td>
              <td >{ index === 0 ? '-' : percentFormat.format(data.employerContributionPercent401k)}</td>
              <td >{ index === 0 ? '-' : percentFormat.format(data.totalContributionPercent401k)}</td>
              <td >{ index === 0 ? '-' : dollarFormat.format(data.contributionDollars401k)}</td>
              <td >{ index === 0 ? '-' : percentFormat.format(data.YoY401k)}</td>
              <td >{ index === 0 ? '-' : dollarFormat.format(data.appreciation401k)}</td>
              <td  className='thickBorder'>{ index === 0 ? <input className="largeInput" type="text" value={this.state.initialBalance401k} onChange={this.handle401KBalanceChange}/> : dollarFormat.format(data.balance401k)}</td>
              <td >{ index === 0 ? '-' : percentFormat.format(data.allocPercentESOP)}</td>
              <td >{ index === 0 ? '-' : dollarFormat.format(data.allocDollarsESOP)}</td>
              <td >{ index === 0 ? '-' : percentFormat.format(data.YoYESOP)}</td>
              <td >{ index === 0 ? '-' : dollarFormat.format(data.appreciationESOP)}</td>
              <td >{ index === 0 ? <input className="largeInput" type="text" value={this.state.initialBalanceESOP} onChange={this.handleESOPBalanceChange}/> : dollarFormat.format(data.balanceESOP)}</td>
              <td >{percentFormat.format(data.vestedPercentESOP)}</td>
              <td className='thickBorder'>{dollarFormat.format(data.vestedBalanceESOP)}</td>
              <td>{dollarFormat.format(data.totalRetirement)}</td>
              <td>{dollarFormat.format(data.retirementSalary)}</td>
              {/* <td>{data.salary_plus_retirement_increase}</td> */}
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
        <Line type="monotone" dataKey="balanceESOP" stroke="#8884d8" />
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
        <Line type="monotone" dataKey="appreciationESOP" stroke="#8884d8"/>
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
        <YAxis  type="number" domain={[0, balanceYearVestedESOP]} allowDataOverflow={true} stroke='#880000'/>
        <Tooltip />
        <Legend />
        <Line type="linear" dataKey="vestedBalanceESOP" stroke="#8884d8" strokeWidth={3} />
        <Line type="linear" dataKey="balanceESOP" stroke="#ff0000"  />
      </LineChart>
      </div>
      </form>
    </>);
  }
}

export default RetirementCalc;
