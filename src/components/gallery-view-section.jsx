import { AiFillHeart, AiFillStar, AiOutlineHeart, AiOutlineStar } from '@meronex/icons/ai';
import { BsStopwatch, BsStopwatchFill } from '@meronex/icons/bs';
import { FaEye, FaEyeSlash } from '@meronex/icons/fa';
import React, { useEffect, useState } from 'react';
import { getStatus, useProducts } from '../providers/productProvider';

import CategoryMenu from './category_menu';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/authProvider';
import { useWatchlist } from '../providers/watchlistProvider';

const GalleryViewSection = ({searchValue}) => {
    const {products: _products, categories, getProducts, like, addToWishList, holdProduct, unholdProduct, searchProducts } = useProducts();
    const {isWatching, addToWatchlist, removeFromWatchlist} = useWatchlist();
    const {user} = useAuth();
    const [products, setProducts] = useState(_products.map(item=> item));
    const [categoryFilter, setCategoryFilter] = useState("");
    const [prevShuffle, setPrevShuffle] = useState([]);

    useEffect(() => {
        setProducts(prevShuffle.map(item=>{ 
            let output;
            const currentProducts = getProducts(categoryFilter);
            currentProducts.forEach(product=>{
                if(product.id === item.id){
                    output = product;
                }
            });
            return output;
        }));
    }, [_products]);

    useEffect(() => {
        const result = shuffle(searchProducts(searchValue));
        setProducts(result);
        setPrevShuffle(result.map(item=> item));
    }, [searchValue]);

    useEffect(() => {
        const shuffleResult = shuffle(getProducts(categoryFilter));
        setPrevShuffle(shuffleResult);
        setProducts(shuffleResult.map(item=> item));
    }, [categoryFilter]);

    const shuffle = (array)=>{
        var currentIndex = array.length,  randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    const handleAddToCart = (productId)=>{
        if(isWatching(productId)){
           return removeFromWatchlist(productId);
        }
        addToWatchlist(user.uid, productId);
    }

    return (
        <div className="gallery-view">
            {/* <div className="mute-heading">
                <hr /><b>All Products</b><hr />
            </div> */}
            <CategoryMenu categories={categories} onChange={(categoryId)=> setCategoryFilter(categoryId)} />
            <div className="inner">
                <div className="category-section">
                    <div className="mute-heading">
                        <hr /><b>Choose Filter</b><hr />
                    </div>
                    <button className="cat-item active">No Filter</button>
                    <button className="cat-item">Added Today</button>
                    <button className="cat-item">Sold/Old Products</button>
                    <button className="cat-item">On Hold</button>
                    <button className="cat-item">Recently Added</button>
                </div>
                <section className="product-section">
                    <div className="grid">
                        {products.map(product=> {
                            const heldByMe = product.heldBy === (user.uid);
                            const held = product.heldBy !== "";
                        return <div key={product.id} className="item">
                            {held && <img className="held-img" src="/images/held-img.png" alt={product.name} />}
                            <img draggable="false" src={product.imageUrl} alt="product item" />
                            <div className="content">
                                <Link to={`/preview-product/${product.id}`} className="preview-button"></Link>
                                <div className="details">
                                    <h3>{product.name}</h3>
                                </div>
                                {product.status === 2 ? <></> : <div className="add-watchlist">
                                    <p><small>GHC</small><big>{parseFloat(product.price).toFixed(2)}</big></p>
                                    {held ? <></> :<button onClick={()=>handleAddToCart(product.id)} className={`btn ${isWatching(product.id) ? "" : "active"}`}>{isWatching(product.id) ? 
                                    (<><FaEyeSlash style={{marginRight: 5}} size={18} color="#222" /><span>Unwatch</span></>) : 
                                    (<><FaEye style={{marginRight: 5}} size={18} color="#fff" /><span>Watch</span></>)}</button>}
                                </div>}
                                <div className="actions">
                                    <div onClick={()=> like(user.uid, product)} className="act">
                                        <div className="tag">{product.likes.length}</div>
                                        {product.likes.includes(user.uid) ? <AiFillHeart size={20} color="red" /> : <AiOutlineHeart size={20} color="#fff" /> }
                                    </div>
                                    <div onClick={()=> addToWishList(user.uid, product)} className="act">
                                        <div className="tag">{product.wishlist.length}</div>
                                        {product.wishlist.includes(user.uid) ? <AiFillStar size={20} color="#fff" /> : <AiOutlineStar size={20} color="#fff" />}
                                    </div>
                                    {(held && !heldByMe) || product.status === 2 ? 
                                    <></> : 
                                    <div onClick={()=> { heldByMe ? 
                                        unholdProduct(user.uid, product) : 
                                        holdProduct(user.uid, product)}} 
                                        className="act"
                                    >
                                        <div className="tag">{held ? "Unhold" : "Hold"}</div>
                                        {held ? <BsStopwatchFill size={20} color="#fff" /> : <BsStopwatch size={20} color="#fff" />}
                                    </div>}
                                </div>
                            </div>
                            <div style={{background: getStatus(product.status).color}} className="status">{getStatus(product.status).value}</div>
                        </div>})}
                    </div>
                </section>
            </div>
            <style jsx>{`
                .gallery-view{
                    width: 100%;
                    height: calc(100vh - 60px);
                    overflow: hidden;
                }

                .gallery-view .inner{
                    display: flex;
                    width: 100%;
                    padding: 20px 5%;
                    padding-top: 0;
                }

                .gallery-view .inner .category-section{
                    margin-top: 20px;
                    padding: 20px 2%;
                    min-width: 250px;
                    margin-right: 5%;
                    box-shadow: 0 0 20px #efefef;
                    border-radius: 20px;
                    align-self: start;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #eee;
                }
                @media(max-width: 850px){
                    .gallery-view .inner .category-section{
                        margin-left: -350px;
                    }
                }

                .gallery-view .inner .category-section > button{
                    margin-top: 10px;
                    padding: 10px 15px;
                    border-radius: 10px;
                    border:none;
                    text-align: left;
                    cursor: pointer;
                    transition: all .2s linear;
                    background: transparent;
                    font-size: 12px
                }

                .gallery-view .inner .category-section > button:hover{
                    background: #efefef;
                }

                .gallery-view .inner .category-section > button.active{
                    background: var(--dark-color);
                    color: #fff;
                }

                .gallery-view .inner section{
                    overflow: auto;
                    height: calc(100vh - 150px);
                }
                .gallery-view .inner section .grid{
                    display: grid;
                    grid-template-columns: repeat(3, 31.5%);
                    grid-gap: 2%;
                    padding-bottom: 60px;
                    padding-top: 20px;
                }
                @media(max-width: 1090px){
                    .gallery-view .inner section{
                        grid-template-columns: repeat(2, 48%);
                        grid-gap: 2%;
                    }
                }
                @media(max-width: 850px){
                    .gallery-view .inner section{
                        min-width: 100%;
                        flex: 1;
                    }
                }
                .gallery-view .inner section::-webkit-scrollbar{
                    display: none;
                }

                .gallery-view .inner .item{
                    min-width: 100%;
                    min-height: 300px;
                }
                @media(max-width: 1090px){
                    .gallery-view .inner .item{
                    }
                }

                .gallery-view .item img{
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 10px;
                }

                .gallery-view .item .held-img{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1;
                    width: 50%;
                    height: initial;
                }

                .gallery-view .inner .item .content{
                    z-index: 2;
                }

                .gallery-view .inner .item .content,
                .gallery-view .inner .item .preview-button
                {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border-radius: 10px;
                    opacity: 0;
                    transition: opacity .1s linear;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: transparent;
                }
                .gallery-view .inner .item .preview-button{
                    background: #0000009a;
                    pointer-events: none;
                    opacity: 0;
                }
                .gallery-view .inner .item:hover .content{
                    opacity: 1;
                }
                .gallery-view .inner .item:hover .preview-button{
                    opacity: 1;
                    pointer-events: all;
                }

                .gallery-view .item .content .details{
                    padding: 20px 5%;
                    color: #fff;
                }
                .gallery-view .item .content .add-watchlist{
                    padding: 20px 5%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #fff;
                }
                .gallery-view .item .content .add-watchlist button{
                    padding: 10px 20px;
                    border-radius: 20px;
                    border: none;
                    background: #fff;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .gallery-view .item .content .add-watchlist button.active{
                    background: var(--dark-color);
                    color: #fff;
                }
                .gallery-view .item .status{
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    color: #fff;
                    font-size: 12px;
                    padding: 10px 5%;
                    border-radius: 10px 10px 10px 10px;
                }

                .gallery-view .item .actions{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 5px 10px;
                    border-radius: 20px;
                    background-color: #0000005a;
                    backdrop-filter: blur(2px);
                    -webkit-backdrop-filter: blur(2px);
                }
                .gallery-view .item .actions .act{
                    cursor: pointer;
                    margin: 0px 10px;
                    animation: bounce .3s ease-in-out;
                }

                .gallery-view .item .actions .act .tag{
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    color: #555;
                    background: #fff;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-weight: bold;
                    opacity: 0;
                    pointer-events: none;
                    transition: all .1s linear;
                }
                .gallery-view .item .actions .act .tag::before{
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: rotate(45deg) translateX(-50%);
                    background: #fff;
                }
                
                .gallery-view .item .actions .act:hover .tag{
                    opacity: 1;
                    bottom: 150%;
                }

                @keyframes bounce{
                    0%{
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    50%{
                        transform: translate(-50%, -50%) scale(1.5);
                    }
                    100%{
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

            `}</style>
        </div>
    );
}

export default GalleryViewSection;
