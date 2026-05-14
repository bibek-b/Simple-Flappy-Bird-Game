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
            debug: false
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

function preload() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('bird_1', 'assets/bluebird-downflap.png');
    this.load.image('bird_2', 'assets/bluebird-midflap.png');
    this.load.image('bird_3', 'assets/bluebird-upflap.png');
    this.load.image("base", "assets/base.png");
    this.load.image("piller", "assets/pipe-red.png");
}

function create() {
    // this.add.image(400, 300, 'background');
    background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'background');
    background.setScale(2).setOrigin(0, 0);
    bird  = this.add.sprite(game.config.width / 2, game.config.height / 2, 'bird_1');

    //add mouse or laptop touchpad event to the bird
    this.input.on('pointerdown', function (pointer) {
        bird.y -= 40; // Move the bird up
        birdDirection = -1; // set the bird direction to up
    });   
    let baseImage = this.textures.get('base');
    let baseHeight = baseImage.getSourceImage().height;
    base = this.add.tileSprite(game.config.height / 2, game.config.height - baseHeight / 2, game.config.width + 200, baseHeight, 'base');

    //add physics to the base
    this.physics.add.existing(base, true); // true for static body
    base.setDepth(1); // Ensure the base is above the background

    //create a random size piller
    const createPiller = () => {
        let pillerHeight = Phaser.Math.Between(100, 400);
        let piller = this.add.sprite(game.config.width, game.config.height - baseHeight, 'piller');
        piller.displayHeight = pillerHeight; //set the height of the piller
        piller.setOrigin(0.5, 1); //set the origin to the bottom center

        //remove the piller when it goes off screen
        this.physics.add.existing(piller);
        piller.body.setVelocityX(-200); //move the piller to the left

        piller.body.onWorldBounds = true;
        piller.body.world.on('worldbounds', function(body) {    
            if(body.gameObject === piller) {    
                piller.destroy(); //destroy the piller when it goes off screen
            }
        })

        
    };

    // Create a new piller every 2 seconds
    this.time.addEvent({
        delay: 2000,
        callback: createPiller,
        callbackScope: this,
        loop: true
    });
}

function update() {
    // Game logic goes here
    background.tilePositionX += 1; // Scroll the background to the right
    base.tilePositionX += 1; // Scroll the base to the right

    birdFrame += 0.1; // Adjust the speed of the bird animation
    if (birdFrame >= birdFrames.length) {
        birdFrame = 0;
    }
    bird.setTexture(birdFrames[Math.floor(birdFrame)]);

    // Gravity effect to make the bird fall down
    bird.y += 2;
    if(bird.y + bird.height /2  > game.config.height - base.height){
        bird.y = game.config.height - base.height - bird.height / 2; // Prevent the bird from falling through the base
    }

    //Go up when space key is pressed
    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    if(spaceKey.isDown){
        bird.y -= 4; // Move the bird up
        birdDirection = -1; // set the bird direction to up
    }    else {
        birdDirection = 1; // set the bird direction to down
    }
}