import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import HomePage from './HomePage';
import RetirementCalc from './RetirementCalc';
import VacationPlanner from './VacationPlanner';
import Footer from './Footer';
import TopBar from './TopBar';
import BudgetCreator from './BudgetCreator';
import NetWorthCalculator from './NetWorthCalculator';


function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/RetirementCalculator" element={<RetirementCalc />} />
            <Route path="/VacationPlanner" element={<VacationPlanner />} />
            <Route path="/BudgetCreator" element={<BudgetCreator />} />
            <Route path="/NetWorthCalculator" element={<NetWorthCalculator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
