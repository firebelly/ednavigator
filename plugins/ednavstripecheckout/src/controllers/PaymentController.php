<?php
/**
 * Ednavstripecheckout plugin for Craft CMS 3.x
 *
 * Stripe checkout for EdNavigator payments.
 *
 * @link      https://firebellydesign.com
 * @copyright Copyright (c) 2019 Firebelly
 */

namespace firebelly\ednavstripecheckout\controllers;

use firebelly\ednavstripecheckout\Ednavstripecheckout;

use Craft;
use craft\web\Controller;

/**
 * Payment Controller
 *
 * Generally speaking, controllers are the middlemen between the front end of
 * the CP/website and your plugin’s services. They contain action methods which
 * handle individual tasks.
 *
 * A common pattern used throughout Craft involves a controller action gathering
 * post data, saving it on a model, passing the model off to a service, and then
 * responding to the request appropriately depending on the service method’s response.
 *
 * Action methods begin with the prefix “action”, followed by a description of what
 * the method does (for example, actionSaveIngredient()).
 *
 * https://craftcms.com/docs/plugins/controllers
 *
 * @author    Firebelly
 * @package   Ednavstripecheckout
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

        // Stripe token->id and token->email
        $token = json_decode(Craft::$app->getRequest()->post('token'));

        // Customer billing/shipping info sent from Stripe Checkout
        $customer = json_decode(Craft::$app->getRequest()->post('customer'));

        // Plan
        $plan = json_decode(Craft::$app->getRequest()->post('plan'));

        // Check if token was sent
        if (empty($token->id)) {
            return json_encode([
                'status'  => 0,
                'message' => 'No payment token sent.'
            ]);
        }

        // Set customer email
        $customer->email = $token->email;

        try {
          // Init Stripe using .env credentials
          \Stripe\Stripe::setApiKey(getenv('STRIPE_SECRET_KEY'));

          $customer = \Stripe\Customer::create(array(
            'email' => $customer->email,
            'source'  => $token->id,
            'plan' => $plan
          ));

        } catch (\Stripe\Error\Base $e) {
            return json_encode([
                'status'  => 0,
                'message' => $e->getMessage()
            ]);
        } catch (Exception $e) {
            return json_encode([
                'status'  => 0,
                'message' => $e->getMessage()
            ]);
        }

        return json_encode([
            'success' => 1,
            'message' => 'Order processed ok!'
        ]);
    }
}