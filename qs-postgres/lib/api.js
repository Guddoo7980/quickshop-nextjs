import axios from 'axios';
const api = axios.create({baseURL:'/api',timeout:12000});
api.interceptors.request.use(config => {if(typeof window !== 'undefined'){const token=localStorage.getItem('quickshop_token');if(token)config.headers.Authorization=`Bearer ${token}`;}return config});
export function errorMessage(error){return error.response?.data?.message || (error.code==='ECONNABORTED' ? 'Request timed out. Please try again.' : 'Unable to connect. Please try again.');}
export default api;
