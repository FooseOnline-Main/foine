import React, { useEffect, useState } from 'react';

import LiveFeedCard from './feed_card';
import { useProducts } from '../providers/productProvider';
import Loader from './simple_loader';
import { AiOutlineSearch } from '@meronex/icons/ai';
import { MdcHumanFemale, MdcHumanMale } from '@meronex/icons/mdc';
import {Link, NavLink} from 'react-router-dom';

const LiveFeedSection = () => {
    const {products, fetchProducts, loading} = useProducts();
    
    useEffect(() => {
        const feedsScrollView = document.getElementById('scroll-feed');
        let feedsPos = { top: 0, left: 0, x: 0, y: 0 };

        const mouseDownHandler = function(e) {
            feedsScrollView.style.cursor = 'grabbing';
            feedsScrollView.style.userSelect = 'none';
            feedsPos = {
                // The current scroll 
                left: feedsScrollView.scrollLeft,
                top: feedsScrollView.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };

            feedsScrollView.addEventListener('mouseup', mouseUpHandler);
            feedsScrollView.addEventListener('mousemove', mouseMoveHandler);
        };
        

        const mouseMoveHandler = function(e) {
            // How far the mouse has been moved
            const dx = e.clientX - feedsPos.x;
            const dy = e.clientY - feedsPos.y;

            // Scroll the element
            feedsScrollView.scrollTop = feedsPos.top - dy;
            feedsScrollView.scrollLeft = feedsPos.left - dx;
        };

        const mouseUpHandler = function() {
            feedsScrollView.style.cursor = 'grab';
            feedsScrollView.style.removeProperty('user-select');
            feedsScrollView.removeEventListener('mousemove', mouseMoveHandler);
        };

        feedsScrollView.addEventListener('mousedown', mouseDownHandler);
    }, []);

    const handleFeedScroll = (e)=>{
        const feedsScrollView = document.getElementById('scroll-feed');
        const {scrollTop, scrollHeight, offsetHeight} = feedsScrollView;
        if(offsetHeight + scrollTop >= scrollHeight && !loading){
            fetchProducts(products.length);
        }
    }


    return (
        <div className='feed-section'>
            <div className="tab-header">
                <div className="live-notice">
                    <div className="indicator"></div>
                    <p>Live</p>
                </div>
                <div className="options-tab">
                    <SearchBox />
                    <NavLink to="/g_spec/female" className="option">
                        <MdcHumanFemale size={20} />
                        <span>Female</span>
                    </NavLink>
                    <NavLink to="/g_spec/male" className="option">
                        <MdcHumanMale size={20} />
                        <span>Male</span>
                    </NavLink>                    
                </div>
            </div>
            <div className="inner" onScroll={handleFeedScroll} id="scroll-feed">
                {products.map((feed, id)=>(<LiveFeedCard feed={feed} key={id} />))}
            </div>
            {loading && <div style={{minHeight: "100px"}}><Loader expand={false} /></div>}
            <div className="vanishing-point left"></div>
            <div className="vanishing-point right"></div>
            <style jsx>{`
                .feed-section{
                    min-height: calc(100vh - 60px);
                    max-height: calc(100vh - 60px);
                    display: flex;
                    flex-direction: column;
                    background: #fafafa;
                    overflow: auto;
                    --space-x: 2.5%;
                }
                .feed-section .inner{
                    padding: 20px var(--space-x);
                    justify-self: stretch;
                    flex: 1;
                    display: column;
                    columns: 4;
                    column-gap: var(--space-x);
                    overflow: auto;
                }

                @media(max-width: 1000px){
                    .feed-section .inner{
                        columns: 3;
                    }
                }
                @media(max-width: 650px){
                    .feed-section .inner{
                        columns: 2;
                        padding: 10px 2%;
                        column-gap: 1.5%;
                    }
                }

                .feed-section .tab-header{
                    padding: 10px var(--space-x);
                    display: flex;
                    align-items: stretch;
                    column-gap: 5px;
                }

                .feed-section .tab-header .live-notice{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px 20px;
                    border-radius: 20px;
                    background: #222;
                    color: #fff;
                    align-self: center;
                }

                .feed-section .options-tab{
                    flex: 1;
                    display: flex;
                    align-items: center;
                    column-gap: 10px;
                    align-self: stretch;
                    overflow: auto;
                    padding: 5px 10px;
                    padding-right: 5px;
                }

                .feed-section .options-tab .option{
                    display: flex;
                    align-items: center;
                    column-gap: 5px;
                    padding: 10px;
                    border-radius: 20px;
                    background: #fff;
                    box-shadow: 0 0 5px 1px #00000010;
                    font-size: 0px;
                    cursor: pointer;
                    color: #222;
                    transition: all .25s linear;
                }

                .feed-section .options-tab .option.active{
                    background: var(--dark-color);
                    color: #fff;
                }

                .feed-section .options-tab .option.active span{
                    font-size: 12px;
                }


                .feed-section .live-notice p{
                    font-size: 12px;
                }

                .feed-section .live-notice .indicator{
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: red;
                    margin-right: 15px;
                }
                .feed-section .live-notice .indicator::after,
                .feed-section .live-notice .indicator::before
                {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: inherit;
                }
                .feed-section .live-notice .indicator::before{
                    background: inherit;
                    animation: glow-scale 1s linear infinite;
                }
                .feed-section .live-notice .indicator::after{
                    border: 1px solid red;
                    transform: scale(2);
                    background: transparent;

                }

                @keyframes glow-scale{
                    100%{
                        transform: scale(2.2);
                        opacity: 0;
                    }
                }

                .feed-section .inner::-webkit-scrollbar{
                    display: none;
                }
            `}</style>
        </div>
    );
};

const SearchBox = ({onValueChange})=>{
    return <div className="search-box">
        <AiOutlineSearch size={20} />
        <input type="text" />
        <style jsx>{`
            .search-box{
                display: flex;
                align-items: center;
                align-self: stretch;
                padding: 0 10px;
                padding-right: 0px;
                background: #fff;
                border-radius: 20px;
                box-shadow: 0 0 5px 1px #00000010;
                margin-left: -50px;
                transition: all .25s linear;
            }

            @media(max-width: 600px){
                .search-box{
                    margin-left: 0;
                }
            }

            .search-box input{
                border: none;
                background: transparent;
                align-self: stretch;
                padding: 0px 10px;
                padding-right: 0;
                outline: none;
                font-size: 12px;
                width: 0px;
                transition: all .3s linear;
            }

            .search-box:hover input{
                width: 150px;
            }
        `}</style>
    </div>
}

export default LiveFeedSection;
