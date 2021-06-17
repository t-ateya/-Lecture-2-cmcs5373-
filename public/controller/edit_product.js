// @ts-nocheck
import * as FirebaseController from "./firebase_controller.js";
import * as Util from "../viewpage/util.js";
import * as Constant from "../model/constant.js";
import * as Element from "../viewpage/element.js";
import {
    Product
} from "../model/product.js";

let imageFile2Upload;

export function addEventListeners() {
    Element.formEditProduct.imageButton.addEventListener('change', e => {
        imageFile2Upload = e.target.files[0];
        if (!imageFile2Upload) {
            Element.formEditProduct.imageTag.src = null;
            Element.formEditProduct.errorImage.innerHTML = 'Image change cancelled. The original image will be used';
            return;
        }
        Element.formEditProduct.errorImage.innerHTML = '';
        const reader = new FileReader();
        reader.readAsDataURL(imageFile2Upload);
        reader.onload = () => Element.formEditProduct.imageTag.src = reader.result;
    });

    Element.formEditProduct.form.addEventListener('submit', e => {
        e.preventDefault();
        const button = e.target.getElementsByTagName('button')[0];
        const label = Util.disableButton(button);

        const p = new Product({
            name: e.target.name.value,
            price: e.target.price.value,
            summary: e.target.summary.value,
            docId: e.target.docId.value
        });
        const errors = p.validate(true); // bypass image file check
        Element.formEditProduct.errorName.innerHTML = errors.name ? errors.name : '';
        Element.formEditProduct.errorPrice.innerHTML = errors.price ? errors.price : '';
        Element.formEditProduct.errorSummary.innerHTML = errors.summary ? errors.summary : '';

        if (Object.keys(errors).length != 0) {
            Util.enableButton(button, label);
            return;
        }

        // TODO: Complete vid 14 at 1:14s timestamp

        Util.enableButton(button, label);
    });
}

export async function edit_product(docId) {
    let product;
    try {
        product = await FirebaseController.getProductById(docId);
        if (!product) {
            Util.info('getProductById error', 'No product found by the id');
            return;
        }
    } catch (e) {
        if (Constant.DEV) {
            Util.info('getProductById', JSON.stringify(e));
            return;
        }
    }

    // show product
    Element.formEditProduct.form.docId.value = product.docId;
    Element.formEditProduct.form.imageName.value = product.imageName;
    Element.formEditProduct.form.name.value = product.name;
    Element.formEditProduct.form.price.value = product.price;
    Element.formEditProduct.form.summary.value = product.summary;
    Element.formEditProduct.imageTag.src = product.imageURL;
    Element.formEditProduct.errorImage.innerHTML = '';

    Element.modalEditProduct.show();
}