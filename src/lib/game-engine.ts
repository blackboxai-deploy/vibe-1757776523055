import { AudioManager } from '@/lib/audio-manager';

// Core Fighting Game Engine
export interface Vec2 {
  x: number;
  y: number;
}

export interface Fighter {
  id: string;
  position: Vec2;
  velocity: Vec2;
  size: Vec2;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  state: 'idle' | 'walking' | 'jumping' | 'attacking' | 'blocking' | 'hit' | 'special';
  facing: 'left' | 'right';
  attackFrame: number;
  attackType: 'none' | 'light' | 'heavy' | 'special';
  blockActive: boolean;
  invulnerable: number;
  comboCount: number;
  lastHit: number;
  color: string;
  controls: ControlScheme;
}

export interface ControlScheme {
  left: string;
  right: string;
  up: string;
  down: string;
  lightAttack: string;
  heavyAttack: string;
  special: string;
  block: string;
}

export interface Projectile {
  id: string;
  position: Vec2;
  velocity: Vec2;
  size: Vec2;
  damage: number;
  owner: string;
  active: boolean;
  type: 'fireball' | 'iceball';
}

export interface GameState {
  fighters: Fighter[];
  projectiles: Projectile[];
  camera: Vec2;
  gameMode: 'menu' | 'fighting' | 'paused' | 'victory';
  winner: string | null;
  round: number;
  maxRounds: number;
  roundWins: { [key: string]: number };
  timer: number;
  maxTime: number;
  inputBuffer: { [key: string]: boolean };
  lastTime: number;
  particles: Particle[];
}

export interface Particle {
  id: string;
  position: Vec2;
  velocity: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class FightingGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private animationId: number = 0;
  private audioManager: AudioManager;
  private touchControls: TouchControls;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.touchControls = new TouchControls();
    this.audioManager = new AudioManager();
    
    this.gameState = {
      fighters: this.createFighters(),
      projectiles: [],
      camera: { x: 0, y: 0 },
      gameMode: 'fighting',
      winner: null,
      round: 1,
      maxRounds: 3,
      roundWins: {},
      timer: 99,
      maxTime: 99,
      inputBuffer: {},
      lastTime: 0,
      particles: []
    };

    this.setupCanvas();
    this.setupInput();
    this.initAudio();
  }

  private setupCanvas(): void {
    this.canvas.width = 1200;
    this.canvas.height = 600;
    this.canvas.style.border = '2px solid #fff';
    this.canvas.style.backgroundColor = '#1a1a2e';
  }

  private createFighters(): Fighter[] {
    const controlsP1: ControlScheme = {
      left: 'KeyA',
      right: 'KeyD',
      up: 'KeyW',
      down: 'KeyS',
      lightAttack: 'KeyG',
      heavyAttack: 'KeyH',
      special: 'KeyT',
      block: 'KeyR'
    };

    const controlsP2: ControlScheme = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown',
      lightAttack: 'KeyK',
      heavyAttack: 'KeyL',
      special: 'KeyI',
      block: 'KeyO'
    };

    return [
      {
        id: 'player1',
        position: { x: 200, y: 400 },
        velocity: { x: 0, y: 0 },
        size: { x: 60, y: 120 },
        health: 100,
        maxHealth: 100,
        energy: 100,
        maxEnergy: 100,
        state: 'idle',
        facing: 'right',
        attackFrame: 0,
        attackType: 'none',
        blockActive: false,
        invulnerable: 0,
        comboCount: 0,
        lastHit: 0,
        color: '#4fc3f7',
        controls: controlsP1
      },
      {
        id: 'player2',
        position: { x: 940, y: 400 },
        velocity: { x: 0, y: 0 },
        size: { x: 60, y: 120 },
        health: 100,
        maxHealth: 100,
        energy: 100,
        maxEnergy: 100,
        state: 'idle',
        facing: 'left',
        attackFrame: 0,
        attackType: 'none',
        blockActive: false,
        invulnerable: 0,
        comboCount: 0,
        lastHit: 0,
        color: '#ef5350',
        controls: controlsP2
      }
    ];
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.gameState.inputBuffer[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.gameState.inputBuffer[e.code] = false;
    });

    // Touch controls setup
    this.touchControls.setup(this.canvas, this.gameState);
  }

  private async initAudio(): Promise<void> {
    try {
      await this.audioManager.initialize();
    } catch (error) {
      console.log('Audio not available');
    }
  }

  public start(): void {
    this.gameLoop(0);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.audioManager.cleanup();
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = currentTime - this.gameState.lastTime;
    this.gameState.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    if (this.gameState.gameMode !== 'fighting') return;

    // Update timer
    if (deltaTime > 0) {
      this.gameState.timer -= deltaTime / 1000;
      if (this.gameState.timer <= 0) {
        this.endRound();
      }
    }

    // Update fighters
    this.gameState.fighters.forEach(fighter => {
      this.updateFighter(fighter, deltaTime);
      this.handleFighterInput(fighter);
    });

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Update particles
    this.updateParticles(deltaTime);

    // Check victory conditions
    this.checkVictory();
  }

  private updateFighter(fighter: Fighter, deltaTime: number): void {
    // Apply gravity
    if (fighter.position.y < 400) {
      fighter.velocity.y += 1200 * (deltaTime / 1000);
    }

    // Update position
    fighter.position.x += fighter.velocity.x * (deltaTime / 1000);
    fighter.position.y += fighter.velocity.y * (deltaTime / 1000);

    // Ground constraint
    if (fighter.position.y >= 400) {
      fighter.position.y = 400;
      fighter.velocity.y = 0;
      if (fighter.state === 'jumping') {
        fighter.state = 'idle';
      }
    }

    // Boundary constraints
    fighter.position.x = Math.max(30, Math.min(1170 - fighter.size.x, fighter.position.x));

    // Update timers
    if (fighter.attackFrame > 0) {
      fighter.attackFrame--;
      if (fighter.attackFrame === 0) {
        fighter.state = 'idle';
        fighter.attackType = 'none';
      }
    }

    if (fighter.invulnerable > 0) {
      fighter.invulnerable--;
    }

    // Energy regeneration
    if (fighter.energy < fighter.maxEnergy) {
      fighter.energy += 20 * (deltaTime / 1000);
      fighter.energy = Math.min(fighter.energy, fighter.maxEnergy);
    }

    // Apply friction
    fighter.velocity.x *= 0.8;
  }

  private handleFighterInput(fighter: Fighter): void {
    const controls = fighter.controls;
    
    if (fighter.state === 'attacking' || fighter.state === 'hit') return;

    // Movement
    if (this.gameState.inputBuffer[controls.left]) {
      fighter.velocity.x = -300;
      fighter.facing = 'left';
      if (fighter.state !== 'jumping') fighter.state = 'walking';
    } else if (this.gameState.inputBuffer[controls.right]) {
      fighter.velocity.x = 300;
      fighter.facing = 'right';
      if (fighter.state !== 'jumping') fighter.state = 'walking';
    } else if (fighter.state === 'walking') {
      fighter.state = 'idle';
    }

    // Jumping
    if (this.gameState.inputBuffer[controls.up] && fighter.position.y >= 400) {
      fighter.velocity.y = -600;
      fighter.state = 'jumping';
    }

    // Blocking
    fighter.blockActive = this.gameState.inputBuffer[controls.block];

    // Attacks
    if (this.gameState.inputBuffer[controls.lightAttack] && fighter.attackFrame === 0) {
      this.performAttack(fighter, 'light');
    } else if (this.gameState.inputBuffer[controls.heavyAttack] && fighter.attackFrame === 0) {
      this.performAttack(fighter, 'heavy');
    } else if (this.gameState.inputBuffer[controls.special] && fighter.attackFrame === 0 && fighter.energy >= 30) {
      this.performSpecialAttack(fighter);
    }
  }

  private performAttack(fighter: Fighter, type: 'light' | 'heavy'): void {
    fighter.state = 'attacking';
    fighter.attackType = type;
    fighter.attackFrame = type === 'light' ? 20 : 35;
    
    // Play attack sound
    if (type === 'light') {
      this.audioManager.playPunchSound();
    } else {
      this.audioManager.playKickSound();
    }
    
    // Create attack hitbox and check for hits immediately
    const opponent = this.gameState.fighters.find(f => f.id !== fighter.id)!;
    const attackRange = type === 'light' ? 80 : 100;
    const damage = type === 'light' ? 8 : 15;
    
    if (this.isInRange(fighter, opponent, attackRange)) {
      this.hitFighter(opponent, fighter, damage);
    }
  }

  private performSpecialAttack(fighter: Fighter): void {
    fighter.state = 'special';
    fighter.attackType = 'special';
    fighter.attackFrame = 45;
    fighter.energy -= 30;

    // Play special attack sound
    this.audioManager.playSpecialSound();

    // Create projectile
    const projectile: Projectile = {
      id: `projectile_${Date.now()}`,
      position: { 
        x: fighter.position.x + (fighter.facing === 'right' ? fighter.size.x : -20), 
        y: fighter.position.y + 40 
      },
      velocity: { 
        x: fighter.facing === 'right' ? 400 : -400, 
        y: 0 
      },
      size: { x: 30, y: 15 },
      damage: 20,
      owner: fighter.id,
      active: true,
      type: fighter.id === 'player1' ? 'iceball' : 'fireball'
    };

    this.gameState.projectiles.push(projectile);
    this.createParticleEffect(projectile.position, projectile.type === 'fireball' ? '#ff4444' : '#44aaff');
  }

  private updateProjectiles(deltaTime: number): void {
    this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
      projectile.position.x += projectile.velocity.x * (deltaTime / 1000);
      projectile.position.y += projectile.velocity.y * (deltaTime / 1000);

      // Remove if off screen
      if (projectile.position.x < -50 || projectile.position.x > 1250) {
        return false;
      }

      return projectile.active;
    });
  }

  private checkCollisions(): void {
    // Fighter vs Projectile collisions
    this.gameState.projectiles.forEach(projectile => {
      this.gameState.fighters.forEach(fighter => {
        if (fighter.id !== projectile.owner && 
            this.checkAABB(projectile.position, projectile.size, fighter.position, fighter.size)) {
          this.hitFighter(fighter, null, projectile.damage);
          projectile.active = false;
          this.createParticleEffect(projectile.position, '#ffff44');
        }
      });
    });
  }

  private isInRange(attacker: Fighter, target: Fighter, range: number): boolean {
    const distance = Math.abs(attacker.position.x - target.position.x);
    return distance <= range;
  }

  private checkAABB(pos1: Vec2, size1: Vec2, pos2: Vec2, size2: Vec2): boolean {
    return pos1.x < pos2.x + size2.x &&
           pos1.x + size1.x > pos2.x &&
           pos1.y < pos2.y + size2.y &&
           pos1.y + size1.y > pos2.y;
  }

  private hitFighter(target: Fighter, attacker: Fighter | null, damage: number): void {
    if (target.invulnerable > 0) return;

    if (target.blockActive && attacker) {
      // Blocking reduces damage
      damage *= 0.3;
      target.velocity.x += attacker.facing === 'right' ? 100 : -100;
      this.audioManager.playBlockSound();
    } else {
      target.state = 'hit';
      target.invulnerable = 30;
      this.audioManager.playHitSound();
      
      if (attacker) {
        // Combo system
        const timeSinceLastHit = Date.now() - attacker.lastHit;
        if (timeSinceLastHit < 1000) {
          attacker.comboCount++;
          damage *= (1 + attacker.comboCount * 0.1);
        } else {
          attacker.comboCount = 1;
        }
        attacker.lastHit = Date.now();
        
        // Knockback
        target.velocity.x += attacker.facing === 'right' ? 200 : -200;
      }
    }

    target.health -= damage;
    target.health = Math.max(0, target.health);

    // Create hit particles
    this.createParticleEffect(target.position, '#ff6666');

    if (target.health <= 0) {
      this.endRound();
    }
  }

  private createParticleEffect(position: Vec2, color: string): void {
    for (let i = 0; i < 8; i++) {
      const particle: Particle = {
        id: `particle_${Date.now()}_${i}`,
        position: { x: position.x + Math.random() * 40, y: position.y + Math.random() * 40 },
        velocity: { 
          x: (Math.random() - 0.5) * 400, 
          y: (Math.random() - 0.5) * 400 
        },
        life: 0.5,
        maxLife: 0.5,
        color,
        size: Math.random() * 6 + 2
      };
      this.gameState.particles.push(particle);
    }
  }

  private updateParticles(deltaTime: number): void {
    this.gameState.particles = this.gameState.particles.filter(particle => {
      particle.position.x += particle.velocity.x * (deltaTime / 1000);
      particle.position.y += particle.velocity.y * (deltaTime / 1000);
      particle.life -= deltaTime / 1000;
      
      return particle.life > 0;
    });
  }

  private endRound(): void {
    const aliveFighters = this.gameState.fighters.filter(f => f.health > 0);
    
    if (aliveFighters.length === 1) {
      const winner = aliveFighters[0];
      this.gameState.roundWins[winner.id] = (this.gameState.roundWins[winner.id] || 0) + 1;
    } else if (this.gameState.timer <= 0) {
      // Time up - fighter with more health wins
      const healthiest = this.gameState.fighters.reduce((prev, current) => 
        prev.health > current.health ? prev : current
      );
      this.gameState.roundWins[healthiest.id] = (this.gameState.roundWins[healthiest.id] || 0) + 1;
    }

    // Check if match is over
    const maxWins = Math.ceil(this.gameState.maxRounds / 2);
    const matchWinner = Object.keys(this.gameState.roundWins).find(
      id => this.gameState.roundWins[id] >= maxWins
    );

    if (matchWinner) {
      this.gameState.gameMode = 'victory';
      this.gameState.winner = matchWinner;
      this.audioManager.playVictorySound();
    } else {
      // Reset for next round
      this.gameState.round++;
      this.gameState.timer = this.gameState.maxTime;
      this.gameState.fighters.forEach(fighter => {
        fighter.health = fighter.maxHealth;
        fighter.energy = fighter.maxEnergy;
        fighter.state = 'idle';
        fighter.position = fighter.id === 'player1' ? { x: 200, y: 400 } : { x: 940, y: 400 };
        fighter.velocity = { x: 0, y: 0 };
      });
    }
  }

  private checkVictory(): void {
    // Victory conditions handled in endRound()
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#0f0f23';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    this.drawBackground();

    // Draw fighters
    this.gameState.fighters.forEach(fighter => this.drawFighter(fighter));

    // Draw projectiles
    this.gameState.projectiles.forEach(projectile => this.drawProjectile(projectile));

    // Draw particles
    this.gameState.particles.forEach(particle => this.drawParticle(particle));

    // Draw HUD
    this.drawHUD();

    // Draw game mode specific UI
    if (this.gameState.gameMode === 'victory') {
      this.drawVictoryScreen();
    }
  }

  private drawBackground(): void {
    // Simple gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 520, this.canvas.width, 80);
  }

  private drawFighter(fighter: Fighter): void {
    this.ctx.save();

    // Flashing effect when invulnerable
    if (fighter.invulnerable > 0 && Math.floor(fighter.invulnerable / 5) % 2) {
      this.ctx.globalAlpha = 0.5;
    }

    // Fighter body
    this.ctx.fillStyle = fighter.color;
    this.ctx.fillRect(fighter.position.x, fighter.position.y, fighter.size.x, fighter.size.y);

    // Fighter face direction indicator
    this.ctx.fillStyle = '#fff';
    const eyeX = fighter.facing === 'right' ? fighter.position.x + 45 : fighter.position.x + 15;
    this.ctx.fillRect(eyeX, fighter.position.y + 20, 8, 8);

    // Attack indicator
    if (fighter.state === 'attacking' || fighter.state === 'special') {
      this.ctx.strokeStyle = fighter.attackType === 'special' ? '#ffff00' : '#ff0000';
      this.ctx.lineWidth = 3;
      const attackRange = fighter.attackType === 'light' ? 80 : 
                         fighter.attackType === 'heavy' ? 100 : 120;
      const attackX = fighter.facing === 'right' ? 
                     fighter.position.x + fighter.size.x : 
                     fighter.position.x - attackRange;
      this.ctx.strokeRect(attackX, fighter.position.y + 20, attackRange, 40);
    }

    // Block indicator
    if (fighter.blockActive) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(fighter.position.x - 5, fighter.position.y - 5, 
                       fighter.size.x + 10, fighter.size.y + 10);
    }

    this.ctx.restore();
  }

  private drawProjectile(projectile: Projectile): void {
    this.ctx.fillStyle = projectile.type === 'fireball' ? '#ff4444' : '#44aaff';
    this.ctx.fillRect(projectile.position.x, projectile.position.y, 
                     projectile.size.x, projectile.size.y);
    
    // Add glow effect
    this.ctx.shadowColor = projectile.type === 'fireball' ? '#ff0000' : '#0088ff';
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(projectile.position.x + 5, projectile.position.y + 3, 
                     projectile.size.x - 10, projectile.size.y - 6);
    this.ctx.shadowBlur = 0;
  }

  private drawParticle(particle: Particle): void {
    const alpha = particle.life / particle.maxLife;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawHUD(): void {
    // Health bars
    this.drawHealthBar(this.gameState.fighters[0], 50, 50);
    this.drawHealthBar(this.gameState.fighters[1], 750, 50);

    // Energy bars
    this.drawEnergyBar(this.gameState.fighters[0], 50, 90);
    this.drawEnergyBar(this.gameState.fighters[1], 750, 90);

    // Timer
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(Math.ceil(this.gameState.timer).toString(), 
                     this.canvas.width / 2, 40);

    // Round indicator
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Round ${this.gameState.round}`, this.canvas.width / 2, 65);

    // Combo counters
    this.gameState.fighters.forEach((fighter, index) => {
      if (fighter.comboCount > 1) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = index === 0 ? 'left' : 'right';
        this.ctx.fillText(`${fighter.comboCount} HIT COMBO!`, 
                         index === 0 ? 50 : 1150, 130);
      }
    });

    // Round wins
    const p1Wins = this.gameState.roundWins['player1'] || 0;
    const p2Wins = this.gameState.roundWins['player2'] || 0;
    
    this.ctx.fillStyle = '#4fc3f7';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('★'.repeat(p1Wins), 50, 130);
    
    this.ctx.fillStyle = '#ef5350';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('★'.repeat(p2Wins), 1150, 130);
  }

  private drawHealthBar(fighter: Fighter, x: number, y: number): void {
    const width = 400;
    const height = 20;
    const healthPercent = fighter.health / fighter.maxHealth;

    // Background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x, y, width, height);

    // Health
    this.ctx.fillStyle = healthPercent > 0.6 ? '#4caf50' : 
                        healthPercent > 0.3 ? '#ff9800' : '#f44336';
    this.ctx.fillRect(x, y, width * healthPercent, height);

    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Fighter name
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(fighter.id.toUpperCase(), x, y - 5);
  }

  private drawEnergyBar(fighter: Fighter, x: number, y: number): void {
    const width = 400;
    const height = 10;
    const energyPercent = fighter.energy / fighter.maxEnergy;

    // Background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x, y, width, height);

    // Energy
    this.ctx.fillStyle = '#2196f3';
    this.ctx.fillRect(x, y, width * energyPercent, height);

    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
  }

  private drawVictoryScreen(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Victory text
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.gameState.winner?.toUpperCase()} WINS!`, 
                     this.canvas.width / 2, this.canvas.height / 2);

    // Restart instruction
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press R to restart', 
                     this.canvas.width / 2, this.canvas.height / 2 + 60);
  }

  public restart(): void {
    this.gameState.gameMode = 'fighting';
    this.gameState.winner = null;
    this.gameState.round = 1;
    this.gameState.roundWins = {};
    this.gameState.timer = this.gameState.maxTime;
    this.gameState.projectiles = [];
    this.gameState.particles = [];
    
    this.gameState.fighters.forEach(fighter => {
      fighter.health = fighter.maxHealth;
      fighter.energy = fighter.maxEnergy;
      fighter.state = 'idle';
      fighter.comboCount = 0;
      fighter.position = fighter.id === 'player1' ? { x: 200, y: 400 } : { x: 940, y: 400 };
      fighter.velocity = { x: 0, y: 0 };
    });
  }
}

class TouchControls {
  private buttons: TouchButton[] = [];

  setup(canvas: HTMLCanvasElement, gameState: GameState): void {
    // Create virtual buttons for mobile
    this.createTouchButtons(canvas);
    this.setupTouchEvents(canvas, gameState);
  }

  private createTouchButtons(canvas: HTMLCanvasElement): void {
    // Left side controls
    this.buttons = [
      { id: 'left', x: 50, y: 450, width: 60, height: 60, key: 'KeyA', active: false },
      { id: 'right', x: 150, y: 450, width: 60, height: 60, key: 'KeyD', active: false },
      { id: 'up', x: 100, y: 400, width: 60, height: 60, key: 'KeyW', active: false },
      { id: 'down', x: 100, y: 500, width: 60, height: 60, key: 'KeyS', active: false },
      
      // Right side attacks
      { id: 'light', x: 1000, y: 450, width: 70, height: 70, key: 'KeyG', active: false },
      { id: 'heavy', x: 1100, y: 450, width: 70, height: 70, key: 'KeyH', active: false },
      { id: 'special', x: 1050, y: 370, width: 70, height: 70, key: 'KeyT', active: false },
      { id: 'block', x: 1050, y: 530, width: 70, height: 70, key: 'KeyR', active: false }
    ];
  }

  private setupTouchEvents(canvas: HTMLCanvasElement, gameState: GameState): void {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleTouch(e.touches, gameState, true);
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleTouch(e.touches, gameState, false);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleTouch(e.touches, gameState, true);
    });
  }

  private handleTouch(touches: TouchList, gameState: GameState, pressed: boolean): void {
    const rect = (touches[0].target as HTMLCanvasElement).getBoundingClientRect();
    
    // Reset all buttons
    this.buttons.forEach(button => {
      button.active = false;
      gameState.inputBuffer[button.key] = false;
    });

    // Check each touch
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.buttons.forEach(button => {
        if (x >= button.x && x <= button.x + button.width &&
            y >= button.y && y <= button.y + button.height) {
          button.active = pressed;
          gameState.inputBuffer[button.key] = pressed;
        }
      });
    }
  }

  drawButtons(ctx: CanvasRenderingContext2D): void {
    this.buttons.forEach(button => {
      ctx.fillStyle = button.active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(button.x, button.y, button.width, button.height);
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(button.x, button.y, button.width, button.height);
      
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(button.id, button.x + button.width/2, button.y + button.height/2 + 4);
    });
  }
}

interface TouchButton {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  key: string;
  active: boolean;
}