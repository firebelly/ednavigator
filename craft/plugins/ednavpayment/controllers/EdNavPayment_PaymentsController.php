<?php

namespace Craft;

class EdNavPayment_PaymentsController extends BaseController
{
  protected $allowAnonymous = true;

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