// Accordions
import appState from '../util/appState';

const accordions = {
  init() {
    // Activate/deactive functions

    $('.accordion').each(function() {
      var $accordion = $(this),
          $toggle = $accordion.find('.accordion-toggle'),
          $content = $accordion.find('.accordion-content');

      // Start contracted/expanded depending on screen size
      if (appState.breakpoints.lg) {
        accordions.activate($accordion);
      } else {
        $content.hide();
      }

      $toggle.on('click', function(e) {
        if ($accordion.is('.-active')) {
          accordions.collapse($accordion);
        } else {
          accordions.expand($accordion);
        }
      });

    });
  },

  deactivate($accordion) {
    $accordion.removeClass('-active');
    $accordion.find('.expand-contract').removeClass('-active');
  },

  activate($accordion) {
    $accordion.addClass('-active');
    $accordion.find('.expand-contract').addClass('-active');
  },

  collapse($accordion, animate) {
    animate = typeof animate !== 'undefined' ? animate : true;
    accordions.deactivate($accordion);
    if (animate) {
      $accordion.find('.accordion-content').slideUp(250);
    } else {
      $accordion.find('.accordion-content').hide();
    }
  },

  expand($accordion, animate) {
    animate = typeof animate !== 'undefined' ? animate : true;
    accordions.activate($accordion);
    if (animate) {
      $accordion.find('.accordion-content').slideDown(250);
    } else {
      $accordion.find('.accordion-content').show();
    }
  }
}

export default accordions