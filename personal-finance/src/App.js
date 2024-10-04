import React from 'react';
import './App.css';
import RetirementCalc from './RetirementCalc';
import VacationPlanner from './VacationPlanner';
import Footer from './Footer';
import TopBar from './TopBar';


function App() {
  return (
    <div className="App">
      <TopBar />
      {/* <RetirementCalc /> */}
      <VacationPlanner/>
      <Footer />
    </div>
  );
}

export default App;
