import moment from "moment";
import { FaWordpressSimple } from "react-icons/fa6";

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const getInititals = (name) => {
    if (!name) return "";

    const words = name.trim().split(" "); // <-- define words properly
    let initials = "";

    for (let i = 0; i < Math.min(words.length, 2); i++) {
        initials += words[i][0];
    }

    return initials.toUpperCase();
};

export const addThousandSeparator = (num) => {
  if (num == null || isNaN(num)) return "";

  const [integerPart, decimalPart] = num.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

export const prepareExpenseChartData = (data = []) => {
    const chartData = data.map(item => ({
        category: item?.category,
        amount: item?.amount,
    }));

    return chartData;
}

export const prepareIncomeChartDetails = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const chartData = sortedData.map(item => ({
    // Show day + short month, e.g., "5 Sep"
    month: moment(item.date).format("Do MMM"),
        amount: item?.amount,
        source: item?.source,
    }));

    return chartData;
};

export const prepareExpenseChartDetails = (data = []) => {
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const chartData = sortedData.map(item => ({
    // Show day + short month, e.g., "5 Sep"
    month: moment(item.date).format("Do MMM"),
        amount: item?.amount,
        category: item?.category,
    }));

    return chartData;
}