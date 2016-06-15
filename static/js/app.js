var quantum = (function() {

  function init() {

    //Initialize all neccessary script
    initBootstrap();    
    initGlobalEvents();
    initTouchEvents();
    initPlugin();
    initPreloading();
    initHeader();
    initSideNavigation();
    initRightSidebar(); 

    $(window).load(function() {
      initialMagicLine();
      $('.theme-setting').addClass('rubberBand');
    });
  }

  function initBootstrap()  {
    // Enable Tooltip //
    $('.tooltip-default').tooltip({
      container: 'body'
    });

    $('.tooltip-gray').tooltip({
      container: 'body',
      template: '<div class="tooltip tooltip-gray" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>' 
    });

    $('.tooltip-primary').tooltip({
      container: 'body',
      template: '<div class="tooltip tooltip-primary" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>' 
    });

    $('.tooltip-success').tooltip({
      container: 'body',
      template: '<div class="tooltip tooltip-success" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>' 
    });

    $('.tooltip-danger').tooltip({
      container: 'body',
      template: '<div class="tooltip tooltip-danger" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>' 
    });

    // Enable Popover //
    $('[data-toggle="popover"]').popover();

    // Animated Dropdown //
    $('.dropdown-hover').hover(function() { //Open on hover
      $(this).find('.dropdown-menu').dropdown('toggle');
    }).click(function(e) {
      e.stopPropagation();
    });

    $('.dropdown, .btn-group').on('show.bs.dropdown', function () {
      var $this = $(this);
      $this.children('.dropdown-animated').removeClass('closed');
      $this.children('.dropdown-animated').addClass('opened');
    }).on('hide.bs.dropdown', function () {
      var $this = $(this);
      $this.children('.dropdown-animated').removeClass('opened');
      $this.children('.dropdown-animated').addClass('closed');
    });

    // Clickable Dropdown //
    $('.clickable-dropdown').click(function(e)  {
      e.stopPropagation();
    });

    // Collapse //
    $('.sub-menu').on('show.bs.collapse', function (e) {
      var $this = $(this);
      e.stopPropagation();

      $this.parent().addClass('opened');
      $this.removeClass('closed');
      $this.addClass('opened');
    }).on('shown.bs.collapse', function () {
      var $this = $(this);
      $this.removeClass('opened');  
    }).on('hide.bs.collapse', function (e) {
      var $this = $(this);
      e.stopPropagation();
      $this.parent().removeClass('opened');
      $this.removeClass('opened');
      $this.addClass('closed');
    }).on('hidden.bs.collapse', function () {
      var $this = $(this);
      $this.removeClass('closed');
    });

  }

  function initGlobalEvents() {

    // Theme Setting //
    $('.color-list li').click(function()  {
      var colorElm = $(this).children('span');
      var selectedColor = colorElm.data('color');
      var colorName = colorElm.data('name');
      var coreCss = $('.core-css');

      if(colorName == 'blue') {
        coreCss.attr('href','../css/app_blue.min.css');
      }
      else if(colorName == 'orange')  {
        coreCss.attr('href','../css/app_orange.min.css'); 
      }
      else if(colorName == 'purple')  {
        coreCss.attr('href','../css/app_purple.min.css'); 
      }
      else if(colorName == 'red')  {
        coreCss.attr('href','../css/app_red.min.css'); 
      }
      else if(colorName == 'green')  {
        coreCss.attr('href','../css/app_green.min.css'); 
      }
      else if(colorName == 'yellow')  {
        coreCss.attr('href','../css/app_yellow.min.css'); 
      }
      else  {
        coreCss.attr('href','../css/app.min.css');   
      }
    });

    $('#sidebarFixed').click(function() { //Check if side navigation is fixed
      if($(this).prop('checked')) {
        $('.side-navigation-wrap').addClass('sidebar-fixed');  
      }
      else  {
        $('.side-navigation-wrap').removeClass('sidebar-fixed');
      }
    });

    $('#topnavFixed').click(function() { //Check if top navigation is fixed
      if($(this).prop('checked')) {
        $('.top-navigation').addClass('topnav-fixed');  
      }
      else  {
        $('.top-navigation').removeClass('topnav-fixed');
      }
    });

    $('#fullWidthContainer').click(function() { //Toggle full width class for top navigation layout
      if($(this).prop('checked')) {
        $('.wrapper').addClass('full-width-container');  
      }
      else  {
        $('.wrapper').removeClass('full-width-container');
      }
    });
    // End Theme Setting //

    //Add animation to cog icon that open theme setting modal
    $('.theme-setting').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() { //Check if animation is end
      var $this = $(this);
      $this.removeClass('rubberBand'); //remove animation class. 
      
      setTimeout(function() {
        $this.addClass('rubberBand'); 
      },2000);
    });

    // Refresh Widget //
    $('.refresh-widget').click(function() {
      var loadingWrap = $(this).parents('.panel').find('.loading-wrap');
      loadingWrap.addClass('loading');

      setTimeout(function() {
        loadingWrap.removeClass('loading');
      },1500);

      return false;
    });

    // Fullscreen Widget //
    $('.fullscreen-widget').click(function() {
      var loadingWrap = $(this).parents('.panel').toggleClass('widget-fullscreen-mode');
      $('body').toggleClass('fullscreen-mode');
      
      return false;
    });
  }

  function initTouchEvents() {
    //Touch Device Only//////////////////
    if(!!('ontouchstart' in window))  { //check for touch device
      //Disabled css transition on touch device for better performance.
      $('.main-container').addClass('no-transition');
      $('.header-top').addClass('no-transition');
      $('.top-navigation').addClass('no-transition');
      $('.side-navigation-wrap').addClass('no-transition');
      $('.right-sidebar-wrap').addClass('no-transition');
    }
  }

  function initPlugin() {
    //Adding scrollbar to sidebar, both left and right
    $('.sidenav-inner').slimscroll({
      height: '100%',
      size: '2px',
      color: '#95a4b8',
      touchScrollStep: 20
    });
  }

  function initHeader() {
    //Toggle Search bar on small device
    $('.search-toggle').click(function()  {
      $('.top-bar').toggleClass('active');

      return false;
    });
  }

  function initSideNavigation() {
    // Toggle side navigation width(Sidebar Width)
    $('.sidenav-size-toggle').click(function()  {
      $('.wrapper').toggleClass('side-nav-sm');
      initialMagicLine();
    });

    //Toggle side navigation in small device
    $('.side-nav-toggle').click(function() {
      $('.wrapper').toggleClass('side-nav-shown');
      $('.main-container').toggleClass('side-nav-shown');
    });

    // Submenu on small side nav //
    $('.hover-expand .side-navigation-wrap').hover(
      function()  { 
        $('.wrapper').addClass('sidenav-active'); 

        //Reposition of magicline when mouse enter
        setTimeout(function() {
          initialMagicLine();
        },200);
      },
      function(){ 
        $('.wrapper').removeClass('sidenav-active');

        //Reposition of magicline when mouse leave
        setTimeout(function() {
          initialMagicLine();
        },200);
      }
    );

    //Expanding the side navigation on hover if it has class .hover-expand
    $( "body" ).on( "mouseenter", ".side-nav-sm:not(.hover-expand) .side-nav > .has-submenu", function() {
      $(this).children('.collapse').collapse('show');
    }).on( "mouseleave", ".side-nav-sm:not(.hover-expand) .side-nav > .has-submenu", function() {
      $(this).children('.collapse').collapse('hide');
    });
  }

  function initRightSidebar() {
    $('.toggle-right-sidebar').click(function() {
      toggleRightSidebar();

      return false;
    });

    //Hide Right Sidebar when clicking outside
    $('body').on('click', '.wrapper.right-sidebar-opened', function(e) {
        var wrapper = $('.wrapper');
        var rightSidebar = $('.right-sidebar-wrap');
        var secondLevelRightSidebar = $('.right-sidebar-second-level');
        var toggleRightSidebarBtn = $('.toggle-right-sidebar');

        if (!rightSidebar.is(e.target) // if the target of the click isn't the container...
            && rightSidebar.has(e.target).length === 0 // ... nor a descendant of the container
            && !secondLevelRightSidebar.is(e.target)
            && secondLevelRightSidebar.has(e.target).length === 0 
            && !toggleRightSidebarBtn.is(e.target) //... nor a descendant of toggle button
            && toggleRightSidebarBtn.has(e.target).length === 0 
          )
        {
            wrapper.removeClass('right-sidebar-opened');
            secondLevelRightSidebar.removeClass('active');
        }
    });

    //Show/Hide second leverl right sidebar
    $('.right-sidebar-wrap .chat-friend-list > li').click(function()  {
      $('.right-sidebar-second-level').addClass('active');
    });

    $('.right-sidebar-second-level .close').click(function()  {
      $('.right-sidebar-second-level').removeClass('active');
    });
  }

  // Toggle Right Sidebar
  function toggleRightSidebar() {
    $('.wrapper').toggleClass('right-sidebar-opened');
    $('.right-sidebar-second-level').removeClass('active');  
  }

  function initialMagicLine() { //Moving active line when change the cursor's position
    if($('.wrapper').hasClass('nav-top')) { //For top navigation layout
      var $el, leftPos, newWidth,
        $mainNav = $(".magic-nav");
      
      var hasActiveLink = false;
      $mainNav.children('li.active').each(function() {
        hasActiveLink = true;
      });

      if(hasActiveLink) {
        $('.magic-line').remove();

        $mainNav.append("<li class='magic-line'></li>");
        var $magicLine = $(".magic-line");
        
        $magicLine
          .width($(".magic-nav > .active").width())
          .css("left", $(".magic-nav > .active").position().left)
          .data("origLeft", $magicLine.position().left)
          .data("origWidth", $magicLine.width());

        $(".magic-nav > li > a").hover(function() {
          $el = $(this);
          leftPos = $el.parent().position().left;
          newWidth = $el.parent().width();

          $magicLine.stop().animate({
              left: leftPos,
              width: newWidth
          });
        }, function() {
          $magicLine.stop().animate({
              left: $magicLine.data("origLeft"),
              width: $magicLine.data("origWidth")
          });    
        });
      }
    } 
    else  { //For side navigation layout
      var $el, topPos, newHeight,
      $sideNav = $(".magic-nav");
    
      var hasActiveLink = false;
      $sideNav.children('li.active').each(function() {
        hasActiveLink = true;
      });

      if(hasActiveLink) {
        $('.magic-line').remove();

        $sideNav.append("<li class='magic-line'></li>");
        var $magicLine = $(".side-navigation-wrap .magic-line");
        
        $magicLine
          .height($(".magic-nav > .active > a").innerHeight())
          .css("top", $(".magic-nav > .active").position().top)
          .data("origTop", $magicLine.position().top)
          .data("origHeight", $magicLine.height());
            
        $(".magic-nav > li:not(.side-nav-header)").hover(function() {
          $el = $(this);
          topPos = $el.position().top;
          newHeight = $el.children('a').innerHeight();

          $magicLine.stop().animate({
              top: topPos,
              height: newHeight
          });
        }, function() {
          $magicLine.stop().animate({
              top: $magicLine.data("origTop"),
              height: $magicLine.data("origHeight")
          });  
        });  
      }
    }
  }

  function initPreloading() {
    //Preloading Animation
    if($('.wrapper').hasClass('animsition'))  {
      $(".animsition").animsition({
        inClass               :   'fade-in',
        outClass              :   'fade-out',
        inDuration            :    1500,
        outDuration           :    800,
        linkElement           :   '.animsition-link',
        // e.g. linkElement   :   'a:not([target="_blank"]):not([href^=#])'
        loading               :    true,
        loadingParentElement  :   'body', //animsition wrapper element
        loadingClass          :   'animsition-loading',
        unSupportCss          : [ 'animation-duration',
                                  '-webkit-animation-duration',
                                  '-o-animation-duration'
                                ],
        overlay               :   false,
        overlayClass          :   'animsition-overlay-slide',
        overlayParentElement  :   'body'
      });
    }
  }

  init();

  return { 
    init : init,
  };
})();