import React, { useEffect, Fragment } from 'react';
import { Link, useHistory } from 'react-router-dom';
import '../css/profile.css';
import Loader from './simple_loader';
import { useAuth } from '../providers/authProvider';
import { useWatchlist } from '../providers/watchlistProvider';
import { AiOutlineFileText, AiOutlineInfoCircle, AiOutlineLogout, AiOutlineShoppingCart, AiOutlineStar, AiOutlineUser } from '@meronex/icons/ai';
import { useCheckAuth } from '../hooks/auth';

const ProfilePopup = () => {
    const {user, logout, loading} = useAuth();
    const {watchlist} = useWatchlist();
    const history = useHistory();
    useCheckAuth();


    useEffect(() => {
        document.body.style.overflow = "hidden";
    }, []);

    const handleClose = ()=>{
        document.body.style.overflow = "auto";
        history.replace('/');
    }

    const handleLogout = (e)=>{
        e.preventDefault();
        logout();
    }

    return (
        <div className="profile_popup">
            <div onClick={handleClose} className="close-bg"></div>
            <div className="content">
                <div className="header">
                    <h3>My Profile</h3>
                </div>
                <div className="acc-info">
                    <div className="profile-img">
                        <AiOutlineUser size={30} color="#aaa" />
                    </div>
                    <h3>{user.username}</h3>
                    <p>{user.email}</p>
                </div>
                <div className="option-list">
                    <Link className="option" to="/profile/account">
                        <p>
                            <AiOutlineUser size={20} color="#555" />
                            <b>Account</b>
                        </p>
                    </Link>
                    <Link className="option" to="/watchlist">
                        <p>
                            <AiOutlineShoppingCart size={20} color="#555" />
                            <b>My Cart</b>
                            <span className="tag">{watchlist.length}</span>
                        </p>
                    </Link>
                    <Link className="option" to="/profile/option">
                        <p>
                            <AiOutlineFileText size={20} color="#555" />
                            <b>My Orders</b>
                            <span className="tag">0</span>
                        </p>
                    </Link>
                    <Link className="option" to="/profile/option">
                        <p>
                            <AiOutlineInfoCircle size={20} color="#555" />
                            <b>Help Center</b>
                        </p>
                    </Link>
                    <Link className="option" onClick={handleLogout}>
                        <p><AiOutlineLogout size={20} color="#555" /><b>Logout</b></p>
                    </Link>
                </div>
                {loading ? <Loader expand={true} /> : <Fragment></Fragment>}
            </div>
        </div>
    );
}

export default ProfilePopup;
