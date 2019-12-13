import Player from '@vimeo/player';
import Velocity from 'velocity-animate';
import Flickity from 'flickity-sync';
import Inputmask from 'inputmask';

import appState from '../util/appState';

export default {
  init() {
    var breakpointIndicatorString,
        breakpoint_xl,
        breakpoint_nav,
        breakpoint_lg,
        breakpoint_md,
        breakpoint_sm,
        breakpoint_xs,
        resizeTimer,
        slideEasing = [0.65, 0, 0.35, 1],
        $document,
        $body,
        $siteHeader,
        $siteNav,
        $siteOverlay,
        overlayTimer,
        loadingTimer,
        transitionElements;

    // Cache some common DOM queries
    $document = $(document);
    $body = $('body');
    $siteHeader = $('.site-header');
    $siteNav = $('.site-nav');
    $siteOverlay = '<div id="site-overlay"></div>';


    $('body').addClass('loaded');

    // Set screen size vars
    _resize();

    // Transition elements to enable/disable on resize
    transitionElements = [$siteNav];

    // Init functions
    _initActiveToggle();
    _injectSvgIcons();
    _initSiteNav();
    _initBannerVideo();
    _initCarousels();
    _initLoadMore();
    _initShareLinks();
    _initVideoPlayers();
    _initNewsletterForm();
    _initFormFunctions();
    _snapScrolling();
    _initBlogFilter();
    _initGAEventTracking();
    _initStripeCheckout();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {
        _closeSiteNav();
      }
    });

    // Smoothscroll links
    $('a.smoothscroll').click(function(e) {
      e.preventDefault();
      var href = $(this).attr('href');
      _scrollBody($(href));
    });

    function _scrollBody(element, duration, delay, offset) {
      element.velocity("scroll", {
        duration: duration,
        delay: delay,
        offset: -offset
      }, "easeOutSine");
    }

    function _initActiveToggle() {
      $(document).on('click', '[data-active-toggle]', function(e) {
        $(this).toggleClass('-active');
        if ($(this).attr('data-active-toggle') !== '') {
          $($(this).attr('data-active-toggle')).toggleClass('-active');
        }
      });
    }

    function _showSiteOverlay(callback) {
      // Check if there is already an overlay on the page
      if (!$('#site-overlay').length) {
        $siteHeader.append($siteOverlay);
      }

      // Check if it's already active, if not animate showing it
      if (!$('#site-overlay').is('.-active')) {
        // Fade in the overlay
        $('#site-overlay').velocity(
          { opacity: 1 }, {
          display: "block",
            // on complete, fade in the lightbox
            complete: function() {
              $('#site-overlay').addClass('-active');
              if(typeof callback !== 'undefined') {
                callback();
              }
            }
        });
      }
    }

    function _hideSiteOverlay(callback) {
      if (!$('#site-overlay').length) {
        return;
      }

      $('#site-overlay').velocity(
        { opacity: 0 }, {
        display: "none",
        complete: function() {
          $('#site-overlay').removeClass('-active');
          if(typeof callback !== 'undefined') {
            callback();
          }
        }
      });
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

    function _initSiteNav() {
      // Give sticky class on scroll
      $(window).on('scroll', function() {
        if ($(window).scrollTop() > $siteHeader.outerHeight()) {
          $siteHeader.addClass('-sticky');
        } else {
          $siteHeader.removeClass('-sticky');
        }
      });

      // Inject SEO-useless mobile nav toggle
      $('.site-nav').closest('div').append('<button class="menu-toggle" aria-hidden="true" data-active-toggle=".site-nav"><span class="lines"></span></button>');

      $siteNav.find('.has-children').append('<button class="subnav-toggle" aria-hidden="true" data-active-toggle></button>');

      $siteNav.on('click', '.has-children > .subnav-toggle', function(e) {
        if (!breakpoint_nav) {
          e.preventDefault();
          var $childNav = $(this).closest('.has-children').find('.subnav');

          if ($(this).is('.-active')) {
            $childNav.velocity('slideUp', { duration: 250, easing: 'easeOutSine' });
          } else {
            $siteNav.find('.has-children > a.-active + .subnav').velocity('slideUp', { duration: 250, easing: 'easeOutSine' });
            $siteNav.find('.has-children > a.-active').not($(this)).removeClass('-active');
            $childNav.velocity('slideDown', { duration: 250, easing: 'easeOutSine' });
          }
        }
      });

      // Nav Toggle Functions
      $('.menu-toggle').on('click', function() {
        if ($(this).is('.-active')) {
          $body.removeClass('site-nav-open');
          _hideSiteOverlay();
        } else {
          $body.addClass('site-nav-open');
          _showSiteOverlay();
        }
      });

      // Close when clicking away from nav
      $(document).on('click touchend', '#site-overlay', function(e) {
        _closeSiteNav();
      });
    }

    function _closeSiteNav() {
      if (!$siteNav.is('.-active')) {
        return;
      }

      _hideSiteOverlay();
      $body.removeClass('site-nav-open');
      $siteNav.removeClass('-active');
      $('.menu-toggle').removeClass('-active');
    }

    function _initBannerVideo() {
      if (!$('.banner-video').length) {
        return;
      }

      var $video = $('#video');
      var $container = $video.closest('.video-container');

      var options = {
          responsive: true
      };

      if ($video[0].hasAttribute('data-url')) {
        options['url'] = $video.attr('data-url');
      } else {
        options['id'] = $video.attr('data-id');
      }

      var player = new Player('video', options);

      $('.banner-video-play').on('click', function() {
        $container.addClass('playing');
        _openVideoModal(player);
      });

      // Open Modal if Video Play triggered
      player.on('play', function() {
        if (!$('#video-modal').is('.-active')) {
          _openVideoModal(false);
        }
      })

      // Close Modal when video ends
      player.on('ended', function() {
        _closeVideoModal(player);
      });

      // Close Video Modal
      $(document).keyup(function(e) {
        if (e.keyCode === 27) {
          if ($('#video-modal.-active').length) {
            _closeVideoModal(player);
          }
        }
      });

      $(document).on('click', '.video-modal-close', function() {
        _closeVideoModal(player);
      });

      $(document).on('click touchend', 'body.video-modal-open', function(e) {
        var $target = $(e.target);
        if (!$target.is('.video-container') && !$target.parents('.video-container').length) {
          _closeVideoModal(player);
        }
      });
    }

    function _openVideoModal(player) {
      _showSiteOverlay();
      $('#video-modal').velocity(
        { opacity: 1 }, {
        display: "block",
          complete: function() {
            $('body').addClass('video-modal-open');
            $('#video-modal').addClass('-active');
            if (player !== false) {
              player.play();
            }
          }
      });
    }

    function _closeVideoModal(player) {
      if (player.getPaused()) {
        player.pause();
      }
      _hideSiteOverlay();
      $('#video-modal').velocity(
        { opacity: 0 }, {
        display: "none",
        complete: function() {
          $('body').removeClass('video-modal-open');
          $('#video-modal').removeClass('-active');
        }
      });
    }

    function _initCarousels() {

      $('.page-section-carousel').each(function() {
        var $contentCarousel = $(this).find('.page-section-content-carousel'),
            $imageCarousel = $(this).find('.page-section-image-carousel'),
            imageCarouselSelector = '#' + $imageCarousel.attr('id');

        var imageFlkty = new Flickity('$imageCarousel', {
          cellSelector: '.image-block',
          cellAlign: 'left',
          pageDots: false,
          adaptiveHeight: true,
          wrapAround: true,
          prevNextButtons: false,
          setGallerySize: false
        });

        var contentFlkty = new Flickity('$contentCarousel', {
          cellSelector: '.block',
          cellAlign: 'left',
          pageDots: false,
          adaptiveHeight: true,
          wrapAround: true,
          sync: imageCarouselSelector,
          arrowShape: 'M33.4 47.7l30.8-15.4c2.1-1.1 4.7 1.1 3.6 3.6l-6.4 12.9c-.7.7-.7 1.4-.4 2.1l6.4 13.2c1.1 2.1-1.1 4.7-3.6 3.6L33 52.3c-1.4-1-1.4-3.9.4-4.6'
        });

        if ($contentCarousel.find('.block').length === 1) {
          $contentCarousel.find('.flickity-prev-next-button').hide();
        }

        $contentCarousel.find('button.previous').append('<span>Prev</span>');
        $contentCarousel.find('button.next').prepend('<span>Next</span>');
      });

      // Feature News Carousel on homepage
      if ($('#featuredNewsCarousel').length) {
        var $featuredNewsCarousel = $('#featuredNewsCarousel')

        var featuredNewsFlkty = new Flickity('#featuredNewsCarousel', {
          cellSelector: '.block',
          cellAlign: 'left',
          pageDots: false,
          adaptiveHeight: true,
          wrapAround: true,
          groupCells: true,
          arrowShape: 'M33.4 47.7l30.8-15.4c2.1-1.1 4.7 1.1 3.6 3.6l-6.4 12.9c-.7.7-.7 1.4-.4 2.1l6.4 13.2c1.1 2.1-1.1 4.7-3.6 3.6L33 52.3c-1.4-1-1.4-3.9.4-4.6'
        });

        $featuredNewsCarousel.find('button.previous').append('<span>Prev</span>');
        $featuredNewsCarousel.find('button.next').prepend('<span>Next</span>');
      }
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

    function _initFormFunctions() {
      $('#get-started #fromName').on('keyup', function() {
        $('#messageFrom').val($(this).val());
      });

      $('#get-started').submit(function(ev) {
          // Prevent the form from actually submitting
          ev.preventDefault();

          // Send it to the server
          $.post({
            url: '/',
            dataType: 'json',
            data: $(this).serialize(),
            success: function(response) {
              if (response.success) {
                $('#thanks').fadeIn();
              } else {
                // response.error will be an object containing any validation errors that occurred, indexed by field name
                // e.g. response.error.fromName => ['From Name is required']
                alert('An error occurred. Please try again.');
              }
            }
          });
      });

      // Form Masking
      var phoneMask = new Inputmask("(999) 999-9999");
      phoneMask.mask($('input[type="tel"]'));
    }

    function _snapScrolling() {
      if ($('.snap-section').length) {

        // $('body').panelSnap({
        //   panelSelector: '.snap-section',
        //   easing: 'swing',
        //   slideSpeed: 350,
        //   directionThreshold: 1,
        //   onActivate: function(panel) {
        //     if ($(panel).is('.page-section-carousel')) {
        //       $(panel).find('.page-section-content-carousel').first().focus();
        //     }
        //   }
        // });

        function enableDisable() {
          if (breakpoint_xl === true) {
            $('body').panelSnap('enable');
          } else {
            $('body').panelSnap('disable');
          }
        }

        // Disable on single-column view
        // enableDisable();
        // $(window).resize(function() {
        //   enableDisable();
        // });

        // Add Scroll to next section nav
        $('.snap-section').each(function(i) {
          if (i < $('.snap-section').length - 1) {
            $(this).append('<button class="section-advance scroll-button smoothscroll" href="#"><svg class="icon icon-arrow" role="img"><use xlink:href="#icon-arrow" /></svg></button>');
            // If The contenct section is yellow, add a class to change the color of the section-advance button
            if ($(this).find('.background-yellow').length !== 0) {
              $(this).find('.section-advance').addClass('-orange');
            }
            $(this).find('.section-advance').on('click', function(e) {
              e.preventDefault();
              _scrollBody($(this).closest('.snap-section').next('.snap-section'), 350, 0, $('.site-header').outerHeight());
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
          key: $('form#stripe-checkout').attr('data-key'),
          image: '/assets/dist/images/marketplace.png',
          locale: 'auto',
          token: function(token, args) {
            var data = $('form.stripe-checkout').serialize() + '&token=' + JSON.stringify(token) + '&customer=' + JSON.stringify(args) + '&plan=' + JSON.stringify(planId);
            $.post('/', data, function(response) {
              if (response.success) {
                container.find('.checkout-feedback').html('<h3>Success!</h3><p>Your payment will be processed shortly.</p>').slideDown('fast');
              } else {
                container.find('.checkout-feedback').html('<h3>Uh oh!</h3><p>There was a transaction error: ' + response.error + '</p>').slideDown('fast');
              }
            }).fail(function() {
              container.find('.checkout-feedback').html('<h3>Uh oh!</h3><p>There was a transaction error. Please contact us at <a href="mailto:info@ednavigator.com?subject=stripe%20error">info@ednavigator.com</a>.</p>').slideDown('fast');
            }, 'json');
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
        var stripeCheckout = _stripeCheckout($container, planId);
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

    // Disabling transitions on certain elements on resize
    function _disableTransitions() {
      $.each(transitionElements, function() {
        $(this).css('transition', 'none');
      });
    }

    function _enableTransitions() {
      $.each(transitionElements, function() {
        $(this).attr('style', '');
      });
    }

    // Called in quick succession as window is resized
    function _resize() {
      // Check breakpoint indicator in DOM ( :after { content } is controlled by CSS media queries )
      breakpointIndicatorString = window.getComputedStyle(
        document.querySelector('#breakpoint-indicator'), ':after'
      ).getPropertyValue('content')
      .replace(/['"]+/g, '');

      // Determine current breakpoint
      breakpoint_xl = breakpointIndicatorString === 'xl';
      breakpoint_nav = breakpointIndicatorString === 'nav' || breakpoint_xl;
      breakpoint_lg = breakpointIndicatorString === 'lg' || breakpoint_nav;
      breakpoint_md = breakpointIndicatorString === 'md' || breakpoint_lg;
      breakpoint_sm = breakpointIndicatorString === 'sm' || breakpoint_md;
      breakpoint_xs = breakpointIndicatorString === 'xs' || breakpoint_sm;

      // Close Nav
      if ($siteNav.is('.-active') && breakpoint_nav) {
        _closeSiteNav();
      }

      // Reset inline styles for navigation for medium breakpoint
      if (breakpoint_nav) {
        $('.site-nav .-active, .menu-toggle').removeClass('-active');
        $('.site-nav .subnav[style]').attr('style', '');
      }

      // Disable transitions when resizing
      _disableTransitions();

      // Functions to run on resize end
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Re-enable transitions
        _enableTransitions();
      }, 250);
    }

    $(window).resize(_resize);
  },
  finalize() {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },
};
