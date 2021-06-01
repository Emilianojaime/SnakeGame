(function (window, undefined) {
  /* "use strict"; */

  // Variables
  var KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    canvas = null,
    ctx = null,
    lastPress = null,
    pause = false,
    gameover = false,
    currentScene = 0,
    scenes = [],
    mainScene = null,
    gameScene = null,
    highscoresScene = null,
    body = [],
    rock = null,
    testfood = null,
    highscores = [],
    posHighscore = 10,
    dir = 0,
    score = 0,
    iBody = new Image(),
    iFood = new Image(),
    iThing = new Image(),
    aEat = new Audio(),
    aDie = new Audio();

  window.requestAnimationFrame = (function () {
    return (
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 17);
      }
    );
  })();

  document.addEventListener(
    "keydown",
    function (e) {
      if (e.which >= 37 && e.which <= 40) {
        e.preventDefault();
      }
      lastPress = e.which;
    },
    false
  );

  function Rectangle(x, y, width, height) {
    this.x = x === undefined ? 0 : x;
    this.y = y === undefined ? 0 : y;
    this.width = width === undefined ? 0 : width;
    this.height = height === undefined ? this.width : height;

    Rectangle.prototype = {
      constructor: Rectangle,

      intersects: function (rect) {
        if (rect === undefined) {
          window.console.warn("Missing parameters on function intersects");
        } else {
          return (
            this.x < rect.x + rect.width &&
            this.x + this.width > rect.x &&
            this.y < rect.y + rect.height &&
            this.y + this.height > rect.y
          );
        }
      },

      fill: function (ctx) {
        if (ctx === undefined) {
          window.console.warn("Missing parameters on function fill");
        } else {
          ctx.fillRect(this.x, this.y, this.width, this.height);
        }
      },

      drawImage: function (ctx, img) {
        if (img === undefined) {
          window.console.warn("Missing parameters on function drawimage");
        } else {
          if (img.width) {
            ctx.drawImage(img, this.x, this.y);
          } else {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
          }
        }
      },
    };
  }

  function Scene() {
    this.id = scenes.length;
    scenes.push(this);
  }

  Scene.prototype = {
    constructor: Scene,
    load: function () {},
    paint: function (ctx) {},
    act: function () {},
  };

  function loadScene(scene) {
    currentScene = scene.id;
    scenes[currentScene].load();
  }

  function random(max) {
    return ~~(Math.random() * max);
  }

  function addHighscore(score) {
    posHighscore = 0;
    while (
      highscores[posHighscore] > score &&
      posHighscore < highscores.length
    ) {
      posHighscore += 1;
    }
    highscores.splice(posHighscore, 0, score);
    if (highscores.length > 10) {
      highscores.length = 10;
    }
    localStorage.highscores = highscores.join(",");
  }

  function repaint() {
    window.requestAnimationFrame(repaint);
    if (scenes.length) {
      scenes[currentScene].paint(ctx);
    }
  }

  function run() {
    setTimeout(run, 50);
    if (scenes.length) {
      scenes[currentScene].act();
    }
  }

  function init() {
    // Get canvas and context
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    // Load assets
    iThing.src = "../assets/GreenThing.png";
    iBody.src = "../assets/Body.png";
    iFood.src = "../assets/Apple.png";
    aEat.src = "../assets/chomp.oga";
    aDie.src = "../assets/dies.oga";

    // Create food
    food = new Rectangle(80, 80, 10, 10);
    testfood = new Rectangle(40, 40, 10, 10);
    rock = new Rectangle(10, 10, 10, 10);

    // Create new item
    /*  greenthing = new Rectangle(80, 80, 10, 10); */

    // Load Saved highscores
    if (localStorage.highscores) {
      highscores = localStorage.highscores.split(",");
    }

    // Start Game
    run();
    repaint();
  }

  // Main scene
  mainScene = new Scene();

  mainScene.paint = function (ctx) {
    // Clean Canvas
    ctx.fillStyle = "#030";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("SNAKE", 150, 60);
    ctx.fillText("Press Enter", 150, 90);
  };

  mainScene.act = function () {
    // Load Next Scene
    if (lastPress === KEY_ENTER) {
      loadScene(highscoresScene);
      lastPress = null;
    }
  };

  // Game Scene
  gameScene = new Scene();

  gameScene.load = function () {
    score = 0;
    dir = 1;
    body.length = 0;
    body.push(new Rectangle(40, 40, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    testfood.x = random(canvas.width / 10 - 1) * 10;
    testfood.y = random(canvas.height / 10 - 1) * 10;
    rock.x = random(canvas.width / 10 - 1) * 10;
    rock.y = random(canvas.height / 10 - 1) * 10;
    gameover = false;
  };

  gameScene.paint = function (ctx) {
    var i = 0,
      l = 0;

    // Clean canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.strokeStyle = "#0f0";
    for (i = 0, l = body.length; i < l; i += 1) {
      body[i].drawImage(ctx, iBody);
    }

    // Draw Items

    ctx.strokeStyle = "#f00";
    testfood.drawImage(ctx, iFood);
    rock.drawImage(ctx, iThing);

    // Draw score
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 0, 10);

    // Draw Pause
    if (pause) {
      ctx.textAlign = "center";
      if (gameover) {
        ctx.fillText("GAME OVER", 150, 75);
      } else {
        ctx.fillText("PAUSE", 150, 75);
      }
    }
  };

  gameScene.act = function () {
    var i = 0,
      l = 0;

    if (!pause) {
      // GameOver Reset
      if (gameover) {
        loadScene(highscoresScene);
      }

      // Move Body
      for (i = body.length - 1; i > 0; i -= 1) {
        body[i].x = body[i - 1].x;
        body[i].y = body[i - 1].y;
      }

      // Change Direction
      if (lastPress == KEY_UP && dir !== 2) {
        dir = 0;
      }
      if (lastPress == KEY_RIGHT && dir !== 3) {
        dir = 1;
      }
      if (lastPress == KEY_DOWN && dir !== 0) {
        dir = 2;
      }
      if (lastPress == KEY_LEFT && dir !== 1) {
        dir = 3;
      }

      // Move Head
      if (dir === 0) {
        body[0].y -= 10;
      }
      if (dir === 1) {
        body[0].x += 10;
      }
      if (dir === 2) {
        body[0].y += 10;
      }
      if (dir === 3) {
        body[0].x -= 10;
      }

      // Out Screen
      if (body[0].x > canvas.width - body[0].width) {
        body[0].x = 0;
      }
      if (body[0].y > canvas.height - body[0].height) {
        body[0].y = 0;
      }
      if (body[0].x < 0) {
        body[0].x = canvas.width - body[0].width;
      }
      if (body[0].y < 0) {
        body[0].y = canvas.height - body[0].height;
      }

      // Food Intersects
      if (body[0].intersects(testfood)) {
        body.push(new Rectangle(0, 0, 10, 10));
        score += 1;
        testfood.x = random(canvas.width / 10 - 1) * 10;
        testfood.y = random(canvas.height / 10 - 1) * 10;
        aEat.play();
      }

      // Body Intersects
      for (i = 2, l = body.length; i < l; i += 1) {
        if (body[0].intersects(body[i])) {
          gameover = true;
          pause = true;
          aDie.play();
          addHighscore(score);
        }
      }

      // Rock Intersects
      if (body[0].intersects(rock)) {
        score += 1;

        // Hide Rock
        rock.x = -10;
        rock.y = -10;

        // Send Score

        async function sendScore() {
          try {
            const res = await fetch(
              `http://www.somerandompage.com/?score=${score} `
            );
            const data = await res.json();
            console.log(data);
            console.log("Score sent successfully");
          } catch (err) {
            console.log("Error trying to send the score");
          }
        }
        sendScore();

        // Random and delay Functions

        var delay = (function () {
          var timer = 0;
          return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
          };
        })();

        function randomdisposition() {
          rock.x = random(canvas.width / 10 - 1) * 10;
          rock.y = random(canvas.height / 10 - 1) * 10;
        }

        function between(min, max) {
          return Math.floor(Math.random() * (max - min) + min);
        }

        randomtime = between(2000, 15000);

        // Display rock at random disposition in random time between 2 and 15 sec
        delay(function () {
          randomdisposition();
        }, randomtime);
      }
    }
    // Pause / Unpause
    if (lastPress == KEY_ENTER) {
      pause = !pause;
      lastPress = null;
    }
  };

  // HighScore Scene
  highscoresScene = new Scene();

  highscoresScene.paint = function (ctx) {
    var i = 0,
      l = 0;

    // Clean Canvas
    ctx.fillStyle = "#030";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Title
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("HIGH SCORES", 150, 30);

    // Draw High Scores
    ctx.textAlign = "right";
    for (i = 0, l = highscoresScene.length; i < l; i += 1) {
      if (i === posHighscore) {
        ctx.fillText("*" + highscores[i], 180, 40 + i * 10);
      } else {
        ctx.fillText(highscores[i], 180, 40 + i * 10);
      }
    }
  };

  highscoresScene.act = function () {
    // Load next Scene
    if (lastPress === KEY_ENTER) {
      loadScene(gameScene);
      lastPress = null;
    }
  };

  window.addEventListener("load", init, false);
})(window);
