// import * as firebase from "firebase";
// import "firebase/firestore";
// const firebase = require("firebase");
// require("firebase/firestore");

//Stripe.setPublishableKey(/* TODO: add your stripe publishable key */);
var stripe = Stripe("pk_test_edOrElul43Z9ukkHCDfy68gG00UgG9OFJP");

var firebaseUI = new firebaseui.auth.AuthUI(firebase.auth());
var firebaseAuthOptions = {
	callbacks: {
		signInSuccess: (currentUser, credential, redirectUrl) => {
			return false;
		},
		uiShown: () => {
			document.getElementById("loader").style.display = "none";
		},
	},
	signInFlow: "popup",
	signInSuccessUrl: "/",
	signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
	tosUrl: "/",
};
firebase.auth().onAuthStateChanged((firebaseUser) => {
	if (firebaseUser) {
		document.getElementById("loader").style.display = "none";
		app.currentUser = firebaseUser;
		app.listen();
	} else {
		firebaseUI.start("#firebaseui-auth-container", firebaseAuthOptions);
		app.currentUser = null;
	}
});
var app = new Vue({
	el: "#app",
	data: {
		currentUser: null,
		sources: {},
		stripeCustomerInitialized: false,
		newCreditCard: {
			number: "4242424242424242",
			cvc: "111",
			exp_month: 1,
			exp_year: 2020,
			address_zip: "00000",
		},
		charges: {},
		newCharge: {
			source: null,
			amount: 2000,
		},
	},
	ready: () => {},
	methods: {
		listen: function () {
			firebase
				.firestore()
				.collection("stripe_customers")
				.doc(`${this.currentUser.uid}`)
				.onSnapshot(
					(snapshot) => {
						this.stripeCustomerInitialized = snapshot.data() !== null;
					},
					() => {
						this.stripeCustomerInitialized = false;
					}
				);
			firebase
				.firestore()
				.collection("stripe_customers")
				.doc(`${this.currentUser.uid}`)
				.collection("sources")
				.onSnapshot(
					(snapshot) => {
						let newSources = {};
						snapshot.forEach((doc) => {
							const id = doc.id;
							newSources[id] = doc.data();
						});
						this.sources = newSources;
					},
					() => {
						this.sources = {};
					}
				);
			firebase
				.firestore()
				.collection("stripe_customers")
				.doc(`${this.currentUser.uid}`)
				.collection("charges")
				.onSnapshot(
					(snapshot) => {
						let newCharges = {};
						snapshot.forEach((doc) => {
							const id = doc.id;
							newCharges[id] = doc.data();
						});
						this.charges = newCharges;
					},
					() => {
						this.charges = {};
					}
				);
		},
		submitNewCreditCard: function () {
			Stripe.card.createToken(
				{
					number: this.newCreditCard.number,
					cvc: this.newCreditCard.cvc,
					exp_month: this.newCreditCard.exp_month,
					exp_year: this.newCreditCard.exp_year,
					address_zip: this.newCreditCard.address_zip,
				},
				(status, response) => {
					if (response.error) {
						this.newCreditCard.error = response.error.message;
					} else {
						firebase
							.firestore()
							.collection("stripe_customers")
							.doc(this.currentUser.uid)
							.collection("tokens")
							.add({ token: response.id })
							.then(() => {
								this.newCreditCard = {
									number: "",
									cvc: "",
									exp_month: 1,
									exp_year: 2017,
									address_zip: "",
								};
								return;
							})
							.catch((err) => {
								console.log("Credit card submit error ", err);
							});
					}
				}
			);
		},
		submitNewCharge: function () {
			firebase
				.firestore()
				.collection("stripe_customers")
				.doc(this.currentUser.uid)
				.collection("charges")
				.add({
					source: this.newCharge.source,
					amount: parseInt(this.newCharge.amount),
				});
		},
		signOut: function () {
			firebase.auth().signOut();
		},
	},
});
