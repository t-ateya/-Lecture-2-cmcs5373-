// @ts-nocheck
import {
    Product
} from "../model/product.js";
import * as Element from "./element.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Route from "../controller/routes.js";
import * as Edit from "../controller/edit_product.js";
import * as Auth from "../controller/auth.js";

let imageFile2Upload;

export function addEventListeners() {
    Element.menuProducts.addEventListener("click", async() => {
        history.pushState(null, null, Route.routePathname.PRODUCTS);
        const button = Element.menuProducts;
        const label = Util.disableButton(button);
        await product_page();
        //await Util.sleep(1000);
        Util.enableButton(button, label);
    });

    Element.formAddProduct.form.addEventListener("submit", async(e) => {
        e.preventDefault();
        const button = e.target.getElementsByTagName("button")[0];
        const label = Util.disableButton(button);
        await addNewProduct(e.target);
        await product_page();
        Util.enableButton(button, label);
    });

    Element.formAddProduct.imageButton.addEventListener("change", (e) => {
        imageFile2Upload = e.target.files[0];
        if (!imageFile2Upload) {
            Element.formAddProduct.imageTag.src = null;
            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            (Element.formAddProduct.imageTag.src = reader.result);
        reader.readAsDataURL(imageFile2Upload);
    });
}

export async function product_page() {
    if (!Auth.currentUser) {
        return;
    }
    // new product and filter product list form
    let html = `
        <div class="d-flex justify-content-between align-items-center">
            <button id="button-add-product" class="btn btn-outline-success mb-3">+ Add Product</button>
			<form class="form form-inline" id="filter-product-form" method="GET">
				<div div class = "input-group mb-3">
					<select class="form-select form-select-sm" name="order" aria-label="Select sorting order">
						<option value="1">Ascending order</option>
						<option value="0">Descending order</option>
					</select>
					<select class="form-select form-select-sm" name="filterBy" aria-label="filter products form">
						<option selected>-- Filter by --</option>
						<option value="id">id</option>
						<option value="name">product name</option>
						<option value="price">price</option>
					</select>

					<button class="btn btn-primary" type="submit">filter</button>
				</div>
			</form>
		</div>
		
		<table class="table">
			<thead>
				<tr>
					<th>#</th>
					<th></th>
					<th>Product</th>
					<th>Description</th>
					<th>Price</th>
					<th>Options</th>
				</tr>
			</thead>
			<tbody id="product-table-body">
    `;

    let products;
    try {
        products = await FirebaseController.getProductList();
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Util.info("Cannot get product list", JSON.stringify(e));
        return;
    }

    //render products
    products.forEach((p, index) => {
        html += buildProductCard(p, index);
    });

    html += `</tbody></table>`;

    Element.root.innerHTML = html;

    document
        .getElementById("button-add-product")
        .addEventListener("click", () => {
            Element.formAddProduct.form.reset();
            Element.formAddProduct.imageTag.src = "";
            imageFile2Upload = null;
            Element.modalAddProduct.show();
        });

    const editForms = document.getElementsByClassName("form-edit-product");
    for (let i = 0; i < editForms.length; i++) {
        editForms[i].addEventListener("submit", async(e) => {
            e.preventDefault();
            const button = e.target.getElementsByTagName("button")[0];
            const label = Util.disableButton(button);
            await Edit.edit_product(e.target.docId.value);
            Util.enableButton(button, label);
        });
    }

    const deleteForms = document.getElementsByClassName("form-delete-product");
    for (let i = 0; i < deleteForms.length; i++) {
        deleteForms[i].addEventListener("submit", async(e) => {
            e.preventDefault();
            if (!window.confirm("Press OK to delete")) {
                return;
            }
            const button = e.target.getElementsByTagName("button")[0];
            const label = Util.disableButton(button);
            await Edit.delete_product(
                e.target.docId.value,
                e.target.imageName.value
            );
            Util.enableButton(button, label);
        });
    }

    // handle filter form
    document.querySelector('#filter-product-form').addEventListener("submit", async(e) => {
        e.preventDefault();
        const filterAttribute = e.target.filterBy.value;
        const filterOrder = e.target.order.value; // 1 => asc 0 => desc
        const filteredProducts = await FirebaseController.getProductList();
        const productTableBody = document.getElementById('product-table-body');

        // return if no data is available
        if (!filteredProducts) await product_page();

        const options = {
            attribute: filterAttribute,
            order: filterOrder
        };

        // reorganize the data based on the filtered attribute
        const filteredProductList = shuffleProducts(filteredProducts, options);
        // empty the product list table tbody
        productTableBody.innerHTML = '';
        filteredProductList.forEach((product, index) => {
            productTableBody.innerHTML += buildProductCard(product, index);
        });

    });
}

async function addNewProduct(form) {
    const name = form.name.value;
    const price = form.price.value;
    const summary = form.summary.value;

    const product = new Product({
        name,
        price,
        summary,
    }); //Product object

    const errors = product.validate(imageFile2Upload);

    Element.formAddProduct.errorName.innerHTML = errors.name ? errors.name : "";
    Element.formAddProduct.errorPrice.innerHTML = errors.price ?
        errors.price :
        "";
    Element.formAddProduct.errorSummary.innerHTML = errors.summary ?
        errors.summary :
        "";
    Element.formAddProduct.errorImage.innerHTML = errors.image ?
        errors.image :
        "";

    if (Object.keys(errors).length != 0) return; //error exists

    //save the product object in Firebase
    //  1. upload the image into Cloud storage => image name, url
    //  2. Store product info to Firebase with image info

    try {
        const {
            imageName,
            imageURL
        } = await FirebaseController.uploadImage(
            imageFile2Upload
        );
        product.imageName = imageName;
        product.imageURL = imageURL;
        await FirebaseController.addProduct(product.serialize());
        Util.info(
            "Success!",
            `${product.name} added!`,
            Element.modalAddProduct
        );
    } catch (e) {
        if (Constant.DEV) console.log(e);
        Util.info(
            "Add Product failed",
            JSON.stringify(e),
            Element.modalAddProduct
        );
    }
}

function buildProductCard(product, index) {
    return `
	<tr id="card-${product.docId}">
		<td>${index + 1}<td>
		<td>
			<img src="${product.imageURL}" class="img-fluid rounded shadow-sm" style="width: 8rem" />
		</td>
		<td>
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.summary}</p>
		</td>
		<td>$ ${product.price}</td>
		<td>
			<div class="d-inline-flex">
				<form class="form-edit-product d-inline-block mr-2" method="post">
					<input type="hidden" name="docId" value="${product.docId}" />
					<button class="btn btn-outline-primary mr-2" id="edit-btn" type="submit">Edit</button>
				</form>
				<form class="form-delete-product" method="post">
					<input type="hidden" name="docId" value="${product.docId}" />
					<input type="hidden" name="imageName" value="${product.imageName}" />
					<button class="btn btn-outline-danger" type="submit">Delete</button>
				</form>
			</div>
		</td>
	</tr>
    `;
}

function shuffleProducts(products, options) {
    let result;
    switch (options.attribute) {
        case "id":
            result = options.order == "1" ? products.reverse() : products;
            break;
        case "name":
            result = products.sort((a, b) => options.order == "1" ? a.name > b.name : a.name < b.name);
            break;
        case "price":
            result = products.sort((a, b) => options.order == "1" ? Number(a.price) > Number(b.price) : Number(a.price) < Number(b.price));
            break;
        default:
            break;
    }
    return result;
}