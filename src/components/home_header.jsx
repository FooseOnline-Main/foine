import { AiOutlineSearch } from '@meronex/icons/ai';
import React, {Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/authProvider';
// import { useNotification } from '../providers/notificationProvider';
import { MdcAccountCircleOutline, MdcChevronDown } from '@meronex/icons/mdc';
import { FiShoppingBag, FiUser } from '@meronex/icons/fi';
import { useWatchlist } from '../providers/watchlistProvider';
import { useProducts } from '../providers/productProvider';

const HomeHeader = ({onSearch}) => {
    const {watchlist} = useWatchlist();
    const {fetchProductById} = useProducts();
    const [products, setProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        setProducts([]);
        setTotalPrice(0);
        watchlist.forEach(async item=> {
            const data = await fetchProductById(item.productId);
            if(data){
                setProducts(old => [...old, data]);
                setTotalPrice(old => (parseFloat(data.price) + parseFloat(old)).toFixed(2))
            }
        });   
    }, [watchlist, setProducts, setTotalPrice]);

    const {user} = useAuth();

    const renderAuth = ()=>{
        return 
    }

    return (
        <div className='home-header'>
            <h4 style={{color: "#222", whiteSpace: "nowrap"}}> 
                <span>FOINE</span> 
            </h4>
            <div className="search-form">
                <AiOutlineSearch size={20} color="#555" />
                <input onChange={({target: {value}})=> onSearch(value)} type="text" placeholder='Search by name or category' aria-placeholder="Search by name or category" className="search-input"/>
            </div>
            <button className='profile-button'>
                <FiShoppingBag size={22} color="#555" />
                {watchlist.length ? <div className="tag">{watchlist.length}</div> : <Fragment></Fragment>}
                <div style={{minWidth: 210}} className="drop-down">
                    <p>All Items</p>
                    <div className="items-box">
                        {products.map(item=> <div style={{backgroundImage: `url(${item.imageUrl})`}} className="item" />)}
                    </div>
                    <div className="checkout-space">
                        <button>Pay Bulk</button>
                        <div className="sub-total">
                            <small>GH&cent;</small> <b>{totalPrice}</b>
                        </div>
                    </div>
                </div>
            </button>
            {user.isAnonymous ? 
            <button className='profile-button'>
                <FiUser size={22} color="#555" />
                <MdcChevronDown size={18} color="#555" />
                <div className="drop-down">
                    <Link to="/login" className="item">Log In</Link>
                    <Link to="/signup" className="item">Signup</Link>
                </div>
            </button> :
            <Fragment>
                <Link to='/profile' className='profile-button'>
                    <MdcAccountCircleOutline size={25} color="#555" />
                </Link>
            </Fragment>}
            <style jsx>{`
                .home-header{
                    padding: 10px 2.5%;
                    display: flex;
                    align-items: center;
                    column-gap: 20px;
                    background: #fff;
                    color: #222;
                }

                .home-header .search-form{
                    border-radius: 20px;
                    flex: 1;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    padding: 0 15px;
                }

                @media(max-width: 500px){
                    .home-header .search-form{
                        display: flex;
                    }
                }

                 @media(max-width: 400px){
                    .home-header .search-form{
                        width: 50px;
                        overflow: hidden;
                    }
                }

                .search-form input{
                    border: none;
                    background: transparent;
                    padding: 10px 15px;
                    outline: none;
                    flex: 1;
                    font-size: 12px;
                }

                .search-form input::-webkit-input-placeholder{
                    font-size: 12px;
                    color: #aaa;
                }

                .profile-button{
                    border-radius: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-family: var(--font-bold);
                    color: #222;
                    cursor: pointer;
                    border: none;
                    background: transparent;
                }

                .profile-button .drop-down{
                    position: absolute;
                    top: 130%;
                    right: 0;
                    padding: 5px 0;
                    transform: translateY(10px);
                    opacity: 0;
                    pointer-events: none;
                    transition: all .15s linear;
                    background: #fff;
                    box-shadow: 0 0 10px 1px #00000010;
                    border-radius: 8px;
                    z-index: 10;
                    min-width: 150px;
                    overflow: hidden;
                }

                .profile-button .items-box{
                    padding: 10px;
                    display: flex;
                    column-gap: 10px;
                    flex-wrap: wrap;
                    max-height: 220px;
                    min-height: 120px;
                    overflow: auto;
                }
                .profile-button .items-box::-webkit-scrollbar{ display: none }

                .profile-button .items-box .item{
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    background: #eee;
                    margin-bottom: 10px;
                    background-size: cover;
                    background-position: center;
                }
                .profile-button .checkout-space{
                    display: flex;
                    justify-content: space-between;
                    column-gap: 10px;
                    padding: 10px;
                    align-items: center;
                }

                .checkout-space button{
                    padding: 8px 12px;
                    border: none;
                    border-radius: 10px;
                    background: #222;
                    color: #fff;
                    cursor: pointer;
                    font-size: 10px;
                }

                .profile-button:focus .drop-down,
                .profile-button .drop-down:hover{
                    opacity: 1;
                    pointer-events: all;
                    transform: translateY(0px);
                }

                .profile-button .drop-down .item{
                    padding: 10px 20px;
                    white-space: nowrap;
                    font-size: 12px;
                    border: none;
                    color: #777;
                }

                .profile-button .tag{
                    position: absolute;
                    bottom: 40%;
                    left: 50%;
                    padding: 0px 5px;
                    border-radius: 10px;
                    border: 2px solid #fff;
                    background: orangered;
                    font-size: 9px;
                    min-width: 20px;
                    text-align: center;
                    color: #fff;
                }

                @media(max-width: 600px){
                    .home-header{
                        margin-bottom: 0px;
                    }
                    .home-header h4{
                        margin-right: auto;
                    }
                    
                }
            `}</style>
        </div>
    );
}

export default HomeHeader;
