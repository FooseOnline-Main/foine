import React, { useEffect, useState, Fragment } from 'react';
import { Link, Route, useHistory } from 'react-router-dom';
import { AiOutlineEye, AiOutlineInfo } from '@meronex/icons/ai';
import EmptyView from './empty_view';
import { FaEyeSlash } from '@meronex/icons/fa';
import { useAuth } from '../providers/authProvider';
import { useProducts } from '../providers/productProvider';
import { useWatchlist } from '../providers/watchlistProvider';
import {confirmOTP, pay} from '../api/';
import '../css/watchlist.css';
import Loader from './simple_loader';
import PromptPopup from './prompt_popup';
import Popup from './popup';

const regions = [
    "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"
];

const CheckoutPopup = () => {
    const history = useHistory();

    const handleClose = ()=>{
        document.body.style.overflow = "auto";
        history.replace('/');
    }

    const handleGoBack = ()=>{
        document.body.style.overflow = "auto";
        history.goBack();
    }

    return (
        <div className="watchlist-popup">
            <div className="overlay" onClick={handleClose}></div>
            <div className="inner">
                <Route path="/watchlist/checkout">
                    <CheckoutPage onClose={handleGoBack} />
                </Route>
                <Route exact path="/watchlist">
                    <WatchlistPage onClose={handleGoBack} />
                </Route>
            </div>
        </div>
    );
}

const WatchlistPage = ({onClose})=>{
     useEffect(() => {
        document.body.style.overflow = "hidden";
    }, []);

    const {watchlist, checkOut} = useWatchlist();
    const {getProductById} = useProducts();

    function getCheckoutTally(){
        let output = 0;
        checkOut.forEach(itemId=>{
            const productPrice = parseFloat(getProductById(itemId).price);
            output += productPrice;
        });
        return output;
    }

    return <div className="watchlist-page">
        <div className="header">
            <h3>My WatchList</h3>
            <div onClick={onClose} className="close-btn">{'x'}</div>
        </div>
        <div className="body">
            {watchlist.length < 1 ? 
            <EmptyView message="Your watchlist is Empty" icon={<FaEyeSlash size={80} color="#eee" />}/> : 
            watchlist.map(({productId}, id) => <WatchlistItem key={id} item={getProductById(productId)} />
            )}
        </div>
        {watchlist.length > 0 && checkOut.length > 0 ? <div className="footer">
            <Link to="/watchlist/checkout" className="submit-btn">Proceed to checkout</Link>
            <p className="price-tally"><b>GHC</b><h3>{getCheckoutTally().toFixed(2)}</h3></p>
        </div> : <Fragment></Fragment>}
    </div>
}

const WatchlistItem = ({item})=>{
    const {removeFromCheckout, addToCheckout, removeFromWatchlist, checkOut} = useWatchlist();
    const {products} = useProducts();
    const {user} = useAuth();
    const [fade, setFade] = useState(false);

    useEffect(() => {
        if(item.status === 1 && (item.heldBy !== (user.uid))){
            removeFromCheckout(item.id);
            setFade(true);
        }else{
            setFade(false);
        }
    }, [checkOut, products, removeFromCheckout, user, item]);

    return (
        <div className={`item ${fade ? 'fade' : ''}`}>
            <div className="check">
                <div onClick={()=> checkOut.includes(item.id) ? removeFromCheckout(item.id) : addToCheckout(item.id)} className={`checker ${checkOut.includes(item.id) ? 'on' : ''}`}></div>
            </div>
            <div className="details">
                <div className="img" style={{backgroundImage: `url(${item.imageUrl})`}}></div>
                <Link to={`/preview-product/${item.id}`} className="info">
                    <h3>{item.name}</h3>
                    <p className="size">{item.size}</p>
                    {item.watchCount  ? <p style={{fontSize: 11, display: "flex", alignItems: "center"}}>
                        <AiOutlineEye size={16} color="red" style={{marginRight: 5}} /> {item.watchCount} other(s) watching</p> : 
                        <p className="size">{item.category}</p>}
                    
                </Link >
                <div className="price">
                    <p><small>GHC</small><span>{parseFloat(item.price).toFixed(2)}</span></p>
                    <span onClick={()=>removeFromWatchlist(item.id)} style={{color: "#ccc", fontSize: 12}}>- Remove -</span>
                </div>
            </div>
        </div>
    )
}

const CheckoutPage = ({onClose})=>{
    const [deliveryId, setDeliveryId] = useState(0);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const {markProductsAsSold, getProductById} = useProducts();
    const {clearCheckedOut, checkOut} = useWatchlist();
    const [deliveryFee, setDeliveryFee] = useState(0)
    const [totalPayment, setTotalPayment] = useState(getCheckoutTally() + deliveryFee);
    const [providerId, setProviderId] = useState(0);
    const [phone, setPhone] = useState("");
    const {user} = useAuth();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [message, setMessage] = useState({error: "", success: ""});
    const [OTPData, setOTPData] = useState();
    const [OTPResponse, setOTPResponse] = useState();
    const providers = [
        {code: "mtn", name: 'MTN'}, 
        {code: "voda", name: "Vodafone"}, 
        {code: "tgo", name: "Airtel/Tigo"}
    ];

    useEffect(() => {
        setTotalPayment(getCheckoutTally() + deliveryFee);
    }, [deliveryFee]);

    useEffect(() => {
        if(checkOut.length < 1){
            history.replace('/watchlist');
        }
        document.body.style.overflow = "hidden";
    }, []);

    function getCheckoutTally(){
        let output = 0;
        checkOut.forEach(itemId=>{
            output += parseFloat(getProductById(itemId).price);
        });
        return output;
    }

    function getProductsForCheckout(){
        let output = [];

        checkOut.forEach(itemId=>{
            output.push(getProductById(itemId));
        })

        return output;
    }

    const handleCheckout = async (e)=>{
        e.preventDefault();
        setLoading(true);
        // initialize paystack for payment
        
        const {status, data, error} = await pay({
            provider: providers[providerId].code,
            phone, 
            amount: totalPayment * 100, 
            paymentMethod: "mobile_money"
        });
        console.log(data, error);
        
        if(status){
            setSuccess(true);
            setLoading(false);
            setOTPData(data);
            history.push('/watchlist/checkout/verify-otp');
            // const checkoutProducts = getProductsForCheckout();
            // markProductsAsSold(checkoutProducts)
            // clearCheckedOut();
        }else{
            setLoading(false);
            setSuccess(false);
            // error.message
            setMessage({success: "", error: "Sorry, something went wrong. Please try again."});
        }
    }

    const handleOTPComplete = (data)=>{
        setOTPData(null);
        setOTPResponse(data);
        history.goBack();
        history.push('/watchlist/checkout/confirm-offline');
    }

    return <form onSubmit={handleCheckout} className="checkout-page">
        {loading && <Loader expand={true} />}
        <Route exact path="/watchlist/checkout/verify-otp">
            <Popup onClose={()=>history.replace('/watchlist')} child={<OTPVerification data={OTPData} onSuccess={handleOTPComplete} />} />
        </Route>
        <Route exact path="/watchlist/checkout/confirm-offline">
            <Popup onClose={()=>history.replace('/watchlist')} child={<CompletePayment data={OTPResponse} />} />
        </Route>
        {message.error && <PromptPopup onClose={()=> setMessage({...message, error: ""})} type="failure" message={message.error} />}
        {message.success && <PromptPopup onClose={()=> setMessage({...message, success: ""})} type="success" message={message.success} />}
        
        <div className="header">
            <h3>Checkout</h3>
            <div onClick={onClose} className="close-btn">{'<'}</div>
        </div>
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
                        {regions.map(region=> <option value="5.00">{region}</option>)}
                    </select>
                </div> : <Fragment></Fragment>}
            </div>
            <div className="delivery-address">
                <div className='label'>
                    Select Network Provider
                </div>
                <div className="choose-delivery">
                    {providers.map((provider, id)=> 
                    <div className={`${providerId === id ? 'selected' : ''}`} onClick={()=>{setProviderId(id)}}>
                        {provider.name}
                    </div>)}
                </div>
            </div>
            <div className="email-setup">
                <div className='label'>
                    Phone Number
                </div>
                <div className="email-input">
                    <input autoFocus required value={phone} name="phone" type="text" placeholder="Enter your phone number" onChange={({target: {value}})=> setPhone(value)} />
                </div>
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
                        <span><small>GHC</small><big>{getCheckoutTally().toFixed(2)}</big></span>
                    </div>
                    <div className="payable">
                        <b>Total Amount</b>
                        <span><small>GHC</small><big>{totalPayment.toFixed(2)}</big></span>
                    </div>
                </div>
            </div>
        </div>
        <div className="footer">
            <button type="submit" className="submit-btn" style={{marginRight: 0}}>Accept Checkout</button>
        </div>
    </form>
}

const CompletePayment = ({data})=>{;
    return <div className="verify-otp">
        <h2>Complete Payment</h2>
        <p>{data.display_text}</p>
        <div className="input-area"><Loader /></div>
        <style jsx>{`
            h2{ margin-bottom: 10px}
            p{
                margin-bottom: 20px;
                font-size: 14px;
            }    
            .input-area{
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `}</style>
    </div>
}

const OTPVerification = ({data, onSuccess})=>{
    const {display_text, reference} = data;
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async ()=>{
        if(value){
            setLoading(true);
            const {status, data, error} = await confirmOTP(value, reference);
            console.log(error, data);
            
            if(status){
                setLoading(false);
                setError( "")
                onSuccess(data);
            }else{
                setLoading(false);
                // error.data.message
                setError("Wrong pin. Make sure you enter the right pin.");
            }
        }
    }

    return <div className="verify-otp">
        <h2>OTP Verification</h2>
        <p>{display_text}</p>
        <div className={`err-box ${error ? 'show' : ""}`}>{error}</div>
        <div className="input-area">
            <input type="text" className={error ? "err" : ""} autoFocus placeholder="Enter OTP code" value={value} onChange={({target: {value}})=> {setValue(value); error && setError("")}} />
            <span className="button" onClick={!loading ? handleSubmit : ()=>{}} type="submit">{loading ? <Loader /> : 'Submit'}</span>
        </div>
        <style jsx>{`
            h2{ margin-bottom: 10px}
            p{
                margin-bottom: 20px;
                font-size: 14px;
            }    
            .input-area{
                display: flex;
                align-items: center;
            }
            input{
                padding: 10px;
                margin-right: 10px;
                outline: none;
                border: none;
                background: #eaeaea;
                border-radius: 10px;
                font-size: 12px;
                flex: 1;
            }
            .err-box{
                min-height: 30px;
            }
            .err-box.show{
                padding: 10px 10px;
                font-size: 12px;
                color: #D80707;
                background: #FF000021;
                border-radius: 10px;
                margin: 10px 0;
                display: flex;
                align-items: center;
            }
            span.button{
                padding: 10px 20px;
                color: #fff;
                background: var(--dark-color);
                border: none;
                border-radius: 10px;
                font-size: 13px;
            }
        `}</style>
    </div>
}

const ProductsViewForCheckout = ({checkoutProducts})=>{
    const [hide, setHide] = useState(false);
    
    return <div className="products-view">
        <div onClick={()=> setHide(!hide)} className="toggler">{hide ? 'See Products' : 'Hide Products'}</div>
        <div className={`items-container ${hide ? "hidden" : ''}`}>
            {checkoutProducts.map(item=> <div className='item'>
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



export default CheckoutPopup;
