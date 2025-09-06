// Ensure this matches your server port (default server is 5000)
export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
    LOGIN: "/api/v1/auth/login",
    SIGNUP: "/api/v1/auth/register",
    GE_USER_INFO: "/api/v1/auth/getUser",
    },
    DASHBOARD: {
    GET_DATA: '/api/v1/dashboard'
    },
    INCOME: {
    ADD_INCOME: '/api/v1/income/add',
    GET_ALL_INCOME: '/api/v1/income/get',
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DOWNLOAD_INCOME: '/api/v1/income/downloadpdf',
    },
    EXPENSE: {
    ADD_EXPENSE: '/api/v1/expense/add',
    GET_ALL_EXPENSE: '/api/v1/expense/get',
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DOWNLOAD_EXPENSE: '/api/v1/expense/downloadpdf',
    },
    IMAGE: {
    UPLOAD_IMAGE: '/api/v1/auth/upload-image',
    }
}