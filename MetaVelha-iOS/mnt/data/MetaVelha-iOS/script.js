'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const HUMAN = 'X';
  const BOT = '#';
  let difficulty = 'medium';
  let main = Array(9).fill(null);
  let miniBoards = Array.from({length:9}, () => Array(9).fill(null));
  let activeCell = null;
  let mainTurn = HUMAN;
  let miniTurn = HUMAN;
  let gameOver = false;
  let miniFinished = false;
  let soundOn = true;
  let audioContext = null;

  const home = $('homeScreen'), game = $('gameScreen');
  const mainBoard = $('mainBoard'), miniBoard = $('miniBoard');
  const ownerOf = (value) => value === HUMAN ? 'X' : value === BOT ? '#' : '';
  const hasLine = (board, mark) => WIN_LINES.some(line => line.every(i => board[i] === mark));
  const available = (board) => board.map((v,i) => v === null ? i : -1).filter(i => i >= 0);
  const difficultyNames = {easy:'FÁCIL',medium:'MÉDIO',hard:'DIFÍCIL'};

  function beep(freq=520, duration=.06) {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.frequency.value = freq; osc.type = 'sine'; gain.gain.value = .035;
      osc.connect(gain); gain.connect(audioContext.destination); osc.start();
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      osc.stop(audioContext.currentTime + duration);
    } catch (_) { /* Som é opcional; o jogo continua sem áudio. */ }
  }
  function showHome() { home.classList.remove('hidden'); game.classList.add('hidden'); $('resultModal').classList.add('hidden'); }
  function showGame() { home.classList.add('hidden'); game.classList.remove('hidden'); }
  function newGame() {
    main = Array(9).fill(null); miniBoards = Array.from({length:9}, () => Array(9).fill(null));
    activeCell = null; mainTurn = HUMAN; miniTurn = HUMAN; gameOver = false; miniFinished = false;
    $('levelChip').textContent = difficultyNames[difficulty];
    $('miniTitle').textContent = 'Escolha uma casa'; $('miniStatus').textContent = 'AGUARDANDO'; $('miniStatus').classList.remove('active');
    $('miniMessage').textContent = 'Toque em uma casa do tabuleiro principal para jogar.';
    $('gameTitle').textContent = 'Sua vez, X'; $('gameSubtitle').textContent = 'Escolha uma casa disponível.';
    $('turnSymbol').textContent = 'X'; $('turnSymbol').style.color = 'var(--blue)';
    $('scoreX').textContent = '0'; $('scoreHash').textContent = '0';
    renderMain(); renderMini(); showGame();
  }
  function renderMain() {
    mainBoard.innerHTML = '';
    main.forEach((mark, i) => {
      const btn = document.createElement('button'); btn.className = 'main-cell'; btn.setAttribute('aria-label', `Casa ${i+1}${mark ? ', conquistada por '+mark : ', disponível'}`);
      if (mark === HUMAN || mark === BOT) {
        btn.classList.add(mark === HUMAN ? 'won-x' : 'won-hash');
        const span = document.createElement('span'); span.className = `cell-owner ${mark === HUMAN ? 'owner-x' : 'owner-hash'}`; span.textContent = mark; btn.append(span);
        const caption = document.createElement('span'); caption.className = 'cell-caption'; caption.textContent = 'CONQUISTADA'; btn.append(caption); btn.disabled = true;
      } else if (mark === 'D') {
        btn.classList.add('drawn'); const span = document.createElement('span'); span.className='cell-owner'; span.textContent='—'; btn.append(span); btn.disabled=true;
      } else {
        btn.classList.add('available');
        if (activeCell === i && !miniFinished) btn.classList.add('target');
        const preview = document.createElement('span'); preview.className = 'mini-preview';
        miniBoards[i].forEach(v => { const s=document.createElement('span'); if(v===HUMAN)s.className='x';if(v===BOT)s.className='hash';s.textContent=v||'';preview.append(s); });
        btn.append(preview); const caption=document.createElement('span');caption.className='cell-caption';caption.textContent=activeCell===i?'EM JOGO':'CASA '+String(i+1).padStart(2,'0');btn.append(caption);
        btn.addEventListener('click', () => chooseCell(i));
      }
      mainBoard.append(btn);
    });
    $('scoreX').textContent = main.filter(v=>v===HUMAN).length;
    $('scoreHash').textContent = main.filter(v=>v===BOT).length;
  }
  function renderMini() {
    miniBoard.innerHTML = '';
    if (activeCell === null) { miniBoard.classList.add('hidden'); return; }
    miniBoard.classList.remove('hidden');
    miniBoards[activeCell].forEach((mark, i) => {
      const btn=document.createElement('button');btn.className='mini-cell';if(mark===HUMAN)btn.classList.add('x');if(mark===BOT)btn.classList.add('hash');btn.textContent=mark||'';
      btn.setAttribute('aria-label',`Jogada ${i+1}${mark?', '+mark:''}`);btn.disabled=!!mark||miniFinished||gameOver||mainTurn!==HUMAN;
      if(!btn.disabled)btn.addEventListener('click',()=>playMini(i,HUMAN));miniBoard.append(btn);
    });
  }
  function chooseCell(i) {
    if(gameOver||mainTurn!==HUMAN||main[i]!==null)return;
    activeCell=i; miniTurn=HUMAN; miniFinished=false;
    $('miniTitle').textContent=`Casa ${i+1} · X contra #`; $('miniStatus').textContent='EM JOGO';$('miniStatus').classList.add('active');
    $('miniMessage').textContent='Você começa este minijogo. Faça sua jogada.';
    renderMain();renderMini();beep(430,.05);
  }
  function playMini(index, mark) {
    if(activeCell===null||gameOver||miniFinished||miniBoards[activeCell][index]!==null||mainTurn!==HUMAN)return;
    miniBoards[activeCell][index]=mark;beep(mark===HUMAN?600:330,.07);
    if(hasLine(miniBoards[activeCell],mark)){finishMini(mark);return;}
    if(available(miniBoards[activeCell]).length===0){
      // Empate: zera o minijogo e mantém a vez de quem estava jogando o tabuleiro principal.
      miniBoards[activeCell]=Array(9).fill(null);miniTurn=HUMAN;
      $('miniMessage').textContent='Empate! O minijogo foi reiniciado. Jogue novamente.';
      renderMain();renderMini();return;
    }
    if(mark===HUMAN){miniTurn=BOT;renderMini();$('miniMessage').textContent='O bot está pensando…';window.setTimeout(botMiniMove,320);}
    else {miniTurn=HUMAN;renderMini();}
    renderMain();
  }
  function finishMini(winner) {
    const cell=activeCell;main[cell]=winner;miniFinished=true;
    $('miniStatus').textContent=winner===HUMAN?'CASA DO X':'CASA DO BOT';$('miniStatus').classList.remove('active');
    $('miniMessage').textContent=winner===HUMAN?'Você conquistou esta casa!':'O bot conquistou esta casa.';
    renderMain();renderMini();beep(winner===HUMAN?780:240,.16);
    if(hasLine(main,winner)){endGame(winner);return;}
    if(available(main).length===0){endGame('D');return;}
    // Regra original: a vez no tabuleiro principal alterna X → bot → X → bot,
    // independentemente de quem ganhou o minijogo.
    mainTurn = mainTurn===HUMAN ? BOT : HUMAN;
    $('gameTitle').textContent=mainTurn===HUMAN?'Sua vez, X':'Vez do bot, #';
    $('gameSubtitle').textContent=mainTurn===HUMAN?'Escolha uma casa disponível.':'O bot vai escolher uma casa.';
    $('turnSymbol').textContent=mainTurn;$('turnSymbol').style.color=mainTurn===HUMAN?'var(--blue)':'var(--red)';
    if(mainTurn===BOT)window.setTimeout(botMainMove,550);
  }
  function botMiniMove() {
    if(gameOver||activeCell===null||miniFinished||mainTurn!==HUMAN)return;
    const board=miniBoards[activeCell];if(available(board).length===0)return;
    const move=chooseBotMove(board,difficulty,BOT,HUMAN);playMini(move,BOT);
  }
  function botMainMove() {
    if(gameOver||mainTurn!==BOT)return;
    const opts=available(main);if(!opts.length){endGame('D');return;}
    const index=chooseBotMove(main,difficulty,BOT,HUMAN);activeCell=index;miniTurn=BOT;miniFinished=false;
    $('miniTitle').textContent=`Casa ${index+1} · X contra #`;$('miniStatus').textContent='VEZ DO BOT';$('miniStatus').classList.add('active');
    $('miniMessage').textContent='O bot escolheu esta casa. Agora é sua vez no minijogo.';
    // A escolha do bot no tabuleiro grande não joga automaticamente no minijogo.
    // A pessoa joga X primeiro em cada minijogo, conforme as regras originais.
    mainTurn=HUMAN;$('gameTitle').textContent='Sua vez, X';$('gameSubtitle').textContent='O bot escolheu a casa. Jogue o minijogo.';
    $('turnSymbol').textContent='X';$('turnSymbol').style.color='var(--blue)';renderMain();renderMini();
  }
  function chooseBotMove(board, level, bot, human) {
    const opts=available(board);if(!opts.length)return -1;
    if(level==='easy')return opts[Math.floor(Math.random()*opts.length)];
    // Tenta vencer imediatamente, depois bloquear uma vitória imediata do jogador.
    for(const i of opts){board[i]=bot;const win=hasLine(board,bot);board[i]=null;if(win)return i;}
    for(const i of opts){board[i]=human;const danger=hasLine(board,human);board[i]=null;if(danger)return i;}
    if(level==='medium'){
      if(board[4]===null)return 4;
      const corners=[0,2,6,8].filter(i=>board[i]===null);if(corners.length)return corners[Math.floor(Math.random()*corners.length)];
      return opts[Math.floor(Math.random()*opts.length)];
    }
    let best=-Infinity,bestMove=opts[0];
    for(const i of opts){board[i]=bot;const score=minimax(board,false,bot,human,0);board[i]=null;if(score>best){best=score;bestMove=i;}}
    return bestMove;
  }
  function minimax(board, maximizing, bot, human, depth) {
    if(hasLine(board,bot))return 10-depth;if(hasLine(board,human))return depth-10;
    const opts=available(board);if(!opts.length)return 0;
    let best=maximizing?-Infinity:Infinity;
    for(const i of opts){board[i]=maximizing?bot:human;const score=minimax(board,!maximizing,bot,human,depth+1);board[i]=null;best=maximizing?Math.max(best,score):Math.min(best,score);}
    return best;
  }
  function endGame(winner) {
    gameOver=true;$('resultModal').classList.remove('hidden');
    $('resultIcon').textContent=winner===HUMAN?'🏆':winner===BOT?'🤖':'🤝';
    $('resultTitle').textContent=winner===HUMAN?'Você venceu!':winner===BOT?'O bot venceu':'Empate!';
    $('resultText').textContent=winner===HUMAN?'Estratégia perfeita. Você dominou o tabuleiro!':winner===BOT?'O bot levou esta partida. Tente outra estratégia!':'Ninguém conseguiu formar uma linha. Vamos de novo?';
    $('gameTitle').textContent=winner===HUMAN?'Vitória de X':winner===BOT?'Vitória do bot':'Partida empatada';
    $('gameSubtitle').textContent='Partida finalizada.';beep(winner===HUMAN?880:180,.22);renderMain();renderMini();
  }
  document.querySelectorAll('.difficulty').forEach(btn=>btn.addEventListener('click',()=>{difficulty=btn.dataset.level;document.querySelectorAll('.difficulty').forEach(b=>b.classList.toggle('selected',b===btn));}));
  $('startBtn').addEventListener('click',newGame);$('restartBtn').addEventListener('click',newGame);$('newGameBtn').addEventListener('click',newGame);
  $('backBtn').addEventListener('click',showHome);$('playAgainBtn').addEventListener('click',newGame);$('modalMenuBtn').addEventListener('click',showHome);
  $('soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('soundBtn').textContent=soundOn?'♪':'×';$('soundBtn').style.color=soundOn?'var(--blue)':'var(--muted)';if(soundOn)beep();});
  // Pequenas funções expostas apenas para testes automatizados no ambiente de desenvolvimento.
  if(typeof window!=='undefined')window.MetaVelhaTest={hasLine,chooseBotMove,minimax,WIN_LINES};
  renderMain();renderMini();
})();
