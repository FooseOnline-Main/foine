import React, { useContext, useState, useEffect } from 'react';
import { v4 } from 'uuid';
import { requestHoldProduct } from '../api';

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
    const {notifyHold, notifyPurchaseRequest, notifyAcceptedRequest, notifyDeniedRequest, notifyUnheld} = useNotification();

    const productsRef = firebase.firestore().collection('products');
    const catsRef = firebase.firestore().collection('categories');
    const holdCounterRef = firebase.firestore().collection('holdCounter');
    const purchaseReqRef = firebase.firestore().collection('purchaseRequests');

    useEffect(()=>{
        catsRef.get().then(item=>{
            setCategories(item.docs.map(doc=> doc.data()) || []);
        }).catch(({message})=>{
            createError(message);
        })
        fetchProducts();
    }, [])

    const fetchProducts = async ()=>{
        setLoading(true);
        // make api call to fetch products from db
        if(products.length < 1){
            productsRef
            .orderBy("created_at")
            .limit(5)
            .onSnapshot(snapshot=>{
                setLoading(false);
                setProducts(()=> snapshot.docs.map(doc=> doc.data()) || []);
                snapshot.docChanges(item=>{
                    setProducts(()=>item.docs.map(doc=> doc.data()) || []);
                });
            });       
        }else{
            productsRef
            .orderBy("created_at")
            .startAfter(products[products.length - 1].created_at)
            .limit(5)
            .onSnapshot(snapshot=>{
                setLoading(false);
                if(snapshot.docs){
                    const resultProducts = []
                    snapshot.docs.forEach(doc=> {
                        const product = doc.data();
                        if(!products.includes(product)){
                            resultProducts.push(product)
                        }
                    });
                    
                    setProducts(()=> [...products, ...resultProducts]);
                    snapshot.docChanges(item=>{
                        setProducts(item.docs.map(doc=> doc.data()) || []);
                    });
                }
            });  
        }
    }

    const getProductById = (id)=>{
        return products.filter(product=> product.id === id)[0];
    }

    const fetchProductById = async (id)=>{
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

    const getRequestById = (reqId)=>{
        return purchaseReqRef.doc(reqId).get().then(res=> res.data());
    }

    const requestPurchase = (userId, product) => {
        if(product && userId){
            const requestId = v4();
            purchaseReqRef.doc(requestId)
            .set({
                id: requestId,
                productId: product.id,
                requestee: userId,
                holder: product.heldBy,
                accepted: false
            }).then(_=>{
                notifyPurchaseRequest(product.heldBy, product.id, requestId);
            }).catch(error=>{
                createError(error.message, 2000);
            })
        }
    }

    const acceptPurchaseRequest = (product, charge, reqId, callback=()=>{})=>{
        let request = purchaseReqRef.doc(reqId).get().then(res=> res.data());
        purchaseReqRef.doc(reqId).update({charge, accepted: true})
        .then(_=>{
            notifyAcceptedRequest(request.userId, product.id, product.name);
            callback()
        }).catch(({message})=>{
            createError(message, 2000)
        });
    }

    const denyPurchaseRequest = (product, requestId, callback=()=>{})=>{
        let request = purchaseReqRef.doc(requestId).get().then(res=> res.data());
        purchaseReqRef.doc(requestId).delete()
        .then(_=>{
            notifyDeniedRequest(request.userId, product.name);
            callback();
        }).catch(({message})=>{
            createError(message, 2000)
        });
    }

    const cancelRequestPurchase = (userId, product) => {
        if(product && userId){
            const request = purchaseReqRef
            .where("userId", "==", userId)
            .where("productId", "==", product.id)
            .get()
            .then(res=> res.docs()[0])
             
            purchaseReqRef.doc(request.id)
            .delete()
        }
    }

    const holdProduct = async (userId, product) => {
        const {data} = await requestHoldProduct({userId, product});
        
        if(data.status){
            notifyHold(product.id);
        }else{
            createError(data.message);
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
                productsRef.doc(id).update({
                    status: 2, holders: [], watchCount: 0, heldBy: ""
                })
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
            comment, increaseWatch, reduceWatch, getRequestById, acceptPurchaseRequest,
            denyPurchaseRequest
        }}>
            {children}
        </ProductsContext.Provider>
    )
}

export default ProductsProvider;