import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

// Images for the icons
import { GrMoney } from "react-icons/gr";
import { GiPayMoney, GiReceiveMoney, GiCutDiamond, GiFamilyHouse   } from "react-icons/gi";
import { TbPigMoney, TbMoneybag } from "react-icons/tb";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaPlaneDeparture, FaUmbrellaBeach  } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";

function HomePage() {

  return (
    <div className="home-container">
      <div className="home-logo">
        <div className="logo-box"/>
        <div className="logo-box"/>
        <div className="logo-box"/>
        <div className="logo-box"/>
      </div>
      <div className="home-title">
        <div className="diamond"></div>
        WEALTH<span className="stud">STUD</span>.IO
        <div className="diamond"></div>
      </div>
      <div className="home-subtitle">FINANCIAL WELLNESS TOOLS</div>

      <p className='prompt'>Select a tool to get started:</p>

      <div className="icon-container">  
  {/* Budget Planner */}
  <Link to="/BudgetPlanner" className="icon-card">
    <GiPayMoney className="icon" size={60} />
    <div className="icon-text">Budget<br/>Planner</div>
    <div className="icon-description">Track your expenses and income to plan your budget effectively.</div>
  </Link>
  <div className="icon-divider"></div>

  {/* Retirement Calculator */}
  <Link to="/RetirementCalculator" className="icon-card">
    <BsGraphUpArrow  className="icon" size={60} />
    <div className="icon-text">Retirement<br/>Planner</div>
    <div className="icon-description">Comprehensive calculations for retirement planning.</div>
  </Link>
  <div className="icon-divider"></div>

  {/* Net Worth Calculator */}
  <Link to="/NetWorthCalculator" className="icon-card">
    <GiCutDiamond className="icon" size={60} />
    <div className="icon-text">Net Worth<br/>Calculator</div>
    <div className="icon-description">Calculate your net worth by subtracting liabilities from assets.</div>
  </Link>
  <div className="icon-divider"></div>

  {/* Savings Calculator */}
  <Link to="/SavingPlanner" className="icon-card">
    <TbPigMoney className="icon" size={60} />
    <div className="icon-text">Saving<br/>Planner</div>
    <div className="icon-description">Estimate how much to save to reach your financial goals.</div>
  </Link>
    <div className="icon-divider"></div>
  {/* Time Off Planner */}
  <Link to="/VacationPlanner" className="icon-card">
    <FaUmbrellaBeach  className="icon" size={60} />
    <div className="icon-text">Time Off<br/>Planner</div>
    <div className="icon-description">Calculate how much to save each month to reach your goal.</div>
  </Link>
  <div className="icon-divider"></div>

    {/* Mortgage Calculator */}
    <Link to="/MortgageTool" className="icon-card">
    <GiFamilyHouse   className="icon" size={60} />
    <div className="icon-text">Mortgage<br/>Tool</div>
    <div className="icon-description">Calculate detailed info about a potential mortgage.</div>
  </Link>
</div>
    </div>
  );
}

export default HomePage;
