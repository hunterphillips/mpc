var logout = $("#logoutBtn");
const auth = firebase.auth();
var userID = "";
var loggedIn = false;

// check if user logged in --> hide/show login/out buttons accordingly
auth.onAuthStateChanged(fbUser => {
	if (fbUser) {
		userID = fbUser.uid;
		// console.log(fbUser);
		$("#loginBtn").hide();
		$("#logoutBtn").show();
		loggedIn = true;
	} else {
		$("#loginBtn").show();
		$("#logoutBtn").hide();
		console.log("not logged in");
		loggedIn = false;
	}
});

// logout
logout.click(() => {
	auth
		.signOut()
		.then(() => {
			console.log("logout successful");
			return location.reload();
		})
		.catch(error => {
			console.log("Logout Error: ", error);
		});
});
