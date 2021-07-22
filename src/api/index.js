import axios from 'axios';

export const PAY_URL = "https://api.paystack.co/";
const token = process.env.REACT_APP_PAY_KEY;

const client = axios.create({
  baseURL: PAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function pay(email, amount){
    const body = {
        email, amount,
        reference: (new Date()).getTime(),
        currency: 'GHS',
        publicKey: process.env.REACT_APP_LIVE_PUBLIC_PAYSTACK_API_KEY,
    };

    try {
        return await client.post('transaction/initialize', body, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
    } catch (e) {
        return {response: e.response, message: e.message}
    }
}