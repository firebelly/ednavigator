<?php

/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/general.php
 */

return array(
    '*' => array(
        'omitScriptNameInUrls' => true,
        'imageDriver' => 'imagick',
        'stripePublishableKey' => getenv('STRIPE_PUBLISHABLE_KEY'),
        'enableCsrfProtection' => true,
        'generateTransformsBeforePageLoad' => true,
        'siteUrl' => array(
            'en_us' => getenv('BASE_URL'),
            'es_us' => getenv('BASE_URL') . 'es/'
        ),
        'environmentVariables' => array(
            'baseUrl'  => getenv('BASE_URL'),
            'basePath' => getenv('BASE_PATH'),
        )
    ),

    'ednavigator.craft' => array(
        'devMode' => true,
    ),

    'ednavigator.com' => array(
        'cooldownDuration' => 0,
    )
);
