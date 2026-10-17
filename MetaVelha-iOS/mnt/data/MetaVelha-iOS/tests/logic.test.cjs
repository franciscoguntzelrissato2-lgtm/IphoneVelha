const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const js = fs.readFileSync(require('node:path').join(__dirname, '..', 'script.js'), 'utf8');
// Executa o arquivo em um DOM mínimo simulado para verificar a sintaxe e as funções puras.
class Element {
  constructor(){this.children=[];this.classList={add(){},remove(){},toggle(){},contains(){return false}};this.style={};this.dataset={};this.listeners={};this.textContent='';this.innerHTML='';this.disabled=false;}
  append(e){this.children.push(e)} addEventListener(k,f){this.listeners[k]=f} setAttribute(){}
}
const elements = new Map();
const document = {getElementById(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id)},querySelectorAll(){return []},createElement(){return new Element()}};
const window = {setTimeout(fn){ /* evita execução assíncrona durante teste */ }, MetaVelhaTest:null};
const sandbox = {document,window,console,Math,Array,Object,Infinity};
vm.runInNewContext(js,sandbox,{timeout:1000});
const api=window.MetaVelhaTest;assert.ok(api,'API de teste exposta');
assert.equal(api.hasLine(['X','X','X',null,null,null,null,null,null],'X'),true,'detecta linha horizontal');
assert.equal(api.hasLine(['X',null,null,null,'X',null,null,null,'X'],'X'),true,'detecta diagonal');
assert.equal(api.hasLine(['X','#','X','#','X','#','#','X','#'],'X'),false,'não inventa vitória');
let b=Array(9).fill(null);b[0]='#';b[1]='#';assert.equal(api.chooseBotMove(b,'hard','#','X'),2,'bot difícil finaliza vitória disponível');
b=Array(9).fill(null);b[0]='X';b[1]='X';assert.equal(api.chooseBotMove(b,'hard','#','X'),2,'bot difícil bloqueia vitória imediata');
b=Array(9).fill(null);const opening=api.chooseBotMove(b,'hard','#','X');assert.ok(opening>=0&&opening<9,'bot difícil escolhe uma casa válida no início');assert.equal(b.filter(v=>v!==null).length,0,'a avaliação da IA não altera o tabuleiro');
console.log('OK: detecção de vitória, diagonais, prevenção de falso positivo e decisões de bot testadas.');
