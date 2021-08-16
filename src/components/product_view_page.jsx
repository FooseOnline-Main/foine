import { AiOutlineClose, AiOutlineEye, AiOutlineUser } from '@meronex/icons/ai';
import { FaEye, FaEyeSlash, FaStopwatch } from '@meronex/icons/fa';
import React, { useEffect, useState, Fragment } from 'react';
import { getStatus, useProducts } from '../providers/productProvider';
import Loader from './simple_loader';
import { useAuth } from '../providers/authProvider';
import { useParams } from 'react-router-dom';
import { useWatchlist } from '../providers/watchlistProvider';
import '../css/product_preview.css';

const ProductViewPage = () => {
    const params = useParams();
    const {products, comment, fetchProductById, getProductById, holdProduct, getProductComments, unholdProduct, increaseWatch, reduceWatch} = useProducts();
    const {watchlist, isWatching, addToWatchlist, removeFromWatchlist} = useWatchlist();
    const {user} = useAuth();
    const [watching, setWatching] = useState(false);
    const [commentMsg, setCommentMsg] = useState("");
    const [product, setProduct] = useState();

    useEffect(() => {
        (async function(){
            if(products.length > 0){
                setProduct(await getProductById(params.id));
            }else{
                setProduct(await fetchProductById(params.id));
            }
            setWatching(isWatching(params.id));
        })()

        console.log(product);
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
                {product ? <Fragment>
                <div className="close-button" onClick={onClosePage}>
                    <AiOutlineClose color="#ffffff" size={15} />
                </div>
                <div className="img-box" style={{backgroundImage: `url(${product.imageUrl})`}}>
                    {product.watchCount ? <div className="watch-count">
                        <AiOutlineEye size={20} color="#FF6123" />
                        <span style={{marginLeft: 5}}>{product.watchCount}</span>
                    </div> : <Fragment></Fragment>}
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
                        {product.heldBy !== "" && !(product.heldBy === user.uid) ? <Fragment></Fragment> : <button onClick={()=> product.heldBy !== "" ? unholdProduct(user.uid, product) : holdProduct(user.uid, product)} id="hold">
                            <FaStopwatch size={18} color="#fff" />
                            <span>{product.heldBy !== "" ? "Unhold Item" : "Hold Item"}</span>
                        </button>}
                        {product.status !== 2 ? <button onClick={handleWatch} id="add-to-watchlist">
                            {watching ? <FaEyeSlash size={20} color="#fff" /> : <FaEye size={20} color="#fff" />}
                            <span>{watching ? 'Unwatch Item' : 'Watch Item'}</span>
                        </button> : <Fragment></Fragment>}
                    </div>
                    <div className="comment-section">
                        <form onSubmit={handleComment} className="comment-input">
                            <input type="text" value={commentMsg} onChange={({target: {value}})=> setCommentMsg(value)} placeholder="Leave a comment..." />
                        </form>
                        <div className="comments-list">
                            {product.comments.map((comment, key) => <Comment key={key} comment={comment}/>)}
                        </div>
                    </div>
                </div></Fragment> : <Loader />}
            </div>
        </div>
    );
}

const Comment = ({comment})=>{
    return <div className="comment">
        <div className="user-name">
            <AiOutlineUser style={{marginRight: 10}} color="#777" size={15}/>
            <span>{comment.by}</span>
        </div>
        <div className="message">{comment.comment}</div>
    </div>
}

export default ProductViewPage;
