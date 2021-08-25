import React, { useEffect, useState, Fragment, useRef } from 'react';
import { AiOutlineInfo } from '@meronex/icons/ai';
import { useAuth } from '../providers/authProvider';
import { useProducts } from '../providers/productProvider';
import { useWatchlist } from '../providers/watchlistProvider';
import '../css/watchlist.css';
import Loader from './simple_loader';
import { confirmOTP, pay } from '../api';

const regions = [
    "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"
];

export const CheckoutPage = ({onClose})=>{
    const [deliveryId, setDeliveryId] = useState(0);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const {fetchProductById} = useProducts();
    const {makePayment, verifyOTP, watchlist} = useWatchlist();
    const [deliveryFee, setDeliveryFee] = useState(0)
    const [totalPayment, setTotalPayment] = useState(0);
    const [providerId, setProviderId] = useState(0);
    const [status, setStatus] = useState(0);
    const {user} = useAuth();
    const [phone, setPhone] = useState(user.isAnonymous ? "" : user.phone);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState(user.isAnonymous ? "" : user.username);
    const [otp, setOtp] = useState("");
    const viewRef = useRef();
    
    const deliveryTypes = [ "pick up", "door step", "discounted shipping" ]

    const providers = [
        {code: "mtn", name: 'MTN'}, 
        {code: "voda", name: "Vodafone"}, 
        {code: "tgo", name: "Airtel/Tigo"}
    ];

    useEffect(() => {
        viewRef.current.scrollIntoView();
    }, [status]);

    useEffect(() => {
        watchlist.forEach(async ({productId})=>{
            const product = await fetchProductById(productId);
            setTotalPayment(old=> (old + parseFloat(product.price)));
        });
    }, [watchlist]);

    useEffect(() => {
        setTotalPayment(old=> (old + deliveryFee));
    }, [deliveryFee]);

    function getProductsForCheckout(){
        let output = [];

        watchlist.forEach(async ({productId})=>{
            const product = await fetchProductById(productId);
            output.push({
                id: product.id, 
                size: product.size ,
                price: product.price, 
                imageUrl: product.imageUrl, 
            });
        })

        return output;
    }

    const handleCheckout = async (e)=>{
        e.preventDefault();
        setLoading(true);
        // initialize paystack for payment
        let stat;
        
        switch (status) {
            case 1:
                stat = await verifyOTP({otp, userId: user.uid});
                break;               
        
            default:
                stat = await makePayment(
                    {
                        provider: providers[providerId].code,
                        phone, 
                        amount: totalPayment * 100,
                        username,
                        delivery: {
                            type: deliveryTypes[deliveryId], 
                            address: deliveryAddress
                        },
                    }, 
                    user.uid, 
                    getProductsForCheckout()
                );
                break;
        }

        if(stat){
            setLoading(false);
            switch(stat){
                case "send_otp":
                    setStatus(1);
                    break;

                case "pay_offline":
                    setStatus(2)
                    break;

                default:
                    setStatus(0)
                    break;
            }
        }
    }

    return <form style={{overflow: status ? "hidden" : "auto"}} onSubmit={handleCheckout} className="checkout-page">
        {status === 1 && <div className="overlay">
            <h3 style={{marginBottom: 30}}>Enter the OTP code sent to your device.</h3>
            <input required value={otp} onChange={({target: {value}})=> setOtp(value)} type="text" />
            <div className="buttons">
                <button>{loading ? <Fragment>Please wait <Loader /></Fragment> : "Submit OTP"}</button>
            </div>
        </div>}
        {status === 2 && <div className="overlay">
            <h4 style={{marginBottom: 20}}>Finalize payment on your device by entering your PIN.</h4>
            <Loader />
        </div>}
        {/* {data.paid ? <div style={{background: "#fff"}} className="overlay">
            <MdcCheckCircle size={40} color="green" />
            <h4>Payment Successful</h4>
        </div> : <Fragment />} */}
        <div className="view" ref={viewRef}></div>
        <div className="body">
            <ProductsViewForCheckout checkoutProducts={getProductsForCheckout()} />
            <div className="delivery-address">
                <div className='label'>
                    Delivery Setup
                </div>
                <div className="choose-delivery">
                    <div className={`${deliveryId === 0 ? 'selected' : ''}`} onClick={()=>{ setDeliveryId(0); setDeliveryFee(0)}}>Pick up</div>
                    <div className={`${deliveryId === 1 ? 'selected' : ''}`} onClick={()=>{ setDeliveryId(1); setDeliveryFee(0)}}>Parcel Office</div>
                    <div className={`${deliveryId === 3 ? 'selected' : ''}`} onClick={()=> setDeliveryId(3)}><pre>Discounted shipping</pre></div>
                </div>
                {deliveryId === 1 ? 
                <div className="address-form">
                    <div className="warning">
                        <AiOutlineInfo size={20} color="orangered" />
                        <span style={{marginLeft: 10}}>By using this delivery option, you agree to pick your order at our designated partner's parcel office in your region.</span>
                    </div>
                    <select name="area-range" onChange={({target})=> {setDeliveryFee(target.value === "" ? 0 : parseFloat(target.value));}} id="area-range">
                        <option value="">Select your region</option>
                        <option value="10.00">Kumasi - 10.00</option>
                        <option value="50.00">Cape Coast - 50.00</option>
                        <option value="30.00">Accra - 30.00</option>
                        <option value="70.00">Tema - 70.00</option>
                    </select>
                </div> : <Fragment></Fragment>}
                {deliveryId === 2 ? 
                <div className="address-form">
                    <select name="area-range" onChange={({target})=> {setDeliveryFee(target.value === "" ? 0 : parseFloat(target.value));}} id="area-range">
                        <option value="">Select your region</option>
                        <option value="10.00">Kumasi - 10.00</option>
                        <option value="50.00">Cape Coast - 50.00</option>
                        <option value="30.00">Accra - 30.00</option>
                        <option value="70.00">Tema - 70.00</option>
                    </select>
                    <textarea value={deliveryAddress} onChange={(input)=> setDeliveryAddress(input.value)} placeholder="Enter delivery address"></textarea>
                </div> : <Fragment></Fragment>}
                {deliveryId === 3 ? 
                <div className="address-form">
                    <div className="warning">
                        <AiOutlineInfo size={20} color="orangered" />
                        <span style={{marginLeft: 10}}>Note: Discounted shipping is our cheapest shipping option to help you save on your order. This can take anywhere from 7-14 days to be delivered to our designated parcel office in your region.</span>
                    </div>
                    <select name="area-range" onChange={({target})=> {setDeliveryFee(target.value === "" ? 0 : parseFloat(target.value));}} id="area-range">
                        <option value="">Select your region</option>
                        {regions.map((region, key)=> <option key={key} value="5.00">{region}</option>)}
                    </select>
                </div> : <Fragment></Fragment>}
            </div>
            <div className="delivery-address">
                <div className='label'>
                    Select Network Provider
                </div>
                <div className="choose-delivery">
                    {providers.map((provider, id)=> 
                    <div key={id} className={`${providerId === id ? 'selected' : ''}`} onClick={()=>{setProviderId(id)}}>
                        {provider.name}
                    </div>)}
                </div>
            </div>

            <div className="email-setup">
                <div className='label'>
                    Name For Delivery
                </div>
                {<div className="email-input">
                    <input autoFocus required value={username} name="username" type="text" placeholder="Choose name for delivery" onChange={({target: {value}})=> setUsername(value)} />
                </div>}
            </div> 

            <div className="email-setup">
                <div className='label'>
                    Phone Number
                </div>
                {<div className="email-input">
                    <input autoFocus required value={phone} name="phone" type="text" placeholder="Enter your phone number" onChange={({target: {value}})=> setPhone(value)} />
                </div>}
            </div> 
            
            <div className="amount-payable">
                <div className='label'>
                    Amount Payable
                </div>
                <div className="payable-details">
                    <div className="payable">
                        <b>Delivery Fee</b>
                        <span><small>GHC</small><big>{deliveryFee.toFixed(2)}</big></span>
                    </div>
                    <div className="payable">
                        <b>Product(s) Price</b>
                        <span><small>GHC</small><big>{(totalPayment - deliveryFee).toFixed(2)}</big></span>
                    </div>
                    <div className="payable">
                        <b>Total Amount</b>
                        <span><small>GHC</small><big>{totalPayment.toFixed(2)}</big></span>
                    </div>
                </div>
            </div>
        </div>
        <div className="footer">
            <button type="submit" className="submit-btn" style={{marginRight: 0}}>
                {loading ? <Fragment>Please wait <Loader /></Fragment> : "Accept Checkout"}
            </button>
        </div>
    </form>
}

const ProductsViewForCheckout = ({checkoutProducts})=>{
    const [hide, setHide] = useState(false);
    
    return <div className="products-view">
        <div onClick={()=> setHide(!hide)} className="toggler">{hide ? 'See Products' : 'Hide Products'}</div>
        <div className={`items-container ${hide ? "hidden" : ''}`}>
            {checkoutProducts.map((item, key)=> <div key={key} className='item'>
                <img src={item.imageUrl} width={50} height={50} style={{objectFit: "cover"}} alt={item.name} />
                <div className="info">
                    <p><b>{item.name}</b></p>
                    <p style={{color: "#777"}}>{item.size} Size</p>
                </div>
                <span className="price"><small>GHC</small>{parseFloat(item.price).toFixed(2)}</span>
            </div>)}
        </div>
    </div>
}