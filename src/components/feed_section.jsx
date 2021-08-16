import React, { useEffect, useState } from 'react';

import LiveFeedCard from './feed_card';
import { useProducts } from '../providers/productProvider';
import Loader from './simple_loader';

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
            <div className="live-notice">
                <div>
                    <div className="indicator"></div>
                    <p>Live Feed</p>
                </div>
                <hr />
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
                }
                .feed-section .inner{
                    padding: 20px 5%;
                    justify-self: stretch;
                    flex: 1;
                    display: column;
                    columns: 4;
                    column-gap: 2.5%;
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
                    }
                }

                .feed-section .live-notice{
                    padding: 10px 5%;
                    display: flex;
                    align-items: center;
                    justify-content: start;
                }

                .feed-section .live-notice > div{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px 20px;
                    border-radius: 20px;
                    background: #222;
                    color: #fff;
                }

                .feed-section .live-notice hr{
                    flex: 1;
                    border: none;
                    border-top: 1px solid;
                    border-color: #efefef;

                }

                .feed-section .live-notice p{
                    font-size: 13px;
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

                .feed-section .vanishing-point{
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 80px;
                    pointer-events: none;
                    display: none;
                }

                .feed-section .vanishing-point.left{
                    background: linear-gradient(to right, white, transparent);
                    left: 0;
                }
                .feed-section .vanishing-point.right{
                    background: linear-gradient(to left, white, transparent);
                    right: 0;
                }

                .feed-section .inner::-webkit-scrollbar{
                    display: none;
                }

                @media(max-width: 800px){
                    .feed-section .vanishing-point{
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 40px;
                        pointer-events: none;
                    }
                }
                @media(max-width: 500px){
                    .feed-section .vanishing-point{
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        width: 20px;
                        pointer-events: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default LiveFeedSection;
