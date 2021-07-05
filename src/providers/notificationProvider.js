// import moment from 'moment';

import React, { useContext, useEffect, useState } from 'react';

import firebase from '../firebase';
import {useAuth} from './authProvider';
import { useError } from './errorProvider';
import { v4 } from 'uuid';

const NotificationContext = React.createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();
    const {createError} = useError();
    const [unread, setUnread] = useState([]);

    // initializing firestore refs
    const store = firebase.firestore();
    const notificationsRef = store.collection('notifications');
    const watchlistRef = store.collection('watchlist');

    useEffect(() => {
        if(user.uid){
            setLoading(true);
            notificationsRef.where("to", "==", user.uid).onSnapshot(snapChild=>{
                setNotifications(snapChild.docs.map(doc=> doc.data()).reverse() || notifications);
                setUnread(snapChild.docs.filter(doc=> doc.data().read === false).map(item=> item.data()) || unread);
                // on change/updated
                snapChild.docChanges(item=>{
                    setNotifications(item.docs.map(doc=> doc.data()).reverse() || notifications);
                    setUnread(snapChild.docs.filter(doc=> doc.data().read === false).map(item=> item.data()) || unread);
                });
                setLoading(false);
            });
        }
    }, [user]);

    const notifyHold = (productId)=>{
        watchlistRef.where("productId", "==", productId).get()
        .then(result=> {
            const usersToNotify = result.docs.map(doc=> doc.data().userId);
            usersToNotify.forEach(userId=>{
                const isMe = userId === user.uid;
                if(!isMe){
                    const noteId = v4();
                    notificationsRef.doc(noteId).set({
                        createdAt: Date.now(),
                        id: noteId,
                        message: "Someone is holding an item you are watching. Make sure to check your watchlist to verify.",
                        title: "Hold Alert",
                        to: userId,
                        type: "HOLD_ALERT",
                        read: false
                    }).catch(({message})=>{
                        createError(message);
                    })
                }
            });
        })
    }

    const notifyUnheld = (productId)=>{
        watchlistRef.where("productId", "==", productId).get()
        .then(result=> {
            const usersToNotify = result.docs.map(doc=> doc.data().userId);
            usersToNotify.forEach(userId=>{
                const isMe = userId === user.uid;
                if(!isMe){
                    const noteId = v4();
                    notificationsRef.doc(noteId).set({
                        createdAt: Date.now(),
                        id: noteId,
                        message: "Someone just unheld an item you are watching. You have the chance to purchase now, don't waste this opportunity.",
                        title: "Chance Alert",
                        to: userId,
                        type: "HOLD_ALERT",
                        read: false
                    }).catch(({message})=>{
                        createError(message);
                    })
                }
            });
        })
    }

    const markAsRead = (id)=>{
        if(id){
            notificationsRef.doc(id).update({read: true})
            .catch(({message})=>{
                createError(message);
            });
        }else{
            unread.forEach(note=>{
                notificationsRef.doc(note.id).update({ read: true })
                .catch(({message})=>{
                    createError(message);
                })
            })
        }
    }

    const deleteNotification = (id)=>{
        setLoading(true);
        notificationsRef.doc(id).delete()
        .then(_=>{
            // do something here
            setLoading(false);
        }).catch(({message})=>{
            setLoading(false);
            createError(message);
        })
    }

    return (
        <NotificationContext.Provider value={{
            notifications, loading, unread, 
            notifyHold, notifyUnheld, deleteNotification, markAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export default NotificationProvider;
