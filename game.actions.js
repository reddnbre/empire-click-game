
// game.actions.js — Action logic for EmpireClick buttons (realistic math, no Three.js)
(function(){
  function $(id){ return document.getElementById(id); }
  function show(el){ if(el) el.style.display='block'; }
  function hide(el){ if(el) el.style.display='none'; }
  function msg(text){ try{ (window.showGameMessage||alert)(text); }catch(_){ alert(text); } }
  function fmt(n, d=8){ try{ return Number(n||0).toFixed(d); }catch(_){ return String(n); } }

  function updateLoginUI(game){
    const s1=$('loginStreakDisplay'); if(s1) s1.textContent = game.loginStreak||0;
    const s2=$('loginStreakStatsDisplay'); if(s2) s2.textContent = game.loginStreak||0;
    const b1=$('loginBonusDisplay'); if(b1) b1.textContent = (game.dailyLoginBonus||1).toFixed(2)+'x';
    const st=$('loginStatus'); if(st) st.textContent = game.dailyLoginAvailable ? 'Daily login available!' : 'Claimed for today';
  }

  function updateKingsDrawUI(game){
    const e=$('kingsDrawEntriesDisplay'); if(e) e.textContent = game.kingsDrawEntries|0;
    const p=$('kingsDrawPoolDisplay'); if(p) p.textContent = Math.floor(game.kingsDrawPool||0);
    const c=$('kingsDrawCountdownDisplay'); if(c){
      const t=Math.max(0, game.drawCountdown|0);
      const d=Math.floor(t/86400), h=Math.floor((t%86400)/3600), m=Math.floor((t%3600)/60);
      c.textContent = `${d} days ${h}h ${m}m`;
    }
  }

  function updateTaxUI(game){
    const effEl=$('taxEfficiencyDisplay'); 
    const eff = game.getEfficiencyMultiplier ? game.getEfficiencyMultiplier() : (game.wealthTaxEfficiency||1);
    if(effEl) effEl.textContent = Math.round(eff*100)+'%';
    const status=$('taxStatusDisplay'); if(status) status.textContent = game.taxStatus||'Active';
    const next=$('nextTaxDisplay'); 
    if(next){
      const delta = Math.max(0, (game.personalTaxInterval||0) - (Date.now() - (game.lastTaxPaid||0)));
      const h=Math.floor(delta/3600000), m=Math.floor((delta%3600000)/60000);
      next.textContent = `${h} hours ${m}m`;
    }
    const pool=$('treasuryPoolDisplay'); if(pool) pool.textContent = Math.floor(game.treasuryPool||0);
  }

  function updateTreasuryUI(game){
    const bal=$('treasuryBalanceDisplay'); if(bal) bal.textContent = Math.floor(game.treasuryPool||0);
    const share=$('treasuryShareDisplay'); if(share){
      const owned=(game.plots||[]).filter(p=>p.claimed && p.owner===game.playerName).length;
      const total=Math.max(1,(game.plots||[]).length);
      share.textContent=((owned/total)*100).toFixed(2)+'%';
    }
  }

  function updateCoreUI(game){
    const rc=$('revCoinsDisplay'); if(rc) rc.textContent = Math.floor(game.revCoins||0);
    const prc=$('premiumRevCoinsDisplay'); if(prc) prc.textContent = Math.floor(game.premiumRevCoins||0);
    const wd=$('withdrawalBalanceDisplay'); if(wd) wd.textContent = fmt(game.withdrawalBalance||0);
    const ce=$('currentEarningsDisplay'); if(ce) ce.textContent = fmt(game.earnings||0);
    const er=$('earningsRateDisplay'); if(er) er.textContent = fmt(game.earningsPerSecond||0);
    const be=$('baseEarningsDisplay'); if(be) be.textContent = fmt(game.baseEarningsPerSecond||0);
  }

  function attach(){
    if (typeof EmpireClickGame!=='function') return;
    const P = EmpireClickGame.prototype;

    // 1) Withdraw Earnings — move withdrawalBalance to RevCoins
    if(!P.withdrawEarnings) P.withdrawEarnings = function(){
      const amt = this.withdrawalBalance||0;
      if(amt<=0){ msg('No earnings to withdraw yet.'); return; }
      this.revCoins = (this.revCoins||0) + amt;
      this.withdrawalBalance = 0;
      this.updateUI && this.updateUI();
      updateCoreUI(this);
      msg(`Withdrew ${fmt(amt,8)} RevCoins to your balance.`);
    };

    // 2) Claim Daily Login — use your reward table
    if(!P.claimDailyLogin) P.claimDailyLogin = function(){
      if(!this.dailyLoginAvailable){ msg('Already claimed today.'); return; }
      // roll a reward from dailyLoginRewards
      const roll=Math.random();
      let acc=0, picked=this.dailyLoginRewards && this.dailyLoginRewards[0];
      if(Array.isArray(this.dailyLoginRewards)){
        for(const r of this.dailyLoginRewards){
          acc += r.chance;
          if(roll<=acc){ picked=r; break; }
        }
      }
      const bonus = (picked&&picked.bonus)||0.05;
      this.loginStreak=(this.loginStreak||0)+1;
      this.dailyLoginBonus = Math.min(2.0, (this.dailyLoginBonus||1.0) + bonus);
      this.dailyLoginAvailable=false;
      this.dailyLoginChecked=true;
      updateLoginUI(this);
      this.updateUI && this.updateUI();
      msg(`Daily login claimed! +${Math.round(bonus*100)}% bonus. Streak: ${this.loginStreak} days.`);
    };

    // 3) Enter King's Draw — 100 RevCoins -> 90 to pool, 10 to treasury
    if(!P.enterKingsDraw) P.enterKingsDraw = function(){
      const cost=100;
      if((this.revCoins||0)<cost){ msg('Not enough RevCoins (need 100).'); return; }
      this.revCoins -= cost;
      this.kingsDrawEntries = (this.kingsDrawEntries||0)+1;
      this.kingsDrawPool = (this.kingsDrawPool||0) + Math.floor(cost*0.9);
      this.treasuryPool = (this.treasuryPool||0) + Math.floor(cost*0.1);
      updateKingsDrawUI(this);
      updateTreasuryUI(this);
      updateCoreUI(this);
      msg('Entered the King\'s Draw!');
    };

    // 4) Claim King's Draw — only when countdown reaches 0
    if(!P.claimKingsDraw) P.claimKingsDraw = function(){
      if((this.drawCountdown||0)>0){ msg('The draw has not completed yet.'); return; }
      if((this.kingsDrawEntries||0)<=0){ msg('No entries to claim.'); return; }
      // Simple model: 1-in-4 chance to win entire pool
      const win = Math.random()<0.25;
      if(win){
        const prize=Math.floor(this.kingsDrawPool||0);
        this.revCoins += prize;
        this.kingsDrawPool = 0;
        const wl=$('winnersList'); if(wl) wl.textContent=`🏆 You won ${prize} RevCoins`;
        msg(`🏆 You won the King's Draw! +${prize} RevCoins`);
      }else{
        msg('No prize this time. Better luck next round.');
      }
      this.kingsDrawEntries=0;
      this.drawCountdown = 7*24*60*60; // reset a new week
      updateKingsDrawUI(this);
      updateCoreUI(this);
    };

    // 5) Pay Tax — 2% of current RevCoins, respects interval
    if(!P.payTax) P.payTax = function(){
      const now=Date.now();
      const interval=this.personalTaxInterval||0;
      const elapsed = now - (this.lastTaxPaid||0);
      if(elapsed<interval){ msg('Too early to pay tax again.'); return; }
      const due = Math.floor((this.revCoins||0)*0.02);
      if(due<=0){ msg('No tax due right now.'); return; }
      this.revCoins -= due;
      this.treasuryPool = (this.treasuryPool||0) + due;
      this.lastTaxPaid = now;
      updateTaxUI(this);
      updateTreasuryUI(this);
      updateCoreUI(this);
      msg(`Paid tax: ${due} RevCoins`);
    };

    // 6) Boost Tax — sets boost time and flags; impacts getEfficiencyMultiplier()
    if(!P.boostTax) P.boostTax = function(){
      const add=2*60*60; // 2 hours boost
      this.taxBoostTime = (this.taxBoostTime||0) + add;
      this.taxBoostActive=true;
      updateTaxUI(this);
      this.updateUI && this.updateUI();
      msg('Tax efficiency boosted for 2 hours!');
    };

    // 7) Initiate Takeover — costs 50 Premium RevCoins, opens 5-min window
    if(!P.initiateTakeover) P.initiateTakeover = function(){
      const cost=50;
      if((this.premiumCoins||0)<cost){ msg('Not enough Premium RevCoins (50 required).'); return; }
      this.premiumCoins -= cost;
      this.takeoverActive=true;
      this.takeoverEndsAt=Date.now()+5*60*1000;
      const st=$('takeoverStatus'); if(st) st.textContent='Takeover in progress...';
      updateCoreUI(this);
      msg('Takeover initiated. Claim within 5 minutes.');
    };

    // 8) Claim Takeover — takes 1 random unclaimed plot as Common
    if(!P.claimTakeover) P.claimTakeover = function(){
      if(!this.takeoverActive){ msg('No active takeover.'); return; }
      if(Date.now()>(this.takeoverEndsAt||0)){ this.takeoverActive=false; msg('Takeover window expired.'); return; }
      const free=(this.plots||[]).filter(p=>!p.claimed);
      if(free.length===0){ this.takeoverActive=false; msg('No available plots.'); return; }
      const plot = free[Math.floor(Math.random()*free.length)];
      plot.claimed=true; plot.owner=this.playerName; plot.rarity='Common';
      plot.element.classList.add('claimed','Common');
      if (window.renderModelOnPlot) window.renderModelOnPlot(plot.element, 'Common');
      this.plotsClaimed = (this.plotsClaimed||0)+1;
      this.takeoverActive=false;
      const st=$('takeoverStatus'); if(st) st.textContent='Takeover complete!';
      const avail=$('availablePlotsDisplay'); if(avail) avail.textContent = Math.max(0, free.length-1);
      this.updateUI && this.updateUI();
      msg('Takeover success: claimed 1 plot.');
    };

    // 9) Claim Treasury — payout proportional to owned plots, up to 10% of pool
    if(!P.claimTreasury) P.claimTreasury = function(){
      const total=(this.plots||[]).length||1;
      const owned=(this.plots||[]).filter(p=>p.claimed && p.owner===this.playerName).length;
      if(owned===0){ msg('Own at least 1 plot to claim treasury.'); return; }
      const pct = owned/total;
      const payout = Math.floor((this.treasuryPool||0) * Math.min(0.10, pct));
      if(payout<=0){ msg('No treasury funds available right now.'); return; }
      this.treasuryPool -= payout;
      this.revCoins = (this.revCoins||0) + payout;
      updateTreasuryUI(this);
      updateCoreUI(this);
      msg(`Claimed ${payout} RevCoins from the Treasury.`);
    };

    // 10) Donate to Treasury — donate 10 RevCoins or your full balance if less
    if(!P.donateToTreasury) P.donateToTreasury = function(){
      const donate = Math.min(10, Math.floor(this.revCoins||0));
      if(donate<=0){ msg('No RevCoins to donate.'); return; }
      this.revCoins -= donate;
      this.treasuryPool = (this.treasuryPool||0) + donate;
      updateTreasuryUI(this);
      updateCoreUI(this);
      msg(`Donated ${donate} RevCoins to the Treasury.`);
    };

    // 11) Show Achievements — render list into achievementsModal
    if(!P.showAchievements) P.showAchievements = function(){
      const list=$('achievementsList');
      if(list){
        list.innerHTML='';
        (this.achievements||[]).forEach(a=>{
          const item=document.createElement('div');
          item.className='achievement-item'+(a.completed?' completed':'');
          item.innerHTML=`<div class="achievement-icon">${a.icon||'🏆'}</div>
                          <div>
                            <div><strong>${a.name}</strong> — ${a.description||''}</div>
                            <div>Points: ${a.points||0}</div>
                          </div>`;
          list.appendChild(item);
        });
        const pts=$('achievementPointsPanelDisplay'); if(pts) pts.textContent=this.achievementPoints||0;
      }
      show($('achievementsModal'));
    };

    // 12) Close Achievements Modal
    if(!P.closeAchievementsModal) P.closeAchievementsModal = function(){
      hide($('achievementsModal'));
    };

    // 13) Show Leaderboard — quick mock
    if(!P.showLeaderboard) P.showLeaderboard = function(){
      const lb=$('leaderboardList'); if(lb){
        lb.innerHTML='';
        const owned=(this.plots||[]).filter(p=>p.claimed && p.owner===this.playerName).length;
        const players=[
          { name:this.playerName||'You', plots:owned, earnings:this.earnings||0 },
          { name:'Aurelius', plots:15, earnings:1200 },
          { name:'Valeria', plots:12, earnings:800 },
          { name:'Cassius', plots:9, earnings:500 }
        ].sort((a,b)=>b.plots-a.plots);
        players.forEach((p,i)=>{
          const row=document.createElement('div');
          row.className=`leaderboard-item rank-${i+1}`;
          row.innerHTML=`<div>${i+1}. ${p.name}</div><div>${p.plots} plots</div>`;
          lb.appendChild(row);
        });
      }
      show($('leaderboardModal'));
    };

    // 14) Close Leaderboard Modal
    if(!P.closeLeaderboardModal) P.closeLeaderboardModal = function(){
      hide($('leaderboardModal'));
    };

    // 15) Watch Audit Ad — clear fine after N watched
    if(!P.watchAuditAd) P.watchAuditAd = function(){
      if(!this.auditFineActive){ msg('No active audit fine.'); return; }
      this.auditFineAdsWatched = (this.auditFineAdsWatched||0)+1;
      if(this.auditFineAdsWatched >= (this.auditFineRequired||3)){
        this.auditFineActive=false;
        this.auditFineAdsWatched=0;
        this.auditInfractionActive=false;
        hide($('auditButton'));
        msg('Audit resolved. Fine cleared.');
      }else{
        msg(`Ad watched (${this.auditFineAdsWatched}/${this.auditFineRequired}).`);
      }
      this.updateUI && this.updateUI();
    };

    // 16) Explore Plot — uses game rarity rates and success logic
    if(!P.explorePlot) P.explorePlot = function(){
      if(!this.plotToExplore){ msg('Select a plot to explore.'); return; }
      if((this.finds||0)<=0){ msg('No explorations left.'); return; }
      this.finds--;
      const rarity = this.plotToExplore.rarity || 'Common';
      // Success based on getSuccessRate; reward increases earnings a tiny bit
      const successRate = (this.getSuccessRate ? this.getSuccessRate(rarity) : 50)/100;
      const success = Math.random() < successRate;
      if(success){
        const add = 0.00000001; // small boost per success
        this.earnings += add;
        this.withdrawalBalance += add;
        this.revCoins += 1; // small coin reward
        msg(`✨ Exploration success! +1 RevCoin, +${fmt(add,8)} earnings.`);
      }else{
        msg('❌ Exploration failed. Better luck next time.');
      }
      const cnt=$('explorationCount'); if(cnt) cnt.textContent=this.finds;
      this.updateUI && this.updateUI();
    };

    // 17) Close Exploration Modal
    if(!P.closeExplorationModal) P.closeExplorationModal = function(){
      hide($('explorationModal'));
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
