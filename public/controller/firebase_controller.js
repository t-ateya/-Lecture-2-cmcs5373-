import * as Constant from '../model/constant.js'
import {Product} from '../model/product.js';
export async function signIn(email, password){
    await firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut(){
    await firebase.auth().signOut();
}

const cf_addProduct = firebase.functions().httpsCallable('cf_addProduct')
export async function addProduct(product){
    await cf_addProduct(product);
}

export async function uploadImage(imageFile, imageName){
    if (!imageName)
        imageName = Date.now() + imageFile.name;
    
    const ref = firebase.storage().ref()
                    .child(Constant.storageFolderNames.PRODUCT_IMAGES + imageName);
    const taskSnapShot = await ref.put(imageFile);
    const imageURL = await taskSnapShot.ref.getDownloadURL();
    return {imageName, imageURL};
}

const cf_getProductLIst = firebase.functions().httpsCallable('cf_getProductList');
export async function getProductList(){
    const products = [];
    const result = await cf_getProductLIst(); //result.data
    result.data.forEach(data =>{
        const p = new Product(data);
        p.docId = data.docId;
        products.push(p);
    });
    return products;
}

const cf_getProductById = firebase.functions().httpsCallable('cf_getProductById') //Receives the function from the firebase
export async function getProductById(docId){
    const result = await cf_getProductById(docId); //infor retrieved as js object
    if (result.data){
        const product = new Product (result.data); //return value is js object
        product.docId = result.data.docId;
        return product;

    }else {
        return null;
    }
}