import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import HomePage from './HomePage/HomePage';
import RetirementCalc from './RetirementCalculator/RetirementCalc';
import VacationPlanner from './VacationTimeTool/VacationPlanner';
import Footer from './Footer/Footer';
import TopBar from './TopBar/TopBar';
import BudgetPlanner from './BudgetPlanner/BudgetPlanner';
import NetWorthCalculator from './NetWorthCalculator/NetWorthCalculator';


function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/RetirementCalculator" element={<RetirementCalc />} />
            <Route path="/VacationPlanner" element={<VacationPlanner />} />
            <Route path="/BudgetPlanner" element={<BudgetPlanner />} />
            <Route path="/NetWorthCalculator" element={<NetWorthCalculator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
