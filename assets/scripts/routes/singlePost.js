// Single Post js
import Velocity from 'velocity-animate';
import Flickity from 'flickity-sync';
import Readmore from 'readmore-js';
require('flickity-imagesloaded');

import appState from '../util/appState';
import scrollBody from '../util/scrollBody';
import accordions from '../util/accordions';

const singlePost = {

  init() {

    var $window = $(window),
        $siteHeader = $('.site-header'),
        userScrolled = false,
        sectionNavLastScrollTop = 0,
        paddingBuffer = 25,
        rmjsEnabled = false,
        rmjs = '';

    // Update userScrolled var
    $(window).scroll(function(e){
      userScrolled = true;
    });

    // Run functions to fire on scroll
    setInterval(function() {
      if (userScrolled) {
        _collapseSectionNav();
        userScrolled = false;
      }
    }, 250);

    // Initi
    _checkReadMore();
    _initCarousel();
    _initSectionNav();
    _initFootnotes();

    function _initReadMore() {
      if (!$('.content-aside.family-narrative').length) {
        return;
      }

      rmjs = new Readmore('.content-aside.family-narrative .aside-content', {
        speed: 100,
        collapsedHeight: 146,
        embedCSS: false,
        lessLink: '<a href="#"><span>close</span></a>',
        moreLink: '<a href="#"> ... (<span>read more</span>)</a>',
        blockProcessed: function(element) {
          $(element).closest('aside').addClass('with-readmore');
        },
        beforeToggle: function(trigger, element, expanded) {
          if (!expanded) {
            $(element).closest('.-inner').addClass('-expanded');
          } else {
            $(element).closest('.-inner').removeClass('-expanded');
          }
        }
      });

      rmjsEnabled = true;
    }

    function _checkReadMore() {
      if (appState.breakpoints.lg && rmjsEnabled === false) {
        _initReadMore();
      } else if (rmjs !== '' && !appState.breakpoints.lg) {
        rmjs.destroy(null);
        rmjsEnabled = false;
      }
    }

    function _initCarousel() {
      // Related Posts Carousel
      if ($('.related-posts-carousel').length) {
        var $relatedPostsCarousel = $('.related-posts-carousel');
        var relatedPostsFlckty = new Flickity('.related-posts-carousel', {
          cellSelector: 'article',
          cellAlign: 'left',
          pageDots: false,
          prevNextButtons: true,
          groupCells: '100%',
          arrowShape: 'M33.4 47.7l30.8-15.4c2.1-1.1 4.7 1.1 3.6 3.6l-6.4 12.9c-.7.7-.7 1.4-.4 2.1l6.4 13.2c1.1 2.1-1.1 4.7-3.6 3.6L33 52.3c-1.4-1-1.4-3.9.4-4.6'
        });
      }

      $relatedPostsCarousel.find('button.previous').append('<span>Prev</span>');
      $relatedPostsCarousel.find('button.next').prepend('<span>Next</span>');

      // Content Block Carousels
      if ($('.content-block-carousel').length) {
        var contentBlockCarousel = $('.content-block-carousel');

        for (var i = contentBlockCarousel.length - 1; i >= 0; i--) {
          var contentBlockFlkty = new Flickity(contentBlockCarousel[i], {
            cellSelector: 'figure',
            cellAlign: 'left',
            pageDots: false,
            prevNextButtons: true,
            imagesLoaded: true,
            setGallerySize: false,
            arrowShape: 'M33.4 47.7l30.8-15.4c2.1-1.1 4.7 1.1 3.6 3.6l-6.4 12.9c-.7.7-.7 1.4-.4 2.1l6.4 13.2c1.1 2.1-1.1 4.7-3.6 3.6L33 52.3c-1.4-1-1.4-3.9.4-4.6'
          });
        }
      }
    }

    function _initSectionNav() {
      if ($('.section-navigation').length) {
        var $sectionNav = $('.section-navigation'),
            $wrap = $('.section-navigation-wrap'),
            $accordion = $wrap.find('.accordion'),
            $stickyWrap = $('.sticky-wrap'),
            sections = $('.section');

        // Append Footnotes to Section Nav if Present
        if ($('#endnotes').length) {
          $sectionNav.find('ol').append('<li><a href="#endnotes">Endnotes</a></li>');
        }

        // Click to scroll to section
        $(document).on('click', '.section-navigation a', function(e) {
          e.preventDefault();

          accordions.collapse($accordion);

          var $section = $($(this).attr('href'));
          var headerOffset;

          if ($section.offset().top < $window.scrollTop() + $siteHeader.outerHeight() && appState.breakpoints.lg) {
            headerOffset = $siteHeader.outerHeight() + paddingBuffer;
            scrollBody($section, headerOffset);
          } else {
            if (appState.breakpoints.lg) {
              headerOffset = $siteHeader.outerHeight() + paddingBuffer;
            } else {
              headerOffset = $siteHeader.outerHeight() + $sectionNav.find('.accordion-toggle').outerHeight() + paddingBuffer;
            }
            scrollBody($section, headerOffset);
          }

          parent.location.hash = $(this).attr('href').replace('#','');
        });


        // Sticky Behavior
        $(window).scroll(function(e){
          var st = $window.scrollTop(),
              wrapIsStuck = $wrap.is('.stuck'),
              wrapIsBottomStuck = $wrap.is('.bottom-stuck'),
              stickyWrapTop = $stickyWrap.offset().top,
              stickyWrapBottom = $stickyWrap.offset().top + $stickyWrap.outerHeight(),
              scrollPos = st + $siteHeader.outerHeight(),
              translateOffset = 0;

          if ($('html').is('.translated-ltr')) {
            translateOffset = 38;
          }

          // If elmeent isn't stuck and scroll is withiin the sticky wrap bounds, make it sticky
          if (!wrapIsStuck && scrollPos > stickyWrapTop && scrollPos + $wrap.outerHeight() < stickyWrapBottom) {

            // Collapse the accordion if it's open
            if ($accordion.is('.-active')) {
              accordions.collapse($accordion, false);
            }
            // Add some padding to the container so it doesn't jump down
            // when the nav is plucked to be fixed
            if (!appState.breakpoints.lg) {
              $wrap.parent().css('padding-top', $wrap.outerHeight() + 25 + 'px');
            }

            $wrap.addClass('stuck').css('top', $siteHeader.outerHeight() + translateOffset);
            $wrap.find('.section-navigation').velocity({
              translateY: [0, '-100%']
            });

          // If it's already stuck and scroll is above the element, un-stick it
          } else if (wrapIsStuck && scrollPos < stickyWrapTop) {
            if (!appState.breakpoints.lg) {
              $wrap.parent().css('padding-top', '');
            }

            $wrap.removeClass('stuck').css('top', 'auto');

            if (appState.breakpoints.lg && !$accordion.is('.-active')) {
              accordions.expand($accordion, false);
            }

          // If it's stuck and scroll is past the bottom of the sticky wrap, stick it to the bottom of the wrap
          } else if (wrapIsStuck && !wrapIsBottomStuck && scrollPos + $wrap.outerHeight() >= stickyWrapBottom - 300) {

            $wrap.addClass('bottom-stuck');
            $sectionNav.velocity({
              translateY: '-100%'
            });

          // If it's bottom-stuck and scroll is less than the bottom of the sticky wrap, un-bottom-stuck it
          } else if ($wrap.is('.bottom-stuck') && scrollPos + $wrap.outerHeight() < stickyWrapBottom - 300) {

            $wrap.removeClass('bottom-stuck');
            $sectionNav.velocity({
              translateY: 0
            });
          }

        });
      }
    }

    function _updateSectionNavPos(navOffset) {
      $('.section-navigation-wrap.stuck').css('top', navOffset);
    }

    function _collapseSectionNav() {
      var st = $(window).scrollTop();
      // If on large-screen, and the nav is stuck, and the user scrolls a bit, contract it
      if ($('.section-navigation-wrap').length && $('.section-navigation-wrap').is('.stuck') && $('.section-navigation').is('.-active')) {
        if (Math.abs(sectionNavLastScrollTop - st) <= 150) {
            return;
        }
        accordions.collapse($('.section-navigation'));
      }
      sectionNavLastScrollTop = st;
    }

    function _initFootnotes() {
      $('#endnotes li > a').on('click', function(e) {
        e.preventDefault();
        var href = $(this).attr('href');
        scrollBody($(href));
      });
    }

    function _resize() {
      // Reposition section nav
      if ($('.section-navigation').length) {
        if ($('.section-navigation-wrap').is('.stuck')) {
          _updateSectionNavPos($siteHeader.outerHeight());
        }

        if (appState.breakpoints.lg && $(window).scrollTop() < $('.sticky-wrap').offset().top && !$('.section-navigation').is('.-active')) {
          accordions.expand($('.section-navigation'), false);

          if ($('.section-navigation-wrap').is('.stuck')) {
            $('.section-navigation-wrap').removeClass('stuck').css('top', 'auto');
          }
        }
      }

      _checkReadMore();
    }
    $window.resize(_resize);
  },

  finalize() {

  },

  unload() {

  },

};

export default singlePost
