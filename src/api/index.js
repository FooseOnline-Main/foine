import db from '../sampleDb.json';

const generatePassword = (password)=>{
    let passwordhash = "";
    for (let i = 0; i < password.length; i++) {
        passwordhash += password.charCodeAt(i).toString();
    }
    return passwordhash;
}

export function getUserDetails(token){
    const output = {
        success: false,
        error: "User token does not exist"
    }

    try {
        if(db.tokens.includes(token)){
            const userID = token.split("|")[1];
            const foundUser = db.users.filter(user=> user.id = userID)[0];
            if(foundUser){
                output.success = true;
                delete output.error;
                output.user = foundUser

                return output;
            }
        }
        return output;
    } catch (error) {
        output.error = error;
        return output;
    }
}

export function loginUser({email, password}){
    const output = {
        success: false,
        error: "User does not exist",
    }

    try {
        let foundUser;
        const result = db.users.filter(user=>{
            console.log(user.email, user.password);
            console.log(email, generatePassword(password))
            return user.email === email && 
            user.password === generatePassword(password)}
        )[0];

        if(result){
            foundUser = Object.create(result);
            delete output.error;
            delete foundUser.password;
            output.user = foundUser;
            output.token = `sample_token|${foundUser.id}`;
            output.success = true;
            return output;
        }else{
            return output;
        }
    } catch (error) {
        output.error = error;
        return output;
    }
    
}

export function signupUser(body){
    const output = {
        success: false,
        error: "Error creating user"
    }

    try {
        const newUser = {
                id: "60av289ba598" + Math.ceil(Math.random() * 32748723).toString(),
                username: body.username,
                email: body.email,
                phone: body.phone,
                password: generatePassword(body.password),
                cart: []
            };
        const token = `sample_token|${newUser.id}`;
        db.users.push(newUser);
        // db.users.push(JSON.parse(newUser));
        db.tokens.push(token);

        // reset output
        delete newUser.password;
        output.success = true;
        delete output.error;
        output.user = newUser;
        output.token = token;

        return output
    } catch (error) {
        output.error = error;
        return output;
    }
}

export function fetchProducts(){
    const output = {
        success: false,
    };
    
    try {
        output.success = true;
        output.data = {
            products: db.products
        }
        delete output.error
        return output;
    } catch (error) {
        output.error = error;
        return output
    }
}

export function fetchCategories(token){
    const output = {
        success: false,
    };

    try {
        output.success = true;
        output.data = {
            categories: db.categories
        }
        delete output.error
        return output;
    } catch (error) {
        output.error = error;
        return output;
    }
}

export function likeProduct(userId, productId){

}

export function getUserCart(userId){
    const output = {
        success: false,
    }

    try {
        const hasCart = Object.keys(db.cart).filter(key=> key === userId)[0];
        if(hasCart){
            output.cart = db.products.filter(item=> db.cart[hasCart].includes(item.id));
            output.success = true;
            return output;
        }
        output.error = "User has no cart yet."
        return output;
    } catch (error) {
        output.error = error;
        return output;
    }
}

export function addProductToCart(cartKey, productId){
    const output = {
        success: false,
    }

    try{
        const hasCart = Object.keys(db.cart).filter(key=> key === cartKey)[0];
        if(hasCart){
            db.cart[cartKey].push(productId);
        }else{
            db.cart[cartKey] = [productId];
            console.log("added anonymouse", db.cart, cartKey);
        }
        output.success = true;
        return output;
    } catch(error){
        output.error = error;
        return output;
    }
}

export function removeProductFromCart(userId, productId){
    const output = {
        success: false,
    }

    try{
        const hasCart = Object.keys(db.cart).filter(key=> key === userId)[0];
        
        if(hasCart && db.cart[userId].length > 0){
            const index = db.cart[userId].indexOf(productId);
            delete db.cart[userId][index]
            output.success = true;
            return output;
        }
        return output;
    } catch(error){
        output.error = error;
        return output;
    }
}

export function clearCheckedOut(cartKey, productIds){
    const output = {
        success: false
    }

    try {
        const hasCart = Object.keys(db.cart).filter(key=> key === cartKey)[0];
        if(hasCart && db.cart[cartKey].length > 0){
            productIds.forEach(id=>{
                const index = db.cart[cartKey].indexOf(id);
                delete db.cart[cartKey][index]
            })
            output.success = true;
            return output;
        }
    } catch (error) {
        output.error = error;
        return output;
    }
}

export default {
    getUserDetails, loginUser, signupUser, 
    fetchCategories, fetchProducts, likeProduct,
    addProductToCart, removeProductFromCart, clearCheckedOut,
    getUserCart
}