import React, {useEffect, useState} from 'react';

import { AiOutlineClose } from '@meronex/icons/ai';
import EmptyView from './empty_view';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/authProvider';
import { useProducts } from '../providers/productProvider';
import { useWatchlist } from '../providers/watchlistProvider';

const QuickWatchlistView = () => {
    const {getProductById} = useProducts();
    const {removeFromWatchlist, watchlist, checkOut} = useWatchlist();
    const {user} = useAuth();
    const [open, setOpen] = useState(true);
    const [amount, setAmount] = useState(getCheckoutTally())

    useEffect(() => {
        setAmount(getCheckoutTally());
        setOpen(true);
        const timeout = setTimeout(()=>setOpen(false), 2000)        
        return ()=>{
            clearTimeout(timeout)
        }        
    }, [checkOut]);

    function getCheckoutTally(){
        let output = 0.00;
        checkOut.forEach(itemId=>{
            output += parseFloat(getProductById(itemId).price);
        });
        return output;
    }

    return (
        <div className={`quick-watchlist-view ${open ? "show" : ""}`}>
            <div onClick={()=> setOpen(!open)} className="toggler">{open ? "Hide WatchList" : "Show WatchList"}</div>
            <div className="body-wrap">
                <div className="watchlist-list">
                    {watchlist.map((item, index)=> {
                        const product = getProductById(item.productId);
                        const held = product.status === 1;
                        const heldByMe = product.heldBy === user.uid;
                        return <div key={index} className={`item ${ (held && !heldByMe) ? "held" : ""}`}>
                            <Link to={"/preview-product/" + product.id}>
                                <img src={product.imageUrl} alt="watchlist item" />
                            </Link>
                            <div onClick={()=> removeFromWatchlist(product.id)} className="remove-btn">
                                <AiOutlineClose color="white" size={10} />
                            </div>
                        </div>}
                    )}
                    {checkOut.length < 1 ? <EmptyView message="Checkout watchlist is empty" useIcon={false} /> : <></>}
                </div>
                {checkOut.length > 0 ?<div className="checkout-btn-box">
                    <p><small>GHC</small><big>{parseFloat(amount).toFixed(2)}</big></p>
                    <Link to="/watchlist/checkout" className="btn">Checkout</Link>
                </div> : <></>}
            </div>
            <style jsx>{`
                .quick-watchlist-view{
                    position: fixed;
                    bottom: calc(-130px + 50px);
                    right: 0;
                    left: 0;
                    background: #fff;
                    padding: 10px 0;
                    border-top: 1px solid #eee;
                    transition: all .1s linear;
                    z-index: 10;
                }

                .quick-watchlist-view .toggler{
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 10px 20px;
                    font-size: 12px;
                    background: #222;
                    border-top-right-radius: 10px;
                    border-top-left-radius: 10px;
                    cursor: pointer;
                    color: #fff;
                    letter-spacing: 1px;
                }

                .quick-watchlist-view.show{
                    bottom: 0;
                }

                .quick-watchlist-view .body-wrap{
                    display: flex;
                    align-items: center;
                    padding: 0 5%;
                }

                .quick-watchlist-view .watchlist-list{
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    flex: 1;
                    overflow-x: auto;
                    margin-right: 10px;
                    padding-top: 5px;
                }
                .quick-watchlist-view .watchlist-list::-webkit-scrollbar{
                    display: none;
                }

                .watchlist-list .item{
                    animation: bounce .3s cubic-bezier(0.36, 0.63, 0, 1.32);
                }

                .watchlist-list .item:not(:last-child){
                    margin-right: 20px;
                }
                .watchlist-list .item.held img{
                    filter: blur(1px);
                }

                .watchlist-list .item .remove-btn{
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    background: red;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .watchlist-list .item img{
                    width: 55px;
                    height: 55px;
                    object-fit: cover;
                    border-radius: 10px;
                    border: 5px solid #eee;
                }

                @keyframes bounce{
                    0%{
                        transform: scale(0);
                    }
                    50%{
                        transform: scale(1.1);
                    }
                    100%{
                        transform: scale(1);
                    }
                }

                .quick-watchlist-view .btn{
                    padding: 10px 20px;
                    background: var(--dark-color);
                    color: #fff;
                    border-radius: 10px;
                    font-size: 13px;
                }
                .quick-watchlist-view .checkout-btn-box p{
                    margin-bottom: 10px;
                    font-weight: bolder;
                    text-align: center;
                    color: var(--dark-color)
                }
            `}</style>
        </div>
    );
}

export default QuickWatchlistView;
