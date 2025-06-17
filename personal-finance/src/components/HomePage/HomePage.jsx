import { Link } from 'react-router-dom';
import './HomePage.css';

// Import your existing icons
import { GiPayMoney, GiCutDiamond, GiFamilyHouse } from "react-icons/gi";
import { TbPigMoney } from "react-icons/tb";
import { FaUmbrellaBeach, FaAngleDoubleDown  } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";

function HomePage() {
  const tools = [
    {
      path: "/BudgetPlanner",
      icon: GiPayMoney,
      name: "Budget",
      subtitle: "Manager",
      description: "Track expenses and income to create a balanced budget",
      colorClass: "red"
    },
    {
      path: "/RetirementCalculator", 
      icon: BsGraphUpArrow,
      name: "Retirement",
      subtitle: "Calculator",
      description: "Plan your retirement with comprehensive projections",
      colorClass: "blue"
    },
    {
      path: "/NetWorthCalculator",
      icon: GiCutDiamond,
      name: "Net Worth",
      subtitle: "Tracker", 
      description: "Monitor your total assets minus liabilities",
      colorClass: "purple"
    },
    {
      path: "/SavingPlanner",
      icon: TbPigMoney,
      name: "Savings",
      subtitle: "Calculator",
      description: "Calculate how much to save for your financial goals",
      colorClass: "green"
    },
    {
      path: "/VacationPlanner",
      icon: FaUmbrellaBeach,
      name: "PTO",
      subtitle: "Tracker",
      description: "Plan and track your paid time off balance",
      colorClass: "orange"
    },
    {
      path: "/MortgageTool",
      icon: GiFamilyHouse,
      name: "Mortgage",
      subtitle: "Calculator", 
      description: "Analyze mortgage payments and amortization schedules",
      colorClass: "cyan"
    },
    {
      path: "/InsuranceAnalyzer",
      icon: FaUmbrellaBeach,
      name: "Insurance",
      subtitle: "Analyzer",
      description: "Estimate insurance needs for life, health, and property",
      colorClass: "teal"
    }
  ];

  return (
    <div className="home-container">
      <div className="bg-filter"/>

      {/* Hero Section */}
      <div className="hero-section">
       


        {/* Title */}
        <div className="home-title">
          <h1 className="main-title">
            <span className="wealthstud-text">WEALTHSTUD</span>
            <span className="io-text">.IO</span>
          </h1>
          <p className="home-subtitle">FINANCIAL WELLNESS TOOLS</p>
        </div>
        {/* Loader Animation */}
        <div class="loader">
          <div class="loader-square"></div>
          <div class="loader-square"></div>
          <div class="loader-square"></div>
          <div class="loader-square"></div>
          <div class="loader-square"></div>
          <div class="loader-square"></div>
          <div class="loader-square"></div>
        </div>
        {/* Call to action */}
        <p className="hero-description">
          Take control of your financial future with our comprehensive suite of calculators and planning tools
        </p>
        <FaAngleDoubleDown size={32}/>

      </div>
      
      {/* Tools Grid */}
      <div className="tools-section">
        <div className="tools-grid">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className={`tool-card ${tool.colorClass}`}
              >
                {/* Content */}
                <div className="tool-content">
                  {/* Icon */}
                  <div className="tool-icon-container">
                    <div className={`tool-icon ${tool.colorClass}`}>
                      <IconComponent size={32} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="tool-title">
                    <span className="tool-name">{tool.name}</span>
                    <span className="tool-subtitle">{tool.subtitle}</span>
                  </h3>

                  {/* Description */}
                  <p className="tool-description">
                    {tool.description}
                  </p>

                  {/* Action indicator */}
                  <div className="tool-action">
                    <span className="tool-action-text">Get Started</span>
                    <svg className="tool-action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="footer-cta">
        <div className="footer-content">
          <h2 className="footer-title">
            Ready to transform your financial future?
          </h2>
          <p className="footer-description">
            Choose any tool above to start planning, tracking, and optimizing your finances today.
          </p>
          <div className="footer-features">
            <span className="feature-item">
              <svg className="feature-icon green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free to use
            </span>
            <span className="feature-item">
              <svg className="feature-icon blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Private & secure
            </span>
            <span className="feature-item">
              <svg className="feature-icon purple" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              No data stored
            </span>
          </div>
        </div>
      </div>
      <SuggestionBox />
      
    </div>

  );
}

export default HomePage;