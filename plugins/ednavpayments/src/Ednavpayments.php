<?php
/**
 * Ednavpayments plugin for Craft CMS 3.x
 *
 * Stripe checkout for EdNavigator payments.
 *
 * @link      https://firebellydesign.com/
 * @copyright Copyright (c) 2018 Firebelly
 */

namespace firebelly\ednavpayments;

use firebelly\ednavpayments\services\Payments as PaymentsService;
use firebelly\ednavpayments\models\Settings;

// use firebelly\ednavpayments\variables\paymentLog;
use craft\web\twig\variables\CraftVariable;

use Craft;
use craft\base\Plugin;
use craft\services\Plugins;
use craft\events\PluginEvent;
use craft\web\UrlManager;
use craft\services\Dashboard;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterUrlRulesEvent;

use yii\base\Event;

/**
 * Class Ednavpayments
 *
 * @author    Firebelly
 * @package   Ednavpayments
 * @since     1.0.0
 *
 * @property  PaymentService $payment
 * @property  Settings $settings
 * @method    Settings getSettings()
 */
class Ednavpayments extends Plugin
{
    // Static Properties
    // =========================================================================

    /**
     * @var Ednavpayments
     */
    public static $plugin;

    // Public Properties
    // =========================================================================

    /**
     * @var string
     */
    public $schemaVersion = '1.0.0';

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();
        self::$plugin = $this;

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules['siteActionTrigger1'] = 'ednavpayments/payment';
            }
        );

        // Event::on(
        //     UrlManager::class,
        //     UrlManager::EVENT_REGISTER_CP_URL_RULES,
        //     function (RegisterUrlRulesEvent $event) {
        //         $event->rules['cpActionTrigger1'] = 'ednavpayments/payment/do-something';
        //     }
        // );

        Event::on(
            Plugins::class,
            Plugins::EVENT_AFTER_INSTALL_PLUGIN,
            function (PluginEvent $event) {
                if ($event->plugin === $this) {
                }
            }
        );

        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event) {
                /** @var CraftVariable $variable */
                $variable = $event->sender;
                // Attach PaymentsService so we can use it in twig, e.g. `craft.payments.getPayments()`
                $variable->set('payments', PaymentsService::class);
            }
        );

        // Entry save events:
        // Event::on(
        //     Entry::class,
        //     Entry::EVENT_AFTER_SAVE,
        //     function(ModelEvent $event) {
        //         $entry = $event->sender;
        //         $imageOrder = 0;

        //         if ($entry->enabled && $entry->section->handle === 'work' && $entry->type->handle === 'project') {
        //             foreach ($entry->myAssetField as $asset) {
        //                 $imageOrder++;
        //                 $newFileName = $entry->slug . '-' . $imageOrder . '.' . $asset->getExtension();
        //                 Craft::$app->assets->moveAsset($asset, $asset->getFolder(), $newFileName);
        //             }
        //         }
        //     }
        // );

        Craft::info(
            Craft::t(
                'ednavpayments',
                '{name} plugin loaded',
                ['name' => $this->name]
            ),
            __METHOD__
        );
    }

    // Protected Methods
    // =========================================================================

    /**
     * Creates and returns the model used to store the plugin’s settings.
     *
     * @return \craft\base\Model|null
     */
    protected function createSettingsModel()
    {
        return new Settings();
    }

    /**
     * Returns the rendered settings HTML, which will be inserted into the content
     * block on the settings page.
     *
     * @return string The rendered settings HTML
     */
    protected function settingsHtml()
    {
        return Craft::$app->getView()->renderTemplate(
            'ednavpayments/settings',
            [
                'settings' => $this->getSettings()
            ]
        );
    }

}
