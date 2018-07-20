$(document).ready(function(){
  const gameContainer = $('#gameContainer');

  let gameWidth = 30;
  let gameHeight = 20;
  let draw = false;
  let erase = false;
  let zoom = 1;
  let drag = false;
  let marginX = 0;
  let marginY = 0;
  let startX;
  let startY;
  let tick = 500;

  class Grid{
    constructor(container, width, height, wrap, condition){
      this.container = container;
      this.width = width;
      this.height = height;
      this.wrap = wrap;
      this.condition = condition;
      this.running = false;
    }

    populate(){
      let cellHeight;
      this.container.html('');
      if(this.width == this.height) cellHeight = 100/this.height;
      else if(this.width > this.height) cellHeight = 120/this.width;
      else cellHeight = 120/this.height;
      for(let y = 0; y < this.height; y++){
        this.container.append(`<div class="y" id="y${y}"></div>`);
        for(let x = 0; x < this.width; x++){
          $(`#y${y}`).append(`<div class="x" id="x${x}"></div>`);
        }
      }
      $('.x').css({'width': `${cellHeight}vh`, 'height': `${cellHeight}vh`});
    }

    getGameState(){
      let gameGrid = [];
      for(let y = 0; y < this.height; y++){
        gameGrid.push([]);
        for(let x = 0; x < this.width; x++){
          gameGrid[y].push($(`#y${y}`).find(`#x${x}`).hasClass('alive'));
        }
      }
      return gameGrid;
    }

    tileHasLeftNeighbor(array, x, y){
      return (x == 0) ? (this.wrap ?  array[y][(array[0].length -1)] : false) : array[y][x-1];
    }
    tileHasRightNeighbor(array, x, y){
      return (x == array[0].length-1) ? (this.wrap ? array[y][(x+1)%(array[0].length -1)] : false) : array[y][x+1];
    }
    tileHasTopNeighbor(array, x, y){
      return (y == 0) ? (this.wrap ? array[(array.length-1)][x] : false) : array[y-1][x];
    }
    tileHasBottomNeighbor(array, x, y){
      return (y == array.length-1) ? (this.wrap ? array[1][x] : false) : array[y+1][x];
    }
    tileHasTopLeftNeighbor(array, x, y){
      if(x == 0 || y == 0){
        if(this.wrap) return array[(array.length-1)][(array[0].length-1)];
        else return false;
      }
      return array[y-1][x-1]
    }
    tileHasTopRightNeighbor(array, x, y){
      if(x == array.length[0]-1 || y == 0){
        if(this.wrap) return array[(array.length-1)][(x+1)%(array[0].length-1)];
        else return false;
      }
      return array[y-1][x+1]
    }
    tileHasBottomLeftNeighbor(array, x, y){
      if(x == 0 || y == array.length-1){
        if(this.wrap) return array[(y+1)%(array.length-1)][(array[0].length-1)];
        else return false;
      }
      return array[y+1][x-1]
    }
    tileHasBottomRightNeighbor(array, x, y){
      if(x == array[0].length-1 || y == array.length-1){
        if(this.wrap) return array[(y+1)%(array.length-1)][(x+1)%(array[0].length-1)];
        else return false;
      }
      return array[y+1][x+1]
    }
    tileNumNeighbors(array, x, y){
      let total = 0;
      if(this.tileHasLeftNeighbor(array, x, y)) total++;
      if(this.tileHasRightNeighbor(array, x, y)) total++;
      if(this.tileHasTopNeighbor(array, x, y)) total++;
      if(this.tileHasBottomNeighbor(array, x, y)) total++;
      if(this.tileHasTopLeftNeighbor(array, x, y)) total++;
      if(this.tileHasTopRightNeighbor(array, x, y)) total++;
      if(this.tileHasBottomLeftNeighbor(array, x, y)) total++;
      if(this.tileHasBottomRightNeighbor(array, x, y)) total++;
      return total;
    }
    tileHasNeighbors(array, x, y, amount){
      return amount == this.tileNumNeighbors(array, x, y);
    }
    tileKill(x, y){
      $(`#y${y}`).find(`#x${x}`).removeClass('alive');
    }
    tileRevive(x, y){
      $(`#y${y}`).find(`#x${x}`).addClass('alive');
    }

    tick(time){
      let gameGrid = this.getGameState();
      let self = this;
      $.each(gameGrid, (y, val) => {
        $.each(val, (x, alive) => {
          if(alive){
            if(this.tileNumNeighbors(gameGrid, x, y) <= 1) this.tileKill(x, y);
            else if(this.tileNumNeighbors(gameGrid, x, y) >= 4) this.tileKill(x, y);
          }
          else{
            if(this.tileNumNeighbors(gameGrid, x, y) == 3) this.tileRevive(x, y);
          }
        });
      });
      setTimeout(function(){
        if(self.running) self.tick(time)
      }, time);
    }

    start(){
      this.running = true;
      this.tick(tick);
    }
    stop(){
      this.running = false;
    }
    isRunning(){
      return this.running;
    }
  }

  $(document).on('click', '.x', function(){
    $(this).toggleClass('alive');
  });

  $(document).mousedown((e) => {
    if(e.which == 1) draw = true;
    else if(e.which == 2){
      drag = true;
      startX = e.pageX;
      startY = e.pageY;
    }
    else if(e.which == 3) erase = true;
  });

  $(document).mouseup((e) => {
    if(e.which == 1) draw = false;
    else if(e.which == 2){
      marginX += startX - e.pageX;
      marginY += startY - e.pageY;
      drag = false;
    }
    else if(e.which == 3) erase = false;
  });

  $(document).on('mouseenter', '.x', function(){
    if(draw) $(this).addClass('alive');
    else if(erase) $(this).removeClass('alive');
  });

  $(document).keypress((e) => {
    if(e.key == ' '){
      if(grid.isRunning()) grid.stop();
      else grid.start();
    }
  });

  $(document).on('DOMMouseScroll', function(e){
    if(e.originalEvent.detail <= 0) zoom += .1;
    else zoom -= .1;
    if(zoom < 0) zoom = 0;
    $('#gameContainer').css({'transform': `scale(${zoom})`});
  });

  $(document).mousemove((e) => {
    if(drag){
      let diffX = startX - e.pageX;
      let diffY = startY - e.pageY;
      $('#gameWrapper').css({'margin-top': marginY + diffY, 'margin-left': marginX + diffX});
    }
  });

  $('#settingsIcon').click(() => {
    if($('#settingsWrapper').css('display') == 'none'){
      $('#settingsWrapper').css({'display': 'block'}).stop().animate({'opacity': '.6'});
    }
    else{
      $('#settingsWrapper').stop().animate({'opacity': '0'});
      setTimeout(function(){
        $('#settingsWrapper').css({'display': 'none'});
      }, 250)
    }
  });

  $('#settingsClear').click(function(){
    grid.stop();
    grid.populate();
  });
  $('#settingsCenter').click(function(){
    $('#gameWrapper').css({'margin-top': '0px', 'margin-left': '0px'});
    $('#gameContainer').css({'transform': 'scale(1)'});
    marginY = 0;
    marginX = 0;
  });
  $('#tickSlider').val(.5).change(function(){
    let val = $(this).val();
    tick = val * 1000;
    $('#tickOut').text(`every ${val} seconds`)
  });
  $('#widthSlider').val(30).change(function(){
    let val = $(this).val();
    grid.width = val;
    $('#widthOut').text(`${val} tiles`);
  });
  $('#heightSlider').val(20).change(function(){
    let val = $(this).val();
    grid.height = val;
    $('#heightOut').text(`${val} tiles`);
  });


  grid = new Grid(gameContainer, gameWidth, gameHeight, false, 'tileHasLeftNeighbor');

  grid.populate();


});
