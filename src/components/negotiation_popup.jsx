import React, { useState, Fragment } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useProducts } from '../providers/productProvider';
import '../css/negotiation.css';
import { useEffect } from 'react';
import Loader from './simple_loader';
import { AiOutlineCheckCircle } from '@meronex/icons/ai';
import { MdcCheckCircle, MdcCheckCircleOutline } from '@meronex/icons/mdc';
import { useError } from '../providers/errorProvider';

const NegotiationPopup = () => {
    const {reqId} = useParams();
    const history = useHistory();
    const {createError} = useError();
    const {products, getProductById, getRequestById, acceptPurchaseRequest, denyPurchaseRequest } = useProducts();
    const [product, setProduct] = useState();
    const [request, setRequest] = useState();
    const [charge, setCharge] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadSuccess, setLoadSuccess] = useState(false);

    useEffect(() => {
        (async ()=>{
            if(products.length > 0){
                const result = getProductById(reqId);
                if(result){
                    setProduct(result);
                    setRequest(getRequestById(reqId))
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
        acceptPurchaseRequest(
            product, charge, reqId, 
            ()=> setRequest(()=> {return {...request, accepted: true}})
        );
    }

    const handleDeny = ()=>{
        denyPurchaseRequest(product, reqId, ()=> history.replace('/'));
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
                <Fragment>
                    <div className="img-box">
                        <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="confirm-box">
                        <div className="head">                            
                            <div className="details">
                                <h4>{request.accepted ? "Accepted Successfully" : "Confirm Request"}</h4>
                                <span style={{color: "var(--dark-color)"}}><small>GHC</small><big>{parseFloat(product.price).toFixed(2)}</big></span>
                            </div>
                        </div>
                        <div className="options">
                            <h5>Select an option below:</h5>
                            <div onClick={()=> setCharge(()=> 0)} className="option">
                                {charge === 0 ? <MdcCheckCircle size={25} color="var(--dark-color)"/> : <MdcCheckCircleOutline size={25} color="#aaa" />}
                                <span>Let go free of charge</span>
                            </div>
                            <div onClick={()=> setCharge(()=> 1)} className="option">
                                {charge === 1 ? <MdcCheckCircle size={25} color="var(--dark-color)"/> : <MdcCheckCircleOutline size={25} color="#aaa" />}
                                <span>Charge an amount of Ghc 1.00</span>
                            </div>
                            <div onClick={()=> setCharge(()=> 2.3)} className="option">
                                {charge === 2.3 ? <MdcCheckCircle size={25} color="var(--dark-color)"/> : <MdcCheckCircleOutline size={25} color="#aaa" />}
                                <span>Charge an amount of Ghc 2.30</span>
                            </div>
                            <div onClick={()=> setCharge(()=> 3.35)} className="option">
                                {charge === 3.35 ? <MdcCheckCircle size={25} color="var(--dark-color)"/> : <MdcCheckCircleOutline size={25} color="#aaa" />}
                                <span>Charge an amount of Ghc 3.35</span>
                            </div>
                        </div>
                        <div className="content">
                            {loadSuccess ? <Loader /> : request.accepted ? renderSuccess() : <Fragment>
                            {request.accepted ? <Fragment></Fragment> : <div className="actions">
                                <div onClick={handleAccept} id="accept"><p>Accept</p></div>
                                <div onClick={handleDeny} id="deny"><p>Deny</p></div>
                            </div>}
                            </Fragment>}
                        </div>
                    </div>
                </Fragment>}
            </div>
        </div>
    );
}

export default NegotiationPopup;
