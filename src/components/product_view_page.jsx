import { AiOutlineClose, AiOutlineEye, AiOutlineUser } from '@meronex/icons/ai';
import { FaEye, FaEyeSlash, FaStopwatch } from '@meronex/icons/fa';
import React, { useEffect, useState } from 'react';
import { getStatus, useProducts } from '../providers/productProvider';

import Loader from './simple_loader';
import { useAuth } from '../providers/authProvider';
import { useParams } from 'react-router-dom';
import { useWatchlist } from '../providers/watchlistProvider';

const ProductViewPage = () => {
    const params = useParams();
    const {products, comment, fetchProductById, getProductById, holdProduct, unholdProduct, increaseWatch, reduceWatch} = useProducts();
    const {watchlist, isWatching, addToWatchlist, removeFromWatchlist} = useWatchlist();
    const {user} = useAuth();
    const [watching, setWatching] = useState(false);
    const [commentMsg, setCommentMsg] = useState("");
    const [product, setProduct] = useState();

    useEffect(() => {
        async function fetchData(){
            if(products.length > 0){
                setProduct(getProductById(params.id));
            }else{
                setProduct(await fetchProductById(params.id));
            }
            setWatching(isWatching(params.id));
        }
        fetchData();
    }, [watchlist, products]);

    const handleComment = (e)=>{
        e.preventDefault();
        if(commentMsg && commentMsg !== ""){
            comment( user.isAnonymous ? "Anonymous" : user.displayName, commentMsg, product);
            setCommentMsg("");
        }
    }

    const onClosePage = ()=>{
        // remove current feed
        setTimeout(()=>{
            document.body.style.overflow = "auto";
            window.history.go(-1)
        }, 150);
    }

    const handleWatch = ()=>{
        if(watching) {
            reduceWatch(product);
            removeFromWatchlist(product.id)
        }else{
            increaseWatch(product);
            addToWatchlist(user.uid, product.id)
        }
    }

    return (
        <div className='single-product-page'>
            <div className="close-sheet" onClick={onClosePage}></div>
            <div className={`main-page`}>
                {product ? <>
                <div className="close-button" onClick={onClosePage}>
                    <AiOutlineClose color="#ffffff" size={15} />
                </div>
                <div className="img-box" style={{backgroundImage: `url(${product.imageUrl})`}}>
                    {product.watchCount ? <div className="watch-count">
                        <AiOutlineEye size={20} color="#FF6123" />
                        <span style={{marginLeft: 5}}>{product.watchCount}</span>
                    </div> : <></>}
                </div>
                <div className="content">
                    <div className="details">
                        <div  style={{flex: '1'}}>
                            <h2 style={{marginBottom: 30}}>{product.name}</h2>
                            <div style={{marginBottom: 10}}>
                                <span className="tag" style={{marginRight: 10}}>{product.size} Size</span>
                                <span style={{background: getStatus(product.status).color, color: "#fff"}} className="tag">{getStatus(product.status).value}</span>
                            </div>
                        </div>
                        <div>
                            <p className='price'>GHC <b style={{fontSize: 25}}>{parseFloat(product.price).toFixed(2)}</b></p>
                        </div>               
                    </div>
                    <div className="purchase-actions">
                        {product.heldBy !== "" && !(product.heldBy === user.uid) ? <></> : <button onClick={()=> product.heldBy !== "" ? unholdProduct(user.uid, product) : holdProduct(user.uid, product)} id="hold">
                            <FaStopwatch size={18} color="#fff" />
                            <span>{product.heldBy !== "" ? "Unhold Item" : "Hold Item"}</span>
                        </button>}
                        {product.status !== 2 ? <button onClick={handleWatch} id="add-to-watchlist">
                            {watching ? <FaEyeSlash size={20} color="#fff" /> : <FaEye size={20} color="#fff" />}
                            <span>{watching ? 'Unwatch Item' : 'Watch Item'}</span>
                        </button> : <></>}
                    </div>
                    {/* <div className="mute-heading">
                        <hr /><b>comment</b><hr />
                    </div> */}
                    <div className="comment-section">
                    </div>
                        <form onSubmit={handleComment} className="comment-input">
                            <input type="text" value={commentMsg} onChange={({target: {value}})=> setCommentMsg(value)} placeholder="Leave a comment..." />
                        </form>
                        <div className="comments-list">
                            {product.comments.map(comment => <Comment  comment={comment}/>)}
                        </div>
                </div></> : <Loader />}
            </div>
            <style jsx>{`
                .single-product-page{
                    position: fixed;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);  
                    z-index: 9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .single-product-page .close-sheet{
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    background: #0000005a;
                    cursor: pointer;
                }

                .single-product-page .main-page{
                    margin: 0 auto;
                    width: 60%;
                    background: #fff;
                    height: 90%;
                    max-height: 600px;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    animation: scale-in .15s cubic-bezier(0.04, 1.12, 0.37, 1.15);
                    padding: 10px;
                    border-radius: 20px;
                    overflow-x: hidden;
                    overflow-y: scroll;
                }

                .single-product-page .main-page .watch-count{
                    top: 20px;
                    left: 5%;
                    background: #222;
                }

                @media(max-width: 1000px){
                    .single-product-page .main-page{
                        width: 80%;
                    }
                }
                @media(max-width: 700px){
                    .single-product-page .main-page{
                        width: 100%;
                        height: 100%;
                        border-radius: 0px;
                        max-height: 100vh;
                    }
                }

                .single-product-page .main-page::-webkit-scrollbar{
                    display: none;
                }

                .single-product-page .main-page.close{
                    animation: scale-out .15s cubic-bezier(0.04, 1.12, 0.37, 1.15);
                }
                
                @keyframes scale-in{
                    0%{
                        transform: scale(1.15);
                        opacity: 0.5;
                    }
                }

                @keyframes scale-out{
                    100%{
                        opacity: 0;
                    }
                }
                
                .single-product-page .close-button{
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background-color: #0000005a;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 25px;
                    cursor: pointer;
                    z-index: 1;
                }

                .single-product-page .img-box{
                    width: 100%;
                    max-width: 500px;
                    height: 100%;
                    border-radius: 20px;
                    background-color: var(--light-color);
                    background-size: cover;
                    background-position: center;
                    margin-bottom: 20px;
                }

                @media(max-width: 600px){
                    .single-product-page .main-page{
                        border-radius: 0px;
                        display: flex;
                        flex-direction: column;
                        overflow: auto;
                    }

                    .single-product-page .img-box{
                        width: 100%;
                        max-width: 100%;
                        min-height: 70vh;
                        border-radius: 20px;
                        margin-bottom: 0px;
                    }
                }

                .single-product-page .content{
                    flex: 1;
                    width: 100%;
                    max-width: 100%;
                    padding: 10% 5%;
                    padding-bottom: 0px;
                    overflow: hidden;
                }
                @media(max-width: 600px){
                    .single-product-page .content{
                        flex: 1;
                        padding: 5%;
                        overflow: initial;
                    }
                }
                .single-product-page .details{
                    display: flex;
                }

                .single-product-page .details h2{
                    font-size: 20px;
                    color: var(--text-color);
                }

                .single-product-page .details .tag{
                    padding: 5px 10px;
                    background: var(--light-color);
                    color: var(--dark-color);
                    font-size: 12px;
                    margin-right: 10px;
                    border-radius: 10px;
                }
                .single-product-page .details .tag b{
                    font-size: 8px;
                }

                .single-product-page .details > div:first-child b{
                    font-size: 14px;
                }
                .single-product-page .details .price,
                .single-product-page .details .price *
                 {
                    color: var(--dark-color);
                }

                .single-product-page .purchase-actions{
                    display: flex;
                    padding: 15px 0;
                    align-items: center;
                }

                #hold, #add-to-watchlist{
                    flex: 1;
                    text-align: center;
                    padding: 10px;
                    border-radius: 10px;
                    color: white;
                    font-size: 12px;
                    border: 1px solid var(--dark-color);
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .purchase-actions button span{
                    margin-left: 10px;
                }

                #hold{
                    background: #222;
                    color: #fff;
                    border: 1px solid #222;
                    margin-right: 20px;
                }
                #add-to-watchlist{
                    background: var(--dark-color);
                }

                .comment-section{
                    padding: 0 5%;
                    margin-top: 20px;
                }

                .comment-input{
                    display: flex;
                    align-items: center;
                    padding: 2px 10px;
                    background-color: #f0f0f0;
                    border-radius: 20px;
                }

                .comment-input input{
                    flex: 1;
                    border: none;
                    padding: 10px;
                    background: transparent;
                    outline: none;
                }
                .comment-input input::-webkit-input-placeholder{
                    font-size: 12px;
                }

                .comments-list{
                    max-height: 300px;
                    overflow: auto;
                    margin-top: 20px;
                }
                .comments-list::-webkit-scrollbar{
                    display: none;
                    width: 2px;
                }
            `}</style>
        </div>
    );
}

const Comment = ({comment})=>{
    return <div className="comment">
        <div className="user-name">
            <AiOutlineUser color="#777" size={15}/>
            <b style={{marginLeft: 10, fontSize: 13}}>{comment.by}</b>
        </div>
        <div className="message">{comment.comment}</div>
        <style jsx>{`
            .comment{
                display: flex;
                flex-direction: column;
                padding-top: 10px;
            }    
            .comment .user-name{
                display: flex;
                align-items: center;
                font-size: 10px;
            }
            .comment .message{
                padding: 0px 0 15px 0;
                padding-left: 26px;
                font-size: 11px;
                color: #555;
                border-bottom: 1px solid #f0f0f0;
                font-weight: 300;
                letter-spacing: 0.5px;
                font-weight: 300;
            }
        `}</style>
    </div>
}

export default ProductViewPage;
