import '../css/notifications.css';

import { AiFillCloseCircle, AiFillDelete, AiFillDownCircle, AiFillUpCircle } from '@meronex/icons/ai';
import {FaBell, FaBellSlash} from '@meronex/icons/fa';
import React, {useEffect, useState} from 'react';

import {BiBell} from '@meronex/icons/bi';
import EmptyView from './empty_view';
import Loader from './simple_loader';
import { useNotification } from '../providers/notificationProvider';
import { useHistory } from 'react-router-dom';

// vercel push
const FloatNotifications = ({quickOpen}) => {
    const [show, setShow] = useState(false);
    const [holdOn, setHoldOn] = useState(false);
    const [quickNote, setQuickNote] = useState(null);
    const {notifications, unread, deleteNotification, loading} = useNotification();
    const history = useHistory();

    useEffect(() => {
        setQuickNote(unread.reverse()[0] || null);
        const quicknotetimeout = setTimeout(()=>setQuickNote(null), 3000);
        return ()=>{
            clearTimeout(quicknotetimeout);
        }
    }, [unread]);

    useEffect(() => {
        document.addEventListener("mousemove", mousemoveEvent);

        function mousemoveEvent({clientX}){
            if(clientX >= window.innerWidth - (window.innerWidth*0.1)){
                return setShow(true)
            }
            setShow(false);
        }

        return ()=>{
            document.removeEventListener("mousemove", mousemoveEvent)
        }
    }, []);

    useEffect(() => {
        if(quickOpen)
            setHoldOn(true);
    }, [quickOpen]);

    const closeNotifications = ()=>{
        history.replace('/');
        document.querySelector('.notification-list').classList.add('hide');
        setTimeout(()=>{
            document.querySelector('.notification-list').classList.remove('hide');
            setHoldOn(false);
        }, 120)
    }

    const toggleShow = ()=>{
        if(holdOn){
             closeNotifications()
        } else {
            setHoldOn(true)
        }
    }

    return (
        <div className={`notifications ${holdOn || show ? "show" : ""}`}>
            <div onClick={toggleShow} className="bubble-btn">
                <FaBell size={18} color="#222" />
                {unread.length < 1 ? <></> : <div className="tag">{unread.length}</div>}
            </div>
            {holdOn ? <div className="notification-list">
                <header>
                    <h5 style={{fontSize: 14}}>Notifications</h5>
                    {/* <div className="tag">{notifications.length}</div> */}
                    <AiFillCloseCircle onClick={closeNotifications} size={20} color="#bbb" style={{marginLeft: "auto", cursor: "pointer"}} />
                </header>
                <div className="content">
                    {notifications.length < 1 ? <EmptyView message="No notifications available" useIcon={true} icon={<FaBellSlash size={60} color="#ddd"/>} /> : notifications.map(item=> <NotificationItem key={item.id} notification={item} onDelete={()=>deleteNotification(item.id)} />) }
                </div>
                {loading ? <Loader /> : <></>}
            </div> : <></>}
            <div className={`quick-message ${quickNote !== null ? 'show' : ''}`}>
                <figure>
                    <BiBell size={30} color="#ccc" />
                </figure>
                <div className="info">
                    {quickNote ? <><h4>{quickNote.title}</h4>
                    <p>{quickNote.message}</p></> : <></>}
                </div>
            </div>
        </div>
    );
}

const NotificationItem = ({notification, onDelete})=>{
    const [open, setOpen] = useState(false);
    const {markAsRead} = useNotification();

    useEffect(() => {
        if(notification.message.length <= 50){
            markAsRead(notification.id);
        }
    }, []);
    
    const reduceMessage = ()=>{
        if(notification.message && notification.message.length > 50){
            return notification.message.substring(0, 50).concat('...');
        }
    }

    const handleOpen = ()=>{
        markAsRead(notification.id);
        setOpen(!open)
    }

    return <div className={`item ${notification.read ? '' : 'unread'}`}>
        <header>
            <h5 style={{fontSize: "12px"}}>{notification.title}</h5>
            <div className="actions">
                {notification.message.length > 50 ? 
                open ? <AiFillUpCircle onClick={handleOpen} size={20} style={{cursor: "pointer"}} color="#aaa" /> : <AiFillDownCircle onClick={()=>setOpen(!open)} size={20} style={{cursor: "pointer"}} color="#aaa" /> 
                : <></>}
                <AiFillDelete onClick={onDelete} style={{marginLeft: 8, cursor: "pointer"}} size={17} color="#ff000077" />
            </div>
        </header>
        <p style={{fontSize: "11px", color: "#777", fontWeight: "500"}}>
            {notification.message.length > 50 ? open ? notification.message : reduceMessage() : notification.message}
        </p>
    </div>
}

export default FloatNotifications;
