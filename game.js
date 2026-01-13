const clickSound = new Audio("sounds/click.mp3");
const buySound = new Audio("sounds/buy.mp3");
const prestigeSound = new Audio("sounds/prestige.mp3");

let game = JSON.parse(localStorage.getItem("save")) || {
  money:0,
  baseIncome:0,
  mult:1,
  prestige:1,
  owned:{},
  achievements:[],
  lastTime:Date.now(),
  theme:"dark"
};

const data = {
  jobs:[{n:"Intern",c:50,i:1},{n:"Developer",c:500,i:10},{n:"CEO",c:50000,i:1000}],
  clothes:[{n:"Suit",c:500,m:1.2},{n:"Luxury",c:5000,m:1.5}],
  cars:[{n:"Sports Car",c:10000,m:1.5},{n:"Supercar",c:100000,m:2}],
  homes:[{n:"Mansion",c:50000,m:2},{n:"Island",c:1000000,m:3}],
  employees:[{n:"Assistant",c:1000,i:5},{n:"Manager",c:10000,i:50}],
  companies:[{n:"Startup",c:50000,i:500},{n:"Corp",c:500000,i:5000}]
};

function income(){ return game.baseIncome * game.mult * game.prestige; }

function format(n){
  if(n>=1e9) return "$"+(n/1e9).toFixed(2)+"B";
  if(n>=1e6) return "$"+(n/1e6).toFixed(2)+"M";
  if(n>=1e3) return "$"+(n/1e3).toFixed(2)+"K";
  return "$"+Math.floor(n);
}

function clickMoney(){
  clickSound.play();
  game.money += 1 * game.prestige;
  render();
}

function buy(item){
  if(game.money<item.c||game.owned[item.n])return;
  buySound.play();
  game.money-=item.c;
  game.owned[item.n]=true;
  if(item.i) game.baseIncome+=item.i;
  if(item.m) game.mult*=item.m;
  render();
}

function buttons(arr,id){
  const el=document.getElementById(id); el.innerHTML="";
  arr.forEach(i=>{
    let b=document.createElement("button");
    b.textContent=game.owned[i.n]?`${i.n} ✔`:`${i.n} (${format(i.c)})`;
    b.disabled=game.owned[i.n]||game.money<i.c;
    b.onclick=()=>buy(i);
    el.appendChild(b);
  });
}

function prestige(){
  if(game.money<1e6) return alert("Need $1M");
  prestigeSound.play();
  game.money=0; game.baseIncome=0; game.mult=1; game.owned={};
  game.prestige+=0.5;
  render();
}

function invest(){
  game.money *= Math.random()>0.5?1.4:0.7;
  render();
}

function toggleTheme(){
  game.theme = game.theme==="dark"?"light":"dark";
  document.body.className = game.theme==="light"?"light":"";
  save();
}

function achievements(){
  const list=document.getElementById("achievements"); list.innerHTML="";
  [["Millionaire",1e6],["Billionaire",1e9]].forEach(a=>{
    if(game.money>=a[1]&&!game.achievements.includes(a[0]))
      game.achievements.push(a[0]);
    if(game.achievements.includes(a[0])){
      let li=document.createElement("li"); li.textContent="🏆 "+a[0];
      list.appendChild(li);
    }
  });
}

function offlineEarnings(){
  let now=Date.now();
  let diff=(now-game.lastTime)/1000;
  game.money+=diff*income();
  game.lastTime=now;
}

function save(){ localStorage.setItem("save",JSON.stringify(game)); }

function render(){
  document.getElementById("money").textContent=format(game.money);
  document.getElementById("income").textContent=format(income())+"/sec";
  document.getElementById("prestige").textContent="Prestige x"+game.prestige.toFixed(1);
  buttons(data.jobs,"jobs");
  buttons(data.clothes,"clothes");
  buttons(data.cars,"cars");
  buttons(data.homes,"homes");
  buttons(data.employees,"employees");
  buttons(data.companies,"companies");
  achievements();
  save();
}

offlineEarnings();
setInterval(()=>{ game.money+=income(); render(); },1000);
render();
