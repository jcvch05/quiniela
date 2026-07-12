'use client';
import { useEffect, useState } from 'react';
import { PARTIDOS_CUARTOS, PARTIDOS_SEMIS } from '@/lib/partidos';
import { bandera } from '@/lib/banderas';

// ── Equipos por partido D ─────────────────────────────────────────
const EQ: Record<string, [string,string,string,string]> = {
  D01:['Sudáfrica',   'Canadá',       '🇿🇦','🇨🇦'],
  D02:['Brasil',      'Japón',        '🇧🇷','🇯🇵'],
  D03:['Alemania',    'Paraguay',     '🇩🇪','🇵🇾'],
  D04:['P. Bajos',    'Marruecos',    '🇳🇱','🇲🇦'],
  D05:['C. Marfil',   'Noruega',      '🇨🇮','🇳🇴'],
  D06:['Francia',     'Suecia',       '🇫🇷','🇸🇪'],
  D07:['México',      'Ecuador',      '🇲🇽','🇪🇨'],
  D08:['Inglaterra',  'R.D. Congo',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇨🇩'],
  D09:['EE.UU.',      'Bosnia',       '🇺🇸','🇧🇦'],
  D10:['Bélgica',     'Senegal',      '🇧🇪','🇸🇳'],
  D11:['España',      'Austria',      '🇪🇸','🇦🇹'],
  D12:['Portugal',    'Croacia',      '🇵🇹','🇭🇷'],
  D13:['Suiza',       'Argelia',      '🇨🇭','🇩🇿'],
  D14:['Australia',   'Egipto',       '🇦🇺','🇪🇬'],
  D15:['Argentina',   'Cabo Verde',   '🇦🇷','🇨🇻'],
  D16:['Colombia',    'Ghana',        '🇨🇴','🇬🇭'],
};

// Bracket structure (left side O1-O4, right side O5-O8)
// Each octavo fed by 2 dieciseiavos
const BRACKET = [
  { oid:'O01', d1:'D01', d2:'D04' },
  { oid:'O02', d1:'D03', d2:'D06' },
  { oid:'O03', d1:'D02', d2:'D05' },
  { oid:'O04', d1:'D07', d2:'D08' },
  { oid:'O05', d1:'D11', d2:'D12' },
  { oid:'O06', d1:'D09', d2:'D10' },
  { oid:'O07', d1:'D15', d2:'D14' },
  { oid:'O08', d1:'D13', d2:'D16' },
];

interface Res { id:string; golesLocal?:number; golesVisitante?:number; jugado?:boolean }
type Team = { name:string; flag:string } | null;

function winnerD(res:Res|undefined, dId:string): Team {
  if (!res?.jugado || res.golesLocal==null || res.golesVisitante==null) return null;
  const e = EQ[dId];
  if (res.golesLocal > res.golesVisitante) return {name:e[0],flag:e[2]};
  if (res.golesVisitante > res.golesLocal) return {name:e[1],flag:e[3]};
  return null;
}
function winnerMatch(res:Res|undefined, t1:Team, t2:Team): Team {
  if (!res?.jugado || !t1 || !t2 || res.golesLocal==null || res.golesVisitante==null) return null;
  if (res.golesLocal > res.golesVisitante) return t1;
  if (res.golesVisitante > res.golesLocal) return t2;
  return null;
}

// ── Layout constants ──────────────────────────────────────────────
const DCW = 108;  // dieciseiavos card width
const CW  = 128;  // octavos/cuartos/semis/final card width
const DCH = 56;   // dieciseiavos card height (8 header + 24+24)
const CH  = 64;   // other card height (8 header + 28+28)
const CG  = 20;   // gap between columns

// D-card vertical positions (2 cards per octavo, 4 octavos per side)
// Gaps: inner(between pair)=6, mid(between pairs same Q)=18, big(between Q groups)=32
const DY: number[] = [];
{
  const gaps = [6, 18, 6, 32, 6, 18, 6];
  let y = 0;
  for (let i = 0; i < 8; i++) {
    DY.push(y);
    if (i < 7) y += DCH + gaps[i];
  }
}
const D_TOTAL_H = DY[7] + DCH; // total height

// Octavo card tops (centered between their 2 D cards)
const OY = [0,1,2,3].map(i => {
  const c1 = DY[i*2] + DCH/2;
  const c2 = DY[i*2+1] + DCH/2;
  return Math.round((c1+c2)/2 - CH/2);
});

// Cuarto card tops (centered between their 2 octavos)
const QY = [0,1].map(i => {
  const c1 = OY[i*2] + CH/2;
  const c2 = OY[i*2+1] + CH/2;
  return Math.round((c1+c2)/2 - CH/2);
});

// Semi card top
const SY = Math.round((QY[0]+CH/2 + QY[1]+CH/2)/2 - CH/2);

// Column left-edge x positions
const COL_DL  = 0;
const COL_OL  = DCW + CG;
const COL_QL  = COL_OL + CW + CG;
const COL_SL  = COL_QL + CW + CG;
const COL_F   = COL_SL + CW + CG;
const COL_SR  = COL_F  + CW + CG;
const COL_QR  = COL_SR + CW + CG;
const COL_OR  = COL_QR + CW + CG;
const COL_DR  = COL_OR + CW + CG;
const TOTAL_W = COL_DR + DCW;

const TOTAL_H = D_TOTAL_H;
const LH = 22; // label row height

const LC = '#4B5563';

export default function BracketPage() {
  const [res, setRes] = useState<Record<string,Res>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resultados-publicos')
      .then(r => r.json())
      .then((d: Res[]) => { const m:Record<string,Res>={}; d.forEach(r=>{m[r.id]=r;}); setRes(m); })
      .catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  // Derive all teams
  const dW = BRACKET.map(b => ({
    w1: winnerD(res[b.d1], b.d1),
    w2: winnerD(res[b.d2], b.d2),
  }));
  const oW = BRACKET.map((b,i) => winnerMatch(res[b.oid], dW[i].w1, dW[i].w2));

  // Cuartos: use actual PARTIDOS_CUARTOS local/visitante to correctly map scores
  function winnerPartido(rId: string, local: string, visitante: string): Team {
    const r = res[rId];
    if (!r?.jugado || r.golesLocal==null || r.golesVisitante==null) return null;
    if (r.golesLocal > r.golesVisitante) return {name: local, flag: bandera(local)};
    if (r.golesVisitante > r.golesLocal) return {name: visitante, flag: bandera(visitante)};
    return null;
  }
  const qTeams = PARTIDOS_CUARTOS.map(p => ({
    t1: {name: p.local, flag: bandera(p.local)} as Team,
    t2: {name: p.visitante, flag: bandera(p.visitante)} as Team,
  }));
  const qW = PARTIDOS_CUARTOS.map(p => winnerPartido(p.id, p.local, p.visitante));

  const sTeams = PARTIDOS_SEMIS.map(p => ({
    t1: {name: p.local, flag: bandera(p.local)} as Team,
    t2: {name: p.visitante, flag: bandera(p.visitante)} as Team,
  }));
  const sSlots: [Team,Team][] = [[qW[0],qW[1]],[qW[2],qW[3]]];
  const sW = PARTIDOS_SEMIS.map(p => winnerPartido(p.id, p.local, p.visitante));

  // ── Card components ─────────────────────────────────────────────
  function DCard({ dId }: { dId:string }) {
    const r = res[dId];
    const e = EQ[dId];
    const played = r?.jugado && r.golesLocal!=null && r.golesVisitante!=null;
    const w1 = played && r!.golesLocal! > r!.golesVisitante!;
    const w2 = played && r!.golesVisitante! > r!.golesLocal!;
    function Row({ name, flag, won, score }: { name:string; flag:string; won:boolean; score?:number }) {
      return (
        <div className={`flex items-center gap-1 px-1.5 border-t border-white/10 text-[10px] ${won?'text-green-300 font-bold':'text-gray-400'}`} style={{height:24}}>
          <span className="text-sm leading-none">{flag}</span>
          <span className="flex-1 truncate">{name}</span>
          {score!=null && <span className={`font-black text-[11px] ${won?'text-green-300':'text-gray-500'}`}>{score}</span>}
        </div>
      );
    }
    return (
      <div className="rounded overflow-hidden border border-white/15 bg-[#0a1a0a]" style={{width:DCW,height:DCH}}>
        <div className="px-1.5 bg-white/5 text-[8px] font-black text-gray-500 tracking-widest flex items-center" style={{height:8}}>{dId}</div>
        <Row name={e[0]} flag={e[2]} won={!!w1} score={played?r!.golesLocal:undefined}/>
        <Row name={e[1]} flag={e[3]} won={!!w2} score={played?r!.golesVisitante:undefined}/>
      </div>
    );
  }

  function MatchCard({ t1, t2, r, label, highlight }: { t1:Team; t2:Team; r?:Res; label:string; highlight?:boolean }) {
    const played = r?.jugado && r.golesLocal!=null && r.golesVisitante!=null;
    const w1 = played && r!.golesLocal! > r!.golesVisitante!;
    const w2 = played && r!.golesVisitante! > r!.golesLocal!;
    function Row({ t, won, score }: { t:Team; won:boolean; score?:number }) {
      if (!t) return (
        <div className="flex items-center gap-1 px-2 border-t border-white/10 text-gray-600 text-[10px]" style={{height:28}}>
          <span className="text-xs">⏳</span><span>Por definir</span>
        </div>
      );
      return (
        <div className={`flex items-center gap-1 px-2 border-t border-white/10 text-[11px] font-semibold ${won?'bg-green-900/40 text-green-300':!played?'text-gray-200':'text-gray-500 line-through'}`} style={{height:28}}>
          <span className="text-sm leading-none">{t.flag}</span>
          <span className="flex-1 truncate">{t.name}</span>
          {score!=null && <span className={`font-black ml-1 ${won?'text-green-300':'text-gray-500'}`}>{score}</span>}
        </div>
      );
    }
    return (
      <div className={`rounded-lg overflow-hidden border ${highlight?'border-yellow-400/80 bg-yellow-950/40':'border-white/20 bg-[#0d1f0d]'}`} style={{width:CW,height:CH}}>
        <div className={`px-2 flex items-center ${highlight?'bg-yellow-900/50':'bg-white/5'}`} style={{height:8}}>
          <span className={`text-[8px] font-black tracking-widest ${highlight?'text-yellow-300':'text-gray-500'}`}>{label}</span>
        </div>
        <Row t={t1} won={!!(played&&w1)} score={played?r!.golesLocal:undefined}/>
        <Row t={t2} won={!!(played&&w2)} score={played?r!.golesVisitante:undefined}/>
      </div>
    );
  }

  // ── SVG line helpers ─────────────────────────────────────────────
  function L({ x1,y1,x2,y2 }: {x1:number;y1:number;x2:number;y2:number}) {
    return <line x1={x1} y1={y1+LH} x2={x2} y2={y2+LH} stroke={LC} strokeWidth={1.5}/>;
  }

  // Midpoint x in gap between two columns
  const MX = (col: number, w: number) => col + w + CG/2;

  // Helper: connector splitting 2 sources → 1 target (left side)
  function Bracket2to1({ srcCol,srcW,srcY1,srcY2,srcH,tgtCol,tgtY,tgtH }: {
    srcCol:number;srcW:number;srcY1:number;srcY2:number;srcH:number;
    tgtCol:number;tgtY:number;tgtH:number;
  }) {
    const mx = MX(srcCol, srcW);
    const c1 = srcY1 + srcH/2, c2 = srcY2 + srcH/2, ct = tgtY + tgtH/2;
    return <>
      <L x1={srcCol+srcW} y1={c1} x2={mx} y2={c1}/>
      <L x1={srcCol+srcW} y1={c2} x2={mx} y2={c2}/>
      <L x1={mx} y1={c1} x2={mx} y2={c2}/>
      <L x1={mx} y1={ct} x2={tgtCol} y2={ct}/>
    </>;
  }
  // Helper: connector splitting 1 source → 2 targets (right side)
  function Bracket1to2({ srcCol,srcW,srcY,srcH,tgtCol,tgtY1,tgtY2,tgtH }: {
    srcCol:number;srcW:number;srcY:number;srcH:number;
    tgtCol:number;tgtY1:number;tgtY2:number;tgtH:number;
  }) {
    const mx = srcCol + srcW + CG/2;
    const cs = srcY + srcH/2, ct1 = tgtY1 + tgtH/2, ct2 = tgtY2 + tgtH/2;
    return <>
      <L x1={srcCol+srcW} y1={cs} x2={mx} y2={cs}/>
      <L x1={mx} y1={ct1} x2={mx} y2={ct2}/>
      <L x1={mx} y1={ct1} x2={tgtCol} y2={ct1}/>
      <L x1={mx} y1={ct2} x2={tgtCol} y2={ct2}/>
    </>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-black to-blue-950 text-white">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-black text-center text-green-400 mb-1">🏆 Bracket Mundial 2026</h1>
        <p className="text-center text-gray-500 text-xs mb-4">
          {loading ? '⏳ Cargando…' : '✓ Verde = ganador · desliza para ver todo'}
        </p>

        <div className="overflow-x-auto pb-6">
          <div className="relative mx-auto" style={{width:TOTAL_W, height:TOTAL_H+LH+4}}>

            {/* ── Column labels ── */}
            {([
              [COL_DL,  DCW, '16AVOS',  'text-blue-400'],
              [COL_OL,  CW,  '8VOS',    'text-cyan-400'],
              [COL_QL,  CW,  'CUARTOS', 'text-orange-400'],
              [COL_SL,  CW,  'SEMIS',   'text-purple-400'],
              [COL_F,   CW,  'FINAL',   'text-yellow-400'],
              [COL_SR,  CW,  'SEMIS',   'text-purple-400'],
              [COL_QR,  CW,  'CUARTOS', 'text-orange-400'],
              [COL_OR,  CW,  '8VOS',    'text-cyan-400'],
              [COL_DR,  DCW, '16AVOS',  'text-blue-400'],
            ] as [number,number,string,string][]).map(([x,w,label,color]) => (
              <div key={x} className={`absolute text-[8px] font-black tracking-widest text-center ${color}`}
                style={{left:x, width:w, top:0}}>{label}</div>
            ))}

            {/* ── SVG connectors ── */}
            <svg className="absolute inset-0 pointer-events-none" width={TOTAL_W} height={TOTAL_H+LH+4}>
              {/* LEFT SIDE */}
              {/* D pairs → Octavos */}
              {[0,1,2,3].map(i => (
                <Bracket2to1 key={`do${i}`}
                  srcCol={COL_DL} srcW={DCW} srcY1={DY[i*2]} srcY2={DY[i*2+1]} srcH={DCH}
                  tgtCol={COL_OL} tgtY={OY[i]} tgtH={CH}/>
              ))}
              {/* O1,O2 → Q1 */}
              <Bracket2to1 srcCol={COL_OL} srcW={CW} srcY1={OY[0]} srcY2={OY[1]} srcH={CH}
                tgtCol={COL_QL} tgtY={QY[0]} tgtH={CH}/>
              {/* O3,O4 → Q2 */}
              <Bracket2to1 srcCol={COL_OL} srcW={CW} srcY1={OY[2]} srcY2={OY[3]} srcH={CH}
                tgtCol={COL_QL} tgtY={QY[1]} tgtH={CH}/>
              {/* Q1,Q2 → S1 */}
              <Bracket2to1 srcCol={COL_QL} srcW={CW} srcY1={QY[0]} srcY2={QY[1]} srcH={CH}
                tgtCol={COL_SL} tgtY={SY} tgtH={CH}/>
              {/* S1 → F */}
              <L x1={COL_SL+CW} y1={SY+CH/2} x2={COL_F} y2={SY+CH/2}/>

              {/* RIGHT SIDE */}
              {/* F → S2 */}
              <L x1={COL_F+CW} y1={SY+CH/2} x2={COL_SR} y2={SY+CH/2}/>
              {/* S2 → Q3,Q4 */}
              <Bracket1to2 srcCol={COL_SR} srcW={CW} srcY={SY} srcH={CH}
                tgtCol={COL_QR} tgtY1={QY[0]} tgtY2={QY[1]} tgtH={CH}/>
              {/* Q3 → O5,O6 */}
              <Bracket1to2 srcCol={COL_QR} srcW={CW} srcY={QY[0]} srcH={CH}
                tgtCol={COL_OR} tgtY1={OY[0]} tgtY2={OY[1]} tgtH={CH}/>
              {/* Q4 → O7,O8 */}
              <Bracket1to2 srcCol={COL_QR} srcW={CW} srcY={QY[1]} srcH={CH}
                tgtCol={COL_OR} tgtY1={OY[2]} tgtY2={OY[3]} tgtH={CH}/>
              {/* Octavos → D pairs (right side, right-to-left) */}
              {[0,1,2,3].map(i => (
                <Bracket1to2 key={`or${i}`}
                  srcCol={COL_OR} srcW={CW} srcY={OY[i]} srcH={CH}
                  tgtCol={COL_DR} tgtY1={DY[i*2]} tgtY2={DY[i*2+1]} tgtH={DCH}/>
              ))}
            </svg>

            {/* ── LEFT DIECISEIAVOS ── */}
            {BRACKET.slice(0,4).map((b,i) => <>
              <div key={`dl${i}a`} className="absolute" style={{left:COL_DL, top:DY[i*2]+LH}}>
                <DCard dId={b.d1}/>
              </div>
              <div key={`dl${i}b`} className="absolute" style={{left:COL_DL, top:DY[i*2+1]+LH}}>
                <DCard dId={b.d2}/>
              </div>
            </>)}

            {/* ── LEFT OCTAVOS ── */}
            {[0,1,2,3].map(i => (
              <div key={`ol${i}`} className="absolute" style={{left:COL_OL, top:OY[i]+LH}}>
                <MatchCard t1={dW[i].w1} t2={dW[i].w2} r={res[BRACKET[i].oid]} label={BRACKET[i].oid}/>
              </div>
            ))}

            {/* ── LEFT CUARTOS ── */}
            {[0,1].map(i => (
              <div key={`ql${i}`} className="absolute" style={{left:COL_QL, top:QY[i]+LH}}>
                <MatchCard t1={qTeams[i].t1} t2={qTeams[i].t2} r={res[`Q${i+1}`]} label={`Q${i+1}`}/>
              </div>
            ))}

            {/* ── LEFT SEMI ── */}
            <div className="absolute" style={{left:COL_SL, top:SY+LH}}>
              <MatchCard t1={sTeams[0].t1} t2={sTeams[0].t2} r={res['S1']} label="SF1"/>
            </div>

            {/* ── TROPHY above FINAL ── */}
            <div className="absolute flex flex-col items-center justify-end"
              style={{left:COL_F, width:CW, top:LH, height:SY-8}}>
              <img src="/fifa2026.png" alt="Copa" width={64}
                style={{filter:'drop-shadow(0 0 16px rgba(234,179,8,0.8))'}}/>
            </div>

            {/* ── FINAL ── */}
            <div className="absolute" style={{left:COL_F, top:SY+LH}}>
              <MatchCard t1={sW[0]} t2={sW[1]} r={res['F1']} label="FINAL" highlight/>
            </div>

            {/* ── RIGHT SEMI ── */}
            <div className="absolute" style={{left:COL_SR, top:SY+LH}}>
              <MatchCard t1={sTeams[1].t1} t2={sTeams[1].t2} r={res['S2']} label="SF2"/>
            </div>

            {/* ── RIGHT CUARTOS ── */}
            {[0,1].map(i => (
              <div key={`qr${i}`} className="absolute" style={{left:COL_QR, top:QY[i]+LH}}>
                <MatchCard t1={qTeams[i+2].t1} t2={qTeams[i+2].t2} r={res[`Q${i+3}`]} label={`Q${i+3}`}/>
              </div>
            ))}

            {/* ── RIGHT OCTAVOS ── */}
            {[0,1,2,3].map(i => (
              <div key={`or${i}`} className="absolute" style={{left:COL_OR, top:OY[i]+LH}}>
                <MatchCard t1={dW[i+4].w1} t2={dW[i+4].w2} r={res[BRACKET[i+4].oid]} label={BRACKET[i+4].oid}/>
              </div>
            ))}

            {/* ── RIGHT DIECISEIAVOS ── */}
            {BRACKET.slice(4,8).map((b,i) => <>
              <div key={`dr${i}a`} className="absolute" style={{left:COL_DR, top:DY[i*2]+LH}}>
                <DCard dId={b.d1}/>
              </div>
              <div key={`dr${i}b`} className="absolute" style={{left:COL_DR, top:DY[i*2+1]+LH}}>
                <DCard dId={b.d2}/>
              </div>
            </>)}

          </div>
        </div>

      </div>
    </main>
  );
}
