// import axios from 'axios';

import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import { v4 } from 'uuid';
import { app } from '../feathers';
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
    // feathers services
    const productService = {
        categories: app.service('categories'),
        products: app.service('products'),
        comments: app.service('/product/comments'),
        holders: app.service('/product/holders')
    };

    // provider state
    const {createError} = useError();
    const [loading, setLoading] = useState(false);
    const {notifyHold, notifyPurchaseRequest, notifyAcceptedRequest, notifyDeniedRequest, notifyUnheld} = useNotification();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
        
    // firebase references
    const productsRef = firebase.firestore().collection('products');
    // const catsRef = firebase.firestore().collection('categories');
    // const holdCounterRef = firebase.firestore().collection('holdCounter');
    
    useEffect(async () => {
        // fetch products and categories
        fetchProducts();
        productService.categories.find().then(({data})=> setCategories(data));

        // add listener to product service
        productService.products.on("updated", fetchProducts)
        return () => {};
    }, []);

    const fetchProducts = async (skip)=>{
        setLoading(true);
        const limit = (skip || 0) + 8;
        // console.log(`Skipping ${skip} products and fetching ${limit}`);
        productService.products.find({query: {$limit: limit, $skip: skip || 0}})
        .then(({data})=> {
            setLoading(false);
            setProducts([...products, ...data])
        });
    }

    const getProductById = async (id)=>{
        const product = products.filter(product=> product._id === id)[0];
        const comments = await getProductComments(id);

        return {...product, comments};
    }

    const fetchProductById = async (id)=>{
        setLoading(true);
        const product = await productService.products.get(id);
        const comments = await getProductComments(id);

        return {...product, comments};
    }

    const getProductComments = async (productId)=>{
        const {data} = await productService.comments.find({query: {productId}});
        return data;
    }

    const getProductByReqId = (reqId)=>{
        // Do something here
        let output = null;
        products.forEach(product=> {
            product.purchaseRequests.forEach(request=>{
                if(request.id === reqId){
                    output = product;
                }
            })
        });
        return output;
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
        // productsRef.doc(product.id).update({watchCount: (product.watchCount + 1)})
        productService.products.update(product._id, {...product, watchCount: (product.watchCount + 1)})
        .catch(error=>{
            createError(error.message, 2000);
        })
    }

    const reduceWatch = (product)=>{
        if(product.watchCount){
            // productsRef.doc(product.id).update({watchCount: (product.watchCount - 1)})
            productService.products.update(product._id, {...product, watchCount: (product.watchCount - 1)})
            .catch(error=>{
                createError(error.message, 2000);
            })
        }
    }

    const requestPurchase = (userId, product) => {
        if(product && userId){
            const requestId = v4();
            productsRef.doc(product.id).update({
                purchaseRequests: [
                    ...product.purchaseRequests, 
                    {
                        id: requestId,
                        userId,
                        accepted: false,
                        interest: 0,
                    }
                ]
            }).then(_=>{
                notifyPurchaseRequest(product.heldBy, product.id, requestId);
            }).catch(error=>{
                createError(error.message, 2000);
            })
        }
    }

    const acceptPurchaseRequest = (product, requestId)=>{
        let request = product.purchaseRequests.filter(req=> req.id === requestId)[0];
        request = {...request, interest: 1, accepted: true};
        productsRef.doc(product.id).update({purchaseRequests: [request]})
        .then(_=>{
            notifyAcceptedRequest(request.userId, product.id, product.name);
        }).catch(({message})=>{
            createError(message, 2000)
        });
    }

    const denyPurchaseRequest = (product, requestId)=>{
        const request = product.purchaseRequests.filter(req=> req.id === requestId)[0];
        productsRef.doc(product.id).update({
            purchaseRequests: product.purchaseRequests.filter(req=> req.id !== requestId)
        })
        .then(_=>{
            notifyDeniedRequest(request.userId, product.name);
        }).catch(({message})=>{
            createError(message, 2000)
        });
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

    const holdProduct = async (userId, product) => {
        if(product && userId){
            if(product.status === 0){
                // monitize user hold count
                let canHold = true;
                const holders = (()=> {
                    if(product.holders){
                        if(!product.holders.includes(userId)){
                            return product.holder + `, ${userId}`;
                        }else{
                            canHold = false;
                        }
                    }else{
                        return userId;
                    }
                })();
                // check if user hold limit is exceeded - no
                // warn user on exceeded hold limit - yes
                if(canHold){
                    productService.products.update(product._id, {...product, heldBy: userId, holders, status: 1})
                    .then(product=>{
                        // do something here
                        notifyHold(product._id);
                    }).catch(error=>{
                        console.log(error.message);
                    });
                }else{
                    createError("Sorry, you can only hold product once.");
                }
            }else{
                createError("Item is being held by someone else!", 3000);
            }
        }
    }

     const unholdProduct = (userId, product) => {
        if(userId && product){

            // monitize user hold count              
            productService.products.update(product._id, {...product, heldBy: "", status: 0})
            .then(_=>{
                // do something here
                notifyUnheld(product.id);
            }).catch(error=>{
                console.log(error.message);
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
            comment, increaseWatch, reduceWatch, getProductByReqId, acceptPurchaseRequest,
            denyPurchaseRequest, getProductComments
        }}>
            {children}
        </ProductsContext.Provider>
    )
}

export default ProductsProvider;
