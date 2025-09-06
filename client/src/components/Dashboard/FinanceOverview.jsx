import React from 'react'
import CustomPieChart from '../Charts/CustomPieChart'

const COLORS = ['#875CF5','#FA2C37','#FF6900']

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
  // Order matches COLORS: Balance (purple), Expense (red), Income (orange)
  const balanceData = [
    { name: 'Total Balance', amount: totalBalance },
    { name: 'Total Expense', amount: totalExpense },
    { name: 'Total Income', amount: totalIncome },
  ]

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-5'>
        <h5 className='text-lg font-semibold'>Financial Overview</h5>
      </div>
      <CustomPieChart
        data={balanceData}
        label='Total Balance'
        totalAmount={totalBalance}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  )
}

export default FinanceOverview
