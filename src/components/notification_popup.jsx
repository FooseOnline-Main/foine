import React, {useRef, useEffect, useState, Fragment} from 'react';
import { motion, useMotionValue, useTransform, } from 'framer-motion';
import { Link, useHistory } from 'react-router-dom';
import { useNotification } from '../providers/notificationProvider';
import EmptyView from './empty_view';
import { FaBellSlash } from '@meronex/icons/fa';
import { FiBell } from '@meronex/icons/fi';
import { AiFillCloseCircle, AiFillDownCircle, AiFillUpCircle, AiOutlineCheckSquare, AiOutlineDelete } from '@meronex/icons/ai';
import { useProducts } from '../providers/productProvider';

const NotificationPopup = () => {
    const history = useHistory();
    const [showPrompt, setShowPrompt] = useState(false); 
    const {notifications, markAsRead, /*unread,*/ deleteNotification} = useNotification();

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
                    <AiFillCloseCircle onClick={history.goBack} style={{cursor: "pointer"}} size={25} color="#eee" />
                </header>
                <div className="items">
                    {notifications.length ? 
                    notifications.map((notification, key)=> 
                    <NotificationItem data={notification} key={key} onDelete={deleteNotification} onMarkRead={markAsRead} />
                    ) 
                    : 
                    <EmptyView message="No notifications available" useIcon={true} icon={<FiBell size={100} color="#ddd"/>} />}
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
                    background-color: #000000aa;
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    cursor: pointer;
                }

                .note-popup .inner{
                    height: 100%;
                    width: 100%;
                    background: transparent;
                    max-width: 500px;
                    margin: 0 auto;
                    animation: slide-in-left .15s ease-out;
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(to right bottom, #ffffff10, #ffffff20);
                }

                .note-popup .inner header{
                    padding: 15px 5%;
                    color: #fff;
                    font-size: 15px;
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
    const {getProductById} = useProducts();
    const promise = {delete: false, markRead: false};
    const background = useTransform(
        x, [-50, 50], ["#FF383800", "#22222200"])
    const constraintRef = useRef({left: 0, right: 0});
    const hasLink = notification.other && notification.other.link;
    const product = notification.other && getProductById(notification.other.productId || "");
       
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
            <div className="icon">
                {product ? <img src={product.imageUrl} /> : <FiBell size={30} />  }
            </div>
            <div className="details">
                <motion.div className="title-box">
                    {hasLink ? 
                    <Link to={notification.other.link} className="title">{notification.title}</Link> : 
                    <motion.h4 className="title">{notification.title}</motion.h4>
                    }
                    { notification.message.length > 100 ? viewFull ? <AiFillUpCircle size={20} onClick={()=> setViewFull(!viewFull)} style={{cursor: "pointer"}} color="#777" /> : <AiFillDownCircle size={20} onClick={()=> setViewFull(!viewFull)} style={{cursor: "pointer"}} color="#777" /> : <Fragment></Fragment>}
                </motion.div>
                {hasLink ? 
                    <Link to={notification.other.link} className="message">{viewFull ? notification.message : reduceMessage(notification.message)}</Link> : 
                    <motion.p className="message">{viewFull ? notification.message : reduceMessage(notification.message)}</motion.p>
                }
            </div>
        </motion.div>
        <style jsx>{`
            .wrapper{
                overflow: hidden;
                padding: 5px 10px;
            }
            .wrapper .item{
                padding: 10px;
                background: #fff;
                display: flex;
                column-gap: 10px;
                border-radius: 10px;
            }

            .wrapper .item .icon{
                padding: 0 10px;
            }

            .wrapper .item .details{
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .wrapper .item img{
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 10px;
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
                align-self: stretch;
                padding-bottom: 5px;
            }

            .wrapper .title{
                font-size: 13px;
                color: #222;
                font-weight: bold;
            }
            .wrapper .message{
                font-size: 12px;
                opacity: 0.8;
                color: #555;
            }
        `}</style>
    </motion.div>
}

export default NotificationPopup;
