import { HiMenuAlt2, HiX } from '@meronex/icons/hi';
import React, { useEffect, useState } from 'react';

const CategoryMenu = ({categories, onChange, onToggleMenu}) => {
    const [selectedId, setSelectedId] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const menuScrollView = document.getElementById('scroll-menu');
        let Menupos = { top: 0, left: 0, x: 0, y: 0 };

        
        const mouseDownHandler = function(e) {
            menuScrollView.style.cursor = 'grabbing';
            menuScrollView.style.userSelect = 'none';
            Menupos = {
                // The current scroll 
                left: menuScrollView.scrollLeft,
                top: menuScrollView.scrollTop,
                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };

            menuScrollView.addEventListener('mousemove', mouseMoveHandler);
            menuScrollView.addEventListener('mouseup', mouseUpHandler);
        };
        menuScrollView.addEventListener('mousedown', mouseDownHandler);

        const mouseMoveHandler = function(e) {
            // How far the mouse has been moved
            const dx = e.clientX - Menupos.x;
            const dy = e.clientY - Menupos.y;

            // Scroll the element
            menuScrollView.scrollTop = Menupos.top - dy;
            menuScrollView.scrollLeft = Menupos.left - dx;
        };

        const mouseUpHandler = function() {
            menuScrollView.style.cursor = 'grab';
            menuScrollView.style.removeProperty('user-select');
            menuScrollView.removeEventListener('mousemove', mouseMoveHandler);
        };
    }, []);

    const selectCategory = (categoryId)=>{
        onChange(categoryId)
        setSelectedId(categoryId);
    }

    return (
        <div className="categories-section">
            <div onClick={()=> { onToggleMenu(!showMenu); setShowMenu(!showMenu);}} className="side-toggler">
                {!showMenu ? <HiMenuAlt2 size={20} color="#555" /> : <HiX size={20} color="#555" />}
            </div>
            <div className='category-menu' id='scroll-menu'>
                <div onClick={()=>selectCategory('')} 
                    className={`item ${selectedId==='' ? 'select' : ''}`}>
                    <pre>All</pre>
                </div>
                {categories.map((category, id)=>{ 
                    return (
                <div key={id} onClick={()=>selectCategory(category.name)} 
                className={`item ${selectedId===category.name ? 'select' : ''}`}
                >
                    <pre>{category.name}</pre>
                    </div>
                    )}
                )}

                <style jsx>{`
                    .categories-section{
                        display: flex;
                        align-items: center;
                    }
                    
                    .side-toggler {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 10px;
                        -webkit-border-radius: 10px;
                        -moz-border-radius: 10px;
                        -ms-border-radius: 10px;
                        -o-border-radius: 10px;
                        min-width: 50px;
                        height: 40px;
                        background: white;
                        box-shadow: 0 0 10px 5px #0000000f;
                        cursor: pointer;
                        transition: all 0.1s;
                        -webkit-transition: all 0.1s;
                        -moz-transition: all 0.1s;
                        -ms-transition: all 0.1s;
                        -o-transition: all 0.1s;
                        display: none;
                        margin-left: 5%;
                    }

                    @media (max-width: 850px) {
                        .side-toggler {
                            display: flex;
                            transform: scale(1);
                            -webkit-transform: scale(1);
                            -moz-transform: scale(1);
                            -ms-transform: scale(1);
                            -o-transform: scale(1);
                        }
                    }
                    .category-menu{
                        padding: 10px 5%;
                        overflow-x: auto;
                        display: flex;
                        align-items: center;
                    }

                    .category-menu::-webkit-scrollbar{
                        height: 3px;
                        background: transparent;
                    }
                    .category-menu::-webkit-scrollbar-thumb{
                        height: 5px;
                        border-radius: 10px;
                        background: #eee;
                    }

                    .category-menu .item{
                        padding: 10px 15px;
                        border-radius: 15px;
                        color: var(--text-color);
                        margin-right: 20px;
                        cursor: pointer;
                        display: flex;
                        font-size: 13px;
                        box-shadow: 0 0 10px #ddd;
                    }
                    @media (max-width: 600px) {
                        .category-menu .item{
                            margin-right: 10px;
                        }
                    }

                    .category-menu .item.select{
                        color: white;
                        background-color: var(--dark-color);
                    }
                `}</style>
            </div>
        </div>
    );
}

export default CategoryMenu;
