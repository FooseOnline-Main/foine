import React, { useState, useContext } from 'react';
import { useEffect } from 'react';
import { app } from '../feathers';
import firebase from '../firebase';
import { useAuth } from './authProvider';
import { useError } from './errorProvider';

const WatchlistContext = React.createContext();

export function useWatchlist() {
    return useContext(WatchlistContext);
}

function WatchlistProvider({ children }) {
    const [watchlist, setWatchlist] = useState([]);
    const [checkOut, setCheckOut] = useState([]);
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();
    const {createError} = useError();

    const watchlistService = app.service("watchlist");

    useEffect(() => {
        getWatchlist(user.uid);
        watchlistService.on("updated", ()=>getWatchlist(user.uid));
        watchlistService.on("deleted", ()=>getWatchlist(user.uid));
        return () => {};
    }, []);

    const isWatching = (prodId)=>{
        let output = false;
        watchlist.forEach(item=> {
            if(item.productId === prodId){
                output = true;
            }
        });
        return output;
    }

    const getWatchlist = (userId)=>{
        if(userId){
            watchlistService.find({query: {userId}})
            .then(({data})=>{
                setWatchlist(data || [])
                setCheckOut(data.map(item=> item.productId) || [])
            }).catch(({message})=>{
                createError(message);
            });
        }
    }

    const addToWatchlist = (key, itemId)=>{
        if(itemId != null && !watchlist.includes(itemId)){
            const newWatch = {userId: key, productId: itemId};
            watchlistService.create(newWatch);
        }
    }

    const removeFromWatchlist = (prodId)=>{
        setLoading(true);
        const watchId = watchlist.filter(item=> item.productId === prodId)[0]._id;
        if(watchId && watchlist.length > 0){
            watchlistService.remove(watchId);
        }
    }

    const removeFromCheckout = (id)=>{
        const newCheckoutList = checkOut;
        setCheckOut(newCheckoutList.filter(index=> index !== id));
    }

    const addToCheckout = (id)=>{
        const newCheckoutList = checkOut;
        newCheckoutList.push(id);
        setCheckOut(newCheckoutList.map(item=> item));
    }

    const clearCheckedOut = ()=>{
        // remove checkedout watchlist items
        watchlist.forEach(item=> {
            if(checkOut.includes(item.productId)){
                watchlistService.remove(item._id);
            }
        });
    }

    return (
        <WatchlistContext.Provider value={{
            watchlist, loading, checkOut,
            addToWatchlist, removeFromWatchlist, 
            removeFromCheckout, addToCheckout,
            clearCheckedOut, getWatchlist, isWatching
        }}>
            {children}
        </WatchlistContext.Provider>
    )
}

export default WatchlistProvider;
