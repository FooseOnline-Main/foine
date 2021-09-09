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
    const [action, setAction] = useState(null);
    const resetAction = ()=> setAction(null);

    // OTP SERVICE
    const signal = new window.AbortController();
    setTimeout(()=>{
        signal.abort();
    }, 60 * 1000);

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

    const getOtp = async (callback)=>{
        if('OTPCredential' in window){
            try{
                if(navigator.credentials){
                    try{
                        await navigator.credentials.get({
                            abort: signal, 
                            otp: {transport: ['sms']}
                        })
                        .then(content=> {
                            if(content && content.code){
                                callback(content.code);
                            }
                        })
                    }catch(error){
                        console.log({error})
                    }
                }
            }catch(error){
                console.log({error})
            }
        }
    }

    const notifyHold = (productId)=>{
        watchlistRef.where("productId", "==", productId).get()
        .then(result=> {
            const usersToNotify = result.docs.map(doc=> doc.data().userId);
            console.log(usersToNotify);
            usersToNotify.forEach(userId=>{
                const isMe = userId === user.uid;
                if(!isMe){
                    const noteId = v4();
                    notificationsRef.doc(noteId).set({
                        createdAt: Date.now(),
                        id: noteId,
                        message: "Someone is holding on to an item you added to your cart. Checkout this item and request if you really want it.",
                        title: "Look Sharp! 😨",
                        to: userId,
                        type: "HOLD_ALERT",
                        read: false,
                        other: {
                            productId,
                            link: "/preview-product/"+productId
                        }
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
                        title: "Opportunity Time 🥳",
                        to: userId,
                        type: "HOLD_ALERT",
                        read: false,
                        other: {
                            productId,
                            link: "/preview-product/"+productId
                        }
                    }).catch(({message})=>{
                        createError(message);
                    })
                }
            });
        })
    }

    const notifyPurchaseRequest = (productHolderId, productId, requestId) => {
        if(productHolderId){
            const noteId = v4();
            notificationsRef.doc(noteId).set({
                createdAt: Date.now(),
                id: noteId,
                message: "Someone wants to buy a product you are holding. Would you like to accept this request?",
                title: "New Purchase Request 🎫",
                to: productHolderId,
                type: "PURCHASE_REQUEST",
                read: false,
                other: {
                    productId,
                    link: "/negotiate/"+requestId
                }
            }).catch(({message})=>{
                createError(message);
            })
        }
    }

    const notifyAcceptedRequest = (userId, productId, productName) => {
        const noteId = v4();
        notificationsRef.doc(noteId).set({
            createdAt: Date.now(),
            id: noteId,
            message: `Your request to purchase ${productName} has been accepted by holder. You can now go ahead and purchase with an interest of GH1.00`,
            title: "Purchase Request Accepted 🎉",
            to: userId,
            type: "ACCEPTED_REQUEST",
            read: false,
            other: {
                productId,
                link: "/preview-product/"+productId
            }
        }).catch(({message})=>{
            createError(message);
        })
    }

    const notifyDeniedRequest = (userId, productName) => {
        const noteId = v4();
        notificationsRef.doc(noteId).set({
            createdAt: Date.now(),
            id: noteId,
            message: `Sorry to inform you, but your request to purchase ${productName} has been denied by holder.`,
            title: "Purchase Request Denied 😥",
            to: userId,
            type: "DENIED_REQUEST",
            read: false,
        }).catch(({message})=>{
            createError(message);
        })
    }

    const notifyRequestCheckoutSuccess = (productHolderId, productId, charge) => {
        if(productHolderId){
            const noteId = v4();
            notificationsRef.doc(noteId).set({
                createdAt: Date.now(),
                id: noteId,
                message: `You have gained Ghc ${charge} FOINE TOKEN 🎫 from a successful request checkout. Continue to share more, to gain more!🔥`,
                title: "Request Checkout Success 🥳",
                to: productHolderId,
                type: "SUCCESSFUL_CHECKOUT",
                read: false,
                other: {
                    productId,
                    link: "/preview-product/"+productId
                }
            }).catch(({message})=>{
                createError(message);
            })
        }
    }

    const notifyCancelRequestCheckout = (productHolderId, productId) => {
        if(productHolderId){
            const noteId = v4();
            notificationsRef.doc(noteId).set({
                createdAt: Date.now(),
                id: noteId,
                message: "A requestee cancelled checkout from a product he/she requested from you. Better luck next time.",
                title: "Request Checkout Cancelled 💔",
                to: productHolderId,
                type: "CANCELLED_CHECKOUT",
                read: false,
                other: {
                    productId,
                    link: "/preview-product/"+productId
                }
            }).catch(({message})=>{
                createError(message);
            })
        }
    }

    const markAsRead = (id)=>{
        setAction("mark_as_read")
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
        setAction("delete");
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
            notifications, loading, unread, action, getOtp,
            notifyHold, notifyUnheld, deleteNotification, markAsRead, 
            notifyPurchaseRequest, resetAction, notifyAcceptedRequest,
            notifyDeniedRequest, notifyCancelRequestCheckout, notifyRequestCheckoutSuccess
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export default NotificationProvider;
