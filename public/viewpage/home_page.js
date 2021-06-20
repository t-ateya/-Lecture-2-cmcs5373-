import * as Element from './element.js'
import * as Route from '../controller/routes.js'
import * as Auth from '../controller/auth.js'

export function addEventListeners(){

    Element.menuHome.addEventListener('click', ()=>{
        history.pushState(null, null, Route.routePathname.HOME);
        home_page();

    })
}

export function home_page(){
if(!Auth.currentUser) {
	return;
}
    Element.root.innerHTML = `
        <h1>Welcome to Admin's Page</h1>
    `;
}
