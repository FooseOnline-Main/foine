import { AiOutlineSearch } from '@meronex/icons/ai';
import React, {Fragment} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/authProvider';
import { useNotification } from '../providers/notificationProvider';
import { MdcAccountCircleOutline, MdcAccountOutline, MdcBell, MdcCartOutline, MdcChevronDown } from '@meronex/icons/mdc';

const HomeHeader = ({onSearch}) => {
    const {unread} = useNotification();
    const {user} = useAuth();

    const renderAuth = ()=>{
        return <Fragment>
        <Link to="/notifications" className='profile-button'>
            <MdcBell size={22} color="#555" />
            {unread.length ? <div className="tag">{unread.length}</div> : <Fragment></Fragment>}
        </Link>
        {user.isAnonymous ? 
        <button className='profile-button'>
            <MdcAccountCircleOutline size={25} color="#555" />
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
        </Fragment>
        }
        
        </Fragment>
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
            {renderAuth()}
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
                        display: none;
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
                    border-radius: 10px;
                    z-index: 10;
                    min-width: 100px;
                    overflow: hidden;
                }

                .profile-button:focus .drop-down,
                .profile-button .drop-down:hover{
                    opacity: 1;
                    pointer-events: all;
                    transform: translateY(0px);
                }

                .profile-button .drop-down .item{
                    padding: 10px 10px;
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
                    border: 2px solid #222;
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
                    .profile-button:not(:last-child){
                        margin-right: 15px;
                    }
                }
            `}</style>
        </div>
    );
}

export default HomeHeader;
