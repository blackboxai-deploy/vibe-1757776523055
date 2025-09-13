// Audio Manager for Fighting Game
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private backgroundMusic: OscillatorNode | null = null;
  private musicInterval: number | null = null;
  private isInitialized = false;
  private currentVolume = 0.3;
  private sfxVolume = 0.5;
  
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      
      // Connect gain nodes
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      
      // Set initial volumes
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.audioContext.currentTime);
      this.musicGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
      
      this.isInitialized = true;
      console.log('Audio system initialized');
      
      // Start background music
      this.startBackgroundMusic();
      
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }
  
  public startBackgroundMusic(): void {
    if (!this.audioContext || !this.musicGain || this.backgroundMusic) return;
    
    this.playFightingTheme();
  }
  
  private playFightingTheme(): void {
    if (!this.audioContext || !this.musicGain) return;
    
    // Create a complex fighting game theme using multiple oscillators
    const playChord = (frequencies: number[], duration: number, delay: number = 0) => {
      setTimeout(() => {
        if (!this.audioContext || !this.musicGain) return;
        
        const oscillators: OscillatorNode[] = [];
        const gains: GainNode[] = [];
        
        frequencies.forEach((freq, index) => {
          const osc = this.audioContext!.createOscillator();
          const gain = this.audioContext!.createGain();
          
          osc.type = index === 0 ? 'sawtooth' : 'square';
          osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
          
          // Volume envelope
          gain.gain.setValueAtTime(0, this.audioContext!.currentTime);
          gain.gain.linearRampToValueAtTime(0.1 / frequencies.length, this.audioContext!.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration - 0.1);
          
          osc.connect(gain);
          gain.connect(this.musicGain!);
          
          osc.start(this.audioContext!.currentTime);
          osc.stop(this.audioContext!.currentTime + duration);
          
          oscillators.push(osc);
          gains.push(gain);
        });
      }, delay);
    };
    
    // Fighting game style chord progression
    const playSequence = () => {
      const tempo = 500; // milliseconds per beat
      
      // Measure 1 - Dm
      playChord([146.83, 174.61, 220.00], 1.5, 0);
      playChord([293.66], 0.3, tempo * 1.5);
      
      // Measure 2 - Bb
      playChord([116.54, 146.83, 174.61], 1.5, tempo * 2);
      playChord([233.08], 0.3, tempo * 3.5);
      
      // Measure 3 - F
      playChord([87.31, 130.81, 174.61], 1.5, tempo * 4);
      playChord([261.63], 0.3, tempo * 5.5);
      
      // Measure 4 - C
      playChord([130.81, 164.81, 196.00], 1.5, tempo * 6);
      playChord([261.63], 0.3, tempo * 7.5);
      
      // Add bass line
      const bassTimes = [0, tempo * 2, tempo * 4, tempo * 6];
      const bassNotes = [73.42, 58.27, 65.41, 65.41]; // D, Bb, F, C
      
      bassTimes.forEach((time, index) => {
        playChord([bassNotes[index]], 1.8, time);
      });
      
      // Add percussion-like rhythm
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          this.playDrumHit();
        }, i * tempo);
      }
    };
    
    // Play the sequence and loop it
    playSequence();
    this.musicInterval = setInterval(playSequence, 4000) as any;
  }
  
  private playDrumHit(): void {
    if (!this.audioContext || !this.musicGain) return;
    
    // Create a kick drum sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.1);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.2);
  }
  
  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
  
  public playPunchSound(): void {
    if (!this.audioContext || !this.sfxGain) return;
    
    // Create punch sound effect
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.15);
  }
  
  public playKickSound(): void {
    if (!this.audioContext || !this.sfxGain) return;
    
    // Create kick sound effect
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.2);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.25);
  }
  
  public playSpecialSound(): void {
    if (!this.audioContext || !this.sfxGain) return;
    
    // Create special move sound effect
    const duration = 0.5;
    
    // Main tone
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, this.audioContext.currentTime);
    osc1.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + duration * 0.3);
    osc1.frequency.linearRampToValueAtTime(330, this.audioContext.currentTime + duration);
    
    gain1.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
    gain1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    
    // Harmony
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(330, this.audioContext.currentTime + 0.1);
    osc2.frequency.linearRampToValueAtTime(660, this.audioContext.currentTime + duration * 0.4);
    osc2.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + duration);
    
    gain2.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain2.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    
    osc1.start(this.audioContext.currentTime);
    osc1.stop(this.audioContext.currentTime + duration);
    
    osc2.start(this.audioContext.currentTime + 0.1);
    osc2.stop(this.audioContext.currentTime + duration);
  }
  
  public playHitSound(): void {
    if (!this.audioContext || !this.sfxGain) return;
    
    // Create hit sound effect
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.Q.setValueAtTime(5, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.12);
  }
  
  public playBlockSound(): void {
    if (!this.audioContext || !this.sfxGain) return;
    
    // Create block sound effect
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.08);
  }
  
  public playVictorySound(): void {
    if (!this.audioContext || !this.sfxGain) return;
    
    // Create victory fanfare
    const playNote = (freq: number, delay: number, duration: number = 0.3) => {
      setTimeout(() => {
        if (!this.audioContext || !this.sfxGain) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
      }, delay);
    };
    
    // Victory melody: C-E-G-C
    playNote(261.63, 0);     // C
    playNote(329.63, 150);   // E
    playNote(392.00, 300);   // G
    playNote(523.25, 450, 0.6); // High C
  }
  
  public setMasterVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.audioContext!.currentTime);
    }
  }
  
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioContext!.currentTime);
    }
  }
  
  public getMasterVolume(): number {
    return this.currentVolume;
  }
  
  public getSFXVolume(): number {
    return this.sfxVolume;
  }
  
  public cleanup(): void {
    this.stopBackgroundMusic();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}