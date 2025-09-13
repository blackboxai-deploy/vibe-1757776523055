// Helicopter Combat Game Engine
export interface Vec2 {
  x: number;
  y: number;
}

export interface Helicopter {
  position: Vec2;
  velocity: Vec2;
  size: Vec2;
  health: number;
  maxHealth: number;
  angle: number;
  rotorAngle: number;
}

export interface Enemy {
  id: string;
  position: Vec2;
  velocity: Vec2;
  size: Vec2;
  health: number;
  type: 'fighter' | 'bomber' | 'scout';
  color: string;
  active: boolean;
  pattern: number;
}

export interface Projectile {
  id: string;
  position: Vec2;
  velocity: Vec2;
  size: Vec2;
  damage: number;
  owner: 'player' | 'enemy';
  active: boolean;
  type: 'fireball' | 'bullet';
  trail: Vec2[];
}

export interface GameState {
  helicopter: Helicopter;
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  gameMode: 'playing' | 'game-over';
  score: number;
  coins: number;
  enemiesDestroyed: number;
  level: number;
  inputBuffer: { [key: string]: boolean };
  lastTime: number;
  enemySpawnTimer: number;
  levelTimer: number;
}

export interface Particle {
  id: string;
  position: Vec2;
  velocity: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'explosion' | 'smoke' | 'fire' | 'coin';
}

export class HelicopterEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private animationId: number = 0;
  private onStatsUpdate: (stats: { score: number; coins: number; enemiesDestroyed: number; level: number }) => void;

  constructor(canvas: HTMLCanvasElement, onStatsUpdate: (stats: any) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStatsUpdate = onStatsUpdate;
    
    this.gameState = {
      helicopter: this.createHelicopter(),
      enemies: [],
      projectiles: [],
      particles: [],
      gameMode: 'playing',
      score: 0,
      coins: 0,
      enemiesDestroyed: 0,
      level: 1,
      inputBuffer: {},
      lastTime: 0,
      enemySpawnTimer: 0,
      levelTimer: 0
    };

    this.setupCanvas();
    this.setupInput();
  }

  private setupCanvas(): void {
    this.canvas.width = 1200;
    this.canvas.height = 600;
  }

  private createHelicopter(): Helicopter {
    return {
      position: { x: 100, y: 300 },
      velocity: { x: 0, y: 0 },
      size: { x: 80, y: 40 },
      health: 100,
      maxHealth: 100,
      angle: 0,
      rotorAngle: 0
    };
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
    if (this.gameState.gameMode !== 'playing') return;

    // Update helicopter
    this.updateHelicopter(deltaTime);

    // Handle input
    this.handleInput();

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Update particles
    this.updateParticles(deltaTime);

    // Spawn enemies
    this.spawnEnemies(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Update level progression
    this.updateLevel(deltaTime);

    // Update stats callback
    this.onStatsUpdate({
      score: this.gameState.score,
      coins: this.gameState.coins,
      enemiesDestroyed: this.gameState.enemiesDestroyed,
      level: this.gameState.level
    });
  }

  private updateHelicopter(deltaTime: number): void {
    const heli = this.gameState.helicopter;
    
    // Update rotor animation
    heli.rotorAngle += 0.5;
    
    // Apply physics
    heli.position.x += heli.velocity.x * (deltaTime / 1000);
    heli.position.y += heli.velocity.y * (deltaTime / 1000);
    
    // Boundary constraints
    heli.position.x = Math.max(40, Math.min(this.canvas.width - 40, heli.position.x));
    heli.position.y = Math.max(40, Math.min(this.canvas.height - 40, heli.position.y));
    
    // Apply drag
    heli.velocity.x *= 0.95;
    heli.velocity.y *= 0.95;
    
    // Update angle based on velocity for realistic tilt
    heli.angle = heli.velocity.x * 0.01;
  }

  private handleInput(): void {
    const heli = this.gameState.helicopter;
    const speed = 300;
    
    // Movement controls
    if (this.gameState.inputBuffer['KeyW']) {
      heli.velocity.y -= speed * 0.02;
    }
    if (this.gameState.inputBuffer['KeyS']) {
      heli.velocity.y += speed * 0.02;
    }
    if (this.gameState.inputBuffer['KeyA']) {
      heli.velocity.x -= speed * 0.02;
    }
    if (this.gameState.inputBuffer['KeyD']) {
      heli.velocity.x += speed * 0.02;
    }
    
    // Shooting
    if (this.gameState.inputBuffer['Space']) {
      this.shootFireball();
    }
  }

  private shootFireball(): void {
    // Limit firing rate
    const now = Date.now();
    if (!this.lastFireTime || now - this.lastFireTime > 200) {
      this.lastFireTime = now;
      
      const heli = this.gameState.helicopter;
      const projectile: Projectile = {
        id: `fireball_${now}`,
        position: { 
          x: heli.position.x + heli.size.x, 
          y: heli.position.y 
        },
        velocity: { x: 600, y: 0 },
        size: { x: 20, y: 10 },
        damage: 25,
        owner: 'player',
        active: true,
        type: 'fireball',
        trail: []
      };
      
      this.gameState.projectiles.push(projectile);
      this.createFireEffect(projectile.position);
    }
  }
  
  private lastFireTime: number = 0;

  private updateEnemies(deltaTime: number): void {
    this.gameState.enemies = this.gameState.enemies.filter(enemy => {
      if (!enemy.active) return false;
      
      // Update position based on type
      switch (enemy.type) {
        case 'fighter':
          enemy.velocity.x = -200 - this.gameState.level * 20;
          enemy.velocity.y = Math.sin(enemy.pattern) * 50;
          break;
        case 'bomber':
          enemy.velocity.x = -150 - this.gameState.level * 15;
          enemy.velocity.y = Math.sin(enemy.pattern * 0.5) * 30;
          break;
        case 'scout':
          enemy.velocity.x = -300 - this.gameState.level * 30;
          enemy.velocity.y = Math.sin(enemy.pattern * 2) * 80;
          break;
      }
      
      enemy.position.x += enemy.velocity.x * (deltaTime / 1000);
      enemy.position.y += enemy.velocity.y * (deltaTime / 1000);
      enemy.pattern += deltaTime / 1000;
      
      // Remove enemies that go off screen
      if (enemy.position.x < -100) {
        return false;
      }
      
      // Keep enemies on screen vertically
      if (enemy.position.y < 20) enemy.position.y = 20;
      if (enemy.position.y > this.canvas.height - 20) enemy.position.y = this.canvas.height - 20;
      
      return true;
    });
  }

  private updateProjectiles(deltaTime: number): void {
    this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
      // Update position
      projectile.position.x += projectile.velocity.x * (deltaTime / 1000);
      projectile.position.y += projectile.velocity.y * (deltaTime / 1000);
      
      // Add to trail for fireball effect
      if (projectile.type === 'fireball') {
        projectile.trail.push({ x: projectile.position.x, y: projectile.position.y });
        if (projectile.trail.length > 8) {
          projectile.trail.shift();
        }
      }
      
      // Remove if off screen
      if (projectile.position.x > this.canvas.width + 50 || 
          projectile.position.x < -50 ||
          projectile.position.y > this.canvas.height + 50 ||
          projectile.position.y < -50) {
        return false;
      }
      
      return projectile.active;
    });
  }

  private updateParticles(deltaTime: number): void {
    this.gameState.particles = this.gameState.particles.filter(particle => {
      particle.position.x += particle.velocity.x * (deltaTime / 1000);
      particle.position.y += particle.velocity.y * (deltaTime / 1000);
      particle.life -= deltaTime / 1000;
      
      // Apply gravity to some particles
      if (particle.type === 'explosion' || particle.type === 'coin') {
        particle.velocity.y += 200 * (deltaTime / 1000);
      }
      
      return particle.life > 0;
    });
  }

  private spawnEnemies(deltaTime: number): void {
    this.gameState.enemySpawnTimer += deltaTime;
    
    // Spawn rate increases with level
    const spawnRate = Math.max(1000 - this.gameState.level * 100, 300);
    
    if (this.gameState.enemySpawnTimer > spawnRate) {
      this.gameState.enemySpawnTimer = 0;
      
      const enemyTypes: ('fighter' | 'bomber' | 'scout')[] = ['fighter', 'bomber', 'scout'];
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      
      const enemy: Enemy = {
        id: `enemy_${Date.now()}`,
        position: { 
          x: this.canvas.width + 50, 
          y: 50 + Math.random() * (this.canvas.height - 100) 
        },
        velocity: { x: 0, y: 0 },
        size: type === 'bomber' ? { x: 70, y: 35 } : { x: 50, y: 25 },
        health: type === 'bomber' ? 50 : 25,
        type,
        color: type === 'fighter' ? '#ff4444' : type === 'bomber' ? '#ff8800' : '#44ff44',
        active: true,
        pattern: Math.random() * Math.PI * 2
      };
      
      this.gameState.enemies.push(enemy);
    }
  }

  private checkCollisions(): void {
    // Projectile vs Enemy collisions
    this.gameState.projectiles.forEach(projectile => {
      if (projectile.owner === 'player') {
        this.gameState.enemies.forEach(enemy => {
          if (enemy.active && this.checkAABB(projectile.position, projectile.size, enemy.position, enemy.size)) {
            // Hit enemy
            enemy.health -= projectile.damage;
            projectile.active = false;
            
            this.createExplosionEffect(enemy.position);
            
            if (enemy.health <= 0) {
              // Enemy destroyed - award points and coins
              enemy.active = false;
              this.gameState.score += enemy.type === 'bomber' ? 200 : enemy.type === 'fighter' ? 100 : 50;
              this.gameState.coins += enemy.type === 'bomber' ? 15 : enemy.type === 'fighter' ? 10 : 5;
              this.gameState.enemiesDestroyed++;
              
              // Create coin effect
              this.createCoinEffect(enemy.position);
              this.createBigExplosionEffect(enemy.position);
            }
          }
        });
      }
    });
    
    // Enemy vs Helicopter collisions
    this.gameState.enemies.forEach(enemy => {
      if (enemy.active && this.checkAABB(enemy.position, enemy.size, this.gameState.helicopter.position, this.gameState.helicopter.size)) {
        // Helicopter hit
        this.gameState.helicopter.health -= 20;
        enemy.active = false;
        
        this.createExplosionEffect(this.gameState.helicopter.position);
        
        if (this.gameState.helicopter.health <= 0) {
          this.gameState.gameMode = 'game-over';
        }
      }
    });
  }

  private updateLevel(deltaTime: number): void {
    this.gameState.levelTimer += deltaTime;
    
    // Level up every 30 seconds
    if (this.gameState.levelTimer > 30000) {
      this.gameState.levelTimer = 0;
      this.gameState.level++;
    }
  }

  private checkAABB(pos1: Vec2, size1: Vec2, pos2: Vec2, size2: Vec2): boolean {
    return pos1.x < pos2.x + size2.x &&
           pos1.x + size1.x > pos2.x &&
           pos1.y < pos2.y + size2.y &&
           pos1.y + size1.y > pos2.y;
  }

  private createFireEffect(position: Vec2): void {
    for (let i = 0; i < 5; i++) {
      const particle: Particle = {
        id: `fire_${Date.now()}_${i}`,
        position: { x: position.x, y: position.y },
        velocity: { 
          x: Math.random() * 100 - 50, 
          y: Math.random() * 100 - 50 
        },
        life: 0.3,
        maxLife: 0.3,
        color: '#ff6600',
        size: Math.random() * 4 + 2,
        type: 'fire'
      };
      this.gameState.particles.push(particle);
    }
  }

  private createExplosionEffect(position: Vec2): void {
    for (let i = 0; i < 10; i++) {
      const particle: Particle = {
        id: `explosion_${Date.now()}_${i}`,
        position: { x: position.x, y: position.y },
        velocity: { 
          x: (Math.random() - 0.5) * 400, 
          y: (Math.random() - 0.5) * 400 
        },
        life: 0.8,
        maxLife: 0.8,
        color: i % 2 === 0 ? '#ff4400' : '#ffaa00',
        size: Math.random() * 8 + 4,
        type: 'explosion'
      };
      this.gameState.particles.push(particle);
    }
  }

  private createBigExplosionEffect(position: Vec2): void {
    for (let i = 0; i < 20; i++) {
      const particle: Particle = {
        id: `big_explosion_${Date.now()}_${i}`,
        position: { x: position.x, y: position.y },
        velocity: { 
          x: (Math.random() - 0.5) * 600, 
          y: (Math.random() - 0.5) * 600 
        },
        life: 1.2,
        maxLife: 1.2,
        color: ['#ff0000', '#ff6600', '#ffaa00', '#ffffff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 15 + 8,
        type: 'explosion'
      };
      this.gameState.particles.push(particle);
    }
  }

  private createCoinEffect(position: Vec2): void {
    for (let i = 0; i < 8; i++) {
      const particle: Particle = {
        id: `coin_${Date.now()}_${i}`,
        position: { x: position.x, y: position.y },
        velocity: { 
          x: (Math.random() - 0.5) * 200, 
          y: -Math.random() * 200 - 100 
        },
        life: 1.5,
        maxLife: 1.5,
        color: '#ffd700',
        size: Math.random() * 6 + 4,
        type: 'coin'
      };
      this.gameState.particles.push(particle);
    }
  }

  private render(): void {
    // Clear and draw sky background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#4682b4');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw clouds
    this.drawClouds();
    
    // Draw helicopter
    this.drawHelicopter();
    
    // Draw enemies
    this.gameState.enemies.forEach(enemy => this.drawEnemy(enemy));
    
    // Draw projectiles
    this.gameState.projectiles.forEach(projectile => this.drawProjectile(projectile));
    
    // Draw particles
    this.gameState.particles.forEach(particle => this.drawParticle(particle));
    
    // Draw HUD
    this.drawHUD();
    
    // Draw game over screen
    if (this.gameState.gameMode === 'game-over') {
      this.drawGameOverScreen();
    }
  }

  private drawClouds(): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const time = Date.now() / 2000;
    
    for (let i = 0; i < 8; i++) {
      const x = (i * 200 + time * 30) % (this.canvas.width + 100) - 50;
      const y = 50 + Math.sin(i) * 100;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 30, 0, Math.PI * 2);
      this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
      this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawHelicopter(): void {
    const heli = this.gameState.helicopter;
    
    this.ctx.save();
    this.ctx.translate(heli.position.x, heli.position.y);
    this.ctx.rotate(heli.angle);
    
    // Main body
    this.ctx.fillStyle = '#4a4a4a';
    this.ctx.fillRect(-40, -15, 80, 30);
    
    // Cockpit
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(-35, -10, 50, 20);
    
    // Main rotor (spinning)
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(0, -25, 60, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Tail
    this.ctx.fillStyle = '#4a4a4a';
    this.ctx.fillRect(40, -5, 60, 10);
    
    // Tail rotor
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(100, 0, 20, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Landing skids
    this.ctx.fillStyle = '#666';
    this.ctx.fillRect(-35, 15, 70, 3);
    
    this.ctx.restore();
    
    // Health bar
    this.drawHealthBar(heli.position.x - 40, heli.position.y - 50, heli.health / heli.maxHealth);
  }

  private drawEnemy(enemy: Enemy): void {
    this.ctx.save();
    this.ctx.translate(enemy.position.x, enemy.position.y);
    
    // Enemy aircraft body
    this.ctx.fillStyle = enemy.color;
    
    switch (enemy.type) {
      case 'fighter':
        // Fighter jet shape
        this.ctx.fillRect(-25, -10, 50, 20);
        // Wings
        this.ctx.fillRect(-15, -20, 30, 40);
        break;
      case 'bomber':
        // Larger bomber shape
        this.ctx.fillRect(-35, -15, 70, 30);
        // Engines
        this.ctx.fillRect(-40, -8, 10, 16);
        this.ctx.fillRect(-40, -8, 10, 16);
        break;
      case 'scout':
        // Small fast scout
        this.ctx.fillRect(-20, -8, 40, 16);
        break;
    }
    
    this.ctx.restore();
  }

  private drawProjectile(projectile: Projectile): void {
    if (projectile.type === 'fireball') {
      // Draw fireball trail
      this.ctx.strokeStyle = '#ff4400';
      this.ctx.lineWidth = 6;
      this.ctx.lineCap = 'round';
      
      if (projectile.trail.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
        for (let i = 1; i < projectile.trail.length; i++) {
          this.ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
        }
        this.ctx.stroke();
      }
      
      // Draw fireball
      this.ctx.fillStyle = '#ff6600';
      this.ctx.beginPath();
      this.ctx.arc(projectile.position.x, projectile.position.y, projectile.size.y, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Regular bullet
      this.ctx.fillStyle = '#ffff00';
      this.ctx.fillRect(projectile.position.x, projectile.position.y, projectile.size.x, projectile.size.y);
    }
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

  private drawHealthBar(x: number, y: number, healthPercent: number): void {
    const width = 80;
    const height = 6;
    
    // Background
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    this.ctx.fillRect(x, y, width, height);
    
    // Health
    this.ctx.fillStyle = healthPercent > 0.6 ? '#00ff00' : healthPercent > 0.3 ? '#ffff00' : '#ff0000';
    this.ctx.fillRect(x, y, width * healthPercent, height);
    
    // Border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
  }

  private drawHUD(): void {
    // Score and stats
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.gameState.score}`, 20, 40);
    this.ctx.fillText(`Coins: 🪙 ${this.gameState.coins}`, 20, 70);
    this.ctx.fillText(`Enemies: ${this.gameState.enemiesDestroyed}`, 20, 100);
    this.ctx.fillText(`Level: ${this.gameState.level}`, 20, 130);
    
    // Instructions
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('WASD: Move • SPACE: Fire', this.canvas.width - 20, 30);
  }

  private drawGameOverScreen(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Game Over text
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 64px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('MISSION FAILED', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    // Final stats
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '32px Arial';
    this.ctx.fillText(`Final Score: ${this.gameState.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.fillText(`Coins Earned: 🪙 ${this.gameState.coins}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
    this.ctx.fillText(`Enemies Destroyed: ${this.gameState.enemiesDestroyed}`, this.canvas.width / 2, this.canvas.height / 2 + 100);
    
    // Restart instruction
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillText('Press R to restart mission', this.canvas.width / 2, this.canvas.height / 2 + 150);
  }

  public restart(): void {
    this.gameState = {
      helicopter: this.createHelicopter(),
      enemies: [],
      projectiles: [],
      particles: [],
      gameMode: 'playing',
      score: 0,
      coins: 0,
      enemiesDestroyed: 0,
      level: 1,
      inputBuffer: {},
      lastTime: 0,
      enemySpawnTimer: 0,
      levelTimer: 0
    };
    
    this.lastFireTime = 0;
  }
}