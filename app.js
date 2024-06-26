// Firebase configuration
if (localStorage.getItem("firebaseConfig") != "true") {
  localStorage.setItem("apiKey", "AIzaSyBHjrth8B0QFXQZOL3re4vdyc0q7vBKvJg");
  localStorage.setItem("authDomain", "ajinx-2.firebaseapp.com");
  localStorage.setItem("projectId", "ajinx-2");
  localStorage.setItem("storageBucket", "ajinx-2.appspot.com");
  localStorage.setItem("messagingSenderId", "244315272771");
  localStorage.setItem("appId", "1:244315272771:web:931b93d7c5f0849ce3c6f6");
}
const firebaseConfig2 = {
  apiKey: localStorage.getItem("apiKey"),
  authDomain: localStorage.getItem("authDomain"),
  projectId: localStorage.getItem("projectId"),
  storageBucket: localStorage.getItem("storageBucket"),
  messagingSenderId: localStorage.getItem("messagingSenderId"),
  appId: localStorage.getItem("appId"),
};
const firebaseConfig1 = {
  apiKey: "AIzaSyBHjrth8B0QFXQZOL3re4vdyc0q7vBKvJg",
  authDomain: "ajinx-2.firebaseapp.com",
  projectId: "ajinx-2",
  storageBucket: "ajinx-2.appspot.com",
  messagingSenderId: "244315272771",
  appId: "1:244315272771:web:931b93d7c5f0849ce3c6f6",
};

// Initialize the first Firebase app
firebase.initializeApp(firebaseConfig1, "app1");

// Initialize the second Firebase app
firebase.initializeApp(firebaseConfig2, "app2");

// Access Firebase services for the first app
const database1 = firebase.app("app1").database();
const storage1 = firebase.app("app1").storage();
const db1 = firebase.app("app1").firestore();
const auth1 = firebase.app("app1").auth();

// Access Firebase services for the second app
const database2 = firebase.app("app2").database();
const storage2 = firebase.app("app2").storage();
const db2 = firebase.app("app2").firestore();
const auth2 = firebase.app("app2").auth();

// Function to write data to a cookie
function writeCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to read data from a cookie
function readCookie(name) {
  let nameEQ = name + "=";
  let cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) == " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) == 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
}

// Function to delete a cookie
function eraseCookie(name) {
  document.cookie = name + "=; Max-Age=-99999999;";
}

// Set authentication state persistence
firebase
  .app("app1")
  .auth()
  .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    // Auth state persistence set
  })
  .catch((error) => {
    console.error("Error setting persistence: ", error);
  });

// Function to get UID from URL parameter
function getUidFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get("code");
  const ssParam = urlParams.get("ss");

  if (codeParam) {
    toggleJoinGroup();
    document.querySelector("body > div.joinGroup > div:nth-child(2) > input[type=text]").value = codeParam.split("?")[0];
    return codeParam.includes("?") ? codeParam.split("?ss=")[1] : null;
  }
  if (ssParam) {
    const ss = ssParam.split("?")[0];
    if (ssParam.includes("?")) {
      toggleJoinGroup();
      document.querySelector("body > div.joinGroup > div:nth-child(2) > input[type=text]").value = ssParam.split("?code=")[1];
    }
    return ss;
  }
  return null;
}


// Check if UID exists in the URL
const userUid = getUidFromUrl();
const setAuthAndFetchConfig = (authStatus, uid) => {
  localStorage.setItem("auth", authStatus);
  localStorage.setItem("userID", uid);
  fetchFirebaseConfig(uid);
};

if (userUid) {
  firebase.app("app1").auth().onAuthStateChanged(user => {
    if (user) {
      const authStatus = userUid === user.uid ? "super" : "other";
      if (authStatus === "super") {
        showFirebaseConfigInterface(user.uid);
      } else {
        setAuthAndFetchConfig(authStatus, userUid);
      }
    } else {
      setAuthAndFetchConfig("other", userUid);
    }
  });
} else {
  localStorage.setItem("auth", "other");
  if (localStorage.getItem("firebaseConfig") === "true" && localStorage.getItem("auth") === "other") {
    const dbFoundElement = document.querySelector(".DBfound");
    dbFoundElement.style.display = "flex";
    dbFoundElement.querySelector("button").addEventListener("click", () => {
      ["firebaseConfig", "auth", "apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]
        .forEach(item => localStorage.setItem(item, item === "auth" ? "other" : "null"));
      dbFoundElement.style.display = "none";
      location.reload();
    });
  }
  firebase.app("app1").auth().onAuthStateChanged(user => {
    if (user) {
      showFirebaseConfigInterface(user.uid);
    } else {
      console.log("User is signed out");
    }
  });
}


const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");
const regEmailField = document.getElementById("reg-email");
const regPasswordField = document.getElementById("reg-password");

//logout
function logout() {
  firebase.app("app1").auth().signOut().then(() => {
    console.log("User logged out successfully");
    ["firebaseConfig", "apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]
      .forEach(key => localStorage.setItem(key, ""));
    location.reload();
  }).catch(error => console.error("Logout error:", error));
}


// Login function
function login() {
  const email = regEmailField.value;
  const password = regPasswordField.value;
  const auth = firebase.app("app1").auth();

  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

  auth.signInWithEmailAndPassword(email, password).then(({ user }) => {
    localStorage.setItem("uid", user.uid);

    if (localStorage.getItem("firebaseConfig") === "true" && localStorage.getItem("userID") === user.uid) {
      showFirebaseConfigInterface();
    } else {
      const proceed = prompt('You cannot log into this DB! If you wanna proceed you can by leaving this DB, to do so type "yes"');
      if (proceed === "yes") {
        localStorage.setItem("userID", user.uid);
        fetchFirebaseConfig(user.uid);
      } else {
        auth.signOut().catch(console.error);
      }
    }
  }).catch(console.error);
}


// Save Firebase config to Firestore
function saveFirebaseConfig() {
  if (localStorage.getItem("firebaseConfig") === "true" && localStorage.getItem("auth") !== "super") {
    alert("You are in a DB");
    return;
  }
  const firestore = firebase.app("app1").firestore();
  const user = firebase.app("app1").auth().currentUser;
  const input = document.querySelector(".firebaseConfigInterface .highlighted-code").textContent;

  const config = {};
  ["apiKey", "authDomain", "databaseURL", "projectId", "storageBucket", "messagingSenderId", "appId"].forEach(key => {
    const match = input.match(new RegExp(`${key}: "([^"]*)"`));
    config[key] = match ? match[1] : `${key} not found`;
  });

  firestore
    .collection("users")
    .doc(user.uid)
    .set({ firebaseConfig: config })
    .then(() => {
      console.log("Firebase config saved successfully");
      document.querySelector(".firebaseConfigInterface").style.display = "none";
      fetchFirebaseConfig(user.uid);
    })
    .catch(console.error);
}


//show account
async function showFirebaseConfigInterface() {
  localStorage.setItem("auth", "super");

  document.querySelector(".DBfound").style.display = "none";
  if (!(document.querySelector('.GSbySignUp').classList.contains('stepone'))) {
    document.getElementById("account").style.display = "flex";
    const hideElements = ["blur", "getStarted", "GSbySignUp"];
    hideElements.forEach(id => document.querySelector(`.${id}`).style.display = "none");
  }
  document.querySelector(".accountToggleMain").style.display = "flex";
  document.querySelector(".signUpToggle").style.display = "none";

  const firestore = firebase.app("app1").firestore();
  const user = firebase.app("app1").auth().currentUser;
  document.querySelector("#account h1").innerText = user.email;

  const username = await getUsernamebyID(user.uid) || await addUsername(user.uid, getUserName(user.email), '', 'true');
  const usernameElement = document.querySelector("#account .username-jjs .p span");
  usernameElement.innerText = username;

  try {
    const userDoc = await firestore.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      console.log("No user found");
      return;
    }
    const groupsSnapshot = await firestore.collection("users").doc(user.uid).collection("groups").get();
    const roomsElement = document.querySelector("#rooms");
    roomsElement.innerHTML = groupsSnapshot.empty ? "<span>No rooms found!</span>" : "";

    console.log(groupsSnapshot);
    groupsSnapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement("li");
      item.id = data.invitecode;
      item.innerHTML = `${data.name}<span>${data.database === "ajinx" ? "at Ajinx" : ""}</span>`;
      item.classList.add(data.database === "ajinx" ? "ajinx-db" : "");
      item.addEventListener("click", event => {
        if (!event.target.closest(".passwordParent")) {
          joinGroupClicked(data.invitecode, data.password, data.database);
        }
      });

      const passwordP = document.createElement("div");
      passwordP.classList.add("passwordParent");
      const passwordChild = document.createElement("input");
      passwordChild.readOnly = true;
      passwordChild.value = data.password;
      passwordChild.type = "password";

      const eye1 = document.createElement("ion-icon");
      eye1.name = "eye-off-outline";
      const eye2 = document.createElement("ion-icon");
      eye2.name = "eye-outline";
      eye2.style.display = "none";

      eye1.addEventListener("click", () => {
        passwordChild.type = "text";
        eye2.style.display = "flex";
        eye1.style.display = "none";
      });
      eye2.addEventListener("click", () => {
        passwordChild.type = "password";
        eye2.style.display = "none";
        eye1.style.display = "flex";
      });

      passwordP.append(passwordChild, eye1, eye2);
      item.appendChild(passwordP);
      roomsElement.appendChild(item);
    });
    const firebaseConfigData = userDoc.data().firebaseConfig;
    if (!firebaseConfigData) return;

    if (localStorage.getItem("apiKey") !== firebaseConfigData.apiKey) {
      localStorage.setItem("firebaseConfig", "true");
      Object.keys(firebaseConfigData).forEach(key => localStorage.setItem(key, firebaseConfigData[key]));
      location.reload();
    }

    const firebaseConfigString = `const firebaseConfig = ${JSON.stringify(firebaseConfigData, null, 2).replace(/"(\w+)":/g, "$1:")};`;
    document.getElementsByClassName("highlighted-code")[0].innerHTML = firebaseConfigString;
    highlightCode(document.getElementsByClassName("highlighted-code")[0]);


  } catch (error) {
    console.error("Error retrieving Firebase config or group names: ", error);
  }
}


// Function to fetch Firebase config for a user
function fetchFirebaseConfig(uid) {
  const firestore = firebase.app("app1").firestore();

  firestore.collection("users").doc(uid).get().then(userDoc => {
    if (!userDoc.exists) {
      console.log("User document not found");
      return;
    }

    const firebaseConfigData = userDoc.data().firebaseConfig;
    if (!firebaseConfigData) return;

    localStorage.setItem("firebaseConfig", "true");

    if (localStorage.getItem("apiKey") === firebaseConfigData.apiKey) return;

    ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]
      .forEach(key => localStorage.setItem(key, firebaseConfigData[key]));

    location.reload();
  }).catch(error => {
    console.error("Error fetching Firebase config: ", error);
  });
}


function register() {
  if (document.querySelector('.GSbySignUp').classList.contains('login')) {
    login();
    return;
  }
  if (localStorage.getItem("firebaseConfig") === "true") {
    alert("You are in a DB");
    return;
  }

  const email = regEmailField.value;
  const password = regPasswordField.value;

  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  if (validateEmail(email) != true) {
    document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(3) > span:nth-child(3)').innerText = 'Wrong email address.';
    document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(3) > span:nth-child(3)').style.color = '#ff1010';
    return;
  }

  if (password.length < 7) {
    document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(4) > span:nth-child(3)').innerText = 'Must be atleast 7 characters.';
    document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(4) > span:nth-child(3)').style.color = '#ff1010';
    return;
  }

  firebase.app("app1").auth().createUserWithEmailAndPassword(email, password)
    .then(({ user }) => {
      regEmailField.value = '';
      regPasswordField.value = '';
      document.querySelector("body > div.GSbySignUp > div.leftSide > div > p:nth-child(4)").classList.remove('active');
      document.querySelector("body > div.GSbySignUp > div.leftSide > div > p:nth-child(5)").classList.add('active');
      document.querySelector("body > div.GSbySignUp").classList.add('stepone');
      localStorage.setItem('tempID', user.uid);
      localStorage.setItem('tempMail', email);
      document.querySelector('.setUpProfileGuide > div:nth-child(2) > div:nth-child(2) > p:nth-child(1)').innerText = email;
      document.querySelector('.setUpProfileGuide > div:nth-child(2) > div:nth-child(2) > span:nth-child(2)').innerText = '@' + getUserName(email);
      document.querySelector('.setUpProfileGuide > div:nth-child(2) > div:nth-child(1)').innerText = email.slice(0, 2);
    })
    .catch((error) => {
      const errorMessageSpan = document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(3) > span:nth-child(3)');
      errorMessageSpan.innerText = error.message;
      errorMessageSpan.style.color = '#ff1010';
    });
}

function toggleJoin() {
  if (document.querySelector('.GSbySignUp').classList.contains('login')) {
    toggleLoginRegister();
    return;
  }
  if (document.querySelector('.getStarted').style.display == 'flex') {
    document.querySelector(".joinGroup").style.display = 'flex';
    document.querySelector('.getStarted').style.display = 'none';
    return;
  }
  document.querySelector('.GSbySignUp').style.display = 'none';
  document.querySelector(".joinGroup").style.display = 'none';
  document.querySelector('.getStarted').style.display = 'flex';
  document.querySelector('.blur').style.display = 'flex';
}

function toggleAccount() {
  document.querySelector('#account').style.display = 'flex';
}

function toggleJoinGroup(fromAccount) {
  if (fromAccount) {
    document.querySelector('.joinGroup > span:nth-child(8)').style.display = 'none';

  }
  document.querySelector('#account').style.display = 'none';
  document.querySelector('.joinGroup').style.display = 'flex';
  document.querySelector('.getStarted').style.display = 'none';
  document.querySelector('.blur').style.display = 'flex';
}

function toggleRegister() {
  document.querySelector('.GSbySignUp').style.display = 'flex';
  document.querySelector('.GSbySignUp').style.zIndex = '5000';
  document.querySelector('.getStarted').style.display = 'none';
  document.querySelector('.blur').style.display = 'none';
}

function toggleLoginRegister() {
  if (document.querySelector('.GSbySignUp').classList.contains('login')) {
    document.querySelector("body > div.GSbySignUp.login > div.rightSide > div > h1").innerText = 'Sign Up Account';
    document.querySelector('.rightSide > div:nth-child(1) > h4:nth-child(2)').innerText = 'Enter your personal data to create your account';
    document.querySelector('#reg-email').placeholder = 'eg. johnny2@gmail.com';
    document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(4) > span:nth-child(3)').innerText = 'Must be at least 8 characters.';
    document.querySelector('.rightSide > div:nth-child(1) > button:nth-child(5)').innerText = 'Sign Up';
    document.querySelector('.rightSide > div:nth-child(1) > p:nth-child(6)').innerHTML = `Already have an account? <span onclick="toggleLoginRegister();">Sign in</span>`;
    document.querySelector('.GSbySignUp').classList.remove('login');
  } else {
    document.querySelector('.GSbySignUp').classList.add('login');
    document.querySelector("body > div.GSbySignUp.login > div.rightSide > div > h1").innerText = 'Welcome Back';
    document.querySelector('.rightSide > div:nth-child(1) > h4:nth-child(2)').innerText = 'Enter your email and password to access your account';
    document.querySelector('#reg-email').placeholder = 'Enter your email';
    document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(4) > span:nth-child(3)').innerText = '';
    document.querySelector('.rightSide > div:nth-child(1) > button:nth-child(5)').innerText = 'Sign In';
    document.querySelector('.rightSide > div:nth-child(1) > p:nth-child(6)').innerHTML = `Don't have an account? <span onclick="toggleLoginRegister();">Sign up</span>`;
  }

}



// Function to generate a random invitation code
function generateInvitationCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase(); // Generate a random 8-character code
}

//join the user to room when clicked a room in the list in account
function joinGroupClicked(code, pswd, isMainDB) {
  joinGroup('code', code, 'admin', isMainDB === "ajinx" ? "ajinx" : undefined, pswd);

  if (isMainDB === "ajinx") {
    localStorage.setItem("custom", "false");
  }

  document.getElementById("account").style.display = "none";
}

function createGroupClicked() {
  if (document.getElementById('newRoomAdminPswd').value.length < 7) {
    document.querySelector('.newRoom span').innerText = 'Password must contain atleast 7 letters.';
    document.querySelector('#newRoomAdminPswd').addEventListener('change', () => {
      checkInput(document.getElementById('newRoomAdminPswd'));
    })
    return;
  }
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (format.test(document.getElementById('newRoomName').value) || document.getElementById('newRoomName').value == '') {
    document.querySelector('.newRoom span').innerText = 'Group name must not contain any special characters and cannot be empty.';
    document.querySelector('#newRoomName').addEventListener('change', () => {
      checkInput(document.getElementById('newRoomName'));
    })
    return;
  }
  const adminName = document.querySelector("#account > div.section-account > div.username-jjs > div.p > span").innerText;
  document.getElementById("adminName").value = adminName;
  document.getElementById("adminPassword").value = document.getElementById("newRoomAdminPswd").value;
  document.getElementById("groupName").value = document.getElementById("newRoomName").value;

  createGroup("store");

  document.getElementById("newRoomName").value = "";
  document.getElementById("newRoomAdminPswd").value = "";
  document.querySelector('.newRoom').style.display = 'none';
}


// Function to create a group
async function createGroup(el) {
  if (localStorage.getItem('currentProcess') == 'createGroup') {
    return;
  }
  if (localStorage.getItem("firebaseConfig") === "true" && localStorage.getItem("auth") === "other") {
    alert("You are in a DB");
    return;
  }

  localStorage.setItem('currentProcess', el.name);
  const c = el.innerHTML;
  el.innerHTML = svg;

  const adminName = document.getElementById("adminName").value.trim();

  const adminPassword = document.getElementById("adminPassword").value;
  const groupName = document.getElementById("groupName").value;
  const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  const errorMsg = document.getElementById('error-message');
  errorMsg.style.color = 'rgb(255, 78, 78)';

  if (adminName.length < 11 && adminName.length > 1 && !format.test(adminName) && adminName != 'admin') {
    if (groupName.length < 11 && groupName.length > 0 && !format.test(groupName)) {
      if (adminPassword.length > 6) {
        const invitationCode = generateInvitationCode();
        const user = firebase.app("app1").auth().currentUser;

        const database = localStorage.getItem('firebaseConfig') == true ? database2 : database1;
        const groupData = {
          adminName, adminPassword, groupName, invitationCode
        };

        const codeExists = await database.ref("groups").orderByChild("invitationCode").equalTo(invitationCode).once("value");
        if (codeExists.exists()) {
          alert("Invitation code already exists. Please choose a different one.");
          localStorage.setItem('currentProcess', '');
          el.innerHTML = c;
          return;
        }

        const nameExists = await database.ref("groups").orderByChild("groupName").equalTo(groupName).once("value");
        if (nameExists.exists()) {
          document.querySelector("body > div.getStarted > div:nth-child(4) > span:nth-child(2)").click();
          errorMsg.innerText = 'Group name already exists. Please choose a different one.';
          errorMsg.style.display = 'flex';
          localStorage.setItem('currentProcess', '');
          el.innerHTML = c;
          return;
        }

        database.ref("groups").push(groupData);

        const baseUrl = window.location.href.split("?")[0];
        const invitationLink = `${baseUrl}?code=${invitationCode}${localStorage.getItem("auth") === "super" ? `?ss=${user.uid}` : ''}`;
        showInvited(invitationLink, invitationCode, groupName, adminName, adminPassword);

        document.getElementById("adminName").value = "";
        document.getElementById("adminPassword").value = "";
        document.getElementById("groupName").value = "";
        localStorage.setItem('currentProcess', '');
        el.innerHTML = c;

      } else {
        document.querySelector("body > div.getStarted > div:nth-child(4) > span:nth-child(3)").click();
        errorMsg.innerText = 'Password must contain atleast 7 characters.';
        errorMsg.style.display = 'flex';
        localStorage.setItem('currentProcess', '');
        el.innerHTML = c;
      }
    } else {
      document.querySelector("body > div.getStarted > div:nth-child(4) > span:nth-child(2)").click();
      errorMsg.innerText = 'Group name cannot be empty and cannot contain any special characters.';
      errorMsg.style.display = 'flex';
      localStorage.setItem('currentProcess', '');
      el.innerHTML = c;
    }
  } else {
    document.querySelector("body > div.getStarted > div:nth-child(4) > span:nth-child(1)").click();
    errorMsg.innerText = 'Admin name cannot be empty and cannot contain any special characters or "admin"';
    errorMsg.style.display = 'flex';
    localStorage.setItem('currentProcess', '');
    el.innerHTML = c;
  }

}

async function showInvited(url, code, groupName, adminName, adminPassword) {
  const div = document.querySelector(".invitationPopup");
  document.querySelector("body > div.invitationPopup > div:nth-child(4) > input[type=text]").value = url;
  document.querySelector("body > div.invitationPopup > span:nth-child(5)").innerText = `Group name: ${groupName}`;
  document.querySelector("body > div.invitationPopup > span:nth-child(6)").innerText = `Admin name: ${adminName}`;
  document.querySelector("body > div.invitationPopup > span:nth-child(7)").innerText = `Admin password: ${adminPassword}`;

  document.querySelector(".getStarted").style.display = "none";
  div.style.display = "flex";

  const firestore = firebase.app("app1").firestore();
  const user = firebase.app("app1").auth().currentUser;
  if (user) {
    const groupsRef = firestore.collection("users").doc(user.uid).collection("groups");
    await groupsRef.add({
      name: groupName,
      invitecode: code,
      database: "ajinx",
      password: adminPassword,
    });
  }
}

function closeInvitation() {
  document.querySelector('.invitationPopup').style.display = 'none';
  const user = firebase.app("app1").auth().currentUser;
  if (user) {
    return;
  }
  document.querySelector('.joinGroup').style.display = 'flex';
}


// Function to join a group
function joinGroup(gnameorcode, gnocData, username, database, pswd) {
  if (!username) {
    alert('no name?');
    return;
  }

  const dbRef = database === 'ajinx' ? database1 : database2; // If database is 'ajinx', it uses database1; otherwise, it uses database2.
  const queryRef = dbRef
    .ref("groups")
    .orderByChild(gnameorcode === 'code' ? "invitationCode" : "groupName") //If gnameorcode is 'code', the query orders by the code child property.
    .equalTo(gnocData);

  queryRef.once("value", function (snapshot) {
    if (snapshot.exists()) {
      snapshot.forEach(childSnapshot => {
        if (username == childSnapshot.val().adminName && pswd != childSnapshot.val().adminPassword || username == 'admin' && pswd != childSnapshot.val().adminPassword) {
          if (pswd == undefined) {
            askforAdminPassword(gnameorcode, gnocData, username, database);
          } else {
            askforAdminPassword(gnameorcode, gnocData, username, database, 'error');
          }
          return;
        }
        if (username == 'admin' && pswd == childSnapshot.val().adminPassword || username == childSnapshot.val().adminName && pswd == childSnapshot.val().adminPassword) {
          dbRef.ref("groups").child(childSnapshot.val().groupName).child("members").child(childSnapshot.val().adminName).set(true);
        } else {
          dbRef.ref("groups").child(childSnapshot.val().groupName).child("members").child(username).set(true);
        }
        document.getElementById("groupNameHeader").textContent = childSnapshot.val().groupName;
        document.getElementById("chatContainer").style.display = "block";
        displayMessages(childSnapshot.val().groupName, database);
        localStorage.setItem('currentName', username);
        localStorage.setItem('currentGroup', gnocData);
        displayMembers(childSnapshot.val().groupName, database);
        setUserOnlineStatus(username);
      });
    } else {
      alert('Check your group name or invitation')
    }
  })
}

// Function to exit the group or deactivate the user
function exitGroup(mm) {
  const groupName = localStorage.getItem("room");
  const memberName = localStorage.getItem("currentName");

  if (
    (localStorage.getItem("custom") != "false" &&
      localStorage.getItem("custom") != undefined &&
      localStorage.getItem("firebaseConfig") == "true" &&
      localStorage.getItem("auth") == "super") ||
    (localStorage.getItem("firebaseConfig") == "true" &&
      localStorage.getItem("auth") == "other")
  ) {
    if (mm) {
      database2
        .ref("groups")
        .child(groupName)
        .child("members")
        .child(memberName)
        .set(false);
      const userStatusRef = database2.ref(
        "groups/" +
        localStorage.getItem("group") +
        "/users/" +
        memberName +
        "/status"
      );
      userStatusRef.set("offline");
    } else if (confirm("Are you sure you want to exit the group?")) {
      // Set the user's value to false
      database2
        .ref("groups")
        .child(groupName)
        .child("members")
        .child(memberName)
        .set(false);
      const userStatusRef = database2.ref(
        "groups/" +
        localStorage.getItem("group") +
        "/users/" +
        memberName +
        "/status"
      );
      userStatusRef.set("offline");
      // Redirect the user to the join group section
      toggleLeft();
    }
  } else {
    if (mm) {
      database1
        .ref("groups")
        .child(groupName)
        .child("members")
        .child(memberName)
        .set(false);
      const userStatusRef = database1.ref(
        "groups/" +
        localStorage.getItem("group") +
        "/users/" +
        memberName +
        "/status"
      );
      userStatusRef.set("offline");
    } else if (confirm("Are you sure you want to exit the group?")) {
      // Set the user's value to false
      database1
        .ref("groups")
        .child(groupName)
        .child("members")
        .child(memberName)
        .set(false);
      const userStatusRef = database1.ref(
        "groups/" +
        localStorage.getItem("group") +
        "/users/" +
        memberName +
        "/status"
      );
      userStatusRef.set("offline");
      // Redirect the user to the join group section
      toggleLeft();
    }
  }
}

function toggleLeft() {
  document.getElementById("chatContainer").style.display = "none";
  firebase.app("app1").auth().onAuthStateChanged((user) => {
    user ? (localStorage.setItem("auth", "super"), showFirebaseConfigInterface(user.uid)) : toggleJoinGroup();
  });
}

window.addEventListener("beforeunload", () => exitGroup("hehe"));


// Function to display the chat interface
function displayChat(groupname, database) {
  const dbRef = database === 'ajinx' ? database1 : database2;

  dbRef.ref("groups").child(groupname).child("messages").on("child_added", function (snapshot) {
    const message = snapshot.val();
    const messageId = snapshot.key;
    const memberName = localStorage.getItem('currentName');

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.id = messageId;
    if (message.sender === memberName) messageDiv.classList.add("mine");

    const messageHeader = document.createElement("div");
    messageHeader.classList.add("messageHeader");
    messageHeader.innerHTML = `<p>${message.sender}</p><b>${new Date(message.timestamp).toLocaleTimeString()}</b>`;
    messageDiv.appendChild(messageHeader);

    const buttons = document.createElement("div");
    buttons.classList.add("buttons");

    ["Reply", "Delete"].forEach(action => {
      const button = document.createElement("button");
      button.textContent = action;
      button.classList.add("material-symbols-outlined");
      button.addEventListener("click", action === "Reply" ?
        () => showReplyInput(messageId) :
        () => {
          if (deleteMessage(groupname, messageId) === "yes") messageDiv.remove();
        });
      buttons.appendChild(button);
    });

    if (message.type === "file") {
      const fileLink = document.createElement("a");
      fileLink.href = message.message;
      fileLink.textContent = "Download File";
      messageDiv.appendChild(fileLink);
      messageDiv.classList.add("file");
    } else {
      const messageContentSpan = document.createElement("span");
      messageContentSpan.textContent = message.message;

      if (message.replyTo !== "none") {
        const replyToMessage = document.getElementById(message.replyTo);
        const replyItem = document.createElement("div");
        replyItem.className = "replyItem";
        replyItem.style = "max-width: 100%; min-width: 100%; display: flex; flex-direction: row; padding: 0; margin-bottom: 5px;";
        replyItem.innerHTML = `
                  <div class="line" style="height: 100%; max-width: 4px; padding: 0; min-width: 4px; min-height: 21px; background: #007bff; margin-left: 10px; margin-right: 10px;"></div>
                  <div class="group" style="padding: 0;">
                      <p>${replyToMessage.querySelector('.messageHeader > p').innerText} 
                          <span>${replyToMessage.querySelector('.messageHeader > b').innerText}</span>
                      </p>
                      <b style="font-size: 16px; line-height: 1; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;margin-bottom:7px;">
                          ${replyToMessage.querySelector('span').innerText}
                      </b>
                  </div>`;
        replyItem.addEventListener("click", event => {
          if (!event.target.closest(".material-symbols-outlined")) {
            replyToMessage.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => {
              replyToMessage.classList.add("active");
              setTimeout(() => replyToMessage.classList.remove("active"), 4000);
            }, 500);
          }
        });
        messageContentSpan.appendChild(replyItem);
      }
      messageDiv.appendChild(messageContentSpan);

      if (memberName === message.sender) {
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("material-symbols-outlined");
        editButton.addEventListener("click", () => {
          const messageInput = document.createElement("textarea");
          messageInput.value = messageContentSpan.textContent;
          messageDiv.replaceChild(messageInput, messageContentSpan);
          adjustTextareaHeight(messageInput);

          const saveButton = document.createElement("button");
          saveButton.classList.add("saveButton");
          saveButton.style = "padding: 7px 20px; font-size: 17px; background: #007bff; border-radius: 8px;";
          saveButton.textContent = "Save";
          buttons.style.display = "none";

          saveButton.addEventListener("click", () => {
            editMessage(groupname, messageId, messageInput.value);
            messageDiv.replaceChild(messageContentSpan, messageInput);
            saveButton.remove();
            buttons.style.display = "flex";
          });
          messageDiv.appendChild(saveButton);
        });
        buttons.appendChild(editButton);
      }
    }
    messageDiv.appendChild(buttons);
    document.getElementById("messages").appendChild(messageDiv);
  });
}

function displayMembers(groupname, database) {
  const dbRef = database === 'ajinx' ? database1 : database2;
  const membersList = document.getElementById("members");
  membersList.innerHTML = "";

  dbRef.ref("groups").orderByChild("groupName").equalTo(groupname).once("value", snapshot => {
    snapshot.forEach(childSnapshot => {
      document.querySelector(".groupHeader .sponsor p:last-child").innerText = childSnapshot.val().adminName;
    });
  });

  dbRef.ref("groups").child(groupname).child("members").on("child_added", snapshot => {
    const memberName = snapshot.key;
    const memberDiv = document.createElement("div");
    memberDiv.id = "member_" + memberName;

    dbRef.ref(`groups/${groupname}/users/${memberName}/status`).on("value", statusSnapshot => {
      memberDiv.innerHTML = `<a>#</a>${memberName} ${statusSnapshot.val() === "online" ? "<b>Online</b>" : ""}`;
    });

    dbRef.ref(`groups/${groupname}/users/${memberName}/typing`).on("value", typingSnapshot => {
      const typingIndicator = memberDiv.querySelector(".typing-indicator");
      if (typingSnapshot.val()) {
        if (!typingIndicator) {
          const newTypingIndicator = document.createElement("span");
          newTypingIndicator.textContent = "Typing";
          newTypingIndicator.classList.add("typing-indicator");
          memberDiv.appendChild(newTypingIndicator);
        }
      } else if (typingIndicator) {
        typingIndicator.remove();
      }
    });

    membersList.appendChild(memberDiv);
  });
}

// Function to send a message
function sendMessage(message, type) {
  const groupName = document.getElementById("groupNameHeader").textContent;
  if (!message) return alert("Please enter a message.");

  const senderName = localStorage.getItem('currentName');
  if (!senderName) return alert("Please provide your name.");

  const replyTo = localStorage.getItem("replyTo");
  const timestamp = Date.now();
  const db = localStorage.getItem("firebaseConfig") == "true" && localStorage.getItem("custom") == "true" ? database2 : database1;

  db.ref("groups").child(groupName).child("messages").push({
    sender: senderName,
    message,
    timestamp,
    type,
    replyTo,
  });

  let scroll = document.querySelector("#messages");
      scroll.scrollTop = scroll.scrollHeight;
      document.getElementById("messages").scrollTo({
        left: 0,
        top: scroll.scrollHeight,
        behavior: "smooth",
      });
      document.getElementById("messages").scrollTo({ left: 0, top: scroll.scrollHeight, behavior: "smooth" });
  messageInput.value = "";
  messageInput.style.height = 'auto';
  document.querySelector('.replyShow').classList.remove('active');
}

// Function to display messages
function displayMessages(groupName, custom) {
  const db = localStorage.getItem("firebaseConfig") == "true" && custom == "true" ? database2 : database1;
  localStorage.setItem("custom", custom);

  db.ref("groups").child(groupName).child("messages").on("child_added", snapshot => {
    const message = snapshot.val();
    const messageId = snapshot.key;
    const messageDiv = createMessageDiv(message, messageId);
    document.getElementById("messages").appendChild(messageDiv);
  });
}

function scrollToBottom() {
  let scroll = document.querySelector("#messages");
  scroll.scrollTop = scroll.scrollHeight;
  scroll.scrollTo({
    left: 0,
    top: scroll.scrollHeight,
    behavior: "smooth",
  });
}

// MutationObserver to observe changes in the #messages div
const messagesDiv = document.getElementById('messages');
const observer = new MutationObserver(scrollToBottom);

observer.observe(messagesDiv, { childList: true });

function createMessageDiv(message, messageId) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.id = messageId;

  if (message.sender === localStorage.getItem('currentName')) {
    messageDiv.classList.add("mine");
  }

  const messageHeader = createMessageHeader(message.sender, message.timestamp);
  messageDiv.appendChild(messageHeader);
  console.log('message header');

  const messageContentSpan = document.createElement("span");
  const textcontentdiv = document.createElement('p');
  textcontentdiv.innerText = message.message;
  messageContentSpan.appendChild(textcontentdiv);

  appendReplyToMessageContent(messageContentSpan, message.replyTo);

  messageDiv.appendChild(messageContentSpan);
  messageDiv.appendChild(createMessageButtons(messageId, message.type, messageContentSpan));

  return messageDiv;
}

function createMessageHeader(sender, timestamp) {
  const messageHeader = document.createElement("div");
  messageHeader.classList.add("messageHeader");

  const senderName = document.createElement("p");
  senderName.textContent = sender;

  const time = document.createElement("b");
  time.textContent = new Date(timestamp).toLocaleTimeString();

  messageHeader.appendChild(senderName);
  messageHeader.appendChild(time);

  return messageHeader;
}

function appendReplyToMessageContent(messageContentSpan, replyTo) {
  if (replyTo === "none") return;

  const id = replyTo;
  const element = document.querySelector(`#${id} > .messageHeader > p`);
  if (!element) return;

  const sender = element.innerText;
  const time = document.querySelector(`#${id} > .messageHeader > b`).innerText;
  function getInnerTextExcludingReplyItem(parentDiv) {
    var textContent = '';
  
    parentDiv.childNodes.forEach(function(childNode) {
      if (!childNode.classList || !childNode.classList.contains('replyItem')) {
        textContent += childNode.textContent.trim() + ' ';
      }
    });

    console.log(textContent.trim());
    return textContent.trim();
  }
  const messageth = getInnerTextExcludingReplyItem(document.querySelector(`#${id} > span`));

  const replyItem = document.createElement("div");
  replyItem.className = "replyItem";
  replyItem.style = "max-width: 100%; min-width: 100%; display: flex; flex-direction: row; padding: 5px; margin-bottom: 5px;margin-right:5px;";
  replyItem.innerHTML = `<div class="line" style="height: 100%; max-width: 4px; padding: 0; min-width: 4px; min-height: 21px; background: #007bff; margin-left: 5px; margin-right: 10px;"></div>
    <div class="group" style="padding: 0;">
      <p style="text-wrap: nowrap;">${sender} <span style="padding: 0; background: 0; text-wrap: nowrap;">${time}</span></p>
      <b style='font-size: 16px; line-height: 1; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'>${messageth}</b>
    </div>`;

  replyItem.addEventListener("click", event => {
    if (event.target.closest(".material-symbols-outlined")) {
      event.preventDefault();
      return;
    }
    const targetSection = document.getElementById(id);
    targetSection.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      targetSection.classList.add("active");
      setTimeout(() => targetSection.classList.remove("active"), 4000);
    }, 500);
  });
console.log(replyItem);
  messageContentSpan.appendChild(replyItem);
}

function createMessageButtons(messageId, type, messageContentSpan) {
  const buttons = document.createElement("div");
  buttons.classList.add("buttons");

  const replyButton = createButton("Reply", () => showReplyInput(messageId));
  buttons.appendChild(replyButton);

  if (type === "file") {
    const fileLink = document.createElement("a");
    fileLink.href = messageContentSpan.textContent;
    fileLink.textContent = "Download File";
    messageContentSpan.textContent = "";
    messageContentSpan.appendChild(fileLink);
    messageContentSpan.parentNode.classList.add("file");
  } else {
    const editButton = createButton("Edit", () => enableMessageEditing(messageId, messageContentSpan, buttons));
    buttons.appendChild(editButton);
  }

  const deleteButton = createButton("Delete", () => {
    if (deleteMessage(messageId) === "yes") messageContentSpan.parentNode.remove();
  });
  buttons.appendChild(deleteButton);

  return buttons;
}

function createButton(text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add("material-symbols-outlined");
  button.addEventListener("click", onClick);
  return button;
}

function enableMessageEditing(messageId, messageContentSpan, buttons) {
  const currentMessageContent = messageContentSpan.textContent;
  const messageInput = document.createElement("textarea");
  messageInput.value = currentMessageContent;

  messageContentSpan.parentNode.replaceChild(messageInput, messageContentSpan);
  adjustTextareaHeight(messageInput);

  const saveButton = createButton("Save", () => {
    const newMessage = messageInput.value;
    editMessage(messageId, newMessage);
    messageContentSpan.textContent = newMessage;
    messageInput.parentNode.replaceChild(messageContentSpan, messageInput);
    saveButton.remove();
    buttons.style.display = "flex";
  });
  saveButton.classList.add("saveButton");
  saveButton.style.cssText = "padding: 7px 20px; font-size: 17px; background: #007bff; border-radius: 8px;";

  buttons.style.display = "none";
  messageContentSpan.parentNode.appendChild(saveButton);
}

localStorage.setItem("replyTo", "none");

function showReplyInput(id) {
  document.getElementById('messageInput').focus();
  const parent = document.querySelector(".replyShow");
  parent.classList.add("active");
  localStorage.setItem("replyTo", id);
  const name = document.querySelector(
    `#${id} > div.messageHeader > p`
  ).innerText;
  const time = document.querySelector(
    `#${id} > div.messageHeader > b`
  ).innerText;
  parent.querySelector(".group p").innerHTML = `${name} <span>${time}</span>`;
  if (!document.getElementById(id).classList.contains("file")) {
    function getInnerTextExcludingReplyItem(parentDiv) {
      var textContent = '';
    
      parentDiv.childNodes.forEach(function(childNode) {
        if (!childNode.classList || !childNode.classList.contains('replyItem')) {
          textContent += childNode.textContent.trim() + ' ';
        }
      });
  
      console.log(textContent.trim());
      return textContent.trim();
    }
    parent.querySelector(".group b").innerText = getInnerTextExcludingReplyItem(document.querySelector(`#${id} > span`));
  } else {
    parent.querySelector(".group b").innerText = document.querySelector(
      `#${id} > a`
    ).innerText;
  }
  parent.addEventListener("click", hehe);
  function hehe(event) {
    if (event.target.closest(".material-symbols-outlined")) {
      event.preventDefault();
      return;
    }
    const targetSection = document.getElementById(id); // Get target section element
    targetSection.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      document.querySelector(`#${id}`).classList.add("active");
      setTimeout(() => {
        document.querySelector(`#${id}`).classList.remove("active");
        parent.removeEventListener("click", hehe);
      }, 4000);
    }, 500); // Adjust the delay as needed to match the smooth scroll duration
  }
}

function adjustTextareaHeight(textarea) {
  textarea.style.height = ""; // Reset the height to auto to prevent it from being constrained by its parent container

  // Set the height of the textarea to fit its content
  const computedStyle = window.getComputedStyle(textarea); // Get the computed style of the textarea
  const paddingTop = parseFloat(computedStyle.paddingTop); // Get the padding-top value as a number
  const paddingBottom = parseFloat(computedStyle.paddingBottom); // Get the padding-bottom value as a number
  const totalHeight = textarea.scrollHeight + paddingTop + paddingBottom; // Calculate the total height of the textarea including padding
  textarea.style.height = totalHeight + "px"; // Set the height of the textarea
}

// Function to edit a message
function editMessage(groupId, messageId, newContent) {
  const databaseRef = getDatabaseRef();
  const messageRef = databaseRef
    .child("groups")
    .child(groupId)
    .child("messages")
    .child(messageId);
  messageRef.update({ message: newContent });
}

// Function to delete a message with confirmation
function deleteMessage(groupId, messageId) {
  const databaseRef = getDatabaseRef();
  const messageRef = databaseRef
    .child("groups")
    .child(groupId)
    .child("messages")
    .child(messageId);

  const isConfirmed = confirm("Are you sure you want to delete this message?");
  if (isConfirmed) {
    messageRef.remove();
    return "yes";
  } else {
    console.log("Message deletion canceled.");
    return "no";
  }
}

// Function to update user's online status
function setUserOnlineStatus(username) {
  const statusRef = getUserStatusRef(username);
  statusRef.set("online");
  statusRef.onDisconnect().set("offline");
}

function setUserTypingStatus(username, isTyping) {
  const typingRef = getUserTypingRef(username);
  typingRef.set(isTyping);
}

function getDatabaseRef() {
  if (
    localStorage.getItem("firebaseConfig") === "true" &&
    localStorage.getItem("custom") === "true" &&
    localStorage.getItem("custom") !== undefined
  ) {
    return database2.ref();
  } else {
    return database1.ref();
  }
}

function getUserStatusRef(username) {
  return getUserRef(username).child("status");
}

function getUserTypingRef(username) {
  return getUserRef(username).child("typing");
}

function getUserRef(username) {
  const group = localStorage.getItem("currentGroup");
  const databaseRef = getDatabaseRef();
  return databaseRef.child("groups").child(group).child("users").child(username);
}

detectUserTyping();

// Function to detect user typing
function detectUserTyping() {
  const messageInput = document.getElementById("messageInput");
  let typingTimer;

  messageInput.addEventListener("input", function () {
    
    messageInput.style.height = '30px';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
    clearTimeout(typingTimer); // Clear the previous timer

    const username = localStorage.getItem('currentName');
    setUserTypingStatus(username, true); // Set typing status

    // Set timer to clear typing status after 2 seconds
    typingTimer = setTimeout(function () {
      setUserTypingStatus(username, false); // Clear typing status
    }, 2000); // Adjust the timeout duration as needed
  });

  messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault(); // Prevent default Enter behavior (new line)
      sendMessage(messageInput.value, 'text');
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault(); // Prevent default Enter behavior
      expandTextarea();
    }
  });

  function expandTextarea() {
    messageInput.style.height = '30px';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
    const cursorPosition = messageInput.selectionStart;
    const textBeforeCursor = messageInput.value.substring(0, cursorPosition);
    const textAfterCursor = messageInput.value.substring(cursorPosition);
    messageInput.value = textBeforeCursor + "\n" + textAfterCursor;
    messageInput.selectionStart = messageInput.selectionEnd = cursorPosition + 1;
  }
}


// Function to handle file preview
function handleFilePreview(event) {
  const file = event.target.files[0];
  const filePreview = document.getElementById("filePreview");
  const fileDetails = document.getElementById("fileDetails");

  // Clear previous preview and details
  filePreview.innerHTML = "";
  fileDetails.innerHTML = "";

  // Display file details
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2); // Convert file size to MB
  fileDetails.innerHTML = `
    <p><strong>File Name:</strong> ${file.name}</p>
    <p><strong>File Type:</strong> ${file.type}</p>
    <p><strong>File Size:</strong> ${fileSizeInMB} MB</p>
  `;

  // Check if the file is an image or video
  if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
    // Create preview element for image or video
    const previewElement = document.createElement(file.type.startsWith("image/") ? "img" : "video");
    previewElement.src = URL.createObjectURL(file);
    previewElement.controls = true;
    filePreview.appendChild(previewElement);
  }

  document.querySelector(".filePopup").classList.remove("hide");
}


// Event listener for file input change
document
  .getElementById("fileInput")
  .addEventListener("change", handleFilePreview);

// Function to handle sending the file
function handleSendFile() {
  const file = document.getElementById("fileInput").files[0]; // Get the selected file
  const storageRef = localStorage.getItem("firebaseConfig") === "true" && localStorage.getItem("custom") === "true" && localStorage.getItem("custom") != undefined ?
    storage2.ref().child("uploads/" + file.name) :
    storage1.ref().child("uploads/" + file.name); // Reference to storage location

  // Upload the file to Firebase Storage
  storageRef.put(file)
    .then(function (snapshot) {
      console.log("File uploaded successfully!");

      // Get the download URL of the uploaded file
      storageRef.getDownloadURL()
        .then(function (downloadURL) {
          // Send the download URL as a message to the chat
          sendMessage(downloadURL, "file");
        })
        .catch(function (error) {
          console.error("Error getting download URL:", error);
        });

      // Clear the file input and preview after uploading
      document.getElementById("fileInput").value = "";
      document.getElementById("filePreview").innerHTML = "";
      document.getElementById("fileDetails").innerHTML = ""; // Clear file details
      document.querySelector(".filePopup").classList.add("hide"); // Hide send button
    })
    .catch(function (error) {
      console.error("Error uploading file:", error);
    });
}


// Event listener for send button click
document.getElementById("sendButton").addEventListener("click", handleSendFile);

function cancelFiles() {
  document.querySelector(".filePopup").classList.add("hide"); // Hide send button
  document.getElementById("fileInput").value = "";
  document.getElementById("filePreview").innerHTML = "";
  document.getElementById("fileDetails").innerHTML = "";
}
// Function to handle link clicks
function handleLinkClick(event) {
  event.preventDefault(); // Prevent the default behavior of the link
  const url = event.target.href; // Get the URL of the clicked link
  document.getElementById("popup-iframe").src = url; // Set the src attribute of the iframe
  document.getElementById("popup-container").style.display = "block"; // Show the popup container
}

// Add event listeners to all links with the class 'popup-link'
const links = document.querySelectorAll("a");
links.forEach((link) => {
  link.addEventListener("click", handleLinkClick);
});

// Function to close the popup
document.getElementById("close-popup").addEventListener("click", function () {
  document.getElementById("popup-container").style.display = "none"; // Hide the popup container
});

// Function to parse query parameters from URL
function parseQueryParams(url) {
  const queryParams = {};
  const queryString = url.split("?")[1];
  if (queryString) {
    const pairs = queryString.split("&");
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      queryParams[key] = decodeURIComponent(value);
    });
  }
  return queryParams;
}

// Function to generate an invitation link
function generateInvitationLink() {
  const invitationCode = document.getElementById("invitationCodeJoin").value; // Get the invitation code
  const baseUrl = window.location.href.split("?")[0]; // Get the base URL without query parameters
  if (
    localStorage.getItem("custom") == "true" &&
    localStorage.getItem("custom") != undefined
  ) {
    const user = firebase.app("app1").auth().currentUser;
    const invitationLink = `${baseUrl}?code=${invitationCode}?ss=${user.uid}`;
    return invitationLink;
  } else {
    const invitationLink = `${baseUrl}?code=${invitationCode}`;
    return invitationLink;
  }
  return invitationLink;
}
// Function to copy text to clipboard
function copyToClipboard(text, fromInvitaionBox) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  if (fromInvitaionBox) {
    alert("Invitation link copied to clipboard!");
  }
}

// Function to handle share link button click
function handleShareLinkButtonClick() {
  const invitationLink = generateInvitationLink(); // Generate the invitation link
  copyToClipboard(invitationLink); // Copy the invitation link to the clipboard
  alert("Invitation link copied to clipboard!");
}

// Add event listener to the share link button
document
  .getElementById("share-link-button")
  .addEventListener("click", handleShareLinkButtonClick);


//toggle between using DB username or temp username
function toggleDbNTemp() {
  const input = localStorage.getItem('currentName');;
  if (input.hasAttribute("disabled")) {
    input.removeAttribute("disabled");
    input.value = "";
  } else {
    input.setAttribute("disabled", "disabled");
    input.value = getUserName(document.querySelector("#account h1").innerText);
  }
}

const resizeOps = () => {
  document.documentElement.style.setProperty(
    "--vh",
    window.innerHeight * 0.01 + "px"
  );
};

resizeOps();
window.addEventListener("resize", resizeOps);

function getUserName(email) {
  // Split the email address at the "@" symbol
  const parts = email.split("@");

  // If the email is valid (contains at least "@" and a part after it), return the first part (username)
  if (parts.length > 1) {
    return parts[0];
  } else {
    // Handle invalid email (optional)
    return "Invalid Email";
  }
}

function toggleGNameAndCode() {
  const invitationCodeInput = document.getElementById("invitationCodeJoin");
  const isChangedToGName = invitationCodeInput.classList.toggle("changedToGName");
  const joinGroupParagraph = document.querySelector("#joinGroup > p:nth-child(5)");

  if (isChangedToGName) {
    invitationCodeInput.placeholder = "Enter group name";
    joinGroupParagraph.innerText = "Join by invitation code";
  } else {
    invitationCodeInput.placeholder = "Enter invitation code";
    joinGroupParagraph.innerText = "Join by group name";
  }
}


function searchMessagesInDiv(searchQuery) {
  console.log(searchQuery);
  const messagesContainer = document.getElementById("messages");
  const messageElements = messagesContainer.getElementsByClassName("message");

  // Convert search query to lower case for case-insensitive comparison
  const lowerCaseQuery = searchQuery.toLowerCase();

  // Loop through all message elements and hide or show them based on the search query
  Array.from(messageElements).forEach((messageElement) => {
    const messageContent = messageElement
      .querySelector("span")
      .textContent.toLowerCase();

    if (messageContent.includes(lowerCaseQuery)) {
      messageElement.style.display = "flex"; // Show message if it matches the query
    } else {
      messageElement.style.display = "none"; // Hide message if it does not match the query
    }
  });
}

if (/Mobi|Android/i.test(navigator.userAgent)) {
  window.location.href = window.location.origin + "/android/index.html";
}

// Function to add username under a key
const addUsername = async (userId, username, el, istrue) => {
  const app1DocRef = firebase
    .app("app1")
    .firestore()
    .collection("users")
    .doc(userId);

  const app2DocRef = firebase
    .app("app1")
    .firestore()
    .collection("usernames")
    .doc(username);

  const usernameQuery = await firebase
    .app("app1")
    .firestore()
    .collection("usernames")
    .where("userId", "==", userId)
    .get();



  // Check if the new username already exists in the second database
  const usernameDoc = await app2DocRef.get();

  if (usernameDoc.exists) {
    if (istrue == 'true') {
      const username2 = username + generateInvitationCode();
      addUsername(userId, username2, el, 'true');
      return;
    }
    if (el != '') {
      el.innerText = "Username already exists.";
      el.style.color = '#ff002b';
    }
    return;
  }

  // Remove the old username entry if it exists
  if (!usernameQuery.empty) {
    const oldUsernameDoc = usernameQuery.docs[0];
    await oldUsernameDoc.ref.delete();
  }

  if (el.id == 'h45fth') {
    document.querySelector('.GSbySignUp').classList.remove('steptwo');
    document.querySelector('.GSbySignUp').style.display = 'none';
    document.querySelector('#account').style.display = 'flex';
  }
  // Set the new username in both databases
  await app1DocRef.set(
    {
      username: username,
    },
    { merge: true }
  );

  await app2DocRef.set({ userId: userId });
};


// Function to get the username from Firestore
const getUsernamebyID = async (userId) => {
  const docRef = firebase
    .app("app1")
    .firestore()
    .collection("users")
    .doc(userId);
  const doc = await docRef.get();
  if (doc.exists) {
    return doc.data().username;
  } else {
    console.log("No such document!");
    return null;
  }
};

function saveUsernamebyInput(username, id) {
  document.querySelector(".username-jjs").classList.remove("active");
  document.querySelector(
    "#account > div.section-account > div.username-jjs > div.p > span"
  ).contentEditable = "false";
  const user = firebase.app("app1").auth().currentUser;
  addUsername(user.uid, username);
  if (id) {
    addUsername(id, username);
  } else {
    const user = firebase.app("app1").auth().currentUser;
    addUsername(user.uid, username);
  }
}

function highlightCode(textarea, istrue) {
  let code = textarea.innerHTML;
  // Regular expressions for highlighting
  const commentRegex = /(?:[^:\/]|^)\/\/.*|\/\*[\s\S]*?\*\//g;
  const keywordRegex = /\b(const|import)\b/g;
  const stringRegex =
    /(?<=(?<!\/\/[^'"]*)apiKey|authDomain|databaseURL|projectId|storageBucket|messagingSenderId|appId):? "https?:\/\/[^"]*"|'https?:\/\/[^']*'|(?<!apiKey|authDomain|databaseURL|projectId|storageBucket|messagingSenderId|appId)'([^'\\]|\\.)*'| "(?<!apiKey|authDomain|databaseURL|projectId|storageBucket|messagingSenderId|appId)([^"\\]|\\.)*"/g;

  // Highlight comments
  code = code.replace(commentRegex, '<span class="comment">$&</span>');

  // Highlight keywords
  code = code.replace(keywordRegex, '<span class="keyword">$&</span>');

  // Highlight strings
  code = code.replace(stringRegex, '<span class="string">$&</span>');

  // Replace newlines with <br> tags
  code = code.replace(/\n/g, "<br>");

  // Update the textarea value with highlighted code
  textarea.innerHTML = code; // Inject highlighted code
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(textarea);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  textarea.focus();
}

function handleKeydown(event) {
  // Check if Ctrl key is pressed along with C, V, or X
  var key = event.keyCode || event.charCode;
  if (
    ((event.ctrlKey || event.metaKey) &&
      (event.key === "c" ||
        event.key === "v" ||
        event.key === "x" ||
        event.key === "a")) ||
    key == 8 ||
    key == 46
  ) {
    return; // Allow copying, pasting, and cutting
  }
  event.preventDefault(); // Prevent default behavior for other keys
}

//switch between inputs in group creating
function changeInputInGS(el, thiss) {
  const spans = document.querySelectorAll('body > div.getStarted > div:nth-child(4) > span');
  spans.forEach(element => {
    element.classList.remove('active');
  })
  thiss.classList.add('active');
  const inputs = document.querySelectorAll('.getStarted input');
  inputs.forEach(element => {
    if (element.id == el) {
      element.style.display = 'flex';
      element.focus();
      return;
    }
    element.style.display = 'none';
  });
}

// check if inputs are ok in format in group creating
function checkInput(element) {
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  switch (element.id) {

    case 'usernameatAcc':
      if (element.value != '') {
        document.querySelector('.setUpProfileGuide > span:nth-child(5)').style.color = '#4eff6a';
        setTimeout(() => {
          document.querySelector('.setUpProfileGuide > span:nth-child(5)').innerText = '';
        }, 500);
      }
      break;
    case 'groupName':
    case 'newRoomName':
      if (element.value.length < 11 && element.value.length > 1 && !(format.test(element.value)) && element.value != 'admin') {
        element.classList.add('ok');
        document.getElementById('error-message').style.color = '#4eff6a';
        setTimeout(() => {
          document.getElementById('error-message').innerText = '';
          document.querySelector('.newRoom span').innerText = '';
        }, 500);
        return;
      }
      element.classList.remove('ok');
      break;

    case 'reg-email':
      function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
      }
      if (validateEmail(element.value) == true) {
        document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(3) > span:nth-child(3)').style.color = '#4eff6a';
        setTimeout(() => {
          document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(3) > span:nth-child(3)').innerText = '';
        }, 500);
      }
      break;


    case 'adminPassword':
    case 'newRoomAdminPswd':
    case 'reg-password':
      if (element.value.length > 6) {
        element.classList.add('ok');
        document.getElementById('error-message').style.color = '#4eff6a';
        document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(4) > span:nth-child(3)').style.color = '#4eff6a';
        setTimeout(() => {
          document.getElementById('error-message').innerText = '';
          document.querySelector('.newRoom span').innerText = '';
          document.querySelector('.rightSide > div:nth-child(1) > div:nth-child(4) > span:nth-child(3)').innerText = '';
        }, 500);
        return;
      }
      element.classList.remove('ok');
      break;

    default:
      if (element.value.length < 11 && element.value.length > 1 && !(format.test(element.value))) {
        element.classList.add('ok');
        document.getElementById('error-message').style.color = '#4eff6a';
        setTimeout(() => {
          document.getElementById('error-message').innerText = '';
          document.querySelector('.newRoom span').innerText = '';
        }, 500);
        return;
      }
      element.classList.remove('ok');
      break;
  }
}


function extractInvitationCodefromLink() {
  const linkValue = document.querySelector("body > div.joinGroup > div.active > input[type=text]").value.trim();
  document.querySelector('.joinGroup > div:nth-child(4)').classList.remove('active');
  function extractCCFromURL(urlString) {
    try {
      const params = new URLSearchParams(new URL(urlString).search);
      let codeValue = params.get('code');
      let ssValue = params.get('ss');
      if (!codeValue && ssValue) {
        const index = ssValue.indexOf('=');
        if (index !== -1) {
          codeValue = ssValue.substring(index + 1);
          return codeValue;
        }
      }
      const index = codeValue ? codeValue.indexOf('?') : -1;
      if (index !== -1) {
        codeValue = codeValue.substring(0, index);
      }
      return codeValue || '';
    } catch (error) {
      console.error('Invalid URL:', error);
      return '';
    }
  }
  const ccValue = extractCCFromURL(linkValue);
  document.querySelector("body > div.joinGroup > div:nth-child(2) > input[type=text]").value = ccValue;
}

function checkInputsJoinSec(element) {
  const joinGroup = document.querySelector("body > div.joinGroup");
  joinGroup.querySelectorAll("input.active").forEach(el => el.classList.remove('active'));
  element.classList.add('active');
}

localStorage.setItem('currentProcess', '');

function joinClickedinJoinSec(el) {
  if (localStorage.getItem('currentProcess') == el.name) {
    return;
  }

  localStorage.setItem('currentProcess', el.name);
  const c = el.innerHTML;
  el.innerHTML = svg;

  document.querySelector('.joinGroup > span:nth-child(7)').innerText = '';
  let inputType, inputValue;

  if (document.querySelector("body > div.joinGroup > div:nth-child(2) > input[type=text]").classList.contains('active')) {
    inputType = 'code';
    inputValue = document.querySelector("body > div.joinGroup > div:nth-child(2) > input[type=text]").value;
  } else {
    inputType = 'name';
    inputValue = document.querySelector("body > div.joinGroup > div:nth-child(6) > input[type=text]").value;
  }

  if (inputValue == '' || inputValue == null) {
    document.querySelector('.joinGroup > span:nth-child(7)').innerText = 'Enter the group name or the invitation code';
    localStorage.setItem('currentProcess', '');
    el.innerHTML = c;
    return;
  }

  const database = (localStorage.getItem('firebaseConfig') !== 'true') ? 'ajinx' : undefined;
  const dbRef = database === 'ajinx' ? database1 : database2;
  const queryRef = dbRef
    .ref("groups")
    .orderByChild(inputType === 'code' ? "invitationCode" : "groupName") //If gnameorcode is 'code', the query orders by the code child property.
    .equalTo(inputValue);

  queryRef.once("value", function (snapshot) {
    if (snapshot.exists()) {
      localStorage.setItem('currentProcess', '');
      el.innerHTML = c;
      askforUsername(inputType, inputValue, database);
    } else {
      localStorage.setItem('currentProcess', '');
      el.innerHTML = c;
      document.querySelector('.joinGroup > span:nth-child(7)').innerText = 'Group does not exist'
    }
  })

}

function askforUsername(type, value, database, pswd) {



  if (pswd) {
    joinGroup(type, value, 'admin', database, pswd);
    return;
  }

  // Show username input and hide other elements
  document.querySelector('.askForUsername').style.display = 'flex';
  document.querySelector('#chatContainer').style.display = 'flex';
  document.querySelector('.getStarted').style.display = 'none';
  document.querySelector('.blur').style.display = 'none';
  document.querySelector('.joinGroup').style.display = 'none';

  // Event listener for submit button
  document.querySelector('.askForUsername button:nth-child(2)').addEventListener('click', () => {
    const el = document.querySelector('.askForUsername button:nth-child(2)');
    if (localStorage.getItem('currentProcess') == el.name) {
      return;
    }

    localStorage.setItem('currentProcess', el.name);
    const c = el.innerHTML;
    el.innerHTML = svg;
    const username = document.querySelector('.askForUsername input').value;
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (username == '' && !(format.test(username)) && username != 'admin') {
      localStorage.setItem('currentProcess', '');
      el.innerHTML = c;
      document.querySelector('.askForUsername span').innerText = 'Username cannot be empty and cannot contain any special characters'
      return;
    }
    localStorage.setItem('currentProcess', '');
    el.innerHTML = c;
    joinGroup(type, value, username, database, pswd);
    document.querySelector('.askForUsername').style.display = 'none';
  });

  // Event listener for cancel button
  document.querySelector('.askForUsername button:nth-child(1)').addEventListener('click', () => {
    document.querySelector('.askForUsername').style.display = 'none';
    document.querySelector('#chatContainer').style.display = 'none';
    document.querySelector('.joinGroup').style.display = 'flex';
    document.querySelector('.getStarted').style.display = 'flex';
    document.querySelector('.blur').style.display = 'flex';
  });
}

function askforAdminPassword(gnameorcode, gnocData, username, database, error) {
  document.querySelector('.askForAdminPswd').style.display = 'flex';
  document.querySelector('.askForAdminPswd p:first-child b').innerText = username;

  if (error) {
    document.querySelector('.askForAdminPswd span').style.display = 'flex';
    document.querySelector('.askForAdminPswd input').value = '';
  }

  document.querySelector('.askForAdminPswd button:nth-child(1)').addEventListener('click', () => {
    document.querySelector('.askForAdminPswd').style.display = 'none';
    askforUsername(gnameorcode, gnocData, database)
  });

  document.querySelector('.askForAdminPswd button:nth-child(2)').addEventListener('click', () => {
    joinGroup(gnameorcode, gnocData, 'admin', database, document.querySelector('.askForAdminPswd input').value);
    document.querySelector('.askForAdminPswd').style.display = 'none';
  });
}

function saveProfile(hehe) {
  const userID = localStorage.getItem('tempID');
  if (document.querySelector("body > div.GSbySignUp.steptwo > div.rightSide > div.setUpProfileGuide > div.usernameInput > input[type=text]").value == '') {
    document.querySelector('.setUpProfileGuide > span:nth-child(5)').style.color = '#ff002b';
    document.querySelector('.setUpProfileGuide > span:nth-child(5)').innerText = 'Username cannot be empty';
    return;
  }
  const user = firebase.app("app1").auth().currentUser;
  const username = document.querySelector('.usernameInput > input:nth-child(2)').value;
  addUsername(user.uid, username, document.querySelector('.setUpProfileGuide > span:nth-child(5)'));
  const firestore = firebase.app("app1").firestore();
  const input = document.querySelector("body > div.GSbySignUp > div.rightSide > div.setUpProfileGuide > div.highlighted-code").textContent;

  const config = {};
  const keys = ["apiKey", "authDomain", "databaseURL", "projectId", "storageBucket", "messagingSenderId", "appId"];

  let allKeysFound = true;
  keys.forEach(key => {
    const match = input.match(new RegExp(`${key}: "([^"]*)"`));
    if (match) {
      config[key] = match[1];
    } else {
      allKeysFound = false;
    }
  });

  if (hehe == 'true') {
    document.querySelector('.setUpProfileGuide > span:nth-child(8)').innerHTML = '';
    return;
  }

  if (!allKeysFound) {
    document.querySelector('.setUpProfileGuide > span:nth-child(8)').innerHTML = `Check your firebase config again.<br>
  <b>Ignore<b></b></b>`;
    document.querySelector('.setUpProfileGuide > span:nth-child(8) > b:nth-child(2)').addEventListener('click', () => {
      saveProfile('true');
    })
  } else {
    firestore
      .collection("users")
      .doc(userID)
      .set({ firebaseConfig: config })
      .then(() => {
        console.log("Firebase config saved successfully");
        document.querySelector('.setUpProfileGuide > span:nth-child(8)').innerHTML = '';
        document.querySelector(".firebaseConfigInterface").style.display = "none";
        document.querySelector('.progressBar').style.display = 'flex';
        document.querySelector('.progressBar p').innerText = 'This page will be reloaded!';
        setTimeout(() => {
          fetchFirebaseConfig(user.uid);
        }, 200);
      })
      .catch(console.error);
  }

}

function anyfunction(thiss) {
  if (thiss.value == '') {
    document.querySelector('.setUpProfileGuide > div:nth-child(2) > div:nth-child(2) > span:nth-child(2)').innerText = '@' + getUserName(document.querySelector('.setUpProfileGuide > div:nth-child(2) > div:nth-child(2) > p:nth-child(1)').innerText)
    return;
  }
  document.querySelector('.setUpProfileGuide > div:nth-child(2) > div:nth-child(2) > span:nth-child(2)').innerText = '@' + thiss.value;
}

const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="64px" height="64px" viewBox="0 0 128 128" xml:space="preserve"><g><path d="M75.4 126.63a11.43 11.43 0 0 1-2.1-22.65 40.9 40.9 0 0 0 30.5-30.6 11.4 11.4 0 1 1 22.27 4.87h.02a63.77 63.77 0 0 1-47.8 48.05v-.02a11.38 11.38 0 0 1-2.93.37z" fill="#ffffff"/><animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="1800ms" repeatCount="indefinite"></animateTransform></g></svg>`;

function changetoLoading(thiss) {
  const content = thiss.name;
  localStorage.setItem('currentProcess', content);
  alert(content);
  thiss.innerHTML = svg;
}

