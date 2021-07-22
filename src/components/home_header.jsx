import { AiOutlineSearch, AiOutlineUser } from '@meronex/icons/ai';
import React, {Fragment} from 'react';

import { FaBell, FaEye } from '@meronex/icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/authProvider';
import { useNotification } from '../providers/notificationProvider';

const HomeHeader = ({onSearch}) => {
    const {unread} = useNotification();
    const {user} = useAuth();

    const renderAuth = ()=>{
        return <Fragment>
        {!user.isAnonymous ? 
        <Fragment>
            <Link to='/profile' className='profile-button'>
                <AiOutlineUser size={15} color="#eee" />
                <b style={{marginLeft: 5}}>My Profile</b>
            </Link>
        </Fragment> : 
        <Fragment>
            <Link to='/login' className='profile-button auth'>
                <b>Login</b>
            </Link>
            <Link to='/signup' className='profile-button auth'>
                <b><pre>Signup</pre></b>
            </Link>
        </Fragment>}
        <Link to='/watchlist' className='profile-button'>
            <FaEye size={18} color="#eee" />
            <b style={{marginLeft: 5}}>WatchList</b>
        </Link>
        <Link to="/notifications" className='profile-button'>
            <FaBell size={16} color="#eee" />
            {unread.length ? <div className="tag">{unread.length}</div> : <Fragment></Fragment>}
        </Link>
        </Fragment>
    }

    return (
        <div className='home-header'>
            <h4 style={{color: "#fff"}}><pre>FOINE.COM</pre></h4>
            <div className="search-form">
                <AiOutlineSearch size={20} color="#555" />
                <input onChange={({target: {value}})=> onSearch(value)} type="text" placeholder='Search by name or category' aria-placeholder="Search by name or category" className="search-input"/>
            </div>
            {renderAuth()}
            <style jsx>{`
                .home-header{
                    padding: 10px 5%;
                    display: flex;
                    align-items: center;
                    background: #222;
                }

                .home-header .search-form{
                    border-radius: 20px;
                    flex: 1;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    padding: 0 15px;
                    margin: 0 5%;
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
                    color: #ccc;
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

                .profile-button:not(:last-child){
                    margin-right: 20px;
                }

                @media(max-width: 600px){
                    .home-header{
                        margin-bottom: 60px;
                    }
                    .home-header h4{
                        margin-right: auto;
                    }
                    .home-header .search-form{
                        position: absolute;
                        top: calc(100% + 10px);
                        width: 90%;
                        left: 0;
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
