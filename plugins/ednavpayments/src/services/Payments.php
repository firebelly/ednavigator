<?php
/**
 * Ednavpayments plugin for Craft CMS 3.x
 *
 * Stripe checkout for EdNavigator payments.
 *
 * @link      https://firebellydesign.com/
 * @copyright Copyright (c) 2018 Firebelly
 */

namespace firebelly\ednavpayments\services;

use firebelly\ednavpayments\Ednavpayments;
use firebelly\ednavpayments\records\Payment;

use Craft;
use craft\base\Component;

/**
 * @author    Firebelly
 * @package   Ednavpayments
 * @since     1.0.0
 */
class Payments extends Component
{
    // Public Methods
    // =========================================================================

    /**
     * Returns payment records for /admin/ednavpayments template
     * @return [array] active records
     */
    public function getPayments()
    {
        $payments = Payment::find()->orderBy('dateCreated DESC')->all();
        return $payments;
    }

}
