import React, { useState, Fragment, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useProducts } from '../providers/productProvider';
import '../css/negotiation.css';
import { useEffect } from 'react';
import Loader from './simple_loader';
import { AiOutlineCheckCircle } from '@meronex/icons/ai';
import { MdcCheckCircle, MdcCheckCircleOutline } from '@meronex/icons/mdc';
import { useError } from '../providers/errorProvider';
import { useWatchlist } from '../providers/watchlistProvider';

const NegotiationPopup = () => {
    const {reqId} = useParams();
    const history = useHistory();
    const {createError} = useError();
    const { requests, fetchProductById, getRequestById, acceptPurchaseRequest, denyPurchaseRequest } = useProducts();
    const {createRequestPayment} = useWatchlist();
    const [product, setProduct] = useState(null);
    const [request, setRequest] = useState(null);
    const [charge, setCharge] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const accepted = useMemo(()=>{
        let output = false;
        requests.forEach(req=> {
            if(req.id === reqId && req.accepted){ 
                output= true
            }
        });
        return output;
    }, [requests])

    useEffect(() => {
        (async ()=>{
            const requestRes = await getRequestById(reqId);
            if(requestRes){
                return setRequest(()=> requestRes);
            }
            history.replace("/");
        })()
    }, []);

    useEffect(async () => {
        if(request){
            setProduct(await fetchProductById(request.productId));
            return setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        if(accepted){
            setLoadSuccess(false);
        }
    }, [accepted]);

    const handleAccept = ()=>{
        setLoadSuccess(true);
        if(accepted){
            setLoadSuccess(false);
            return createError("You have already accepted this purchase request.");
        }
        acceptPurchaseRequest({productId: request.productId, userId: request.requestee, charge, reqId});
    }

    const handleDeny = ()=>{
        denyPurchaseRequest(product, reqId, ()=> history.replace('/'));
    }

    const handleSelectCharge = (val)=>{
        if(!loadSuccess){
            setCharge(()=> val)
        }
    }

    const renderSuccess = ()=>{
        return <div id="success">
            <AiOutlineCheckCircle style={{marginBottom: 10}} size={80} color="limegreen"/>
            <p>You have successfully accepted this purchase request.</p>
            <p>You have gained Ghc {request.charge || charge} free discount</p>
        </div>
    }

    return ((product && request) ? <div className="nego-popup">
            <div onClick={()=>history.replace('/')} className="close-bg"></div>
            <div className="inner">
                <Fragment>
                    <div className="img-box">
                        <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="confirm-box">
                        <div className="head">                            
                            <div className="details">
                                <h4>{request.accepted ? "Accepted Successfully" : "Confirm Request"}</h4>
                                <span style={{color: "var(--dark-color)"}}><small>GHC</small><big>{(parseFloat(product.price) + charge).toFixed(2)}</big></span>
                            </div>
                        </div>                        
                        <div className="content">
                            {accepted ? renderSuccess() : 
                            <Fragment>
                            <h5>Select an option below:</h5>
                            <div className="options">
                            <div onClick={()=> handleSelectCharge(0)} className={`option ${charge === 0 ? "selected" : ""}`}>
                                {charge === 0 ? <MdcCheckCircle size={25} color="var(--dark-color)"/> : <MdcCheckCircleOutline size={25} color="#aaa" />}
                                <span>Let go free of charge</span>
                            </div>
                            {request.charges.map((c, key)=> 
                            <div key={key} onClick={()=> handleSelectCharge(parseFloat(c))} className={`option ${charge === parseFloat(c) ? "selected" : ""}`}>
                                {charge === parseFloat(c) ? <MdcCheckCircle size={25} color="var(--dark-color)"/> : <MdcCheckCircleOutline size={25} color="#aaa" />}
                                <span>Ghc {c}</span>
                            </div>)}
                        </div>
                            {request.accepted ? <Fragment></Fragment> : <div className="actions">
                                <button onClick={handleAccept} id="accept">
                                   {loadSuccess ? <Loader /> :  <p>Accept</p>}
                                </button>
                                <button onClick={handleDeny} id="deny"><p>Deny</p></button>
                            </div>}
                            </Fragment>}
                        </div>
                    </div>
                </Fragment>
            </div>
        </div> : <Loader expand={true} />
    );
}

export default NegotiationPopup;
