// @ts-nocheck
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./account_key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://cmsc5373-terencea.firebaseio.com'
});

const Constant = require("./constant.js");

//cf==cloud function
exports.cf_addProduct = functions.https.onCall(addProduct);
exports.cf_getProductList = functions.https.onCall(getProductList);
exports.cf_getProductById = functions.https.onCall(getProductById);
exports.cf_updateProduct = functions.https.onCall(updateProduct);
exports.cf_deleteProduct = functions.https.onCall(deleteProduct);
exports.cf_getUserList = functions.https.onCall(getUserList);
exports.cf_updateUser = functions.https.onCall(updateUser);
exports.cf_deleteUser = functions.https.onCall(deleteUser);
exports.cf_addUser = functions.https.onCall(addUser);
exports.cf_getUser = functions.https.onCall(getUser);

function isAdmin(email) {
    return Constant.adminEmails.includes(email);
}

async function deleteUser(data, context) {
    // data => uid
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }
    try {
        await admin.auth().deleteUser(data);
    } catch (error) {
        if (Constant.DEV) {
            console.log(error);

            throw new functions.https.HttpsError(
                "internal",
                "deleteUser failed"
            );
        }
    }
}

async function addUser(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }
    try {
        const ref = await admin.auth().createUser(data);
        return ref;
    } catch (error) {
        if (Constant.DEV) console.log(error);
        throw new functions.https.HttpsError('internal', `create user failde: ${error}`);
    }

}

async function updateUser(data, context) {
    // data = {uid, update} === update = {key: value}
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }

    try {
        const uid = data.uid;
        const update = data.update;
        await admin.auth().updateUser(uid, update);
    } catch (error) {
        if (Constant.DEV) {
            console.log(error);

            throw new functions.https.HttpsError(
                "internal",
                "updateUser failed"
            );
        }
    }
}

async function getUser(userId, context) {
    // data = {uid, update} === update = {key: value}
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }
    try {
        const userRecord = await admin.auth().getUser(userId);
        return userRecord.toJSON();
    } catch (error) {
        if (Constant.DEV) {
            console.log(error);

            throw new functions.https.HttpsError(
                "internal",
                "getUser failed"
            );
        }
    }
}

async function getUserList(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }

    const userList = [];
    const MAXRESULTS = 2;
    try {
        let result = await admin.auth().listUsers(MAXRESULTS);
        userList.push(...result.users);
        let nextPageToken = result.pageToken;
        while (nextPageToken) {
            result = await admin.auth().listUsers(MAXRESULTS, nextPageToken);
            userList.push(...result.users);
            nextPageToken = result.pageToken;
        }
        return userList;
    } catch (error) {
        if (Constant.DEV) {
            console.log(error);

            throw new functions.https.HttpsError(
                "internal",
                "getUserList failed"
            );
        }
    }
}

async function deleteProduct(docId, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }
    try {
        await admin
            .firestore()
            .collection(Constant.collectionNames.PRODUCT)
            .doc(docId)
            .delete();
    } catch (error) {
        if (Constant.DEV) {
            console.log(error);

            throw new functions.https.HttpsError(
                "internal",
                "deleteProduct failed"
            );
        }
    }
}

async function updateProduct(productInfo, context) {
    // productInfo = { docId, data }
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }

    try {
        await admin
            .firestore()
            .collection(Constant.collectionNames.PRODUCT)
            .doc(productInfo.docId)
            .update(productInfo.data);
    } catch (error) {
        if (Constant.DEV) {
            throw new functions.https.HttpsError(
                "internal",
                "updateProduct failed"
            );
        }
    }
}

/**
 * @param{string} data: document(product) id
 *  */
async function getProductById(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }
    try {
        const doc = await admin
            .firestore()
            .collection(Constant.collectionNames.PRODUCT)
            .doc(data)
            .get();
        if (doc.exists) {
            const {
                name,
                summary,
                price,
                imageName,
                imageURL
            } = doc.data();
            const p = {
                name,
                summary,
                price,
                imageName,
                imageURL,
            };
            p.docId = doc.id;
            return p;
        }
        return null; // no doc exists
    } catch (e) {
        if (Constant.DEV) {
            console.log(e);
        }
        throw new functions.https.HttpsError(
            "internal",
            "getProductById failed"
        );
    }
}

async function getProductList(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }

    try {
        let products = [];
        const snapShot = await admin
            .firestore()
            .collection(Constant.collectionNames.PRODUCT)
            .orderBy("name")
            .get();
        snapShot.forEach((doc) => {
            const {
                name,
                price,
                summary,
                imageName,
                imageURL
            } = doc.data();
            const p = {
                name,
                price,
                summary,
                imageName,
                imageURL,
            };
            p.docId = doc.id;
            products.push(p);
        });
        return products;
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError("internal", "getProduct failed");
    }
}

async function addProduct(data, context) {
    if (!isAdmin(context.auth.token.email)) {
        if (Constant.DEV) console.log("not admin", context.auth.token.email);
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Only admin may invoke this function"
        );
    }
    //data: serialized product object
    try {
        await admin
            .firestore()
            .collection(Constant.collectionNames.PRODUCT)
            .add(data);
    } catch (e) {
        if (Constant.DEV) console.log(e);
        throw new functions.https.HttpsError("internal", "addProduct failed");
    }
}