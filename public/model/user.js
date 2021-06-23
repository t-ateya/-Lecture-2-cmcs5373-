export class User {
    constructor(data) {
        this.email = data.email;
        this.phoneNumber = data.phoneNumber;
        this.password = data.password;
        this.displayName = data.displayName;
        this.photoURL = data.photoURL;
    }

    // serialize data for new data
    serialize() {
        return {
            email: this.email,
            phoneNumber: this.phoneNumber,
            password: this.password,
            displayName: this.displayName,
            photoURL: this.photoURL
        };
    }

    // serialize user data for update
    serializeForUpdate() {
        const user = {};
        if (this.email) {
            user.email = this.email;
        }
        if (this.phoneNumber) {
            user.phoneNumber = this.phoneNumber;
        }
        if (this.password) {
            user.password = this.password;
        }
        if (this.displayName) {
            user.displayName = this.displayName;
        }
        if (this.photoURL) {
            user.photoURL = this.photoURL;
        }

        return user;
    }
}