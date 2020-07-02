/*** User login tracking
 * auth object listener
 * logged in user checks (seenDemo, isCustomer)
 * logout event handler
 */

const logout = $("#logoutBtn");
const auth = firebase.auth();
const myDB = firebase.firestore(); // Firestore DB
const fbStorage = firebase.storage().ref(); // FB Storage
var userID = "";

// state tracking object
const gameState = {
	hasSeenDemo: false,
	isCustomer: false,
	loggedIn: false,
	configSelected: false,
	uploadLimitReached: false,
	uploadCount: 0,
	configCount: 0,
};

// check if user logged in --> hide/show login/out buttons accordingly
auth.onAuthStateChanged((fbUser) => {
	if (fbUser) {
		userID = fbUser.uid;
		$("#loginBtn").hide();
		$("#logoutBtn").show();
		gameState.loggedIn = true;

		//check if user has seen Demo & if stripe customer
		checkSeenDemo(userID);
		checkCustomerStatus(userID);
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

/* check inital gamestate params */

// check if user has seen upload demo
function checkSeenDemo(userID) {
	let docRef = myDB.collection("user-configs").doc(userID);
	docRef
		.get()
		.then((doc) => {
			if (doc.exists && doc.data().seenDemo) {
				gameState.hasSeenDemo = true;
			}
			return;
		})
		.catch((error) => {
			console.log("Error getting document:", error);
		});
}

function checkCustomerStatus(userID) {
	let docRef = myDB.collection("stripe-customers").doc(userID);
	docRef
		.get()
		.then((doc) => {
			if (doc.exists) gameState.isCustomer = true;
			return;
		})
		.catch((error) => {
			console.log("Check customer error: ", error);
		});
}
