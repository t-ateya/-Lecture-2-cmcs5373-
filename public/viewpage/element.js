// @ts-nocheck
//single page root
export const root = document.getElementById('root');

//top menu
export const menuHome = document.getElementById('menu-home');
export const menuProducts = document.getElementById('menu-products');
export const menuUsers = document.getElementById('menu-users');
export const menuSignout = document.getElementById('menu-signout');

//forms
export const formSignin = document.getElementById('form-signin');
export const filterProductForm = document.getElementById('filter-product-form');
export const userForm = document.getElementById('form-user');
export const formAddProduct = {
    form: document.getElementById('form-add-product'),
    errorName: document.getElementById('form-add-product-error-name'),
    errorPrice: document.getElementById('form-add-product-error-price'),
    errorSummary: document.getElementById('form-add-product-error-summary'),
    imageTag: document.getElementById('form-add-product-image-tag'),
    imageButton: document.getElementById('form-add-product-image-button'),
    errorImage: document.getElementById('form-add-product-error-image'),
};

export const formEditProduct = {
    form: document.getElementById('form-edit-product'),
    errorName: document.getElementById('form-edit-product-error-name'),
    errorPrice: document.getElementById('form-edit-product-error-price'),
    errorSummary: document.getElementById('form-edit-product-error-summary'),
    imageTag: document.getElementById('form-edit-product-image-tag'),
    imageButton: document.getElementById('form-edit-product-image-button'),
    errorImage: document.getElementById('form-edit-product-error-image'),
};

//Modal Boostrap objects
//{backdrop: 'static'}

export const modalInfobox = new bootstrap.Modal(document.getElementById('modal-info'), {
    backdrop: 'static'
});
export const modalInfoboxTitleElement = document.getElementById('modal-info-title');
export const modalInfoboxBodyElement = document.getElementById('modal-info-body');

export const modalSignin = new bootstrap.Modal(document.getElementById('modal-signin'), {
    backdrop: 'static'
});

export const modalAddProduct = new bootstrap.Modal(document.getElementById('modal-add-product'), {
    backdrop: 'static'
});

export const modalEditProduct = new bootstrap.Modal(document.getElementById('modal-edit-product'), {
    backdrop: 'static'
});