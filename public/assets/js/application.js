// FB - Firebelly 2016

//=include "../bower_components/jquery/dist/jquery.js"
//=include "../bower_components/jquery.fitvids/jquery.fitvids.js"
//=include "../bower_components/history.js/scripts/bundled-uncompressed/html4+html5/jquery.history.js"
//=include "../bower_components/velocity/velocity.min.js"
//=include "../bower_components/imagesloaded/imagesloaded.pkgd.min.js"
//=include "../bower_components/flickity/dist/flickity.pkgd.min.js"
//=include "../bower_components/flickity-sync/flickity-sync.js"
//=include "../bower_components/panelsnap/jquery.panelSnap.js"
//=include "../bower_components/jquery-validation/dist/jquery.validate.js"

// Good Design for Good Reason for Good Namespace
var FB = (function($) {

  var screen_width = 0,
      breakpoint_sm = false,
      breakpoint_md = false,
      breakpoint_lg = false,
      breakpoint_xl = false,
      breakpoint_nav = 760,
      breakpoint_array = [480,700,900,1200],
      $siteHeader = $('.site-header'),
      $document,
      History = window.History,
      State,
      root_url = History.getRootUrl(),
      relative_url,
      original_url,
      original_page_title = document.title,
      overlayTimer,
      loadingTimer;

  function _init() {
    // Cache some common DOM queries
    $document = $(document);

    $('body').addClass('loaded');

    // Set screen size vars
    _resize();

    // Init functions
    _injectSvgIcons();
    _initNav();
    _initCarousels();
    _initLoadMore();
    _initShareLinks();
    _initVideoPlayers();
    _initPageTransitions();
    _initNewsletterForm();
    _snapScrolling();
    _initBlogFilter();
    _initGAEventTracking();
    _initStripeCheckout();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {

      }
    });

    // Smoothscroll links
    $('a.smoothscroll').click(function(e) {
      e.preventDefault();
      var href = $(this).attr('href');
      _scrollBody($(href));
    });

  } // end init()

  function _scrollBody(element, duration, delay) {
    element.velocity("scroll", {
      duration: duration,
      delay: delay,
      offset: 0
    }, "easeOutSine");
  }

  function _injectSvgIcons() {
    // Add needed markup for section links
    $('.inline-links-container a').each(function() {
      if ($(this).not('.inline-link')) {
        $(this).addClass('inline-link').wrapInner('<span></span>');
      }
    });

    // Inject dotted arrow svgs for .inline-link elements
    $('a.inline-link:not(.-left) span').each(function() {
      if (!$(this).find('svg').length) {
        $(this).append('<span class="icon"><svg class="icon-arrow-dotted" role="img"><use xlink:href="#icon-arrow-dotted" /></svg></span>');
      }
    });
    
    $('a.inline-link.-left span').each(function() {
      if (!$(this).find('svg').length) {
        $(this).prepend('<span class="icon"><svg class="icon-arrow-dotted-left" role="img"><use xlink:href="#icon-arrow-dotted-left" /></svg></span>');
      }
    });

    // Inject Icon
    $('.svg-inject').each(function() {
      if (!$(this).find('svg').length) {      
        var icon = $(this).data('icon');
        $(this).prepend('<svg class="'+icon+'" role="img"><use xlink:href="#'+icon+'" /></svg>');
      }
    });
  }

  function _initNav() {
    // Give sticky class on scroll
    $(window).on('scroll', function() {
      if ($(window).scrollTop() > $siteHeader.outerHeight()) {
        $siteHeader.addClass('-sticky');
      } else {
        $siteHeader.removeClass('-sticky');
      }
    });

    // Inject SEO-useless mobile nav toggle
    $('.site-nav').closest('div').append('<button class="menu-toggle" aria-hidden="true"><span class="lines"></span></button>');
    $document.on('click', '.menu-toggle', function() {
      $('.site-nav').toggleClass('-active');
      $('body, .menu-toggle').toggleClass('nav-open');
    });
  }

  function _initCarousels() {

    $('.page-section-carousel').each(function() {
      var $contentCarousel = $(this).find('.page-section-content-carousel'),
          $imageCarousel = $(this).find('.page-section-image-carousel'),
          imageCarouselSelector = '#' + $imageCarousel.attr('id');

      $imageCarousel.flickity({
        cellSelector: '.image-block',
        cellAlign: 'left',
        pageDots: false,
        adaptiveHeight: true,
        wrapAround: true,
        prevNextButtons: false,
        setGallerySize: false
      });

      $contentCarousel.flickity({
        cellSelector: '.block',
        cellAlign: 'left',
        pageDots: false,
        adaptiveHeight: true,
        wrapAround: true,
        sync: imageCarouselSelector,
        arrowShape: 'M33.4 47.7l30.8-15.4c2.1-1.1 4.7 1.1 3.6 3.6l-6.4 12.9c-.7.7-.7 1.4-.4 2.1l6.4 13.2c1.1 2.1-1.1 4.7-3.6 3.6L33 52.3c-1.4-1-1.4-3.9.4-4.6'
      });
    });

  }

  function _initLoadMore() {

    if ($('#load-more').length) {
      var $loadmore = $('#load-more');
      var $loadmoreSection = $loadmore.closest('.load-more-section');
      var pageLimit = $loadmore.attr('data-total-pages');

      $loadmore.on('click', function(e) {
        var page = $(this).attr('data-page'),
            collection = $(this).attr('data-collection');
        e.preventDefault();
        
        $loadmoreSection.append('<div class="loading"><svg class="ednavigator-mark" role="img"><use xlink:href="#ednavigator-mark" /></svg></div>');
        $loadmore.addClass('hidden');

        $.get( "/"+collection+"/p"+page, function(data) {
      
          $( ".article-list" ).append(data);
          
          page++;
          
          $loadmore.attr('data-page', page);
          _injectSvgIcons();
          _initVideoPlayers();

          $loadmore.removeClass('hidden');
          $('.loading').remove();

          if (page > pageLimit) {
            $loadmoreSection.addClass('hidden');
          }
        });

      });
    }

  }

  function _initShareLinks() {
    $.fn.sharePopup = function (e, intWidth, intHeight, blnResize) {      
      // Prevent default anchor event
      e.preventDefault();
      
      // Set values for window
      intWidth = intWidth || '500';
      intHeight = intHeight || '400';
      strResize = (blnResize ? 'yes' : 'no');
      var left = (screen.width/2)-(intWidth/2);
      var top = (screen.height/2)-(intHeight/2);

      // Set title and open popup with focus on it
      var strTitle = ((typeof this.attr('title') !== 'undefined') ? this.attr('title') : 'Social Share'),
      strParam = 'width=' + intWidth + ',height=' + intHeight + ',resizable=' + strResize + ',left=' + left + ',top=' + top,            
      objWindow = window.open(this.attr('href'), strTitle, strParam).focus();
    }

    $('a.share').on("click", function(e) {
      $(this).sharePopup(e);
    });
  }

  function _initVideoPlayers() {

    if ($('.youtube-video').length) {

      $.getScript("https://www.youtube.com/iframe_api", function () {

        $('.youtube-video').each(function(e) {
          var $ytVideo = $(this);

          $(this).closest('.has-video').find('.play').on('click', function() {

            var player,
                ytId = $ytVideo.attr('id');

            $ytVideo.closest('.has-video').addClass('-active');

            player = new YT.Player(ytId, {
              events: {
                'onReady': function (e) {
                  e.target.seekTo(0);
                  e.target.playVideo();
                },
                'onStateChange': function(e) {
                  if (e.data === 0) {
                    $ytVideo.closest('.has-video').removeClass('-active');
                  }
                }
              }
            });
          });

        });


      });


    }

  }

  function _showPageOverlay() {
    clearTimeout(overlayTimer);
    $('body').prepend('<div class="page-overlay"></div>');
    overlayTimer = setTimeout(function() {
      $('.page-overlay').addClass('-active');
    }, 0);
  }

  function _hidePageOverlay() {
    clearTimeout(overlayTimer);
    $('.page-overlay').removeClass('-active');
    overlayTimer = setTimeout(function() {
      $('.page-overlay').remove();
    }, 100);
  }

  function _initPageTransitions() {
    $('.page-back').on('mouseenter', _showPageOverlay).on('mouseleave', _hidePageOverlay);

    $('.page-back').on('click', function() {
      $(this).addClass('-clicked');
    });
  }

  function _initNewsletterForm() {

    // Hide the hidden part of the form
    $('.newsletter-form .hidden-group').hide();

    // Toggle form-active classes on focus
    $('.newsletter-form input').on('focus', function() {
      if ($('.hidden-group').not('.-visible')) {
        $('body').addClass('form-active');
        $(this).closest('form').find('.hidden-group').addClass('-visible').slideDown();
      }
    });

    // Jump down to subscribe form and focus first input
    $('.subscribe-link').on('click', function(e) {
      e.preventDefault();

      _scrollBody($('.newsletter-form'));
      setTimeout(function() {
        $('.newsletter-form input').first().focus();
      }, 0);
    });

    // Hide hidden part of form when clicking away
    $document.on('click', 'body.form-active', function(e) {
      if (!$(e.target).is('.newsletter-form') && !$(e.target).parents('.newsletter-form').length) {      
        $('body').removeClass('form-active');
        $('.newsletter-form .hidden-group').removeClass('-visible').slideUp();
      }
    });


  }
  function _snapScrolling() {
    if ($('.snap-section').length) {

      $('body').panelSnap({
        panelSelector: '.snap-section',
        easing: 'swing',
        slideSpeed: 350,
        directionThreshold: 1,
        onActivate: function(panel) {
          if ($(panel).is('.page-section-carousel')) {
            $(panel).find('.page-section-content-carousel').first().focus();
          }
        }
      });

      function enableDisable() {
        if (breakpoint_xl === true) {
          $('body').panelSnap('enable');
        } else {
          $('body').panelSnap('disable');
        }
      }

      // Disable on single-column view
      enableDisable();
      $(window).resize(function() {
        enableDisable();
      });

      // Add Scroll to next section nav
      $('.snap-section').each(function(i) {
        if (i < $('.snap-section').length - 1) {
          $(this).append('<a class="section-advance scroll-button smoothscroll" href="#pageContent"><svg class="icon icon-arrow" role="img"><use xlink:href="#icon-arrow" /></svg></a>');
          $(this).find('.section-advance').on('click', function() {
            $('body').panelSnap('snapTo', 'next');
          });
        }
      });

    }
  }

  function _initBlogFilter() {
    $document.on('change', '.filter select', function(e) {
      window.location.href = this.value;
    });
  }

  function _initGAEventTracking() {
    // Track resource downloads
    $('.ga-download').on('click', function(e) {
      var resourceTitle = $(this).attr('data-resourceTitle');
      ga('send', 'event', 'Resources', 'Downloaded', resourceTitle);
    });
  }

  // Track ajax pages in Analytics
  function _trackPage() {
    if (typeof ga !== 'undefined') { ga('send', 'pageview', document.location.href); }
  }

  // Track events in Analytics
  function _trackEvent(category, action) {
    if (typeof ga !== 'undefined') { ga('send', 'event', category, action); }
  }

  function _initStripeCheckout() {

    function _stripeCheckout(container, planId) {
      var stripeCheckout = StripeCheckout.configure({
        key: $('form.stripe-checkout').attr('data-key'),
        image: '/assets/images/marketplace.png',
        locale: 'auto',
        token: function(token, args) {
          data = $('form.stripe-checkout').serialize() + '&token=' + JSON.stringify(token) + '&customer=' + JSON.stringify(args) + '&plan=' + JSON.stringify(planId);
          $.post('/', data, function(response) {
            if (response.success) {
              container.find('.checkout-feedback').html('<h3>Success!</h3><p>Your payment will be processed shortly.</p>').slideDown('fast');
            } else {
              container.find('.checkout-feedback').html('<h3>Uh oh!</h3><p>There was a transaction error: ' + response.error + '</p>').slideDown('fast');
            }
          }).fail(function() {
            container.find('.checkout-feedback').html('<h3>Uh oh!</h3><p>There was a transaction error. Please contact us at <a href="mailto:info@ednavigator.com?subject=stripe%20error">info@ednavigator.com</a>.</p>').slideDown('fast');
          });
        }
      });
      return stripeCheckout;
    }

    $('.payment-link button').on('click', function(e) {
      e.preventDefault();
      var $container = $(this).closest('.payment-option'),
          price = $(this).attr('data-price'),
          planId = $(this).attr('data-plan'),
          description = $(this).attr('data-description');
      
      // Open Checkout with further options:
      stripeCheckout = _stripeCheckout($container, planId);
      stripeCheckout.open({
        panelLabel: 'pay and subscribe',
        description: description,
        name: 'EdNavigator Payment',
        billingAddress: true,
        zipCode: true,
        amount: price * 100
      });
    });

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function() {
      stripeCehckout.close();
    });
  }

  // Called in quick succession as window is resized
  function _resize() {
    screenWidth = document.documentElement.clientWidth;
    breakpoint_sm = (screenWidth > breakpoint_array[0]);
    breakpoint_md = (screenWidth > breakpoint_array[1]);
    breakpoint_lg = (screenWidth > breakpoint_array[2]);
    breakpoint_xl = (screenWidth > breakpoint_array[3]);
  }

  // Public functions
  return {
    init: _init,
    resize: _resize,
    scrollBody: function(section, duration, delay) {
      _scrollBody(section, duration, delay);
    }
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(FB.init);

// Zig-zag the mothership
jQuery(window).resize(FB.resize);