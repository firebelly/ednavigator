// FB - Firebelly 2016

//=include "../bower_components/jquery/dist/jquery.js"
//=include "../bower_components/jquery.fitvids/jquery.fitvids.js"
//=include "../bower_components/velocity/velocity.min.js"
//=include "../bower_components/imagesloaded/imagesloaded.pkgd.min.js"
// include "../bower_components/vanilla-lazyload/dist/lazyload.min.js"
//=include "../bower_components/jquery_lazyload/jquery.lazyload.js"
//=include "../bower_components/waypoints/lib/jquery.waypoints.js"
//=include "../bower_components/flickity/dist/flickity.pkgd.min.js"
//=include "../bower_components/flickity-sync/flickity-sync.js"
//=include "../bower_components/jquery-validation/dist/jquery.validate.js"

// Good Design for Good Reason for Good Namespace
var FB = (function($) {

  var screen_width = 0,
      breakpoint_small = false,
      breakpoint_medium = false,
      breakpoint_large = false,
      breakpoint_array = [480,1000,1200],
      $document,
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

    // Scroll down to hash afer page load
    // $(window).load(function() {
    //   if (window.location.hash) {
    //     _scrollBody($(window.location.hash)); 
    //   }
    // });

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
    // Inject SEO-useless mobile nav toggle
    $('.site-nav').closest('div').append('<button class="menu-toggle" aria-hidden="true"><span class="lines"></span></button>').on('click', function() {
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
    $.fn.customerPopup = function (e, intWidth, intHeight, blnResize) {      
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
      $(this).customerPopup(e);
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

  // Track ajax pages in Analytics
  function _trackPage() {
    if (typeof ga !== 'undefined') { ga('send', 'pageview', document.location.href); }
  }

  // Track events in Analytics
  function _trackEvent(category, action) {
    if (typeof ga !== 'undefined') { ga('send', 'event', category, action); }
  }

  // Called in quick succession as window is resized
  function _resize() {
    screenWidth = document.documentElement.clientWidth;
    breakpoint_small = (screenWidth > breakpoint_array[0]);
    breakpoint_medium = (screenWidth > breakpoint_array[1]);
    breakpoint_large = (screenWidth > breakpoint_array[2]);
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
