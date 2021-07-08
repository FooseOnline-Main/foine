import { AiFillCloseCircle, AiFillDownCircle, AiFillUpCircle, AiOutlineCheckSquare, AiOutlineDelete, AiTwotoneCloseCircle } from '@meronex/icons/ai';
import { FaBellSlash } from '@meronex/icons/fa';
import { motion, useMotionValue, useTransform, } from 'framer-motion';
import React, {useRef, useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import { useNotification } from '../providers/notificationProvider';
import EmptyView from './empty_view';

const NotificationPopup = () => {
    const history = useHistory();
    const [showPrompt, setShowPrompt] = useState(false); 
    const {notifications, markAsRead, unread, deleteNotification} = useNotification();

    useEffect(() => {
        setShowPrompt(true);
        setTimeout(()=>setShowPrompt(false), 3000);
    }, []);
    
    return (
        <div className="note-popup">
            <div onClick={history.goBack} className="overlay"></div>
            <div className="inner">
                {notifications.length > 0 && <div className={`promptier ${showPrompt ? 'show' : ''}`}>Slide notification left or right</div>}
                <header>
                    <h3>Notifications</h3>
                    <AiFillCloseCircle onClick={history.goBack} style={{cursor: "pointer"}} size={25} color="#777" />
                </header>
                <div className="items">
                    {notifications.length ? 
                    notifications.map((notification)=> 
                    <NotificationItem data={notification} onDelete={deleteNotification} onMarkRead={markAsRead} />
                    ) 
                    : 
                    <EmptyView message="No notifications available" useIcon={true} icon={<FaBellSlash size={100} color="#ddd"/>} />}
                </div>
            </div>
            <style jsx>{`
                .note-popup{
                    position: fixed;
                    top: 0; left: 0;
                    right: 0; bottom: 0;
                    z-index: 10;
                }

                .note-popup .promptier{
                    position: absolute;
                    z-index: 1;
                    bottom: -60px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-radius: 20px;
                    padding: 10px 20px;
                    font-size: 12px;
                    background: #222;
                    color: #eee;
                    transition: bottom .15s ease-in-out;
                }
                .note-popup .promptier.show{
                    bottom: 20px;
                }

                .note-popup header{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }


                .note-popup .overlay{
                    position: absolute;
                    top: 0; left: 0;
                    right: 0; bottom: 0;
                    background-color: #0000003a;
                    backdrop-filter: blur(1px);
                    -webkit-backdrop-filter: blur(1px);
                    cursor: pointer;
                }

                .note-popup .inner{
                    height: 100%;
                    width: 100%;
                    background: #fff;
                    max-width: 500px;
                    margin-left: auto;
                    animation: slide-in-left .15s ease-out;
                    display: flex;
                    flex-direction: column;
                }

                .note-popup .inner header{
                    border-bottom: 1px solid #eee;
                    padding: 15px 5%;
                    color: #222;
                }

                .note-popup .inner .items{
                    flex: 1;
                    overflow: auto;
                    display: grid;
                    grid-auto-rows: min-content;
                }
            `}</style>
        </div>
    );
}

const NotificationItem = ({data: notification, onDelete: deleteNotification, onMarkRead: markAsRead})=>{
    const x = useMotionValue(50)
    const promise = {delete: false, markRead: false};
    const background = useTransform(
        x, [-50, 50], ["#FF3838", "#222222"])
    const constraintRef = useRef({left: 0, right: 0});
   
    const handleDragEnd = (e, {point: {x: endPoint}}) =>{
        promise.delete && deleteNotification(notification.id);
        promise.markRead && markAsRead(notification.id);
        x.set(0);
    }

    const handleDrag = ({movementX, offsetX})=>{
        if(movementX >= 0){
            x.set(x.get() - offsetX);
            if(offsetX >= 200){
                promise.delete = true;
                promise.markRead = false;
            }else{
                promise.delete = false;
            }
            
        }else{
            x.set(x.get() + offsetX)
            if(offsetX >= 200){
                promise.delete = false;
                promise.markRead = true;
            }else{
                promise.markRead = false;
            }
        }
    }

    const [viewFull, setViewFull] = useState(notification.message.length < 100);

    const reduceMessage = (message)=>{
        if(message && message.length > 100){
            return message.substring(0, 100).concat('...');
        }
        return message
    }

    return <motion.div layout className="wrapper" ref={constraintRef}>
        <motion.div style={{background}} className="back-drop">
            <div>
                <AiOutlineDelete style={{marginRight: 10}} size={25} color="#fff" /><span>Delete</span>
            </div>
            <div>
                <span style={{marginRight: 10}}>{notification.read ? "Marked" : "Mark as read"}</span><AiOutlineCheckSquare size={25} color="#fff" />
            </div>
        </motion.div>
        <motion.div layout drag="x" onDrag={handleDrag} onDragEnd={handleDragEnd} className={`item ${!notification.read ? "unread" : ""}`} dragConstraints={{left: 0, right: 0}}>
            <motion.div className="title-box">
                <motion.h4 className="title">{notification.title}</motion.h4>
                { notification.message.length > 100 ? viewFull ? <AiFillUpCircle size={20} onClick={()=> setViewFull(!viewFull)} style={{cursor: "pointer"}} color="#777" /> : <AiFillDownCircle size={20} onClick={()=> setViewFull(!viewFull)} style={{cursor: "pointer"}} color="#777" /> : <></>}
            </motion.div>
            <motion.p className="message">{viewFull ? notification.message : reduceMessage(notification.message)}</motion.p>
        </motion.div>
        <style jsx>{`
            .wrapper{
                overflow: hidden;
            }
            .wrapper .item{
                padding: 10px 5%;
                background: #fff;
                border-bottom: 1px solid #f5f5f5;
                box-shadow: 0 0 15px 8px #0000001f;
            }

            .wrapper .item.unread{
                background: #f5f5f5;
                border-bottom: 1px solid #efefef;
            }

            .wrapper .back-drop{
                position: absolute;
                top: 0; right: 0;
                bottom: 0; left: 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 5%;
                color: #fff;
            }

            .wrapper .back-drop > *{
                display: flex;
                align-items: center;
                font-size: 12px;
            }

            .wrapper .title-box{
                display: flex;
                justify-content: space-between;
            }

            .wrapper .title{
                font-size: 14px;
            }
            .wrapper .message{
                font-size: 12px;
                opacity: 0.8;
            }
        `}</style>
    </motion.div>
}

export default NotificationPopup;
