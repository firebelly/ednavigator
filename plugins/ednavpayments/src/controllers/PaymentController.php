<?php
/**
 * Ednavpayments plugin for Craft CMS 3.x
 *
 * Stripe checkout for EdNavigator payments.
 *
 * @link      https://firebellydesign.com/
 * @copyright Copyright (c) 2018 Firebelly
 */

namespace firebelly\ednavpayments\controllers;

use firebelly\ednavpayments\Ednavpayments;
use firebelly\ednavpayments\records\Payment;

use Craft;
use craft\web\Controller;
use craft\mail\Message;

/**
 * @author    Firebelly
 * @package   Ednavpayments
 * @since     1.0.0
 */
class PaymentController extends Controller
{
    // Protected Properties
    // =========================================================================

    /**
     * @var    bool|array Allows anonymous access to this controller's actions.
     *         The actions must be in 'kebab-case'
     * @access protected
     */
    protected $allowAnonymous = ['charge'];

    // Public Methods
    // =========================================================================

    /**
     * @return mixed
     */
    public function actionCharge()
    {
        $this->requirePostRequest();
        $this->requireAjaxRequest();

        // Parse JSON objects sent from js
        $token  = json_decode($_POST['token']); // Stripe token->id and token->email
        $customer  = json_decode($_POST['customer']); // customer billing/shipping info sent from Stripe Checkout
        $plan = json_decode($_POST['plan']);
        // Set customer email
        $customer->email = $token->email;

        // Check if token was sent
        if (empty($token->id)) {
          $this->returnErrorJson('No payment token sent.');
        }

        try {
          // Init Stripe using .env credentials
          \Stripe\Stripe::setApiKey(getenv('STRIPE_SECRET_KEY'));

          $customer = \Stripe\Customer::create(array(
            'email' => $customer->email,
            'source'  => $token->id,
            'plan' => $plan
          ));

        } catch (\Stripe\Error\Base $e) {
          $this->returnErrorJson($e->getMessage());
        } catch (Exception $e) {
          $this->returnErrorJson($e->getMessage());
        }

        $this->returnJson(array('success' => true, 'message' => 'Order processed ok!'));
    }
}
