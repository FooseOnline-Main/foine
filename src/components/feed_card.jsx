import { getStatus, useProducts } from '../providers/productProvider';

import { AiOutlineCheck, AiOutlineEye } from '@meronex/icons/ai';
import { Link } from 'react-router-dom';
import React, {Fragment} from 'react';
import { useAuth } from '../providers/authProvider';
import { useWatchlist } from '../providers/watchlistProvider';
import { useState } from 'react';
import { MdcChevronDownCircle, MdcChevronUpCircle } from '@meronex/icons/mdc';
import { useEffect } from 'react';

const LiveFeedCard = ({feed, onExpand, expanded}) => {
    const {user} = useAuth();
    const {holdProduct, unholdProduct, requestPurchase, cancelRequestPurchase, increaseWatch, reduceWatch} = useProducts();
    const {isWatching, addToWatchlist, removeFromWatchlist} = useWatchlist();
    const productId = feed.id;
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        if(expanded){
            setShowButtons(true);
        }else{
            setShowButtons(false);
        }
    }, [expanded]);

    const onViewItem = ()=>{
        // set current open feed
        document.body.style.overflow = "hidden";
        // onClick();
    }

    const handleAddToWatchlist = ()=>{
        if(isWatching(feed.id)){
            reduceWatch(feed);
            removeFromWatchlist(productId);
        }else{
            increaseWatch(feed);
            addToWatchlist(user.uid, productId);
        }
    }

    const handleHoldItem = ()=>{
        if(feed.heldBy !== ""){
            unholdProduct(user.uid, feed);
        }else{
            holdProduct(user.uid, feed);
        }
    }

    const handleRequestPurchase = ()=>{
        if(requestedPurchase()){
            cancelRequestPurchase(user.uid, feed);
        }else{
            requestPurchase(user.uid, feed);
        }
    }

    const requestedPurchase = ()=>{
        let output = false;
        // feed.purchaseRequests.forEach(request=>{
        //     if(request.userId === user.uid){
        //         output = true;
        //     }
        // });
        return output;
    }

    return (
        <div className='feed-card'>
            <Link to={`/preview-product/${feed.id}`}>
                <div style={{width: "100%", background: "#fff", overflow: "visible"}}>
                    <img src={feed.imageUrl} className="feed-img" alt={feed.name} />
                </div>
            </Link>
            <div className="held-stamp">
                {feed.status === 1 ? <img src="/images/held-img.png" style={{opacity: 0.9, margin: "0 auto"}} width="50%" alt={feed.name} /> : <Fragment></Fragment>}
            </div>

            {/* feed status */}
            <div style={{background: getStatus(feed.status).color}} className="status">{getStatus(feed.status).value}</div>

            {/* watch count */}
            {feed.watchCount ? <div className="watch-count">
                <AiOutlineEye size={20} />
                <span style={{marginLeft: 5}}>{feed.watchCount}</span>
            </div> : <Fragment></Fragment>}

            {/* details */}
            <div className="details" onClick={onViewItem}>
                <Link to={`/preview-product/${feed.id}`} >
                    {/* <h3>{feed.name}</h3> */}
                    <div className="flex">
                        <p>{feed.size} Size</p>
                        <p style={{color: "var(--dark-color)"}}><small>GHC</small><span>{parseFloat(feed.price).toFixed(2)}</span></p>
                    </div>
                </Link>
                <div className="buttons-toggler">
                    <hr />
                    {showButtons ? 
                    <MdcChevronUpCircle onClick={()=> setShowButtons(!showButtons)} style={{cursor: "pointer"}} size={20} color="#555" /> : 
                    <MdcChevronDownCircle onClick={()=> {onExpand(); setShowButtons(!showButtons)}} style={{cursor: "pointer"}} size={20} color="#555" />}
                    <hr />
                </div>
                {/* add section */}
                {feed.status !== 2 ? 
                <div className={`add-section ${showButtons ? "show" : ""}`}>
                    {feed.heldBy === user.uid ? <Fragment></Fragment> :
                    // <label htmlFor={feed.id} className="add-to-watchlist">
                    //     <input type="checkbox" checked={isWatching(feed.id)} name="add-watchlist" className="add-watchlist" id={feed.id} onChange={handleAddToWatchlist} />
                    //     <span>{isWatching(feed.id) ? "Unwatch" : "Watch"}</span>
                    // </label>
                    <button className="watch" onClick={handleAddToWatchlist}>{isWatching(feed.id) ? "Return" : "Buy"}</button>
                    }

                    {feed.status === 1 && !(feed.heldBy === user.uid) ? 
                    // <label htmlFor={`${feed.id}request`} className="request">
                    //     <input type="checkbox" checked={requestedPurchase()} name="request" className="request" id={`${feed.id}request`} onChange={handleRequestPurchase} />
                    //     <span>{requestedPurchase() ? "Requested" : "Request"}</span>
                    // </label>
                    <button onClick={handleRequestPurchase}>{requestedPurchase() ? "Requested" : "Request"}</button>
                     : 

                    <button style={{flex: feed.heldBy === (user.uid ) ? 1 : 0}} className="hold" onClick={handleHoldItem}>{(feed.heldBy === user.uid ) ? "Drop" : "Hold"}</button>
                    }

                </div> : 
                <Fragment></Fragment>}
            </div>
            <style jsx>{`
                .feed-card{
                    min-height: 250px;
                    break-inside: avoid;
                    box-shadow: 0 0 20px 1px #00000010;
                    overflow: hidden;
                    padding: 0px;
                    border-radius: 20px;
                    margin-bottom: 15px;
                    background: #fff;
                    animation: slide-up .5s ease-in;
                    -webkit-animation: slide-up .5s ease-in;
                }

                @keyframes slide-up{
                    0%{
                        transform: translateY(10px);
                        opacity: 0.5;
                    }
                }

                .feed-card .feed-img{
                    max-width: calc(100% - 20px);
                    margin: 10px auto;
                    margin-top: 10px;
                    margin-left: 10px;
                    border-radius: 20px;
                    box-shadow: 0 10px 10px 1px #00000010;
                }

                .feed-card .held-stamp{
                    position: absolute;
                    top: 40%;
                    left: 0;
                    width: 100%;
                    display: flex;
                    padding-top: 20px;
                }

                .feed-card .watch-count{
                    top: 20px;
                    left: 20px;
                    z-index: 1;
                }

                .feed-card .watch-count span{font-size: 13px}

                .feed-card .buttons-toggler{
                    display: flex;
                    align-items: center;
                    column-gap: 5px;
                }
                .feed-card .buttons-toggler hr{
                    flex: 1;
                    border: none;
                    border-top: 1px solid #f5f5f5;
                }

                .feed-card .add-section{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                    column-gap: 5%;
                    overflow: hidden;
                }
                .feed-card .add-section.show{
                    padding-bottom: 20px;
                }
                
                .feed-card .add-section button{
                    border: none;
                    border-radius: 10px;
                    padding: 10px 20px;
                    font-size: 0.7em;
                    cursor: pointer;
                    background: transparent;
                    box-sizing: content-box;
                    margin-top: -50px;
                    transition: all .15s linear;
                }
                .feed-card .add-section.show button{
                    margin-top: 0px;
                }   
                
                .feed-card .add-section button.watch{
                    flex: 1;
                    background: var(--dark-color);
                    color: #fff;
                }
                .feed-card .add-section button.hold{
                    border: 1px dashed #222;
                    color: #222;
                }

                .feed-card .details{
                    padding: 0 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    font-size: 16px;
                    background: #fff;
                }

                @media(max-width: 650px){
                    .feed-card .feed-img{
                        max-width: 100%;
                        margin: 0px;
                        box-shadow: none;
                    }

                    .feed-card .details{
                        padding: 10px;
                        padding-bottom: 0px;
                    }
                }

                .details .flex{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .feed-card h3{
                    font-size: 1.1em;
                    color: #222;
                }

                .feed-card p{
                    font-size: 0.8em;
                    color: #777;
                }

                .feed-card span{
                    font-size: 1.3em;
                    margin-left: 5px;
                    font-family: 'gilroyBold'
                }

                @media(max-width: 650px){
                    .feed-card h3{
                        font-size: 0.9em;
                    }

                    .feed-card p{
                        font-size: 0.7em;
                    }
                }

                .feed-card .status{
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    padding: 5px 10px;
                    border-radius: 8px;
                    font-size: 0.7em;
                    color: #fff;
                    opacity: 0.8;
                }

            `}</style>
        </div>
    );
}

export default LiveFeedCard;
