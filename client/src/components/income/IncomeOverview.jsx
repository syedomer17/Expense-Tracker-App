import React, { useEffect, useState } from 'react'
import {LuPlus} from "react-icons/lu"
import CustomBarChart from '../Charts/CustomBarChart'
import { prepareIncomeChartDetails } from '../../utils/helper';


const IncomeOverview = ({ transactions, onAddIncome }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const result = prepareIncomeChartDetails(transactions);
        setChartData(result);

        return () => {}
    }, [transactions])
  return (
    <div className='card '>
      <div className='flex items-center justify-between mb-6'>
        <div className=''>
            <h1 className='text-lg'>Income Overview</h1>
            <p className='text-sm text-gray-400 mt-0.5'>Track your earnings over time and analyze your income.</p>
        </div>
        <button onClick={onAddIncome} className='add-btn'>
            <LuPlus className='text-lg' />
            Add Income
        </button>
      </div>
      <div className='mt-10'>
  <CustomBarChart data={chartData} barName="Income" />
      </div>
    </div>
  )
}

export default IncomeOverview
