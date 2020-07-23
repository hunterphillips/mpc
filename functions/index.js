const functions = require("firebase-functions");
const express = require("express");
const path = require("path");
const app = express();
// Set your secret key. TODO: Remember to switch to your live secret key in production! -- https://dashboard.stripe.com/account/apikeys
const stripe = require("stripe")("sk_test_fauQID8oDry7MelE2VWc4dKG00xbRejPXI");

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, "public/")));

// stripe
app.use(
	express.json({
		// We need the raw body to verify webhook signatures.
		// Let's compute it only when hitting the Stripe webhook endpoint.
		verify: function (req, res, buf) {
			if (req.originalUrl.startsWith("/webhook")) {
				req.rawBody = buf.toString();
			}
		},
	})
);

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/default.html"));
});

app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "public/userAuth.html"));
});

app.get("/payments", (req, res) => {
	res.sendFile(path.join(__dirname, "public/payments.html"));
});

// Calculate the order total on the server to prevent people from directly manipulating the amount on the client
const calculateOrderAmount = (items) => {
	// TODO: Replace this constant with a calculation of the order's amount
	return 69;
};

app.post("/create-payment-intent", async (req, res) => {
	const { items, currency } = req.body;
	// Create a PaymentIntent with the order amount and currency
	const paymentIntent = await stripe.paymentIntents.create({
		amount: calculateOrderAmount(items),
		currency: currency,
	});

	// Send publishable key and PaymentIntent details to client
	res.send({
		publishableKey: "pk_test_edOrElul43Z9ukkHCDfy68gG00UgG9OFJP",
		clientSecret: paymentIntent.client_secret,
	});
});

// Create a new customer object
app.post("/create-customer", async (req, res) => {
	const customer = await stripe.customers.create({
		email: req.body.email,
		name: req.body.name,
	});
	// save the customer.id in database
	res.send({ customer });
});

// Attach the payment method to the customer
app.post("/create-subscription", async (req, res) => {
	try {
		await stripe.paymentMethods.attach(req.body.paymentMethodId, {
			customer: req.body.customerId,
		});
	} catch (error) {
		return res.status("402").send({ error: { message: error.message } });
	}
	// Change the default invoice settings on the customer to the new payment method
	await stripe.customers.update(req.body.customerId, {
		invoice_settings: {
			default_payment_method: req.body.paymentMethodId,
		},
	});

	// Create the subscription
	const subscription = await stripe.subscriptions.create({
		customer: req.body.customerId,
		items: [{ price: req.body.priceId }], // strip test price: "price_1Gq7ZTDgKzLsQnswM0ZTDffl"
		expand: ["latest_invoice.payment_intent"],
	});

	return res.send(subscription);
});

//
app.post("/retry-invoice", async (req, res) => {
	// Set the default payment method on the customer
	try {
		await stripe.paymentMethods.attach(req.body.paymentMethodId, {
			customer: req.body.customerId,
		});
		await stripe.customers.update(req.body.customerId, {
			invoice_settings: {
				default_payment_method: req.body.paymentMethodId,
			},
		});
	} catch (error) {
		// in case card_decline error
		return res
			.status("402")
			.send({ result: { error: { message: error.message } } });
	}

	const invoice = await stripe.invoices.retrieve(req.body.invoiceId, {
		expand: ["payment_intent"],
	});
	return res.send(invoice);
});

// remove subscription
app.post("/cancel-subscription", async (req, res) => {
	const deletedSubscription = await stripe.subscriptions.del(
		req.body.subscriptionId
	);
	res.send(deletedSubscription);
});

// read local file contents to get list of default sound files
const fs = require("fs");
let sampleNames = fs.readdirSync(path.join(__dirname, "public/audio/"));
const drumNames = fs.readdirSync(path.join(__dirname, "public/audio/drums"));
const atmosphereSounds = fs.readdirSync(
	path.join(__dirname, "public/audio/atmosphere")
);

// remove folder names from list (ex. drums)
sampleNames = sampleNames.filter((name) => {
	return name.indexOf(".mp3") > 0;
});

// trim extension from file names
sampleNames.forEach((o, i, a) => (a[i] = a[i].replace(".mp3", "")));
drumNames.forEach((o, i, a) => (a[i] = a[i].replace(".mp3", "")));
atmosphereSounds.forEach((o, i, a) => (a[i] = a[i].replace(".mp3", "")));

// GET to fetch sound file names
app.get("/getDefaultSounds", async (req, res) => {
	let fileResponse = {
		samples: sampleNames,
		drums: drumNames,
		atmosphere: atmosphereSounds,
	};
	res.send(fileResponse);
});

exports.app = functions.https.onRequest(app);
