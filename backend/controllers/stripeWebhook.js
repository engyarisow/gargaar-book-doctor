import Stripe from "stripe";
import appointmentModel from "../models/appointmentModel.js";
import consultationsModel from "../models/consultationsModel.js";
import doctorModel from "../models/doctorModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // .env ku dar tan haddii aad production geyso

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status === "paid") {
      const { appointmentId, docId, slotDate, slotTime, type } = session.metadata;

      if (!appointmentId) return res.status(200).send("No appointmentId metadata");

      const Model = type === "consultation" ? consultationsModel : appointmentModel;
      const record = await Model.findById(appointmentId);

      if (!record) return res.status(200).send("Record not found");

      // IDEMPOTENCY: Hubi in Front-end-ku uusan iga hormarin
      if (record.payment === true) {
        return res.status(200).json({ received: true });
      }

      await Model.findByIdAndUpdate(appointmentId, {
        payment: true,
        status: "scheduled"
      });

      await doctorModel.findByIdAndUpdate(docId, {
        $addToSet: { [`slots_booked.${slotDate}`]: slotTime },
        $unset: { [`reservedSlots.${slotDate}.${slotTime}`]: "" }
      });
    }
  }

  res.json({ received: true });
};