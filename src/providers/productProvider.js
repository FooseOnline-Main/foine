// import axios from 'axios';

import React, { useContext, useState } from 'react';

import firebase from '../firebase';
import { useError } from './errorProvider';
import {useNotification} from './notificationProvider';

const ProductsContext = React.createContext();

export function useProducts() {
    return useContext(ProductsContext);
}

//////////// NEXT STEP ///////////////
// Create products for test

export const getStatus = (status)=>{
    let output;
    switch (status) {
        case 0:
            output = {value: "Available", color: "orange"}
            break;
        case 1:
            output = {value: "On Hold", color: "grey"}
            break;
        case 2:
            output = {value: "Sold", color: "red"}
            break;
    
        default:
            output = {value: "In Stock", color: "orange"}
            break;
    }
    return output;
}

function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(false);
    const {createError} = useError();
    const {notifyHold, notifyPurchaseRequest, notifyUnheld} = useNotification();

    const productsRef = firebase.firestore().collection('products');
    const catsRef = firebase.firestore().collection('categories');
    const holdCounterRef = firebase.firestore().collection('holdCounter');

    const fetchProducts = async ()=>{
        setLoading(true);
        // make api call to fetch products from db
        catsRef.get().then(item=>{
            setCategories(item.docs.map(doc=> doc.data()) || []);
        }).catch(({message})=>{
            createError(message);
        })

        productsRef.onSnapshot(snapshot=>{
            setProducts(snapshot.docs.map(doc=> doc.data()) || []);
            setLoading(false);
            snapshot.docChanges(item=>{
                setProducts(item.docs.map(doc=> doc.data()) || []);
            });
        });       
    }

    const getProductById = (id)=>{
        return products.filter(product=> product.id === id)[0];
    }

    const fetchProductById = async (id)=>{
        setLoading(true);
        const prodSnapshot = await productsRef.doc(id).get();
        return prodSnapshot.data();
    }

    const searchProducts = (searchString)=>{
        if(searchString && searchString !== ""){
            return products.filter(product=>
                product.name.toLowerCase().includes(searchString.toLowerCase()) || 
                product.category.toLowerCase().includes(searchString.toLowerCase())
            );
        }
        return products.map(item=> item);
    }

    const getProducts = (category = "") => {
        if(category === ""){
            return products.map(item=> item);
        }
        return products.filter(product=> product.category === category);
    }

    const increaseWatch = (product)=>{
        productsRef.doc(product.id).update({watchCount: (product.watchCount + 1)})
        .catch(error=>{
            createError(error.message, 2000);
        })
    }

    const reduceWatch = (product)=>{
        if(product.watchCount){
            productsRef.doc(product.id).update({watchCount: (product.watchCount - 1)})
            .catch(error=>{
                createError(error.message, 2000);
            })
        }
    }

    const requestPurchase = (userId, product) => {
        if(product && userId){
            productsRef.doc(product.id).update({
                purchaseRequests: [
                    ...product.purchaseRequests, 
                    {
                        userId,
                        accepted: false,
                        interest: 0,
                    }
                ]
            }).then(_=>{
                notifyPurchaseRequest(product.heldBy, product.id);
            }).catch(error=>{
                createError(error.message, 2000);
            })
        }
    }

    const cancelRequestPurchase = (userId, product) => {
        if(product && userId){
            const newProductsRequests = product.purchaseRequests.filter(request=> request.userId !== userId);
            productsRef.doc(product.id).update({
                purchaseRequests: newProductsRequests
            }).catch(error=>{
                createError(error.message, 2000);
            })
        }
    }

    const holdProduct = (userId, product) => {
        const saveHoldData = (holdCount)=>{
            // check if already held before
            product.holders.includes(userId) ? 

            // send warning to user
            createError("Sorry, you can only hold product once") :

            // if never held, allow hold
            productsRef.doc(product.id).update(
                {heldBy: userId, status: 1, holders: [...product.holders, userId]}
            )
            .then(_=>{
                // do something here
                holdCounterRef.doc(userId).update({count: holdCount + 1});
                notifyHold(product.id);
            }).catch(error=>{
                createError(error.message, 2000);
            });
        }

        if(product && userId){
            if(product.status === 0){
                // check if user hold limit is exceeded
                holdCounterRef.doc(userId).get()
                .then((doc)=>{
                    if(doc.exists){
                        if(doc.data().count === 5){
                            // warn user on exceeded hold limit
                            createError("Sorry, you cannot hold more than 5 products at a time")
                        }else{
                            saveHoldData(doc.data().count);
                        }
                    }else{
                        holdCounterRef.doc(userId).set({count: 0});
                        saveHoldData(0);
                    }
                }).catch(({message})=>{
                    createError(message);
                });
            }else{
                createError("Item is being held by someone else!", 3000);
            }            
        }
    }

     const unholdProduct = (userId, product) => {
        if(userId && product){
            // reduce user hold counter
            holdCounterRef.doc(userId).get().then((doc)=>{
                holdCounterRef.doc(userId).update({count: doc.data().count - 1})
            }).catch(({message})=>{
                createError(message);
            });
               
            productsRef.doc(product.id).update({heldBy: "", status: 0, purchaseRequests: []})
            .then(_=>{
                // do something here
                notifyUnheld(product.id);
            }).catch(error=>{
                createError(error.message);
            })
        }
    }

    const markProductsAsSold = (checkoutProducts)=>{
        if(checkoutProducts.length > 0 && checkoutProducts !== null){
            const productIds = checkoutProducts.map(item=> item.id);
            productIds.forEach(id => {
                productsRef.doc(id).update({status: 2})
                .catch(({message})=> createError(message));
            });
        }
    }

    const like = (userId, product)=>{
        let update = {};
        if(product.likes.includes(userId)){
            update = {likes: [...product.likes.filter(id=> id !== userId)]}
        }else{ 
            update = {likes: [...product.likes, userId]} 
        }
        productsRef.doc(product.id).update(update)
        .catch(({message})=>{
            createError(message);
        });
    }
 
    const addToWishList = (userId, product)=>{
        let update = {};
        if(product.wishlist.includes(userId)){
            update = {wishlist: [...product.wishlist.filter(id=> id !== userId)]}
        }else{
            update = {wishlist: [...product.wishlist, userId]}
        }
        productsRef.doc(product.id).update(update)
        .catch(({message})=>{
            createError(message);
        });
    }

    const share = ()=>{
        // implement share functionality
    }

    const comment = (by, message, product)=>{
        productsRef.doc(product.id).update(
            {comments: [{by, comment: message}, ...product.comments]
        }).catch(({message})=>{
            createError(message)
        });
    }
    
    return (
        <ProductsContext.Provider value={{
            products, categories, loading,
            fetchProducts, getProducts, holdProduct, fetchProductById, 
            unholdProduct, markProductsAsSold, searchProducts, requestPurchase,
            cancelRequestPurchase, like, addToWishList, share, getProductById, 
            comment, increaseWatch, reduceWatch
        }}>
            {children}
        </ProductsContext.Provider>
    )
}

export default ProductsProvider;
