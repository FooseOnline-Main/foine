import '../css/notifications.css';
import React, {useEffect, useState, Fragment} from 'react';
import {BiBell} from '@meronex/icons/bi';
import { useNotification } from '../providers/notificationProvider';
import { useProducts } from '../providers/productProvider';
import {motion} from 'framer-motion';
import { Link } from 'react-router-dom';

// vercel push
const FloatNotifications = () => {
    const [quickNotes, setQuickNotes] = useState([]);
    const {unread, action, resetAction} = useNotification();

    useEffect(() => {
        if(quickNotes.length >= 3){
            setQuickNotes([{
                type: "ALL_NOTIFICATIONS", 
                title: "New Notifications",
                message: `You have ${unread.length} new notifications. 
                Open notifications to check them out`,
                other: {link: '/notifications'
                },
            }]);
        }else{
            if(unread.length > 0 && action === null){
                setTimeout(()=>{
                    setQuickNotes([unread.reverse()[0], ...quickNotes]);
                }, 400);
            }else{
                resetAction();
            }
        }
    }, [unread]);

    const removeQuickNote = (note)=>{
        setQuickNotes(quickNotes.filter(item=> item !== note));
    }

    return (
        <div className="quick-notifications">
            {quickNotes.map((note, id)=>
                <QuickNote key={id} note={note} onRemoveNote={removeQuickNote} />
            )}
        </div>
    );
}

const QuickNote = ({note, onRemoveNote})=>{
    const [holdOn, setHoldOn] = useState(true);
    const [timeout, setQuickTimeout] = useState(null);
    const {getProductById} = useProducts();

    useEffect(() => {
        setQuickTimeout(setTimeout(()=>{
            setHoldOn(false);
            onRemoveNote(note);
        }, 3000));

        return ()=>{
            clearTimeout(timeout);
        }
    }, []);

    const handleRemove = ()=>{
        setQuickTimeout(setTimeout(()=> {
            setHoldOn(false); 
            onRemoveNote(note);
        }, 3000))
    }

    const renderIconImageSide = ()=>{
        if(note.type === "PURCHASE_REQUEST"){
            const product = getProductById(note.other.productId);
            return <img src={product.imageUrl} alt={product.name} />
        }else{
            return <figure>
                <BiBell size={30} color="#ccc" />
            </figure>
        }
    }

    return (
        <motion.div layout={true}
            onMouseOver={()=>clearTimeout(timeout)} 
            onMouseOut={handleRemove}
            className={`quick-message ${holdOn ? 'show' : ''}`}
        >
            {renderIconImageSide()}
            <div className="info">
                {note ? <Fragment><h4>{note.title}</h4>
                <p>{note.message}</p></Fragment> : <Fragment></Fragment>}
                {note.other && note.other.link ? <div className="links-box">
                    <Link to={note.other.link}>Check Now</Link>
                </div> : <Fragment></Fragment>}
            </div>
        </motion.div>
    )
}

export default FloatNotifications;
