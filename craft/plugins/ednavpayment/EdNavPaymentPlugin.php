<?php

namespace Craft;

class EdNavPaymentPlugin extends BasePlugin
{
  function getName()
  {
    return Craft::t('EdNavigator Payments');
  }

  function getVersion()
  {
    return '1.0';
  }

  function getDeveloper()
  {
    return 'Firebelly';
  }

  function getDeveloperUrl()
  {
    return 'https://www.firebellydesign.com';
  }
}
