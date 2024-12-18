import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

// Images for the icons
import { GrMoney } from "react-icons/gr";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { TbPigMoney, TbMoneybag } from "react-icons/tb";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaPlaneDeparture, FaUmbrellaBeach  } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";

function HomePage() {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

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

      {/* <p>Select a tool to get started:</p> */}

      <div className="icon-container">
  {/* Budget Calculator */}
  <div className="icon-card" onClick={() => handleCardClick('/BudgetCalculator')}>
    <GiPayMoney className="icon" size={100} />
    <div className="icon-text">Budget Calculator</div>
    <div className="icon-description">Track your expenses and income to plan your budget effectively.</div>
  </div>

  {/* Retirement Calculator */}
  <Link to="/RetirementCalculator" className="icon-card">
    <BsGraphUpArrow  className="icon" size={100} />
    <div className="icon-text">Retirement Calculator</div>
    <div className="icon-description">Comprehensive calculations for retirement planning.</div>
  </Link>

  {/* Net Worth Calculator */}
  <div className="icon-card" onClick={() => handleCardClick('/NetWorthCalculator')}>
    <TbMoneybag className="icon" size={100} />
    <div className="icon-text">Net Worth Calculator</div>
    <div className="icon-description">Calculate your net worth by subtracting liabilities from assets.</div>
  </div>

  {/* Savings Calculator */}
  <div className="icon-card" onClick={() => handleCardClick('/SavingsCalculator')}>
    <TbPigMoney className="icon" size={100} />
    <div className="icon-text">Savings Calculator</div>
    <div className="icon-description">Estimate how much to save to reach your financial goals.</div>
  </div>

  {/* Time Off Planner */}
  <Link to="/VacationPlanner" className="icon-card">
    <FaUmbrellaBeach  className="icon" size={100} />
    <div className="icon-text">Time Off Planner</div>
    <div className="icon-description">Calculate how much to save each month to reach your goal.</div>
  </Link>
</div>
    </div>
  );
}

export default HomePage;
