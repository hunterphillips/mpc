/*** User login tracking
 * auth object listener
 * logout event handler
 */

const logout = $("#logoutBtn");
const auth = firebase.auth();
var userID = "";

// state tracking object
const gameState = {};
gameState.loggedIn = false;

// check if user logged in --> hide/show login/out buttons accordingly
auth.onAuthStateChanged((fbUser) => {
	if (fbUser) {
		userID = fbUser.uid;
		// console.log(fbUser);
		$("#loginBtn").hide();
		$("#logoutBtn").show();
		gameState.loggedIn = true;
	} else {
		$("#loginBtn").show();
		$("#logoutBtn").hide();
		console.log("not logged in");
		gameState.loggedIn = false;
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
		.catch((error) => {
			console.log("Logout Error: ", error);
		});
});
