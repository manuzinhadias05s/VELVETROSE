
const brl = n => (+n || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const pad = 'https://placehold.co/600x750/f5f0e8/642638?text=Velvet+Rose';

const base = [
  ['Vestido Aurora','Vestidos',249.90,'Vestido midi elegante.','https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700'],
  ['Blusa Serena','Blusas',119.90,'Blusa delicada e versátil.','https://images.unsplash.com/photo-1564257577-7a2d7e2b8f5d?w=700'],
  ['Calça Chiara','Calças',189.90,'Alfaiataria contemporânea.','https://images.unsplash.com/photo-1506629905607-d9a6c6b7f4a3?w=700'],
  ['Conjunto Amélie','Conjuntos',299.90,'Conjunto coordenado.','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700'],
  ['Saia Lívia','Saias',149.90,'Silhueta fluida.','https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=700'],
  ['Blazer Valentina','Blazers',329.90,'Alfaiataria sofisticada.','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700']
];

let produtos = JSON.parse(localStorage.vrProducts || 'null') ||
  base.map((x,i) => ({
    id:i+1,nome:x[0],cat:x[1],preco:x[2],
    desc:x[3],img:x[4]
  }));

let caixa = JSON.parse(localStorage.vrCash || '[]');

function salvar() {
  localStorage.vrProducts = JSON.stringify(produtos);
  render();
}

function render(cat='Todas') {
  document.getElementById('produtos').innerHTML =
    produtos.filter(p => cat === 'Todas' || p.cat === cat)
    .map(p => `
      <article class="product">
        <img src="${p.img || pad}" onerror="this.src='${pad}'" alt="${p.nome}">
        <h3>${p.nome}</h3>
        <p>${p.desc} · <b>${brl(p.preco)}</b></p>
      </article>
    `).join('');
}

function filtrar(c) { render(c); }

render();

function parcelar() {
  let v = +valor.value;
  let e = +entrada.value;
  let n = Math.max(1, +document.getElementById('n').value);
  let t = +taxa.value / 100;
  let p = Math.max(0, v-e);
  let r;

  if (metodo.value === 'price' && t > 0 && n > 1) {
    r = p*t*Math.pow(1+t,n)/(Math.pow(1+t,n)-1);
  } else {
    r = p*(1+t*n)/n;
  }

  let total = e+r*n;

  document.getElementById('rParcelas').innerHTML = `
    Valor da parcela: <b>${brl(r)}</b> × ${n}<br>
    Entrada: ${brl(e)}<br>
    Total pago: <b>${brl(total)}</b><br>
    Juros totais: ${brl(Math.max(0,total-v))}
  `;
}

function descontar() {
  let p = +preco.value;
  let d = Math.min(100,Math.max(0,+desc.value));
  let c = +custoDesc.value;
  let s = p*(1-d/100);
  let l = s-c;

  document.getElementById('rDesconto').innerHTML = `
    Desconto: ${brl(p*d/100)}<br>
    Preço promocional: <b>${brl(s)}</b><br>
    Lucro: ${brl(l)}<br>
    Margem: ${s ? (l/s*100).toFixed(1) : 0}%
  `;
}

function abrirAdmin() {
  document.getElementById('login').classList.add('show');
}

function fecharAdmin() {
  document.getElementById('login').classList.remove('show');
}

function login() {
  if (document.getElementById('senha').value === 'velvet-demo-2019') {
    fecharAdmin();
    document.getElementById('admin').classList.add('show');
    lista();
    renderCaixa();
    document.getElementById('admin').scrollIntoView();
  } else {
    alert('Senha incorreta.');
  }
}

function sair() {
  document.getElementById('admin').classList.remove('show');
}

function aba(id) {
  document.getElementById('cadastro').hidden = id !== 'cadastro';
  document.getElementById('financeiro').hidden = id !== 'financeiro';
  if (id === 'financeiro') renderCaixa();
}

function salvarProduto() {
  let id = +pid.value || Date.now();
  let p = {
    id,
    nome:pnome.value,
    cat:pcat.value,
    preco:+pvalor.value,
    desc:pdesc.value,
    img:pimg.value || pad
  };

  if (!p.nome || p.preco < 0) {
    return alert('Preencha nome e preço.');
  }

  let i = produtos.findIndex(x => x.id === id);
  if (i < 0) produtos.push(p);
  else produtos[i] = p;

  salvar();
  limpar();
  lista();
}

function limpar() {
  pid.value = '';
  pnome.value = '';
  pvalor.value = '';
  pimg.value = '';
  pdesc.value = '';
}

function lista() {
  document.getElementById('listaAdmin').innerHTML =
    produtos.map(p => `
      <div class="adminrow">
        <span>${p.nome} — ${brl(p.preco)}</span>
        <span>
          <button onclick="editar(${p.id})">Editar</button>
          <button onclick="excluir(${p.id})">Excluir</button>
        </span>
      </div>
    `).join('');
}

function editar(id) {
  let p = produtos.find(x => x.id === id);
  pid.value = p.id;
  pnome.value = p.nome;
  pcat.value = p.cat;
  pvalor.value = p.preco;
  pimg.value = p.img;
  pdesc.value = p.desc;
}

function excluir(id) {
  if (confirm('Excluir produto?')) {
    produtos = produtos.filter(p => p.id !== id);
    salvar();
    lista();
  }
}

function precoVenda() {
  let custo = +materia.value + +mao.value + +variaveis.value;
  let f = +fixos.value;
  let m = Math.min(95,+margem.value)/100;
  let u = Math.max(1,+unidades.value);
  let preco = custo/(1-m);
  let mc = preco-(+variaveis.value);
  let pe = mc > 0 ? Math.ceil(f/mc) : Infinity;

  document.getElementById('rPreco').innerHTML = `
    Custo variável unitário: ${brl(custo)}<br>
    Preço de venda sugerido: <b>${brl(preco)}</b><br>
    Margem de contribuição: ${brl(mc)}<br>
    Ponto de equilíbrio: ${isFinite(pe) ? pe+' unidades' : 'Não calculável'}<br>
    Lucro estimado: ${brl((preco-(+variaveis.value))*u-f)}
  `;
}

function movimentar() {
  let d = descricao.value;
  let v = +quantia.value;

  if (!d || v <= 0) return alert('Informe descrição e valor.');

  caixa.push({
    d,v,
    t:tipo.value,
    data:data.value || new Date().toISOString().slice(0,10)
  });

  localStorage.vrCash = JSON.stringify(caixa);
  descricao.value = '';
  quantia.value = '';
  renderCaixa();
}

function renderCaixa() {
  let ent = caixa.filter(x => x.t === 'entrada')
    .reduce((a,x) => a+x.v,0);

  let sai = caixa.filter(x => x.t === 'saida')
    .reduce((a,x) => a+x.v,0);

  document.getElementById('resumoCaixa').innerHTML = `
    Receitas: <b>${brl(ent)}</b> ·
    Despesas: <b>${brl(sai)}</b> ·
    Saldo: <b>${brl(ent-sai)}</b>
  `;

  document.getElementById('listaCaixa').innerHTML =
    caixa.slice().reverse().map(x => `
      <div class="adminrow">
        ${x.data} · ${x.d}
        <b>${x.t === 'entrada' ? '+' : '−'}${brl(x.v)}</b>
      </div>
    `).join('') || 'Nenhuma movimentação registrada.';
}
