class EmpireClickGame {
    constructor() {
        this.world = document.getElementById('world');
        this.player = null;
        this.playerPos = { x: 500, y: 500 };
        this.revCoins = 1000;
        this.premiumCoins = 50;
        this.premiumRevCoins = 0;
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
        
        // Region variables
        this.currentRegion = "Default";
        this.regions = ["Default"];
        this.regionPlots = {};
        this.regionPlots["Default"] = [];
        
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
        
        // Wealth Tax System variables
        this.taxBoostTime = 0;
        
        // Event System variables
        this.eventsList = [
            "Turbo Hour", "Turbo Hour",
            "Treasure Surge", "Treasure Surge",
            "Lucky Surge",
            "Construction Discount",
            "Land Takeover Madness",
            "Audit Infraction"
        ];
        this.activeEvent = null;
        this.eventTimer = 0;
        this.eventDuration = 14400;
        this.auditInfractionActive = false;
        this.auditWarningTimer = 600;
        this.auditFineActive = false;
        this.auditFineAdsWatched = 0;
        this.auditFineRequired = 3;
        
        // King's Draw variables
        this.kingsDrawEntries = 0;
        this.kingsDrawPool = 0;
        this.drawCountdown = 7 * 24 * 60 * 60;
        this.kingsDrawEnabled = true;
        
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
            { chance: 0.40, bonus: 0.05, name: "Small Bonus (+5%)" },
            { chance: 0.30, bonus: 0.10, name: "Medium Bonus (+10%)" },
            { chance: 0.20, bonus: 0.20, name: "Large Bonus (+20%)" },
            { chance: 0.08, bonus: 0.50, name: "Huge Bonus (+50%)" },
            { chance: 0.02, bonus: 1.00, name: "Mega Bonus (+100%)" }
        ];
        
        // Wealth tax efficiency
        this.wealthTaxEfficiency = 1.0;
        this.taxBoostActive = false;
        
        // Offline earnings system
        this.lastActiveTime = Date.now();
        this.offlineEarnings = 0;
        this.isOffline = false;
        this.offlineStartTime = null;
        this.offlineThreshold = 5 * 60 * 1000;
        
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
        
        
        this.init();
    }
    
    init() {
        console.log('Game initialization started...');
        
        // Initialize Three.js scene for spritesthis.createWorld();
        this.createPlayer();
        this.setupControls();
        this.gameLoop();
        this.startEarnings();
        this.initTakeoverPlots();
        this.startTaxCycle();
        this.startKingsDrawCountdown();
        this.updateRegionUI();
        this.updateFindsUI();
        this.updateBoostUI();
        this.updateDrawsUI();
        this.updateCurrencyDisplay();
        this.updateRegionDisplay();
        this.updateEarningsDisplay();
        this.updateLoginUI();
        this.checkAchievements();
        
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
        
        // Wealth tax interval
        setInterval(() => {
            if (this.taxBoostTime > 0) {
                this.taxBoostTime--;
                this.updateUI();
            }
        }, 1000);
        
        // Event timer interval
        setInterval(() => this.handleEventTimers(), 1000);
        
        // Start earnings interval
        setInterval(() => {
            this.startEarnings();
        }, 1000);
        
        console.log('Game initialization completed!');
    }
        });
    }
                window.renderer.render(window.scene, window.camera);
            }
        };
        animate();
    }
    
    createWorld() {
        console.log('Creating world...');
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const plotWidth = viewportWidth / 25;
        const plotHeight = viewportHeight / 20;
        
        console.log(`Viewport: ${viewportWidth}x${viewportHeight}, Plot size: ${plotWidth}x${plotHeight}`);
        
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 25; col++) {
                const x = col * plotWidth;
                const y = row * plotHeight;
                const plotIndex = row * 25 + col;
                
                const plot = this.createPlot(x, y, plotWidth, plotHeight, plotIndex);
                this.world.appendChild(plot);
                this.plots.push({
                    element: plot,
                    x, y, width: plotWidth, height: plotHeight,
                    index: plotIndex,
                    claimed: false,
                    owner: "",
                    rarity: null,
                    name: `Plot ${plotIndex + 1}`,
                    exploresLeft: 3
                });
            }
        }
        
        console.log(`Created ${this.plots.length} plots`);
        this.createRoads();
        
        // Add click handler to world to hide plot info panel when clicking elsewhere
        this.world.addEventListener('click', (e) => {
            if (!e.target.closest('.plot')) {
                this.hidePlotInfoPanel();
            }
        });
        
        // Ensure sprites for any already owned plots in base world (backfill)
        setTimeout(() => {
            // The rescue patch will handle this automatically when scene is ready
            console.log('[EmpireClick] Base world created, sprites will be handled by rescue patch');
        }, 1000);
    }
    
    createPlot(x, y, width, height, index) {
        const plot = document.createElement('div');
        plot.className = 'plot';
        plot.style.left = x + 'px';
        plot.style.top = y + 'px';
        plot.style.width = width + 'px';
        plot.style.height = height + 'px';
        plot.style.aspectRatio = '1/1';
        
        // Plot content will be managed by sprite system
        
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
        document.getElementById("plotInfoPanel").style.display = "none";
    }
    
    handlePlotClick(plotElement, plotIndex) {
        const plot = this.plots[plotIndex];
        
        if (plot.claimed) {
            // Show plot info panel for claimed plots
            const plotName = plot.name || this.generatePlotName();
            document.getElementById("plotNameLabel").textContent = plotName;
            document.getElementById("plotOwnerLabel").textContent = plot.owner;
            document.getElementById("plotRarityLabel").textContent = plot.rarity;
            document.getElementById("plotRarityLabel").style.color = this.getRarityColor(plot.rarity);
            document.getElementById("plotInfoPanel").style.display = "block";
            
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
        
        if (this.activeEvent === "Construction Discount" && rarity !== "Elite") {
            cost = 50;
        }
        
        if (rarity === "Elite") {
            if (this.premiumCoins < cost) {
                alert(`You don't have enough Premium RevCoins to claim this ${rarity} plot.`);
                return;
            }
            this.premiumCoins -= cost;
        } else {
            if (this.revCoins < cost) {
                alert(`You don't have enough RevCoins to claim this ${rarity} plot.`);
                return;
            }
            this.revCoins -= cost;
        }
        
        this.earnings += this.rarityRates[rarity];
        
        this.plotToClaim.claimed = true;
        this.plotToClaim.owner = this.playerName;
        this.plotToClaim.rarity = rarity;
        this.plotToClaim.element.classList.add('claimed', rarity);
        
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
            this.renderDOMBuilding(this.plotToClaim.element, rarity);
            console.log(`Sprite rendered for ${rarity} plot at (${col}, ${row})`);
            
            // Update plot info panel
            const plotName = this.generatePlotName();
            document.getElementById("plotNameLabel").textContent = plotName;
            document.getElementById("plotOwnerLabel").textContent = this.playerName;
            document.getElementById("plotRarityLabel").textContent = rarity;
            document.getElementById("plotRarityLabel").style.color = this.getRarityColor(rarity);
            document.getElementById("plotInfoPanel").style.display = "block";
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
        
        if (this.activeEvent === "Treasure Surge" && reward === 0) {
            reward = 1;
        }
        
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
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.addEventListener('mousedown', (e) => {
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
            }
        });
    }
    
    gameLoop() {
        this.handleMovement();
        this.updateUI();
        this.checkOfflineEarnings();
        
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
        document.getElementById('revCoinsDisplay').textContent = Math.floor(this.revCoins);
        document.getElementById('perSecondDisplay').textContent = this.earningsPerSecond.toFixed(8);
        document.getElementById('totalEarnedDisplay').textContent = this.earnings.toFixed(8);
        document.getElementById('plotsOwnedDisplay').textContent = this.plotsClaimed;
        document.getElementById('findsDisplay').textContent = this.finds;
        document.getElementById('boostDisplay').textContent = this.boostSecondsRemaining + 's';
        document.getElementById('drawsDisplay').textContent = this.drawsUsed;
        document.getElementById('premiumDisplay').textContent = Math.floor(this.premiumCoins);
        document.getElementById('premiumRevCoinsDisplay').textContent = this.premiumRevCoins;
        
        this.updateEarningsDisplay();
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
    

    
    // Render a CSS-based building inside the plot (no Three.js)
    renderDOMBuilding(plotElement, rarity) {
        if (!plotElement) return;
        // Clear previous
        const old = plotElement.querySelector('.building');
        if (old) old.remove();

        const rarityClass = (rarity || 'Common').toLowerCase();
        const div = document.createElement('div');
        div.className = 'building building-' + rarityClass;
        plotElement.appendChild(div);

        // Optional detail blocks to make it feel 3D-ish
        if (rarity === 'Common' || rarity === 'Rare' || rarity === 'Epic') {
            const left = document.createElement('div');
            left.className = 'wall-left';
            const right = document.createElement('div');
            right.className = 'wall-right';
            div.appendChild(left);
            div.appendChild(right);
        }
        if (rarity === 'Epic') {
            const tl = document.createElement('div');
            tl.className = 'tower-left';
            const tr = document.createElement('div');
            tr.className = 'tower-right';
            div.appendChild(tl);
            div.appendChild(tr);
        }
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
        
        const ownedPlots = this.plots.filter(p => p.claimed && p.owner === this.playerName);
        let totalEarnings = 0;
        
        ownedPlots.forEach(plot => {
            if (plot.rarity && this.rarityRates[plot.rarity]) {
                totalEarnings += this.rarityRates[plot.rarity];
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
        
        if (this.activeEvent === "Turbo Hour") {
            multiplier *= 1.25;
        }
        
        this.baseEarningsPerSecond = totalEarnings;
        this.earningsPerSecond = this.baseEarningsPerSecond * multiplier;
        
        if (this.isOffline) {
            this.earningsPerSecond *= 0.5;
        }
        
        this.earnings += this.earningsPerSecond;
        this.withdrawalBalance += this.earningsPerSecond;
        
        this.updateEarningsDisplay();
    }

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
        if (this.plotsClaimed <= 150) return 1.0;
        if (this.plotsClaimed <= 300) return 0.5;
        return 0.2;
    }

    isWealthTaxBoosted() {
        return this.taxBoostTime > 0;
    }

    checkDailyLogin() {
        if (this.dailyLoginChecked) return;
        
        const today = new Date().toDateString();
        
        if (this.lastLoginDate !== today) {
            this.dailyLoginAvailable = true;
            this.lastLoginDate = today;
            this.dailyLoginBonus = 1.0;
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
        const regions = ["Default", "Forest", "Mountain", "Coastal", "Desert"];
        const currentIndex = regions.indexOf(this.currentRegion);
        const nextIndex = (currentIndex + 1) % regions.length;
        this.currentRegion = regions[nextIndex];
        
        console.log(`Current region: ${this.currentRegion}`);
        
        // Update the region display
        this.updateRegionDisplay();
        
        // Apply region-specific visual effects
        this.applyRegionEffects();
        
        console.log(`Switched to ${this.currentRegion} region`);
    }

/* ==================== EMPIRESPRITES RESCUE PATCH (drop-in) ==================== */
/*  What this does:
    - Replaces per-plot 3D models with camera-facing PNG sprites.
    - Exposes the exact helpers your code already calls:
        renderSpriteForPlot(plot, rarity, opts?)
        onRegionCreated(region)
        onRegionActivated(region)
    - Works with either global `scene` or `game.scene`.
    - Won't explode if region.plot array name differs (auto-detects).
    - Parents sprites to plot.mesh when available so region show/hide works.
*/

(function () {
  // --- CONFIG: paths (for now you can duplicate one PNG under these names) ---
  const SPRITE_VARIANTS = {
    Common: [
      "assets/images/Castles/common_barn.png",
      "assets/images/Castles/common_cottage.png",
      "assets/images/Castles/common_hut.png",
    ],
    Rare: [
      "assets/images/Castles/rare_fortress.png",
      "assets/images/Castles/rare_tower.png",
      "assets/images/Castles/rare_gatehouse.png",
    ],
    Epic: [
      "assets/images/Castles/epic_castle.png",
      "assets/images/Castles/epic_keep.png",
    ],
    Legendary: [
      "assets/images/Castles/legendary_keep.png",
      "assets/images/Castles/legendary_palace.png",
    ],
    Elite: [
      "assets/images/Castles/elite_colosseum.png",
    ],
  };

  // --- Size per rarity (tweakable) ---
  const SCALE_BY_RARITY = {
    Common:    [3.0, 3.0],
    Rare:      [3.6, 3.6],
    Epic:      [4.4, 4.4],
    Legendary: [5.2, 5.2],
    Elite:     [5.6, 5.6],
  };

  // --- Tile assumptions (center offset). If your tile size ≠ 1, change this. ---
  const TILE_SIZE = 1;
  const CENTER_OFFSET = TILE_SIZE / 2;
  const DEFAULT_Y_LIFT = 2.5;

  // --- Internal caches & helpers ---
  const texCache = {};
  const loader = new THREE.TextureLoader();

  function getScene() {
    // Try global scene first; fall back to game.scene
    if (typeof window !== "undefined") {
      if (window.scene) return window.scene;
      if (window.game && window.game.scene) return window.game.scene;
    }
    console.warn("[EmpireSprites] No scene found yet.");
    return null;
  }

  function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function loadTexture(path) {
    return texCache[path] || (texCache[path] = loader.load(path));
  }

  function makeSprite(rarity = "Common") {
    const pool = SPRITE_VARIANTS[rarity] || SPRITE_VARIANTS.Common || [];
    const path = pool.length ? rand(pool) : null;
    if (!path) {
      console.warn("[EmpireSprites] No sprite path for rarity:", rarity);
      return null;
    }
    const tex = loadTexture(path);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    const [w, h] = SCALE_BY_RARITY[rarity] || [4, 4];
    sprite.scale.set(w, h, 1);
    return sprite;
  }

  function removeSprite(plot) {
    if (!plot || !plot.sprite) return;
    const parent = plot.sprite.parent;
    if (parent) parent.remove(plot.sprite);
    if (plot.sprite.material) {
      if (plot.sprite.material.map) plot.sprite.material.map.dispose();
      plot.sprite.material.dispose();
    }
    plot.sprite = null;
  }

  function positionSpriteOnPlot(sprite, plot, yLift = DEFAULT_Y_LIFT) {
    const scn = getScene();
    if (!scn || !sprite) return;

    // If we have a mesh, parent there so region/group visibility "just works"
    if (plot.mesh && typeof plot.mesh.add === "function") {
      sprite.position.set(0, yLift, 0);
      plot.mesh.add(sprite);
      return;
    }

    // Fallback: world placement
    const x = (plot.x ?? plot.position?.x ?? 0) + CENTER_OFFSET;
    const z = (plot.z ?? plot.position?.z ?? 0) + CENTER_OFFSET;
    const y = (plot.y ?? plot.position?.y ?? 0) + yLift;
    sprite.position.set(x, y, z);
    scn.add(sprite);
  }

  function renderSpriteForPlot(plot, rarity = "Common", opts = {}) {
    const scn = getScene();
    if (!scn) return; // scene not ready yet

    // Clean old sprite (if any)
    removeSprite(plot);

    const sprite = makeSprite(rarity);
    if (!sprite) return;

    positionSpriteOnPlot(sprite, plot, opts.yLift ?? DEFAULT_Y_LIFT);
    plot.sprite = sprite;
  }

  // -------- Region utilities (non-invasive) ----------
  function getRegionPlotsArray(region) {
    // Try common names; adjust if your project uses a different property
    return (
      region?.plots ||
      region?.plotList ||
      region?.tiles ||
      region?.cells ||
      []
    );
  }

  function ensureRegionSprites(region) {
    const plots = getRegionPlotsArray(region);
    for (const p of plots) {
      // Owned/claimed check — adapt if your flag is different
      const owned = !!(p.isOwned || p.owner || p.claimed);
      if (owned) {
        const rarity = p.rarity || "Common";
        renderSpriteForPlot(p, rarity);
      }
    }
  }

  function onRegionCreated(region) {
    ensureRegionSprites(region);
  }

  function onRegionActivated(region) {
    ensureRegionSprites(region);
  }

  // -------- Expose the exact API your hooks already use ----------
  window.renderSpriteForPlot = renderSpriteForPlot;
  window.onRegionCreated = onRegionCreated;
  window.onRegionActivated = onRegionActivated;

  // Preload textures early (doesn't depend on scene)
  (function preloadAll() {
    Object.values(SPRITE_VARIANTS)
      .flat()
      .forEach((p) => loadTexture(p));
  })();

  console.log("[EmpireSprites] Ready: sprites will render on claims/regions.");
})();
/* ================== END EMPIRESPRITES RESCUE PATCH (drop-in) ================== */
    
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
    updateFindsUI() {}
    updateBoostUI() {}
    updateDrawsUI() {}
    updateCurrencyDisplay() {}
    updateRegionDisplay() {
        const regionDisplay = document.getElementById('currentRegionDisplay');
        if (regionDisplay) {
            regionDisplay.textContent = this.currentRegion;
        }
    }
    checkOfflineEarnings() {
        const now = Date.now();
        const timeSinceActive = now - this.lastActiveTime;
        
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
        const ownedPlots = this.plots.filter(p => p.claimed && p.owner === this.playerName);
        let totalEarnings = 0;
        
        ownedPlots.forEach(plot => {
            if (plot.rarity && this.rarityRates[plot.rarity]) {
                totalEarnings += this.rarityRates[plot.rarity];
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
        
        if (this.activeEvent === "Turbo Hour") {
            multiplier *= 1.25;
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


    handleEventTimers() {}
    claimOfflineEarnings() {}

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
        
        this.dailyLoginBonus = 1.0 + selectedReward.bonus;
        this.loginStreak++;
        this.dailyLoginAvailable = false;
        
        alert(`🎲 Daily Login Roll Result:\n\n${selectedReward.name}\n+${(selectedReward.bonus * 100).toFixed(0)}% earnings bonus!\n\nStreak: ${this.loginStreak} days!`);
        
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
}