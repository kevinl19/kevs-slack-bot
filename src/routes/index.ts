import { Response } from 'express';
import Stripe from 'stripe';
import { ModifiedRequest } from '../type';
import StripeEventService from '../services/stripeEventService';

interface HandleStripeEventParams {
  stripeService: StripeEventService;
}

const StripeErrorTypes = [
  'card_error',
  'invalid_request_error',
  'api_error',
  'idempotency_error',
  'rate_limit_error',
  'authentication_error',
  'invalid_grant',
];

const isStripeError = (object: any): object is Stripe.StripeError =>
  !!object.type && StripeErrorTypes.includes(object.type);

const handleStripeEvent = ({ stripeService }: HandleStripeEventParams) => [
  async (req: ModifiedRequest, res: Response) => {
    const { rawBody: payload, headers: { 'stripe-signature': signature } } = req;

    if (!signature) {
      res.sendStatus(401);
      return;
    } else if (!payload) {
      res.status(400).send('No payload detected');
      return;
    }

    const response = await stripeService.verify(payload, signature);
    if (!response || isStripeError(response)) {
      res.status(400).send(`Error verifying webhook: ${response}`);
      return;
    }

    const eventHandled = await stripeService.handleEvent(response);
    if (!eventHandled) {
      // Do something
    }

    // Return a 200 res to acknowledge receipt of the event
    res.send();
  },
];

export default handleStripeEvent;
