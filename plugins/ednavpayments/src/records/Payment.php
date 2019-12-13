<?php
/**
 * Ednavpayments plugin for Craft CMS 3.x
 *
 * Stripe checkout for EdNavigator payments.
 *
 * @link      https://firebellydesign.com/
 * @copyright Copyright (c) 2018 Firebelly
 */

namespace firebelly\ednavpayments\records;

use firebelly\ednavpayments\Ednavpayments;

use Craft;
use craft\db\ActiveRecord;

/**
 * @author    Firebelly
 * @package   Ednavpayments
 * @since     1.0.0
 */
class Payment extends ActiveRecord
{
    // Public Static Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%ednavpayments_payment}}';
    }
}
