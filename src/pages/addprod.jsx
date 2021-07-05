import React, {useState} from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from '../firebase';

const AddProdPage = () => {
    const productsRef = firebase.firestore().collection('products');
    const productId = uuidv4();
    const [product, setProduct] = useState({
        name: "",
        price: 0,
        category: "",
        size: "",
        status: 0,
        imageUrl: "",
        heldBy: "",
        likes: [],
        wishlist: [],
        comments: [],
        shares: []
    });

    const handleSubmit = (e)=>{
        e.preventDefault();
        console.log(productId);
        console.log(productId);
        productsRef.doc(productId).set({...product, id: productId})
        .then(docRef=>{
            console.log(docRef)
        })
        .catch(error=>{
            console.log(error);
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="name" onChange={({target: {value, name}})=> setProduct({...product, [name]: value})} />
            <input type="text" name="category" placeholder="category" onChange={({target: {value, name}})=> setProduct({...product, [name]: value})} />
            <input type="number" name="price" placeholder="price" onChange={({target: {value, name}})=> setProduct({...product, [name]: value})} />
            <input type="text" name="size" placeholder="size" onChange={({target: {value, name}})=> setProduct({...product, [name]: value})} />
            <input type="number" name="status" placeholder="status" onChange={({target: {value, name}})=> setProduct({...product, [name]: value})} />
            <input type="text" name="imageUrl" placeholder="image" onChange={({target: {value, name}})=> setProduct({...product, [name]: value})} />
            <button type="submit">Add Product</button>
        </form>
    );
}

export default AddProdPage;
