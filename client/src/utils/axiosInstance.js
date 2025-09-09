import axios from 'axios';
import { BASE_URL } from './apiPath';


const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});


// No need for Authorization header, cookies will be sent automatically

//Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // avoid redirecting if already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            } else if (error.response.status === 500) {
                console.error('Server Error:', error.response.data?.message || 'Internal Server Error');
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;