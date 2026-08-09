/* =========================================================
   FANTASY RPG 3D
   FULL ANDROID VERSION
   ========================================================= */

/* =========================
   VARIABLES
========================= */

let scene;
let camera;
let renderer;
let clock;

let player;
let weaponObject;

let enemies = [];
let projectiles = [];
let effects = [];
let pickups = [];

let gameStarted = false;
let gameOver = false;

let hp = 140;
let maxHp = 140;

let stamina = 100;

let level = 1;
let exp = 0;
let expMax = 100;

let gold = 200;

let kills = 0;
let target = 5;

let characterIndex = 0;
let weaponIndex = 0;

let yaw = 0;
let pitch = 0.05;

let joystickX = 0;
let joystickY = 0;

let attackCooldown = false;
let attackProgress = 0;

let jumpBusy = false;

/* =========================
   AUDIO
========================= */

let audioCtx = null;
let soundEnabled = true;

function initAudio(){

  try{

    if(!audioCtx){

      const AC =
        window.AudioContext ||
        window.webkitAudioContext;

      if(!AC) return;

      audioCtx = new AC();
    }

    if(audioCtx.state === "suspended"){
      audioCtx.resume();
    }

  }catch(error){

    console.log(
      "Audio gagal:",
      error
    );

  }

}

function beep(
  frequency,
  duration,
  type="sine",
  volume=.1
){

  if(!soundEnabled) return;

  initAudio();

  if(!audioCtx) return;

  try{

    const oscillator =
      audioCtx.createOscillator();

    const gain =
      audioCtx.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      frequency,
      audioCtx.currentTime
    );

    gain.gain.setValueAtTime(
      volume,
      audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      .001,
      audioCtx.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start();

    oscillator.stop(
      audioCtx.currentTime + duration
    );

  }catch(error){

    console.log(
      "Beep error:",
      error
    );

  }

}

function playSound(name){

  if(!soundEnabled) return;

  initAudio();

  switch(name){

    case "button":

      beep(
        520,
        .08,
        "square",
        .08
      );

      break;

    case "start":

      beep(
        440,
        .1,
        "sine",
        .1
      );

      setTimeout(
        () => beep(
          660,
          .12,
          "sine",
          .1
        ),
        100
      );

      setTimeout(
        () => beep(
          880,
          .18,
          "sine",
          .1
        ),
        220
      );

      break;

    case "attack":

      beep(
        180,
        .08,
        "sawtooth",
        .12
      );

      setTimeout(
        () => beep(
          380,
          .07,
          "square",
          .08
        ),
        50
      );

      break;

    case "hit":

      beep(
        110,
        .1,
        "sawtooth",
        .14
      );

      break;

    case "death":

      beep(
        320,
        .08,
        "square",
        .1
      );

      setTimeout(
        () => beep(
          190,
          .15,
          "square",
          .08
        ),
        80
      );

      break;

    case "heal":

      beep(
        500,
        .1,
        "sine",
        .1
      );

      setTimeout(
        () => beep(
          700,
          .1,
          "sine",
          .1
        ),
        100
      );

      setTimeout(
        () => beep(
          900,
          .15,
          "sine",
          .1
        ),
        200
      );

      break;

    case "jump":

      beep(
        350,
        .1,
        "sine",
        .1
      );

      setTimeout(
        () => beep(
          550,
          .1,
          "sine",
          .08
        ),
        70
      );

      break;

    case "pickup":

      beep(
        700,
        .08,
        "sine",
        .1
      );

      setTimeout(
        () => beep(
          1000,
          .12,
          "sine",
          .1
        ),
        90
      );

      break;

    case "level":

      beep(
        500,
        .1,
        "sine",
        .1
      );

      setTimeout(
        () => beep(
          700,
          .1,
          "sine",
          .1
        ),
        120
      );

      setTimeout(
        () => beep(
          900,
          .2,
          "sine",
          .1
        ),
        240
      );

      break;

    case "win":

      beep(
        600,
        .12,
        "sine",
        .1
      );

      setTimeout(
        () => beep(
          800,
          .12,
          "sine",
          .1
        ),
        120
      );

      setTimeout(
        () => beep(
          1000,
          .2,
          "sine",
          .1
        ),
        240
      );

      break;

    case "gameover":

      beep(
        300,
        .15,
        "sawtooth",
        .1
      );

      setTimeout(
        () => beep(
          180,
          .25,
          "sawtooth",
          .1
        ),
        180
      );

      break;
  }

}

/* =========================
   DATA
========================= */

const characters = [

  {
    name:"Knight",
    body:0x4b79a8,
    armor:0x68727a,
    skin:0xd9aa87,
    hair:0x252525,
    hp:140
  },

  {
    name:"Mage",
    body:0x76559a,
    armor:0x51456b,
    skin:0xd9aa87,
    hair:0x252525,
    hp:110
  },

  {
    name:"Rogue",
    body:0x4a4e50,
    armor:0x52656a,
    skin:0xc88f72,
    hair:0x38251b,
    hp:125
  }

];

const weapons = [

  {
    name:"Energy Bow",
    damage:30,
    price:0,
    color:0x48b8c9,
    speed:28,
    range:35
  },

  {
    name:"Magic Staff",
    damage:45,
    price:75,
    color:0x9a67c5,
    speed:24,
    range:32
  },

  {
    name:"Crystal Blaster",
    damage:60,
    price:120,
    color:0x56bfc1,
    speed:35,
    range:40
  },

  {
    name:"Thunder Blade",
    damage:75,
    price:180,
    color:0xd1bd54,
    speed:22,
    range:7
  }

];

/* =========================
   INITIALIZATION
========================= */

function init(){

  scene =
    new THREE.Scene();

  scene.background =
    new THREE.Color(0x87b5c5);

  scene.fog =
    new THREE.FogExp2(
      0x87b5c5,
      .009
    );

  camera =
    new THREE.PerspectiveCamera(
      65,
      innerWidth / innerHeight,
      .1,
      300
    );

  renderer =
    new THREE.WebGLRenderer({
      antialias:true,
      powerPreference:"high-performance"
    });

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      1.5
    )
  );

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  renderer.outputEncoding =
    THREE.sRGBEncoding;

  document
    .getElementById("game")
    .appendChild(renderer.domElement);

  clock =
    new THREE.Clock();

  createLights();
  createWorld();
  createPlayer();
  createEnemies();
  createPickups();

  setupControls();
  setupShop();
  setupSoundButton();
  setupRestartButtons();

  updateHUD();

  animate();

}

/* =========================
   LIGHTS
========================= */

function createLights(){

  scene.add(
    new THREE.HemisphereLight(
      0xcfe3e6,
      0x536052,
      1.15
    )
  );

  const sun =
    new THREE.DirectionalLight(
      0xfff5dc,
      1.35
    );

  sun.position.set(
    30,
    55,
    25
  );

  sun.castShadow = true;

  sun.shadow.mapSize.width = 1024;
  sun.shadow.mapSize.height = 1024;

  scene.add(sun);

}

/* =========================
   MATERIAL
========================= */

function mat(
  color,
  extra={}
){

  return new THREE.MeshStandardMaterial(
    Object.assign(
      {
        color,
        roughness:.8
      },
      extra
    )
  );

}

/* =========================
   WORLD
========================= */

function createWorld(){

  createGround();

  createRoad(
    0,
    0,
    140,
    9,
    0
  );

  createRoad(
    0,
    0,
    140,
    9,
    Math.PI/2
  );

  createHouses();
  createCars();
  createTrees();
  createFlowers();

}

function createGround(){

  const ground =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        140,
        140
      ),
      mat(0x5b9d5d)
    );

  ground.rotation.x =
    -Math.PI/2;

  ground.receiveShadow = true;

  scene.add(ground);

}

function createRoad(
  x,
  z,
  width,
  depth,
  rotation
){

  const road =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        depth
      ),
      mat(0x555c60)
    );

  road.rotation.x =
    -Math.PI/2;

  road.rotation.z =
    rotation;

  road.position.set(
    x,
    .025,
    z
  );

  scene.add(road);

}

function createHouses(){

  const positions = [

    [-18,-18],
    [18,-18],
    [-18,18],
    [18,18],
    [-32,-27],
    [32,27],
    [-35,30],
    [35,-30]

  ];

  positions.forEach(
    p => createHouse(
      p[0],
      p[1]
    )
  );

}

function createHouse(x,z){

  const house =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        7,
        4,
        6
      ),
      mat(0xc99e6b)
    );

  body.position.y = 2;

  house.add(body);

  const roof =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        5.3,
        2.8,
        4
      ),
      mat(0xb45f59)
    );

  roof.position.y = 5.4;

  roof.rotation.y =
    Math.PI/4;

  house.add(roof);

  house.position.set(
    x,
    0,
    z
  );

  scene.add(house);

}

function createCars(){

  createCar(
    -9,
    12,
    0,
    0x4e7fa9
  );

  createCar(
    9,
    -12,
    Math.PI,
    0xa95762
  );

}

function createCar(
  x,
  z,
  rot,
  color
){

  const car =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        3.5,
        .75,
        1.7
      ),
      mat(color)
    );

  body.position.y = .8;

  car.add(body);

  car.position.set(
    x,
    0,
    z
  );

  car.rotation.y = rot;

  scene.add(car);

}

function createTrees(){

  for(
    let i=0;
    i<42;
    i++
  ){

    const x =
      (Math.random()-.5)*125;

    const z =
      (Math.random()-.5)*125;

    if(
      Math.abs(x)<8 ||
      Math.abs(z)<8
    ){
      continue;
    }

    const tree =
      new THREE.Group();

    const trunk =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          .25,
          .4,
          2.2,
          10
        ),
        mat(0x76543d)
      );

    trunk.position.y=1.1;

    tree.add(trunk);

    const leaves =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1.5,
          12,
          12
        ),
        mat(0x4f8750)
      );

    leaves.position.y=2.7;

    tree.add(leaves);

    tree.position.set(
      x,
      0,
      z
    );

    scene.add(tree);

  }

}

function createFlowers(){

  for(
    let i=0;
    i<80;
    i++
  ){

    const flower =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .13,
          8,
          8
        ),
        mat(
          0xd0a0a0
        )
      );

    flower.position.set(
      (Math.random()-.5)*125,
      .4,
      (Math.random()-.5)*125
    );

    scene.add(flower);

  }

}

/* =========================
   CHARACTER
========================= */

function createCharacter(
  data,
  isEnemy=false
){

  const c =
    new THREE.Group();

  c.userData.isEnemy =
    isEnemy;

  const torso =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        .8,
        1.15,
        .48
      ),
      mat(data.body)
    );

  torso.position.y=1.55;

  c.add(torso);

  const armor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        .88,
        .35,
        .53
      ),
      mat(data.armor)
    );

  armor.position.y=1.75;

  c.add(armor);

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .42,
        16,
        16
      ),
      mat(data.skin)
    );

  head.position.y=2.55;

  c.add(head);

  const hair =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .44,
        14,
        14
      ),
      mat(data.hair)
    );

  hair.scale.y=.55;

  hair.position.y=2.82;

  c.add(hair);

  const leftArm =
    createLimb(
      .21,
      1.05,
      data.skin
    );

  const rightArm =
    createLimb(
      .21,
      1.05,
      data.skin
    );

  leftArm.position.set(
    -.62,
    1.55,
    0
  );

  rightArm.position.set(
    .62,
    1.55,
    0
  );

  c.add(
    leftArm,
    rightArm
  );

  const leftLeg =
    createLimb(
      .27,
      1.1,
      0x292e32
    );

  const rightLeg =
    createLimb(
      .27,
      1.1,
      0x292e32
    );

  leftLeg.position.set(
    -.23,
    .35,
    0
  );

  rightLeg.position.set(
    .23,
    .35,
    0
  );

  c.add(
    leftLeg,
    rightLeg
  );

  c.userData.parts = {

    body:torso,
    head:head,
    hair:hair,

    leftArm:leftArm,
    rightArm:rightArm,

    leftLeg:leftLeg,
    rightLeg:rightLeg

  };

  return c;

}

function createLimb(
  r,
  h,
  color
){

  return new THREE.Mesh(
    new THREE.CylinderGeometry(
      r,
      r,
      h,
      10
    ),
    mat(color)
  );

}

/* =========================
   PLAYER
========================= */

function createPlayer(){

  player =
    createCharacter(
      characters[characterIndex]
    );

  player.position.set(
    0,
    0,
    10
  );

  scene.add(player);

  createWeaponObject();

}

function createWeaponObject(){

  if(
    weaponObject &&
    weaponObject.parent
  ){

    player.remove(
      weaponObject
    );

  }

  const weapon =
    weapons[weaponIndex];

  const group =
    new THREE.Group();

  const handle =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        .06,
        .06,
        1.25,
        8
      ),
      mat(0x513c2b)
    );

  group.add(handle);

  const crystal =
    new THREE.Mesh(
      new THREE.OctahedronGeometry(
        .25
      ),
      mat(
        weapon.color,
        {
          emissive:weapon.color,
          emissiveIntensity:.3
        }
      )
    );

  crystal.position.y=.75;

  group.add(crystal);

  group.position.set(
    .78,
    1.2,
    -.15
  );

  player.add(group);

  weaponObject = group;

}

/* =========================
   ENEMIES
========================= */

function createEnemies(){

  for(
    let i=0;
    i<5+level;
    i++
  ){

    createEnemy();

  }

}

function createEnemy(){

  const enemy =
    createCharacter(
      {
        body:0x8d4b52,
        armor:0x514044,
        skin:0x9e705f,
        hair:0x252020
      },
      true
    );

  let x;
  let z;

  do{

    x =
      (Math.random()-.5)*95;

    z =
      (Math.random()-.5)*95;

  }while(
    Math.hypot(
      x-player.position.x,
      z-player.position.z
    )<12
  );

  enemy.position.set(
    x,
    0,
    z
  );

  enemy.userData.hp =
    50 + level*20;

  enemy.userData.maxHp =
    enemy.userData.hp;

  enemy.userData.damage =
    5 + level*2;

  enemy.userData.speed =
    .7 + level*.055;

  enemy.userData.attackTimer =
    1 + Math.random();

  scene.add(enemy);

  enemies.push(enemy);

}

/* =========================
   PICKUPS
========================= */

function createPickups(){

  for(
    let i=0;
    i<15;
    i++
  ){

    const p =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          .32
        ),
        mat(
          0xd0b54e,
          {
            emissive:0x6e5d22
          }
        )
      );

    p.position.set(
      (Math.random()-.5)*100,
      .5,
      (Math.random()-.5)*100
    );

    p.userData.weapon =
      Math.floor(
        Math.random()*weapons.length
      );

    scene.add(p);

    pickups.push(p);

  }

}

/* =========================
   CONTROLS
========================= */

function setupControls(){

  bindButton(
    "attackBtn",
    attack
  );

  bindButton(
    "jumpBtn",
    jump
  );

  bindButton(
    "healBtn",
    heal
  );

  bindButton(
    "characterBtn",
    changeCharacter
  );

  bindButton(
    "weaponBtn",
    changeWeapon
  );

  setupJoystick();
  setupCamera();

}

function bindButton(
  id,
  fn
){

  const button =
    document.getElementById(id);

  if(!button) return;

  button.addEventListener(
    "pointerdown",
    function(e){

      e.preventDefault();

      initAudio();

      fn();

    },
    {
      passive:false
    }
  );

}

/* =========================
   JOYSTICK
========================= */

function setupJoystick(){

  const joystick =
    document.getElementById(
      "joystick"
    );

  const knob =
    document.getElementById(
      "joystickKnob"
    );

  let active=false;

  function move(
    clientX,
    clientY
  ){

    const rect =
      joystick.getBoundingClientRect();

    const centerX =
      rect.left + rect.width/2;

    const centerY =
      rect.top + rect.height/2;

    let dx =
      clientX-centerX;

    let dy =
      clientY-centerY;

    const max =
      rect.width/2-28;

    const distance =
      Math.hypot(dx,dy);

    if(distance>max){

      dx =
        dx/distance*max;

      dy =
        dy/distance*max;

    }

    joystickX =
      dx/max;

    joystickY =
      dy/max;

    knob.style.transform =
      `translate(
        calc(-50% + ${dx}px),
        calc(-50% + ${dy}px)
      )`;

  }

  joystick.addEventListener(
    "pointerdown",
    function(e){

      e.preventDefault();

      active=true;

      joystick.setPointerCapture(
        e.pointerId
      );

      move(
        e.clientX,
        e.clientY
      );

    }
  );

  joystick.addEventListener(
    "pointermove",
    function(e){

      if(!active) return;

      move(
        e.clientX,
        e.clientY
      );

    }
  );

  joystick.addEventListener(
    "pointerup",
    function(){

      active=false;

      joystickX=0;
      joystickY=0;

      knob.style.transform =
        "translate(-50%,-50%)";

    }
  );

  joystick.addEventListener(
    "pointercancel",
    function(){

      active=false;

      joystickX=0;
      joystickY=0;

      knob.style.transform =
        "translate(-50%,-50%)";

    }
  );

}

/* =========================
   CAMERA
========================= */

function setupCamera(){

  let active=false;
  let lastX=0;
  let lastY=0;

  renderer.domElement.addEventListener(
    "pointerdown",
    function(e){

      if(
        e.clientX <
        innerWidth*.35
      ) return;

      active=true;

      lastX=e.clientX;
      lastY=e.clientY;

      renderer.domElement.setPointerCapture(
        e.pointerId
      );

    }
  );

  renderer.domElement.addEventListener(
    "pointermove",
    function(e){

      if(!active) return;

      yaw -=
        (e.clientX-lastX)*.006;

      pitch =
        THREE.MathUtils.clamp(
          pitch -
          (e.clientY-lastY)*.005,
          -.35,
          .45
        );

      lastX=e.clientX;
      lastY=e.clientY;

    }
  );

  renderer.domElement.addEventListener(
    "pointerup",
    function(){

      active=false;

    }
  );

}

/* =========================
   SHOP
========================= */

function setupShop(){

  document
    .querySelectorAll(".shopItem")
    .forEach(
      button => {

        button.addEventListener(
          "pointerdown",
          function(e){

            e.preventDefault();

            initAudio();

            const index =
              Number(
                this.dataset.weapon
              );

            const price =
              Number(
                this.dataset.price
              );

            if(
              price>0 &&
              gold<price
            ){

              playSound("button");

              showMessage(
                "🪙 Gold tidak cukup!"
              );

              return;

            }

            if(price>0){

              gold-=price;

            }

            weaponIndex=index;

            document
              .querySelectorAll(".shopItem")
              .forEach(
                x =>
                  x.classList.remove(
                    "selected"
                  )
              );

            this.classList.add(
              "selected"
            );

            document
              .getElementById(
                "selectedWeapon"
              )
              .textContent =
              "Senjata dipilih: "+
              weapons[index].name;

            updateHUD();

            playSound("button");

          },
          {
            passive:false
          }
        );

      }
    );

  /* =====================
     TOMBOL MULAI
  ===================== */

  const startBtn =
    document.getElementById(
      "startBtn"
    );

  if(!startBtn){

    console.error(
      "startBtn tidak ditemukan"
    );

    return;

  }

  startBtn.addEventListener(
    "pointerdown",
    function(e){

      e.preventDefault();
      e.stopPropagation();

      initAudio();

      startGame();

    },
    {
      passive:false
    }
  );

}

/* =========================
   START GAME
========================= */

function startGame(){

  if(gameStarted) return;

  gameStarted=true;
  gameOver=false;

  initAudio();

  const screen =
    document.getElementById(
      "startScreen"
    );

  if(screen){

    screen.classList.add(
      "hidden"
    );

  }

  playSound("button");

  setTimeout(
    () => playSound("start"),
    120
  );

  showMessage(
    "⚔️ Petualangan dimulai!"
  );

  updateHUD();

}

/* =========================
   SOUND BUTTON
========================= */

function setupSoundButton(){

  const button =
    document.getElementById(
      "soundBtn"
    );

  if(!button) return;

  button.addEventListener(
    "pointerdown",
    function(e){

      e.preventDefault();

      if(!soundEnabled){

        soundEnabled=true;

        this.textContent =
          "🔊 Suara";

        initAudio();

        playSound(
          "button"
        );

      }else{

        initAudio();

        playSound(
          "button"
        );

        soundEnabled=false;

        this.textContent =
          "🔇 Suara";

      }

    },
    {
      passive:false
    }
  );

}

/* =========================
   ATTACK
========================= */

function getAttackDirection(){

  return new THREE.Vector3(
    0,
    0,
    -1
  )
  .applyAxisAngle(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    yaw
  )
  .normalize();

}

function attack(){

  if(
    !gameStarted ||
    gameOver ||
    attackCooldown
  ) return;

  initAudio();

  playSound("attack");

  attackCooldown=true;
  attackProgress=0;

  if(
    weaponIndex===3
  ){

    meleeAttack();

  }else{

    shootEnergy(
      player,
      false
    );

  }

  const timer =
    setInterval(
      function(){

        attackProgress += .05;

        if(
          attackProgress>=1
        ){

          clearInterval(timer);

          attackCooldown=false;
          attackProgress=0;

        }

      },
      22
    );

}

/* =========================
   MELEE
========================= */

function meleeAttack(){

  const weapon =
    weapons[weaponIndex];

  const direction =
    getAttackDirection();

  let best=null;
  let bestDistance=
    weapon.range;

  enemies.forEach(
    enemy => {

      if(!enemy.parent)
        return;

      const to =
        enemy.position
        .clone()
        .sub(
          player.position
        );

      to.y=0;

      const distance =
        to.length();

      if(
        distance>bestDistance ||
        distance<.01
      ) return;

      to.normalize();

      if(
        direction.dot(to)>.15
      ){

        best=enemy;
        bestDistance=distance;

      }

    }
  );

  if(best){

    damageEnemy(
      best,
      weapon.damage
    );

    createImpact(
      best.position.clone()
        .add(
          new THREE.Vector3(
            0,
            1.4,
            0
          )
        ),
      weapon.color
    );

  }else{

    showMessage(
      "⚡ Tidak mengenai musuh"
    );

  }

}

/* =========================
   PROJECTILE
========================= */

function shootEnergy(
  shooter,
  enemyShot
){

  const weapon =
    weapons[weaponIndex];

  const projectile =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .16,
        12,
        12
      ),
      mat(
        weapon.color,
        {
          emissive:weapon.color,
          emissiveIntensity:.8
        }
      )
    );

  let direction;

  if(enemyShot){

    direction =
      player.position
      .clone()
      .sub(
        shooter.position
      );

    direction.y=.8;

    direction.normalize();

  }else{

    direction =
      getAttackDirection();

  }

  projectile.position.copy(
    shooter.position
  );

  projectile.position.y=1.5;

  projectile.position.addScaledVector(
    direction,
    1
  );

  projectile.userData={
    direction:direction,
    speed:enemyShot
      ? weapon.speed*.65
      : weapon.speed,
    damage:enemyShot
      ? 7+level*2
      : weapon.damage,
    enemyShot:enemyShot,
    distance:0,
    maxDistance:weapon.range
  };

  scene.add(projectile);

  projectiles.push(
    projectile
  );

}

/* =========================
   PROJECTILE UPDATE
========================= */

function segmentDistancePoint(
  a,
  b,
  p
){

  const ab =
    b.clone().sub(a);

  const ap =
    p.clone().sub(a);

  const denominator =
    ab.lengthSq();

  let t =
    denominator
      ? ap.dot(ab)/denominator
      : 0;

  t =
    Math.max(
      0,
      Math.min(1,t)
    );

  return p.distanceTo(
    a.clone()
      .addScaledVector(
        ab,
        t
      )
  );

}

function updateProjectiles(
  delta
){

  for(
    let i=projectiles.length-1;
    i>=0;
    i--
  ){

    const projectile =
      projectiles[i];

    const data =
      projectile.userData;

    const old =
      projectile.position.clone();

    const distance =
      data.speed*delta;

    projectile.position.addScaledVector(
      data.direction,
      distance
    );

    data.distance+=distance;

    let hit=false;

    if(data.enemyShot){

      if(
        segmentDistancePoint(
          old,
          projectile.position,
          player.position
        )<1.15
      ){

        damagePlayer(
          data.damage
        );

        createImpact(
          projectile.position,
          weapons[weaponIndex].color
        );

        hit=true;

      }

    }else{

      for(
        let j=enemies.length-1;
        j>=0;
        j--
      ){

        const enemy =
          enemies[j];

        if(!enemy.parent)
          continue;

        const target =
          enemy.position
            .clone()
            .add(
              new THREE.Vector3(
                0,
                1.35,
                0
              )
            );

        if(
          segmentDistancePoint(
            old,
            projectile.position,
            target
          )<1.45
        ){

          damageEnemy(
            enemy,
            data.damage
          );

          createImpact(
            projectile.position,
            weapons[weaponIndex].color
          );

          hit=true;

          break;

        }

      }

    }

    if(
      hit ||
      data.distance>
      data.maxDistance
    ){

      scene.remove(
        projectile
      );

      projectiles.splice(
        i,
        1
      );

    }

  }

}

/* =========================
   DAMAGE ENEMY
========================= */

function damageEnemy(
  enemy,
  damage
){

  if(
    !enemy ||
    !enemy.parent
  ) return;

  enemy.userData.hp -=
    damage;

  playSound("hit");

  showDamage(
    enemy,
    damage
  );

  if(
    enemy.userData.hp<=0
  ){

    killEnemy(
      enemy
    );

  }else{

    showMessage(
      "💥 -"+damage
    );

  }

}

/* =========================
   KILL
========================= */

function killEnemy(
  enemy
){

  if(
    !enemy.parent
  ) return;

  playSound("death");

  scene.remove(
    enemy
  );

  kills++;

  gold +=
    15+level*3;

  addExp(
    35+level*5
  );

  showMessage(
    "☠️Musuh kalah"
  );

  updateHUD();

  if(
    kills>=target
  ){

    nextLevel();

  }

}

/* =========================
   PLAYER DAMAGE
========================= */

function damagePlayer(
  damage
){

  playSound("hit");

  hp =
    Math.max(
      0,
      hp-damage
    );

  updateHUD();

  showMessage(
    "❤️ -"+damage+" HP"
  );

  if(hp<=0){

    endGame();

  }

}

/* =========================
   HEAL
========================= */

function heal(){

  if(
    !gameStarted ||
    gameOver
  ) return;

  if(
    gold<20
  ){

    showMessage(
      "🪙tidak cukup"
    );

    playSound("button");

    return;

  }

  if(
    hp>=maxHp
  ){

    showMessage(
      "❤️ HP penuh"
    );

    return;

  }

  gold-=20;

  hp =
    Math.min(
      maxHp,
      hp+35
    );

  playSound("heal");

  showMessage(
    "❤️ HP +35"
  );

  updateHUD();

}

/* =========================
   JUMP
========================= */

function jump(){

  if(
    !player ||
    jumpBusy ||
    !gameStarted ||
    gameOver
  ) return;

  initAudio();

  playSound("jump");

  jumpBusy=true;

  const start =
    player.position.y;

  const startTime =
    performance.now();

  function animateJump(
    now
  ){

    const progress =
      (now-startTime)/600;

    if(
      progress>=1
    ){

      player.position.y=
        start;

      jumpBusy=false;

      return;

    }

    player.position.y =
      start +
      Math.sin(
        progress*Math.PI
      )*2;

    requestAnimationFrame(
      animateJump
    );

  }

  requestAnimationFrame(
    animateJump
  );

}

/* =========================
   CHARACTER
========================= */

function changeCharacter(){

  if(!gameStarted)
    return;

  characterIndex =
    (characterIndex+1)%
    characters.length;

  const data =
    characters[characterIndex];

  const parts =
    player.userData.parts;

  parts.body.material.color.setHex(
    data.body
  );

  parts.head.material.color.setHex(
    data.skin
  );

  parts.hair.material.color.setHex(
    data.hair
  );

  maxHp=data.hp;

  hp=maxHp;

  playSound("button");

  showMessage(
    "🧍 "+data.name
  );

  updateHUD();

}

/* =========================
   WEAPON
========================= */

function changeWeapon(){

  if(!gameStarted)
    return;

  weaponIndex =
    (weaponIndex+1)%
    weapons.length;

  createWeaponObject();

  playSound("button");

  showMessage(
    "✨ "+
    weapons[weaponIndex].name
  );

  updateHUD();

}

/* =========================
   PICKUP
========================= */

function updatePickups(){

  pickups.forEach(
    pickup => {

      if(!pickup.parent)
        return;

      pickup.rotation.y+=.04;

      pickup.position.y =
        .5 +
        Math.sin(
          performance.now()*.003
        )*.12;

      if(
        pickup.position.distanceTo(
          player.position
        )<1.8
      ){

        weaponIndex =
          pickup.userData.weapon;

        createWeaponObject();

        scene.remove(
          pickup
        );

        playSound("pickup");

        showMessage(
          "✨ Mendapatkan "+
          weapons[
            weaponIndex
          ].name
        );

        updateHUD();

      }

    }
  );

}

/* =========================
   LEVEL
========================= */

function addExp(
  amount
){

  exp+=amount;

  while(
    exp>=expMax &&
    level<20
  ){

    exp-=expMax;

    levelUp();

  }

  updateHUD();

}

function levelUp(){

  level++;

  target=
    5+level;

  expMax=
    100+
    level*60;

  maxHp+=15;

  hp=maxHp;

  kills=0;

  playSound("level");

  showMessage(
    "⭐ LEVEL "+level+"!"
  );

  if(level>=20){

    winGame();

    return;

  }

  for(
    let i=0;
    i<3+level;
    i++
  ){

    createEnemy();

  }

  updateHUD();

}

function nextLevel(){

  if(gameOver)
    return;

  level++;

  if(level>=20){

    winGame();

    return;

  }

  kills=0;

  target=
    5+level;

  exp=0;

  expMax=
    100+
    level*60;

  maxHp+=15;

  hp=maxHp;

  playSound("level");

  showMessage(
    "⭐ LEVEL "+
    level+
    " — Musuh semakin kuat!"
  );

  for(
    let i=0;
    i<3+level;
    i++
  ){

    createEnemy();

  }

  updateHUD();

}

/* =========================
   GAME OVER
========================= */

function endGame(){

  if(gameOver)
    return;

  gameOver=true;

  playSound(
    "gameover"
  );

  document
    .getElementById(
      "gameOverLevel"
    )
    .textContent=level;

  document
    .getElementById(
      "gameOver"
    )
    .classList.remove(
      "hidden"
    );

}

/* =========================
   WIN
========================= */

function winGame(){

  gameOver=true;

  playSound("win");

  document
    .getElementById(
      "winScreen"
    )
    .classList.remove(
      "hidden"
    );

}

/* =========================
   RESTART
========================= */

function setupRestartButtons(){

  const lose =
    document.getElementById(
      "restartLose"
    );

  const win =
    document.getElementById(
      "restartWin"
    );

  if(lose){

    lose.addEventListener(
      "pointerdown",
      function(){

        location.reload();

      }
    );

  }

  if(win){

    win.addEventListener(
      "pointerdown",
      function(){

        location.reload();

      }
    );

  }

}

/* =========================
   MESSAGE
========================= */

function showMessage(
  text
){

  const element =
    document.getElementById(
      "message"
    );

  if(!element) return;

  element.textContent=text;

  element.style.opacity="1";

  clearTimeout(
    element._timer
  );

  element._timer =
    setTimeout(
      function(){

        element.style.opacity="0";

      },
      1100
    );

}

/* =========================
   DAMAGE TEXT
========================= */

function showDamage(
  enemy,
  damage
){

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "damageText";

  div.textContent =
    "-"+damage;

  document.body.appendChild(
    div
  );

  const position =
    enemy.position.clone();

  position.y+=2.8;

  position.project(
    camera
  );

  div.style.left =
    (
      (position.x*.5+.5)*
      innerWidth
    )+"px";

  div.style.top =
    (
      (-position.y*.5+.5)*
      innerHeight
    )+"px";

  div.animate(
    [
      {
        transform:
          "translate(-50%,0)",
        opacity:1
      },
      {
        transform:
          "translate(-50%,-50px)",
        opacity:0
      }
    ],
    {
      duration:650
    }
  );

  setTimeout(
    () => div.remove(),
    650
  );

}

/* =========================
   IMPACT
========================= */

function createImpact(
  position,
  color
){

  const impact =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .25,
        10,
        10
      ),
      new THREE.MeshBasicMaterial({
        color:color,
        transparent:true,
        opacity:.8
      })
    );

  impact.position.copy(
    position
  );

  impact.userData.life=.3;

  scene.add(
    impact
  );

  effects.push(
    impact
  );

}

/* =========================
   EFFECT UPDATE
========================= */

function updateEffects(
  delta
){

  for(
    let i=effects.length-1;
    i>=0;
    i--
  ){

    const effect =
      effects[i];

    effect.userData.life -=
      delta;

    effect.scale.multiplyScalar(
      1.08
    );

    effect.material.opacity =
      Math.max(
        effect.userData.life/.3,
        0
      );

    if(
      effect.userData.life<=0
    ){

      scene.remove(
        effect
      );

      effects.splice(
        i,
        1
      );

    }

  }

}

/* =========================
   ENEMY UPDATE
========================= */

function updateEnemies(
  delta
){

  if(
    !gameStarted ||
    gameOver
  ) return;

  enemies.forEach(
    enemy => {

      if(!enemy.parent)
        return;

      const distance =
        enemy.position.distanceTo(
          player.position
        );

      let moving=false;

      if(
        distance<35
      ){

        const direction =
          player.position
          .clone()
          .sub(
            enemy.position
          );

        direction.y=0;

        if(direction.length()){

          direction.normalize();

        }

        if(
          distance>5
        ){

          enemy.position
            .addScaledVector(
              direction,
              enemy.userData.speed*
              delta
            );

          moving=true;

        }

        enemy.lookAt(
          player.position.x,
          enemy.position.y,
          player.position.z
        );

        enemy.userData.attackTimer -=
          delta;

        if(
          distance>=5 &&
          distance<30 &&
          enemy.userData.attackTimer<=0
        ){

          enemy.userData.attackTimer =
            Math.max(
              .9,
              2-level*.03
            );

          shootEnergy(
            enemy,
            true
          );

        }

        if(
          distance<2 &&
          enemy.userData.attackTimer<=0
        ){

          enemy.userData.attackTimer=1;

          damagePlayer(
            enemy.userData.damage
          );

        }

      }

      animateCharacter(
        enemy,
        moving,
        delta
      );

    }
  );

}

/* =========================
   CHARACTER ANIMATION
========================= */

function animateCharacter(
  character,
  moving,
  delta
){

  const parts =
    character.userData.parts;

  if(!parts) return;

  character.userData.walkTime =
    (
      character.userData.walkTime ||
      0
    ) +
    delta*
    (
      moving
        ? 8
        : 2
    );

  const t =
    character.userData.walkTime;

  const swing =
    moving
      ? Math.sin(t)
      : 0;

  const swing2 =
    moving
      ? Math.sin(t+Math.PI)
      : 0;

  parts.leftLeg.rotation.x =
    swing*.55;

  parts.rightLeg.rotation.x =
    swing2*.55;

  parts.leftArm.rotation.x =
    swing2*.45;

  parts.rightArm.rotation.x =
    swing*.45;

}

/* =========================
   PLAYER MOVEMENT
========================= */

function movePlayer(
  delta
){

  if(
    !gameStarted ||
    gameOver
  ) return;

  const moving =
    Math.abs(joystickX)>.1 ||
    Math.abs(joystickY)>.1;

  const speed=6*delta;

  const forward =
    new THREE.Vector3(
      0,
      0,
      -1
    )
    .applyAxisAngle(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      yaw
    );

  const right =
    new THREE.Vector3(
      1,
      0,
      0
    )
    .applyAxisAngle(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      yaw
    );

  player.position.addScaledVector(
    forward,
    -joystickY*speed
  );

  player.position.addScaledVector(
    right,
    joystickX*speed
  );

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -65,
      65
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -65,
      65
    );

  if(moving){

    player.rotation.y=yaw;

  }

  animateCharacter(
    player,
    moving,
    delta
  );

}

/* =========================
   CAMERA UPDATE
========================= */

function updateCamera(){

  if(!player) return;

  const offset =
    new THREE.Vector3(
      4.2,
      3.1,
      7.8
    );

  offset.applyAxisAngle(
    new THREE.Vector3(
      1,
      0,
      0
    ),
    pitch
  );

  offset.applyAxisAngle(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    yaw
  );

  camera.position.copy(
    player.position
  );

  camera.position.add(
    offset
  );

  const targetPosition =
    player.position.clone();

  targetPosition.y+=1.25;

  camera.lookAt(
    targetPosition
  );

}

/* =========================
   HUD
========================= */

function updateHUD(){

  const character =
    characters[
      characterIndex
    ];

  const weapon =
    weapons[
      weaponIndex
    ];

  const hpBar =
    document.getElementById(
      "hpBar"
    );

  const staminaBar =
    document.getElementById(
      "staminaBar"
    );

  if(hpBar){

    hpBar.style.width =
      (
        hp/maxHp*100
      )+"%";

  }

  if(staminaBar){

    staminaBar.style.width =
      stamina+"%";

  }

  setText(
    "level",
    level
  );

  setText(
    "exp",
    exp
  );

  setText(
    "expMax",
    expMax
  );

  setText(
    "gold",
    gold
  );

  setText(
    "shopGold",
    gold
  );

  setText(
    "kills",
    kills
  );

  setText(
    "target",
    target
  );

  setText(
    "targetQuest",
    target
  );

  setText(
    "levelQuest",
    level
  );

  setText(
    "characterName",
    character.name
  );

  setText(
    "equipmentCharacter",
    character.name
  );

  setText(
    "equipmentWeapon",
    weapon.name
  );

}

function setText(
  id,
  value
){

  const element =
    document.getElementById(id);

  if(element){

    element.textContent =
      value;

  }

}

/* =========================
   RESIZE
========================= */

function resize(){

  camera.aspect =
    innerWidth/
    innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );

}

window.addEventListener(
  "resize",
  resize
);

/* =========================
   GAME LOOP
========================= */

function animate(){

  requestAnimationFrame(
    animate
  );

  const delta =
    Math.min(
      clock.getDelta(),
      .05
    );

  if(
    gameStarted &&
    !gameOver
  ){

    movePlayer(delta);

    updateEnemies(delta);

    updateProjectiles(delta);

    updateEffects(delta);

    updatePickups();

    updateCamera();

    stamina =
      Math.min(
        100,
        stamina+
        delta*18
      );

  }

  renderer.render(
    scene,
    camera
  );

}

/* =========================
   START
========================= */

try{

  init();

}catch(error){

  console.error(
    "GAME ERROR:",
    error
  );

  const message =
    document.getElementById(
      "message"
    );

  if(message){

    message.textContent =
      "⚠️ Game error: "+
      error.message;

    message.style.opacity="1";

  }

}