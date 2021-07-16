import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useProducts } from '../providers/productProvider';
import { useAuth } from '../providers/authProvider';
import '../css/negotiation.css';
import { useEffect } from 'react';
import Loader from './simple_loader';
import { AiOutlineCheckCircle } from '@meronex/icons/ai';
import { useError } from '../providers/errorProvider';

const NegotiationPopup = () => {
    const {reqId} = useParams();
    const history = useHistory();
    const {createError} = useError();
    const {products, getProductByReqId, acceptPurchaseRequest, denyPurchaseRequest } = useProducts();
    const [product, setProduct] = useState();
    const [request, setRequest] = useState();
    const [loading, setLoading] = useState(true);
    const [loadSuccess, setLoadSuccess] = useState(false);

    useEffect(() => {
        (async ()=>{
            if(products.length > 0){
                const result = getProductByReqId(reqId);
                if(result){
                    setProduct(result);
                    setRequest(result.purchaseRequests.filter(req=> req.id === reqId)[0])
                    return setLoading(false);
                }
                history.replace('/');
            }
        })()
    }, []);

    useEffect(() => {
        if(request && request.accepted){
            setLoadSuccess(false);
        }
    }, [products]);

    const handleAccept = ()=>{
        setLoadSuccess(true);
        if(request.accepted){
            setLoadSuccess(false);
          return createError("You have already accepted this purchase request.");
        }
        acceptPurchaseRequest(product, reqId);
    }

    const handleDeny = ()=>{
        denyPurchaseRequest(product, reqId);
        history.replace('/');
    }

    const renderSuccess = ()=>{
        return <div id="success">
            <AiOutlineCheckCircle style={{marginBottom: 10}} size={80} color="limegreen"/>
            <p>You have successfully accepted this purchase request.</p>
            <p>You have gained GHC1.00 free discount</p>
        </div>
    }

    return (
        <div className="nego-popup">
            <div onClick={()=>history.replace('/')} className="close-bg"></div>
            <div className="inner">
                {loading && !product && !request ? <Loader /> : 
                <>
                    <div className="img-box">
                        <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="confirm-box">
                        <div className="head">
                            <h2>{request.accepted ? "Accepted Successfully" : "Confirm Request"}</h2>
                            <div className="details">
                                <h4>{product.name}</h4>
                                <span style={{color: "var(--dark-color)"}}><small>GHC</small><big>{parseFloat(product.price).toFixed(2)}</big></span>
                            </div>
                        </div>
                        <div className="content">
                            {loadSuccess ? <Loader /> : request.accepted ? renderSuccess() : <>
                            <b style={{fontSize: 14, marginTop: "auto"}}>Benefits of accepting request:</b>
                            <div className="benefits">
                                <div className="benefit">
                                    <AiOutlineCheckCircle size={20} color="var(--dark-color)" /> 
                                    <span>You get to charge an amount between GHC1-5</span>
                                </div>
                                <div className="benefit">
                                    <AiOutlineCheckCircle size={20} color="var(--dark-color)" /> 
                                    <span>Charge will be kept in your wallet for purchase discount</span>
                                </div>
                                <div className="benefit">
                                    <AiOutlineCheckCircle size={20} color="var(--dark-color)" /> 
                                    <span>You get 10 points for your kindness</span>
                                </div>
                            </div>
                            {request.accepted ? <></> : <div className="actions">
                                <div onClick={handleAccept} id="accept"><p>Accept</p></div>
                                <div onClick={handleDeny} id="deny"><p>Deny</p></div>
                            </div>}
                            </>}
                        </div>
                    </div>
                </>}
            </div>
        </div>
    );
}

export default NegotiationPopup;
