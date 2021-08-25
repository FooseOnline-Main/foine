import React, { useState, useContext } from 'react';
import { v4 } from 'uuid';
import { confirmOTP, pay } from '../api';
import firebase from '../firebase';
import { useError } from './errorProvider';

const WatchlistContext = React.createContext();

export function useWatchlist() {
    return useContext(WatchlistContext);
}

function WatchlistProvider({ children }) {
    const [watchlist, setWatchlist] = useState([]);
    const [checkOut, setCheckOut] = useState([]);
    const [quickCheckout, setQuickCheckout] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checkoutItem, setCheckoutItem] = useState(null);
    const {createError} = useError();

    const watchlistRef = firebase.firestore().collection('watchlist');
    const tempCheckoutRef = firebase.firestore().collection('tempCheckout');

    const isWatching = (prodId)=>{
        let output = false;
        watchlist.forEach(item=> {
            if(item.productId === prodId){
                output = true;
            }
        });
        return output;
    }

    const getWatchlist = (key)=>{
        setLoading(true);
        if(key){
            watchlistRef.where("userId", "==", key).onSnapshot(snapshot=>{
                setWatchlist(snapshot.docs.map(doc=> doc.data()))
                setCheckOut(snapshot.docs.map(doc=> doc.data().productId))
                const result = snapshot.docs.filter(doc=> doc.data().expired)
                setQuickCheckout(result.map(doc=> doc.data()))
            })
        }
    }

    const addForQuickCheckout = (userId, productId)=>{
        if(productId && userId){
            watchlistRef
            .where("userId", "==", userId)
            .where("productId", "==", productId)
            .get()
            .then(res=>{
                const item = res.docs[0];
                if(item){
                    setQuickCheckout([item.data()]);
                }
            })
        }
    }

    const emptyQuickCheckout = ()=> setQuickCheckout([])

    const addToWatchlist = (key, itemId)=>{
        setLoading(true);
        if(itemId && !watchlist.includes(itemId)){
            const docId = v4();
            const newWatch = {id: docId, userId: key, productId: itemId};
            watchlistRef.doc(docId).set(newWatch)
            .then(_=>{
                setLoading(false);
            })
            .catch(({message})=>{
                createError(message);
                setLoading(false);
            })
        }
    }

    const removeFromWatchlist = (prodId)=>{
        setLoading(true);
        const watchId = watchlist.filter(item=> item.productId === prodId)[0].id;
        if(watchId && watchlist.length > 0){
            watchlistRef.doc(watchId).delete()
            .then(_=>{
                setLoading(false);
            })
            .catch(({message})=>{
                setLoading(false);
                createError(message);
            })
        }
    }
    
    const addToCheckout = (id)=>{
        const newCheckoutList = checkOut;
        newCheckoutList.push(id);
        setCheckOut(newCheckoutList.map(item=> item));
    }

    const removeFromCheckout = (id)=>{
        const newCheckoutList = checkOut;
        setCheckOut(newCheckoutList.filter(index=> index !== id));
    }

    const makePayment = async (formData, userId, {id, imageUrl, price})=>{
        if(formData){
            const {watchId, username, delivery, amount, provider, phone} = formData;
            const temp = {
                watchId, 
                delivery,
                userDetails: {id: userId, username, phone},
                product: {id, imageUrl, price},
                amount,
            };

            const {status, data} = await pay({provider, phone, amount});

            if(status){
                tempCheckoutRef.doc(watchId).set({...temp, reference: data.reference});
                return data.status;
            }
        }
    }

    const verifyOTP = async (otp, watchId, userId)=>{
        if(otp){
            if(watchId){
                const exists = await tempCheckoutRef.doc(watchId).get();
                
                if(exists){
                    const {status, data} = await confirmOTP(otp, exists.reference);
                    return status ? data.status : "";
                }
            }else{
                return tempCheckoutRef
                .where("userId", "==", userId)
                .get()
                .then(async res=> {
                    const doc = res.docs[0];

                    if(doc){
                        const {status, data} = await confirmOTP(otp, doc.data().reference);
                        return status ? data.status : "";
                    }
                })
            }
        }
    }

    const clearCheckedOut = ()=>{
        // remove checkedout watchlist items
        watchlist.forEach(item=> {
            if(checkOut.includes(item.productId)){
                watchlistRef.doc(item.id).delete()
                .catch(error=> {
                    console.log(error);
                })
            }
        });
    }

    return (
        <WatchlistContext.Provider value={{
            watchlist, loading, checkOut, quickCheckout,
            addToWatchlist, removeFromWatchlist, emptyQuickCheckout,
            removeFromCheckout, addToCheckout, addForQuickCheckout,
            clearCheckedOut, getWatchlist, isWatching, makePayment, verifyOTP
        }}>
            {children}
        </WatchlistContext.Provider>
    )
}

export default WatchlistProvider;