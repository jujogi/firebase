const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBz83uL-sb5ISX5mn35n9bNbVgg9QBpD1A",
    authDomain: "zemoga-icesi.firebaseapp.com",
    projectId: "zemoga-icesi",
    storageBucket: "zemoga-icesi.appspot.com",
    messagingSenderId: "296000903470",
    appId: "1:296000903470:web:fb18d5cddb47ae6d1ec2bf"
};

firebase.initializeApp(FIREBASE_CONFIG);


const db = firebase.firestore();
const COLLECTION = db.collection("community");
const FRIENDS_LS_KEY = "friends";

const friendsLS = localStorage.getItem(FRIENDS_LS_KEY);
const friends = friendsLS ? JSON.parse(friendsLS) : [];

const resetContent = () => resultArea.innerHTML = "";

const askToBeMyFriend = (event, user) => {
    friends.push(user);
    localStorage.setItem(FRIENDS_LS_KEY, JSON.stringify(friends));
    
    const labelButton = event.target;
    labelButton.disabled = true;
    labelButton.innerHTML = "Requested!";
};

const renderUser = user => {
    const { id, first, last, email } = user;
    
    const isMyFriend = friends.some( friend => friend.id === id);
    const button = isMyFriend ? `<button class="user__button" disabled>Requested!</button>` : `<button class="user__button">Ask to be my friend</button>`

    const userElement = document.createElement('div');
    userElement.className = "user";
    userElement.innerHTML = `
    <h3 class="user__id">${id}</h3>
    <h4 class="user__name">${first} ${last}</h4>
    <p class="user__email">${email}</p>
    ${button}
    `;
    resultArea.appendChild(userElement);

    const addToFriendButton = userElement.querySelector(".user__button");

    addToFriendButton.addEventListener("click", e => {
        askToBeMyFriend(e, user);
    });

};

const saveUser = async () => {
    const user = {
        first: faker.name.firstName(),
        last: faker.name.lastName(),
        email: faker.internet.email(),
    };
    const { id } = await COLLECTION.add(user);
    renderUser({
        id,
        ...user,
    });
}

const getUsers = async () => {
    resetContent();
    const { docs } = await COLLECTION.get();
    docs.forEach( doc => {
        const user = doc.data();
        renderUser({
            id: doc.id,
            ...user,
        });
    });
    if(!docs.length){
        clearLocalStorage();
    }
}

const getUserByFilter = async () => {
    resetContent();
    const id = searchInput.value;
    if (id) {
        try {
            const user = await COLLECTION.doc(id).get();
            if (user.exists) {
                const userDetails = user.data();
                renderUser({
                    id: user.id,
                    ...userDetails,
                });
            } else {
                console.log("not user found!");
            }
        } catch (e){
            console.log(e)
        }
    } else {
        alert("Try putting a valid user ID...");
    }
}

const login = async (email, password) => {
    try {
        const { user }  = await firebase.auth().signInWithEmailAndPassword(email, password);
        alert(`Welcome ${user.email}!`);
    } catch ({ message }) {
        alert(message);
    }
};

const signUp = async (email, password) => {
    try {
        const newUser = await firebase.auth().createUserWithEmailAndPassword(email, password);
        alert(`Welcome ${email}!`);
    } catch ({ code, message }) {
        if (code == "auth/email-already-in-use") {
            login(email, password);
            
        } else {
            alert(message);
        }
    }
};

const onButtonSignUp = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (email && password){
        signUp(email, password);
    } else {
        alert("Email and password fields are required");
    }
};

const clearLocalStorage = () => {
    localStorage.removeItem(FRIENDS_LS_KEY);
};

const resultArea = document.getElementById("result");

const renderUserButton = document.getElementById("create");
const getUsersButton = document.getElementById("get");
const searchButton = document.getElementById("search");
const searchInput = document.getElementById("searchInput");
const createForm = document.getElementById("createForm");


document.addEventListener("DOMContentLoaded", () => {

    renderUserButton.addEventListener("click", saveUser);
    getUsersButton.addEventListener("click", getUsers);
    searchButton.addEventListener("click", getUserByFilter);
    createForm.addEventListener("submit", e => {
        e.preventDefault();
        onButtonSignUp();
    })

    getUsers();

});


