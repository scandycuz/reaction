let ORB_AMOUNT = 1;
let TURN_FACTOR = 5;

let KEYCODE_SPACE = 32;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;
var KEYCODE_A = 65;
var KEYCODE_D = 68;

let maxDocumentWidth = window.innerWidth;

let numberOfOrbs = 4;
let dynamicBullets;
let speedCountdown = 2;
let dimensionCountdown = 1;
let canvasAddition = 150;
let orbCountDown = 0;
let bulletSpeed = 40;
let orbSpeed = 6;
let dimX = 600;
let dimY = 800;
let orbs = [];
let bullets = [];
let canvas, stage, position;
let cannonInstance;
let lfHeld = rtHeld = false;
let shotsRemaining = 10;
let currentLevel = 1;
let shotsThisRound = 0;
let shotCooldown;
let points = 0;
let backgroundCounter = 20;
let backgroundDarker = false;
let titleField;
let subtitleField;
let subtitleFieldTwo;
let subtitleFieldThree;
let levelDisplay;
let levelPointsDisplayOne;
let levelPointsDisplayTwo;
let levelPointsDisplayThree;
let gameOverMessage;
let finalPointsMessage;
let level = 1;
let nextBonus = 250;
let gameLoading;
let gameEnded;
let soundtrack;
let soundtrackProps;
let soundtrackPlaying = false;
let songLoaded = false;

let $gameControls;
let $shotsLeft;
let $scoreContainer;
let helpModal;

let w;
let h;
let space;
let queue;
let trackOne;
let explosionEffect;
let fireEffect;

function init() {
  $('#gameCanvas').css('background-color', '#000');
  gameLoading = true;
  gameEnded = false;
  canvas = document.getElementById("gameCanvas");
	stage = new createjs.Stage(canvas);
  soundtrackProps = new createjs.PlayPropsConfig().set({loop: -1, volume: 0.4});

  $('.sound-icons').on("click", toggleIcon);

  fireEffect = "fire";
  explosionEffect = "explosion";
  trackOne = "trackOne";
  let sounds = {path:"./assets/",
    manifest: [
      {id: trackOne, src: {mp3:"tours-enthusiast.mp3", ogg:"tours-enthusiast.ogg"}},
      {id: fireEffect, src: {mp3:"grenade-launcher.mp3"}},
      {id: explosionEffect, src: {mp3:"bomb.mp3"}}
    ]
  };

  createjs.Sound.alternateExtensions = ["mp3", "ogg"];
  createjs.Sound.registerSounds(sounds);
  createjs.Sound.addEventListener("fileload", handleFileLoad);

  queue = new createjs.LoadQueue();
  queue.on("complete", handleComplete, this);
  queue.loadFile({id:"fireEffect", src:"assets/grenade-launcher.mp3"});
  queue.loadFile({id:"explosionEffect", src:"assets/bomb.mp3"});
  queue.loadManifest([
    {id:"spaceOne", src:"assets/universe-background-alt.jpg"},
    {id:"spaceTwo", src:"assets/universe-background.jpg"}
  ]);

  canvas.width = dimX;
  canvas.height = dimY;
}

function handleFileLoad(e) {
  if (e.src === "./assets/tours-enthusiast.mp3" || e.src === "./assets/tours-enthusiast.ogg") {
    songLoaded = true;
    playTrack(1);
  }
}

function playExplosion() {
  createjs.Sound.play(explosionEffect);
}

function playFire() {
  createjs.Sound.play(fireEffect);
}

function toggleTrack(trackNum) {
  switch(trackNum) {
    case 1:
      if (!soundtrackPlaying) {
        soundtrackPlaying = true;
        soundtrack = createjs.Sound.play(trackOne, soundtrackProps);
      } else {
        soundtrackPlaying = false;
        createjs.Sound.stop(trackOne);
      }

  }
}

function playTrack(trackNum) {
  switch(trackNum) {
    case 1:
      if (!soundtrackPlaying) {
        soundtrackPlaying = true;
        soundtrack = createjs.Sound.play(trackOne, soundtrackProps);
      }

  }
}

function stopTrack(trackNum) {
  switch(trackNum) {
    case 1:
      soundtrackPlaying = false;
      createjs.Sound.stop(trackOne);
  }
}

function handleComplete() {
  $('.score-num').text('0');

  space = new createjs.Shape();
  space.scaleX = 0.5;
  space.scaleY = 0.5;
  space.alpha = 0.5;
  w = dimX * 2;
  h = dimY * 2;
	space.graphics.beginBitmapFill(
    queue.getResult("spaceOne")
  ).drawRect(0, 0, w, h);

  function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  WebFont.load({
    google: {
      families: ['Bungee', "Space Mono", "VT323"]
    },
    fontactive: () => {
      titleField = new createjs.Text("REACTION", "bold 78px Bungee", "#FFC41E");
    	titleField.maxWidth = dimX;
    	titleField.textAlign = "center";
    	titleField.textBaseline = "middle";
    	titleField.x = canvas.width / 2;
    	titleField.y = canvas.height / 2 - 20;
      let leftArrow = decodeHtml("&larr;");
      let rightArrow = decodeHtml("&rarr;");
      subtitleField = new createjs.Text(`${leftArrow} ${rightArrow} to Aim`, "lighter 32px 'Space Mono'", "#FFC41E");
    	subtitleField.maxWidth = dimX;
    	subtitleField.textAlign = "center";
    	subtitleField.textBaseline = "middle";
    	subtitleField.x = canvas.width / 2;
    	subtitleField.y = canvas.height / 2 + 110;
      subtitleFieldTwo = new createjs.Text(`SPACE to Fire`, "lighter 32px 'Space Mono'", "#FFC41E");
    	subtitleFieldTwo.maxWidth = dimX;
    	subtitleFieldTwo.textAlign = "center";
    	subtitleFieldTwo.textBaseline = "middle";
    	subtitleFieldTwo.x = canvas.width / 2;
    	subtitleFieldTwo.y = canvas.height / 2 + 170;
      subtitleFieldThree = new createjs.Text(`- Press Any Key -`, "lighter 24px 'VT323'", "#FFC41E");
    	subtitleFieldThree.maxWidth = dimX;
    	subtitleFieldThree.textAlign = "center";
    	subtitleFieldThree.textBaseline = "middle";
    	subtitleFieldThree.x = canvas.width / 2;
    	subtitleFieldThree.y = canvas.height / 2 + 240;

    	stage.addChild(titleField ,subtitleField, subtitleFieldTwo, subtitleFieldThree);
      stage.update();
      canvas.onclick = handleClick;
      document.addEventListener("keydown", handleClick);
    }
  });

}

function addCannon() {
  cannonInstance = new createjs.Sprite(cannon);
  cannonInstance.gotoAndPlay(`static`);
  cannonInstance.x = canvas.width / 2;
  cannonInstance.y = canvas.height;
  cannonInstance.regX = 117;
  cannonInstance.regY = 180;
  stage.addChild(cannonInstance);
}

function addStandardOrb() {
  var standardOrbInstance = new createjs.Sprite(standardOrb);
  standardOrbInstance.position = randomPosition();
  standardOrbInstance.x = standardOrbInstance.position[0];
  standardOrbInstance.y = standardOrbInstance.position[1];
  standardOrbInstance.scaleX = 0.5;
  standardOrbInstance.scaleY = 0.5;
  standardOrbInstance.regX = 118;
  standardOrbInstance.regY = 118;
  standardOrbInstance.vector = randomVector();
  let speed = Math.random();
  standardOrbInstance.speed = ((speed < 0.5) ? speed + 0.5 : speed) * orbSpeed;
  standardOrbInstance.bounds = 36;
  standardOrbInstance.exploded = false;
  let animationNum = Math.floor(Math.random() * 2) + 1;
  standardOrbInstance.gotoAndPlay(`spin${animationNum}`);
  orbs.push(standardOrbInstance);
  stage.addChild(standardOrbInstance);
}

function toggleIcon(e) {
  $target = $(e.target);
  $sibling = $target.siblings('i');
  $target.addClass('hidden');
  $sibling.removeClass('hidden');
  if ($sibling.hasClass("sound-on")) {
    createjs.Sound.volume = 1;
  } else {
    createjs.Sound.volume = 0;
  }
}

function handleClick(event) {
	canvas.onclick = null;
  document.removeEventListener("keydown", handleClick);
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  if (songLoaded) {
    playTrack(1);
  }

  $('#user-menu').css('visibility', 'visible');
  $gameControls = $('#game-controls');
  $shotsLeft = $('.shots-left-num');
  $scoreContainer = $('.score-num');
  $('.shots-label').text("SHOTS:");

  $gameControls.css("max-width", dimX);
  $shotsLeft.text(shotsRemaining);
  $scoreContainer.text(points);

  reset();
	restart();
}

function randomPosition() {
  let pos;
  let exists = false;
  while (exists === false) {
    exists = true;
    let posX = dimX * Math.random();
    if (posX < 40) {
      posX = posX + 40
    } else if (posX > dimX - 40) {
      posX = posX - 40;
    }
    let posY = dimY * Math.random();
    if (posY < 40) {
      posY += 40
    } else if (posY > dimY - 40) {
      posY -= 40;
    }
    pos = [
      posX,
      posY
    ];

    for (let i = 0; i < orbs.length; i++) {
      let obj = {};
      obj.x = pos[0];
      obj.y = pos[1];
      obj.bounds = 30;

      if (hasCollided(obj, orbs[i])) {
        exists = false;
      }
    }
  }

  return pos;
}

function randomVector() {
  return [
    randomVectorCoord(),
    randomVectorCoord()
  ]
}

function randomVectorCoord() {
  let num = (Math.random() * 2) - 1;
  return num;
}

function addBackground(type) {
  switch(type) {
    case 'space':
    stage.addChild(space);
    break;
  }
}

function reset() {
  stage.removeAllChildren();
  stage.clear();
  orbs = [];
  bullets = [];
  points = 0;

  // unpause ticker
  createjs.Ticker.paused = false;
}

function nextLevel() {
  document.onkeydown = null;

  if (orbCountDown > 0) {
    orbCountDown--;
  } else {
    numberOfOrbs += ORB_AMOUNT;
    orbCountDown = 1;
  }

  if (speedCountdown > 0) {
    speedCountdown--;
  } else {
    orbSpeed += 0.5;
    speedCountdown = 2;
  }

  // Check if canvas width should be increased
  if (dimensionCountdown > 0) {
    dimensionCountdown--;
  } else if (dimX < maxDocumentWidth) {
    stage.removeAllChildren();
    stage.clear();
    dimensionCountdown = 2;

    // Add width to canvas
    if (dimX < (maxDocumentWidth - canvasAddition)) {
      canvas.width += canvasAddition;
      dimX += canvasAddition;
    // Set canvas to full width
    } else {
      canvas.width = maxDocumentWidth;
      dimX = maxDocumentWidth;
    }

    canvasAddition = 100;
    w = dimX * 2;
    if (dimX < 900) {
      space.graphics.clear().beginBitmapFill(
        queue.getResult("spaceOne")
      ).drawRect(0, 0, w, h);
    } else {
      space.scaleX = 1;
      space.scaleY = 1;
      space.graphics.clear().beginBitmapFill(
        queue.getResult("spaceTwo")
      ).drawRect(0, 0, w, h);
    }
    stage.addChild(space);
    addCannon();
  }

  // prior level won in one shot
  if (shotsThisRound === 1) {
    shotsRemaining++;
    levelPointsDisplayOne = new createjs.Text("Single Shot Bonus: +1 Shots", "bold 28px 'VT323'", "#FFC41E");
    levelPointsDisplayOne.maxWidth = dimX;
    levelPointsDisplayOne.textAlign = "center";
    levelPointsDisplayOne.textBaseline = "middle";
    levelPointsDisplayOne.x = dimX / 2;
    levelPointsDisplayOne.y = dimY / 2;
    stage.addChild(levelPointsDisplayOne);

  }

  // bonus points milestone passed
  if (points > nextBonus) {
    shotsRemaining += 2;
    levelPointsDisplayTwo = new createjs.Text(`${nextBonus} Points! Bonus: +2 Shots`, "bold 28px 'VT323'", "#FFC41E");
    nextBonus = nextBonus + nextBonus;
    levelPointsDisplayTwo.maxWidth = dimX;
    levelPointsDisplayTwo.textAlign = "center";
    levelPointsDisplayTwo.textBaseline = "middle";
    levelPointsDisplayTwo.x = dimX / 2;
    levelPointsDisplayTwo.y = dimY / 2 + 40;
    stage.addChild(levelPointsDisplayTwo);
  }

  levelDisplay = new createjs.Text(`Level ${level}`, "bold 60px 'VT323'", "#FFC41E");
  levelDisplay.maxWidth = dimX;
  levelDisplay.textAlign = "center";
  levelDisplay.textBaseline = "middle";
  levelDisplay.x = dimX / 2;
  levelDisplay.y = dimY / 2 - 80;
  stage.addChild(levelDisplay);

  $shotsLeft.text(shotsRemaining);

  setTimeout( () => {
    levelPointsDisplayThree = new createjs.Text(`- Press Any Key -`, "lighter 24px 'VT323'", "#FFC41E");
    levelPointsDisplayThree.maxWidth = dimX;
    levelPointsDisplayThree.textAlign = "center";
    levelPointsDisplayThree.textBaseline = "middle";
    levelPointsDisplayThree.x = canvas.width / 2;
    levelPointsDisplayThree.y = canvas.height / 2 + 140;
    stage.addChild(levelPointsDisplayThree);

    level++;

    document.onkeydown = handleKeyDown;
    canvas.onclick = restart;
    document.addEventListener("keydown", restart);
  }, 800);

}

function restart() {
  canvas.onclick = null;
  document.removeEventListener("keydown", restart);
  gameLoading = false;
  shotsThisRound = 0;
  shotCooldown = 0;
  stage.removeAllChildren();
  stage.clear();

  addBackground('space');
  addCannon();
  orbs = [];
  bullets = [];

  for (let i = 0; i < numberOfOrbs; i++) {
    addStandardOrb();
  }

  createjs.Ticker.paused = false;

	if (!createjs.Ticker.hasEventListener("tick")) {
		createjs.Ticker.addEventListener("tick", tick);
	}
}

function outOfBounds(obj, bounds) {
	return obj.x - bounds < 0
  || obj.x + bounds > canvas.width
  || obj.y - bounds < 0
  || obj.y + bounds > canvas.height;
}

function placeInBounds(obj, bounds) {
  if (obj.x - bounds < 0 || obj.x  + bounds > canvas.width) {
    obj.vector[0] = obj.vector[0] * -1;
  } else if (obj.y - bounds < 0 || obj.y + bounds > canvas.height) {
    obj.vector[1] = obj.vector[1] * -1;
  }
}

function hasCollided(object, otherObject) {
  object.pos = [object.x, object.y];
  otherObject.pos = [otherObject.x, otherObject.y];
  const centerDist = Util.distanceBetween(object.pos, otherObject.pos);
  return centerDist < (object.bounds + otherObject.bounds);
}

function endGame() {
  document.onkeydown = null;
  document.onkeyup = null;
  stage.removeAllChildren();
  stage.clear();
  stage.addChild(space);
  gameOverMessage = new createjs.Text(`GAME OVER`, "bold 60px 'VT323'", "#FFC41E");
  gameOverMessage.maxWidth = dimX;
  gameOverMessage.textAlign = "center";
  gameOverMessage.textBaseline = "middle";
  gameOverMessage.x = dimX / 2;
  gameOverMessage.y = dimY / 2;
  finalPointsMessage = new createjs.Text(`${points} PTS`, "bold 42px 'VT323'", "#FFC41E");
  finalPointsMessage.maxWidth = dimX;
  finalPointsMessage.textAlign = "center";
  finalPointsMessage.textBaseline = "middle";
  finalPointsMessage.x = dimX / 2;
  finalPointsMessage.y = dimY / 2 + 120;
  stage.addChild(gameOverMessage);
  stage.addChild(finalPointsMessage);

  shotsRemaining = 10;
  shotsThisRound = 0;
  dimensionCountdown = 1;
  numberOfOrbs = 2;
  orbCountDown = 0;
  orbSpeed = 6;
  points = 0;
  nextBonus = 500;
  stage.update();

  setTimeout( () => {
    stage.removeAllChildren();
    stage.clear();
    level = 1;
    orbs = [];
    bullets = [];
    dimX = 600;
    dimY = 800;
    canvas.width = 600;
    canvas.height = 800;
    w = 600;
    h = 800;
    $shotsLeft.text(shotsRemaining);
    $scoreContainer.text(points);
    stage.update();
    stopTrack(1);
    return init();
  }, 1000);
}

function gameOver() {
  // if no shots remaining
  if (shotsRemaining <= 0) {
    return !(won() && shotsThisRound <= 1 );
  // if shots remaining
  } else {
    return false;
  }
}

function won() {
  return orbs.length === 0;
}

function orbExplode (orb, bulletObj) {
  let bulletCount = bulletObj.bulletCount;
  let bulletCountdown = bulletObj.bulletCountdown;

  playExplosion();
  points += 10 * bulletCount;

  if (bulletCount > 12) {
    // do nothing
  } else if (bulletCountdown > 0) {
    bulletCountdown--;
  } else if (bulletCountdown === 0) {
    bulletCountdown = 1;
    bulletCount = bulletCount + 4;
  }

  let degrees = 360;
  let angle = 360 / bulletCount;
  if (orbs.length > 0) {
    while(degrees > 0) {
      let dynamicBulletInstance = new createjs.Sprite(bullet);
      dynamicBulletInstance.name = "Bullet";
      dynamicBulletInstance.x = orb.x;
      dynamicBulletInstance.y = orb.y;
      dynamicBulletInstance.scaleX = 0.25;
      dynamicBulletInstance.scaleY = 0.25;
      dynamicBulletInstance.regX = 4;
      dynamicBulletInstance.regY = 4;
      let xVec = Math.cos(degrees * 3.1459 / 180);
      let yVec = Math.sin(degrees * 3.1459 / 180);
      dynamicBulletInstance.vector = [xVec, yVec];
      dynamicBulletInstance.bounds = 8;
      dynamicBulletInstance.dynamic = true;
      dynamicBulletInstance.active = true;
      dynamicBulletInstance.bulletCount = bulletCount;
      dynamicBulletInstance.bulletCountdown = bulletCountdown;
      dynamicBulletInstance.gotoAndPlay(`static`);
      bullets.push(dynamicBulletInstance);
      stage.addChild(dynamicBulletInstance);
      degrees -= angle;
    }
  }

  $scoreContainer.text(points);
}

function tick(event) {
  if (!event.paused) {
    if (stage.getChildByName("Bullet")) {
      // do nothing
    } else if (won()) {
      if (gameOver()) {
        gameEnded = true;
        createjs.Ticker.paused = true;
        return endGame();
      } else {
        createjs.Ticker.paused = true;
        return nextLevel();
      }
    } else if (gameOver()) {
      gameEnded = true;
      createjs.Ticker.paused = true;
      return endGame();
    }
  }

  // cooldown between shots
  if (shotCooldown > 0) {
    shotCooldown --;
  }

  for (let i = 0; i < orbs.length; i++) {
    let orb = orbs[i];
    orb.rotation += (orb.speed);
    orb.x += orb.vector[0] * orb.speed;
    orb.y += orb.vector[1] * orb.speed;
    if (outOfBounds(orb, orb.bounds)) {
      placeInBounds(orb, orb.bounds);
    }

    for (let j = 0; j < bullets.length; j++) {
      let bullet = bullets[j];
      let orbIndex = orbs.indexOf(orb);
      if (bullet.active && !orb.exploded && hasCollided(orb, bullet)) {
        if (orbIndex > -1) {
          orbs.splice(orbIndex, 1);
        }
        if (j > -1) {
          bullets.splice(j, 1);
        }
        orb.exploded = true;
        bullet.active = false;
        bullet.vector = [0, 0];
        bullet.visible = false;
        orb.gotoAndPlay("explode");
        orbExplode(orb, bullet);
        setTimeout( () => {
          stage.removeChild(bullet);
          stage.removeChild(orb);
        }, 600)
      }
    }
  }

  if (backgroundCounter <= 0) {
    backgroundCounter = 20;
    let randomNum = Math.round(Math.random());
    backgroundDarker = (randomNum < 0.5) ? true : false;
  } else {
    if (backgroundDarker && space.alpha - 0.005 > 0.4){
      space.alpha -= 0.0025;
    } else if (!backgroundDarker && space.alpha + 0.005 < 0.5) {
      space.alpha += 0.0025;
    }
    backgroundCounter--;
  }

  for (let i = 0; i < bullets.length; i++) {
    var bullet = bullets[i];

    if (bullet.dynamic === true) {
      bullet.x += bullet.vector[0] * bulletSpeed;
      bullet.y += bullet.vector[1] * bulletSpeed;
    } else {
      bullet.x += Math.sin(bullet.rotation * (Math.PI / -180)) * bulletSpeed * -1;
      bullet.y += Math.cos(bullet.rotation * (Math.PI / -180)) * bulletSpeed * -1;
    }

    if (outOfBounds(bullet, bullet.bounds)) {
      stage.removeChild(bullet);
    }
  }

  if (lfHeld && cannonInstance.rotation >= -72) {
		cannonInstance.rotation -= TURN_FACTOR;
	} else if (rtHeld && cannonInstance.rotation <= 72 ) {
		cannonInstance.rotation += TURN_FACTOR;
	}

  stage.update(event);
}

function fireCannon() {
  if (!createjs.Ticker.paused && !gameLoading && shotCooldown <= 0) {
    shotsThisRound++;
    shotsRemaining--;
    shotCooldown = 10;
    playFire();

    cannonInstance.gotoAndPlay("fire");
    let bulletInstance = new createjs.Sprite(bullet);
    bulletInstance.name = "Bullet";
    bulletInstance.x = cannonInstance.x;
    bulletInstance.y = cannonInstance.y;
    bulletInstance.scaleX = 0.25;
    bulletInstance.scaleY = 0.25;
    bulletInstance.regX = 4;
    bulletInstance.regY = 4;
    bulletInstance.vector = [0, 1];
    bulletInstance.rotation = cannonInstance.rotation;
    bulletInstance.bounds = 8;
    bulletInstance.dynamic = false;
    bulletInstance.active = true;
    bulletInstance.bulletCount = 4;
    bulletInstance.bulletCountdown = 1;
    bulletInstance.gotoAndPlay(`static`);
    bullets.push(bulletInstance);
    stage.addChild(bulletInstance);
    stage.setChildIndex( bulletInstance, 1);

    (shotsRemaining < 0) ?  $shotsLeft.text(0) : $shotsLeft.text(shotsRemaining);
  }
}

function handleKeyDown(e) {

  if (shotsRemaining <= 0 || gameEnded) {
    return;
  }

	switch (e.keyCode) {
		case KEYCODE_SPACE:
			fireCannon();
			return false;
    case KEYCODE_A:
		case KEYCODE_LEFT:
			lfHeld = true;
			return false;
		case KEYCODE_D:
		case KEYCODE_RIGHT:
			rtHeld = true;
			return false;
	}
}

function handleKeyUp(e) {
  if (gameEnded) {
    return;
  }

	switch (e.keyCode) {
    case KEYCODE_A:
		case KEYCODE_LEFT:
			lfHeld = false;
			return false;
		case KEYCODE_D:
		case KEYCODE_RIGHT:
			rtHeld = false;
			return false;
	}
}
