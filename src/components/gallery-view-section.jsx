import { AiFillHeart, AiFillStar, AiOutlineEye, AiOutlineHeart, AiOutlineStar } from '@meronex/icons/ai';
import { BsStopwatch, BsStopwatchFill } from '@meronex/icons/bs';
import { FaEye, FaEyeSlash } from '@meronex/icons/fa';
import React, { useEffect, useState } from 'react';
import { getStatus, useProducts } from '../providers/productProvider';
import '../css/gallery.css';
import CategoryMenu from './category_menu';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/authProvider';
import { useWatchlist } from '../providers/watchlistProvider';
import {HiMenuAlt2, HiX} from '@meronex/icons/hi';

const GalleryViewSection = ({searchValue}) => {
    const {products: _products, categories, getProducts, like, addToWishList, holdProduct, unholdProduct, reduceWatch, increaseWatch, searchProducts } = useProducts();
    const {isWatching, addToWatchlist, removeFromWatchlist} = useWatchlist();
    const {user} = useAuth();
    const [products, setProducts] = useState(_products.map(item=> item));
    const [categoryFilter, setCategoryFilter] = useState("");
    const [prevShuffle, setPrevShuffle] = useState([]);
    const [showMenu, setShowMenu] = useState(false);

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

    const handleAddToWatchlist = (product)=>{
        if(isWatching(product.id)){
           reduceWatch(product);
           return removeFromWatchlist(product.id);
        }
        increaseWatch(product);
        addToWatchlist(user.uid, product.id);
    }

    return (
        <div className="gallery-view">
            {/* <div className="mute-heading">
                <hr /><b>All Products</b><hr />
            </div> */}
            <CategoryMenu categories={categories} onChange={(categoryId)=> setCategoryFilter(categoryId)} />
            <div className="inner">
                <div className={`category-section ${showMenu ? "show" : ""}`}>
                    <div className="mute-heading">
                        <hr /><b>Choose Filter</b><hr />
                    </div>
                    <button className="cat-item active">No Filter</button>
                    <button className="cat-item">Added Today</button>
                    <button className="cat-item">Sold/Old Products</button>
                    <button className="cat-item">On Hold</button>
                    <button className="cat-item">Recently Added</button>
                </div>
                <section className={`product-section ${showMenu ? "move" : ""}`}>
                    <div className="grid">
                        {products.map(product=> {
                            const heldByMe = product.heldBy === (user.uid);
                            const held = product.heldBy !== "";
                        return <div key={product.id} className="item">
                            {held && <img className="held-img" src="/images/held-img.png" alt={product.name} />}
                            <img draggable="false" src={product.imageUrl} alt="product item" />
                            <div className="float-price"><p><small>GHC</small><big>{parseFloat(product.price).toFixed(2)}</big></p></div>
                            {product.watchCount ? <div className="watch-count">
                                <AiOutlineEye size={20} color="#FF6123" />
                                <span style={{marginLeft: 5}}>{product.watchCount}</span>
                            </div> : <></>}
                            <div className="content">
                                <Link to={`/preview-product/${product.id}`} className="preview-button"></Link>
                                <div className="details">
                                    <h3>{product.name}</h3>
                                </div>
                                {product.status === 2 ? <></> : <div className="add-watchlist">
                                    <p><small>GHC</small><big>{parseFloat(product.price).toFixed(2)}</big></p>
                                    {held ? <></> :<button onClick={()=>handleAddToWatchlist(product)} className={`btn ${isWatching(product.id) ? "" : "active"}`}>{isWatching(product.id) ? 
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
                <div onClick={()=> setShowMenu(!showMenu)} className="side-toggler">
                    {!showMenu ? <HiMenuAlt2 size={25} color="#555" /> : <HiX size={25} color="#555" />}
                </div>
            </div>
        </div>
    );
}

export default GalleryViewSection;
