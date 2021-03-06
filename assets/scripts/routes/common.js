import jQueryBridget from 'jquery-bridget';
import Masonry from 'masonry-layout';
import Player from '@vimeo/player';
import Velocity from 'velocity-animate';
import Flickity from 'flickity-sync';
require('flickity-imagesloaded');
import Inputmask from 'inputmask';
import ImagesLoaded from 'imagesloaded';

import appState from '../util/appState';
import scrollBody from '../util/scrollBody';
import accordions from '../util/accordions';

export default {
  init() {
    var resizeTimer,
        slideEasing = [0.65, 0, 0.35, 1],
        $document,
        $body,
        $siteHeader,
        $siteNav,
        $siteOverlay,
        overlayTimer,
        loadingTimer,
        transitionElements;

    // jQueryify
    jQueryBridget( 'masonry', Masonry, $ );
    ImagesLoaded.makeJQueryPlugin($);

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
    if ($('.accordion').length) {
      accordions.init();
    }

    _initActiveToggle();
    _injectSvgIcons();
    _initMarkupTreatment();
    _initSiteNav();
    _initVideoModal();
    _initCarousels();
    _initMasonry();
    _initLoadMore();
    _initVideoPlayers();
    _initNewsletterForm();
    _initFormFunctions();
    _snapScrolling();
    _initFilters();
    _initGAEventTracking();
    if ($('form#stripe-checkout').length) {
      _initStripeCheckout();
    }

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
      scrollBody($(href));
    });

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
      $('a.inline-link:not(.-left)').each(function() {
        if (!$(this).find('span').length) {
          var linkText = $(this).text();
          $(this).empty();
          $(this).append('<span>' + linkText + '<span class="icon"><svg class="icon-arrow-dotted" role="img"><use xlink:href="#icon-arrow-dotted" /></svg></span></span>');
        } else if (!$(this).find('svg').length) {
          $(this).find('span').append('<span class="icon"><svg class="icon-arrow-dotted" role="img"><use xlink:href="#icon-arrow-dotted" /></svg></span>');
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

    function _initMarkupTreatment() {
      // Inject a span for user-content h2
      // $('body.single-post .entry-content h3').each(function() {
      //   var headlineText = $(this).text();
      //   $(this).empty();
      //   $(this).append('<span>' + headlineText + '</span');
      // });
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
        if (!appState.breakpoints.nav) {
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

    function _initVideoModal() {
      if (!$('.banner-video').length) {
        return;
      }

      var $container = $('#video-modal .video-container');

      $('.modal-video-play').on('click', function() {
        var videoUrl = $(this).attr('data-url');
        $container.addClass('playing');
        _openVideoModal(videoUrl);
      });

      // Open Modal if Video Play triggered
      // player.on('play', function() {
      //   if (!$('#video-modal').is('.-active')) {
      //     _openVideoModal(false);
      //   }
      // })

      // Close Video Modal
      $(document).keyup(function(e) {
        if (e.keyCode === 27) {
          if ($('#video-modal.-active').length) {
            _closeVideoModal();
          }
        }
      });

      $(document).on('click', '.video-modal-close', function() {
        _closeVideoModal();
      });

      $(document).on('click touchend', 'body.video-modal-open', function(e) {
        var $target = $(e.target);
        if (!$target.is('.video-container') && !$target.parents('.video-container').length) {
          _closeVideoModal();
        }
      });
    }

    function _openVideoModal(videoUrl) {
      if (!$('#video-modal').length) {
        $body.append('<div id="video-modal"><div class="video-container"><button class="video-modal-close"><span class="sr-only">Close Video</span> <svg class="icon-close" aria-hidden="true" role="presentation"><use xlink:href="#icon-close"/></svg></button><div id="video" class="banner-video" data-url="' + videoUrl + '"></div></div></div>');
      } else {
        $('#video-modal .video-container').append('<div id="video" class="banner-video" data-url="' + videoUrl + '"></div>');
      }

      var $video = $('#video-modal #video');
      var $container = $video.closest('.video-container');
      var options = {
          responsive: true,
          url: videoUrl
      };

      var player = new Player('video', options);

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

      // Close Modal when video ends
      player.on('ended', function() {
        _closeVideoModal();
      });
    }

    function _closeVideoModal() {
      $('#video-modal #video').remove();
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

      if ($('.featured-post-carousel').length) {
        var $featuredPostCarousel = $('.featured-post-carousel');
        Flickity.prototype._createResizeClass = function() {
          this.element.classList.add('flickity-resize');
        };

        Flickity.createMethods.push('_createResizeClass');

        var resize = Flickity.prototype.resize;
        Flickity.prototype.resize = function() {
          this.element.classList.remove('flickity-resize');
          resize.call( this );
          this.element.classList.add('flickity-resize');
        };

        var featuredPostCarousel = new Flickity('.featured-post-carousel', {
          cellSelector: 'article',
          pageDots: false,
          arrowShape: 'M33.4 47.7l30.8-15.4c2.1-1.1 4.7 1.1 3.6 3.6l-6.4 12.9c-.7.7-.7 1.4-.4 2.1l6.4 13.2c1.1 2.1-1.1 4.7-3.6 3.6L33 52.3c-1.4-1-1.4-3.9.4-4.6'
        });

        $featuredPostCarousel.find('button.previous').append('<span>Prev</span>');
        $featuredPostCarousel.find('button.next').prepend('<span>Next</span>');
      }
    }

    function _initMasonry() {
      $('.masonry').masonry({
        itemSelector: 'article',
        columnWidth: '.grid-sizer',
        percentPosition: true,
      });
    }

    function _initLoadMore() {

      if ($('#load-more').length) {
        var $loadmore = $('#load-more');
        var $loadmoreSection = $loadmore.closest('.load-more-section');
        var pageLimit = $loadmore.attr('data-total-pages');

        $loadmore.on('click', function(e) {
          e.preventDefault();
          var loadMoreUrl,
              page = $(this).attr('data-page'),
              collection = $(this).attr('data-collection'),
              params = $(this).attr('data-params');

          if (params !== '') {
            loadMoreUrl = '/'+collection+'/all/p'+page+'?'+params;
          } else {
            loadMoreUrl = "/"+collection+"/all/p"+page;
          }

          $loadmoreSection.append('<div class="loading"><svg class="ednavigator-mark" role="img"><use xlink:href="#ednavigator-mark" /></svg></div>');
          $loadmore.addClass('hidden');

          $.ajax({
              url: loadMoreUrl,
              type: 'GET',
              success: function(data) {
                var $data = $(data);
                $('.post-grid').append($data);
                $('.post-grid').masonry('appended', $data, true)

                page++;

                $loadmore.attr('data-page', page);
                _injectSvgIcons();
                _initVideoPlayers();

                $loadmore.removeClass('hidden');
                $('.loading').remove();

                if (page > pageLimit) {
                  $loadmoreSection.addClass('hidden');
                }
              },
              error: function(data) {
                console.log(data.responseText);
              }
          });

        });
      }

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

        scrollBody($('.newsletter-form'));
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
      // Form Masking
      var phoneMask = new Inputmask("(999) 999-9999");
      phoneMask.mask($('input[type="tel"]'));

      $('#get-started #fromName').on('keyup', function() {
        $('#messageFrom').val($(this).val());
      });

      var $getStartedForm = $('#get-started-form');

      $getStartedForm.submit(function(ev) {
          // Prevent the form from actually submitting
          ev.preventDefault();

          $getStartedForm.find('.submit-container').append('<div class="loading"><svg class="ednavigator-mark" role="img"><use xlink:href="#ednavigator-mark" /></svg></div>');
          $getStartedForm.find('.button.submit').addClass('disabled');

          // Send it to the server
          $.post({
            url: '/',
            dataType: 'json',
            data: $(this).serialize(),
            success: function(response) {
              $getStartedForm.find('.button.submit').removeClass('disabled');
              $getStartedForm.find('.submit-container .loading').remove();

              if (response.success) {
                $getStartedForm.addClass('success');
                $('#thanks').fadeIn();
              } else {
                // response.error will be an object containing any validation errors that occurred, indexed by field name
                // e.g. response.error.fromName => ['From Name is required']
                alert('An error occurred. Please try again.');
              }
            }
          });
      });
    }

    function _snapScrolling() {
      if ($('.snap-section').length) {
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
              scrollBody($(this).closest('.snap-section').next('.snap-section'), 350, 0, $('.site-header').outerHeight());
            });
          }
        });
      }
    }

    function _initFilters() {
      $document.on('change', '.filter select', function(e) {
        window.location.href = this.value;
      });

      // if ($body.is('.resources-browse') || $body.is('.ideas-browse')) {
      //   var url = window.location.href;
      //   if (url.indexOf('?') != -1) {
      //     window.scrollTo(0, $('#filters').offset().top - $siteHeader.outerHeight());
      //   }
      // }
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
            var data = $('form#stripe-checkout').serialize() + '&token=' + JSON.stringify(token) + '&customer=' + JSON.stringify(args) + '&plan=' + JSON.stringify(planId);
            container.addClass('-loading');
            container.append('<div class="loading"><svg class="ednavigator-mark" role="img"><use xlink:href="#ednavigator-mark" /></svg></div>');
            $.post($('form#stripe-checkout').attr('action'), data, function(response) {
              container.removeClass('-loading');
              container.find('.loading').remove();
              if (response.success) {
                container.find('.checkout-feedback').html('<h3>Success!</h3><p>Your payment will be processed shortly.</p>').slideDown('fast');
              } else {
                container.find('.checkout-feedback').html('<h3>Uh oh!</h3><p>There was a transaction error: ' + response.error + '</p>').slideDown('fast');
              }
            }, 'json').fail(function() {
              container.find('.checkout-feedback').html('<h3>Uh oh!</h3><p>There was a transaction error. Please contact us at <a href="mailto:info@ednavigator.org?subject=stripe%20error">info@ednavigator.org</a>.</p>').slideDown('fast');
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

      // Close Nav
      if ($siteNav.is('.-active') && appState.breakpoints.nav) {
        _closeSiteNav();
      }

      // Reset inline styles for navigation for medium breakpoint
      if (appState.breakpoints.nav) {
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
