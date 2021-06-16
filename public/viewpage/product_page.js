import { Product } from '../model/product.js';
import * as Element from './element.js'
import * as FirebaseController from '../controller/firebase_controller.js'
import * as Constant from '../model/constant.js'
import * as Util from './util.js'
import * as Route from '../controller/routes.js'
let imageFile2Upload

export function addEventListeners(){
    Element.menuProducts.addEventListener('click', async() =>{
        history.pushState(null, null, Route.routePathname.PRODUCTS);
        await product_page();
    });

    Element.formAddProduct.form.addEventListener('submit', async e=>{
        e.preventDefault();
       await  addNewProduct(e.target);
       await product_page();

    });

    Element.formAddProduct.imageButton.addEventListener('change', e=>{
        imageFile2Upload = e.target.files[0];
        if (!imageFile2Upload){
            Element.formAddProduct.imageTag.src = null;
            return;
        }
        const reader = new FileReader();
        reader.onload = ()=>Element.formAddProduct.imageTag.src = reader.result
        reader.readAsDataURL(imageFile2Upload);
    })
}

export async function product_page(){
    let html = `
        <div>
            <button id="button-add-product" class="btn btn-outline-danger">+ Add Product</button>

        </div>
    
    `;
   
    let products;
    try {
        products = await FirebaseController.getProductList();
    } catch (e) {
        if (Constant.DEV)console.log(e);
        Util.info('Cannot get product list', JSON.stringify(e));
        return;
    } 

    //render products
    
    products.forEach(p =>{
        html += buildProductCard(p);

    }); 

    Element.root.innerHTML = html;

document.getElementById('button-add-product').addEventListener('click', () =>{

        Element.modalAddProduct.show();
    });

}

async function addNewProduct(form){
    const name = form.name.value;
    const price = form.price.value;
    const summary = form.summary.value;

    const product = new Product({name, price, summary}); //Product object

    const errors = product.validate(imageFile2Upload);

    Element.formAddProduct.errorName.innerHTML = errors.name ? errors.name : '';
    Element.formAddProduct.errorPrice.innerHTML = errors.price ? errors.price : '';
    Element.formAddProduct.errorSummary.innerHTML = errors.summary ? errors.summary : '';
    Element.formAddProduct.errorImage.innerHTML = errors.image ? errors.image : '';

    if (Object.keys(errors).length !=0) return ; //error exists

    //save the product object in Firebase
      //  1. upload the image into Cloud storage => image name, url
      //  2. Store product info to Firebase with image info
    
      try {
        const {imageName, imageURL} =  await FirebaseController.uploadImage(imageFile2Upload);
        product.imageName = imageName;
        product.imageURL = imageURL;
        await FirebaseController.addProduct(product.serialize());
        Util.info('Success!', `${product.name} added!`, Element.modalAddProduct);
      } catch (e) {
          if (Constant.DEV) console.log(e);
          Util.info('Add Product failed', JSON.stringify(e), Element.modalAddProduct)
      }
        

}

function buildProductCard(product){
    return `
    <div class="card" style="width: 18rem; display: inline-block">
        <img src="${product.imageURL}" class="card-img-top">
        <div class="card-body"><h5 class="card-title">${product.name}</h5>
        <p class="card-text">$ ${product.price}<br>${product.summary}</p>
        </div>
    </div>
    `;
}