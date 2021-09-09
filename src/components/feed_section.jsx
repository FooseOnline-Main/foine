import React, { useState, useRef } from 'react';
import LiveFeedCard from './feed_card';
import { useProducts } from '../providers/productProvider';
import {  MdcChevronDoubleUp, MdcCloseOutline, MdcFilterOutline, MdcHumanFemale, MdcHumanMale } from '@meronex/icons/mdc';

const LiveFeedSection = () => {
    const {products, fetchProducts, loading} = useProducts();
    const [showHelpers, setShowHelpers] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [expanded, setExpanded] = useState("");
    const scrollTopRef = useRef();

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
                .feed-section .loader-area{
                    min-height: 100px;
                    display: flex;
                    align-items:center;
                    justify-content: center;
                    column-gap: 10px;
                }
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

                @media(max-width: 450px){
                    .feed-section > .inner{
                        columns: 1;
                        padding: 10px 2%;
                    }
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
                    width: 50px;
                    height: 50px;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    box-shadow: 0 0 10px 2px #00000010;
                    overflow: visible;
                    color: #222;
                    cursor: pointer;
                    opacity: 0;
                }

                #helpers.show > div{
                    opacity: 1;
                    animation: popin .25s ease-in-out;
                    -webkit-animation: popin .25s ease-in-out;
                }

                @keyframes popin{
                    0%{ transform: scale(0.5); opacity: 0; }
                    50%{ transform: scale(1.2) }
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
                box-shadow: 0 0 10px 5px#00000005;
                cursor: pointer;
            }
        `}</style>
    </div>
}

export default LiveFeedSection;
