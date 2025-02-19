class Tooltip{
  constructor(element){
    this.element = element;
    if(this.element.getAttribute('data-tooltip') === null){
      throw new Error(`Tooltip text is missing. Add attribute data-tooltip and the content of the tooltip as value.`);
    }
    this.setEvents();
  }

  setEvents (){
    let module = this;
      this.element.addEventListener('mouseenter', function (e) {
        let trigger = e.target;
        if(trigger.classList.contains('tooltip-hover') === false && trigger.classList.contains('tooltip-focus') === false){
          closeAllTooltips(e);
          trigger.classList.add("tooltip-hover");
          setTimeout(function(){ 
            if(trigger.classList.contains('tooltip-hover')){
              var element = e.target;

              if (element.getAttribute('aria-describedby') !== null) return;
              module.addTooltip(element);
            }
          }, 300);
        }
      });
      this.element.addEventListener('mouseleave', function (e) {
        let trigger = e.target;
        if(trigger.classList.contains('tooltip-hover')){
          var tooltipId = trigger.getAttribute('aria-describedby'); 
          let tooltipElement = document.getElementById(tooltipId);
          if(tooltipElement !== null){
            closeHoverTooltip(trigger);
          }
        }
      });

      this.element.addEventListener('keyup', function(event){
        var key = event.which || event.keyCode;
        if (key === 27) {
          var tooltip = this.getAttribute('aria-describedby');
          if(tooltip !== null && document.getElementById(tooltip) !== null){
            document.body.removeChild(document.getElementById(tooltip));
          }
          this.classList.remove('active');
          this.removeAttribute('aria-describedby');
        }
      });
      
    
    this.element.addEventListener('focus', function (e) {
      var trigger = e.target;
      closeAllTooltips(e);
      trigger.classList.add('tooltip-focus');
      trigger.classList.remove('tooltip-hover');
      if (trigger.getAttribute('aria-describedby') !== null) return;
      module.addTooltip(trigger);

    });
    document.getElementsByTagName('body')[0].removeEventListener('click', closeAllTooltips);
    document.getElementsByTagName('body')[0].addEventListener('click', closeAllTooltips);
  }

  closeAll (){
    var elements = document.querySelectorAll('.js-tooltip[aria-describedby]');
    for(var i = 0; i < elements.length; i++) {
      var popper = elements[ i ].getAttribute('aria-describedby');
      elements[ i ].removeAttribute('aria-describedby');
      document.body.removeChild(document.getElementById(popper));
    }
  }

  


  addTooltip(trigger){
    var pos = trigger.getAttribute('data-tooltip-position') || 'top';

    var tooltip = this.createTooltip(trigger, pos);

    document.body.appendChild(tooltip);

    this.positionAt(trigger, tooltip, pos);
  }

  createTooltip (element, pos) {
    var tooltip = document.createElement('div');
    tooltip.className = 'tooltip-popper';
    var poppers = document.getElementsByClassName('tooltip-popper');
    var id = 'tooltip-'+poppers.length+1;
    tooltip.setAttribute('id', id);
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('x-placement', pos);
    element.setAttribute('aria-describedby', id);

    var tooltipInner = document.createElement('div');
    tooltipInner.className = 'tooltip';

    var tooltipArrow = document.createElement('div');
    tooltipArrow.className = 'tooltip-arrow';
    tooltipInner.appendChild(tooltipArrow);

    var tooltipContent = document.createElement('div');
    tooltipContent.className = 'tooltip-content';
    tooltipContent.innerHTML = element.getAttribute('data-tooltip');
    tooltipInner.appendChild(tooltipContent);
    tooltip.appendChild(tooltipInner);

    return tooltip;
  }

  /**
   * Positions the tooltip.
   *
   * @param {object} parent - The trigger of the tooltip.
   * @param {object} tooltip - The tooltip itself.
   * @param {string} posHorizontal - Desired horizontal position of the tooltip relatively to the trigger (left/center/right)
   * @param {string} posVertical - Desired vertical position of the tooltip relatively to the trigger (top/center/bottom)
   *
   */
  positionAt (parent, tooltip, pos) {
    let trigger = parent;
    let arrow = tooltip.getElementsByClassName('tooltip-arrow')[0];
    let triggerPosition = parent.getBoundingClientRect();
    
    var parentCoords = parent.getBoundingClientRect(), left, top;

    var tooltipWidth = tooltip.offsetWidth;

    var dist = 12;
    let arrowDirection = "down";
    left = parseInt(parentCoords.left) + ((parent.offsetWidth - tooltip.offsetWidth) / 2);

    switch (pos) {
      case 'bottom':
        top = parseInt(parentCoords.bottom) + dist;
        arrowDirection = "up";
        break;

      default:
      case 'top':
        top = parseInt(parentCoords.top) - tooltip.offsetHeight - dist;
    }

    // if tooltip is out of bounds on left side
    if(left < 0) {
      left = dist;
      let endPositionOnPage = triggerPosition.left + (trigger.offsetWidth / 2);
      let tooltipArrowHalfWidth = 8;
      let arrowLeftPosition = endPositionOnPage - dist - tooltipArrowHalfWidth;
      tooltip.getElementsByClassName('tooltip-arrow')[0].style.left = arrowLeftPosition+'px';
    }

    // 
    if((top + tooltip.offsetHeight) >= window.innerHeight){
      top = parseInt(parentCoords.top) - tooltip.offsetHeight - dist;
      arrowDirection = "up";
    }
    
    if(top < 0) {
      top = parseInt(parentCoords.bottom) + dist;
      arrowDirection = "up";
    }
    if(window.innerWidth < (left + tooltipWidth)){
      tooltip.style.right = dist + 'px';
      let endPositionOnPage = triggerPosition.right - (trigger.offsetWidth / 2);
      let tooltipArrowHalfWidth = 8;
      let arrowRightPosition = window.innerWidth - endPositionOnPage - dist - tooltipArrowHalfWidth;
      tooltip.getElementsByClassName('tooltip-arrow')[0].style.right = arrowRightPosition+'px';
      tooltip.getElementsByClassName('tooltip-arrow')[0].style.left = 'auto';
    } else {
      tooltip.style.left = left + 'px';
    }
    tooltip.style.top  = top + pageYOffset + 'px';
    tooltip.getElementsByClassName('tooltip-arrow')[0].classList.add(arrowDirection);
  }
}

function closeAllTooltips(event){
  if (!event.target.classList.contains('js-tooltip') && !event.target.classList.contains('tooltip') && !event.target.classList.contains('tooltip-content')) {  
    var elements = document.querySelectorAll('.tooltip-popper');
    for(var i = 0; i < elements.length; i++) {
      let trigger = document.querySelector('[aria-describedby='+elements[i].getAttribute('id')+']');
      trigger.removeAttribute('data-tooltip-active');
      trigger.removeAttribute('aria-describedby');
      trigger.classList.remove('tooltip-focus');
      trigger.classList.remove('tooltip-hover');
      document.body.removeChild(elements[i]);
    }
  }
}

function closeHoverTooltip(trigger){
  if(trigger.classList.contains('tooltip-hover')){
    var tooltipId = trigger.getAttribute('aria-describedby'); 
    let tooltipElement = document.getElementById(tooltipId);
    console.log('tooltipId', tooltipId);
    console.log('tooltipElement', tooltipElement);
    tooltipElement.classList.add('removing');
    tooltipElement.removeEventListener('mouseenter', onTooltipHover);
    tooltipElement.addEventListener('mouseenter', onTooltipHover);
    /*setTimeout(function(){     
      let tooltipElement = document.getElementById(tooltipId);
      if(tooltipElement.classList.contains("removing")){
        removeTooltip(trigger);
      }
    }, 300);*/
  }
}

function onTooltipHover(e){
  let tooltipElement = this;
  tooltipElement.addEventListener('mouseleave', function(){
    let trigger = document.querySelector('[aria-describedby='+tooltipElement.getAttribute('id')+']');
    if(trigger !== null){
      closeHoverTooltip(trigger);
    }
  })

}

function removeTooltip(trigger){
  var tooltipId = trigger.getAttribute('aria-describedby'); 
  let tooltipElement = document.getElementById(tooltipId);
  
  if(tooltipId !== null && tooltipElement !== null){
    document.body.removeChild(tooltipElement);
  }
  trigger.removeAttribute('aria-describedby');
  trigger.classList.remove('tooltip-hover');
  trigger.classList.remove('tooltip-focus');

}


module.exports = Tooltip;
