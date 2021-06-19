import * as Element from "./element.js";
import * as Route from "../controller/routes.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as FirebaseController from "./../controller/firebase_controller.js";

export function addEventListeners() {
	Element.menuUsers.addEventListener("click", () => {
		history.pushState(null, null, Route.routePathname.USERS);
		users_page();
	});
}

export async function users_page() {
	Element.root.innerHTML = `
        <h1>Welcome to User Management Page</h1>
    `;

	let userList;
	try {
		userList = await FirebaseController.getUserList();
	} catch (error) {
		if (Constant.DEV) {
			console.log(error);
		}
		Util.info("Error getUserList", JSON.stringify(error))
	}
	Element.root.innerHTML = html;
}
