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
		<button type="button" class="btn btn-primary" id="btn-create-user" data-bs-toggle="modal" data-bs-target="#modal-user">
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
						<td>Profile Image</td>
						<td>Name</td>
						<td>Email</td>
						<td>Phone number</td>
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

    // handle delete functionality
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

    // handle update user functionality
    const editBtns = document.getElementsByClassName('edit-btn');
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].addEventListener('click', e => {
            // get clicked user uid from btn
            const userUid = e.target.dataset.uid;
            // set form submit mode to update
            Element.userForm.dataset.mode = "update";
            // set
            Element.userForm.userUid.value = userUid;

            // update modal title to edit user
            document.getElementById('modal-user-title').textContent = 'Edit user';
            document.getElementById('user-btn-submit').textContent = 'Update';
        });
    }

    // handle user form submit event
    Element.userForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        // get all form data
        const uid = e.target.userUid.value.trim();
        const updatedUserInfo = {
            email: e.target.email.value.trim() || 'user@test.com',
            displayName: `${e.target.firstName.value.trim()} ${e.target.lastName.value.trim()}` || null,
            password: e.target.password.value || '123456',
            phoneNumber: e.target.phoneNumber.value.trim(),
            photoUrl: e.target.photoUrl || null
        };

        // check form mode
        const formMode = e.target.dataset.mode;
        if (formMode === 'create') {
            await FirebaseController.addUser(updatedUserInfo);
        } else {
            await FirebaseController.updateUser(uid, updatedUserInfo);
        }
    });

    // handle create new user
    document.getElementById('btn-create-user').addEventListener('click', e => {
        // update modal title to edit user
        document.getElementById('modal-user-title').textContent = 'Create new user';
        document.getElementById('user-btn-submit').textContent = 'Save';
        Element.userForm.dataset.mode = "create";
    });
}

function buildUserRow(user) {
    return `
			<tr id="user-row-${user.uid}">
				<td class="text-center">
					<img src = "${user.photoURL}" alt="avatar of ${user.displayName || 'no avatar'}" class="img-fluid rounded rounded-circle shadow-sm" />
				</td>
				<td>${user.diplayName || 'not provided'}</td>
				<td>${user.email}</td>
				<td>${user.phoneNumber || 'not provided'}</td>
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
					<button type="button" class="btn btn-outline-warning edit-btn" data-uid="${user.uid}" data-bs-toggle="modal" data-bs-target="#modal-user">
						🖊 edit user
					</button>
				</td>
			</tr>
			`;
}