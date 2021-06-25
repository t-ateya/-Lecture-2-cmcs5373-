import * as Element from '../viewpage/element.js';
import * as FirebaseController from './firebase_controller.js';
import * as Constant from '../model/constant.js';
import * as Util from '../viewpage/util.js';
import * as Route from './routes.js';

export let currentUser;


export function addEventListeners() {
    Element.formSignin.addEventListener('submit', async e => {
        e.preventDefault(); //prevent refresh
        const email = e.target.email.value;
        const password = e.target.password.value;

        if (!Constant.adminEmails.includes(email)) {
            Util.info('Error', 'Only for admins');
            return;
        }

        try {
            await FirebaseController.signIn(email, password);
            Element.modalSignin.hide();
        } catch (error) {
            if (Constant.DEV) console.log(error);
            Util.info('Sign In Error', JSON.stringify(error), Element.modalSignin);
        }

    });

    Element.menuSignout.addEventListener('click', async() => {
        try {
            await FirebaseController.signOut();
        } catch (e) {
            if (Constant.DEV) console.log(e);
            Util.info('Sign Out Error: Try again', JSON.stringify(e));
        }
    });

    firebase.auth().onAuthStateChanged(user => {
        if (user && Constant.adminEmails.includes(user.email)) {
            //someone signed in
            currentUser = user;
            let elements = document.getElementsByClassName('modal-pre-auth');
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none';
            elements = document.getElementsByClassName('modal-post-auth');
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'block';

            const pathname = window.location.pathname;
            const hash = window.location.hash;
            Route.routing(pathname, hash);

        } else {
            //someone signed out
            currentUser = null;
            let elements = document.getElementsByClassName('modal-pre-auth');
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'block';
            elements = document.getElementsByClassName('modal-post-auth');
            for (let i = 0; i < elements.length; i++)
                elements[i].style.display = 'none';

            history.pushState(null, null, Route.routePathname.HOME);
        }
    })
}