// @ts-nocheck
import * as Constant from "../model/constant.js";
import { Product } from "../model/product.js";
export async function signIn(email, password) {
	await firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut() {
	await firebase.auth().signOut();
}

const cf_addProduct = firebase.functions().httpsCallable("cf_addProduct");
export async function addProduct(product) {
	await cf_addProduct(product);
}

export async function uploadImage(imageFile, imageName) {
	if (!imageName) imageName = Date.now() + imageFile.name;

	const ref = firebase
		.storage()
		.ref()
		.child(Constant.storageFolderNames.PRODUCT_IMAGES + imageName);
	const taskSnapShot = await ref.put(imageFile);
	const imageURL = await taskSnapShot.ref.getDownloadURL();
	return {
		imageName,
		imageURL,
	};
}

const cf_getProductLIst = firebase
	.functions()
	.httpsCallable("cf_getProductList");
export async function getProductList() {
	const products = [];
	const result = await cf_getProductLIst(); //result.data
	result.data.forEach((data) => {
		const p = new Product(data);
		p.docId = data.docId;
		products.push(p);
	});
	return products;
}

const cf_getProductById = firebase
	.functions()
	.httpsCallable("cf_getProductById");
export async function getProductById(docId) {
	const result = await cf_getProductById(docId);
	if (result.data) {
		const product = new Product(result.data);
		product.docId = result.data.docId;
		return product;
	} else {
		return null;
	}
}

const cf_updateProduct = firebase.functions().httpsCallable("cf_updateProduct");
export async function updateProduct(product) {
	const docId = product.docId;
	const data = product.serializeForUpdate();
	await cf_updateProduct({
		docId,
		data,
	});
}

const cf_deleteProduct = firebase.functions().httpsCallable("cf_deleteProduct");
export async function deleteProduct(docId, imageName) {
	await cf_deleteProduct(docId);
	const ref = firebase
		.storage()
		.ref()
		.child(Constant.storageFolderNames.PRODUCT_IMAGES + imageName);
	await ref.delete();
}

const cf_getUserList = firebase.functions().httpsCallable("cf_getUserList");
export async function getUserList() {
	const result = await cf_getUserList();
	return result.data;
}



const cf_updateUser = firebase.functions().httpsCallable("cf_updateUser");
export async function updateUser(uid, update) {
	await cf_updateUser({uid, update});
}
