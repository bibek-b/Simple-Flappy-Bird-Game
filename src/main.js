// import './style.css';
import * as Phaser from 'phaser';


const config = {
    type: Phaser.AUTO,
    width: 800, 
    height: 600,
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

function preload() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('bird_1', 'assets/bluebird-downflap.png');
    this.load.image('bird_2', 'assets/bluebird-midflap.png');
    this.load.image('bird_3', 'assets/bluebird-upflap.png');
}

function create() {
    // this.add.image(400, 300, 'background');
    background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'background');
    background.setScale(2).setOrigin(0, 0);
    bird  = this.add.sprite(game.config.width / 2, game.config.height / 2, 'bird_1');
}

function update() {
    // Game logic goes here
    background.tilePositionX += 1; // Scroll the background to the right

    birdFrame += 0.1; // Adjust the speed of the bird animation
    if (birdFrame >= birdFrames.length) {
        birdFrame = 0;
    }
    bird.setTexture(birdFrames[Math.floor(birdFrame)]);

    // Move the bird up and down
    bird.y += birdDirection * 1; // Adjust the speed of the bird's vertical movement
    if(bird.y >= 350 || bird.y <= 250) {
        birdDirection *= -1; // Change direction when reaching the limits
    }
}