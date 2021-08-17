import React, { useEffect, useState, useRef } from 'react';

import LiveFeedCard from './feed_card';
import { useProducts } from '../providers/productProvider';
import Loader from './simple_loader';
import { AiOutlineSearch } from '@meronex/icons/ai';
import {  MdcChevronDoubleUp, MdcCloseOutline, MdcFilterOutline, MdcHumanFemale, MdcHumanMale } from '@meronex/icons/mdc';

const LiveFeedSection = () => {
    const {products, fetchProducts, loading} = useProducts();
    const [showHelpers, setShowHelpers] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [expanded, setExpanded] = useState("");
    const scrollTopRef = useRef();
    
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
        scrollTop > 100 ? setShowScroll(true) : setShowScroll(false);

        if(!showHelpers){
            setShowHelpers(true);
            setTimeout(()=> setShowHelpers(false), 2000);
        }
    }

    return (
        <div className='feed-section' onScroll={handleFeedScroll} id="scroll-feed">
            <div className={`inner ${showFilters ? "shift" : ""}`}>
                <div ref={scrollTopRef}></div>
                {products.map((feed, id)=>(<LiveFeedCard expanded={expanded === id} onExpand={()=>setExpanded(id)} feed={feed} key={id} />))}
            </div>
            <FilterBox show={showFilters} />

            {loading && <div style={{minHeight: "100px"}}><Loader expand={false} /></div>}
            <div id="helpers" className={`${showHelpers || showFilters ? "show" : ""}`}>
                {showScroll && <div onClick={()=>scrollTopRef.current.scrollIntoView({behavior: "smooth"})} data-label="Scroll to top">
                    <MdcChevronDoubleUp size={25} />
                </div>}
                <div data-label="For Females">
                    <MdcHumanFemale size={25} />
                </div>
                <div data-label="For Males">
                    <MdcHumanMale size={25} />
                </div>
                <div data-label={showFilters ? "Close" : "Filter"} onClick={()=>setShowFilters(!showFilters)} className="filter">
                    {showFilters ? <MdcCloseOutline size={25} /> : <MdcFilterOutline size={25} />}
                </div>
            </div>
            <style jsx>{`
                .feed-section{
                    max-width: 100%;
                    height: 100%;
                    overflow: auto;
                    background: #fafafa;
                    --space-x: 2.5%;
                }
                .feed-section > .inner{                   
                    padding: 20px var(--space-x);
                    display: column;
                    columns: 4;
                    column-gap: var(--space-x);
                    transition: all .25s ease-out;
                }
                .feed-section > .inner.shift{
                    transform: translateX(-250px);
                }

                @media(max-width: 1000px){
                    .feed-section > .inner{
                        columns: 3;
                    }
                }

                @media(max-width: 650px){
                    .feed-section > .inner{
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

                #helpers{
                    position: fixed;
                    bottom: 50px;
                    right: -100%;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: all .25s ease-in-out;
                }

                #helpers.show, #helpers:hover{
                    right: 2.5%;
                }

                #helpers > div{
                    width: 40px;
                    height: 40px;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    box-shadow: 0 0 10px 2px #00000010;
                    overflow: visible;
                    color: #222;
                    cursor: pointer;
                }
                #helpers > div:not(:last-child){
                    margin-bottom: 10px;
                }

                #helpers > div::before{
                    content: attr(data-label);
                    position: absolute;
                    right: 110%;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 5px 10px;
                    border-radius: 10px;
                    font-size: 12px;
                    background: inherit;
                    color: inherit;
                    opacity: 0;
                    pointer-events: none;
                    transition: all .15s linear;
                    max-width: 200px;
                    white-space: nowrap;
                }
                #helpers > div:hover::before{ opacity: 1; }

                @keyframes glow-scale{
                    100%{
                        transform: scale(2.2);
                        opacity: 0;
                    }
                }

                #scroll-feed::-webkit-scrollbar{display: none}

            `}</style>
        </div>
    );
};

const FilterBox = ({onFilter, show})=>{
    return <div className={`filter-box ${show ? "show" : ""}`}>
        <h4>Filter By</h4>
        <div className="filter">Recently Added</div>
        <div className="filter">Sold Items</div>
        <div className="filter">On Hold</div>
        <div className="filter">Most Watched</div>
        <div className="filter">Available Items</div>
        <div className="filter">Most Commented</div>
        <style jsx>{`
            .filter-box{
                position: fixed;
                right: -250px;
                top: 60px;
                bottom: 0;
                width: 250px;
                transition: all .25s ease-out;
                padding: 20px;
            }

            .filter-box.show{
                right: 0px;
            }

            .filter-box .filter{
                font-size: 12px;
                padding: 10px;
                border-radius: 10px;
                margin-top: 10px;
                background: #fff;
                box-shadow: #00000005;
            }
        `}</style>
    </div>
}

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
