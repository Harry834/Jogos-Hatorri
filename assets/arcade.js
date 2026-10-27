export const GAMES = Object.freeze([
  { id:'uno', name:'Uno', category:'cartas', label:'Cartas', description:'Sua mão, suas escolhas. Encare três bots.', color:'#6d5147', art:'cards', fresh:true, mode:'Contra bots' },
  { id:'campo-minado', name:'Campo Minado', category:'estrategia', label:'Estratégia', description:'Bandeiras, números e um pouco de coragem.', color:'#536047', art:'mines', fresh:true, mode:'Solo' },
  { id:'cobrinha', name:'Cobrinha', category:'classicos', label:'Clássico', description:'Cresça, faça curvas. Não morda a cauda.', color:'#244f43', art:'snake', mode:'Solo' },
  { id:'2048', name:'2048', category:'estrategia', label:'Estratégia', description:'Junte os números. A próxima soma é sua.', color:'#654b38', art:'numbers', mode:'Solo' },
  { id:'flappy', name:'Flappy', category:'casual', label:'Casual', description:'Um toque para subir. Ritmo para continuar.', color:'#304d62', art:'bird', mode:'Solo' },
  { id:'dino', name:'Dino Run', category:'classicos', label:'Clássico', description:'Desvie dos cactos e vá um pouco além.', color:'#5c5841', art:'dino', mode:'Solo' },
  { id:'memoria', name:'Memória', category:'casual', label:'Casual', description:'Encontre os pares. Treine o seu olhar.', color:'#61506e', art:'memory', fresh:true, mode:'Solo' },
  { id:'velha', name:'Jogo da Velha', category:'estrategia', label:'Estratégia', description:'Três em linha. Um clássico sem idade.', color:'#4b485e', art:'tic', mode:'Bot ou local' },
  { id:'xadrez', name:'Xadrez', category:'estrategia', label:'Estratégia', description:'Pense à frente. Versão simplificada.', color:'#4f5d64', art:'chess', mode:'Bot ou local' },
  { id:'damas', name:'Damas', category:'estrategia', label:'Estratégia', description:'Capture, avance e conquiste o tabuleiro.', color:'#694749', art:'checkers', mode:'Bot ou local' },
  { id:'pong', name:'Pong', category:'classicos', label:'Clássico', description:'Raquetes, reflexo e aquela última defesa.', color:'#354a66', art:'pong', mode:'Contra bot' },
  { id:'piano', name:'Piano', category:'casual', label:'Música', description:'Uma pausa para tocar a sua melodia.', color:'#635c4d', art:'piano', mode:'Livre' },
  { id:'slots', name:'Slots', category:'casual', label:'Recreativo', description:'Só diversão. Créditos fictícios, sem apostas.', color:'#674f3e', art:'slots', mode:'Solo' },
]);
export function filterGames({query='', category='todos', favoritesOnly=false, favorites=[]}={}) {
  const normal = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const term=normal(String(query).slice(0,80));
  return GAMES.filter(game=>(category==='todos'||game.category===category)&&(!favoritesOnly||favorites.includes(game.id))&&normal(`${game.name} ${game.description} ${game.label}`).includes(term));
}
export function safeFavorites(value) {
  if(!Array.isArray(value)) return [];
  return [...new Set(value.filter(id=>GAMES.some(game=>game.id===id)))];
}
const line = (x1,y1,x2,y2,color,width=4) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const square=(x,y,w,h,fill,r=5)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const txt=(x,y,text,size=26,fill='#f4eedf')=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}" font-weight="700">${text}</text>`;
function artwork(kind) {
  let draw='';
  if(kind==='cards') draw=`<g transform="rotate(-18 110 85)">${square(62,32,63,96,'#4285a5',7)}${square(67,37,53,86,'#498cb2',6)}${txt(94,79,'↺',37)}</g><g transform="rotate(16 130 90)">${square(109,38,63,96,'#f2e6cd',7)}${square(114,43,53,86,'#d87350',5)}<ellipse cx="140" cy="85" rx="20" ry="30" fill="none" stroke="#f2e6cd" stroke-width="2" transform="rotate(20 140 85)"/>${txt(141,85,'+4',28)}</g>`;
  if(kind==='mines') {for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=59+c*29,y=38+r*29,closed=(r+c)%3===0;draw+=square(x,y,25,25,closed?'#87925c':'#c8cda4',3);if(!closed)draw+=txt(x+12,y+12,(r+c)%2?'1':'2',15,(r+c)%2?'#426381':'#577449')}draw+=txt(71,51,'⚑',17,'#f4d78f');}
  if(kind==='snake') draw=`<path d="M63 55H92V81H127V111H160V78H141" fill="none" stroke="#c8e899" stroke-width="19" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="74" r="2" fill="#244735"/><circle cx="138" cy="82" r="2" fill="#244735"/>${square(163,40,12,12,'#ef9b6a',3)}<path d="M172 39l3-6" stroke="#a5bd7c" stroke-width="2"/>`;
  if(kind==='numbers'){[[62,35,'8','#aa8152'],[111,35,'16','#cc9b63'],[62,84,'32','#e0b773'],[111,84,'64','#e6c78b']].forEach(([x,y,t,c])=>draw+=square(x,y,43,43,c,6)+txt(x+21.5,y+21.5,t,22,'#403525'));}
  if(kind==='bird')draw=`${square(156,-3,32,57,'#8cae87',3)}${square(150,46,44,13,'#a9c894',3)}${square(156,112,32,45,'#8cae87',3)}${square(150,107,44,13,'#a9c894',3)}<ellipse cx="94" cy="78" rx="24" ry="20" fill="#ebca7a"/><ellipse cx="82" cy="86" rx="14" ry="9" fill="#d99966"/><circle cx="104" cy="72" r="7" fill="#faf1d4"/><circle cx="107" cy="72" r="3" fill="#323d45"/>${square(111,80,18,7,'#e99c69',2)}${line(35,51,53,51,'#a5c0c855',2)}${line(29,66,51,66,'#a5c0c855',2)}`;
  if(kind==='dino')draw=`<path d="M72 111V85H61V67H69V79H82V56H91V32H123V38H131V57H104V67H122V78H114V72H104V96H97V111H104V117H90V99H83V117H70V111Z" fill="#d6deaf"/>${square(116,39,5,5,'#546044',0)}<path d="M158 115V67M148 87H158M148 77V91M168 77V101H158" stroke="#b5bd8b" stroke-width="7" stroke-linejoin="round"/>${line(45,123,192,123,'#a4af7e',2)}`;
  if(kind==='memory')draw=`<g transform="rotate(-12 90 80)">${square(54,37,57,81,'#cfbad2',7)}${txt(83,78,'✿',36,'#705679')}</g><g transform="rotate(12 142 80)">${square(112,32,57,81,'#d9c8dd',7)}${txt(141,73,'✿',36,'#705679')}</g><path d="M174 117l9-10m-3 16 12-2" stroke="#b2a5c2" stroke-width="3" stroke-linecap="round"/>`;
  if(kind==='tic')draw=`${line(95,32,95,126,'#b2a7c1',3)}${line(135,32,135,126,'#b2a7c1',3)}${line(61,62,170,62,'#b2a7c1',3)}${line(61,96,170,96,'#b2a7c1',3)}${txt(78,46,'×',29,'#e7c29a')}${txt(113,79,'×',29,'#e7c29a')}${txt(152,112,'×',29,'#e7c29a')}<circle cx="152" cy="45" r="10" stroke="#b9cfb8" stroke-width="4" fill="none"/><circle cx="77" cy="111" r="10" stroke="#b9cfb8" stroke-width="4" fill="none"/>`;
  if(kind==='chess')draw=`<path d="M75 128H170l-15-15H90z" fill="#abb8ac"/>${txt(125,77,'♞',110,'#e1dbc5')}`;
  if(kind==='checkers'){for(let r=0;r<4;r++)for(let c=0;c<4;c++)draw+=square(61+c*28,23+r*28,28,28,(r+c)%2?'#805a56':'#c9ac8e',0);[[103,65,'#e2ca97'],[159,65,'#2e3637'],[75,93,'#d67e63'],[131,121,'#d67e63']].forEach(([x,y,c])=>draw+=`<ellipse cx="${x}" cy="${y+3}" rx="11" ry="10" fill="#0004"/><circle cx="${x}" cy="${y}" r="11" fill="${c}"/><circle cx="${x}" cy="${y}" r="7" stroke="#ffffff40" fill="none"/>`);}
  if(kind==='pong')draw=`${square(46,44,9,52,'#d3e5bd',3)}${square(176,72,9,52,'#eba77d',3)}<path d="M116 15V144" stroke="#a8b7c4" stroke-dasharray="5 6" stroke-width="2" opacity=".5"/><circle cx="135" cy="64" r="7" fill="#f0e5c8"/>${line(148,59,169,48,'#d0c9b777',2)}${txt(78,26,'3',16,'#c0cfd3')}${txt(151,26,'2',16,'#c0cfd3')}`;
  if(kind==='piano'){for(let i=0;i<7;i++)draw+=square(37+i*23,34,21,90,'#e9e1cb',3);[0,1,3,4,5].forEach(i=>draw+=square(52+i*23,34,14,55,'#303b36',2));draw+=txt(175,129,'♪',24,'#a7b991');}
  if(kind==='slots')draw=`${square(39,42,154,75,'#d0ad78',10)}${square(47,50,138,59,'#443d35',7)}${[0,1,2].map((i)=>square(51+i*44,55,39,49,'#e5d6b5',4)+txt(70+i*44,80,['7','★','7'][i],29,'#bb6c52')).join('')}${line(42,123,190,123,'#b69368',3)}`;
  return `<svg viewBox="0 0 235 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="117" cy="80" r="72" fill="#ffffff04"/><circle cx="117" cy="80" r="58" stroke="#ffffff08"/>${draw}</svg>`;
}
if(typeof document!=='undefined') {
  let favorites=[];
  try{favorites=safeFavorites(JSON.parse(localStorage.getItem('hatorri-favorites-v2')||'[]'));}catch{}
  const grid=document.getElementById('game-grid'), search=document.getElementById('game-search');
  let category='todos', toastTimer;
  const isFavorites=()=>location.hash==='#favoritos';
  function notify(text){const toast=document.getElementById('toast');toast.textContent=text;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),1900);}
  function render(){
    const list=filterGames({query:search.value,category,favoritesOnly:isFavorites(),favorites});
    grid.replaceChildren();
    for(const game of list){
      const card=document.createElement('article');card.className='game-card';
      const link=document.createElement('a');link.className='game-link';link.href=`games/${game.id}.html`;
      // Only the fixed, local catalog supplies these trusted strings and SVG shapes.
      link.innerHTML=`<div class="game-visual" style="background:${game.color}">${artwork(game.art)}${game.fresh?'<span class="card-label">NOVO</span>':''}</div><div class="game-info"><h3>${game.name}</h3><p>${game.description}</p><div class="card-bottom"><span>${game.mode}</span><span class="tag">${game.label}</span><span class="play-arrow" aria-hidden="true">↗</span></div></div>`;
      link.setAttribute('aria-label',`Jogar ${game.name} · ${game.mode}`);
      const fav=document.createElement('button');fav.className='favorite';fav.type='button';
      const selected=favorites.includes(game.id);fav.setAttribute('aria-pressed',String(selected));fav.setAttribute('aria-label',`${selected?'Remover':'Adicionar'} ${game.name} ${selected?'dos':'aos'} favoritos`);fav.textContent=selected?'♥':'♡';
      fav.addEventListener('click',()=>{favorites=selected?favorites.filter(id=>id!==game.id):[...favorites,game.id];try{localStorage.setItem('hatorri-favorites-v2',JSON.stringify(favorites));}catch{}render();notify(selected?'Removido dos favoritos':'Salvo nos favoritos');document.querySelector(`button[data-favorite="${game.id}"]`)?.focus({preventScroll:true});});
      fav.dataset.favorite=game.id;card.append(link,fav);grid.append(card);
    }
    document.getElementById('fav-count').textContent=favorites.length;
    document.getElementById('result-count').textContent=`${list.length} ${list.length===1?'jogo':'jogos'}`;
    document.getElementById('empty-state').hidden=list.length>0;
    document.getElementById('catalog-title').textContent=isFavorites()?'Seus jogos favoritos':'Escolha sua próxima partida';
    document.querySelectorAll('[data-nav]').forEach(link=>link.classList.toggle('active',link.dataset.nav===(isFavorites()?'favoritos':location.hash==='#jogos'?'jogos':'inicio')));
  }
  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;document.querySelectorAll('[data-category]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});render();}));
  search.addEventListener('input',render);
  document.addEventListener('keydown',event=>{if(event.key==='/'&&document.activeElement?.tagName!=='INPUT'){event.preventDefault();search.focus();search.scrollIntoView({block:'center'});}else if(event.key==='Escape'&&document.activeElement===search){search.value='';render();search.blur();}});
  window.addEventListener('hashchange',()=>{render();if(isFavorites())document.getElementById('jogos').scrollIntoView({block:'start'});});
  render();if(isFavorites())requestAnimationFrame(()=>document.getElementById('jogos').scrollIntoView({block:'start'}));
}
