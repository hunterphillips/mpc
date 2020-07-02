// TODO: validate email exists? // b@c.com > password123
const login = $("#loginBtn");
const signUp = $("#signupBtn");
const errorMsg = $("#loginError");
const backBtn = $("#backBtn");
// use document obj to access native html .checkValidity()
const emailInput = document.querySelector("#userEmail");
const passwordInput = document.querySelector("#userPassword");
// Firestore DB
const firebaseDB = firebase.firestore();

var auth = firebase.auth();

// sign up click
signUp.click((e) => {
	let email = emailInput.value.trim();
	let password = passwordInput.value.trim();
	if (!validateLoginFields(emailInput, email, password)) return;
	auth
		.createUserWithEmailAndPassword(email, password)
		.then((e) => {
			// initialize user-config document, add 'seenDemo' field
			firebaseDB.collection("user-configs").doc(e.user.uid).set({
				seenDemo: false,
			});
			return (window.location.href = "/");
		})
		.catch((err) => {
			console.log("Registration Error", err);
			if (err.code && err.code.indexOf("email-already-in-use") > -1) {
				loginError(err.message);
			}
		});
});

// login click
login.click((e) => {
	loginUser();
});

// password 'Enter' key press
$("#userPassword").keypress((e) => {
	if (e.key === "Enter") {
		loginUser();
	}
});

//todo: remove
const testUsers = ["b@c.com", "a@d.com", "benlaws@test.com", "jorat@test.com"];
// login
function loginUser() {
	// TODO: REMOVE
	if (testUsers.indexOf(emailInput.value) < 0) return;

	let email = emailInput.value.trim();
	let password = passwordInput.value.trim();
	if (!validateLoginFields(emailInput, email, password)) {
		return;
	}
	// redirect to home page or show error
	auth
		.signInWithEmailAndPassword(email, password)
		.then((e) => {
			return (window.location.href = "/");
		})
		.catch((err) => {
			if (err.code) {
				if (err.code.includes("user-not-found")) {
					return loginError(
						`User not found, select <code>Sign Up</code> to register a new user`
					);
				}
				if (err.code.includes("wrong-password"))
					return loginError("Invalid email/password combination");
			}
			return console.log("Error", err);
		});
}

/*  field validation
    check if fields are empty
    use html email format check & check for '.com' in string */
function validateLoginFields(emailElement, email, password) {
	if (email === "" || password === "")
		return loginError("Please enter a valid email & password");
	if (
		!emailElement.checkValidity() ||
		!/\S+@\S+\.\S+/.test(email) ||
		!email.endsWith("com")
	)
		return loginError("Please enter a valid email address");

	if (password.length < 6)
		return loginError("Please use a password of 6 or more characters");

	return true;
}

// fade in/out form error msg, disable buttons temporarily
function loginError(msg) {
	errorMsg.html(msg);
	errorMsg.fadeIn().delay(4000).fadeOut();
	$("#loginBtnWrap .login-btn").fadeTo(750, 0.4).prop("disabled", true);
	setTimeout(() => {
		$("#loginBtnWrap .login-btn").prop("disabled", false).fadeTo(250, 1);
	}, 4400);
	return false;
}

// back to home pg
backBtn.click(() => (window.location.href = "/"));
