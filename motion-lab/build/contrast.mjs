const hex = (h) => [1,3,5].map(i => parseInt(h.slice(i, i+2), 16) / 255);
const lin = (c) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const L = (h) => { const [r,g,b] = hex(h).map(lin); return 0.2126*r + 0.7152*g + 0.0722*b; };
const cr = (a, b) => { const [x,y] = [L(a), L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
const pairs = [
  ["mint on slate", "#D4F0C9", "#1D3A3C"],
  ["white on slate", "#FFFFFF", "#1D3A3C"],
  ["mint on ink", "#D4F0C9", "#0F1D1E"],
  ["ink on paper", "#0F1D1E", "#F3F5F2"],
  ["steel on paper", "#56666A", "#F3F5F2"],
  ["teal on paper", "#557A7C", "#F3F5F2"],
  ["slate on mint", "#1D3A3C", "#D4F0C9"],
  ["slate on paper", "#1D3A3C", "#F3F5F2"],
  ["teal on slate", "#557A7C", "#1D3A3C"],
  ["mint on slate-2", "#D4F0C9", "#26484A"],
  ["white on slate-2", "#FFFFFF", "#26484A"],
  ["steel on paper-2", "#56666A", "#E7ECE8"],
];
for (const [n,a,b] of pairs) console.log(n.padEnd(20), cr(a,b).toFixed(2));
// alpha-blended text on slate: mint at 60%, 80% ; white at 70%
const blend = (fg, bg, a) => "#" + [1,3,5].map(i => Math.round(parseInt(fg.slice(i,i+2),16)*a + parseInt(bg.slice(i,i+2),16)*(1-a)).toString(16).padStart(2,"0")).join("");
for (const a of [0.5,0.6,0.7,0.8]) console.log(`mint@${a} on slate`.padEnd(20), cr(blend("#D4F0C9","#1D3A3C",a),"#1D3A3C").toFixed(2), `white@${a} on slate`.padEnd(22), cr(blend("#FFFFFF","#1D3A3C",a),"#1D3A3C").toFixed(2));
