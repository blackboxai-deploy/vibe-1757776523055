// Fight Night Legends Game Engine with Human Boxers
export interface Vec2 {
  x: number;
  y: number;
}

export interface Boxer {
  id: string;
  name: string;
  position: Vec2;
  velocity: Vec2;
  size: Vec2;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  specialMeter: number;
  maxSpecialMeter: number;
  state: 'idle' | 'walking' | 'jabbing' | 'hooking' | 'uppercut' | 'blocking' | 'hit' | 'special' | 'knocked-down';
  facing: 'left' | 'right';
  attackFrame: number;
  attackType: 'none' | 'jab' | 'hook' | 'uppercut' | 'special';
  blockActive: boolean;
  invulnerable: number;
  comboCount: number;
  lastHit: number;
  color: string;
  knockdownTimer: number;
  specialCooldown: number;
  trophies: number;
  coins: number;
  // Human-like features with animation
  head: Vec2;
  torso: Vec2;
  leftArm: Vec2;
  rightArm: Vec2;
  leftLeg: Vec2;
  rightLeg: Vec2;
  stance: 'orthodox' | 'southpaw';
  armSwingAnimation: number;
  punchAnimation: { active: boolean; progress: number; type: string };
}

export interface Projectile {
  id: string;
  position: Vec2;
  velocity: Vec2;
  size: Vec2;
  damage: number;
  owner: string;
  active: boolean;
  type: 'lightning' | 'butterfly' | 'holy-fire' | 'thunder' | 'sugar-rush' | 'grill-slam';
  life: number;
}

export interface GameState {
  boxers: Boxer[];
  projectiles: Projectile[];
  gameMode: 'fighting' | 'victory' | 'knockout';
  winner: string | null;
  round: number;
  maxRounds: number;
  roundWins: { [key: string]: number };
  timer: number;
  maxTime: number;
  inputBuffer: { [key: string]: boolean };
  lastTime: number;
  particles: Particle[];
  crowdNoise: number;
  ringShake: number;
}

export interface Particle {
  id: string;
  position: Vec2;
  velocity: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'hit' | 'sweat' | 'fire' | 'lightning' | 'stars';
}

export class FightNightEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private animationId: number = 0;
  private selectedFighter: string;

  constructor(canvas: HTMLCanvasElement, selectedFighter: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.selectedFighter = selectedFighter;
    
    this.gameState = {
      boxers: this.createBoxers(selectedFighter),
      projectiles: [],
      gameMode: 'fighting',
      winner: null,
      round: 1,
      maxRounds: 5,
      roundWins: {},
      timer: 180, // 3 minutes per round
      maxTime: 180,
      inputBuffer: {},
      lastTime: 0,
      particles: [],
      crowdNoise: 0,
      ringShake: 0
    };

    this.setupCanvas();
    this.setupInput();
  }

  private setupCanvas(): void {
    this.canvas.width = 1200;
    this.canvas.height = 700;
    this.canvas.style.border = '4px solid #ff0000';
    this.canvas.style.backgroundColor = '#1a1a2e';
  }

  private createBoxers(selectedFighter: string): Boxer[] {
    const createBoxer = (id: string, name: string, x: number, facing: 'left' | 'right', color: string): Boxer => ({
      id,
      name,
      position: { x, y: 500 },
      velocity: { x: 0, y: 0 },
      size: { x: 80, y: 160 },
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      specialMeter: 0,
      maxSpecialMeter: 100,
      state: 'idle',
      facing,
      attackFrame: 0,
      attackType: 'none',
      blockActive: false,
      invulnerable: 0,
      comboCount: 0,
      lastHit: 0,
      color,
      knockdownTimer: 0,
      specialCooldown: 0,
      trophies: 0,
      coins: 0,
      // Human features - relative to position
      head: { x: 0, y: -140 },
      torso: { x: 0, y: -80 },
      leftArm: { x: -30, y: -100 },
      rightArm: { x: 30, y: -100 },
      leftLeg: { x: -20, y: -40 },
      rightLeg: { x: 20, y: -40 },
      stance: facing === 'left' ? 'southpaw' : 'orthodox',
      armSwingAnimation: 0,
      punchAnimation: { active: false, progress: 0, type: '' }
    });

    // Player boxer
    const playerColor = this.getBoxerColor(selectedFighter);
    const player = createBoxer('player', selectedFighter, 200, 'right', playerColor);
    
    // AI opponent (random selection)
    const opponents = ['mike-tyson', 'muhammad-ali', 'evander-holyfield', 'rocky-balboa', 'sugar-ray-leonard', 'george-foreman'];
    const opponentId = opponents[Math.floor(Math.random() * opponents.length)];
    const opponent = createBoxer('ai', opponentId, 920, 'left', this.getBoxerColor(opponentId));

    return [player, opponent];
  }

  private getBoxerColor(boxerId: string): string {
    const colors: { [key: string]: string } = {
      'mike-tyson': '#000000',
      'muhammad-ali': '#FFD700',
      'evander-holyfield': '#FF4444',
      'rocky-balboa': '#8B4513',
      'sugar-ray-leonard': '#FF69B4',
      'george-foreman': '#CD853F'
    };
    return colors[boxerId] || '#4fc3f7';
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.gameState.inputBuffer[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.gameState.inputBuffer[e.code] = false;
    });
  }

  public start(): void {
    this.gameLoop(0);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
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

    // Update boxers
    this.gameState.boxers.forEach(boxer => {
      this.updateBoxer(boxer, deltaTime);
      if (boxer.id === 'player') {
        this.handlePlayerInput(boxer);
      } else {
        this.handleAI(boxer, deltaTime);
      }
    });

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Update particles
    this.updateParticles(deltaTime);

    // Update effects
    this.gameState.ringShake = Math.max(0, this.gameState.ringShake - deltaTime / 1000);
    this.gameState.crowdNoise = Math.max(0, this.gameState.crowdNoise - deltaTime / 1000);

    // Check victory conditions
    this.checkVictory();
  }

  private updateBoxer(boxer: Boxer, deltaTime: number): void {
    // Update position
    boxer.position.x += boxer.velocity.x * (deltaTime / 1000);
    boxer.position.y += boxer.velocity.y * (deltaTime / 1000);

    // Ground constraint (boxing ring)
    boxer.position.y = Math.max(500, Math.min(500, boxer.position.y));

    // Ring boundaries
    boxer.position.x = Math.max(50, Math.min(1070, boxer.position.x));

    // Update timers
    if (boxer.attackFrame > 0) {
      boxer.attackFrame--;
      if (boxer.attackFrame === 0) {
        boxer.state = 'idle';
        boxer.attackType = 'none';
      }
    }

    if (boxer.invulnerable > 0) {
      boxer.invulnerable--;
    }

    if (boxer.specialCooldown > 0) {
      boxer.specialCooldown -= deltaTime / 1000;
    }

    // Knockdown recovery
    if (boxer.knockdownTimer > 0) {
      boxer.knockdownTimer -= deltaTime / 1000;
      if (boxer.knockdownTimer <= 0) {
        boxer.state = 'idle';
        boxer.invulnerable = 60; // Brief invulnerability after getting up
      }
    }

    // Stamina and special meter regeneration
    if (boxer.stamina < boxer.maxStamina && boxer.state !== 'knocked-down') {
      boxer.stamina += 15 * (deltaTime / 1000);
      boxer.stamina = Math.min(boxer.stamina, boxer.maxStamina);
    }

    // Apply friction
    boxer.velocity.x *= 0.85;

    // Update human body parts based on state
    this.updateBodyParts(boxer);
  }

  private updateBodyParts(boxer: Boxer): void {
    // Animate body parts based on boxer state
    const time = Date.now() / 1000;
    
    // Update arm swing animation
    boxer.armSwingAnimation += 0.15;
    
    // Update punch animation
    if (boxer.punchAnimation.active) {
      boxer.punchAnimation.progress += 0.08;
      if (boxer.punchAnimation.progress >= 1) {
        boxer.punchAnimation.active = false;
        boxer.punchAnimation.progress = 0;
      }
    }
    
    switch (boxer.state) {
      case 'walking':
        // Walking animation with natural arm swing
        boxer.head.y = -140 + Math.sin(time * 8) * 3;
        boxer.torso.y = -80 + Math.sin(time * 8) * 2;
        
        // Natural arm swing while walking
        boxer.leftArm.x = -30 + Math.sin(boxer.armSwingAnimation + 0.5) * 15;
        boxer.rightArm.x = 30 + Math.sin(boxer.armSwingAnimation) * 15;
        boxer.leftArm.y = -100 + Math.sin(boxer.armSwingAnimation + 0.5) * 8;
        boxer.rightArm.y = -100 + Math.sin(boxer.armSwingAnimation) * 8;
        break;
        
      case 'jabbing':
        // Dynamic jab animation with full arm extension
        boxer.punchAnimation = { active: true, progress: 0, type: 'jab' };
        const jabExtension = Math.sin(boxer.punchAnimation.progress * Math.PI) * 40;
        
        if (boxer.stance === 'orthodox') {
          boxer.leftArm.x = -30 - jabExtension;
          boxer.leftArm.y = -110;
          // Other arm guards
          boxer.rightArm.x = 25;
          boxer.rightArm.y = -120;
        } else {
          boxer.rightArm.x = 30 + jabExtension;
          boxer.rightArm.y = -110;
          boxer.leftArm.x = -25;
          boxer.leftArm.y = -120;
        }
        break;
        
      case 'hooking':
        // Wide hook swing with full body rotation
        boxer.punchAnimation = { active: true, progress: 0, type: 'hook' };
        const hookSwing = Math.sin(boxer.punchAnimation.progress * Math.PI) * 50;
        
        boxer.leftArm.x = -30 - hookSwing;
        boxer.rightArm.x = 30 + hookSwing;
        boxer.leftArm.y = -90;
        boxer.rightArm.y = -90;
        
        // Body rotation for hook
        boxer.torso.x = Math.sin(boxer.punchAnimation.progress * Math.PI) * 10;
        break;
        
      case 'uppercut':
        // Powerful uppercut with body drop and arm extension
        boxer.punchAnimation = { active: true, progress: 0, type: 'uppercut' };
        const upperExtension = Math.sin(boxer.punchAnimation.progress * Math.PI) * 30;
        
        boxer.rightArm.y = -120 - upperExtension;
        boxer.torso.y = -70 + upperExtension * 0.3; // Body rises with punch
        boxer.leftArm.x = -40; // Guard position
        boxer.leftArm.y = -130;
        break;
        
      case 'blocking':
        // Defensive guard with slight arm movement
        const blockSway = Math.sin(time * 6) * 3;
        boxer.leftArm.x = -25 + blockSway;
        boxer.rightArm.x = 25 - blockSway;
        boxer.leftArm.y = -130;
        boxer.rightArm.y = -130;
        break;
        
      case 'hit':
        // Dramatic recoil with arm flailing
        boxer.head.x = Math.sin(time * 20) * 8;
        boxer.torso.x = Math.sin(time * 15) * 6;
        boxer.leftArm.x = -30 + Math.sin(time * 25) * 20;
        boxer.rightArm.x = 30 + Math.sin(time * 22) * 20;
        break;
        
      case 'special':
        // Special attack preparation with dramatic arm positioning
        const specialPower = Math.sin(time * 10) * 15;
        boxer.leftArm.x = -50 + specialPower;
        boxer.rightArm.x = 50 - specialPower;
        boxer.leftArm.y = -120;
        boxer.rightArm.y = -120;
        
        // Energy gathering pose
        boxer.torso.y = -85 + Math.sin(time * 8) * 5;
        break;
        
      case 'knocked-down':
        // Fallen position with gradual movement
        boxer.head.y = -60 + Math.sin(time * 2) * 3; // Slight breathing
        boxer.torso.y = -30;
        boxer.leftArm.x = -40 + Math.sin(time * 3) * 5;
        boxer.rightArm.x = 40 + Math.sin(time * 3.5) * 5;
        boxer.leftArm.y = -40;
        boxer.rightArm.y = -40;
        break;
        
      default:
        // Idle boxing stance with subtle movement
        const idleSway = Math.sin(time * 4) * 2;
        boxer.head = { x: idleSway, y: -140 };
        boxer.torso = { x: idleSway * 0.5, y: -80 };
        
        // Natural guard position with slight movement
        boxer.leftArm = { x: -30 + idleSway, y: -100 + Math.sin(time * 3) * 2 };
        boxer.rightArm = { x: 30 - idleSway, y: -100 + Math.sin(time * 3.5) * 2 };
        boxer.leftLeg = { x: -20, y: -40 };
        boxer.rightLeg = { x: 20, y: -40 };
        break;
    }
  }

  private handlePlayerInput(boxer: Boxer): void {
    if (boxer.state === 'knocked-down' || boxer.knockdownTimer > 0) return;

    // Movement
    if (this.gameState.inputBuffer['KeyA']) {
      boxer.velocity.x = -200;
      boxer.facing = 'left';
      if (boxer.state !== 'jabbing' && boxer.state !== 'hooking' && boxer.state !== 'uppercut') {
        boxer.state = 'walking';
      }
    } else if (this.gameState.inputBuffer['KeyD']) {
      boxer.velocity.x = 200;
      boxer.facing = 'right';
      if (boxer.state !== 'jabbing' && boxer.state !== 'hooking' && boxer.state !== 'uppercut') {
        boxer.state = 'walking';
      }
    } else if (boxer.state === 'walking') {
      boxer.state = 'idle';
    }

    // Blocking
    boxer.blockActive = this.gameState.inputBuffer['KeyR'];
    if (boxer.blockActive) {
      boxer.state = 'blocking';
    }

    // Attacks
    if (this.gameState.inputBuffer['KeyG'] && boxer.attackFrame === 0 && boxer.stamina >= 10) {
      this.performAttack(boxer, 'jab');
    } else if (this.gameState.inputBuffer['KeyH'] && boxer.attackFrame === 0 && boxer.stamina >= 20) {
      this.performAttack(boxer, 'hook');
    } else if (this.gameState.inputBuffer['KeyT'] && boxer.attackFrame === 0 && boxer.stamina >= 30) {
      this.performAttack(boxer, 'uppercut');
    } else if (this.gameState.inputBuffer['KeyY'] && boxer.attackFrame === 0 && boxer.specialMeter >= 50 && boxer.specialCooldown <= 0) {
      this.performSpecialAttack(boxer);
    }
  }

  private handleAI(boxer: Boxer, deltaTime: number): void {
    if (boxer.state === 'knocked-down' || boxer.knockdownTimer > 0) return;

    const player = this.gameState.boxers.find(b => b.id === 'player')!;
    const distance = Math.abs(boxer.position.x - player.position.x);
    
    // Simple AI behavior
    if (Math.random() < 0.003) { // Random chance to act
      if (distance > 150) {
        // Move closer
        boxer.velocity.x = player.position.x > boxer.position.x ? 100 : -100;
        boxer.facing = player.position.x > boxer.position.x ? 'right' : 'left';
        boxer.state = 'walking';
      } else if (distance < 100 && boxer.attackFrame === 0) {
        // Attack
        const attackType = Math.random() < 0.4 ? 'jab' : Math.random() < 0.7 ? 'hook' : 'uppercut';
        this.performAttack(boxer, attackType);
      } else if (Math.random() < 0.2) {
        // Block
        boxer.blockActive = true;
        boxer.state = 'blocking';
      }
    }

    // Use special attack occasionally
    if (boxer.specialMeter >= 80 && Math.random() < 0.001 && distance < 200) {
      this.performSpecialAttack(boxer);
    }
  }

  private performAttack(boxer: Boxer, type: 'jab' | 'hook' | 'uppercut'): void {
    boxer.state = type === 'jab' ? 'jabbing' : type === 'hook' ? 'hooking' : 'uppercut';
    boxer.attackType = type;
    boxer.attackFrame = type === 'jab' ? 15 : type === 'hook' ? 25 : 30;
    
    // Consume stamina
    const staminaCost = type === 'jab' ? 10 : type === 'hook' ? 20 : 30;
    boxer.stamina -= staminaCost;
    
    // Check for hits
    const opponent = this.gameState.boxers.find(b => b.id !== boxer.id)!;
    const attackRange = type === 'jab' ? 100 : type === 'hook' ? 120 : 90;
    const damage = type === 'jab' ? 12 : type === 'hook' ? 18 : 25;
    
    if (this.isInRange(boxer, opponent, attackRange)) {
      this.hitBoxer(opponent, boxer, damage);
    }
  }

  private performSpecialAttack(boxer: Boxer): void {
    boxer.state = 'special';
    boxer.attackType = 'special';
    boxer.attackFrame = 60;
    boxer.specialMeter -= 50;
    boxer.specialCooldown = 3; // 3 second cooldown

    // Create special projectile based on boxer
    const projectileType = this.getSpecialType(boxer.name);
    const projectile: Projectile = {
      id: `projectile_${Date.now()}`,
      position: { 
        x: boxer.position.x + (boxer.facing === 'right' ? boxer.size.x : -40), 
        y: boxer.position.y - 60 
      },
      velocity: { 
        x: boxer.facing === 'right' ? 600 : -600, 
        y: 0 
      },
      size: { x: 40, y: 20 },
      damage: 35,
      owner: boxer.id,
      active: true,
      type: projectileType,
      life: 2.0
    };

    this.gameState.projectiles.push(projectile);
    this.createSpecialEffect(projectile.position, projectileType);
    this.gameState.ringShake = 0.5;
  }

  private getSpecialType(boxerName: string): 'lightning' | 'butterfly' | 'holy-fire' | 'thunder' | 'sugar-rush' | 'grill-slam' {
    const specials: { [key: string]: any } = {
      'mike-tyson': 'lightning',
      'muhammad-ali': 'butterfly',
      'evander-holyfield': 'holy-fire',
      'rocky-balboa': 'thunder',
      'sugar-ray-leonard': 'sugar-rush',
      'george-foreman': 'grill-slam'
    };
    return specials[boxerName] || 'lightning';
  }

  private updateProjectiles(deltaTime: number): void {
    this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
      projectile.position.x += projectile.velocity.x * (deltaTime / 1000);
      projectile.position.y += projectile.velocity.y * (deltaTime / 1000);
      projectile.life -= deltaTime / 1000;

      // Remove if off screen or expired
      if (projectile.position.x < -100 || projectile.position.x > 1300 || projectile.life <= 0) {
        return false;
      }

      return projectile.active;
    });
  }

  private checkCollisions(): void {
    // Boxer vs Projectile collisions
    this.gameState.projectiles.forEach(projectile => {
      this.gameState.boxers.forEach(boxer => {
        if (boxer.id !== projectile.owner && 
            this.checkAABB(projectile.position, projectile.size, boxer.position, boxer.size)) {
          this.hitBoxer(boxer, null, projectile.damage);
          
          // Award coins for successful fireball hit
          const attacker = this.gameState.boxers.find(b => b.id === projectile.owner);
          if (attacker) {
            attacker.coins += 25; // 25 coins per fireball hit
            this.createCoinEffect(projectile.position);
          }
          
          projectile.active = false;
          this.createSpecialEffect(projectile.position, projectile.type);
          this.gameState.ringShake = 0.8;
        }
      });
    });
  }

  private isInRange(attacker: Boxer, target: Boxer, range: number): boolean {
    const distance = Math.abs(attacker.position.x - target.position.x);
    return distance <= range;
  }

  private checkAABB(pos1: Vec2, size1: Vec2, pos2: Vec2, size2: Vec2): boolean {
    return pos1.x < pos2.x + size2.x &&
           pos1.x + size1.x > pos2.x &&
           pos1.y < pos2.y + size2.y &&
           pos1.y + size1.y > pos2.y;
  }

  private hitBoxer(target: Boxer, attacker: Boxer | null, damage: number): void {
    if (target.invulnerable > 0 || target.state === 'knocked-down') return;

    if (target.blockActive && attacker) {
      // Blocking reduces damage
      damage *= 0.4;
      target.velocity.x += attacker.facing === 'right' ? 150 : -150;
      this.createParticleEffect(target.position, 'hit');
    } else {
      target.state = 'hit';
      target.invulnerable = 20;
      
      if (attacker) {
        // Combo system
        const timeSinceLastHit = Date.now() - attacker.lastHit;
        if (timeSinceLastHit < 2000) {
          attacker.comboCount++;
          damage *= (1 + attacker.comboCount * 0.15);
          attacker.specialMeter += 15; // Build special meter with combos
        } else {
          attacker.comboCount = 1;
          attacker.specialMeter += 8;
        }
        attacker.lastHit = Date.now();
        attacker.specialMeter = Math.min(attacker.specialMeter, attacker.maxSpecialMeter);
        
        // Knockback
        target.velocity.x += attacker.facing === 'right' ? 300 : -300;
      }
      
      // Create hit effects
      this.createParticleEffect(target.position, 'hit');
      this.createParticleEffect(target.position, 'sweat');
      this.gameState.crowdNoise = 1.0;
      this.gameState.ringShake = 0.3;
    }

    target.health -= damage;
    target.health = Math.max(0, target.health);

    // Knockdown check
    if (target.health <= 20 && !target.blockActive && Math.random() < 0.3) {
      target.state = 'knocked-down';
      target.knockdownTimer = 4.0; // 4 second knockdown
      this.createParticleEffect(target.position, 'stars');
      this.gameState.ringShake = 1.0;
    }

    if (target.health <= 0) {
      this.endRound();
    }
  }

  private createParticleEffect(position: Vec2, type: 'hit' | 'sweat' | 'fire' | 'lightning' | 'stars'): void {
    const colors = {
      'hit': '#ff6666',
      'sweat': '#87ceeb',
      'fire': '#ff4400',
      'lightning': '#ffff00',
      'stars': '#ffd700'
    };

    for (let i = 0; i < 12; i++) {
      const particle: Particle = {
        id: `particle_${Date.now()}_${i}`,
        position: { x: position.x + Math.random() * 60, y: position.y + Math.random() * 60 - 80 },
        velocity: { 
          x: (Math.random() - 0.5) * 400, 
          y: (Math.random() - 0.5) * 400 - 200 
        },
        life: type === 'stars' ? 1.5 : 0.8,
        maxLife: type === 'stars' ? 1.5 : 0.8,
        color: colors[type],
        size: Math.random() * 8 + 3,
        type
      };
      this.gameState.particles.push(particle);
    }
  }

  private createSpecialEffect(position: Vec2, type: 'lightning' | 'butterfly' | 'holy-fire' | 'thunder' | 'sugar-rush' | 'grill-slam'): void {
    const effectColors = {
      'lightning': '#ffff00',
      'butterfly': '#ff69b4',
      'holy-fire': '#ff4444',
      'thunder': '#8b4513',
      'sugar-rush': '#ff1493',
      'grill-slam': '#cd853f'
    };

    for (let i = 0; i < 20; i++) {
      const particle: Particle = {
        id: `special_${Date.now()}_${i}`,
        position: { x: position.x + Math.random() * 80, y: position.y + Math.random() * 80 },
        velocity: { 
          x: (Math.random() - 0.5) * 600, 
          y: (Math.random() - 0.5) * 600 
        },
        life: 1.2,
        maxLife: 1.2,
        color: effectColors[type],
        size: Math.random() * 12 + 5,
        type: 'fire'
      };
      this.gameState.particles.push(particle);
    }
  }

  private updateParticles(deltaTime: number): void {
    this.gameState.particles = this.gameState.particles.filter(particle => {
      particle.position.x += particle.velocity.x * (deltaTime / 1000);
      particle.position.y += particle.velocity.y * (deltaTime / 1000);
      particle.life -= deltaTime / 1000;
      
      // Apply gravity to some particle types
      if (particle.type === 'hit' || particle.type === 'sweat') {
        particle.velocity.y += 800 * (deltaTime / 1000);
      }
      
      return particle.life > 0;
    });
  }

  private endRound(): void {
    const aliveBoxers = this.gameState.boxers.filter(b => b.health > 0 && b.state !== 'knocked-down');
    
    let roundWinner: Boxer | null = null;
    
    if (aliveBoxers.length === 1) {
      roundWinner = aliveBoxers[0];
      this.gameState.roundWins[roundWinner.id] = (this.gameState.roundWins[roundWinner.id] || 0) + 1;
    } else if (this.gameState.timer <= 0) {
      // Time up - boxer with more health wins
      roundWinner = this.gameState.boxers.reduce((prev, current) => 
        prev.health > current.health ? prev : current
      );
      this.gameState.roundWins[roundWinner.id] = (this.gameState.roundWins[roundWinner.id] || 0) + 1;
    }

    // Award coins for round victory
    if (roundWinner) {
      roundWinner.coins += 50; // 50 coins per round win
      this.createCoinEffect(roundWinner.position);
    }

    // Check if match is over
    const maxWins = Math.ceil(this.gameState.maxRounds / 2);
    const matchWinner = Object.keys(this.gameState.roundWins).find(
      id => this.gameState.roundWins[id] >= maxWins
    );

    if (matchWinner) {
      this.gameState.gameMode = 'victory';
      this.gameState.winner = matchWinner;
      
      // Award trophy and bonus coins to match winner
      const winnerBoxer = this.gameState.boxers.find(b => b.id === matchWinner);
      if (winnerBoxer) {
        winnerBoxer.trophies += 1;
        winnerBoxer.coins += 200; // Bonus coins for match victory
        this.createTrophyEffect(winnerBoxer.position);
      }
    } else {
      // Reset for next round
      this.gameState.round++;
      this.gameState.timer = this.gameState.maxTime;
      this.gameState.boxers.forEach(boxer => {
        boxer.health = boxer.maxHealth;
        boxer.stamina = boxer.maxStamina;
        boxer.specialMeter = 0;
        boxer.state = 'idle';
        boxer.knockdownTimer = 0;
        boxer.position = boxer.id === 'player' ? { x: 200, y: 500 } : { x: 920, y: 500 };
        boxer.velocity = { x: 0, y: 0 };
      });
    }
  }

  private createTrophyEffect(position: Vec2): void {
    // Create golden trophy particles
    for (let i = 0; i < 15; i++) {
      const particle: Particle = {
        id: `trophy_${Date.now()}_${i}`,
        position: { x: position.x + Math.random() * 80, y: position.y + Math.random() * 80 - 120 },
        velocity: { 
          x: (Math.random() - 0.5) * 300, 
          y: -Math.random() * 400 - 200 
        },
        life: 2.0,
        maxLife: 2.0,
        color: '#FFD700', // Gold color
        size: Math.random() * 12 + 8,
        type: 'stars'
      };
      this.gameState.particles.push(particle);
    }
  }

  private createCoinEffect(position: Vec2): void {
    // Create coin collection particles
    for (let i = 0; i < 8; i++) {
      const particle: Particle = {
        id: `coin_${Date.now()}_${i}`,
        position: { x: position.x + Math.random() * 60, y: position.y + Math.random() * 60 - 80 },
        velocity: { 
          x: (Math.random() - 0.5) * 200, 
          y: -Math.random() * 300 - 100 
        },
        life: 1.5,
        maxLife: 1.5,
        color: '#FFA500', // Orange/gold coin color
        size: Math.random() * 8 + 6,
        type: 'hit'
      };
      this.gameState.particles.push(particle);
    }
  }

  private checkVictory(): void {
    // Victory conditions handled in endRound()
  }

  private render(): void {
    // Apply ring shake
    const shakeX = this.gameState.ringShake > 0 ? (Math.random() - 0.5) * this.gameState.ringShake * 20 : 0;
    const shakeY = this.gameState.ringShake > 0 ? (Math.random() - 0.5) * this.gameState.ringShake * 20 : 0;
    
    this.ctx.save();
    this.ctx.translate(shakeX, shakeY);

    // Clear canvas
    this.ctx.fillStyle = '#0f0f23';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw boxing ring
    this.drawBoxingRing();

    // Draw boxers
    this.gameState.boxers.forEach(boxer => this.drawHumanBoxer(boxer));

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

    this.ctx.restore();
  }

  private drawBoxingRing(): void {
    // Ring background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#2a1810');
    gradient.addColorStop(0.7, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f23');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Ring canvas (fighting area)
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(50, 500, 1100, 150);

    // Ring ropes
    for (let i = 0; i < 3; i++) {
      const y = 450 + i * 50;
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(50, y);
      this.ctx.lineTo(1150, y);
      this.ctx.stroke();
    }

    // Corner posts
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(45, 400, 10, 250);
    this.ctx.fillRect(1145, 400, 10, 250);

    // Crowd silhouettes (simplified)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.canvas.width;
      const y = 200 + Math.random() * 200;
      const size = 20 + Math.random() * 20;
      this.ctx.fillRect(x, y, size, size * 1.5);
    }
  }

  private drawHumanBoxer(boxer: Boxer): void {
    this.ctx.save();

    // Flashing effect when invulnerable
    if (boxer.invulnerable > 0 && Math.floor(boxer.invulnerable / 3) % 2) {
      this.ctx.globalAlpha = 0.5;
    }

    const x = boxer.position.x;
    const y = boxer.position.y;

    // Draw human-like boxer
    this.ctx.strokeStyle = boxer.color;
    this.ctx.fillStyle = boxer.color;
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';

    // Head
    this.ctx.beginPath();
    this.ctx.arc(x + boxer.head.x, y + boxer.head.y, 25, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Face details
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(x + boxer.head.x - 8, y + boxer.head.y - 5, 4, 4); // Left eye
    this.ctx.fillRect(x + boxer.head.x + 4, y + boxer.head.y - 5, 4, 4); // Right eye

    // Torso
    this.ctx.strokeStyle = boxer.color;
    this.ctx.beginPath();
    this.ctx.moveTo(x + boxer.torso.x, y + boxer.torso.y - 40);
    this.ctx.lineTo(x + boxer.torso.x, y + boxer.torso.y + 40);
    this.ctx.stroke();

    // Arms
    this.ctx.beginPath();
    // Left arm
    this.ctx.moveTo(x + boxer.torso.x - 10, y + boxer.torso.y - 20);
    this.ctx.lineTo(x + boxer.leftArm.x, y + boxer.leftArm.y);
    this.ctx.lineTo(x + boxer.leftArm.x - 15, y + boxer.leftArm.y + 20);
    this.ctx.stroke();

    // Right arm
    this.ctx.beginPath();
    this.ctx.moveTo(x + boxer.torso.x + 10, y + boxer.torso.y - 20);
    this.ctx.lineTo(x + boxer.rightArm.x, y + boxer.rightArm.y);
    this.ctx.lineTo(x + boxer.rightArm.x + 15, y + boxer.rightArm.y + 20);
    this.ctx.stroke();

    // Boxing gloves
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(x + boxer.leftArm.x - 15, y + boxer.leftArm.y + 20, 12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(x + boxer.rightArm.x + 15, y + boxer.rightArm.y + 20, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Legs
    this.ctx.strokeStyle = boxer.color;
    this.ctx.beginPath();
    // Left leg
    this.ctx.moveTo(x + boxer.torso.x - 5, y + boxer.torso.y + 40);
    this.ctx.lineTo(x + boxer.leftLeg.x, y + boxer.leftLeg.y);
    this.ctx.lineTo(x + boxer.leftLeg.x, y + boxer.leftLeg.y + 80);
    this.ctx.stroke();

    // Right leg
    this.ctx.beginPath();
    this.ctx.moveTo(x + boxer.torso.x + 5, y + boxer.torso.y + 40);
    this.ctx.lineTo(x + boxer.rightLeg.x, y + boxer.rightLeg.y);
    this.ctx.lineTo(x + boxer.rightLeg.x, y + boxer.rightLeg.y + 80);
    this.ctx.stroke();

    // Boxing boots
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x + boxer.leftLeg.x - 8, y + boxer.leftLeg.y + 75, 16, 12);
    this.ctx.fillRect(x + boxer.rightLeg.x - 8, y + boxer.rightLeg.y + 75, 16, 12);

    // Special effects for special moves
    if (boxer.state === 'special') {
      this.ctx.strokeStyle = '#ffff00';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x, y - 80, 60 + Math.sin(Date.now() / 100) * 10, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Knockdown indicator
    if (boxer.state === 'knocked-down') {
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      this.ctx.fillRect(x - 40, y - 160, 80, 160);
      
      // Count display
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(Math.ceil(boxer.knockdownTimer).toString(), x, y - 100);
    }

    this.ctx.restore();
  }

  private drawProjectile(projectile: Projectile): void {
    const colors = {
      'lightning': '#ffff00',
      'butterfly': '#ff69b4',
      'holy-fire': '#ff4444',
      'thunder': '#8b4513',
      'sugar-rush': '#ff1493',
      'grill-slam': '#cd853f'
    };

    this.ctx.save();
    this.ctx.fillStyle = colors[projectile.type];
    this.ctx.fillRect(projectile.position.x, projectile.position.y, 
                     projectile.size.x, projectile.size.y);
    
    // Add glow effect
    this.ctx.shadowColor = colors[projectile.type];
    this.ctx.shadowBlur = 15;
    this.ctx.fillRect(projectile.position.x + 5, projectile.position.y + 3, 
                     projectile.size.x - 10, projectile.size.y - 6);
    this.ctx.restore();
  }

  private drawParticle(particle: Particle): void {
    const alpha = particle.life / particle.maxLife;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = particle.color;
    
    if (particle.type === 'stars') {
      // Draw star shape
      this.drawStar(particle.position.x, particle.position.y, particle.size);
    } else {
      this.ctx.beginPath();
      this.ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private drawStar(x: number, y: number, size: number): void {
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144) * Math.PI / 180;
      const pointX = x + Math.cos(angle) * size;
      const pointY = y + Math.sin(angle) * size;
      if (i === 0) {
        this.ctx.moveTo(pointX, pointY);
      } else {
        this.ctx.lineTo(pointX, pointY);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawHUD(): void {
    // Health bars
    this.drawHealthBar(this.gameState.boxers[0], 50, 50);
    this.drawHealthBar(this.gameState.boxers[1], 750, 50);

    // Stamina bars  
    this.drawStaminaBar(this.gameState.boxers[0], 50, 90);
    this.drawStaminaBar(this.gameState.boxers[1], 750, 90);

    // Special meter
    this.drawSpecialMeter(this.gameState.boxers[0], 50, 110);
    this.drawSpecialMeter(this.gameState.boxers[1], 750, 110);

    // Timer
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    const minutes = Math.floor(this.gameState.timer / 60);
    const seconds = Math.floor(this.gameState.timer % 60);
    this.ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, 
                     this.canvas.width / 2, 40);

    // Round indicator
    this.ctx.font = '18px Arial';
    this.ctx.fillText(`Round ${this.gameState.round}`, this.canvas.width / 2, 65);

    // Combo counters
    this.gameState.boxers.forEach((boxer, index) => {
      if (boxer.comboCount > 1) {
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = index === 0 ? 'left' : 'right';
        this.ctx.fillText(`${boxer.comboCount} HIT COMBO!`, 
                         index === 0 ? 50 : 1150, 150);
      }
    });

    // Round wins, trophies and coins
    const p1Wins = this.gameState.roundWins['player'] || 0;
    const aiWins = this.gameState.roundWins['ai'] || 0;
    const player = this.gameState.boxers[0];
    const ai = this.gameState.boxers[1];
    
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('★'.repeat(p1Wins), 50, 180);
    
    // Player trophies and coins
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`🏆 ${player.trophies}`, 50, 200);
    this.ctx.fillStyle = '#FFA500';
    this.ctx.fillText(`🪙 ${player.coins}`, 50, 220);
    
    // AI trophies and coins
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('★'.repeat(aiWins), 1150, 180);
    
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`🏆 ${ai.trophies}`, 1150, 200);
    this.ctx.fillStyle = '#FFA500';
    this.ctx.fillText(`🪙 ${ai.coins}`, 1150, 220);
  }

  private drawHealthBar(boxer: Boxer, x: number, y: number): void {
    const width = 400;
    const height = 20;
    const healthPercent = boxer.health / boxer.maxHealth;

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
    this.ctx.fillText(boxer.name.toUpperCase(), x, y - 5);
  }

  private drawStaminaBar(boxer: Boxer, x: number, y: number): void {
    const width = 400;
    const height = 8;
    const staminaPercent = boxer.stamina / boxer.maxStamina;

    // Background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x, y, width, height);

    // Stamina
    this.ctx.fillStyle = '#2196f3';
    this.ctx.fillRect(x, y, width * staminaPercent, height);

    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
  }

  private drawSpecialMeter(boxer: Boxer, x: number, y: number): void {
    const width = 400;
    const height = 6;
    const specialPercent = boxer.specialMeter / boxer.maxSpecialMeter;

    // Background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x, y, width, height);

    // Special meter
    this.ctx.fillStyle = specialPercent >= 0.5 ? '#ffff00' : '#ff9800';
    this.ctx.fillRect(x, y, width * specialPercent, height);

    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    // Ready indicator
    if (specialPercent >= 0.5 && boxer.specialCooldown <= 0) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('SPECIAL READY!', x + width + 10, y + 12);
    }
  }

  private drawVictoryScreen(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const winner = this.gameState.boxers.find(b => b.id === this.gameState.winner);
    
    // Victory text
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 64px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${winner?.name.toUpperCase()} WINS!`, 
                     this.canvas.width / 2, this.canvas.height / 2 - 50);

    // Victory description
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '32px Arial';
    this.ctx.fillText(this.gameState.winner === 'player' ? 'VICTORY!' : 'DEFEAT!', 
                     this.canvas.width / 2, this.canvas.height / 2 + 20);

    // Restart instruction
    this.ctx.fillStyle = '#ccc';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press R to restart or ESC to exit', 
                     this.canvas.width / 2, this.canvas.height / 2 + 80);
  }

  public restart(): void {
    this.gameState.gameMode = 'fighting';
    this.gameState.winner = null;
    this.gameState.round = 1;
    this.gameState.roundWins = {};
    this.gameState.timer = this.gameState.maxTime;
    this.gameState.projectiles = [];
    this.gameState.particles = [];
    this.gameState.crowdNoise = 0;
    this.gameState.ringShake = 0;
    
    this.gameState.boxers.forEach(boxer => {
      boxer.health = boxer.maxHealth;
      boxer.stamina = boxer.maxStamina;
      boxer.specialMeter = 0;
      boxer.state = 'idle';
      boxer.comboCount = 0;
      boxer.knockdownTimer = 0;
      boxer.specialCooldown = 0;
      boxer.position = boxer.id === 'player' ? { x: 200, y: 500 } : { x: 920, y: 500 };
      boxer.velocity = { x: 0, y: 0 };
    });
  }
}