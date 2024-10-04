export function validateForm(state) {
    const { birthDate, currentTenure, currentSalary, yearlyRaise,
      initialBalance401k, personal401KContribution, employer401KMatch, expected401kYoY, variance401kYoY,
      initialBalanceStock, allocationStock, allocationStockVariance, expectedStockYoY, varianceStockYoY, vestingPeriod
    } = state;
  
    const birthDateObj = new Date(birthDate);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDateObj.getFullYear();
    const tenure = parseInt(currentTenure, 10);
    const raise = parseFloat(yearlyRaise);
    const salary = parseFloat(currentSalary);
    const balance401k = parseFloat(initialBalance401k);
    const personalContribution = parseFloat(personal401KContribution);
    const employerMatch = parseFloat(employer401KMatch);
    const expected401k = parseFloat(expected401kYoY);
    const variance401k = parseFloat(variance401kYoY);
    const balanceStock = parseFloat(initialBalanceStock);
    const stockAllocation = parseFloat(allocationStock);
    const allocationVariance = parseFloat(allocationStockVariance);
    const expectedStock = parseFloat(expectedStockYoY);
    const varianceStock = parseFloat(varianceStockYoY);
    const vesting = parseFloat(vestingPeriod);
  
    if (isNaN(age) || age < 10 || age > 100) {
      console.error("Invalid birth date");
      return false;
    }
  
    if (isNaN(tenure) || tenure < 0 || tenure > 50) {
      console.error("Invalid tenure value");
      return false;
    }
  
    if (isNaN(raise) || raise < 0 || raise > 50) {
      console.error("Invalid raise value");
      return false;
    }
  
    if (isNaN(salary) || salary < 1000 || salary > 1000000) {
      console.error("Invalid salary value");
      return false;
    }
  
    if (isNaN(balance401k) || balance401k < 0 || balance401k > 10000000) {
      console.error("Invalid 401k balance value");
      return false;
    }
  
    if (isNaN(personalContribution) || personalContribution < 0 || personalContribution > 100) {
      console.error("Invalid personal contribution value");
      return false;
    }
  
    if (isNaN(employerMatch) || employerMatch < 0 || employerMatch > 100) {
      console.error("Invalid employer match value");
      return false;
    }
  
    if (isNaN(expected401k) || expected401k < -10 || expected401k > 50) {
      console.error("Invalid expected 401k YoY value");
      return false;
    }
  
    if (isNaN(variance401k) || variance401k < 0 || variance401k > 50) {
      console.error("Invalid 401k YoY variance value");
      return false;
    }
  
    if (isNaN(balanceStock) || balanceStock < 0 || balanceStock > 100000000) {
      console.error("Invalid stock balance value");
      return false;
    }
  
    if (isNaN(stockAllocation) || stockAllocation < 0 || stockAllocation > 100) {
      console.error("Invalid stock allocation value");
      return false;
    }
  
    if (isNaN(allocationVariance) || allocationVariance < 0 || allocationVariance > 50) {
      console.error("Invalid stock allocation variance value");
      return false;
    }
  
    if (isNaN(expectedStock) || expectedStock < -10 || expectedStock > 100) {
      console.error("Invalid expected stock YoY value");
      return false;
    }
  
    if (isNaN(varianceStock) || varianceStock < 0 || varianceStock > 50) {
      console.error("Invalid stock YoY variance value");
      return false;
    }
  
    if (isNaN(vesting) || vesting < 0 || vesting > 50) {
      console.error("Invalid vesting period value");
      return false;
    }
  
    return true; // all fields are valid
  }