import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../providers/authProvider';
import { useProducts } from '../providers/productProvider';
import { useWatchlist } from '../providers/watchlistProvider';
import { MdcCheckCircle } from '@meronex/icons/mdc'
import Loader from './simple_loader';

const QuickPay = () => {
    const {quickCheckout} = useWatchlist();
    const history = useHistory();
    
    useEffect(() => {
        if(quickCheckout.length < 1){
            history.goBack();
        }
    }, [quickCheckout]);

    return (
        <div id="quick-pay">
            <div className="form-box">
                {quickCheckout.map((item, index)=> {
                    return <PayForm 
                    key={item.id}
                    data={item} 
                    page={quickCheckout.length > 1 ? `${(index+1)} of ${quickCheckout.length}` : ""} 
                    />
                })}
            </div>
            <style jsx>{`
                #quick-pay{
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    display: grid;
                    place-items: center;
                    background: #00000050;
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    z-index: 1;
                }    

                #quick-pay .form-box{
                    width: 90%;
                    max-width: 500px;
                    min-height: 100px;
                    background: #fff;
                    border-radius: 20px;
                    display: flex;
                    overflow: auto;
                    scroll-snap-type: mandatory;
                    scroll-snap-type: x mandatory;
                }
                #quick-pay .form-box::-webkit-scrollbar{ display: none; }
            `}</style>
        </div>
    );
}

const PayForm = ({page, data})=>{
    const {user} = useAuth();
    const {fetchProductById} = useProducts();
    const {watchlist, removeFromWatchlist, emptyQuickCheckout, makePayment, verifyOTP} = useWatchlist();
    const currentTime = new Date().getTime();
    const [product, setProduct] = useState(null);
    const hasExpired = Object.keys(data).includes("expired");
    const [status, setStatus] = useState(0);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(
        Math.floor(((data.extraTime || data.expiresAt) - currentTime)/1000)
    );
    const success = useMemo(()=>{
        let output = false;
        watchlist.forEach(i=> {
            const found = product && (i.productId === product.id) && i.paid;
            if(found){ output = true; }
        })
        return output;
    }, [watchlist])

    const [otp, setOtp] = useState("");
    const [formData, setFormData] = useState({
        username: user.username || "",
        delivery: "",
        provider: "",
        phone: user.phone || "",
    });

    useEffect(()=> {
        if(timeLeft <= 0){
            removeFromWatchlist(data.productId);
        }
    }, [timeLeft])

    useEffect(async () => {
        const interval = setInterval(()=>{
            setTimeLeft(old=> {
                if(old === 1) clearInterval(interval)
                return old-1;
            });            
        }, 1000)        

        setProduct(await fetchProductById(data.productId));
    }, []);

    const handleChange = ({target: {value}}, name)=>{
        setFormData((old)=> {return {...old, [name]: value}});
    }

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        let stat;

        switch(status){
            case 1:
                stat = await verifyOTP({otp, watchId: data.id, userId: user.uid});
                break;

            default:
                stat = await makePayment(
                    {...formData, 
                        amount: (parseFloat(product.price) + (data.charge || 0)) * 100, 
                        watchId: data.id
                    },
                    user.uid,
                    [{id: product.id, imageUrl: product.imageUrl, price: product.price, size: product.size}],
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

    const handleCancel = (e)=>{
        e.preventDefault(); 
        if(hasExpired) {
            removeFromWatchlist(data.productId) 
        }else{
            emptyQuickCheckout();
        }
    }

    const renderSelect = (options=[], name="name", placeholder="Select an option")=>{
        return <select required value={formData[name]} onChange={(e)=> handleChange(e, name)} name={name} id={name}>
            <option selected value="">{placeholder}</option>
            {options.map((o, i)=> <option key={i} value={o.value}>{o.name}</option>)}
        </select>
    }

    return <form onSubmit={handleSubmit} className="pay-form">
        {product !== null && <div className="product-details">
            <div className="timer">{data.expired ? "Extra" : ""} {timeLeft}s Left</div>
            {page ? <div className="page">{page}</div> : <Fragment />}
            <img src={product.imageUrl} alt="product" />
            
            <div className="details">
                <h2 className="price">Gh&cent; {parseFloat(product.price).toFixed(2) + (data.charge || 0)}</h2>
                <input required value={formData.name} onChange={(e)=> handleChange(e, "username")} placeholder="Name for delivery" type="text" />
                
                {renderSelect([
                    {name: "Pick Up", value: "pickup"},
                    {name: "Parcel Office", value: "parcel-office"},
                    {name: "Discounted Shipping", value: "discounted-shipping"},
                ], "delivery", "Choose delivery method")}
                
                {renderSelect([
                    {name: "MTN", value: "mtn"},
                    {name: "Vodafone", value: "vod"},
                    {name: "Airtel/Tigo", value: "tgo"},
                ], "provider", "Choose provider")}
                
                <input required value={formData.phone} onChange={(e)=> handleChange(e, "phone")} placeholder="Enter phone number" type="text" />
                
                <div className="buttons">
                    <button disabled={loading}>{loading ? <Loader /> : "Pay"}</button>
                    <button onClick={handleCancel} className="cancel">Cancel</button>
                </div>
                {status === 1 && <div className="overlay">
                    <h3 style={{marginBottom: 30}}>Enter the OTP code sent to your device.</h3>
                    <input required value={otp} onChange={({target: {value}})=> setOtp(value)} type="text" />
                    <div className="buttons">
                        <button disabled={loading}>{loading ? <Loader /> : "Submit OTP"}</button>
                    </div>
                </div>}
                {status === 2 && <div className="overlay">
                    <h4 style={{marginBottom: 20}}>Finalize payment on your device by entering your PIN.</h4>
                    <Loader />
                </div>}
                {success ? <div style={{background: "#fff"}} className="overlay">
                    <MdcCheckCircle size={80} color="#33d20b" />
                    <h4>Payment Successful</h4>
                </div> : <Fragment />}
            </div>
        </div>}
        <style jsx>{`
            .pay-form{
                min-width: 100%;
                min-height: 200px;
                padding: 20px 5%;
                font-size: 14px;
                scroll-snap-align: start;
                margin-top: 20px;
            }

            .pay-form .overlay{
                position: absolute;
                top: 0;
                left: 0; 
                width: 100%; height: 100%;
                background: #ffffffc0;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0 5%;
            }

            .pay-form .timer{
                position: absolute;
                top: -30px;
                right: 0%;
                font-size: 0.8em;
                color: #fff;
                background: red;
                padding: 5px 10px;
                border-radius: 10px;
            }

            .pay-form .page{
                position: absolute;
                top: -30px; left: 0px;
                font-size: 0.7em;
                padding: 5px 10px; 
                border-radius: 10px;
                background: #555;
                color: #ffff;
            }

            .pay-form .product-details{
                display: flex;
                column-gap: 5%;
            }
            .pay-form .details{
                justify-self: stretch;
                align-self: stretch;
                flex: 1;
            }
            .pay-form .details.center{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                column-gap: 10px;
            }
            .pay-form .price{
                font-size: 1.8rem;
                color: var(--dark-color);
            }
            .pay-form img{
                object-fit: cover;
                object-position: center;
                border-radius: 10px;
                width: 30%;
                max-height: 100%;
            }

            .pay-form select, 
            .pay-form input{
                width: 100%;
                padding: 10px;
                border-radius: 10px;
                border: none;
                background: #efefef;
                font-size: 0.8em;
                margin-top: 10px;
                outline: none;
            }

            .pay-form .buttons{
                display: flex;
                align-items:center;
                column-gap: 10px;
                margin-top: 20px;
            }

            .pay-form button{
                padding: 10px 20px;
                background: var(--dark-color);
                color: #fff;
                border-radius: 10px;
                width: 100%;
                border: none;
                cursor: pointer;
                flex: 1;
            }
            .pay-form button.cancel{
                background: #222;
                flex: 0;
            }
        `}</style>
    </form>
}

export default QuickPay;
