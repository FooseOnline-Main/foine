import React, { useState, Fragment, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useProducts } from '../providers/productProvider';
import '../css/negotiation.css';
import { useEffect } from 'react';
import { useWatchlist } from '../providers/watchlistProvider';
import { useAuth } from '../providers/authProvider';
import Loader from './simple_loader';

const NegotiationPopup = () => {
    const {user} = useAuth();
    const history = useHistory();
    const { requests } = useProducts();
    const pendingRequests = useMemo(()=>{
        return requests.filter(req=> req.holder === user.uid);
    }, [])

    useEffect(() => {
        if(pendingRequests.length < 1){
            history.replace("/");
        }
    }, [pendingRequests]);

    // useEffect(() => {
    //     (async ()=>{
    //         const requestRes = await getRequestById(request.id);
    //         if(requestRes){
    //             return setRequest(()=> requestRes);
    //         }
    //         history.replace("/");
    //     })()
    // }, []);

    return (<div className="nego-popup">
            <div className="inner">
                {pendingRequests.map((request, index)=> <ConfirmationBox key={request.id} index={index+1} total={pendingRequests.length} request={request} />)}
            </div>
        </div>
    );
}

const ConfirmationBox = ({request, index, total})=>{
    const history = useHistory();
    const [product, setProduct] = useState(null);
    const {addForQuickCheckout, removeFromWatchlist} = useWatchlist();
    const { fetchProductById, unholdProduct, acceptPurchaseRequest, cancelRequestPurchase } = useProducts();

    useEffect(async () => {
        if(request){
            setProduct(await fetchProductById(request.productId));
        }
    }, [request]);

    const handleAccept = async ()=>{
        removeFromWatchlist(product.id);
        unholdProduct(request.holder, product);
        acceptPurchaseRequest({productId: product.id, reqId: request.id, userId: request.requestee})
        .then(()=>{ history.replace("/"); });
    }

    const handlePayNow = ()=>{
        cancelRequestPurchase(request.requestee, product);
        addForQuickCheckout(request.holder, request.productId, true);
    }

    return product ? <div className="request-box">
        <div className="tag">{index} of {total}</div>
        <div className="img-box">
            <img src={product.imageUrl} alt={product.name} />
        </div>
        <div className="confirm-box">
            <div className="head">                            
                <div className="details">
                    <h4>Purchase Request</h4>
                    <span style={{color: "var(--dark-color)"}}><small>GHC</small><big>{parseFloat(product.price).toFixed(2)}</big></span>
                </div>
            </div>                        
            <div className="content">
                <small>A customer is requesting for this product you are holding. Please checkout now or accept the request.</small>
                <Fragment>
                    {<div className="actions">
                        <button onClick={handlePayNow} id="accept">
                        {<p>Pay Now</p>}
                        </button>
                        <button onClick={handleAccept} id="deny"><p>Accept</p></button>
                    </div>}
                </Fragment>
            </div>
        </div>
    </div> : <Loader expand={true} />
}

export default NegotiationPopup;
