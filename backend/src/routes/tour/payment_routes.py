from flask import Blueprint, request, jsonify
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

payment_routes = Blueprint('payments', __name__)

# Initialize Stripe with secret key from environment
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_51Q...')  # Replace with your test key

@payment_routes.route('/create-intent', methods=['POST'])
def create_payment_intent():
    """Create a Stripe payment intent"""
    try:
        data = request.get_json()
        amount = data.get('amount')
        currency = data.get('currency', 'vnd')
        tour_id = data.get('tour_id')

        if not amount:
            return jsonify({
                'success': False,
                'message': 'Amount is required'
            }), 400

        # Convert VND to smallest currency unit (Stripe expects amount in smallest unit)
        # For VND, 1 VND = 1 unit (no conversion needed)
        # For USD, 1 USD = 100 cents
        amount_in_cents = int(amount) if currency.lower() == 'vnd' else int(amount * 100)

        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency=currency.lower(),
            metadata={
                'tour_id': str(tour_id) if tour_id else '',
            },
            # Configure automatic payment methods without redirects
            automatic_payment_methods={
                'enabled': True,
                'allow_redirects': 'never',  # Disable redirect-based payment methods
            },
        )

        return jsonify({
            'success': True,
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id
        }), 200

    except stripe.error.StripeError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creating payment intent: {str(e)}'
        }), 500

@payment_routes.route('/confirm-payment', methods=['POST'])
def confirm_payment():
    """Confirm a payment with PaymentMethod ID"""
    try:
        data = request.get_json()
        payment_intent_id = data.get('payment_intent_id')
        payment_method_id = data.get('payment_method_id')

        if not payment_intent_id or not payment_method_id:
            return jsonify({
                'success': False,
                'message': 'Payment intent ID and payment method ID are required'
            }), 400

        # Confirm payment intent with PaymentMethod
        intent = stripe.PaymentIntent.confirm(
            payment_intent_id,
            payment_method=payment_method_id,
        )

        if intent.status == 'succeeded':
            return jsonify({
                'success': True,
                'payment_intent_id': intent.id,
                'status': intent.status
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Payment status: {intent.status}',
                'status': intent.status
            }), 400

    except stripe.error.CardError as e:
        return jsonify({
            'success': False,
            'message': e.user_message or 'Card error occurred'
        }), 400
    except stripe.error.StripeError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error confirming payment: {str(e)}'
        }), 500

