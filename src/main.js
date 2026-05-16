// import './style.css';
import * as Phaser from 'phaser';


const config = {
    type: Phaser.AUTO,
    width: 800, 
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // no vertical gravity for the bird
            debug: false // set to true to see the physics bodies for debugging
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let background;
let birdFrame = 0;
let birdFrames = ['bird_1', 'bird_2', 'bird_3'];
let bird;
let birdDirection = 1; // 1 for down, -1 for up
let base;
let gameStarted = false;
let gameOver = false;
let scoreText;
let point, hit, wing, die;

function preload() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('bird_1', 'assets/bluebird-downflap.png');
    this.load.image('bird_2', 'assets/bluebird-midflap.png');
    this.load.image('bird_3', 'assets/bluebird-upflap.png');
    this.load.image("base", "assets/base.png");
    this.load.image("piller", "assets/pipe-red.png");
    this.load.image("startGame", "assets/start-game.png");
    this.load.image("gameOver", "assets/gameover.png");
    this.load.image("resume", "assets/resume.png");
    this.load.audio("die", "assets/die.wav");
    this.load.audio("hit", "assets/hit.wav");
    this.load.audio("score", "assets/point.wav");
    this.load.audio("wing", "assets/wing.wav");
}

function create() {
    // this.add.image(400, 300, 'background');
    background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'background');
    background.setScale(2).setOrigin(0, 0);

    //load the sound effects
    point = this.sound.add("score");
    hit = this.sound.add("hit");
    wing = this.sound.add("wing");
    die = this.sound.add("die");

    //add start game image
    let startGame = this.add.image(game.config.width / 2, game.config.height / 2, 'startGame');
    startGame.setOrigin(0.5, 0.5);
    startGame.setInteractive();
    startGame.on('pointerdown', () =>  {
        startGame.destroy(); // Remove the start game image when clicked
        bird.setVisible(true); // Show the bird when the game starts
        gameStarted = true; // Start the game
           // Create a new piller every 2 seconds

           /*
            create a score display that is centered horizontally
            positioned near the top of the screen
            the score is initialized to 0 and updated
            render above other game objects
           */
          scoreText = this.add.text(game.config.width /2 , 50, '0', {
            fontSize: '32px',
            fill: "#fff"
          });
          scoreText.setOrigin(0.5, 0.5); //set the origin to the center
          scoreText.setDepth(2); //set the depth of the score text to 2
    this.time.addEvent({
        delay: 2000,
        callback: () => {
            if(gameOver){
                return; // Do not create new pillers if the game is over
            }
            createPiller();
        },
        callbackScope: this,
        loop: true
    });
    });

    bird  = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, 'bird_1');
    bird.setVisible(false); // Hide the bird until the game starts

    // //add mouse or laptop touchpad event to the bird
    // this.input.on('pointerdown', function (pointer) {
    //     bird.y -= 40; // Move the bird up
    //     birdDirection = -1; // set the bird direction to up
    // });   
    let baseImage = this.textures.get('base');
    let baseHeight = baseImage.getSourceImage().height;
    base = this.add.tileSprite(game.config.height / 2, game.config.height - baseHeight / 2, game.config.width + 200, baseHeight, 'base');

    //add physics to the base
    this.physics.add.existing(base, true); // true for static body
    base.setDepth(1); // Ensure the base is above the background

    //create a random size piller
    const createPiller = () => {
        let pillerHeight = Phaser.Math.Between(100, 400);
        let gap = 150;

        let bottomPiller = this.physics.add.sprite(game.config.width, game.config.height - base.height, "piller");
        bottomPiller.displayHeight = pillerHeight;
        bottomPiller.setOrigin(0.5, 1);
        bottomPiller.setVelocityX(-200);


        //create top piller
        let topPiller = this.physics.add.sprite(game.config.width, 0, "piller");
        topPiller.displayHeight = game.config.height - base.height - pillerHeight - gap;
        topPiller.setOrigin(0.5, 0);
        topPiller.setVelocityX(-200);

        //flip the top piller
        topPiller.setFlipY(true);

       

        //create a helper function - destroy piller
        const destroyPiller = (piller) => {
            //check piller right edge less than 0
            if(piller.getBounds().right < 0){
                piller.destroy();
            }
        }

        //set the onWorldBounds
        bottomPiller.body.onWorldBounds = true;
        topPiller.body.onWorldBounds = true;


        //listen for world bounds and destroy the piller
        this.physics.world.on("worldbounds", function (body) {
            if(body.gameObject === bottomPiller){
                destroyPiller(bottomPiller);
            }
            if(body.gameObject === topPiller){
                destroyPiller(topPiller);
            }
        });

        //Add collision detection betn the bird and the piller
        this.physics.add.collider(bird, bottomPiller,handleCollision, null, this);
        this.physics.add.collider(bird, topPiller,handleCollision, null, this);

     

        
    };

    //handle collision between the bird and the base
    const handleCollision = () => {
        //play the sounds
        hit.play();

        die.play();
        gameOver = true;
        //make bird red to indicate game over
        bird.setTint(0xff0000);
        bird.setVelocity(0, 0); // Stop the bird's movement
        bird.setGravityY(0); // Remove gravity to prevent further falling
        this.physics.pause(); // Pause the physics to stop all movement

        //add game over image
        let gameOverImage = this.add.image(game.config.width / 2, game.config.height / 2, 'gameOver');
        gameOverImage.setOrigin(0.5, 0.5);
        gameOverImage.setScale(2);

        //add the resume button
        let resumeButton = this.add.image(game.config.width / 2, game.config.height - 100, 'resume');
        resumeButton.setOrigin(0.5,2);
        resumeButton.setScale(2);
        resumeButton.setInteractive();
        resumeButton.on("pointerdown", () => {
            resumeButton.destroy();
            gameOverImage.destroy();
            resumeGame();
        })
    }

    this.physics.add.collider(bird, base, handleCollision, null, this);


    const resumeGame = () => {
        gameOver = false;
        gameStarted = false;
        bird.clearTint();
        bird.setActive(false).setVisible(false);
        this.scene.restart();
    }
 
}

function update() {

    if(!gameStarted || gameOver) {  
        return; // Do not update the game until it has started
    }
    // Game logic goes here
    background.tilePositionX += 1; // Scroll the background to the right
    base.tilePositionX += 1; // Scroll the base to the right

    birdFrame += 0.1; // Adjust the speed of the bird animation
    if (birdFrame >= birdFrames.length) {
        birdFrame = 0;
    }
    bird.setTexture(birdFrames[Math.floor(birdFrame)]);

    if(bird.active){
        //apply gravity-like effect to the bird
        bird.body.setVelocityY(bird.body.velocity.y + 10);

        //prevent bird from falling through the base
        let baseTop = game.config.height - base.height;
        if(bird.y + bird.height / 2 > baseTop){
            bird.y = baseTop - bird.height / 2; // Prevent the bird from falling through the base
            bird.body.setVelocityY(0); // Stop the bird's downward movement
        }
        //Go up when space key is pressed
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        if(spaceKey.isDown || this.input.activePointer.isDown) {
            wing.play();
            bird.body.setVelocityY(-200); // Move the bird up
            birdDirection = -1; // set the bird direction to up
        }    
    }

    // // Gravity effect to make the bird fall down
    // bird.y += 2;
    // if(bird.y + bird.height /2  > game.config.height - base.height){
    //     bird.y = game.config.height - base.height - bird.height / 2; // Prevent the bird from falling through the base
    // }

    this.physics.world.colliders.getActive().forEach((collider) => {

        //if the first obj is bird and the second obj is piller
        if(collider.object1 === bird && collider.object2.texture.key === "piller"){
            let piller = collider.object2; // get the piller


            //if the bird passes the piller and piller is not scored, make the piller scored
            if(piller.x + piller.width /2 < bird.x - bird.width /2 && !piller.scored){
                piller.scored  =true;

                //check if the both piller scored
                let pillerPair = this.physics.world.colliders.getActive().find((collider) => {
                    return collider.object2 !== piller && collider.object2.texture.key === "piller" && Math.abs(collider.object2.x - piller.x) < 10;
                })

                if(pillerPair && !pillerPair.object2.scored){

                    //play score sound
                    point.play();
                    pillerPair.object2.scored = true;
                    scoreText.setText(parseInt(scoreText.text) + 1);
                }
            }
        }
    })

}