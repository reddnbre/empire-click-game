class EmpireClickGame {
    constructor() {
        this.world = document.getElementById('world');
        this.player = null;
        this.playerPos = { x: 500, y: 500 };
        this.revCoins = 1000;
        this.premiumCoins = 50;
        this.premiumRevCoins = 0; // Start with 0 PRC
        this.earnings = 0;
        this.withdrawalBalance = 0;
        this.earningsPerSecond = 0;
        this.baseEarningsPerSecond = 0.00000001;
        this.plotsClaimed = 0;
        this.plots = [];
        this.keys = {};
        this.camera = { x: 0, y: 0, rotation: 0 };
        this.plotToClaim = null;
        this.plotToExplore = null;
        this.pendingRarity = null;
        this.currentExplorationsLeft = 3;
        this.plotExplorations = new Map();
        this.playerName = "ChuckWells";
        this.isAdmin = true; // Set to false for regular players
        
        // Region variables - shared global stats, separate plot grids
        this.currentRegion = "Default";
        this.regions = ["Default"];
        this.regionData = {};
        this.regionData["Default"] = {
            plots: []  // Only store plots per region, everything else is global
        };
        this.regionsOwned = 1;
        
        // Zoom variables
        this.zoomLevel = 1.2;
        this.minZoomDistance = 0.3;
        this.maxZoomDistance = 2.5;
        
        // Navigation variables
        this.cameraPanning = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.cameraTarget = { x: 0, y: 0, z: 0 };
        
        // Find System variables
        this.finds = 3;
        
        // Boost System variables
        this.boostSecondsRemaining = 0;
        this.maxBoostSeconds = 18000;
        
        // Lucky Draw System variables
        this.lastDrawReset = Date.now();
        this.drawsUsed = 0;
        
        // Land Property Tax System variables
        this.taxBoostTime = 0;
        
        // Wealth Tax System variables
        this.wealthTaxBypassTime = 0;
        this.wealthTaxBypassDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        // Plot Takeover System variables
        this.expiredPlots = []; // Empty for testing - no abandoned plots on startup
        this.takeoverCost = 125; // Premium RevCoins per plot
        
        // Background Music System variables
        this.backgroundMusic = null;
        this.musicEnabled = false; // Start disabled due to autoplay restrictions
        this.musicVolume = 0.3; // Default volume 30%
        
        // Event System variables
        this.eventsList = [
            "Lucky Surge",
            "Land Takeover Madness",
            "Audit Infraction",
            "Kings Festival"
        ];
        this.activeEvent = null;
        this.eventTimer = 0;
        this.eventDuration = 14400;
        this.auditInfractionActive = false;
        this.auditWarningTimer = 600;
        this.auditFineActive = false;
        this.auditFineAdsWatched = 0;
        this.auditFineRequired = 3;
        
        // Property Tax System variables
        this.propertyTaxAdsWatched = 0;
        
        // King's Draw variables
        this.kingsDrawEntries = 0;
        this.kingsDrawPool = 0;
        this.drawCountdown = 7 * 24 * 60 * 60; // 7 days in seconds
        this.lastDrawTime = Date.now();
        this.nextDrawTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
        this.kingsDrawEnabled = true;
        this.drawWinners = []; // Store recent winners
        this.totalDrawsCompleted = 0;
        
        // Tax and Takeover variables
        this.taxStatus = "Active";
        this.personalTaxInterval = 6 * 60 * 60 * 1000;
        this.lastTaxPaid = Date.now();
        this.ownedPlots = [];
        this.treasuryPool = 0;
        
        this.rarities = ["Common", "Rare", "Epic", "Legendary", "Elite"];
        this.rarityRates = {
            Common: 0.00000001,
            Rare: 0.00000003,
            Epic: 0.00000005,
            Legendary: 0.0000001,
            Elite: 0.0000005
        };
        
        this.rarityChances = {
            Common: 0.60,
            Rare: 0.25,
            Epic: 0.10,
            Legendary: 0.04,
            Elite: 0.01
        };
        
        // Daily login system
        this.lastLoginDate = null;
        this.loginStreak = 0;
        this.dailyLoginBonus = 1.0;
        this.dailyLoginChecked = false;
        this.dailyLoginAvailable = true;
        this.dailyLoginRewards = [
            { chance: 0.30, bonus: 0.05, name: "Small Bonus (+5%)", type: "earnings" },
            { chance: 0.25, bonus: 0.10, name: "Medium Bonus (+10%)", type: "earnings" },
            { chance: 0.20, bonus: 0.20, name: "Large Bonus (+20%)", type: "earnings" },
            { chance: 0.15, bonus: 5, name: "Boost Time (+5 min)", type: "boost" },
            { chance: 0.07, bonus: 0.50, name: "Huge Bonus (+50%)", type: "earnings" },
            { chance: 0.02, bonus: 15, name: "Big Boost (+15 min)", type: "boost" },
            { chance: 0.01, bonus: 1.00, name: "Mega Bonus (+100%)", type: "earnings" }
        ];
        
        // Land Property Tax efficiency
        this.wealthTaxEfficiency = 1.0;
        this.taxBoostActive = false;
        
        // Offline earnings system
        this.lastActiveTime = Date.now();
        this.offlineEarnings = 0;
        this.isOffline = false;
        this.offlineStartTime = null;
        this.offlineThreshold = 30 * 1000; // 30 seconds for testing
        
        // Achievement System
        this.achievementPoints = 0;
        this.achievements = [
            { id: "first_plot", name: "First Plot", description: "Claim your first plot", icon: "🏠", points: 10, completed: false },
            { id: "knight_rank", name: "Knight", description: "Reach Knight rank", icon: "⚔️", points: 50, completed: false },
            { id: "lord_rank", name: "Lord/Nobleman", description: "Reach Lord/Nobleman rank", icon: "👑", points: 100, completed: false },
            { id: "king_rank", name: "King/Queen", description: "Reach King/Queen rank", icon: "👑", points: 200, completed: false },
            { id: "ten_plots", name: "Landowner", description: "Own 10 plots", icon: "🏘️", points: 25, completed: false },
            { id: "fifty_plots", name: "Baron", description: "Own 50 plots", icon: "🏰", points: 75, completed: false },
            { id: "hundred_plots", name: "Emperor", description: "Own 100 plots", icon: "🏛️", points: 150, completed: false }
        ];
        
        // ======================= SPRITES (BASE vs REGION SAFE) =======================
        // SPRITE_VARIANTS moved to index.html for simple DOM rendering

        // Old Three.js sprite system completely removed - using simple DOM images in HTML now

        // Old renderBasePlotSprite function removed - sprites now handled in HTML

        // Old renderRegionPlotSprite function removed - sprites now handled in HTML

        // Old sprite utility functions removed - sprites now handled in HTML

        // Sprite functions removed - using simple DOM images now
        
        // Texture preloading removed - using simple DOM images now
        // ===================== END SPRITES (SEPARATE SCOPES) =====================
        
        this.init();
    }
    
    init() {
        console.log('Game initialization started...');
        
        // Check mobile orientation
        this.checkMobileOrientation();
        
        // Three.js scene removed - using simple DOM images now
        
        this.createWorld();
        this.createPlayer();
        this.setupControls();
        
        // Initialize comprehensive PRC Store (includes King's Draw)
        setTimeout(() => {
            if (this.createPRCStore) {
                this.createPRCStore();
            }
        }, 1000);
        this.gameLoop();
        this.startEarnings();
        this.initTakeoverPlots();
        this.startTaxCycle();
        this.startKingsDrawCountdown();
        this.updateRegionUI();
        this.updateFindsUI();
        this.updateFindsAvailableDisplay(); // Initialize finds available display
        this.updateBoostUI();
        this.updateDrawsUI();
        this.updateCurrencyDisplay();
        this.updateRegionDisplay();
        // Region management moved to admin panel
        this.updateGlobalPlotCount();
        this.updateEarningsDisplay();
        this.updateLoginUI();
        this.checkAchievements();
        this.initializeExpiredPlots();
        this.updateTakeoverDisplay();
        this.updateEventDisplay(); // Initialize event display
        
        // Background music system
        this.initBackgroundMusic();
        
        // Sprite textures preloaded by rescue patch
        
        // Test navigation functions are accessible
        console.log('Testing navigation functions...');
        console.log('navigateToQuadrant function:', typeof this.navigateToQuadrant);
        console.log('toggleRegion function:', typeof this.toggleRegion);
        console.log('applyRegionEffects function:', typeof this.applyRegionEffects);
        
        // Test if navigation buttons exist
        const navButtons = document.querySelectorAll('.nav-quadrants button');
        console.log('Navigation buttons found:', navButtons.length);
        navButtons.forEach((btn, index) => {
            console.log(`Button ${index}:`, btn.textContent, btn.onclick);
        });
        
        // Test if region display exists
        const regionDisplay = document.getElementById('currentRegionDisplay');
        console.log('Region display element:', regionDisplay);
        
        // Boost interval
        setInterval(() => {
            if (this.boostSecondsRemaining > 0) {
                this.boostSecondsRemaining--;
                this.updateBoostUI();
            }
        }, 1000);
        
        // Land Property Tax interval
        setInterval(() => {
            if (this.taxBoostTime > 0) {
                this.taxBoostTime--;
                this.updateUI();
            }
        }, 1000);
        
        // Event timer interval - now handled by new patch system
        setInterval(() => this.handleEventTimers(), 1000);
        
        // Start an event immediately when game loads (so players see events right away)
        setTimeout(() => {
            if (!this.activeEvent) {
                this.startRandomEvent();
            }
        }, 5000); // Start first event after 5 seconds
        
        // Start earnings interval
        setInterval(() => {
            this.startEarnings();
        }, 1000);
        
        console.log('Game initialization completed!');
        
        // Initialize economy monitoring for admin panel
        this.initAdminEconomyMonitoring();
    }
    
    // Three.js scene initialization removed - using simple DOM images now
    
    // Three.js render loop removed - using simple DOM images now
    
    createWorld() {
        console.log('Creating world...');
        // Initialize the default region world
        this.createRegionWorld("Default");
        this.createRoads();
        
        // Add click handler to world to hide plot info panel when clicking elsewhere
        this.world.addEventListener('click', (e) => {
            if (!e.target.closest('.plot')) {
                this.hidePlotInfoPanel();
            }
        });
        
        console.log('World creation completed');
    }
    
    createRegionWorld(regionName) {
        console.log(`Creating world for region: ${regionName}`);
        
        if (!this.regionData[regionName]) {
            console.error(`Region data not found for: ${regionName}`);
            return;
        }
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const plotWidth = Math.max(20, viewportWidth / 25);
        const plotHeight = Math.max(20, viewportHeight / 20);
        
        console.log(`Viewport: ${viewportWidth}x${viewportHeight}, Plot size: ${plotWidth}x${plotHeight}`);
        console.log(`World element:`, this.world);
        
        // Clear existing plots for this region
        this.regionData[regionName].plots = [];
        
        // Create 500 plots (25x20 grid) for this region
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 25; col++) {
                const x = col * plotWidth;
                const y = row * plotHeight;
                const plotIndex = row * 25 + col;
                
                const plot = this.createPlot(x, y, plotWidth, plotHeight, plotIndex, regionName);
                
                // Add to region's plot array
                this.regionData[regionName].plots.push({
                    element: plot,
                    x, y, width: plotWidth, height: plotHeight,
                    index: plotIndex,
                    claimed: false,
                    owner: "",
                    rarity: null,
                    name: `Plot ${plotIndex + 1}`,
                    exploresLeft: 3,
                    region: regionName
                });
                
                // Only append to DOM if this is the current region
                if (regionName === this.currentRegion) {
                    this.world.appendChild(plot);
                    if (plotIndex === 0) {
                        console.log(`First plot added to DOM:`, plot);
                        console.log(`Plot position: ${x}, ${y}, size: ${plotWidth}x${plotHeight}`);
                    }
                }
            }
        }
        
        // Update global plots array for backward compatibility
        if (regionName === this.currentRegion) {
            this.plots = this.regionData[regionName].plots;
        }
        
        console.log(`Created ${this.regionData[regionName].plots.length} plots for region: ${regionName}`);
        console.log(`Plots in DOM:`, this.world.children.length);
    }
    
    createPlot(x, y, width, height, index, regionName = "Default") {
        const plot = document.createElement('div');
        plot.className = 'plot';
        plot.style.left = x + 'px';
        plot.style.top = y + 'px';
        plot.style.width = width + 'px';
        plot.style.height = height + 'px';
        plot.style.position = 'absolute';
        plot.style.zIndex = '10';
        plot.style.minWidth = '20px';
        plot.style.minHeight = '20px';
        
        // Add visible content to ensure plot is rendered
        const plotContent = document.createElement('div');
        plotContent.className = 'plot-content';
        plotContent.innerHTML = `${index + 1}`;
        plot.appendChild(plotContent);
        
        // Keep tooltip for hover information
        const tooltip = document.createElement('div');
        tooltip.className = 'plot-tooltip';
        tooltip.innerHTML = `
            <strong>Plot ${index + 1}</strong><br>
            Status: Unclaimed<br>
            Rarity: Unknown<br>
            Earnings: 0/sec<br>
            Explorations: 3 left
        `;
        plot.appendChild(tooltip);
        
        plot.addEventListener('click', () => this.handlePlotClick(plot, index));
        
        return plot;
    }
    
    hidePlotInfoPanel() {
        // Use the new polished plot info system
        if (typeof window.hidePlotInfo === 'function') {
            window.hidePlotInfo();
        } else {
            // Fallback to old system
            const plotInfoPanel = document.getElementById("plotInfoPanel");
            if (plotInfoPanel) {
                plotInfoPanel.style.display = "none";
            }
        }
    }
    
    handlePlotClick(plotElement, plotIndex) {
        this.updateActivity(); // Update activity when clicking plots
        
        const plot = this.plots[plotIndex];
        
        if (plot.claimed) {
            // Show plot info panel for claimed plots
            const plotName = plot.name || this.generatePlotName();
            // Use the new polished plot info system
            if (typeof window.showPlotInfo === 'function') {
                window.showPlotInfo({
                    name: plotName,
                    owner: plot.owner,
                    rarity: plot.rarity
                });
            } else {
                // Fallback to old system
                const plotNameLabel = document.getElementById("plotNameLabel");
                const plotOwnerLabel = document.getElementById("plotOwnerLabel");
                const plotRarityLabel = document.getElementById("plotRarityLabel");
                const plotInfoPanel = document.getElementById("plotInfoPanel");
                
                if (plotNameLabel) plotNameLabel.textContent = plotName;
                if (plotOwnerLabel) plotOwnerLabel.textContent = plot.owner;
                if (plotRarityLabel) {
                    plotRarityLabel.textContent = plot.rarity;
                    plotRarityLabel.style.color = this.getRarityColor(plot.rarity);
                }
                if (plotInfoPanel) plotInfoPanel.style.display = "block";
            }
            
            if (plot.owner === this.playerName) {
                this.showExplorationModal(plot);
            } else {
                alert(`This plot is already claimed by ${plot.owner}`);
            }
        } else if (!plot.claimed) {
            this.showClaimModal(plot);
        }
    }
    
    showClaimModal(plot) {
        this.plotToClaim = plot;
        this.pendingRarity = null;
        
        const confirmed = confirm(`Do you want to purchase this plot? The rarity will be revealed upon purchase!`);
        if (confirmed) {
            this.confirmClaimPlot();
        }
    }
    
    confirmClaimPlot() {
        if (!this.plotToClaim) return;
        
        const rarity = this.getRandomRarity();
        this.pendingRarity = rarity;
        
        let cost = rarity === "Elite" ? 1000 : 100;
        
        if (rarity === "Elite") {
            if (this.premiumCoins < cost) {
                alert(`You don\'t have enough Premium RevCoins to claim this ${rarity} plot.`);
                return;
            }
            this.premiumCoins -= cost;
        } else {
            if (this.revCoins < cost) {
                alert(`You don\'t have enough RevCoins to claim this ${rarity} plot.`);
                return;
            }
            this.revCoins -= cost;
        }
        
        // Add earnings to global total (shared across all regions)
        this.earnings += this.rarityRates[rarity];
        
        this.plotToClaim.claimed = true;
        this.plotToClaim.owner = this.playerName;
        this.plotToClaim.rarity = rarity;
        this.plotToClaim.element.classList.add('claimed', rarity);
        
        // Update global plot count across all regions
        this.plotsClaimed++;
        this.updateGlobalPlotCount(); // Ensure accuracy
        
        // Store plot name for info panel
        this.plotToClaim.name = this.generatePlotName();
        
        // Content will be handled by sprite system - no DOM buildings needed
        
        const tooltip = this.plotToClaim.element.querySelector('.plot-tooltip');
        const buildingType = this.getBuildingName(rarity);
        const earnings = this.rarityRates[rarity];
        tooltip.innerHTML = `
            <strong>${this.generatePlotName()}</strong><br>
            Building: ${buildingType}<br>
            Rarity: ${rarity}<br>
            Owner: ${this.playerName}<br>
            Earnings: ${earnings.toFixed(8)}/sec<br>
            Explorations: 3 left
        `;
        
        this.plotsClaimed++;
        this.checkAchievements();
        this.updateUI();
        
        // Render sprite on the claimed plot
        try {
            console.log('=== SPRITE RENDERING ===');
            console.log('Rendering sprite for rarity:', rarity);
            
            // Calculate plot position for Three.js coordinates
            const row = Math.floor(this.plotToClaim.index / 25);
            const col = this.plotToClaim.index % 25;
            
            // Set plot coordinates for sprite system
            this.plotToClaim.x = col;
            this.plotToClaim.z = row;
            this.plotToClaim.y = 0;
            
            // Render the 3D model on the plot
            window.renderModelOnPlot(this.plotToClaim.element, rarity);
            console.log(`Sprite rendered for ${rarity} plot at (${col}, ${row})`);
            
            // Update plot info panel
            const plotName = this.generatePlotName();
            const plotNameLabel = document.getElementById("plotNameLabel");
            const plotOwnerLabel = document.getElementById("plotOwnerLabel");
            const plotRarityLabel = document.getElementById("plotRarityLabel");
            const plotInfoPanel = document.getElementById("plotInfoPanel");
            
            if (plotNameLabel) plotNameLabel.textContent = plotName;
            if (plotOwnerLabel) plotOwnerLabel.textContent = this.playerName;
            if (plotRarityLabel) {
                plotRarityLabel.textContent = rarity;
                plotRarityLabel.style.color = this.getRarityColor(rarity);
            }
            if (plotInfoPanel) plotInfoPanel.style.display = "block";
        } catch (error) {
            console.error('Error rendering sprite:', error);
            console.error('Error stack:', error.stack);
        }
        
        const buildingName = this.getBuildingName(rarity);
        alert(`🏗️ You successfully claimed a ${rarity} plot and built a ${buildingName}!`);
    }
    
    showExplorationModal(plot) {
        this.plotToExplore = plot;
        
        const confirmed = confirm(`
            Explore ${plot.name}?
            Rarity: ${plot.rarity}
            Current Earnings: ${this.rarityRates[plot.rarity].toFixed(8)}/sec
            Success Rate: ${this.getSuccessRate(plot.rarity)}%
            Explorations left: ${this.finds}
        `);
        
        if (confirmed) {
            this.explorePlot();
        }
    }
    
    explorePlot() {
        if (!this.plotToExplore || this.finds <= 0) {
            alert("No explorations left for this plot.");
            return;
        }
        
        this.finds--;
        
        let reward = 0;
        const roll = Math.random();
        
        if (roll < 0.05) reward = 3;
        else if (roll < 0.20) reward = 2;
        else if (roll < 0.50) reward = 1;
        

        
        if (reward > 0) {
            const explorationBonus = reward * 0.00000001;
            this.earnings += explorationBonus;
            this.withdrawalBalance += explorationBonus;
        }
        
        this.revCoins += reward;
        
        if (reward > 0) {
            alert(`✨ You explored and found ${reward} RevCoin(s)!`);
        } else {
            alert(`❌ You explored but found nothing this time.`);
        }
        
        this.updateUI();
    }
    
    generatePlotName() {
        const directions = ["North", "East", "South", "West", "Upper", "Lower", "New", "Old", "High", "Grand"];
        const prefixes = ["Iron", "Ash", "Fire", "Storm", "Crystal", "Moon", "Sun", "Frost", "Obsidian", "Gold"];
        const cities = ["vale", "stead", "shire", "hold", "keep", "dale", "ridge", "march", "watch", "haven"];
        const suffixes = ["burg", "town", "bay", "harbor", "bluff", "peak", "mount", "depths", "flats", "cavern"];
        
        const d = directions[Math.floor(Math.random() * directions.length)];
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const c = cities[Math.floor(Math.random() * cities.length)];
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return `${d}${p}${c}${s}`;
    }

    getBuildingName(rarity) {
        const buildings = {
            Common: "Cottage",
            Rare: "Village House", 
            Epic: "Stone Fort",
            Legendary: "Castle",
            Elite: "Cathedral"
        };
        return buildings[rarity] || "Building";
    }

    getSuccessRate(rarity) {
        const successChances = {
            Common: 50,
            Rare: 55,
            Epic: 60,
            Legendary: 70,
            Elite: 65
        };
        return successChances[rarity] || 50;
    }
    
    createRoads() {
        const roads = [];
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const plotWidth = viewportWidth / 25;
        const plotHeight = viewportHeight / 20;
        
        for (let row = 0; row < 19; row++) {
            for (let col = 0; col < 25; col++) {
                roads.push({
                    x: col * plotWidth,
                    y: (row + 1) * plotHeight - 2,
                    width: plotWidth,
                    height: 4
                });
            }
        }
        
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 24; col++) {
                roads.push({
                    x: (col + 1) * plotWidth - 2,
                    y: row * plotHeight,
                    width: 4,
                    height: plotHeight
                });
            }
        }
        
        roads.forEach(roadConfig => {
            const road = document.createElement('div');
            road.className = 'road';
            road.style.left = roadConfig.x + 'px';
            road.style.top = roadConfig.y + 'px';
            road.style.width = roadConfig.width + 'px';
            road.style.height = roadConfig.height + 'px';
            this.world.appendChild(road);
        });
    }
    
    createPlayer() {
        this.player = document.createElement('div');
        this.player.className = 'player';
        this.player.style.left = this.playerPos.x + 'px';
        this.player.style.top = this.playerPos.y + 'px';
        this.world.appendChild(this.player);
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.updateActivity(); // Update activity on key press
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.addEventListener('mousedown', (e) => {
            this.updateActivity(); // Update activity on mouse click
            if (e.button === 1) {
                this.cameraPanning = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 1) {
                this.cameraPanning = false;
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.cameraPanning && e.buttons === 2) {
                const deltaX = e.clientX - this.lastMousePos.x;
                const deltaY = e.clientY - this.lastMousePos.y;
                
                this.cameraTarget.x -= deltaX * 0.5;
                this.cameraTarget.z += deltaY * 0.5;
                
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.updateCamera();
                this.updateActivity(); // Update activity on camera pan
            }
        });
    }
    
    gameLoop() {
        this.handleMovement();
        this.updateUI();
        this.checkOfflineEarnings();
        this.updateEventDisplay(); // Update event display every frame
        this.updateKingsDrawCountdown(); // Update King's Draw countdown
        this.updatePRCStoreDisplay(); // Update PRC Store display
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    handleMovement() {
        const speed = 3;
        let moved = false;
        
        if (this.keys['w'] || this.keys['arrowup']) {
            this.playerPos.y -= speed;
            moved = true;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.playerPos.y += speed;
            moved = true;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.playerPos.x -= speed;
            moved = true;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.playerPos.x += speed;
            moved = true;
        }
        
        this.playerPos.x = Math.max(50, Math.min(1950, this.playerPos.x));
        this.playerPos.y = Math.max(50, Math.min(1950, this.playerPos.y));
        
        if (moved) {
            this.player.style.left = this.playerPos.x + 'px';
            this.player.style.top = this.playerPos.y + 'px';
            this.player.classList.add('moving');
            
            setTimeout(() => {
                this.player.classList.remove('moving');
            }, 300);
            
            this.updateCamera();
            this.updateActivity(); // Update activity when player moves
        }
    }
    
    updateCamera() {
        const offsetX = -this.playerPos.x + window.innerWidth / 2 + this.cameraTarget.x;
        const offsetY = -this.playerPos.y + window.innerHeight / 2 + this.cameraTarget.z;
        
        this.world.style.transform = `
            rotateX(45deg) 
            rotateZ(${this.camera.rotation}deg)
            translateZ(-200px) 
            scale(${this.zoomLevel})
            translate(${offsetX}px, ${offsetY}px)
        `;
    }
    
    updateUI() {
        const revCoinsEl = document.getElementById('revCoinsDisplay');
        const perSecondEl = document.getElementById('perSecondDisplay');
        const totalEarnedEl = document.getElementById('totalEarnedDisplay');
        const plotsOwnedEl = document.getElementById('plotsOwnedDisplay');
        const findsEl = document.getElementById('findsDisplay');
        const boostEl = document.getElementById('boostDisplay');
        const drawsEl = document.getElementById('drawsDisplay');
        const premiumRevCoinsEl = document.getElementById('premiumRevCoinsDisplay');
        
        if (revCoinsEl) revCoinsEl.textContent = Math.floor(this.revCoins);
        if (perSecondEl) perSecondEl.textContent = this.earningsPerSecond.toFixed(8);
        if (totalEarnedEl) totalEarnedEl.textContent = this.earnings.toFixed(8);
        if (plotsOwnedEl) plotsOwnedEl.textContent = this.plotsClaimed;
        if (findsEl) findsEl.textContent = this.finds;
        if (boostEl) boostEl.textContent = this.boostSecondsRemaining + 's';
        if (drawsEl) drawsEl.textContent = this.drawsUsed;
        if (premiumRevCoinsEl) premiumRevCoinsEl.textContent = this.premiumRevCoins;
        
        this.updateEarningsDisplay();
        this.updateDrawsUI();
        this.updateWealthTaxDisplay();
        this.updateTakeoverDisplay();
        this.updateTakeoverBanner();
    }
    

    
    getRarityColor(rarity) {
        const colors = {
            Common: '#8B4513',
            Rare: '#4169E1',
            Epic: '#9932CC',
            Legendary: '#FFD700',
            Elite: '#FF4500'
        };
        return colors[rarity] || '#666';
    }
    
    navigateToPlot(plotIndex) {
        const plot = this.plots[plotIndex];
        if (plot) {
            // Center the view on the selected plot
            const plotWidth = window.innerWidth / 25;
            const plotHeight = window.innerHeight / 20;
            const row = Math.floor(plotIndex / 25);
            const col = plotIndex % 25;
            
            const targetX = col * plotWidth;
            const targetY = row * plotHeight;
            
            // Smooth scroll to the plot
            window.scrollTo({
                left: targetX - window.innerWidth / 2,
                top: targetY - window.innerHeight / 2,
                behavior: 'smooth'
            });
        }
    }
    
    startEarnings() {
        if (this.auditFineActive) return;
        
        this.checkDailyLogin();
        
        // Calculate earnings from ALL regions, not just current region
        let totalEarnings = 0;
        
        this.regions.forEach(regionName => {
            if (this.regionData[regionName] && this.regionData[regionName].plots) {
                const ownedPlots = this.regionData[regionName].plots.filter(p => p.claimed && p.owner === this.playerName);
        ownedPlots.forEach(plot => {
            if (plot.rarity && this.rarityRates[plot.rarity]) {
                totalEarnings += this.rarityRates[plot.rarity];
                    }
                });
            }
        });
        
        let multiplier = 1.0;
        multiplier *= this.dailyLoginBonus;
        
        this.wealthTaxEfficiency = this.getEfficiencyMultiplier();
        if (!this.taxBoostActive) {
            multiplier *= this.wealthTaxEfficiency;
        }
        
        if (this.boostSecondsRemaining > 0) {
            multiplier *= 2.0;
        }
        
        // Apply event multipliers
        if (this.activeEvent === 'Lucky Surge') {
            multiplier *= 1.5; // +50% earnings from all plots
        } else if (this.activeEvent === 'Kings Festival') {
            multiplier *= 2.0; // 2x earnings on all plots
        }
        
        this.baseEarningsPerSecond = totalEarnings;
        this.earningsPerSecond = this.baseEarningsPerSecond * multiplier;
        
        if (this.isOffline) {
            this.earningsPerSecond *= 0.5;
        }
        
        this.earnings += this.earningsPerSecond;
        this.withdrawalBalance += this.earningsPerSecond;
        
        this.updateEarningsDisplay();
        this.updateEventDisplay(); // Update event display when earnings change
    }
    
    boostEarnings() {
        if (this.boostSecondsRemaining > 0) {
            alert('Boost is already active!');
            return;
        }
        
        if (this.premiumCoins < 10) {
            alert('You need 10 Premium RevCoins to activate boost!');
            return;
        }
        
        // Activate 5-hour (18000 second) boost
        this.premiumCoins -= 10;
        this.boostSecondsRemaining = 18000; // 5 hours
        
        this.updateCurrencyDisplay();
        this.updateBoostUI();
        
        console.log('Earnings boost activated for 5 hours!');
        alert('🚀 Earnings boost activated! 2x earnings for 5 hours!');
    }
    
    // ===================== MISSING BUTTON FUNCTIONS =====================
    // TODO: Implement these functions based on your specifications

    getRandomRarity() {
        const roll = Math.random();
        let cumulative = 0;
        
        for (const [rarity, chance] of Object.entries(this.rarityChances)) {
            cumulative += chance;
            if (roll <= cumulative) {
                return rarity;
            }
        }
        
        return "Common";
    }

    getEfficiencyMultiplier() {
        if (this.isWealthTaxBoosted()) return 1.0;
        return this.getWealthTaxEfficiency();
    }

    isWealthTaxBoosted() {
        return this.taxBoostTime > 0;
    }
    
    // Wealth Tax System Methods
    getWealthTaxEfficiency() {
        // Check if bypass is active
        if (this.isWealthTaxBypassed()) return 1.0;
        
        // Apply efficiency based on plot count
        if (this.plotsClaimed <= 150) return 1.0;
        if (this.plotsClaimed <= 300) return 0.5;
        return 0.2;
    }
    
    isWealthTaxBypassed() {
        return this.wealthTaxBypassTime > Date.now();
    }
    
    watchWealthTaxAd() {
        if (this.isWealthTaxBypassed()) {
            alert("Wealth Tax is already bypassed!");
            return;
        }
        
        if (!confirm("Watch an ad to remove Wealth Tax for 30 minutes?")) {
            return;
        }
        
        // Simulate ad watching
        setTimeout(() => {
            this.wealthTaxBypassTime = Date.now() + this.wealthTaxBypassDuration;
            alert("✅ Wealth Tax bypassed for 30 minutes!");
            this.updateWealthTaxDisplay();
        }, 1000);
    }
    
    updateWealthTaxDisplay() {
        const efficiencyEl = document.getElementById('wealthTaxEfficiencyDisplay');
        const bypassEl = document.getElementById('wealthTaxBypassDisplay');
        
        if (efficiencyEl) {
            const efficiency = this.getWealthTaxEfficiency();
            efficiencyEl.textContent = Math.round(efficiency * 100) + '%';
        }
        
        if (bypassEl) {
            if (this.isWealthTaxBypassed()) {
                const remainingTime = Math.ceil((this.wealthTaxBypassTime - Date.now()) / (60 * 1000));
                bypassEl.textContent = remainingTime + 'm';
            } else {
                bypassEl.textContent = '0m';
            }
        }
    }
    
    // Plot Takeover System Methods
    initializeExpiredPlots() {
        // Mark expired plots as claimed but distressed on the map
        this.expiredPlots.forEach(expiredPlot => {
            const regionName = expiredPlot.region || "Default";
            const plotIndex = expiredPlot.id - 1; // Convert to 0-based index
            
            // Get plots from the specific region
            let regionPlots = [];
            if (this.regionData[regionName] && this.regionData[regionName].plots) {
                regionPlots = this.regionData[regionName].plots;
            } else if (regionName === "Default") {
                regionPlots = this.plots; // Fallback to main plots array
            }
            
            if (regionPlots[plotIndex]) {
                const plot = regionPlots[plotIndex];
                plot.claimed = false; // Abandoned plots are NOT claimed by current player
                plot.owner = expiredPlot.owner; // Keep original owner for display
                plot.rarity = expiredPlot.rarity;
                plot.isExpired = true; // Mark as expired for visual distinction
                plot.region = regionName; // Store region info
                
                // Add visual classes for distressed appearance
                if (plot.element) {
                    // Don't add 'claimed' class - these are abandoned plots, not claimed by current player
                    plot.element.classList.add(expiredPlot.rarity, 'expired');
                    
                    // Set plot coordinates for sprite system
                    plot.x = plot.index % 25;
                    plot.z = Math.floor(plot.index / 25);
                    plot.y = 0;
                    
                    // Render the 3D model on the plot (this will show the proper sprite)
                    try {
                        window.renderModelOnPlot(plot.element, expiredPlot.rarity);
                        console.log(`✅ Sprite rendered for abandoned plot ${expiredPlot.id} (${expiredPlot.rarity})`);
                    } catch (error) {
                        console.error('Error rendering sprite for abandoned plot:', error);
                    }
                    
                    // Add distress overlay on top of the sprite
                    const distressOverlay = document.createElement('div');
                    distressOverlay.className = 'distress-overlay';
                    distressOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 20; pointer-events: none;';
                    distressOverlay.innerHTML = `
                        <div class="smoke-effect"></div>
                        <div class="damage-effect"></div>
                    `;
                    plot.element.appendChild(distressOverlay);
                }
            }
        });
        
        // Update the takeover display after initializing expired plots
        this.updateTakeoverDisplay();
        
        // Force earnings recalculation to account for abandoned plots
        this.startEarnings();
    }
    
    updateTakeoverDisplay() {
        // Throttle updates to prevent performance issues
        if (this._lastTakeoverUpdate && Date.now() - this._lastTakeoverUpdate < 1000) {
            return;
        }
        this._lastTakeoverUpdate = Date.now();
        
        const plotsListEl = document.getElementById('takeoverPlotsList');
        if (!plotsListEl) {
            return;
        }
        
        // Update the event banner
        this.updateTakeoverBanner();
        
        // Only update if the content has changed
        const currentContent = JSON.stringify(this.expiredPlots.map(p => ({id: p.id, cost: this._getTakeoverPriceFor()})));
        if (this._lastTakeoverContent === currentContent) {
            return;
        }
        this._lastTakeoverContent = currentContent;
        
        plotsListEl.innerHTML = '';
        

        
        this.expiredPlots.forEach(plot => {
            const plotEl = document.createElement('div');
            plotEl.className = 'takeover-plot-entry';
            const cost = this._getTakeoverPriceFor();
            plotEl.innerHTML = `
                <div class="plot-info">
                    <strong>Plot ${plot.id} (${plot.rarity})</strong><br>
                    Region: ${plot.region || "Default"}<br>
                    Owner: ${plot.owner} - Missed: ${plot.daysMissed} day(s)
                </div>
                <button onclick="game.purchaseTakeoverPlot(${plot.id})" class="takeover-btn">
                    Take Over (${cost} PRC)
                </button>
            `;
            plotsListEl.appendChild(plotEl);
        });
    }
    
    /** Current takeover price. Normal = 125 PRC. During Land Takeover Madness = 100 PRC. */
    _getTakeoverPriceFor() {
        const madness = this.activeEvent === 'Land Takeover Madness';
        return madness ? 100 : 125;
    }

    /** Banner above the list (reflects 100% Treasury + live countdown). */
    updateTakeoverBanner() {
        const list = document.getElementById('takeoverPlotsList');
        if (!list) return;

        const id = 'takeoverEventBanner';
        let banner = document.getElementById(id);

        if (this.activeEvent !== 'Land Takeover Madness') {
            if (banner) banner.remove();
            return;
        }

        if (!banner) {
            banner = document.createElement('div');
            banner.id = id;
            banner.style.cssText = `
                margin:6px 0 8px 0;padding:10px 12px;border-radius:10px;
                background:linear-gradient(90deg,rgba(255,100,0,.15),rgba(255,180,0,.15));
                border:1px dashed rgba(255,165,0,.6);color:#ffd18a;font-weight:700;
                font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
            `;
            list.parentElement?.insertBefore(banner, list);
        }

        // Throttle banner updates to prevent excessive DOM manipulation
        const now = Date.now();
        if (this._lastBannerUpdate && now - this._lastBannerUpdate < 1000) {
            return;
        }
        this._lastBannerUpdate = now;

        const s = Math.max(0, this.eventTimer | 0);
        const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
        const price = this._getTakeoverPriceFor();
        banner.innerHTML =
            `🔥 <b>Land Takeover Madness</b> — takeovers cost <b>${price} PRC</b>. 
             <b>100%</b> of PRC goes to Treasury. Ends in <b>${h}h ${m}m ${ss}s</b>.`;
    }

    /** Takeover purchase: deduct PRC, flip plot, add earnings, send 100% PRC to Treasury. */
    purchaseTakeoverPlot(plotId) {
        const epIndex = this.expiredPlots.findIndex(p => p.id === plotId);
        if (epIndex === -1) return alert('Plot not found or already taken.');
        const ep = this.expiredPlots[epIndex];
        const cost = this._getTakeoverPriceFor();

        if ((this.premiumRevCoins || 0) < cost)
            return alert(`Not enough Premium RevCoins. You need ${cost} PRC.`);

        if (!confirm(`Take over Plot ${ep.id} (${ep.rarity}) for ${cost} PRC?`)) return;

        // Deduct PRC & send **all** to Treasury (admin earnings)
        this.premiumRevCoins -= cost;
        this.addTreasuryPRC?.(cost, 'Abandoned Plot Takeover (100% to Treasury)');

        // Flip on the current grid
        const regionName = ep.region || "Default";
        const idx = plotId - 1;
        
        // Get plots from the specific region
        let regionPlots = [];
        if (this.regionData[regionName] && this.regionData[regionName].plots) {
            regionPlots = this.regionData[regionName].plots;
        } else if (regionName === "Default") {
            regionPlots = this.plots; // Fallback to main plots array
        }
        
        const grid = regionPlots[idx];
        if (grid) {
            grid.claimed = true;
            grid.owner = this.playerName;
            grid.rarity = ep.rarity;
            grid.isExpired = false;
            grid.region = regionName; // Store region info

            if (grid.element) {
                grid.element.classList.remove('expired');
                grid.element.classList.add('claimed', ep.rarity);
                
                // Remove distress overlay
                const distressOverlay = grid.element.querySelector('.distress-overlay');
                if (distressOverlay) {
                    distressOverlay.remove();
                }
                
                // Set plot coordinates for sprite system
                grid.x = grid.index % 25;
                grid.z = Math.floor(grid.index / 25);
                grid.y = 0;
                
                // Re-render the 3D model on the plot (this will show the clean sprite)
                try {
                    window.renderModelOnPlot(grid.element, ep.rarity);
                    console.log(`✅ Sprite restored for purchased plot ${plotId} (${ep.rarity})`);
                } catch (error) {
                    console.error('Error restoring sprite for purchased plot:', error);
                }
            }
        }

        // Earnings bump + stats
        const addRate = this.rarityRates[ep.rarity] || 0;
        this.earnings += addRate;
        this.withdrawalBalance += addRate;
        this.plotsClaimed = (this.plotsClaimed || 0) + 1;

        // Remove from list & refresh UI
        this.expiredPlots.splice(epIndex, 1);
        this.updateCurrencyDisplay?.();
        this.updateEarningsDisplay?.();
        this.updateGlobalPlotCount?.();
        this.updateTakeoverDisplay?.();

        const msg = `✅ Plot ${plotId} captured! +${addRate.toFixed(8)}/sec added. All ${cost} PRC sent to Treasury.`;
        if (window.toast) window.toast(msg, 'success'); else alert(msg);
    }
    
    // Demo function to simulate watching ads for PRC
    simulateWatchAdForPRC() {
        const reward = Math.floor(Math.random() * 10) + 5; // 5-15 PRC
        this.premiumRevCoins += reward;
        alert(`📺 Ad watched! You earned ${reward} Premium RevCoins.`);
        this.updateCurrencyDisplay();
    }
    
    // Function to add expired plots from any region
    addExpiredPlot(plotId, rarity, owner, daysMissed, regionName = "Default") {
        const expiredPlot = {
            id: plotId,
            rarity: rarity,
            owner: owner,
            daysMissed: daysMissed,
            region: regionName
        };
        
        this.expiredPlots.push(expiredPlot);
        this.updateTakeoverDisplay();
        
        // If the region is currently active, initialize the plot immediately
        if (this.currentRegion === regionName) {
            this.initializeExpiredPlots();
        }
    }
    
    // Background Music System
    initBackgroundMusic() {
        // Create audio element
        this.backgroundMusic = new Audio();
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.musicVolume;
        
        // Set music source to your seamless loop music file
        this.backgroundMusic.src = 'assets/audio/seamless_loop_smooth.mp3';
        console.log('🎵 Music file path set to:', this.backgroundMusic.src);
        
        // Create music controls UI
        this.createMusicControls();
        
        // Don't auto-start music due to browser autoplay restrictions
        // Music will start when user clicks the toggle button
    }
    
    createMusicControls() {
        console.log('🎵 Creating music controls...');
        // Create music control panel
        const musicPanel = document.createElement('div');
        musicPanel.id = 'musicControls';
        musicPanel.className = 'overlay-panel ec-glass';
        musicPanel.style.cssText = `
            top: 20px;
            right: 20px;
            min-width: 200px;
        `;
        
        musicPanel.innerHTML = `
            <button class="minimize-btn" id="musicMinimize">−</button>
            <div class="overlay-content">
                <div style="margin-bottom: 10px; font-weight: bold; color: #ffd700;">🎵 Music Controls</div>
                <div style="margin-bottom: 10px;">
                    <button id="musicToggle" style="
                        background: ${this.musicEnabled ? '#4CAF50' : '#f44336'};
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">${this.musicEnabled ? '🔊 On' : '🔇 Off'}</button>
                    <span id="musicStatus" style="font-size: 12px;">${this.musicEnabled ? 'Playing' : 'Stopped'}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="font-size: 12px; display: block; margin-bottom: 5px;">Volume:</label>
                    <input type="range" id="musicVolume" min="0" max="100" value="${this.musicVolume * 100}" style="width: 100%;">
                    <div style="font-size: 10px; text-align: center; margin-top: 2px;">
                        <span id="volumeDisplay">${Math.round(this.musicVolume * 100)}%</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(musicPanel);
        console.log('🎵 Music controls added to DOM');
        
        // Add event listeners
        document.getElementById('musicToggle').addEventListener('click', () => this.toggleMusic());
        document.getElementById('musicVolume').addEventListener('input', (e) => this.setMusicVolume(e.target.value / 100));
        
        // Add minimize functionality
        document.getElementById('musicMinimize').addEventListener('click', () => this.toggleMusicMinimize());
        
        // Make panel draggable
        this.makeDraggable(musicPanel);
        console.log('🎵 Music controls setup complete');
    }
    
    toggleMusic() {
        console.log('🎵 Toggle music clicked!');
        this.musicEnabled = !this.musicEnabled;
        console.log('Music enabled:', this.musicEnabled);
        
        if (this.musicEnabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
        this.updateMusicUI();
    }
    
    playBackgroundMusic() {
        console.log('🎵 Attempting to play music...');
        console.log('Music object:', this.backgroundMusic);
        console.log('Music enabled:', this.musicEnabled);
        console.log('Music src:', this.backgroundMusic?.src);
        
        if (this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.play().then(() => {
                console.log('✅ Music started successfully!');
            }).catch(error => {
                console.error('❌ Music play failed:', error);
                alert('Music failed to play: ' + error.message);
            });
        } else {
            console.log('❌ Music not ready - object:', !!this.backgroundMusic, 'enabled:', this.musicEnabled);
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
        
        this.updateMusicUI();
    }
    
    updateMusicUI() {
        const toggleBtn = document.getElementById('musicToggle');
        const statusSpan = document.getElementById('musicStatus');
        const volumeSlider = document.getElementById('musicVolume');
        const volumeDisplay = document.getElementById('volumeDisplay');
        
        if (toggleBtn) {
            toggleBtn.style.background = this.musicEnabled ? '#4CAF50' : '#f44336';
            toggleBtn.textContent = this.musicEnabled ? '🔊 On' : '🔇 Off';
        }
        
        if (statusSpan) {
            statusSpan.textContent = this.musicEnabled ? 'Playing' : 'Stopped';
        }
        
        if (volumeSlider) {
            volumeSlider.value = this.musicVolume * 100;
        }
        
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round(this.musicVolume * 100)}%`;
        }
    }
    


    checkDailyLogin() {
        if (this.dailyLoginChecked) return;
        
        const today = new Date().toDateString();
        
        if (this.lastLoginDate !== today) {
            this.dailyLoginAvailable = true;
            this.lastLoginDate = today;
            // Don't reset dailyLoginBonus here - it should persist until next claim
            this.updateLoginUI();
        }
        
        this.dailyLoginChecked = true;
    }

    updateLoginUI() {
        const dailyLoginInfo = document.getElementById('dailyLoginInfo');
        if (dailyLoginInfo) {
            if (this.dailyLoginAvailable) {
                dailyLoginInfo.style.display = 'block';
                dailyLoginInfo.textContent = 'Daily login bonus available!';
            } else {
                dailyLoginInfo.style.display = 'none';
            }
        }
    }

    updateEarningsDisplay() {
        const currentBalanceEl = document.getElementById('currentEarningsDisplay');
        const withdrawalBalanceEl = document.getElementById('withdrawalBalanceDisplay');
        const earningsRateEl = document.getElementById('earningsRateDisplay');
        const baseEarningsEl = document.getElementById('baseEarningsDisplay');
        
        if (currentBalanceEl) currentBalanceEl.textContent = this.earnings.toFixed(8);
        if (withdrawalBalanceEl) withdrawalBalanceEl.textContent = this.withdrawalBalance.toFixed(8);
        if (earningsRateEl) earningsRateEl.textContent = this.earningsPerSecond.toFixed(8);
        if (baseEarningsEl) baseEarningsEl.textContent = this.baseEarningsPerSecond.toFixed(8);
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.completed) {
                let completed = false;
                
                switch(achievement.id) {
                    case "first_plot":
                        completed = this.plotsClaimed >= 1;
                        break;
                    case "knight_rank":
                        completed = this.plotsClaimed >= 10;
                        break;
                    case "lord_rank":
                        completed = this.plotsClaimed >= 50;
                        break;
                    case "king_rank":
                        completed = this.plotsClaimed >= 100;
                        break;
                    case "ten_plots":
                        completed = this.plotsClaimed >= 10;
                        break;
                    case "fifty_plots":
                        completed = this.plotsClaimed >= 50;
                        break;
                    case "hundred_plots":
                        completed = this.plotsClaimed >= 100;
                        break;
                }
                
                if (completed) {
                    achievement.completed = true;
                    this.achievementPoints += achievement.points;
                    alert(`🏆 Achievement Unlocked!\n\n${achievement.icon} ${achievement.name}\n${achievement.description}\n\n+${achievement.points} points!`);
                }
            }
        });
    }

    // Navigation methods
    navigateToQuadrant(quadrant) {
        console.log(`navigateToQuadrant called with: ${quadrant}`);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const plotWidth = viewportWidth / 25;
        const plotHeight = viewportHeight / 20;
        
        let targetX = 0, targetY = 0;
        
        switch(quadrant) {
            case 'NW':
                targetX = 0;
                targetY = 0;
                break;
            case 'NE':
                targetX = viewportWidth / 2;
                targetY = 0;
                break;
            case 'SW':
                targetX = 0;
                targetY = viewportHeight / 2;
                break;
            case 'SE':
                targetX = viewportWidth / 2;
                targetY = viewportHeight / 2;
                break;
        }
        
        console.log(`Scrolling to: ${targetX}, ${targetY}`);
        
        // Smooth scroll to the quadrant
        window.scrollTo({
            left: targetX,
            top: targetY,
            behavior: 'smooth'
        });
        
        // Update the active quadrant button
        document.querySelectorAll('.nav-quadrants button').forEach(btn => {
            btn.style.outline = 'none';
        });
        
        // Find and highlight the clicked button
        const buttons = document.querySelectorAll('.nav-quadrants button');
        let buttonFound = false;
        buttons.forEach(btn => {
            if (btn.textContent === quadrant) {
                btn.style.outline = '2px solid white';
                buttonFound = true;
            }
        });
        
        if (!buttonFound) {
            console.log('Button not found for quadrant:', quadrant);
        }
        
        console.log(`Navigated to ${quadrant} quadrant`);
    }
    
    toggleRegion() {
        console.log('toggleRegion called');
        // Use dynamic regions list instead of hardcoded
        const currentIndex = this.regions.indexOf(this.currentRegion);
        const nextIndex = (currentIndex + 1) % this.regions.length;
        const nextRegion = this.regions[nextIndex];
        
        console.log(`Toggling from ${this.currentRegion} to ${nextRegion}`);
        
        // Switch to the next region with full state management
        this.switchToRegion(nextRegion);
        
        console.log(`Toggled to ${this.currentRegion} region`);
    }
    
    // createNewRegion function moved to admin panel
    
    switchToRegion(regionName) {
        console.log(`Switching to region: ${regionName}`);
        
        if (!this.regionData[regionName]) {
            console.error(`Region data not found: ${regionName}`);
            return;
        }
        
        // Clear current world DOM
        this.world.innerHTML = '';
        
        // Switch to new region (no state saving/loading - everything is global)
        this.currentRegion = regionName;
        const regionData = this.regionData[regionName];
        
        // Set current plots array to this region's plots for display
        this.plots = regionData.plots;
        
        // Add this region's plots to the DOM
        regionData.plots.forEach(plotData => {
            this.world.appendChild(plotData.element);
        });
        
        // Update global plot count from ALL regions
        this.updateGlobalPlotCount();
        
        // Update UI elements (all stats remain global)
        this.updateRegionDisplay();
        this.updateRegionManagementDisplay();
        this.updateCurrencyDisplay();
        this.updateEarningsDisplay();
        this.updateFindsUI();
        this.updateBoostUI();
        this.applyRegionEffects();
        
        console.log(`Switched to region "${regionName}" with ${this.plots.length} plots (${this.plotsClaimed} total claimed across all regions)`);
    }
    
    updateGlobalPlotCount() {
        // Count total claimed plots across ALL regions
        let totalClaimed = 0;
        let totalPlots = 0;
        
        this.regions.forEach(regionName => {
            if (this.regionData[regionName] && this.regionData[regionName].plots) {
                totalPlots += this.regionData[regionName].plots.length;
                this.regionData[regionName].plots.forEach(plot => {
                    if (plot.claimed) {
                        totalClaimed++;
                    }
                });
            }
        });
        
        this.plotsClaimed = totalClaimed;
        console.log(`Global plot count updated: ${totalClaimed} claimed out of ${totalPlots} total plots across ${this.regions.length} regions`);
    }
    
    // Admin controls moved to separate admin.html page
    

    
    // Region management functions moved to admin panel

// Rescue patch temporarily removed for debugging
    
    applyRegionEffects() {
        console.log('applyRegionEffects called');
        const world = document.getElementById('world');
        if (!world) {
            console.log('World element not found');
            return;
        }
        
        console.log(`Applying region: ${this.currentRegion}`);
        
        // Remove existing region classes
        world.classList.remove('region-default', 'region-forest', 'region-mountain', 'region-coastal', 'region-desert');
        
        // Add new region class
        const newClass = `region-${this.currentRegion.toLowerCase()}`;
        world.classList.add(newClass);
        console.log(`Added class: ${newClass}`);
        
        // Update plot colors based on region
        const regionColors = {
            Default: '#8B4513',
            Forest: '#228B22',
            Mountain: '#696969',
            Coastal: '#4682B4',
            Desert: '#F4A460'
        };
        
        let updatedPlots = 0;
        this.plots.forEach(plot => {
            if (!plot.claimed) {
                plot.element.style.backgroundColor = regionColors[this.currentRegion] || '#8B4513';
                updatedPlots++;
            }
        });
        
        console.log(`Updated ${updatedPlots} unclaimed plots`);
        
        // Ensure sprites for region plots after region change
        const regionObject = {
            id: this.currentRegion,
            name: this.currentRegion,
            plots: this.plots.filter(p => p.claimed && p.owner) // Only owned plots need sprites
        };
        window.onRegionActivated(regionObject);
    }
    
    // Placeholder methods for features not fully implemented in the UI
    initTakeoverPlots() {}
    startTaxCycle() {}
    startKingsDrawCountdown() {}
    updateRegionUI() {}
    updateFindsUI() {
        const findsDisplay = document.getElementById('findsDisplay');
        if (findsDisplay) {
            findsDisplay.textContent = this.finds;
        }
        
        // Also update the finds available display in the Find System panel
        this.updateFindsAvailableDisplay();
    }
    updateBoostUI() {
        // Update boost display
        const boostDisplay = document.getElementById('boostDisplay');
        if (boostDisplay) {
            if (this.boostSecondsRemaining > 0) {
                const hours = Math.floor(this.boostSecondsRemaining / 3600);
                const minutes = Math.floor((this.boostSecondsRemaining % 3600) / 60);
                const seconds = this.boostSecondsRemaining % 60;
                
                // Format as H:MM:SS when over 1 hour, or MM:SS when under 1 hour
                if (hours > 0) {
                    boostDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    boostDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            } else {
                boostDisplay.textContent = '0:00';
            }
        }
        
        // Update boost status
        const boostMultiplier = document.getElementById('boostMultiplier');
        const boostTimeLeft = document.getElementById('boostTimeLeft');
        
        if (boostMultiplier) {
            boostMultiplier.textContent = this.boostSecondsRemaining > 0 ? '2.0x' : '1.0x';
        }
        
        if (boostTimeLeft) {
            if (this.boostSecondsRemaining > 0) {
                const hours = Math.floor(this.boostSecondsRemaining / 3600);
                const minutes = Math.floor((this.boostSecondsRemaining % 3600) / 60);
                const seconds = this.boostSecondsRemaining % 60;
                
                // Format as H:MM:SS when over 1 hour, or MM:SS when under 1 hour
                if (hours > 0) {
                    boostTimeLeft.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    boostTimeLeft.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            } else {
                boostTimeLeft.textContent = '0:00';
            }
        }
    }
    
    boostEarnings() {
        // Check if boost is already at maximum (5 hours) for ad-based boosts
        const maxAdBoostSeconds = 5 * 60 * 60; // 5 hours in seconds
        if (this.boostSecondsRemaining >= maxAdBoostSeconds) {
            alert('Boost is already at maximum duration from ads (5 hours)! You can still get bonus time from rewards.');
            return;
        }
        
        // Simulate watching an ad
        const confirmed = confirm('📺 Watch an ad to boost your earnings for 1 hour?');
        if (!confirmed) return;
        
        // Simulate ad completion
        alert('📺 Ad completed! Adding 1 hour boost...');
        
        // Add 1 hour to boost time, but cap at 5 hours for ad-based boosts
        this.boostSecondsRemaining = Math.min(maxAdBoostSeconds, this.boostSecondsRemaining + 3600);
        
        // Update UI
        this.updateBoostUI();
        
        const hoursRemaining = Math.floor(this.boostSecondsRemaining / 3600);
        const minutesRemaining = Math.floor((this.boostSecondsRemaining % 3600) / 60);
        
        // Use toast if available, fallback to alert
        const message = `🚀 Boost extended! 2x earnings now active for ${hoursRemaining}h ${minutesRemaining}m`;
        if (window.toast) {
            window.toast(message, 'success');
        } else {
            alert(message);
        }
        console.log(`Boost extended - now ${hoursRemaining}h ${minutesRemaining}m remaining`);
    }
    
    addRewardBoost(minutes, source = "reward") {
        // Add boost time from rewards (can exceed 5-hour ad limit)
        const secondsToAdd = minutes * 60;
        this.boostSecondsRemaining += secondsToAdd;
        
        // Update UI
        this.updateBoostUI();
        
        const totalHours = Math.floor(this.boostSecondsRemaining / 3600);
        const totalMinutes = Math.floor((this.boostSecondsRemaining % 3600) / 60);
        const totalSeconds = this.boostSecondsRemaining % 60;
        
        const timeFormat = totalHours > 0 ? 
            `${totalHours}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}` :
            `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
            
        // Use toast if available, fallback to alert
        const message = `🎁 Bonus boost time added from ${source}! +${minutes} minutes - Total: ${timeFormat}`;
        if (window.toast) {
            window.toast(message, 'success');
        } else {
            alert(`🎁 Bonus boost time added from ${source}! +${minutes} minutes\n🚀 Total boost time: ${timeFormat}`);
        }
        console.log(`Reward boost added: +${minutes}m from ${source}, total: ${timeFormat}`);
    }
    
    updateDrawsUI() {
        // Update Lucky Draw display
        this.updateLuckyDrawDisplay();
    }
    
    // Lucky Draw System Methods
    checkDailyDrawReset() {
        const now = Date.now();
        if (now - this.lastDrawReset >= 24 * 60 * 60 * 1000) {
            this.drawsUsed = 0;
            this.lastDrawReset = now;
        }
    }
    
    getLuckyDrawInfo() {
        this.checkDailyDrawReset();
        const drawsLeft = 4 - this.drawsUsed;
        const freeDrawsLeft = Math.max(0, 1 - this.drawsUsed);
        const paidDrawsLeft = Math.max(0, drawsLeft - freeDrawsLeft);
        
        return {
            drawsLeft,
            freeDrawsLeft,
            paidDrawsLeft,
            canDraw: drawsLeft > 0
        };
    }
    
    tryLuckyDraw() {
        this.checkDailyDrawReset();
        
        if (this.drawsUsed >= 4) {
            alert("No more draws today. Come back tomorrow!");
            return;
        }
        
        // Check if this is a paid draw (2nd-4th draw)
        if (this.drawsUsed >= 1) {
            if (!confirm("This draw requires watching an ad. Continue?")) {
                return;
            }
            // Simulate ad watching
            setTimeout(() => {
                this.performLuckyDraw();
            }, 1000);
        } else {
            // Free draw
            this.performLuckyDraw();
        }
    }
    
    performLuckyDraw() {
        this.drawsUsed++;
        
        // Lucky Draw odds based on the image
        const rand = Math.random();
        let reward = 0;
        let message = "";
        
        if (rand < 0.03) {
            // 3% chance: 50 RevCoins
            reward = 50;
            message = `🎉 Lucky Draw Success! You won ${reward} RevCoins.`;
        } else if (rand < 0.13) {
            // 10% chance: 15 RevCoins
            reward = 15;
            message = `🎉 Lucky Draw Success! You won ${reward} RevCoins.`;
        } else if (rand < 0.50) {
            // 37% chance: 1-5 RevCoins
            reward = Math.floor(Math.random() * 5) + 1;
            message = `🎉 Lucky Draw Success! You won ${reward} RevCoins.`;
        } else {
            // 50% chance: Nothing
            reward = 0;
            message = "😢 Lucky Draw Result: No reward this time.";
        }
        
        if (reward > 0) {
            this.revCoins += reward;
        }
        
        alert(message);
        this.updateLuckyDrawDisplay();
        this.updateCurrencyDisplay();
    }
    
    updateLuckyDrawDisplay() {
        const info = this.getLuckyDrawInfo();
        const display = document.getElementById('luckyDrawsLeftDisplay');
        
        if (display) {
            if (info.freeDrawsLeft > 0 && info.paidDrawsLeft > 0) {
                display.textContent = `${info.freeDrawsLeft} free + ${info.paidDrawsLeft} paid`;
            } else if (info.freeDrawsLeft > 0) {
                display.textContent = `${info.freeDrawsLeft} free`;
            } else if (info.paidDrawsLeft > 0) {
                display.textContent = `${info.paidDrawsLeft} paid`;
            } else {
                display.textContent = "0 (come back tomorrow)";
            }
        }
        
        // Update the main draws display
        const drawsEl = document.getElementById('drawsDisplay');
        if (drawsEl) {
            drawsEl.textContent = this.drawsUsed;
        }
    }
    updateCurrencyDisplay() {
        // Update all currency displays
        const revCoinsDisplay = document.getElementById('revCoinsDisplay');
        if (revCoinsDisplay) {
            revCoinsDisplay.textContent = Math.floor(this.revCoins);
        }
        
        const premiumRevCoinsDisplay = document.getElementById('premiumRevCoinsDisplay');
        if (premiumRevCoinsDisplay) {
            premiumRevCoinsDisplay.textContent = Math.floor(this.premiumRevCoins || 0);
        }
    }
    
    updateEarningsDisplay() {
        // Update earnings displays
        const currentEarningsDisplay = document.getElementById('currentEarningsDisplay');
        if (currentEarningsDisplay) {
            currentEarningsDisplay.textContent = this.earnings.toFixed(8);
        }
        
        const withdrawalBalanceDisplay = document.getElementById('withdrawalBalanceDisplay');
        if (withdrawalBalanceDisplay) {
            withdrawalBalanceDisplay.textContent = this.withdrawalBalance.toFixed(8);
        }
        
        const earningsRateDisplay = document.getElementById('earningsRateDisplay');
        if (earningsRateDisplay) {
            earningsRateDisplay.textContent = this.earningsPerSecond.toFixed(8);
        }
        
        const baseEarningsDisplay = document.getElementById('baseEarningsDisplay');
        if (baseEarningsDisplay) {
            baseEarningsDisplay.textContent = this.baseEarningsPerSecond.toFixed(8);
        }
    }
    
    updateRegionDisplay() {
        const regionDisplay = document.getElementById('currentRegionDisplay');
        if (regionDisplay) {
            regionDisplay.textContent = this.currentRegion;
        }
    }
    checkOfflineEarnings() {
        const now = Date.now();
        const timeSinceActive = now - this.lastActiveTime;
        
        // Debug logging
        console.log('🔄 Offline check:', {
            timeSinceActive: Math.floor(timeSinceActive / 1000) + 's',
            threshold: Math.floor(this.offlineThreshold / 1000) + 's',
            isOffline: this.isOffline,
            shouldStart: timeSinceActive >= this.offlineThreshold && !this.isOffline,
            shouldEnd: this.isOffline && timeSinceActive < this.offlineThreshold
        });
        
        if (timeSinceActive >= this.offlineThreshold && !this.isOffline) {
            this.startOfflineEarnings();
        }
        
        if (this.isOffline && timeSinceActive < this.offlineThreshold) {
            this.endOfflineEarnings();
        }
    }
    
    startOfflineEarnings() {
        this.isOffline = true;
        this.offlineStartTime = Date.now();
        console.log("🔄 Player went offline - starting offline earnings");
    }
    
    endOfflineEarnings() {
        if (!this.isOffline) return;
        
        const offlineDuration = Date.now() - this.offlineStartTime;
        const offlineSeconds = Math.floor(offlineDuration / 1000);
        
        const normalEarningsPerSecond = this.calculateNormalEarningsPerSecond();
        const offlineEarningsPerSecond = normalEarningsPerSecond * 0.5;
        this.offlineEarnings = offlineEarningsPerSecond * offlineSeconds;
        
        this.isOffline = false;
        this.offlineStartTime = null;
        
        this.showOfflineEarningsPrompt();
    }
    
    calculateNormalEarningsPerSecond() {
        // Calculate earnings from ALL regions, not just current region
        let totalEarnings = 0;
        
        this.regions.forEach(regionName => {
            if (this.regionData[regionName] && this.regionData[regionName].plots) {
                const ownedPlots = this.regionData[regionName].plots.filter(p => p.claimed && p.owner === this.playerName);
        ownedPlots.forEach(plot => {
            if (plot.rarity && this.rarityRates[plot.rarity]) {
                totalEarnings += this.rarityRates[plot.rarity];
                    }
                });
            }
        });
        
        let multiplier = 1.0;
        multiplier *= this.dailyLoginBonus;
        
        if (!this.taxBoostActive) {
            multiplier *= this.wealthTaxEfficiency;
        }
        
        if (this.boostSecondsRemaining > 0) {
            multiplier *= 2.0;
        }
        
        return totalEarnings * multiplier;
    }
    
    showOfflineEarningsPrompt() {
        const hours = Math.floor(this.offlineEarnings / 3600);
        const minutes = Math.floor((this.offlineEarnings % 3600) / 60);
        const seconds = Math.floor(this.offlineEarnings % 60);
        
        const timeStr = hours > 0 ? `${hours}h ${minutes}m` : 
                       minutes > 0 ? `${minutes}m ${seconds}s` : 
                       `${seconds}s`;
        
        const earningsStr = `$${this.offlineEarnings.toFixed(8)}`;
        
        const confirmed = confirm(
            `🔄 Welcome back!\n\n` +
            `You were offline for ${timeStr}\n` +
            `Offline earnings: ${earningsStr}\n\n` +
            `Watch an ad to claim your offline earnings?`
        );
        
        if (confirmed) {
            this.watchOfflineAd();
        } else {
            this.offlineEarnings = 0;
            alert("Offline earnings forfeited.");
        }
    }
    
    watchOfflineAd() {
        alert("📺 Ad completed! Claiming offline earnings...");
        
        this.earnings += this.offlineEarnings;
        this.withdrawalBalance += this.offlineEarnings;
        
        const earningsStr = `$${this.offlineEarnings.toFixed(8)}`;
        alert(`💰 Successfully claimed ${earningsStr} in offline earnings!`);
        
        this.offlineEarnings = 0;
        this.updateEarningsDisplay();
    }


    handleEventTimers() {
        // If no active event, randomly start one
        if (!this.activeEvent && Math.random() < 0.01) { // 1% chance per second (much more frequent)
            this.startRandomEvent();
        }
        
        // If there's an active event, count down
        if (this.activeEvent && this.eventTimer > 0) {
            this.eventTimer--;
            
            // Event ended
            if (this.eventTimer <= 0) {
                this.endCurrentEvent();
            }
        }
        
        // Always update event display to ensure it's current
        this.updateEventDisplay();
        this.updateEventNotification(); // Update notification timer too
    }
    
    startRandomEvent() {
        const randomEvent = this.eventsList[Math.floor(Math.random() * this.eventsList.length)];
        this.activeEvent = randomEvent;
        this.eventTimer = this.eventDuration; // 4 hours (14400 seconds)
        
        console.log(`🎉 Event started: ${this.activeEvent}`);
        console.log(`⏰ Event duration: ${this.eventTimer} seconds (${this.eventTimer/3600} hours)`);
        this._toast(`🎉 Special Event: ${this.activeEvent}! This event will last for 4 hours!`);
        
        this.updateEventDisplay();
        this.showEventNotification(); // Show prominent event notification
        
        // Debug: Check if event display was updated
        setTimeout(() => {
            const eventNameEl = document.getElementById('currentEventDisplay');
            console.log('Event display element:', eventNameEl);
            console.log('Event display content:', eventNameEl ? eventNameEl.textContent : 'Element not found');
        }, 100);
    }
    
    endCurrentEvent() {
        const endedEvent = this.activeEvent;
        this.activeEvent = null;
        this.eventTimer = 0;
        
        console.log(`Event ended: ${endedEvent}`);
        this._toast(`Event ended: ${endedEvent}`);
        
        this.updateEventDisplay();
        this.hideEventNotification(); // Hide notification when event ends
    }
    
    updateEventDisplay() {
        // Update the HTML panel elements (clean, simple approach)
        const eventNameEl = document.getElementById('currentEventDisplay');
        const eventTimerEl = document.getElementById('eventTimerDisplay');
        const eventEffectEl = document.getElementById('eventEffectDisplay');
        
        if (this.activeEvent) {
            // Format time
            const hours = Math.floor(this.eventTimer / 3600);
            const minutes = Math.floor((this.eventTimer % 3600) / 60);
            const seconds = this.eventTimer % 60;
            const timeString = `${hours}h ${minutes}m ${seconds}s`;
            
            // Update displays
            if (eventNameEl) eventNameEl.textContent = this.activeEvent;
            if (eventTimerEl) eventTimerEl.textContent = timeString;
            
            // Set effect based on event type
            let effect = 'No effect';
            switch (this.activeEvent) {
                case 'Lucky Surge':
                    effect = '🎯 +50% earnings from all plots';
                    break;
                case 'Land Takeover Madness':
                    effect = '⚔️ Takeover costs reduced by 50%';
                    break;
                case 'Audit Infraction':
                    effect = '⚠️ Must clear by watching 3 ads or paying 125 PRC';
                    break;
                case 'Kings Festival':
                    effect = '👑 Kings Draw entries give 2x rewards';
                    break;
            }
            
            // Handle audit infraction special case
            if (this.auditFineActive) {
                effect = '⚠️ Audit Infraction: Clear by 3 ads or pay 125 PRC\n\nYou\'ve been audited! You must either watch 3 ads or pay 125 PRC to clear this.';
                if (this.outstandingFinePRC > 0) {
                    effect += `\n\nOutstanding Fine: ${this.outstandingFinePRC} PRC`;
                }
            }
            
            if (eventEffectEl) eventEffectEl.textContent = effect;
            
        } else {
            // No active event
            if (eventNameEl) eventNameEl.textContent = 'None';
            if (eventTimerEl) eventTimerEl.textContent = '0h 0m 0s';
            if (eventEffectEl) eventEffectEl.textContent = 'No effect';
        }
        
        // Handle audit button visibility
        const auditBtn = document.getElementById('auditButton');
        if (auditBtn) {
            auditBtn.style.display = this.auditFineActive ? 'inline-block' : 'none';
        }
    }
    claimOfflineEarnings() {}
    
    // Test function for offline earnings
    testOfflineEarnings() {
        console.log('🧪 Testing offline earnings...');
        this.lastActiveTime = Date.now() - (60 * 1000); // Set last active to 1 minute ago
        this.checkOfflineEarnings();
    }
    
    // Test function for events
    testEvent() {
        console.log('🎉 Testing event system...');
        console.log('Current active event:', this.activeEvent);
        console.log('Current event timer:', this.eventTimer);
        console.log('Events list:', this.eventsList);
        this.startRandomEvent();
    }
    
    // Force start a specific event for testing
    forceEvent(eventName) {
        console.log(`🎉 Forcing event: ${eventName}`);
        this.activeEvent = eventName;
        this.eventTimer = 60; // 1 minute for testing
        this.updateEventDisplay();
        this.showEventNotification(); // Show notification for test events too
        this._toast(`🧪 Test event: ${eventName} active for 1 minute!`);
    }
    
    // Show event notification banner
    showEventNotification() {
        const notification = document.getElementById('eventNotification');
        const eventNameEl = document.getElementById('eventNotificationName');
        const eventTimerEl = document.getElementById('eventNotificationTimer');
        
        if (notification && this.activeEvent) {
            // Set event name
            if (eventNameEl) {
                eventNameEl.textContent = this.activeEvent;
            }
            
            // Set initial timer
            if (eventTimerEl) {
                const hours = Math.floor(this.eventTimer / 3600);
                const minutes = Math.floor((this.eventTimer % 3600) / 60);
                eventTimerEl.textContent = `${hours}h ${minutes}m remaining`;
            }
            
            // Show notification
            notification.style.display = 'block';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hideEventNotification();
            }, 10000);
        }
    }
    
    // Hide event notification banner
    hideEventNotification() {
        const notification = document.getElementById('eventNotification');
        if (notification) {
            notification.style.display = 'none';
        }
    }
    
    // Update event notification timer
    updateEventNotification() {
        const eventTimerEl = document.getElementById('eventNotificationTimer');
        if (eventTimerEl && this.activeEvent && this.eventTimer > 0) {
            const hours = Math.floor(this.eventTimer / 3600);
            const minutes = Math.floor((this.eventTimer % 3600) / 60);
            const seconds = this.eventTimer % 60;
            eventTimerEl.textContent = `${hours}h ${minutes}m ${seconds}s remaining`;
        }
    }
    
    // Show event notification again (for manual trigger)
    showEventNotificationAgain() {
        if (this.activeEvent) {
            this.showEventNotification();
            this._toast('📢 Event notification shown again!');
        } else {
            this._toast('No active event to show!');
        }
    }
    
    // Test function to verify event earnings integration
    testEventEarnings() {
        console.log('💰 Testing event earnings integration...');
        console.log('Current earnings per second:', this.earningsPerSecond);
        console.log('Active event:', this.activeEvent);
        
        // Start Lucky Surge to test earnings boost
        this.activeEvent = 'Lucky Surge';
        this.eventTimer = 60; // 1 minute for testing
        this.updateEventDisplay();
        
        // Recalculate earnings to show the boost
        this.startEarnings();
        
        console.log('New earnings per second (should be 1.5x):', this.earningsPerSecond);
        this._toast('🧪 Event earnings test: Lucky Surge active for 1 minute!');
    }
    
    // Watch Ad for Finds function
    watchAdForFinds() {
        // Simulate ad watching
        this._toast('📺 Watching ad for finds...');
        
        setTimeout(() => {
            // Reward player with 2 finds
            this.finds = (this.finds || 0) + 2;
            
            // Update all find displays
            this.updateFindsUI();
            this.updateFindsAvailableDisplay();
            
            // Track ad watched for economy monitoring
            this.trackAdWatched('finds_reward');
            this.trackPlayerEngagement('watched_ad_for_finds');
            
            this._toast('✅ Ad completed! You earned +2 finds!');
            console.log(`🎯 Finds updated: ${this.finds} available`);
        }, 1000);
    }
    
    // Update finds available display
    updateFindsAvailableDisplay() {
        const findsAvailableEl = document.getElementById('findsAvailableDisplay');
        if (findsAvailableEl) {
            findsAvailableEl.textContent = this.finds || 0;
        }
    }
    
    // Test function for Find System
    testFindSystem() {
        console.log('🔍 Testing Find System...');
        console.log('Current finds:', this.finds);
        
        // Test watching ad for finds
        this.watchAdForFinds();
        
        console.log('Find System test completed!');
    }
    
    // Mobile orientation check
    checkMobileOrientation() {
        const warning = document.getElementById('mobileOrientationWarning');
        if (!warning) return;
        
        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isMobile && isPortrait) {
            warning.style.display = 'flex';
        } else {
            warning.style.display = 'none';
        }
        
        // Listen for orientation changes
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 768;
            const isPortrait = window.innerHeight > window.innerWidth;
            
            if (isMobile && isPortrait) {
                warning.style.display = 'flex';
            } else {
                warning.style.display = 'none';
            }
        });
    }

    updateActivity() {
        this.lastActiveTime = Date.now();
    }

    claimDailyLogin() {
        if (!this.dailyLoginAvailable) {
            alert("You've already claimed your daily login bonus today!");
            return;
        }
        
        const confirmed = confirm("📺 Watch an ad to roll for your daily login bonus?");
        if (!confirmed) return;
        
        alert("📺 Ad completed! Rolling for bonus...");
        
        // Track ad watched for economy monitoring
        this.trackAdWatched('daily_login');
        this.trackPlayerEngagement('watched_ad_for_daily_login');
        
        const roll = Math.random();
        let cumulativeChance = 0;
        let selectedReward = null;
        
        for (const reward of this.dailyLoginRewards) {
            cumulativeChance += reward.chance;
            if (roll <= cumulativeChance) {
                selectedReward = reward;
                break;
            }
        }
        
        if (!selectedReward) {
            selectedReward = this.dailyLoginRewards[0];
        }
        
        this.loginStreak++;
        this.dailyLoginAvailable = false;
        
        // Handle different reward types
        let rewardMessage = "";
        if (selectedReward.type === "boost") {
            // Add boost time (can exceed 5-hour ad limit)
            this.addRewardBoost(selectedReward.bonus, "daily login");
            rewardMessage = `🎲 Daily Login Roll Result:\n\n${selectedReward.name}\n+${selectedReward.bonus} minutes of boost time!\n\nStreak: ${this.loginStreak} days!`;
        } else {
            // Earnings bonus
            this.dailyLoginBonus = 1.0 + selectedReward.bonus;
            rewardMessage = `🎲 Daily Login Roll Result:\n\n${selectedReward.name}\n+${(selectedReward.bonus * 100).toFixed(0)}% earnings bonus!\n\nStreak: ${this.loginStreak} days!`;
        }
        
        alert(rewardMessage);
        
        this.updateLoginUI();
        this.updateEarningsDisplay();
    }

    handleResize() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const plotWidth = viewportWidth / 25;
        const plotHeight = viewportHeight / 20;
        
        this.plots.forEach((plot, index) => {
            const row = Math.floor(index / 25);
            const col = index % 25;
            const x = col * plotWidth;
            const y = row * plotHeight;
            
            plot.x = x;
            plot.y = y;
            plot.width = plotWidth;
            plot.height = plotHeight;
            
            plot.element.style.left = x + 'px';
            plot.element.style.top = y + 'px';
            plot.element.style.width = plotWidth + 'px';
            plot.element.style.height = plotHeight + 'px';
        });
        
        this.world.querySelectorAll('.road').forEach(road => road.remove());
        this.createRoads();
    }
    
    // Test function for debugging navigation
    testNavigation() {
        console.log('=== NAVIGATION TEST ===');
        console.log('Game instance:', this);
        console.log('Current region:', this.currentRegion);
        
        // Test quadrant navigation
        console.log('Testing NW quadrant...');
        this.navigateToQuadrant('NW');
        
        // Test region toggle
        console.log('Testing region toggle...');
        this.toggleRegion();
        
        console.log('=== NAVIGATION TEST COMPLETE ===');
    }

  // ---------- King's Draw Countdown System ----------
  updateKingsDrawCountdown() {
    if (!this.kingsDrawEnabled) return;
    
    const now = Date.now();
    const timeUntilDraw = this.nextDrawTime - now;
    
    // Update countdown display
    if (timeUntilDraw > 0) {
      const days = Math.floor(timeUntilDraw / (24 * 60 * 60 * 1000));
      const hours = Math.floor((timeUntilDraw % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((timeUntilDraw % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((timeUntilDraw % (60 * 1000)) / 1000);
      
      const countdownDisplay = document.getElementById('kingsDrawCountdown');
      if (countdownDisplay) {
        countdownDisplay.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    } else {
      // Time for the draw!
      this.performKingsDraw();
    }
  };

  performKingsDraw() {
    if (!this.kingsDrawEnabled) return;
    
    // Get all players who have entries (for now, simulate with current player)
    const players = [this.playerName]; // In a real system, this would be all players
    const totalPool = this.kingsDrawPool || 0;
    
    if (players.length > 0 && totalPool > 0) {
      // Randomly select winner
      const winner = players[Math.floor(Math.random() * players.length)];
      
      // Award the prize
      if (winner === this.playerName) {
        this.premiumRevCoins = (this.premiumRevCoins || 0) + totalPool;
        toast(this, `🎉 Congratulations! You won the King's Draw! Prize: ${totalPool} PRC`);
      } else {
        toast(this, `👑 King's Draw completed! Winner: ${winner} (${totalPool} PRC)`);
      }
      
      // Store winner info
      this.drawWinners.unshift({
        winner: winner,
        prize: totalPool,
        timestamp: Date.now(),
        drawNumber: this.totalDrawsCompleted + 1
      });
      
      // Keep only last 5 winners
      if (this.drawWinners.length > 5) {
        this.drawWinners = this.drawWinners.slice(0, 5);
      }
      
      this.totalDrawsCompleted++;
    } else {
      toast(this, '👑 King\'s Draw completed! No entries this week.');
    }
    
    // Reset for next draw
    this.lastDrawTime = Date.now();
    this.nextDrawTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
    this.kingsDrawPool = 0;
    this.kingsDrawEntries = 0;
    
    // Update display
    this.updateKingsDrawDisplay();
  };

  updateKingsDrawDisplay() {
    // Update pool display
    const poolDisplay = document.getElementById('kingsDrawPool');
    if (poolDisplay) {
      poolDisplay.textContent = this.kingsDrawPool || 0;
    }
    
    // Update entries display
    const entriesDisplay = document.getElementById('kingsDrawEntries');
    if (entriesDisplay) {
      entriesDisplay.textContent = this.kingsDrawEntries || 0;
    }
    
    // Update recent winners
    const winnersDisplay = document.getElementById('kingsDrawWinners');
    if (winnersDisplay) {
      if (this.drawWinners.length > 0) {
        const winnersList = this.drawWinners.map(win => 
          `Draw #${win.drawNumber}: ${win.winner} (${win.prize} PRC)`
        ).join('\n');
        winnersDisplay.textContent = winnersList;
      } else {
        winnersDisplay.textContent = 'No draws completed yet';
      }
    }
  };

  addTreasuryPRC(amount, source = 'Unknown') {
    this.kingsDrawPool = (this.kingsDrawPool || 0) + amount;
    this.kingsDrawEntries = (this.kingsDrawEntries || 0) + 1;
    console.log(`💰 Treasury: +${amount} PRC from ${source}. Pool: ${this.kingsDrawPool}`);
    this.updateKingsDrawDisplay();
    this.updatePRCStoreDisplay(); // Also update the store display
  };

  // Initialize King's Draw display on game start
  initKingsDrawDisplay() {
    // Create King's Draw UI if it doesn't exist
    if (!document.getElementById('kingsDrawWidget')) {
      const widget = document.createElement('div');
      widget.id = 'kingsDrawWidget';
      widget.style.cssText = 'position:fixed;left:20px;bottom:120px;z-index:2001;background:rgba(0,0,0,.85);color:#fff;border:2px solid #FFD700;border-radius:12px;padding:15px;width:280px;font-family:monospace;box-shadow:0 8px 18px rgba(0,0,0,.5);cursor:move;user-select:none;';
      widget.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:10px;cursor:move;">
          <div style="font-weight:800;color:#FFD700;">👑 King's Draw (Drag to move)</div>
          <button id="kingsDrawMinimize" style="background: none; border: none; color: #FFD700; font-size: 14px; cursor: pointer; padding: 0; margin: 0;">−</button>
        </div>
        <div id="kingsDrawContent">
          <div style="margin-bottom:8px;">
            <span style="color:#9CF;">Next Draw:</span> 
            <span id="kingsDrawCountdown" style="color:#FFD700;font-weight:bold;">7d 0h 0m 0s</span>
          </div>
          <div style="margin-bottom:8px;">
            <span style="color:#9CF;">Prize Pool:</span> 
            <span id="kingsDrawPool" style="color:#FFD700;font-weight:bold;">0</span> PRC
          </div>
          <div style="margin-bottom:8px;">
            <span style="color:#9CF;">Entries:</span> 
            <span id="kingsDrawEntries" style="color:#FFD700;font-weight:bold;">0</span>
          </div>
          <div style="margin-top:10px;font-size:12px;color:#9CF;">Recent Winners:</div>
          <div id="kingsDrawWinners" style="font-size:11px;color:#CCC;margin-top:5px;max-height:80px;overflow-y:auto;">
            No draws completed yet
          </div>
        </div>
      `;
      document.body.appendChild(widget);
      
      // Make widget draggable
      this.makeDraggable(widget);
      
      // Add minimize functionality
      const minimizeBtn = document.getElementById('kingsDrawMinimize');
      const content = document.getElementById('kingsDrawContent');
      if (minimizeBtn && content) {
        minimizeBtn.onclick = () => {
          if (content.style.display === 'none') {
            content.style.display = 'block';
            minimizeBtn.textContent = '−';
            widget.style.width = '280px';
          } else {
            content.style.display = 'none';
            minimizeBtn.textContent = '+';
            widget.style.width = 'auto';
          }
        };
      }
    }
    
    this.updateKingsDrawDisplay();
  };

  // Draggable system for UI widgets (mobile-friendly)
  makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // Mouse events
    element.addEventListener('mousedown', dragStart);
    element.addEventListener('mousemove', drag);
    element.addEventListener('mouseup', dragEnd);
    element.addEventListener('mouseleave', dragEnd);

    // Touch events for mobile
    element.addEventListener('touchstart', dragStart, { passive: false });
    element.addEventListener('touchmove', drag, { passive: false });
    element.addEventListener('touchend', dragEnd);

    function dragStart(e) {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      initialX = clientX - xOffset;
      initialY = clientY - yOffset;

      if (e.target === element || element.contains(e.target)) {
        isDragging = true;
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        currentX = clientX - initialX;
        currentY = clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, element);
      }
    }

    function setTranslate(xPos, yPos, el) {
      // Keep widget within viewport bounds
      const rect = el.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      xPos = Math.max(0, Math.min(xPos, maxX));
      yPos = Math.max(0, Math.min(yPos, maxY));
      
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    }
  }

  // Create comprehensive Premium RevCoins Store
  createPRCStore() {
    if (document.getElementById('prcStoreWidget')) return;
    
    const store = document.createElement('div');
    store.id = 'prcStoreWidget';
    store.style.cssText = 'position:fixed;right:20px;top:20px;z-index:2001;background:rgba(0,0,0,.9);color:#fff;border:2px solid #20c997;border-radius:12px;padding:20px;width:320px;font-family:monospace;box-shadow:0 8px 18px rgba(0,0,0,.5);cursor:move;user-select:none;';
    
    // Add custom scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
      #prcStoreContent::-webkit-scrollbar {
        width: 8px;
      }
      #prcStoreContent::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
      }
      #prcStoreContent::-webkit-scrollbar-thumb {
        background: #20c997;
        border-radius: 4px;
      }
      #prcStoreContent::-webkit-scrollbar-thumb:hover {
        background: #1ba085;
      }
    `;
    document.head.appendChild(style);
    store.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:15px;cursor:move;">
        <div style="font-weight:800;color:#9CF;font-size:16px;">💎 Premium RevCoins Store</div>
        <button id="prcStoreMinimize" style="background: none; border: none; color: #9CF; font-size: 14px; cursor: pointer; padding: 0; margin: 0;">−</button>
      </div>
      
      <div id="prcStoreContent" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
        <!-- Current Balance -->
        <div style="margin-bottom:15px;padding:10px;background:rgba(255,255,255,0.1);border-radius:8px;">
          <div style="font-weight:bold;color:#FFD700;margin-bottom:5px;">Premium RevCoins: <span id="prcStoreBalance">0</span></div>
          <div style="font-weight:bold;color:#20c997;margin-bottom:5px;">Regular RevCoins: <span id="prcStoreRCBalance">0</span></div>
        </div>
        
        <!-- Earn PRC Section -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:bold;color:#20c997;margin-bottom:10px;">Earn Premium RevCoins</div>
          <button id="btnEarnPRCStore" style="width:100%;background:#20c997;border:none;color:#fff;padding:12px;border-radius:8px;font-weight:700;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:8px;">
            📺 Watch Ad to Earn Premium RevCoins
          </button>
          <div style="font-size:12px;color:#CCC;margin-bottom:5px;">• Watch ads to earn 1-20 Premium RevCoins</div>
          <div style="font-size:12px;color:#CCC;">• Use for Elite plots and special features</div>
        </div>
        
        <!-- Regular RevCoins Bundles Section -->
        <div style="margin-bottom:15px;">
          <div style="font-weight:bold;color:#FFD700;margin-bottom:10px;display:flex;align-items:center;gap:5px;">
            🏦 Regular RevCoins Bundles
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <button id="btnBuy100RC" style="background:#ff6b35;border:none;color:#fff;padding:8px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Buy 100 RC ($5)</button>
            <button id="btnBuy300RC" style="background:#ff6b35;border:none;color:#fff;padding:8px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Buy 300 RC ($10)</button>
            <button id="btnBuy450RC" style="background:#ff6b35;border:none;color:#fff;padding:8px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Buy 450 RC ($15)</button>
            <button id="btnBuy1000RC" style="background:#ff6b35;border:none;color:#fff;padding:8px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Buy 1000 RC ($20)</button>
          </div>
          <div style="font-size:11px;color:#CCC;margin-bottom:5px;">• Simulated purchases for testing</div>
          <div style="font-size:11px;color:#CCC;">• Use for regular plot claims</div>
        </div>
        
        <!-- Purchase Bundles Section -->
        <div style="margin-bottom:15px;">
          <div style="font-weight:bold;color:#FFD700;margin-bottom:10px;display:flex;align-items:center;gap:5px;">
            🛒 Premium RevCoins Bundles
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <button id="btnBuy20PRC" style="background:#ff6b35;border:none;color:#fff;padding:8px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Buy 20 PRC ($1)</button>
            <button id="btnBuy120PRC" style="background:#ff6b35;border:none;color:#fff;padding:8px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Buy 120 PRC ($5)</button>
            <button id="btnBuy300PRC" style="background:#ff6b35;border:none;color:#fff;padding:8px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Buy 300 PRC ($10)</button>
            <button id="btnBuy800PRC" style="background:#ff6b35;border:none;color:#fff;padding:8px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Buy 800 PRC ($20)</button>
          </div>
          <div style="font-size:11px;color:#CCC;margin-bottom:5px;">• Simulated purchases for testing</div>
          <div style="font-size:11px;color:#CCC;">• Better value with larger bundles</div>
        </div>
        
        <!-- Audit Section -->
        <div id="auditSection" style="display:none;margin-bottom:15px;padding:10px;background:rgba(255,0,0,0.2);border-radius:8px;border:1px solid #ff4444;">
          <div style="font-weight:bold;color:#ff4444;margin-bottom:8px;">⚠️ Audit Infraction</div>
          <div style="font-size:12px;color:#CCC;margin-bottom:8px;">Clear by 3 ads or pay 125 PRC</div>
          <div style="display:flex;gap:8px;">
            <button id="btnWatchAuditAd" style="background:#ff4444;border:none;color:#fff;padding:6px 10px;border-radius:6px;font-weight:700;cursor:pointer;font-size:11px;">Watch Ad</button>
            <button id="btnPayAuditPRC" style="background:#ff8800;border:none;color:#fff;padding:6px 10px;border-radius:6px;font-weight:700;cursor:pointer;font-size:11px;">Pay 125 PRC</button>
          </div>
        </div>
        
        <!-- King's Draw Section -->
        <div style="margin-bottom:15px;padding:10px;background:rgba(255,215,0,0.1);border-radius:8px;border:1px solid #FFD700;">
          <div style="font-weight:bold;color:#FFD700;margin-bottom:8px;">👑 King's Draw</div>
          <div style="font-size:12px;color:#CCC;margin-bottom:5px;">Next Draw: <span id="prcStoreDrawCountdown" style="color:#FFD700;font-weight:bold;">7d 0h 0m 0s</span></div>
          <div style="font-size:12px;color:#CCC;margin-bottom:5px;">Prize Pool: <span id="prcStoreDrawPool" style="color:#FFD700;font-weight:bold;">0</span> PRC</div>
          <div style="font-size:12px;color:#CCC;">Entries: <span id="prcStoreDrawEntries" style="color:#FFD700;font-weight:bold;">0</span></div>
        </div>
      </div>
    `;
    document.body.appendChild(store);
    
    // Make store draggable
    this.makeDraggable(store);
    
    // Add minimize functionality
    const minimizeBtn = document.getElementById('prcStoreMinimize');
    const content = document.getElementById('prcStoreContent');
    if (minimizeBtn && content) {
      minimizeBtn.onclick = () => {
        if (content.style.display === 'none') {
          content.style.display = 'block';
          minimizeBtn.textContent = '−';
          store.style.width = '320px';
        } else {
          content.style.display = 'none';
          minimizeBtn.textContent = '+';
          store.style.width = 'auto';
        }
      };
    }
    
    // Add event listeners
    document.getElementById('btnEarnPRCStore').onclick = () => this.watchAdForPRC();
    document.getElementById('btnBuy100RC').onclick = () => this.simulatePurchaseRC(100, 5);
    document.getElementById('btnBuy300RC').onclick = () => this.simulatePurchaseRC(300, 10);
    document.getElementById('btnBuy450RC').onclick = () => this.simulatePurchaseRC(450, 15);
    document.getElementById('btnBuy1000RC').onclick = () => this.simulatePurchaseRC(1000, 20);
    document.getElementById('btnBuy20PRC').onclick = () => this.simulatePurchase(20, 1);
    document.getElementById('btnBuy120PRC').onclick = () => this.simulatePurchase(120, 5);
    document.getElementById('btnBuy300PRC').onclick = () => this.simulatePurchase(300, 10);
    document.getElementById('btnBuy800PRC').onclick = () => this.simulatePurchase(800, 20);
    document.getElementById('btnWatchAuditAd').onclick = () => this.watchAuditAd();
    document.getElementById('btnPayAuditPRC').onclick = () => this.payAuditWithPRC();
    
    // Update store display
    this.updatePRCStoreDisplay();
  };

  // Update PRC Store display
  updatePRCStoreDisplay() {
    const balanceEl = document.getElementById('prcStoreBalance');
    const rcBalanceEl = document.getElementById('prcStoreRCBalance');
    const drawCountdownEl = document.getElementById('prcStoreDrawCountdown');
    const drawPoolEl = document.getElementById('prcStoreDrawPool');
    const drawEntriesEl = document.getElementById('prcStoreDrawEntries');
    const auditSection = document.getElementById('auditSection');
    
    if (balanceEl) balanceEl.textContent = this.premiumRevCoins || 0;
    if (rcBalanceEl) rcBalanceEl.textContent = this.revCoins || 0;
    
    if (drawCountdownEl && this.nextDrawTime) {
      const timeUntilDraw = this.nextDrawTime - Date.now();
      if (timeUntilDraw > 0) {
        const days = Math.floor(timeUntilDraw / (24 * 60 * 60 * 1000));
        const hours = Math.floor((timeUntilDraw % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((timeUntilDraw % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((timeUntilDraw % (60 * 1000)) / 1000);
        drawCountdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    }
    
    if (drawPoolEl) drawPoolEl.textContent = this.kingsDrawPool || 0;
    if (drawEntriesEl) drawEntriesEl.textContent = this.kingsDrawEntries || 0;
    
    // Show/hide audit section
    if (auditSection) {
      auditSection.style.display = this.auditFineActive ? 'block' : 'none';
    }
  };

  // Simulate PRC purchase
  simulatePurchase(amount, cost) {
    const confirmed = confirm(`Simulate purchase of ${amount} Premium RevCoins for $${cost}?\n\nThis is a test purchase - no real money will be charged.`);
    if (confirmed) {
      this.premiumRevCoins = (this.premiumRevCoins || 0) + amount;
      this.updatePRCStoreDisplay();
      this.updateCurrencyDisplay();
      
      // Track cash deposit for economy monitoring
      this.trackCashDeposit(cost, 'USD');
      this.trackPlayerEngagement('purchased_prc');
      
      toast(this, `💰 Purchased ${amount} Premium RevCoins! (Simulated)`);
    }
  };

  // Simulate RC purchase
  simulatePurchaseRC(amount, cost) {
    const confirmed = confirm(`Simulate purchase of ${amount} Regular RevCoins for $${cost}?\n\nThis is a test purchase - no real money will be charged.`);
    if (confirmed) {
      this.revCoins = (this.revCoins || 0) + amount;
      this.updatePRCStoreDisplay();
      this.updateCurrencyDisplay();
      
      // Track cash deposit for economy monitoring
      this.trackCashDeposit(cost, 'USD');
      this.trackPlayerEngagement('purchased_rc');
      
      toast(this, `💰 Purchased ${amount} Regular RevCoins! (Simulated)`);
    }
  };

  // Enhanced watch ad for PRC function
  watchAdForPRC() {
    const confirmed = confirm("📺 Watch an ad to earn Premium RevCoins?\n\nYou'll earn 1-20 PRC randomly.");
    if (confirmed) {
      alert("📺 Ad completed! Rolling for PRC...");
      const gain = Math.floor(1 + Math.random() * 20); // 1-20 PRC
      this.premiumRevCoins = (this.premiumRevCoins || 0) + gain;
      this.updatePRCStoreDisplay();
      this.updateCurrencyDisplay();
      
      // Track ad watched for economy monitoring
      this.trackAdWatched('prc_reward');
      this.trackPlayerEngagement('watched_ad_for_prc');
      
      // Use window.toast directly to avoid context issues
      if (typeof window.toast === 'function') {
        window.toast(`🎁 Earned ${gain} Premium RevCoins from ad!`, 'success');
      } else {
        toast(this, `🎁 Earned ${gain} Premium RevCoins from ad!`);
      }
    }
  };

}

/* ========= EmpireClick DOM Patch: UI + Actions (no THREE) ========= */
/* Safe-define helper: only set if not already a function */
function _def(o, name, fn) { if (typeof o[name] !== 'function') o[name] = fn; }

/* ---------- Shared helpers ---------- */
_def(EmpireClickGame.prototype, '_pushTreasury', function(amount) {
  if (!amount || amount <= 0) return;
  this.treasuryPool = (this.treasuryPool || 0) + amount;
  const el = document.getElementById('treasuryPoolDisplay');
  if (el) el.textContent = this.treasuryPool.toFixed(2);
});

_def(EmpireClickGame.prototype, '_toast', function(msg) {
  // Use the new polished toast system if available
  if (typeof window.showToast === 'function') {
    // Determine toast type based on message content
    let type = 'info';
    if (msg.includes('✅') || msg.includes('💰') || msg.includes('🏆') || msg.includes('🎲')) {
      type = 'success';
    } else if (msg.includes('❌') || msg.includes('Not enough') || msg.includes('No')) {
      type = 'error';
    }
    window.showToast(msg, type, 3000);
  } else {
    // Fallback to old system
    const box = document.getElementById('gameMessage');
    if (!box) { alert(msg); return; }
    box.textContent = msg;
    box.style.display = 'block';
    setTimeout(() => (box.style.display = 'none'), 2500);
  }
});

_def(EmpireClickGame.prototype, '_nowSec', () => Math.floor(Date.now() / 1000));

/* ---------- Rank / stats UI ---------- */
_def(EmpireClickGame.prototype, 'updateStatsPanel', function() {
  // Rank by plots owned
  const owned = this.plotsClaimed || 0;
  let rank = 'Peasant', next = 'Knight', need = 10, have = owned;
  if (owned >= 100) { rank = 'King/Queen'; next = '—'; need = 0; }
  else if (owned >= 50) { rank = 'Lord/Nobleman'; next = 'King/Queen'; need = 100 - owned; }
  else if (owned >= 10) { rank = 'Knight'; next = 'Lord/Nobleman'; need = 50 - owned; }

  const curEl = document.getElementById('currentRankDisplay');
  const empRank = document.getElementById('empireRankDisplay');
  const nextEl = document.getElementById('nextRankDisplay');
  if (curEl) curEl.textContent = rank;
  if (empRank) empRank.textContent = rank;
  if (nextEl) nextEl.textContent = next;

  const goal = rank === 'Peasant' ? 10 : rank === 'Knight' ? 50 : rank === 'Lord/Nobleman' ? 100 : owned;
  const pct = Math.min(100, Math.floor((owned / goal) * 100));
  const fill1 = document.getElementById('rankProgressFill');
  const text1 = document.getElementById('rankProgressText');
  const fill2 = document.getElementById('empireProgressFill');
  const text2 = document.getElementById('empireProgressText');
  if (fill1) fill1.style.width = pct + '%';
  if (text1) text1.textContent = `${owned} / ${goal} plots`;
  if (fill2) fill2.style.width = pct + '%';
  if (text2) text2.textContent = `${owned} / ${goal} plots`;

  // Achievements summary
  const pts = this.achievementPoints || 0;
  const ptsEl = document.getElementById('achievementPointsDisplay');
  const ptsPanel = document.getElementById('achievementPointsPanelDisplay');
  if (ptsEl) ptsEl.textContent = pts;
  if (ptsPanel) ptsPanel.textContent = pts;

  // Totals
  const ownedStats = document.getElementById('plotsOwnedStatsDisplay');
  const totalEarn = document.getElementById('totalEarningsStatsDisplay');
  const loginStreakStats = document.getElementById('loginStreakStatsDisplay');
  if (ownedStats) ownedStats.textContent = owned;
  if (totalEarn) totalEarn.textContent = this.earnings.toFixed(8);
  if (loginStreakStats) loginStreakStats.textContent = this.loginStreak || 0;
});

/* ---------- Currency/boost/draw UI ---------- */
_def(EmpireClickGame.prototype, 'updateCurrencyDisplay', function() {
  const rev = document.getElementById('revCoinsDisplay');
  const prc = document.getElementById('premiumRevCoinsDisplay');
  if (rev) rev.textContent = Math.floor(this.revCoins);
  if (prc) prc.textContent = Math.floor(this.premiumRevCoins || 0);
});

_def(EmpireClickGame.prototype, 'updateBoostUI', function() {
  const el = document.getElementById('boostDisplay');
  const mult = document.getElementById('boostMultiplier');
  const time = document.getElementById('boostTimeLeft');
  const sec = Math.max(0, this.boostSecondsRemaining | 0);
  if (el) el.textContent = sec + 's';
  if (mult) mult.textContent = this.boostSecondsRemaining > 0 ? '2.0x' : '1.0x';
  if (time) time.textContent = sec + 's';
});

_def(EmpireClickGame.prototype, 'updateDrawsUI', function() {
  const d = document.getElementById('drawsDisplay');
  const e = document.getElementById('kingsDrawEntriesDisplay');
  const pool = document.getElementById('kingsDrawPoolDisplay');
  if (d) d.textContent = this.drawsUsed || 0;
  if (e) e.textContent = this.kingsDrawEntries || 0;
  if (pool) pool.textContent = Math.floor(this.kingsDrawPool || 0);
});

/* ---------- Daily login UI (streak/bonus) ---------- */
_def(EmpireClickGame.prototype, 'updateLoginUI', function() {
  const streak = document.getElementById('loginStreakDisplay');
  const bonus = document.getElementById('loginBonusDisplay');
  const status = document.getElementById('loginStatus');
  if (streak) streak.textContent = this.loginStreak || 0;
  if (bonus) bonus.textContent = (this.dailyLoginBonus || 1).toFixed(2) + 'x';
  if (status) status.textContent = this.dailyLoginAvailable ? 'Daily login available!' : 'Already claimed';
});

/* ---------- Earnings panel convenience ---------- */
_def(EmpireClickGame.prototype, 'updateEarningsDisplay', function() {
  const cur = document.getElementById('currentEarningsDisplay');
  const wd  = document.getElementById('withdrawalBalanceDisplay');
  const rate = document.getElementById('earningsRateDisplay');
  const base = document.getElementById('baseEarningsDisplay');
  if (cur) cur.textContent = this.earnings.toFixed(8);
  if (wd)  wd.textContent  = this.withdrawalBalance.toFixed(8);
  if (rate) rate.textContent = this.earningsPerSecond.toFixed(8);
  if (base) base.textContent = this.baseEarningsPerSecond.toFixed(8);
});

/* ---------- Button handlers ---------- */
// 1) Withdraw Earnings → moves withdrawalBalance into RevCoins
_def(EmpireClickGame.prototype, 'withdrawEarnings', function() {
  const amt = this.withdrawalBalance || 0;
  if (amt <= 0) return this._toast('Nothing to withdraw yet.');
  this.revCoins += amt;
  this.withdrawalBalance = 0;
  this._toast(`💰 Withdrawn ${amt.toFixed(8)} RevCoins`);
  this.updateCurrencyDisplay();
  this.updateEarningsDisplay();
});

// 2) Daily login (watch ad → random earnings bonus); already existed, but ensure UI refresh
(function(gp){
  const orig = gp.claimDailyLogin;
  gp.claimDailyLogin = function() {
    if (typeof orig === 'function') orig.call(this);
    this.updateLoginUI();
    this.startEarnings();
  };
})(EmpireClickGame.prototype);

// 3) King's Draw (entries consume RevCoins; prize is Treasury % + flat bonus)
_def(EmpireClickGame.prototype, 'enterKingsDraw', function() {
  if (!this.kingsDrawEnabled) return this._toast('The King\'s Draw is closed.');
  const cost = 100; // RevCoins per entry
  if (this.revCoins < cost) return this._toast('Not enough RevCoins for an entry.');
  this.revCoins -= cost;
  this.kingsDrawEntries = (this.kingsDrawEntries || 0) + 1;
  this.kingsDrawPool = (this.kingsDrawPool || 0) + Math.floor(cost * 0.9); // 10% sink
  this.drawsUsed = (this.drawsUsed || 0) + 1;
  this.updateCurrencyDisplay();
  this.updateDrawsUI();
  this._toast('🎲 Entered the King\'s Draw!');
});

_def(EmpireClickGame.prototype, 'claimKingsDraw', function() {
  // naive draw: 1 entry → small chance (for prototype)
  if ((this.kingsDrawEntries || 0) <= 0) return this._toast('No entries to claim from.');
  const win = Math.random() < 0.05; // 5% chance
  if (!win) { this._toast('No luck this time.'); this.kingsDrawEntries = 0; this.updateDrawsUI(); return; }
  const prize = Math.max(50, Math.floor((this.kingsDrawPool || 0) * 0.25)); // 25% of pool min 50
  this.revCoins += prize;
  this.kingsDrawPool = Math.max(0, (this.kingsDrawPool || 0) - prize);
  this.kingsDrawEntries = 0;
  this.updateCurrencyDisplay();
  this.updateDrawsUI();
  this._toast(`🏆 You won ${prize} RevCoins from the King\'s Draw!`);
});

// 4) Tax cycle & boosts (works like audit infraction: 3 ads OR pay 125 PRC)
_def(EmpireClickGame.prototype, 'payTax', function() {
  // Pay 125 PRC to clear property tax immediately
  const cost = 125;
  if ((this.premiumRevCoins || 0) < cost) return this._toast('Not enough Premium RevCoins (125 required).');
  this.premiumRevCoins -= cost;
  this.addTreasuryPRC?.(cost, 'Property Tax Payment');
  this.clearPropertyTax();
  this.updateCurrencyDisplay?.();
  this._toast('✅ Property tax cleared with PRC.');
});

_def(EmpireClickGame.prototype, 'boostTax', function() {
  // Watch ad to progress toward clearing property tax (3 ads needed)
  this.propertyTaxAdsWatched = (this.propertyTaxAdsWatched || 0) + 1;
  this._toast(`📺 Property tax ad watched: ${this.propertyTaxAdsWatched}/3`);
  
  // Track ad watched for economy monitoring
  this.trackAdWatched('property_tax');
  this.trackPlayerEngagement('watched_ad_for_property_tax');
  
  if (this.propertyTaxAdsWatched >= 3) {
    this.clearPropertyTax();
    this._toast('✅ Property tax cleared by ads.');
  }
  this.updatePropertyTaxProgress();
});

_def(EmpireClickGame.prototype, 'updatePropertyTaxProgress', function() {
  const progressEl = document.getElementById('propertyTaxProgress');
  if (progressEl) {
    progressEl.textContent = `${this.propertyTaxAdsWatched || 0}/3`;
  }
});

_def(EmpireClickGame.prototype, 'toggleMusicMinimize', function() {
  const musicPanel = document.getElementById('musicControls');
  const minimizeBtn = document.getElementById('musicMinimize');
  if (musicPanel && minimizeBtn) {
    musicPanel.classList.toggle('minimized');
    minimizeBtn.textContent = musicPanel.classList.contains('minimized') ? '+' : '−';
  }
});

_def(EmpireClickGame.prototype, 'clearPropertyTax', function() {
  // Reset 6h tax timer and clear ad progress
  this.lastTaxPaid = Date.now();
  this.taxBoostActive = false;
  this.taxBoostTime = 0;
  this.wealthTaxEfficiency = 1.0;
  this.propertyTaxAdsWatched = 0;
  const nextEl = document.getElementById('nextTaxDisplay');
  if (nextEl) nextEl.textContent = '6 hours';
  const taxStatusEl = document.getElementById('taxStatusDisplay');
  if (taxStatusEl) taxStatusEl.textContent = 'Active';
  const taxEfficiencyEl = document.getElementById('taxEfficiencyDisplay');
  if (taxEfficiencyEl) taxEfficiencyEl.textContent = '100%';
  this.updatePropertyTaxProgress();
});

// 5) Land Takeover (cost 125 PRC; 100 burned, 25 to Treasury)
_def(EmpireClickGame.prototype, 'initiateTakeover', function() {
  const cost = 125;
  if ((this.premiumRevCoins || 0) < cost) return this._toast('Not enough Premium RevCoins (125 needed).');
  this.premiumRevCoins -= cost;
  this._pushTreasury(25); // admin money
  // mark "pendingTakeover" flag – for prototype we instantly allow claim
  this._pendingTakeover = true;
  this.updateCurrencyDisplay();
  const takeoverStatusEl = document.getElementById('takeoverStatus');
  if (takeoverStatusEl) takeoverStatusEl.replaceChildren(document.createTextNode('In progress – claim when ready'));
  this._toast('⚔️ Takeover initiated.');
});

_def(EmpireClickGame.prototype, 'claimTakeover', function() {
  if (!this._pendingTakeover) return this._toast('No takeover to claim.');
  this._pendingTakeover = false;
  // Reward: pick a random unclaimed plot and give it to player
  const free = this.plots.find(p => !p.claimed);
  if (!free) return this._toast('No available plots.');
  // mimic claim flow (no extra cost)
  free.claimed = true;
  free.owner = this.playerName;
  free.rarity = this.getRandomRarity();
  free.element.classList.add('claimed', free.rarity);
  this.plotsClaimed++;
  this.earnings += (this.rarityRates[free.rarity] || 0);
  this.updateStatsPanel();
  this.updateUI();
  this._toast(`🏴‍☠️ Takeover success! You gained a ${free.rarity} plot.`);
});

// 6) Treasury claim/donate
_def(EmpireClickGame.prototype, 'claimTreasury', function() {
  // Simple rev share: 1% of current pool as a claim (prototype)
  const pool = this.treasuryPool || 0;
  const share = Math.floor(pool * 0.01);
  if (share <= 0) return this._toast('Treasury is empty.');
  this.revCoins += share;
  this.treasuryPool = pool - share;
  this.updateCurrencyDisplay();
  const treasuryPoolEl = document.getElementById('treasuryPoolDisplay');
  if (treasuryPoolEl) treasuryPoolEl.replaceChildren(document.createTextNode(this.treasuryPool.toFixed(2)));
  this._toast(`💰 Claimed ${share} from the Treasury.`);
});

_def(EmpireClickGame.prototype, 'donateToTreasury', function() {
  const amt = prompt('Donate how many RevCoins to the Treasury?', '100');
  const n = Math.max(0, Math.floor(Number(amt || 0)));
  if (!n) return;
  if (this.revCoins < n) return this._toast('Not enough RevCoins.');
  this.revCoins -= n;
  this._pushTreasury(n);
  this.updateCurrencyDisplay();
  this._toast(`💝 Donated ${n} to the Treasury.`);
});

// 7) Achievements modal
_def(EmpireClickGame.prototype, 'showAchievements', function() {
  const m = document.getElementById('achievementsModal');
  const list = document.getElementById('achievementsList');
  if (!m || !list) return;
  list.innerHTML = '';
  this.achievements.forEach(a => {
    const row = document.createElement('div');
    row.className = 'achievement-item' + (a.completed ? ' completed' : '');
    row.innerHTML = `<div class="achievement-icon">${a.icon}</div>
      <div>
        <div><strong>${a.name}</strong></div>
        <div>${a.description} · +${a.points} pts</div>
      </div>`;
    list.appendChild(row);
  });
  m.style.display = 'flex';
});
_def(EmpireClickGame.prototype, 'closeAchievementsModal', function() {
  const m = document.getElementById('achievementsModal');
  if (m) m.style.display = 'none';
});

// 8) Leaderboard modal (local mock)
_def(EmpireClickGame.prototype, 'showLeaderboard', function() {
  const m = document.getElementById('leaderboardModal');
  const list = document.getElementById('leaderboardList');
  if (!m || !list) return;
  const players = [
    { name: this.playerName, plots: this.plotsClaimed, pts: this.achievementPoints || 0 },
    { name: 'Ava', plots: 42, pts: 180 },
    { name: 'Zed', plots: 18, pts: 60 },
    { name: 'Kai', plots: 9,  pts: 30 }
  ].sort((a,b)=> (b.plots*2+b.pts) - (a.plots*2+a.pts));
  list.innerHTML = '';
  players.forEach((p,i) => {
    const row = document.createElement('div');
    row.className = 'leaderboard-item rank-' + (i+1);
    row.innerHTML = `<div>#${i+1} ${p.name}</div><div>${p.plots} plots · ${p.pts} pts</div>`;
    list.appendChild(row);
  });
  m.style.display = 'flex';
});
_def(EmpireClickGame.prototype, 'closeLeaderboardModal', function() {
  const m = document.getElementById('leaderboardModal');
  if (m) m.style.display = 'none';
});

// 9) Audit Infraction flow
_def(EmpireClickGame.prototype, 'triggerAuditInfractionIfOverdue', function() {
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  if (!this.lastTaxPaid) this.lastTaxPaid = Date.now();
  if (Date.now() - this.lastTaxPaid < threeDaysMs) return;
  this.auditInfractionActive = true;
  this.auditFineAdsWatched = 0;
  alert('⚠️ Audit Infraction: You have not cleared property tax in 3 days.\nWatch 3 ads or pay 100 PRC.');
});

_def(EmpireClickGame.prototype, 'watchAuditAd', function() {
  if (!this.auditInfractionActive) return this._toast('No audit infraction active.');
  alert('📺 Ad watched (1/3).');
  this.auditFineAdsWatched = (this.auditFineAdsWatched || 0) + 1;
  if (this.auditFineAdsWatched >= 3) {
    this.auditInfractionActive = false;
    this.auditFineAdsWatched = 0;
    this._toast('✅ Audit infraction cleared. Now renew your 6h tax by watching 3 property-tax ads.');
  } else {
    this._toast(`Progress: ${this.auditFineAdsWatched}/3`);
  }
});

_def(EmpireClickGame.prototype, 'payAuditWithPRC', function() {
  if (!this.auditInfractionActive) return this._toast('No audit infraction active.');
  const cost = 100;
  if ((this.premiumRevCoins || 0) < cost) return this._toast('Not enough PRC (100 needed).');
  this.premiumRevCoins -= cost;
  this.auditInfractionActive = false;
  this.auditFineAdsWatched = 0;
  this.updateCurrencyDisplay();
  this._toast('✅ Audit infraction cleared via PRC.');
});

// 10) Ads → earn PRC (free) - REMOVED to avoid conflicts

// 11) Exploration modal close
_def(EmpireClickGame.prototype, 'closeExplorationModal', function() {
  const explorationModal = document.getElementById('explorationModal');
  if (explorationModal && explorationModal.style) {
    explorationModal.style.display = 'none';
  }
});

/* ---------- Wire periodic checks ---------- */
(function(gp){
  const origInit = gp.init;
  gp.init = function() {
    if (typeof origInit === 'function') origInit.call(this);
    // Replace any stray UI placeholders
    this.updateCurrencyDisplay();
    this.updateBoostUI();
    this.updateDrawsUI();
    this.updateLoginUI();
    this.updateStatsPanel();

    // Timers
    setInterval(() => {
      // countdown for boost
      if (this.boostSecondsRemaining > 0) {
        this.boostSecondsRemaining--;
        this.updateBoostUI();
      }
      // tax due & audit infraction watcher
      const since = Date.now() - (this.lastTaxPaid || Date.now());
      const left = Math.max(0, 6*3600*1000 - since);
      const nextEl = document.getElementById('nextTaxDisplay');
      if (nextEl) {
        const hrs = Math.floor(left/3600000), mins = Math.floor((left%3600000)/60000);
        nextEl.textContent = `${hrs}h ${mins}m`;
      }
      this.triggerAuditInfractionIfOverdue();
    }, 1000);
  };
})(EmpireClickGame.prototype);

/* ========= End DOM Patch ========= */

/* ======================================================================
   RevEmpire — ONE-BLOCK PATCH (Events + Elite Pricing + PRC Ads + Audit Fine)
   Paste at the very end of game.js (or in a <script> after ui.js).
   ====================================================================== */
;(function(){
  if (typeof window.EmpireClickGame !== 'function') return;
  const P = window.EmpireClickGame.prototype;

  // ---------- small helpers ----------
  function text(id, v){ const el = document.getElementById(id); if (el) el.textContent = v; }
  function toast(game, msg){
    // Ensure msg is a string
    if (typeof msg !== 'string') {
      console.error('toast received non-string message:', msg);
      msg = String(msg);
    }
    
    if (typeof window.toast === 'function') return window.toast(msg, 'success');
    if (typeof game._toast === 'function') return game._toast.call(game, msg);
    const gm = document.getElementById('gameMessage');
    if (gm){ gm.style.display='block'; gm.textContent=msg; setTimeout(()=>gm.style.display='none', 2500); }
    else alert(msg);
  }

  // ---------- internal treasury (no UI) ----------
  if (typeof P.addTreasuryPRC !== 'function') {
    P.addTreasuryPRC = function(amount, note){
      this.__treasuryPRC = (this.__treasuryPRC||0) + (amount||0);
      // Add to King's Draw pool
      this.kingsDrawPool = (this.kingsDrawPool || 0) + (amount || 0);
      this.kingsDrawEntries = (this.kingsDrawEntries || 0) + 1;
      console.log(`💰 Treasury: +${amount} PRC from ${note}. Pool: ${this.kingsDrawPool}`);
      // Update King's Draw display if available
      if (this.updateKingsDrawDisplay) {
        this.updateKingsDrawDisplay();
      }
      // Update PRC Store display if available
      if (this.updatePRCStoreDisplay) {
        this.updatePRCStoreDisplay();
      }
    };
  }

  // ---------- make sure fields exist at runtime ----------
  const _init = P.init;
  P.init = function(){
    // Event durations
    this.EVENTS = this.EVENTS || {
      'Lucky Surge':           { durationSec: 6*3600 },
      'Land Takeover Madness': { durationSec: 6*3600 },
      'Audit Infraction':      { durationSec: 6*3600 },
      'Kings Festival':        { durationSec: 3*3600 },
    };
    this.activeEvent = this.activeEvent ?? null;
    this.eventTimer  = this.eventTimer  ?? 0;

    // Audit state
    this.auditFineActive = !!this.auditFineActive;         // audit "on/paused earnings"
    this.auditFineAdsWatched = this.auditFineAdsWatched||0;// 0..3
    this.auditStartAt = this.auditStartAt || 0;            // when audit started
    this.auditClearDeadlineMs = this.auditClearDeadlineMs || 3*24*3600*1000; // 3 days
    this.outstandingFinePRC = this.outstandingFinePRC || 0;// 500 PRC fine after 3 days

    // Kings draw state
    this.kingsDrawTicketOwners = this.kingsDrawTicketOwners || [];
    this.kingsDrawEndAt = this.kingsDrawEndAt || (Date.now() + 7*24*3600*1000);
    this.kingsDrawWinner = this.kingsDrawWinner || null;
    this.kingsDrawClaimed = !!this.kingsDrawClaimed;

    if (typeof _init === 'function') _init.call(this);

    // tickers
    // Event ticking handled by main event system
    // Event UI updates handled by main updateEventDisplay function
    if (!this.__drawTicker) this.__drawTicker = setInterval(()=> this.resolveKingsDrawIfDue?.(), 1000);

    // PRC Store is now handled by createPRCStore() in the main init
    this.updateEventDisplay();
  };

  // ---------- Events UI ----------
  // Using main updateEventDisplay function instead of conflicting updateEventUI

  // REMOVED: Conflicting event system - using main event system instead

  // ---------- Audit actions ----------
  P.watchAuditAd = P.watchAuditAd || function(){
    if (!this.auditFineActive) return toast(this,'No audit to clear.');
    this.auditFineAdsWatched = (this.auditFineAdsWatched||0) + 1;
    toast(this, `📺 Audit ad watched: ${this.auditFineAdsWatched}/3`);
    
    // Track ad watched for economy monitoring
    this.trackAdWatched('audit_infraction');
    this.trackPlayerEngagement('watched_ad_for_audit');
    
    if (this.auditFineAdsWatched >= 3) {
      this.auditFineActive = false;
      this.auditStartAt = 0;
      this.auditFineAdsWatched = 0;
      toast(this, '✅ Audit cleared by ads. Remember to clear property tax to resume the 6h cycle.');
    }
    this.updateEventDisplay();
  };

  P.payAuditWithPRC = P.payAuditWithPRC || function(){
    if (!this.auditFineActive) return toast(this,'No audit to clear.');
    const cost = 125;
    if ((this.premiumRevCoins||0) < cost) return toast(this,'Not enough PRC (125 required).');
    this.premiumRevCoins -= cost;
    this.addTreasuryPRC(cost, 'Audit Settlement');
    this.auditFineActive = false;
    this.auditStartAt = 0;
    this.auditFineAdsWatched = 0;
    this.updateCurrencyDisplay?.(); this.updateEventDisplay();
    toast(this,'✅ Audit cleared with PRC.');
  };

  // Outstanding fine payment (500 PRC) — can pay in parts if you want; here: one-shot
  P.payOutstandingFinePRC = P.payOutstandingFinePRC || function(){
    const due = this.outstandingFinePRC||0;
    if (due <= 0) return toast(this,'No outstanding fine.');
    if ((this.premiumRevCoins||0) < due) return toast(this,`Not enough PRC to pay fine (${due}).`);
    this.premiumRevCoins -= due;
    this.addTreasuryPRC(due, 'Audit Overdue Fine');
    this.outstandingFinePRC = 0;
    this.updateCurrencyDisplay?.(); this.updateEventDisplay();
    toast(this,'✅ Outstanding fine paid.');
  };

  // ---------- PRC via ads (random 10–50 PRC) + small widget ----------
  // REMOVED to avoid conflicts with main watchAdForPRC function

  function injectPRCWidget(game){
    if (document.getElementById('earnPRCWidget')) return;
    const box = document.createElement('div');
    box.id = 'earnPRCWidget';
    box.className = 'overlay-panel ec-glass';
    box.style.cssText = 'right:20px;bottom:120px;width:240px;font-family:monospace;';
    box.innerHTML = `
      <button class="minimize-btn" id="prcWidgetMinimize">−</button>
      <div class="overlay-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:6px;cursor:move;">
          <div style="font-weight:800;color:#9CF;">💎 Premium RevCoins</div>
        </div>
        <div id="prcWidgetContent">
          <div style="display:flex;gap:8px;">
            <button id="btnEarnPRC" style="background:#20c997;border:none;color:#fff;padding:6px 10px;border-radius:8px;font-weight:700;cursor:pointer;">Watch Ad (+PRC)</button>
            <button id="btnPayFinePRC" style="background:#0dcaf0;border:none;color:#000;padding:6px 10px;border-radius:8px;font-weight:700;cursor:pointer;">Pay Fine</button>
          </div>
          <div id="prcHint" style="margin-top:6px;font-size:12px;opacity:.8;">Ads grant 10–50 PRC.</div>
        </div>
      </div>
    `;
    document.body.appendChild(box);
    document.getElementById('btnEarnPRC').onclick = ()=> game.watchAdForPRC();
    document.getElementById('btnPayFinePRC').onclick = ()=> game.payOutstandingFinePRC();
    
    // Make widget draggable
    game.makeDraggable(box);
    
    // Add minimize functionality
    const minimizeBtn = document.getElementById('prcWidgetMinimize');
    if (minimizeBtn) {
      minimizeBtn.onclick = () => {
        box.classList.toggle('minimized');
        minimizeBtn.textContent = box.classList.contains('minimized') ? '+' : '−';
      };
    }
  }

  // ---------- Kings Festival (2× earnings) ----------
  if (!P.__festivalWrap){
    P.__festivalWrap = true;
    const _startE = P.startEarnings;
    P.startEarnings = function(){
      if (typeof _startE === 'function') _startE.call(this);
      if (this.activeEvent === 'Kings Festival') {
        const extra = this.baseEarningsPerSecond || 0;
        this.earnings += extra;
        this.withdrawalBalance += extra;
        this.earningsPerSecond = (this.earningsPerSecond||0) + extra;
        this.updateEarningsDisplay?.();
      }
    };
  }

  // ---------- Elite pricing (ONLY Elite uses PRC) ----------
  // Normal Elite: 400 PRC total (300 + 100 to Treasury)
  // Event (Land Takeover Madness): 125 PRC total (100 + 25 to Treasury)
  const EPS_COIN = 0.00000001;
  P.confirmClaimPlot = function(){
    if (!this.plotToClaim) return;
    const plot = this.plotToClaim;
    const rarity = this.getRandomRarity ? this.getRandomRarity() : 'Common';
    this.pendingRarity = rarity;

    let spendRev = 0, spendPRC = 0, treasuryPRC = 0;

    if (rarity !== 'Elite') {
      // Non-Elite = RC only (100)
      spendRev = 100;
    } else {
      const madness = (this.activeEvent === 'Land Takeover Madness');
      if (madness) { spendPRC = 100; treasuryPRC = 25; }   // 125 total
      else         { spendPRC = 300; treasuryPRC = 100; }  // 400 total
    }

    // Check balances
    if (spendRev > 0) {
      if ((this.revCoins||0) < spendRev) return alert(`Not enough RevCoins (${spendRev}).`);
    } else {
      const need = spendPRC + treasuryPRC;
      if ((this.premiumRevCoins||0) < need) return alert(`Not enough PRC (${need}).`);
    }

    // Deduct + Treasury (no public UI)
    if (spendRev > 0) {
      this.revCoins -= spendRev;
    } else {
      const need = spendPRC + treasuryPRC;
      this.premiumRevCoins -= need;
      this.addTreasuryPRC(treasuryPRC, 'Elite Plot Purchase');
    }

    // Apply plot + earnings
    this.earnings += (this.rarityRates?.[rarity] || 0);
    plot.claimed = true; plot.owner = this.playerName; plot.rarity = rarity;
    plot.element?.classList?.add('claimed', rarity);

    plot.name = plot.name || (this.generatePlotName ? this.generatePlotName() : `Plot ${plot.index+1}`);
    const tooltip = plot.element?.querySelector?.('.plot-tooltip');
    if (tooltip) {
      const earnings = this.rarityRates?.[rarity] || 0;
      tooltip.innerHTML = `
        <strong>${plot.name}</strong><br>
        Building: ${this.getBuildingName ? this.getBuildingName(rarity) : rarity}<br>
        Rarity: ${rarity}<br>
        Owner: ${this.playerName}<br>
        Earnings: ${earnings.toFixed(8)}/sec<br>
        Explorations: 3 left
      `;
    }

    this.plotsClaimed = (this.plotsClaimed||0) + 1;
    this.checkAchievements?.(); this.updateUI?.();

    try { if (window.renderModelOnPlot) window.renderModelOnPlot(plot.element, rarity); } catch(e){}
    alert(`🏗️ You successfully claimed a ${rarity} plot!`);
  };

  // ---------- Exploration with Lucky Surge (+25% relative) ----------
  P.explorePlot = function(){
    if (!this.plotToExplore) return alert('No plot selected for exploration.');
    if ((this.finds||0) <= 0) return alert('No finds available! Watch an ad to get +2 finds.');
    this.finds--;

    let t3 = 0.05, t2 = 0.20, t1 = 0.50;
    if (this.activeEvent === 'Lucky Surge') {
      t3 = Math.min(1, t3*1.25); t2 = Math.min(1, t2*1.25); t1 = Math.min(1, t1*1.25);
    }
    let reward = 0, roll = Math.random();
    if (roll < t3) reward = 3;
    else if (roll < t2) reward = 2;
    else if (roll < t1) reward = 1;



    if (reward > 0) {
      this.revCoins += reward;
      const bonus = reward * EPS_COIN;
      this.earnings += bonus; this.withdrawalBalance += bonus;
      alert(`✨ You explored and found ${reward} RevCoin(s)!`);
    } else {
      alert('❌ You explored but found nothing this time.');
    }
    this.updateUI?.();
  };

  // ---------- King's Draw (100 PRC entry → Treasury; weekly; 500 RC or 1000 PRC; 24h claim) ----------
  P.enterKingsDraw = function(){
    const costPRC = 100;
    if ((this.premiumRevCoins||0) < costPRC) return toast(this,'Not enough PRC for an entry (100 PRC).');
    this.premiumRevCoins -= costPRC;
    this.addTreasuryPRC(costPRC, "King\'s Draw Entry");
    (this.kingsDrawTicketOwners||[]).push(this.playerName);
    this.updateCurrencyDisplay?.(); this.updateDrawsUI?.();
    toast(this,'🎲 Entered the King\'s Draw (PRC).');
  };

  P.resolveKingsDrawIfDue = function(){
    const leftMs = Math.max(0, (this.kingsDrawEndAt||0) - Date.now());
    const days = Math.ceil(leftMs/(24*3600*1000));
    text('kingsDrawCountdownDisplay', `${days} days`);
    if (Date.now() < (this.kingsDrawEndAt||0)) return;

    const tickets = this.kingsDrawTicketOwners||[];
    if (tickets.length > 0) {
      const idx = Math.floor(Math.random()*tickets.length);
      const name = tickets[idx];
      const prizeIsPRC = Math.random() < 0.5;
      const amount = prizeIsPRC ? 1000 : 500;

      this.kingsDrawWinner = { name, prizeType: prizeIsPRC?'PRC':'RC', amount, claimBy: Date.now()+24*3600*1000 };
      this.kingsDrawClaimed = false;
      const wl = document.getElementById('winnersList');
      if (wl) wl.textContent = `${name} — ${amount} ${prizeIsPRC?'PRC':'RC'}`;
      toast(this, `👑 King\'s Draw winner: ${name}. Prize: ${amount} ${prizeIsPRC?'PRC':'RC'} (24h to claim).`);
    }
    this.kingsDrawTicketOwners = [];
    this.kingsDrawEndAt = Date.now() + 7*24*3600*1000;
    this.updateDrawsUI?.();
  };

  P.claimKingsDraw = function(){
    const w = this.kingsDrawWinner;
    if (!w) return toast(this,'No prize to claim.');
    if (this.kingsDrawClaimed) return toast(this,'Prize already claimed.');
    if (Date.now() > w.claimBy) return toast(this,'Prize expired (24h window).');
    if (this.playerName !== w.name) return toast(this,'Only the winning player can claim this prize.');
    if (w.prizeType === 'RC') this.revCoins += w.amount; else this.premiumRevCoins = (this.premiumRevCoins||0) + w.amount;
    this.kingsDrawClaimed = true;
    this.updateCurrencyDisplay?.();
    toast(this, `🏆 Claimed: ${w.amount} ${w.prizeType}.`);
  };

  // ---------- UI guard so nothing crashes if some spans are missing ----------
  if (!P.__uiGuardOnce){
    P.__uiGuardOnce = true;
    const _u = P.updateUI;
    P.updateUI = function(){
      try { if (typeof _u === 'function') _u.call(this); } catch(e){}
      text('revCoinsDisplay', Math.floor(this.revCoins||0));
      text('perSecondDisplay', (this.earningsPerSecond||0).toFixed(8));
      text('totalEarnedDisplay', (this.earnings||0).toFixed(8));
      text('plotsOwnedDisplay', this.plotsClaimed||0);
      text('findsDisplay', this.finds||0);
      text('premiumRevCoinsDisplay', Math.floor(this.premiumRevCoins||0));
      this.updatePropertyTaxProgress?.();
      this.updateEventDisplay?.(); // Update event display in main UI loop
    };
  }
})();

// Economy Monitoring Functions for Admin Panel
P.initAdminEconomyMonitoring = function() {
    // Initialize economy data structure in localStorage
    const economyData = JSON.parse(localStorage.getItem('empireClickEconomyData') || '{}');
    
    // Initialize if not exists
    if (!economyData.totalEarnings) economyData.totalEarnings = 0;
    if (!economyData.dailyEarnings) economyData.dailyEarnings = {};
    if (!economyData.dailyAdsWatched) economyData.dailyAdsWatched = {};
    if (!economyData.totalAdsWatched) economyData.totalAdsWatched = 0;
    if (!economyData.cashDeposits) economyData.cashDeposits = 0;
    if (!economyData.adRevenueHistory) economyData.adRevenueHistory = [];
    if (!economyData.playerEngagementHistory) economyData.playerEngagementHistory = [];
    
    localStorage.setItem('empireClickEconomyData', JSON.stringify(economyData));
    
    console.log('Admin economy monitoring initialized');
};

P.trackAdWatched = function(adType = 'general') {
    const economyData = JSON.parse(localStorage.getItem('empireClickEconomyData') || '{}');
    const today = new Date().toDateString();
    
    // Track daily ads watched
    if (!economyData.dailyAdsWatched[today]) economyData.dailyAdsWatched[today] = 0;
    economyData.dailyAdsWatched[today]++;
    
    // Track total ads watched
    economyData.totalAdsWatched = (economyData.totalAdsWatched || 0) + 1;
    
    // Track ad revenue (estimated $0.01 per ad)
    const adRevenue = 0.01;
    economyData.totalEarnings = (economyData.totalEarnings || 0) + adRevenue;
    
    // Track daily earnings
    if (!economyData.dailyEarnings[today]) economyData.dailyEarnings[today] = 0;
    economyData.dailyEarnings[today] += adRevenue;
    
    // Add to ad revenue history
    economyData.adRevenueHistory.push({
        date: new Date().toISOString(),
        adType: adType,
        revenue: adRevenue
    });
    
    // Keep only last 1000 entries
    if (economyData.adRevenueHistory.length > 1000) {
        economyData.adRevenueHistory = economyData.adRevenueHistory.slice(-1000);
    }
    
    localStorage.setItem('empireClickEconomyData', JSON.stringify(economyData));
};

P.trackCashDeposit = function(amount, currency = 'USD') {
    const economyData = JSON.parse(localStorage.getItem('empireClickEconomyData') || '{}');
    
    economyData.cashDeposits = (economyData.cashDeposits || 0) + amount;
    economyData.totalEarnings = (economyData.totalEarnings || 0) + amount;
    
    const today = new Date().toDateString();
    if (!economyData.dailyEarnings[today]) economyData.dailyEarnings[today] = 0;
    economyData.dailyEarnings[today] += amount;
    
    localStorage.setItem('empireClickEconomyData', JSON.stringify(economyData));
};

P.trackPlayerEngagement = function(action = 'general') {
    const economyData = JSON.parse(localStorage.getItem('empireClickEconomyData') || '{}');
    
    economyData.playerEngagementHistory.push({
        date: new Date().toISOString(),
        action: action,
        playerName: this.playerName || 'Unknown'
    });
    
    // Keep only last 500 entries
    if (economyData.playerEngagementHistory.length > 500) {
        economyData.playerEngagementHistory = economyData.playerEngagementHistory.slice(-500);
    }
    
    localStorage.setItem('empireClickEconomyData', JSON.stringify(economyData));
};

P.getEconomyData = function() {
    return JSON.parse(localStorage.getItem('empireClickEconomyData') || '{}');
};

P.updateEconomyMetrics = function() {
    const economyData = this.getEconomyData();
    const today = new Date().toDateString();
    
    // Calculate current metrics
    const metrics = {
        totalEarnings: economyData.totalEarnings || 0,
        dailyEarnings: economyData.dailyEarnings?.[today] || 0,
        treasuryBalance: this.treasuryPool || 0,
        playerLiabilities: (this.revCoins || 0) + (this.premiumRevCoins || 0) * 10,
        dailyAdsWatched: economyData.dailyAdsWatched?.[today] || 0,
        totalAdsWatched: economyData.totalAdsWatched || 0,
        cashDeposits: economyData.cashDeposits || 0,
        netPosition: (this.treasuryPool || 0) - ((this.revCoins || 0) + (this.premiumRevCoins || 0) * 10),
        revenueStreams: ((economyData.totalAdsWatched || 0) * 0.01) + (economyData.cashDeposits || 0),
        playerEngagement: Math.min(100, ((economyData.dailyAdsWatched?.[today] || 0) / 10) * 100),
        adRevenueRate: (economyData.dailyAdsWatched?.[today] || 0) * 0.01
    };
    
    // Calculate site health score
    metrics.siteHealth = Math.max(0, Math.min(100, 
        (metrics.netPosition > 0 ? 30 : 0) + 
        (metrics.revenueStreams > 0 ? 25 : 0) + 
        (metrics.playerEngagement > 50 ? 25 : metrics.playerEngagement * 0.5) + 
        (metrics.adRevenueRate > 0 ? 20 : 0)
    ));
    
    return metrics;
};