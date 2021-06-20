import * as Element from "./element.js";
import * as Route from "../controller/routes.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as FirebaseController from "./../controller/firebase_controller.js";

export function addEventListeners() {
	Element.menuUsers.addEventListener("click", async () => {
		history.pushState(null, null, Route.routePathname.USERS);
		const label = Util.disableButton(Element.menuUsers);
		await users_page();
		Util.enableButton(Element.menuUsers, label);
	});
}

export async function users_page() {
	Element.root.innerHTML = `
        <h1>Welcome to User Management Page</h1>
    `;

	let userList = [];
	let html = "";
	try {
		userList = await FirebaseController.getUserList();
		html += `
			 <table class="table table-stripped">
				<thead>
					<tr>
						<td>Email</td>
						<td>Status</td>
						<td>Action</td>
					</tr>
				</thead>
				<tbody>
			`;

		userList.forEach((user) => {
			html += buildUserRow(user);
		});

		html += `</tbody></table>`;
	} catch (error) {
		if (Constant.DEV) {
			console.log(error);
		}
		Util.info("Error getUserList", JSON.stringify(error));
	}
	Element.root.innerHTML = html;
	const toggleForms = document.getElementsByClassName("form-toggle-user");
	for (let i = 0; i < toggleForms.length; i++) {
		toggleForms[i].addEventListener("submit", (e) => {
			e.preventDefault();
			const button = e.target.getElementsByTagName("button")[0];
			const label = Util.disableButton(button);

			const uid = e.target.uid.value;
			const disabled = e.target.disabled.value;
		});
	}
}

function buildUserRow(user) {
	return `
			<tr>
				<td>${user.email}</td>
				<td>${user.disabled ? "Disabled" : "Active"}</td>
				<td>
					<form class="form-toggle-user" method="post" style="display: inline-block">
						<input type="hidden" name="uid" value="${user.uid}" />
						<input type="hidden" name="disabled" value="${user.disabled}" />
						<button type="submit" class="btn btn-outline-primary">Toggle Active</button>
					</form>
					<form class="form-toggle-user" method="post" style="display: inline-block">
						<input type="hidden" name="uid" value="${user.uid}" />
						<button type="submit" class="btn btn-outline-danger">Delete</button>
					</form>
				</td>
			</tr>
			`;
}
