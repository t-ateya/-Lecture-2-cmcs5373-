// @ts-nocheck
import * as Element from "./element.js";
import * as Route from "../controller/routes.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as FirebaseController from "./../controller/firebase_controller.js";
import * as Auth from "../controller/auth.js";

export function addEventListeners() {
    Element.menuUsers.addEventListener("click", async() => {
        history.pushState(null, null, Route.routePathname.USERS);
        const label = Util.disableButton(Element.menuUsers);
        await users_page();
        Util.enableButton(Element.menuUsers, label);
    });
}

export async function users_page() {
    if (!Auth.currentUser) {
        return;
    }
    let html = `
        <h1>Welcome to User Management Page</h1>
		<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-user">
		 👤 create new user
		</button>
    `;

    let userList = [];
    try {
        userList = await FirebaseController.getUserList();
        html += `
			 <table class="table table-stripped">
				<thead>
					<tr>
						<td>User name</td>
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
        toggleForms[i].addEventListener("submit", async(e) => {
            e.preventDefault();
            const button = e.target.getElementsByTagName("button")[0];
            const label = Util.disableButton(button);

            const uid = e.target.uid.value;
            const disabled = e.target.disabled.value;
            const update = {
                disabled: disabled === "true" ? false : true,
            };
            try {
                await FirebaseController.updateUser(uid, update);
                e.target.disabled.value = `${update.disabled}`;
                document.getElementById(`user-status-${uid}`).innerHTML = `${
					update.disabled ? "Disabled" : "Active"
				}`;
                Util.info("Status toggled", `Disabled ${update.disabled}`);
            } catch (error) {
                if (Constant.DEV) {
                    console.log(error);
                    Util.info(
                        "Toggle user status in error",
                        JSON.stringify(error)
                    );
                }
            }
            Util.enableButton(button, label);
        });
    }
    const deleteForms = document.getElementsByClassName("form-delete-user");
    for (let i = 0; i < deleteForms.length; i++) {
        deleteForms[i].addEventListener("submit", async(e) => {
            e.preventDefault();
            if (!window.confirm("Are you sure to delete the user?")) {
                return;
            }

            const button = e.target.getElementsByTagName("button")[0];
            Util.disableButton(button);
            const uid = e.target.uid.value;
            try {
                await FirebaseController.deleteUser(uid);
                document.getElementById(`user-row-${uid}`).remove();
                Util.info('Deleted', `user deleted: uid=${uid}`);

            } catch (error) {
                if (Constant.DEV) {
                    console.log(error);
                    Util.info('Delete user in Error', JSON.stringify(error));
                }
            }
        });
    }

    let selectedUser;
    // handle update user info buttons
    const updateUserBtns = Array.from(document.querySelectorAll('.update-user-btn'));
    updateUserBtns.forEach(btn => btn.addEventListener("click", async e => {
        // set form mode to edit
        Element.userForm.dataset.editMode = "edit";

        // change modal tilte and submit button contents
        Element.userModal.title.textContent = 'Update user info';
        Element.userModal.submitBtn.textContent = '✔ Save updates';

        const label = Util.disableButton(e.target);
        const userUid = e.target.dataset.uid;

        console.log('user id: ', userUid);
        selectedUser = await FirebaseController.getUser(userUid);
        Element.userModal.modal.show();
        Util.enableButton(e.target, label);

        // update form field with the user data
        let firstName = '';
        let lastName = '';
        if (selectedUser.displayName) {
            if (selectedUser.displayName.includes(" ")) {
                [firstName, lastName] = selectedUser.displayName.split(" ");
            } else {
                firstName = selectedUser.displayName;
            }
        }

        Element.userForm.firstName.value = firstName;
        Element.userForm.lastName.value = lastName;
        Element.userForm.email.value = selectedUser.email;
        Element.userForm.password.value = selectedUser.providerData[0].password;
    }));

    // handle new user creation
    Element.userForm.addEventListener('submit', async e => {
        e.preventDefault();
        // get form data
        const userData = {
            displayName: e.target.firstName.value.trim() + ' ' + e.target.lastName.value.trim(),
            email: e.target.email.value.trim(),
            password: e.target.password.value
        };

        if (e.target.dataset.editMode === 'create') {
            Element.userModal.title.textContent = 'Create new user';
            Element.userModal.submitBtn.textContent = '✔ Save user';

            // store user in database
            try {
                await FirebaseController.addUser(userData);
                // reset modal form and close modal
                Element.userForm.reset();
                Element.userModal.modal.hide();
            } catch (error) {
                if (Constant.DEV) {
                    console.log(error);
                    Util.info('Create user error: ', JSON.stringify(error));
                }
            }
        } else {
            await FirebaseController.updateUser(selectedUser.uid, userData);
            Element.userModal.modal.hide();
        }

        // set form mode to edit
        Element.userForm.dataset.editMode = "create";
        // reset form
        Element.userForm.reset();
        // change modal tilte and submit button contents
        Element.userModal.title.textContent = 'Create new user';
        Element.userModal.submitBtn.textContent = '✔ Save user';
        await users_page();
    });
}

function buildUserRow(user) {
    return `
			<tr id="user-row-${user.uid}">
				<td>${user.displayName}</td>
				<td>${user.email}</td>
				<td id="user-status-${user.uid}">${user.disabled ? "Disabled" : "Active"}</td>
				<td>
					<form class="form-toggle-user" method="post" style="display: inline-block">
						<input type="hidden" name="uid" value="${user.uid}" />
						<input type="hidden" name="disabled" value="${user.disabled}" />
						<button type="submit" class="btn btn-outline-primary">Toggle Active</button>
					</form>
					<form class="form-delete-user" method="post" style="display: inline-block">
						<input type="hidden" name="uid" value="${user.uid}" />
						<button type="submit" class="btn btn-outline-danger">Delete</button>
					</form>
					<button class="btn btn-outline-success update-user-btn" data-uid="${user.uid}">update user info</button>
				</td>
			</tr>
			`;
}