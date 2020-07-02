/* eslint-disable consistent-return */

/**
 *
 */

// stripe publishable key
var stripe = Stripe("pk_test_edOrElul43Z9ukkHCDfy68gG00UgG9OFJP");
var elements = stripe.elements();
const auth = firebase.auth();
const fbDB = firebase.firestore(); // Firestore DB
let userID = "";
let userEmail = "";
const customer = { id: "", paymentMethod: false };

// get logged in user info > check if existing customer
auth.onAuthStateChanged((fbUser) => {
	if (fbUser) {
		userID = fbUser.uid;
		userEmail = fbUser.email;
		//TODO: ROMOVE
		if (userID !== "4bBrOdBPNITmBqu9l2VrnEpapMf1") {
			return (window.location.href = "/");
		}
		let docRef = fbDB.collection("stripe-customers").doc(userID);
		docRef
			.get()
			.then((doc) => {
				if (doc.exists && doc.data().id) {
					customer.id = doc.data().id;
					if (doc.data().payment_method_id) {
						console.log("payment method defined", doc.data().payment_method_id);
						customer.paymentMethod = doc.data().payment_method_id;
					}
				}
				return;
			})
			.catch((error) => {
				console.log("Error getting document:", error);
			});
	} else {
		console.log("unauthorized user!! gtfo");
	}
});

// create card element in payment form
var card = elements.create("card", {
	iconStyle: "solid",
	style: {
		base: {
			iconColor: "#8898AA",
			color: "white",
			lineHeight: "36px",
			fontWeight: 300,
			fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
			fontSize: "19px",

			"::placeholder": {
				color: "#8898AA",
			},
		},
		invalid: {
			iconColor: "#e85746",
			color: "#e85746",
		},
	},
	classes: {
		focus: "is-focused",
		empty: "is-empty",
	},
});
card.mount("#card-element");

// input blur, focus fx
var inputs = document.querySelectorAll("input.field");
Array.prototype.forEach.call(inputs, (input) => {
	input.addEventListener("focus", () => {
		input.classList.add("is-focused");
	});
	input.addEventListener("blur", () => {
		input.classList.remove("is-focused");
	});
	input.addEventListener("keyup", () => {
		if (input.value.length === 0) {
			input.classList.add("is-empty");
		} else {
			input.classList.remove("is-empty");
		}
	});
});

card.on("change", (event) => {
	handleCustomerToken(event);
});

// card element form submit
document.querySelector("form").addEventListener("submit", (e) => {
	e.preventDefault();
	var form = document.querySelector("form");
	var extraDetails = {
		name: form.querySelector("input[name=cardholder-name]").value,
	};
	stripe
		.createToken(card, extraDetails)
		.then(handleCustomerToken)
		.catch((err) => {
			console.log("CREATE TOKEN Error ", err);
		});
});

// use stripe generated token
function handleCustomerToken(result) {
	var successElement = document.querySelector(".success");
	var errorElement = document.querySelector(".error");
	successElement.classList.remove("visible");
	errorElement.classList.remove("visible");

	if (result.token) {
		console.log("payment result? ", result);
		// Use the token to create a charge or a customer
		successElement.classList.add("visible");
		let customerName = $("#cardholdeName").val();
		//TODO: product selection
		let priceId = "price_1Gq7ZTDgKzLsQnswM0ZTDffl";
		createStripeCustomer(customerName, priceId, customer);
	} else if (result.error) {
		errorElement.textContent = result.error.message;
		errorElement.classList.add("visible");
	}
}

// create customer in Stripe
function createStripeCustomer(customerName, priceId, customer) {
	let billingEmail = userEmail;
	if (customer.id === "") {
		return fetch("/create-customer", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: billingEmail,
				name: customerName,
			}),
		})
			.then((res) => {
				return res.json();
			})
			.then((result) => {
				console.log("createStripeCustomer result: ", result);
				let customerID = result.customer.id;
				addFirebaseCustomer(customerID);
				createPaymentMethod(card, customerID, priceId, customer);
				return result;
			});
	} else {
		console.log("customer already exists", customer.id);
		//createPaymentMethod(card, customer.id, priceId, customer);
	}
}

// add strip customer in FireStore
function addFirebaseCustomer(customerID) {
	fbDB
		.collection("stripe-customers")
		.doc(userID)
		.set({
			id: customerID,
		})
		.then(() => {
			return console.log("fb customer successfully written!");
		})
		.catch((error) => {
			return console.error("Error writing fb customer: ", error);
		});
}

// create customer payment method > use to add Subscription
function createPaymentMethod(cardElement, customerId, priceId, customer) {
	if (!customer.paymentMethod) {
		return stripe
			.createPaymentMethod({
				type: "card",
				card: cardElement,
			})
			.then((result) => {
				if (result.error) {
					return displayError(error);
				} else {
					// store paymentID in firebase
					fbDB.collection("stripe-customers").doc(userID).set(
						{
							payment_method_id: result.paymentMethod.id,
						},
						{ merge: true }
					);
					return createSubscription({
						customerId: customerId,
						paymentMethodId: result.paymentMethod.id,
						priceId: priceId,
					});
				}
			});
	} else {
		// createSubscription()
	}
}

// TODO: cancel subscription, upgrade
function createSubscription({ customerId, paymentMethodId, priceId }) {
	return (
		fetch("/create-subscription", {
			method: "post",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				customerId: customerId,
				paymentMethodId: paymentMethodId,
				priceId: priceId,
			}),
		})
			.then((response) => {
				return response.json();
			})
			// If the card is declined, display an error to the user.
			.then((result) => {
				if (result.error) {
					throw result;
				}
				return result;
			})
			// Normalize the result to contain the object returned by Stripe.
			.then((result) => {
				console.log("create-basic-sub", result);
				return {
					paymentMethodId: paymentMethodId,
					priceId: priceId,
					subscription: result,
				};
			})
			// Some payment methods require a customer to be on session to complete the payment process.
			// Check the status of the payment intent to handle these actions.
			.then(handleCustomerActionRequired)

			// If attaching this card to a Customer object succeeds,but attempts to charge fail, you get a requires_payment_method error.
			.then(handlePaymentMethodRequired)
			// No more actions required. Provision your service for the user.
			.then(onSubscriptionComplete)
			.catch((error) => {
				// An error has happened. Display the failure to the user here.
				// We utilize the HTML element we created. // showCardError(error);
				console.log("create subscription error?", error);
				$(".outcome .error").html(error);
			})
	);
}

// show successUI > store productID > route to home page
function onSubscriptionComplete(result) {
	// Payment was successful.
	if (result.subscription.status === "active") {
		console.log("onSubscriptionComplete successful payment", result);
		// store subscription level (product) the customer subscribed to.
		let productID = result.subscription.items.data[0].price.product;
		if (productID) {
			fbDB.collection("stripe-customers").doc(userID).set(
				{
					product_id: productID,
				},
				{ merge: true }
			);
		}
		// TODO: show a success message to your customer > route back to home page
		setTimeout(() => {
			window.location.href = "/";
		}, 2000);
	}
}

//
function handleCustomerActionRequired({
	subscription,
	invoice,
	priceId,
	paymentMethodId,
	isRetry,
}) {
	if (subscription && subscription.status === "active") {
		// Subscription is active, no customer actions required.
		return { subscription, priceId, paymentMethodId };
	}

	// If it's a first payment attempt, the payment intent is on the subscription latest invoice.
	// If it's a retry, the payment intent will be on the invoice itself.
	let paymentIntent = invoice
		? invoice.payment_intent
		: subscription.latest_invoice.payment_intent;

	if (
		paymentIntent.status === "requires_action" ||
		(isRetry === true && paymentIntent.status === "requires_payment_method")
	) {
		return stripe
			.confirmCardPayment(paymentIntent.client_secret, {
				payment_method: paymentMethodId,
			})
			.then((result) => {
				if (result.error) {
					// Start code flow to handle updating the payment details.
					// Display error message in your UI.
					// The card was declined (i.e. insufficient funds, card has expired, etc).
					throw result;
				} else {
					if (result.paymentIntent.status === "succeeded") {
						// Show a success message to your customer.
						// There's a risk of the customer closing the window before the callback.
						// We recommend setting up webhook endpoints later in this guide.
						return {
							priceId: priceId,
							subscription: subscription,
							invoice: invoice,
							paymentMethodId: paymentMethodId,
						};
					}
					return console.log("payment status?", result.paymentIntent.status);
				}
			})
			.catch((error) => {
				displayError(error);
			});
	} else {
		// No customer action needed.
		return { subscription, priceId, paymentMethodId };
	}
}

//
function handlePaymentMethodRequired({
	subscription,
	paymentMethodId,
	priceId,
}) {
	if (subscription.status === "active") {
		// subscription is active, no customer actions required.
		return { subscription, priceId, paymentMethodId };
	} else if (
		subscription.latest_invoice.payment_intent.status ===
		"requires_payment_method"
	) {
		// Using localStorage to manage the state of the retry here,
		// feel free to replace with what you prefer.
		// Store the latest invoice ID and status.
		localStorage.setItem("latestInvoiceId", subscription.latest_invoice.id);
		localStorage.setItem(
			"latestInvoicePaymentIntentStatus",
			subscription.latest_invoice.payment_intent.status
		);
		// eslint-disable-next-line no-throw-literal
		throw { error: { message: "Your card was declined." } };
	} else {
		return { subscription, priceId, paymentMethodId };
	}
}

//
function retryInvoiceWithNewPaymentMethod(
	customerId,
	paymentMethodId,
	invoiceId,
	priceId
) {
	return (
		fetch("/retry-invoice", {
			method: "post",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				customerId: customerId,
				paymentMethodId: paymentMethodId,
				invoiceId: invoiceId,
			}),
		})
			.then((response) => {
				return response.json();
			})
			// If the card is declined, display an error to the user.
			.then((result) => {
				if (result.error) {
					// The card had an error when trying to attach it to a customer.
					throw result;
				}
				return result;
			})
			// Normalize the result to contain the object returned by Stripe.
			// Add the addional details we need.
			.then((result) => {
				return {
					// Use the Stripe 'object' property on the
					// returned result to understand what object is returned.
					invoice: result,
					paymentMethodId: paymentMethodId,
					priceId: priceId,
					isRetry: true,
				};
			})
			// Some payment methods require a customer to be on session. Check the status of the
			// payment intent to handle these actions.
			.then(handlePaymentThatRequiresCustomerAction)
			// No more actions required. Provision your service for the user.
			.then(onSubscriptionComplete)
			.catch((error) => {
				// An error has happened. Display the failure to the user here.
				// We utilize the HTML element we created.
				displayError(error);
			})
	);
}

// allow customers to cancel their subscriptions
function cancelSubscription() {
	return fetch("/cancel-subscription", {
		method: "post",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			subscriptionId: subscriptionId,
		}),
	})
		.then((response) => {
			return response.json();
		})
		.then((cancelSubscriptionResponse) => {
			// TODO: Display to the user that the subscription has been cancelled.
			// update database to remove the Stripe subscription ID and limit access
			return console.log("subsctiption successfully cancelled");
		});
}
