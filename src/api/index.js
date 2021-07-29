import axios from 'axios';

export const BASE_URL = process.env.NODE_ENV === "production" ? 
'https://foine-backend.herokuapp.com/api' : 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function pay(body){
    try {
        const {data} = await client.post('/transactions/charge', JSON.stringify({
            ...body, 
            email: "myfoine@gmail.com", 
        }));
        return data;
    } catch (e) {
        return {response: e.response, message: e.message}
    }
}

export async function confirmOTP(otp, reference){
    try {
        const {data} = await client.post('/transactions/verify-otp', JSON.stringify({otp, reference}));
        return data;
    } catch (e) {
        return {response: e.response, message: e.message}
    }
}