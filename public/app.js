// @ts-nocheck
import * as Route from './controller/routes.js';
import * as Auth from './controller/auth.js';
import * as ProductPage from './viewpage/product_page.js';
import * as Home from './viewpage/home_page.js';
import * as User from './viewpage/user_page.js';
import * as Edit from './controller/edit_product.js';
window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    Route.routing(pathname, hash);
};

window.addEventListener('popstate', e => {
    e.preventDefault();
    const pathname = e.target.location.pathname;
    const hash = e.target.location.hash;
    Route.routing(pathname, hash);
});

Auth.addEventListeners();
ProductPage.addEventListeners();
Home.addEventListeners();
User.addEventListeners();
Edit.addEventListeners();