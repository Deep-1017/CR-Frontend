import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const getProductById = async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createOrder = async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export default api;
