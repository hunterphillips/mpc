var logout = $("#logoutBtn");
var auth = firebase.auth();
var loggedIn = false;

// check if user logged in --> hide/show login/out buttons accordingly
auth.onAuthStateChanged(fbUser => {
	if (fbUser) {
		console.log(fbUser);
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
			location.reload();
		})
		.catch(error => {
			console.log("Logout Error: ", error);
		});
});
