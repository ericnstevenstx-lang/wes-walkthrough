"use client";
import { useState, useEffect, useCallback } from "react";

/* ── Supabase ──────────────────────────────────────────── */
const SB="https://ulyycjtrshpsjpvbztkr.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXljanRyc2hwc2pwdmJ6dGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzg1NzAsImV4cCI6MjA5MDcxNDU3MH0.UYwCdYrdy20xl_hCkO8t4CAB16vBHj-oMdflDv1XlVE";
const H={apikey:SK,Authorization:`Bearer ${SK}`,"Content-Type":"application/json",Prefer:"return=representation"};
let loc=false;
async function dbF(p,o={}){const r=await fetch(`${SB}/rest/v1/${p}`,{...o,headers:{...H,...(o.headers||{})}});if(!r.ok)throw new Error(`${r.status}`);const t=await r.text();return t?JSON.parse(t):null;}
async function sG(k){try{if(typeof window!=="undefined"&&window.storage){const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}}catch{}return null;}
async function sS(k,v){try{if(typeof window!=="undefined"&&window.storage)await window.storage.set(k,JSON.stringify(v));}catch{}}

/* ── Constants ─────────────────────────────────────────── */
const EQ=["Switchgear","Panelboard","Transformer","Circuit Breaker","Motor Control Center (MCC)","Bus Duct","Disconnect Switch","UPS System","PDU","RPP (Remote Power Panel)","ATS / Transfer Switch","Other"];
const MFR=["Eaton / Cutler-Hammer","Siemens","Square D / Schneider","ABB","GE","Westinghouse","ITE","Federal Pacific","Liebert / Vertiv","APC / Schneider","Other"];
const GRD=[{v:"A",c:"#16a34a",d:"Excellent"},{v:"B",c:"#2563eb",d:"Good"},{v:"C",c:"#f59e0b",d:"Fair"},{v:"D",c:"#dc2626",d:"Scrap"}];
const gc={};GRD.forEach(g=>gc[g.v]=g.c);
const DISP=[{v:"unassigned",l:"Unassigned",c:"#6b7280"},{v:"resale",l:"Resale",c:"#2563eb"},{v:"deman",l:"Deman",c:"#8b5cf6"},{v:"ebay",l:"eBay",c:"#16a34a"},{v:"skid",l:"Skid Build",c:"#0891b2"},{v:"scrap",l:"Scrap",c:"#dc2626"}];
const dc={};DISP.forEach(d=>dc[d.v]=d.c);
const LOC=[{v:"job_site",l:"Job Site"},{v:"main_warehouse",l:"Main WH"},{v:"satellite_1",l:"Sat WH 1"},{v:"satellite_2",l:"Sat WH 2"},{v:"off_site",l:"Off-Site"},{v:"scrap_yard",l:"Scrap Yard"}];
const AMPS=["15","20","25","30","40","50","60","70","80","100","125","150","200","225","250","300","350","400","600","800","1000","1200","1600","2000","2500","3000","4000"];
const MT=["Breaker","Cover/Door","Bus Bar","Lug","Fuse","Relay","Wiring","Nameplate","Hardware","Fan","Arc Chute","Trip Unit","Other"];
const NEMA=[{v:"1",d:"Indoor General"},{v:"3R",d:"Outdoor Rain"},{v:"3",d:"Outdoor Windblown"},{v:"4",d:"Watertight"},{v:"4X",d:"Corrosion Resist"},{v:"12",d:"Dust-tight"},{v:"13",d:"Oil-tight"}];
const PHASE=["1","3"];
const WINDING=[{v:"",l:"N/A"},{v:"CU",l:"Copper"},{v:"AL",l:"Aluminum"}];
const today=()=>new Date().toISOString().slice(0,10);

/* ── Styles ─────────────────────────────────────────────── */
const inp={width:"100%",padding:"12px 14px",border:"1.5px solid #d1d5db",borderRadius:10,fontSize:16,background:"#fff",color:"#111",boxSizing:"border-box",outline:"none",fontFamily:"inherit",WebkitAppearance:"none"};
const inpE={...inp,borderColor:"#ef4444"};
const inpSm={...inp,fontSize:14,padding:"10px 12px"};
const lbl={display:"block",fontSize:13,fontWeight:700,color:"#475569",marginBottom:4};
const card={background:"#fff",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"};

/* ── Photo compression ─────────────────────────────────── */
function compressImage(file,maxW=1200,quality=0.7){
  return new Promise((res)=>{
    const reader=new FileReader();
    reader.onload=(e)=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement("canvas");
        const ratio=Math.min(maxW/img.width,maxW/img.height,1);
        canvas.width=img.width*ratio;canvas.height=img.height*ratio;
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        res(canvas.toDataURL("image/jpeg",quality));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ── Barcode Scanner ──────────────────────────────────── */
function BarcodeScanner({onScan,onClose,label}){
  const videoRef=useState(null);
  const [err,setErr]=useState(null);
  const [active,setActive]=useState(true);
  useEffect(()=>{
    let stream=null;let animId=null;let detector=null;
    const start=async()=>{
      try{
        if(typeof BarcodeDetector!=="undefined")detector=new BarcodeDetector({formats:["code_128","code_39","ean_13","ean_8","qr_code","upc_a","upc_e","codabar","itf"]});
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});
        if(videoRef[0])videoRef[0].srcObject=stream;
        const scan=async()=>{
          if(!active||!videoRef[0]||videoRef[0].readyState<2){animId=requestAnimationFrame(scan);return;}
          if(detector){try{const codes=await detector.detect(videoRef[0]);if(codes.length>0){onScan(codes[0].rawValue);cleanup();return;}}catch{}}
          animId=requestAnimationFrame(scan);
        };
        scan();
      }catch(e){setErr("Camera access denied. Enter manually.");}
    };
    const cleanup=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());if(animId)cancelAnimationFrame(animId);};
    start();return cleanup;
  },[]);
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.9)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"#fff",fontSize:14,fontWeight:700,marginBottom:12}}>{label||"Scan Barcode"}</div>
      {err?<div style={{color:"#fca5a5",fontSize:13,padding:20,textAlign:"center"}}>{err}</div>:
        <video ref={el=>videoRef[0]=el} autoPlay playsInline muted style={{width:"90%",maxWidth:400,borderRadius:12,border:"3px solid #2563eb"}}/>}
      <div style={{marginTop:16,display:"flex",gap:8}}>
        <button onClick={onClose} style={{padding:"12px 24px",borderRadius:8,border:"none",background:"#dc2626",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>
  );
}

/* ── Scan Input (text field + scan button) ────────────── */
function ScanInput({value,onChange,placeholder,label,style:st}){
  const [scanning,setScanning]=useState(false);
  return(
    <div>
      {label&&<label style={{display:"block",fontSize:10,fontWeight:600,color:"#6b7280",marginBottom:2}}>{label}</label>}
      <div style={{display:"flex",gap:4}}>
        <input style={{...({width:"100%",padding:"10px 12px",border:"1.5px solid #d1d5db",borderRadius:10,fontSize:14,background:"#fff",color:"#111",boxSizing:"border-box",outline:"none",fontFamily:"inherit",WebkitAppearance:"none"}),...st,flex:1}} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Scan or type..."}/>
        <button onClick={()=>setScanning(true)} style={{padding:"10px 12px",borderRadius:10,border:"1.5px solid #2563eb",background:"#2563eb15",color:"#2563eb",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>Scan</button>
      </div>
      {scanning&&<BarcodeScanner label={label} onScan={v=>{onChange(v);setScanning(false);}} onClose={()=>setScanning(false)}/>}
    </div>
  );
}
export default function Walkthrough() {
  const [view,setView]=useState("jobs");
  const [mode,setMode]=useState("walkthrough"); // walkthrough | pickup | intake
  const [jobs,setJobs]=useState([]);
  const [ld,setLd]=useState(false);
  const [sv,setSv]=useState(false);
  const [scanning,setScanning]=useState(false);
  const [scanImg,setScanImg]=useState(null);
  const [msg,setMsg]=useState(null);
  const [expId,setExpId]=useState(null);
  const [priceBook,setPriceBook]=useState([]);
  const [weights,setWeights]=useState([]);
  const [scrapPrices,setScrapPrices]=useState(null);

  /* ── Job form ── */
  const [job,setJob]=useState({
    jobName:"",customerName:"",siteAddress:"",preparedBy:"",bidDate:today(),
    laborHours:"",laborRate:"75",transportCost:"",targetMargin:"45",notes:"",
  });
  const [items,setItems]=useState([]);
  const [errs,setErrs]=useState({});

  /* ── Load reference data ── */
  useEffect(()=>{(async()=>{
    try{if(!loc){
      const[pb,wt]=await Promise.all([dbF("price_book?select=*"),dbF("equipment_weights?select=*")]);
      if(pb)setPriceBook(pb);if(wt)setWeights(wt);
    }}catch{loc=true;}
    try{const r=await fetch(`${SB}/functions/v1/scrap-pricing`);if(r.ok)setScrapPrices(await r.json());}catch{}
  })();},[]);

  /* ── Load jobs ── */
  const loadJobs=useCallback(async()=>{
    setLd(true);
    try{if(!loc){const d=await dbF("bids?select=*,bid_line_items(*)&order=created_at.desc");if(d){setJobs(d.map(r=>({...r,items:r.bid_line_items||[]}))); setLd(false);return;}}}catch{loc=true;}
    setJobs(await sG("wes_wt")||[]);setLd(false);
  },[]);
  useEffect(()=>{loadJobs();},[loadJobs]);

  /* ── Helpers ── */
  const uf=(k,v)=>{setJob(p=>({...p,[k]:v}));if(errs[k])setErrs(p=>({...p,[k]:undefined}));};

  /* ── Price lookup ── */
  const lookupPrice=(eqType,grade,amp)=>{
    const m=priceBook.filter(p=>{
      if(p.equipment_type!==eqType||p.grade!==grade)return false;
      if(p.amp_rating&&amp){
        const rng=p.amp_rating.split("-");
        if(rng.length===2){const lo=parseInt(rng[0]),hi=parseInt(rng[1]),a=parseInt(amp);return a>=lo&&a<=hi;}
        return p.amp_rating===amp||p.amp_rating.includes(amp);
      }
      return true;
    });
    if(m.length>0)return m[0];
    const fb=priceBook.filter(p=>p.equipment_type===eqType&&p.grade===grade);
    return fb.length>0?fb[0]:null;
  };

  const calcScrap=(eqType,amp)=>{
    if(!scrapPrices)return 0;
    const wt=weights.find(w=>{if(w.equipment_type!==eqType)return false;const a=parseInt(amp)||0;return a>=(w.amp_rating_min||0)&&a<=(w.amp_rating_max||99999);});
    if(!wt)return 0;
    const lbs=parseFloat(wt.estimated_weight_lbs)||0;
    return Math.round((lbs*(parseFloat(wt.copper_pct)||0)/100*(scrapPrices.copper_2||3.4)+lbs*(parseFloat(wt.aluminum_pct)||0)/100*(scrapPrices.aluminum_clean||0.75)+lbs*(parseFloat(wt.steel_pct)||0)/100*(scrapPrices.steel_clean||0.08))*100)/100;
  };

  /* ── OCR ── */
  const handleScan=async(file,idx)=>{
    if(!file)return;setScanning(true);setMsg(null);
    try{
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=()=>rej();r.readAsDataURL(file);});
      setScanImg(`data:${file.type};base64,${b64}`);
      const resp=await fetch(`${SB}/functions/v1/scan-nameplate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image_base64:b64,media_type:file.type})});
      if(!resp.ok)throw new Error(`${resp.status}`);
      const p=await resp.json();if(p.error)throw new Error(p.error);
      // Fuzzy match manufacturer
      const mfrMatch=MFR.find(m=>{
        if(!p.manufacturer)return false;
        const raw=p.manufacturer.toLowerCase().trim();
        const parts=m.toLowerCase().split(/[\/\s]+/);
        return parts.some(part=>part.length>2&&raw.includes(part))||raw.includes(m.toLowerCase());
      });
      // Determine if KVA is the primary rating (transformers)
      const isTransformer=p.equipment_type&&p.equipment_type.toLowerCase().includes("transformer");
      const kva=p.kva_rating||(isTransformer?p.amperage_rating:null);
      const amps=isTransformer?null:(p.amperage_rating||null);
      // Winding: use combined or HV/LV split
      const whv=p.winding_hv||null;
      const wlv=p.winding_lv||null;
      let winding=p.winding_material||null;
      if(!winding&&whv)winding=whv===wlv?whv:`${whv}/${wlv}`;
      // Weight from nameplate
      const npWeight=p.weight_lbs?parseFloat(String(p.weight_lbs).replace(/[^0-9.]/g,"")):(p.core_coil_weight_lbs?parseFloat(String(p.core_coil_weight_lbs).replace(/[^0-9.]/g,"")):null);
      // Cooling class determines oil vs dry
      const cooling=p.cooling_class||null;
      const liquid=p.liquid_type||(cooling&&(cooling.startsWith("OA")||cooling.startsWith("O"))?"OIL":cooling&&(cooling.startsWith("AA")||cooling==="dry")?"DRY":null);

      setItems(prev=>prev.map((it,i)=>i===idx?{...it,
        serialNumber:p.serial_number||it.serialNumber,
        modelNumber:p.model_number||it.modelNumber,
        voltageRating:p.voltage_rating||it.voltageRating,
        amperageRating:amps||it.amperageRating,
        kvaRating:kva||it.kvaRating,
        kvaForced:p.kva_forced||it.kvaForced,
        manufacturer:mfrMatch||it.manufacturer,
        equipmentType:EQ.find(t=>p.equipment_type&&t.toLowerCase().includes(p.equipment_type.toLowerCase()))||it.equipmentType,
        phase:p.phase?String(p.phase).replace(/[^0-9]/g,""):it.phase,
        yearMfg:p.year_manufactured||it.yearMfg,
        windingMaterial:winding||it.windingMaterial,
        windingHv:whv||it.windingHv,
        windingLv:wlv||it.windingLv,
        coolingClass:cooling||it.coolingClass,
        liquidType:liquid||it.liquidType,
        nameplateWeight:npWeight||it.nameplateWeight,
        frameSize:p.frame_size||it.frameSize,
        tripRating:p.trip_rating||it.tripRating,
        breakerType:p.breaker_type||it.breakerType,
        tripUnitType:p.trip_unit_type||it.tripUnitType,
        mountingType:p.mounting_type||it.mountingType,
        catalogNumber:p.catalog_number||it.catalogNumber,
        interruptRating:p.interrupting_rating||it.interruptRating,
        busRating:p.bus_rating||it.busRating,
        shortCircuitRating:p.short_circuit_rating||it.shortCircuitRating,
        bilKv:p.bil_kv||it.bilKv,
        voltageClass:p.voltage_class||it.voltageClass,
        numSections:p.num_sections||it.numSections,
        busMaterial:p.bus_material||it.busMaterial,
        switchgearType:p.switchgear_type||it.switchgearType,
      }:it));
      setMsg({t:"success",m:"Nameplate scanned."});
    }catch(e){setMsg({t:"error",m:"Scan failed: "+e.message});}
    finally{setScanning(false);}
  };

  /* ── Photo upload ── */
  const addPhoto=async(file,idx)=>{
    if(!file)return;
    const compressed=await compressImage(file);
    setItems(prev=>prev.map((it,i)=>i===idx?{...it,photos:[...(it.photos||[]),compressed]}:it));
  };

  /* ── Item management ── */
  const addItem=()=>setItems(p=>[...p,{
    equipmentType:"",manufacturer:"",modelNumber:"",serialNumber:"",
    voltageRating:"",amperageRating:"",quantity:1,grade:"C",
    nemaRating:"",indoorOutdoor:"indoor",yearMfg:"",phase:"3",kvaRating:"",kvaForced:"",windingMaterial:"",windingHv:"",windingLv:"",interruptRating:"",coolingClass:"",liquidType:"",nameplateWeight:"",
    frameSize:"",tripRating:"",breakerType:"",tripUnitType:"",mountingType:"",catalogNumber:"",
    busRating:"",shortCircuitRating:"",bilKv:"",voltageClass:"",numSections:"",busMaterial:"",switchgearType:"",
    disposition:"unassigned",estimatedResale:0,estimatedScrap:0,
    ebayCompAvg:0,priceBookValue:0,estimatedWeight:0,
    conditionNotes:"",photos:[],missing:[],breakers:[],
    acquisitionCost:"",refurbCost:"",askingPrice:"",
    barcodeSku:"",putawayLocation:"",
    // Pickup fields
    pickupStatus:"pending",destination:"main_warehouse",
  }]);
  const rmItem=i=>setItems(p=>p.filter((_,j)=>j!==i));
  const uItem=(i,f,v)=>{
    setItems(p=>{
      const u=p.map((it,j)=>j===i?{...it,[f]:v}:it);
      const item=u[i];
      if(["equipmentType","grade","amperageRating","disposition"].includes(f)){
        const pb=lookupPrice(item.equipmentType,item.grade,item.amperageRating);
        if(pb){u[i]={...u[i],priceBookValue:parseFloat(pb.avg_sold_price)||0};
          if(item.disposition!=="scrap"&&!(parseFloat(item.estimatedResale)>0))u[i].estimatedResale=parseFloat(pb.avg_sold_price)||0;}
        u[i].estimatedScrap=calcScrap(item.equipmentType,item.amperageRating);
        const wt=weights.find(w=>w.equipment_type===item.equipmentType);
        if(wt)u[i].estimatedWeight=parseFloat(wt.estimated_weight_lbs)||0;
      }
      return u;
    });
  };

  /* ── Missing component helpers ── */
  const addMissing=(idx)=>setItems(p=>p.map((it,i)=>i===idx?{...it,missing:[...(it.missing||[]),{type:"",desc:"",qty:1}]}:it));
  const rmMissing=(idx,mi)=>setItems(p=>p.map((it,i)=>i===idx?{...it,missing:it.missing.filter((_,j)=>j!==mi)}:it));
  const uMissing=(idx,mi,f,v)=>setItems(p=>p.map((it,i)=>i===idx?{...it,missing:it.missing.map((m,j)=>j===mi?{...m,[f]:v}:m)}:it));

  /* ── Breaker helpers ── */
  const addBreaker=(idx)=>setItems(p=>p.map((it,i)=>i===idx?{...it,breakers:[...(it.breakers||[]),{amp:"20",count:1,poles:"1",grade:"B",oem:"oem",pitting:false,contactWear:false,notes:""}]}:it));
  const rmBreaker=(idx,bi)=>setItems(p=>p.map((it,i)=>i===idx?{...it,breakers:it.breakers.filter((_,j)=>j!==bi)}:it));
  const uBreaker=(idx,bi,f,v)=>setItems(p=>p.map((it,i)=>i===idx?{...it,breakers:it.breakers.map((b,j)=>j===bi?{...b,[f]:v}:b)}:it));

  /* ── eBay comp lookup ── */
  const fetchEbay=async(idx)=>{
    const item=items[idx];
    const q=`${item.manufacturer||""} ${item.equipmentType} ${item.amperageRating?item.amperageRating+"A":""} used`.trim();
    setMsg({t:"info",m:`Searching eBay...`});
    try{const r=await fetch(`${SB}/functions/v1/ebay-comps`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})});
      const d=await r.json();
      if(d.stats){uItem(idx,"ebayCompAvg",Math.round(d.stats.avg*100)/100);
        if(items[idx].disposition!=="scrap")uItem(idx,"estimatedResale",Math.round(d.stats.avg*100)/100);
        setMsg({t:"success",m:`${d.stats.count} comps. Avg: $${d.stats.avg.toFixed(0)} Low: $${d.stats.low.toFixed(0)} High: $${d.stats.high.toFixed(0)}`});
      }else{setMsg({t:"error",m:d.message||"No results"});}
    }catch(e){setMsg({t:"error",m:"eBay failed: "+e.message});}
  };

  /* ── Calculations ── */
  const laborCost=(parseFloat(job.laborHours)||0)*(parseFloat(job.laborRate)||0);
  const transportCost=parseFloat(job.transportCost)||0;
  const totalCOGS=laborCost+transportCost;
  const totalResale=items.filter(i=>i.disposition!=="scrap").reduce((a,i)=>a+(parseFloat(i.estimatedResale)||0)*i.quantity,0);
  const totalScrap=items.filter(i=>i.disposition==="scrap").reduce((a,i)=>a+(i.estimatedScrap||0)*i.quantity,0);
  const totalRevenue=totalResale+totalScrap;
  const grossProfit=totalRevenue-totalCOGS;
  const marginPct=totalRevenue>0?(grossProfit/totalRevenue*100):0;
  const targetMargin=parseFloat(job.targetMargin)||45;
  const meetsMargin=marginPct>=targetMargin;

  /* ── WhatsApp message builder ── */
  const buildWhatsAppMsg=(j,its)=>{
    let msg=`*WES ${mode==="walkthrough"?"WALKTHROUGH":"PICKUP"} REPORT*\n`;
    msg+=`Job: ${j.jobName||j.job_name}\nCustomer: ${j.customerName||j.customer_name}\n`;
    msg+=`Date: ${j.bidDate||j.bid_date}\nBy: ${j.preparedBy||j.prepared_by||""}\n\n`;
    msg+=`*EQUIPMENT (${its.length} items):*\n`;
    its.forEach((it,i)=>{
      msg+=`${i+1}. ${it.equipmentType||it.equipment_type} ${it.manufacturer||""}\n`;
      msg+=`   ${it.amperageRating||it.amperage_rating||""}${(it.amperageRating||it.amperage_rating)?"A ":""}${it.voltageRating||it.voltage_rating||""}V${it.kvaRating||it.kva_rating?` ${it.kvaRating||it.kva_rating}${it.kvaForced||it.kva_forced?`/${it.kvaForced||it.kva_forced}`:""}KVA`:""} ${it.phase||"3"}PH\n`;
      const wh=it.windingHv||it.winding_hv;const wl=it.windingLv||it.winding_lv;const liq=it.liquidType||it.liquid_type;const cc=it.coolingClass||it.cooling_class;
      msg+=`   S/N: ${it.serialNumber||it.serial_number||"N/A"}${it.nemaRating||it.nema_rating?` | NEMA ${it.nemaRating||it.nema_rating}`:""}${(it.indoorOutdoor||it.indoor_outdoor)?` | ${(it.indoorOutdoor||it.indoor_outdoor||"").toUpperCase()}`:""}${it.yearMfg||it.year_manufactured?` | Yr: ${it.yearMfg||it.year_manufactured}`:""}\n`;
      if(wh||liq||cc)msg+=`   ${wh?`Wind: HV=${wh}${wl?` LV=${wl}`:""}`:""} ${cc?`Class: ${cc}`:""} ${liq?`Type: ${liq}`:""}\n`;
      msg+=`   Grade: ${it.grade} | ${it.disposition}\n`;
      if(it.disposition!=="scrap")msg+=`   Est Value: $${parseFloat(it.estimatedResale||it.estimated_resale||0).toFixed(0)}\n`;
      else msg+=`   Scrap: $${parseFloat(it.estimatedScrap||it.estimated_scrap||0).toFixed(0)}\n`;
      const mc=it.missing||[];
      if(mc.length>0)msg+=`   MISSING: ${mc.map(m=>m.type||m.component_type).join(", ")}\n`;
      const bkrs=it.breakers||[];
      if(bkrs.length>0){
        msg+=`   BREAKERS:\n`;
        bkrs.forEach(b=>{
          msg+=`   - ${b.count}x ${b.amp}A ${b.poles}P Grade ${b.grade} ${b.oem==="aftermarket"?"AM":"OEM"}`;
          if(b.pitting)msg+=` [PITTING]`;
          if(b.contactWear)msg+=` [CONTACT WEAR]`;
          msg+=`\n`;
        });
      }
      msg+=`\n`;
    });
    msg+=`*SUMMARY:*\n`;
    msg+=`COGS: $${totalCOGS.toFixed(0)}\n`;
    msg+=`Revenue: $${totalRevenue.toFixed(0)}\n`;
    msg+=`Margin: ${marginPct.toFixed(1)}%\n`;
    return msg;
  };

  const sendWhatsApp=(phone)=>{
    const text=buildWhatsAppMsg(job,items);
    const url=phone
      ?`https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(text)}`
      :`https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url,"_blank");
  };

  /* ── Validate ── */
  const validate=()=>{
    const e={};
    if(mode==="receive"){
      if(!job.preparedBy?.trim())e.preparedBy="Required";
    }else{
      if(!job.jobName.trim())e.jobName="Required";
      if(!job.customerName.trim())e.customerName="Required";
    }
    if(items.length===0)e.items="Add at least one item";
    setErrs(e);return Object.keys(e).length===0;
  };

  /* ── Submit: Direct Receive (writes to inventory) ── */
  const handleReceive=async()=>{
    if(!validate())return;
    setSv(true);setMsg(null);
    try{
      for(const it of items){
        const invId=`INV-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2,5)}`;
        const bkrs=it.breakers||[];
        const bkrCount=bkrs.reduce((a,b)=>a+(b.count||0),0);
        const bkrDetail=bkrs.map(b=>`${b.count}x ${b.amp}A ${b.poles}P ${b.grade} ${b.oem}${b.pitting?" PITTING":""}${b.contactWear?" WEAR":""}`).join("; ");

        const invRow={
          id:invId,serial_number:it.serialNumber||"N/A",model_number:it.modelNumber||null,
          manufacturer:it.manufacturer||null,equipment_type:it.equipmentType,
          voltage_rating:it.voltageRating||null,amperage_rating:it.amperageRating||null,
          grade:it.grade,condition_notes:[it.conditionNotes,bkrDetail?`Breakers: ${bkrDetail}`:""].filter(Boolean).join(" | ")||null,
          location:it.destination||"main_warehouse",
          job_number:job.jobName||null,source_job_site:null,
          customer_origin:job.customerName||null,
          status:"received",date_received:job.bidDate||today(),scanned_by:job.preparedBy||null,
          acquisition_cost:it.acquisitionCost?parseFloat(it.acquisitionCost):null,
          refurb_cost:it.refurbCost?parseFloat(it.refurbCost):null,
          total_cogs:((parseFloat(it.acquisitionCost)||0)+(parseFloat(it.refurbCost)||0))||null,
          asking_price:it.askingPrice?parseFloat(it.askingPrice):null,
          nema_rating:it.nemaRating||null,
          indoor_outdoor:it.indoorOutdoor||"indoor",
          year_manufactured:it.yearMfg?parseInt(it.yearMfg):null,
          phase:it.phase||"3",
          kva_rating:it.kvaRating||null,
          kva_forced:it.kvaForced||null,
          winding_material:it.windingMaterial||null,
          winding_hv:it.windingHv||null,
          winding_lv:it.windingLv||null,
          cooling_class:it.coolingClass||null,
          liquid_type:it.liquidType||null,
          nameplate_weight_lbs:it.nameplateWeight?parseFloat(it.nameplateWeight):null,
          interrupting_rating:it.interruptRating||null,
          frame_size:it.frameSize||null,trip_rating:it.tripRating||null,breaker_type:it.breakerType||null,trip_unit_type:it.tripUnitType||null,mounting_type:it.mountingType||null,catalog_number:it.catalogNumber||null,bus_rating:it.busRating||null,short_circuit_rating:it.shortCircuitRating||null,bil_kv:it.bilKv||null,voltage_class:it.voltageClass||null,num_sections:it.numSections?parseInt(it.numSections):null,bus_material:it.busMaterial||null,switchgear_type:it.switchgearType||null,
          barcode_sku:it.barcodeSku||null,
          putaway_location:it.putawayLocation||null,
          received_verified:true,verified_by:job.preparedBy||null,verified_date:job.bidDate||today(),
        };

        let ok=false;
        if(!loc){try{
          await dbF("inventory_items",{method:"POST",body:JSON.stringify(invRow)});
          // Subcomponents from breakers
          if(bkrs.length>0){
            const subRows=bkrs.map((b,si)=>({inventory_id:invId,component_type:"Breaker",amp_rating:b.amp||null,poles:parseInt(b.poles)||1,quantity:b.count||1,grade:b.grade||"C",condition_notes:[b.pitting?"Pitting":"",b.contactWear?"Contact wear":""].filter(Boolean).join(", ")||null,is_present:true,salvageable:b.grade!=="D",origin_type:b.oem||"oem",sort_order:si}));
            await dbF("inventory_subcomponents",{method:"POST",body:JSON.stringify(subRows)});
          }
          // Missing components
          const mc=(it.missing||[]).filter(m=>m.type);
          if(mc.length>0){
            const missRows=mc.map(m=>({inventory_id:invId,component_type:m.type,description:m.desc||null,quantity:m.qty||1,replacement_status:"needed"}));
            await dbF("inventory_missing_components",{method:"POST",body:JSON.stringify(missRows)});
          }
          ok=true;
        }catch{loc=true;}}

        if(!ok){
          const li={...invRow,missing:it.missing||[],subcomps:bkrs,created_at:new Date().toISOString()};
          const stored=await sG("wes_inv")||[];
          await sS("wes_inv",[li,...stored]);
        }
      }
      setItems([]);setScanImg(null);
      setMsg({t:"success",m:`${items.length} item${items.length>1?"s":""} added to inventory`});
      setView("jobs");
    }catch(e){setMsg({t:"error",m:e.message});}finally{setSv(false);}
  };

  /* ── Submit ── */
  const handleSubmit=async()=>{
    if(!validate())return;setSv(true);setMsg(null);
    const id=`WK-${Date.now().toString(36).toUpperCase()}`;
    const row={id,job_name:job.jobName,customer_name:job.customerName,site_address:job.siteAddress||null,bid_date:job.bidDate,prepared_by:job.preparedBy||null,status:"draft",mode,decom_labor_hours:parseFloat(job.laborHours)||null,labor_rate:parseFloat(job.laborRate)||null,total_labor_cost:laborCost||null,transport_cost:transportCost||null,total_acquisition_cost:totalCOGS||null,total_resale_value:totalResale||null,total_scrap_value:totalScrap||null,total_revenue:totalRevenue||null,total_cogs:totalCOGS||null,gross_margin_pct:Math.round(marginPct*100)/100,bid_amount:Math.max(0,totalCOGS)||null,target_margin_pct:targetMargin,notes:job.notes||null};
    const lineItems=items.map((it,i)=>{
      const bkrs=it.breakers||[];
      const bkrCount=bkrs.reduce((a,b)=>a+(b.count||0),0);
      const bkrDetail=bkrs.map(b=>`${b.count}x ${b.amp}A ${b.poles}P ${b.grade} ${b.oem}${b.pitting?" PITTING":""}${b.contactWear?" WEAR":""}`).join("; ");
      const condNotes=[it.conditionNotes,bkrDetail?`Breakers: ${bkrDetail}`:""].filter(Boolean).join(" | ");
      return {
      bid_id:id,equipment_type:it.equipmentType,manufacturer:it.manufacturer||null,model_number:it.modelNumber||null,serial_number:it.serialNumber||null,voltage_rating:it.voltageRating||null,amperage_rating:it.amperageRating||null,quantity:it.quantity,grade:it.grade,disposition:it.disposition,estimated_resale:parseFloat(it.estimatedResale)||null,estimated_scrap:it.estimatedScrap||null,ebay_comp_avg:it.ebayCompAvg||null,price_book_value:it.priceBookValue||null,estimated_weight_lbs:it.nameplateWeight?parseFloat(it.nameplateWeight):(it.estimatedWeight||null),breaker_count:bkrCount||null,breaker_value:null,notes:condNotes||null,sort_order:i,photo_count:(it.photos||[]).length,pickup_status:it.pickupStatus||"pending",destination:it.destination||null,nema_rating:it.nemaRating||null,indoor_outdoor:it.indoorOutdoor||"indoor",year_manufactured:it.yearMfg?parseInt(it.yearMfg):null,phase:it.phase||"3",kva_rating:it.kvaRating||null,kva_forced:it.kvaForced||null,winding_material:it.windingMaterial||null,winding_hv:it.windingHv||null,winding_lv:it.windingLv||null,cooling_class:it.coolingClass||null,liquid_type:it.liquidType||null,nameplate_weight_lbs:it.nameplateWeight?parseFloat(it.nameplateWeight):null,interrupting_rating:it.interruptRating||null,frame_size:it.frameSize||null,trip_rating:it.tripRating||null,breaker_type:it.breakerType||null,trip_unit_type:it.tripUnitType||null,mounting_type:it.mountingType||null,catalog_number:it.catalogNumber||null,bus_rating:it.busRating||null,short_circuit_rating:it.shortCircuitRating||null,bil_kv:it.bilKv||null,voltage_class:it.voltageClass||null,num_sections:it.numSections?parseInt(it.numSections):null,bus_material:it.busMaterial||null,switchgear_type:it.switchgearType||null,
    };});
    try{
      let ok=false;
      if(!loc){try{
        await dbF("bids",{method:"POST",body:JSON.stringify(row)});
        if(lineItems.length)await dbF("bid_line_items",{method:"POST",body:JSON.stringify(lineItems)});
        // Save photos
        for(const it of items){
          if(it.photos&&it.photos.length>0){
            const photoRows=it.photos.map(p=>({reference_id:id,reference_type:"walkthrough_item",photo_url:p,taken_by:job.preparedBy||null}));
            await dbF("item_photos",{method:"POST",body:JSON.stringify(photoRows)});
          }
        }
        ok=true;
      }catch{loc=true;}}
      const li={...row,items:lineItems.map((l,i)=>({...l,photos:items[i]?.photos||[]})),created_at:new Date().toISOString()};
      if(!ok){const u=[li,...jobs];setJobs(u);await sS("wes_wt",u);}else{await loadJobs();}
      setJob(p=>({...p,jobName:"",customerName:"",siteAddress:"",laborHours:"",transportCost:"",notes:""}));
      setItems([]);setScanImg(null);setMsg({t:"success",m:`${id} saved`});setView("jobs");
    }catch(e){setMsg({t:"error",m:e.message});}finally{setSv(false);}
  };

  /* ── Patch job ── */
  const patchJob=async(id,u)=>{
    const ul=jobs.map(r=>r.id===id?{...r,...u}:r);setJobs(ul);
    if(!loc){try{const d={};for(const[k,v]of Object.entries(u))d[k.replace(/[A-Z]/g,m=>"_"+m.toLowerCase())]=v===""?null:v;await dbF(`bids?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify(d)});return;}catch{loc=true;}}
    await sS("wes_wt",ul);
  };

  /* ── Pickup: create inventory record from bid line item ── */
  const pickupItem=async(jobData,lineItem,lineIdx)=>{
    const invId=`INV-${Date.now().toString(36).toUpperCase()}`;
    const invRow={
      id:invId,
      serial_number:lineItem.serial_number||lineItem.serialNumber||"",
      model_number:lineItem.model_number||lineItem.modelNumber||null,
      manufacturer:lineItem.manufacturer||null,
      equipment_type:lineItem.equipment_type||lineItem.equipmentType||"",
      voltage_rating:lineItem.voltage_rating||lineItem.voltageRating||null,
      amperage_rating:lineItem.amperage_rating||lineItem.amperageRating||null,
      grade:lineItem.grade||"C",
      condition_notes:lineItem.notes||lineItem.conditionNotes||null,
      location:lineItem.destination||"main_warehouse",
      job_number:jobData.id,
      source_job_site:jobData.job_name||jobData.jobName||null,
      customer_origin:jobData.customer_name||jobData.customerName||null,
      status:lineItem.grade==="D"?"scrapped":"received",
      date_received:today(),
      scanned_by:jobData.prepared_by||jobData.preparedBy||null,
      qc_inspection_id:null,
      acquisition_cost:jobData.total_cogs?parseFloat(jobData.total_cogs)/(jobData.items||jobData.bid_line_items||[]).length:null,
      nema_rating:lineItem.nema_rating||lineItem.nemaRating||null,
      indoor_outdoor:lineItem.indoor_outdoor||lineItem.indoorOutdoor||"indoor",
      year_manufactured:lineItem.year_manufactured||lineItem.yearMfg?parseInt(lineItem.year_manufactured||lineItem.yearMfg):null,
      phase:lineItem.phase||"3",
      kva_rating:lineItem.kva_rating||lineItem.kvaRating||null,
      kva_forced:lineItem.kva_forced||lineItem.kvaForced||null,
      winding_material:lineItem.winding_material||lineItem.windingMaterial||null,
      winding_hv:lineItem.winding_hv||lineItem.windingHv||null,
      winding_lv:lineItem.winding_lv||lineItem.windingLv||null,
      cooling_class:lineItem.cooling_class||lineItem.coolingClass||null,
      liquid_type:lineItem.liquid_type||lineItem.liquidType||null,
      nameplate_weight_lbs:lineItem.nameplate_weight_lbs||lineItem.nameplateWeight?parseFloat(lineItem.nameplate_weight_lbs||lineItem.nameplateWeight):null,
      interrupting_rating:lineItem.interrupting_rating||lineItem.interruptRating||null,
      frame_size:lineItem.frame_size||lineItem.frameSize||null,
      trip_rating:lineItem.trip_rating||lineItem.tripRating||null,
      breaker_type:lineItem.breaker_type||lineItem.breakerType||null,
      trip_unit_type:lineItem.trip_unit_type||lineItem.tripUnitType||null,
      mounting_type:lineItem.mounting_type||lineItem.mountingType||null,
      catalog_number:lineItem.catalog_number||lineItem.catalogNumber||null,
      bus_rating:lineItem.bus_rating||lineItem.busRating||null,
      short_circuit_rating:lineItem.short_circuit_rating||lineItem.shortCircuitRating||null,
      bil_kv:lineItem.bil_kv||lineItem.bilKv||null,
      voltage_class:lineItem.voltage_class||lineItem.voltageClass||null,
      num_sections:lineItem.num_sections||lineItem.numSections?parseInt(lineItem.num_sections||lineItem.numSections):null,
      bus_material:lineItem.bus_material||lineItem.busMaterial||null,
      switchgear_type:lineItem.switchgear_type||lineItem.switchgearType||null,
    };

    // Parse breaker data from notes for subcomponents
    const breakers=lineItem.breakers||[];
    const missingComps=lineItem.missing||[];

    try{
      let ok=false;
      if(!loc){try{
        // Create inventory item
        await dbF("inventory_items",{method:"POST",body:JSON.stringify(invRow)});
        // Create subcomponents from breakers
        if(breakers.length>0){
          const subRows=breakers.map((b,si)=>({
            inventory_id:invId,
            component_type:"Breaker",
            amp_rating:b.amp||null,
            poles:parseInt(b.poles)||1,
            quantity:b.count||1,
            grade:b.grade||"C",
            condition_notes:[b.pitting?"Pitting":"",b.contactWear?"Contact wear":""].filter(Boolean).join(", ")||null,
            is_present:true,
            salvageable:b.grade!=="D",
            origin_type:b.oem||"oem",
            sort_order:si,
          }));
          await dbF("inventory_subcomponents",{method:"POST",body:JSON.stringify(subRows)});
        }
        // Create missing components
        if(missingComps.length>0){
          const missRows=missingComps.filter(m=>m.type||m.component_type).map(m=>({
            inventory_id:invId,
            component_type:m.type||m.component_type,
            description:m.desc||m.description||null,
            quantity:m.qty||m.quantity||1,
            replacement_status:"needed",
          }));
          if(missRows.length)await dbF("inventory_missing_components",{method:"POST",body:JSON.stringify(missRows)});
        }
        // Update bid line item with inventory link and pickup status
        await dbF(`bid_line_items?bid_id=eq.${encodeURIComponent(jobData.id)}&sort_order=eq.${lineIdx}`,{
          method:"PATCH",body:JSON.stringify({inventory_id:invId,pickup_status:"completed"}),
        });
        ok=true;
      }catch(e){loc=true;console.error(e);}}

      // Update local state
      setJobs(prev=>prev.map(j=>{
        if(j.id!==jobData.id)return j;
        const its=(j.items||j.bid_line_items||[]).map((it,idx)=>
          idx===lineIdx?{...it,inventory_id:invId,pickup_status:"completed"}:it
        );
        return {...j,items:its,bid_line_items:its};
      }));
      if(!ok)await sS("wes_wt",jobs);

      setMsg({t:"success",m:`${invId} created in inventory. ${lineItem.grade==="D"?"Routed to scrap.":"Routed to "+((LOC.find(l=>l.v===(lineItem.destination||"main_warehouse"))?.l)||"warehouse")+"."}`});
    }catch(e){setMsg({t:"error",m:"Pickup failed: "+e.message});}
  };

  /* ── Edit line item after the fact (disposition, destination, grade) ── */
  const patchLineItem=async(jobId,lineIdx,updates)=>{
    // Update local state
    setJobs(prev=>prev.map(j=>{
      if(j.id!==jobId)return j;
      const its=(j.items||j.bid_line_items||[]).map((it,idx)=>idx===lineIdx?{...it,...updates}:it);
      return {...j,items:its,bid_line_items:its};
    }));
    // Update Supabase
    if(!loc){
      try{
        const d={};
        for(const[k,v]of Object.entries(updates))d[k.replace(/[A-Z]/g,m=>"_"+m.toLowerCase())]=v===""?null:v;
        await dbF(`bid_line_items?bid_id=eq.${encodeURIComponent(jobId)}&sort_order=eq.${lineIdx}`,{method:"PATCH",body:JSON.stringify(d)});
      }catch{loc=true;}
    }
    await sS("wes_wt",jobs);
  };

  /* ── Receive verification: confirm arrival + putaway + SKU ── */
  const [recvModal,setRecvModal]=useState(null); // {jobId, lineIdx, item}
  const [recvPutaway,setRecvPutaway]=useState("");
  const [recvSku,setRecvSku]=useState("");
  const [recvBy,setRecvBy]=useState("");

  const openReceiveModal=(jobId,lineIdx,item)=>{
    setRecvModal({jobId,lineIdx,item});
    setRecvPutaway(item.putaway_location||"");
    setRecvSku(item.barcode_sku||item.barcodeSku||"");
    setRecvBy("");
  };

  const confirmReceive=async()=>{
    if(!recvModal)return;
    const {jobId,lineIdx,item}=recvModal;
    const invId=item.inventory_id;

    // Patch inventory record with putaway + barcode + verified
    if(invId&&!loc){
      try{
        await dbF(`inventory_items?id=eq.${encodeURIComponent(invId)}`,{method:"PATCH",body:JSON.stringify({
          putaway_location:recvPutaway||null,
          barcode_sku:recvSku||null,
          received_verified:true,
          verified_by:recvBy||null,
          verified_date:today(),
        })});
      }catch{loc=true;}
    }

    // Patch bid line item
    await patchLineItem(jobId,lineIdx,{
      receive_status:"verified",
      putaway_location:recvPutaway||null,
      barcode_sku:recvSku||null,
    });

    setMsg({t:"success",m:`${invId||"Item"} verified. Putaway: ${recvPutaway||"N/A"}`});
    setRecvModal(null);
  };

  /* ── Export ── */
  const esc=v=>{const s=String(v??"");return s.includes(",")||s.includes('"')?`"${s.replace(/"/g,'""')}"`:s;};
  const exportCSV=(b)=>{
    const its=b.items||b.bid_line_items||[];
    const h=["ID","Job","Customer","Date","Mode","Equipment","Mfr","S/N","Amps","Volts","KVA","KVA FA","Phase","NEMA","In/Out","Year","HV Wind","LV Wind","Class","Liquid","Weight","kAIC","Grade","Disposition","Dest","Qty","Resale $","Scrap $","eBay Avg","Photos","Condition","COGS","Revenue","Margin %"];
    const l=[h.map(esc).join(",")];
    its.forEach((it,i)=>{l.push([esc(b.id),esc(b.job_name),esc(b.customer_name),esc(b.bid_date),esc(b.mode),esc(it.equipment_type),esc(it.manufacturer),esc(it.serial_number),esc(it.amperage_rating),esc(it.voltage_rating),esc(it.kva_rating),esc(it.kva_forced),esc(it.phase),esc(it.nema_rating),esc(it.indoor_outdoor),esc(it.year_manufactured),esc(it.winding_hv),esc(it.winding_lv),esc(it.cooling_class),esc(it.liquid_type),esc(it.nameplate_weight_lbs||it.estimated_weight_lbs),esc(it.interrupting_rating),esc(it.grade),esc(it.disposition),esc(it.destination),esc(it.quantity),esc(it.estimated_resale),esc(it.estimated_scrap),esc(it.ebay_comp_avg),esc(it.photo_count||(it.photos||[]).length),esc(it.notes),esc(i===0?b.total_cogs:""),esc(i===0?b.total_revenue:""),esc(i===0?b.gross_margin_pct:"")].join(","));});
    const bl=new Blob([l.join("\n")],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=`WES_${b.mode||"walkthrough"}_${b.id||"export"}.csv`;a.click();
  };

  /* ════════════════════════════════════════════════════════ */
  return(
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro",sans-serif',maxWidth:480,margin:"0 auto",padding:"12px 16px",color:"#0f172a",minHeight:"100vh",background:"#f1f5f9"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,padding:"12px 0",borderBottom:"3px solid #0f172a"}}>
        <div><div style={{fontSize:20,fontWeight:800}}>WES Walkthrough</div><div style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>WORLDWIDE ELECTRICAL SERVICES</div></div>
        <div style={{display:"flex",gap:4}}>
          {[{k:"new",l:"+"},{k:"jobs",l:String(jobs.length)}].map(t=><button key={t.k} onClick={()=>setView(t.k)} style={{padding:"8px 14px",borderRadius:8,border:"none",background:view===t.k?"#0f172a":"#e2e8f0",color:view===t.k?"#fff":"#64748b",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t.l}</button>)}
        </div>
      </div>

      {/* Mode toggle */}
      {view==="new"&&<div style={{display:"flex",gap:4,marginBottom:12}}>
        {[{m:"walkthrough",i:"\uD83D\uDCCB",l:"Walkthrough"},{m:"pickup",i:"\uD83D\uDE9A",l:"Pickup"},{m:"receive",i:"\uD83D\uDCE6",l:"Receive"}].map(({m,i,l})=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"12px 0",borderRadius:10,border:`2.5px solid ${mode===m?"#0f172a":"#e2e8f0"}`,background:mode===m?"#0f172a":"#fff",color:mode===m?"#fff":"#64748b",fontWeight:800,fontSize:13,cursor:"pointer"}}>{i} {l}</button>)}
      </div>}

      {msg&&<div style={{padding:"12px",background:msg.t==="error"?"#fef2f2":msg.t==="info"?"#eff6ff":"#ecfdf5",border:`1px solid ${msg.t==="error"?"#fecaca":msg.t==="info"?"#bfdbfe":"#a7f3d0"}`,borderRadius:10,color:msg.t==="error"?"#dc2626":msg.t==="info"?"#1d4ed8":"#065f46",fontSize:13,marginBottom:12,display:"flex",justifyContent:"space-between"}}><span>{msg.m}</span><button onClick={()=>setMsg(null)} style={{background:"none",border:"none",fontWeight:700,cursor:"pointer",color:"inherit"}}>&times;</button></div>}

      {/* ════ NEW ════ */}
      {view==="new"&&<div>
        {/* Job Info (walkthrough/pickup only) */}
        {mode!=="receive"&&<div style={card}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:12}}>Job Info</div>
          <div style={{marginBottom:10}}><label style={lbl}>Job / Site Name *</label><input style={errs.jobName?inpE:inp} value={job.jobName} onChange={e=>uf("jobName",e.target.value)} placeholder="Data Center XYZ"/>{errs.jobName&&<div style={{fontSize:12,color:"#ef4444",marginTop:3}}>{errs.jobName}</div>}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Customer *</label><input style={errs.customerName?inpE:inp} value={job.customerName} onChange={e=>uf("customerName",e.target.value)}/>{errs.customerName&&<div style={{fontSize:12,color:"#ef4444",marginTop:3}}>{errs.customerName}</div>}</div>
            <div><label style={lbl}>Prepared By</label><input style={inp} value={job.preparedBy} onChange={e=>uf("preparedBy",e.target.value)}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
            <div><label style={lbl}>Address</label><input style={inp} value={job.siteAddress} onChange={e=>uf("siteAddress",e.target.value)}/></div>
            <div><label style={lbl}>Date</label><input style={inp} type="date" value={job.bidDate} onChange={e=>uf("bidDate",e.target.value)}/></div>
          </div>
        </div>}

        {/* Costs (walkthrough/pickup only) */}
        {mode!=="receive"&&<div style={card}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:12}}>Acquisition Costs</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Labor Hrs</label><input style={inp} type="number" value={job.laborHours} onChange={e=>uf("laborHours",e.target.value)}/></div>
            <div><label style={lbl}>$/Hr</label><input style={inp} type="number" value={job.laborRate} onChange={e=>uf("laborRate",e.target.value)}/></div>
            <div><label style={lbl}>Transport</label><input style={inp} type="number" value={job.transportCost} onChange={e=>uf("transportCost",e.target.value)}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div style={{background:"#f8fafc",borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:"#6b7280"}}>LABOR</div><div style={{fontSize:16,fontWeight:800}}>${laborCost.toFixed(0)}</div></div>
            <div style={{background:"#f8fafc",borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:"#6b7280"}}>TOTAL COGS</div><div style={{fontSize:16,fontWeight:800}}>${totalCOGS.toFixed(0)}</div></div>
            <div style={{background:"#f8fafc",borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:"#6b7280"}}>MARGIN</div><div style={{fontSize:16,fontWeight:800,color:meetsMargin?"#16a34a":"#dc2626"}}>{items.length>0?`${marginPct.toFixed(0)}%`:"--"}</div></div>
          </div>
        </div>}

        {/* Receive mode: source + location */}
        {mode==="receive"&&<div style={card}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:12}}>Receiving Info</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Received By *</label><input style={errs.preparedBy?inpE:inp} value={job.preparedBy} onChange={e=>uf("preparedBy",e.target.value)} placeholder="Your name"/>{errs.preparedBy&&<div style={{fontSize:12,color:"#ef4444",marginTop:3}}>{errs.preparedBy}</div>}</div>
            <div><label style={lbl}>Date</label><input style={inp} type="date" value={job.bidDate} onChange={e=>uf("bidDate",e.target.value)}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>Source / Purchased From</label><input style={inp} value={job.customerName} onChange={e=>uf("customerName",e.target.value)} placeholder="Vendor, walk-in, auction..."/></div>
            <div><label style={lbl}>Reference / PO #</label><input style={inp} value={job.jobName} onChange={e=>uf("jobName",e.target.value)} placeholder="PO, lot #, ref"/></div>
          </div>
        </div>}

        {/* Equipment Items */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:15,fontWeight:800}}>Equipment ({items.length})</span>
          <button onClick={addItem} style={{padding:"10px 16px",borderRadius:8,border:"none",background:"#2563eb",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>+ Add Item</button>
        </div>
        {errs.items&&<div style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errs.items}</div>}

        {items.map((it,i)=>(
          <div key={i} style={{...card,borderLeft:`4px solid ${gc[it.grade]||"#6b7280"}`,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:14,fontWeight:800,color:"#475569"}}>ITEM {i+1}</span>
              <button onClick={()=>rmItem(i)} style={{background:"none",border:"none",color:"#ef4444",fontSize:20,cursor:"pointer"}}>&times;</button>
            </div>

            {/* OCR + Photo row */}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <label style={{flex:1,padding:10,borderRadius:8,background:scanning?"#94a3b8":"#0f172a",color:"#fff",fontWeight:700,fontSize:12,textAlign:"center",cursor:"pointer"}}>
                {scanning?"\u23F3":"📷 Scan Nameplate"}
                <input type="file" accept="image/*" capture="environment" onChange={e=>handleScan(e.target.files?.[0],i)} style={{display:"none"}} disabled={scanning}/>
              </label>
              <label style={{flex:1,padding:10,borderRadius:8,background:"#475569",color:"#fff",fontWeight:700,fontSize:12,textAlign:"center",cursor:"pointer"}}>
                📸 Add Photo ({(it.photos||[]).length})
                <input type="file" accept="image/*" capture="environment" onChange={e=>addPhoto(e.target.files?.[0],i)} style={{display:"none"}}/>
              </label>
            </div>

            {/* Photo thumbnails */}
            {it.photos&&it.photos.length>0&&<div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
              {it.photos.map((p,pi)=><img key={pi} src={p} alt="" style={{width:60,height:60,borderRadius:8,objectFit:"cover",border:"2px solid #e5e7eb",flexShrink:0}}/>)}
            </div>}

            {/* Equipment fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Type</label><select style={inpSm} value={it.equipmentType} onChange={e=>uItem(i,"equipmentType",e.target.value)}><option value="">Select</option>{EQ.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Mfr</label><select style={inpSm} value={it.manufacturer} onChange={e=>uItem(i,"manufacturer",e.target.value)}><option value="">Select</option>{MFR.map(m=><option key={m}>{m}</option>)}</select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>S/N</label><input style={inpSm} value={it.serialNumber} onChange={e=>uItem(i,"serialNumber",e.target.value)}/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Model</label><input style={inpSm} value={it.modelNumber} onChange={e=>uItem(i,"modelNumber",e.target.value)}/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Amps</label><input style={inpSm} value={it.amperageRating} onChange={e=>uItem(i,"amperageRating",e.target.value)}/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Volts</label><input style={inpSm} value={it.voltageRating} onChange={e=>uItem(i,"voltageRating",e.target.value)}/></div>
            </div>

            {/* Specs row 2 */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>NEMA</label><select style={inpSm} value={it.nemaRating||""} onChange={e=>uItem(i,"nemaRating",e.target.value)}><option value="">--</option>{NEMA.map(n=><option key={n.v} value={n.v}>{n.v}</option>)}</select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Phase</label><div style={{display:"flex",gap:3}}>{PHASE.map(p=><button key={p} onClick={()=>uItem(i,"phase",p)} style={{flex:1,padding:"8px 0",borderRadius:6,border:`2px solid ${it.phase===p?"#2563eb":"#e2e8f0"}`,background:it.phase===p?"#2563eb15":"#fff",color:it.phase===p?"#2563eb":"#cbd5e1",fontWeight:800,fontSize:12,cursor:"pointer"}}>{p}P</button>)}</div></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Year</label><input style={inpSm} type="number" value={it.yearMfg||""} onChange={e=>uItem(i,"yearMfg",e.target.value)} placeholder="2001"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>In/Out</label><div style={{display:"flex",gap:3}}>{[{v:"indoor",l:"In"},{v:"outdoor",l:"Out"}].map(o=><button key={o.v} onClick={()=>uItem(i,"indoorOutdoor",o.v)} style={{flex:1,padding:"8px 0",borderRadius:6,border:`2px solid ${it.indoorOutdoor===o.v?"#2563eb":"#e2e8f0"}`,background:it.indoorOutdoor===o.v?"#2563eb15":"#fff",color:it.indoorOutdoor===o.v?"#2563eb":"#cbd5e1",fontWeight:700,fontSize:11,cursor:"pointer"}}>{o.l}</button>)}</div></div>
            </div>
            {/* Specs row 3: transformer specific */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>KVA</label><input style={inpSm} value={it.kvaRating||""} onChange={e=>uItem(i,"kvaRating",e.target.value)} placeholder="Cont."/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>KVA FA</label><input style={inpSm} value={it.kvaForced||""} onChange={e=>uItem(i,"kvaForced",e.target.value)} placeholder="Forced"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Class</label><select style={inpSm} value={it.coolingClass||""} onChange={e=>uItem(i,"coolingClass",e.target.value)}><option value="">--</option><option value="OA">OA (Oil)</option><option value="OA/FA">OA/FA</option><option value="OA/FA/FA">OA/FA/FA</option><option value="AA">AA (Dry)</option><option value="AA/FA">AA/FA</option><option value="AFA">AFA</option></select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Liquid</label><select style={inpSm} value={it.liquidType||""} onChange={e=>uItem(i,"liquidType",e.target.value)}><option value="">--</option><option value="OIL">Oil</option><option value="DRY">Dry</option><option value="SILICONE">Silicone</option></select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>HV Wind</label><select style={inpSm} value={it.windingHv||""} onChange={e=>{uItem(i,"windingHv",e.target.value);uItem(i,"windingMaterial",e.target.value&&it.windingLv?(e.target.value===it.windingLv?e.target.value:`${e.target.value}/${it.windingLv}`):e.target.value);}}><option value="">--</option><option value="CU">Copper</option><option value="AL">Aluminum</option></select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>LV Wind</label><select style={inpSm} value={it.windingLv||""} onChange={e=>{uItem(i,"windingLv",e.target.value);uItem(i,"windingMaterial",it.windingHv&&e.target.value?(it.windingHv===e.target.value?e.target.value:`${it.windingHv}/${e.target.value}`):e.target.value);}}><option value="">--</option><option value="CU">Copper</option><option value="AL">Aluminum</option></select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Wt (lbs)</label><input style={inpSm} type="number" value={it.nameplateWeight||""} onChange={e=>uItem(i,"nameplateWeight",e.target.value)} placeholder="Total"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>kAIC</label><input style={inpSm} value={it.interruptRating||""} onChange={e=>uItem(i,"interruptRating",e.target.value)} placeholder="N/A"/></div>
            </div>
            {/* Breaker-specific fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Frame</label><input style={inpSm} value={it.frameSize||""} onChange={e=>uItem(i,"frameSize",e.target.value)} placeholder="800A"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Trip</label><input style={inpSm} value={it.tripRating||""} onChange={e=>uItem(i,"tripRating",e.target.value)} placeholder="Sensor"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Cat #</label><input style={inpSm} value={it.catalogNumber||""} onChange={e=>uItem(i,"catalogNumber",e.target.value)} placeholder="Catalog"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Mount</label><select style={inpSm} value={it.mountingType||""} onChange={e=>uItem(i,"mountingType",e.target.value)}><option value="">--</option><option value="fixed">Fixed</option><option value="drawout">Drawout</option><option value="plug-in">Plug-in</option></select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Breaker Type</label><select style={inpSm} value={it.breakerType||""} onChange={e=>uItem(i,"breakerType",e.target.value)}><option value="">--</option><option value="molded_case">Molded Case (MCCB)</option><option value="power">Power (LVPCB)</option><option value="air">Air (ACB)</option><option value="vacuum">Vacuum (VCB)</option><option value="insulated_case">Insulated Case (ICCB)</option></select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Trip Unit</label><select style={inpSm} value={it.tripUnitType||""} onChange={e=>uItem(i,"tripUnitType",e.target.value)}><option value="">--</option><option value="thermal_magnetic">Thermal-Magnetic</option><option value="electronic">Electronic</option><option value="LSI">LSI</option><option value="LSIG">LSIG</option><option value="MicroLogic">MicroLogic</option><option value="Digitrip">Digitrip</option></select></div>
            </div>
            {/* Switchgear-specific fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Bus Amps</label><input style={inpSm} value={it.busRating||""} onChange={e=>uItem(i,"busRating",e.target.value)} placeholder="2000"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>SC kA</label><input style={inpSm} value={it.shortCircuitRating||""} onChange={e=>uItem(i,"shortCircuitRating",e.target.value)} placeholder="65kA"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>BIL kV</label><input style={inpSm} value={it.bilKv||""} onChange={e=>uItem(i,"bilKv",e.target.value)} placeholder="95"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Sections</label><input style={inpSm} type="number" value={it.numSections||""} onChange={e=>uItem(i,"numSections",e.target.value)} placeholder="#"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>V Class</label><select style={inpSm} value={it.voltageClass||""} onChange={e=>uItem(i,"voltageClass",e.target.value)}><option value="">--</option><option value="LV">LV (600V-)</option><option value="5kV">MV 5kV</option><option value="15kV">MV 15kV</option><option value="27kV">MV 27kV</option><option value="38kV">MV 38kV</option></select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Bus Metal</label><select style={inpSm} value={it.busMaterial||""} onChange={e=>uItem(i,"busMaterial",e.target.value)}><option value="">--</option><option value="CU">Copper</option><option value="AL">Aluminum</option></select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Type</label><select style={inpSm} value={it.switchgearType||""} onChange={e=>uItem(i,"switchgearType",e.target.value)}><option value="">--</option><option value="metal-clad">Metal-Clad</option><option value="metal-enclosed">Metal-Enclosed</option><option value="dead-front">Dead-Front</option><option value="arc-resistant">Arc-Resistant</option></select></div>
            </div>

            {/* Grade */}
            <div style={{display:"flex",gap:4,marginBottom:8}}>
              {GRD.map(g=><button key={g.v} onClick={()=>uItem(i,"grade",g.v)} style={{flex:1,padding:"10px 0",borderRadius:8,border:`2.5px solid ${it.grade===g.v?g.c:"#e2e8f0"}`,background:it.grade===g.v?g.c+"15":"#fff",color:it.grade===g.v?g.c:"#cbd5e1",fontWeight:800,fontSize:14,cursor:"pointer"}}>{g.v}<div style={{fontSize:9,fontWeight:600}}>{g.d}</div></button>)}
            </div>

            {/* Disposition */}
            <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap"}}>
              {DISP.map(d=><button key={d.v} onClick={()=>uItem(i,"disposition",d.v)} style={{padding:"8px 10px",borderRadius:8,border:`1.5px solid ${it.disposition===d.v?d.c:"#e2e8f0"}`,background:it.disposition===d.v?d.c+"15":"#fff",color:it.disposition===d.v?d.c:"#94a3b8",fontWeight:700,fontSize:11,cursor:"pointer"}}>{d.l}</button>)}
            </div>

            {/* Pickup destination (in pickup mode) */}
            {mode==="pickup"&&<div style={{marginBottom:8}}>
              <label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Destination</label>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {LOC.map(l=><button key={l.v} onClick={()=>uItem(i,"destination",l.v)} style={{padding:"6px 10px",borderRadius:6,border:`1.5px solid ${it.destination===l.v?"#2563eb":"#e2e8f0"}`,background:it.destination===l.v?"#2563eb15":"#fff",color:it.destination===l.v?"#2563eb":"#94a3b8",fontWeight:600,fontSize:10,cursor:"pointer"}}>{l.l}</button>)}
              </div>
            </div>}

            {/* Pricing */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Resale $</label><input style={{...inpSm,borderColor:parseFloat(it.estimatedResale)>0?"#16a34a":"#d1d5db"}} type="number" step="0.01" value={it.estimatedResale} onChange={e=>uItem(i,"estimatedResale",e.target.value)}/>{it.priceBookValue>0&&<div style={{fontSize:9,color:"#2563eb"}}>Book: ${it.priceBookValue.toFixed(0)}</div>}</div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Scrap $</label><div style={{...inpSm,background:"#f8fafc",color:"#475569"}}>${(it.estimatedScrap||0).toFixed(0)}</div><div style={{fontSize:9,color:"#94a3b8"}}>{it.estimatedWeight>0?`~${it.estimatedWeight} lbs`:""}</div></div>
              <div><button onClick={()=>fetchEbay(i)} style={{width:"100%",padding:"10px 0",borderRadius:8,border:"1px solid #16a34a",background:"#fff",color:"#16a34a",fontWeight:700,fontSize:11,cursor:"pointer",marginTop:18}}>eBay{it.ebayCompAvg>0?` $${it.ebayCompAvg.toFixed(0)}`:""}</button></div>
            </div>

            {/* Breaker Inventory */}
            <div style={{background:"#f0f9ff",borderRadius:10,padding:12,marginBottom:8,border:"1px solid #bae6fd"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:800,color:"#0369a1"}}>BREAKERS ({(it.breakers||[]).reduce((a,b)=>a+(b.count||0),0)} total)</span>
                <button onClick={()=>addBreaker(i)} style={{padding:"6px 12px",borderRadius:6,border:"none",background:"#0369a1",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>+ Add</button>
              </div>
              {(it.breakers||[]).length===0&&<div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:8}}>No breakers logged. Tap + Add.</div>}
              {(it.breakers||[]).map((br,bi)=>(
                <div key={bi} style={{background:"#fff",borderRadius:8,padding:10,marginBottom:6,border:`1.5px solid ${gc[br.grade]||"#e5e7eb"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:10,fontWeight:700,color:"#475569"}}>#{bi+1}</span>
                    <button onClick={()=>rmBreaker(i,bi)} style={{background:"none",border:"none",color:"#ef4444",fontSize:16,cursor:"pointer",padding:0}}>&times;</button>
                  </div>
                  {/* Row 1: Amp, Count, Poles */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:6}}>
                    <div><label style={{fontSize:9,fontWeight:600,color:"#6b7280"}}>Amps</label><select style={{...inpSm,padding:"8px"}} value={br.amp} onChange={e=>uBreaker(i,bi,"amp",e.target.value)}>{AMPS.map(a=><option key={a}>{a}</option>)}</select></div>
                    <div><label style={{fontSize:9,fontWeight:600,color:"#6b7280"}}>Count</label><input style={{...inpSm,padding:"8px",textAlign:"center"}} type="number" min={1} value={br.count} onChange={e=>uBreaker(i,bi,"count",parseInt(e.target.value)||1)}/></div>
                    <div><label style={{fontSize:9,fontWeight:600,color:"#6b7280"}}>Poles</label><div style={{display:"flex",gap:3}}>{["1","2","3"].map(p=><button key={p} onClick={()=>uBreaker(i,bi,"poles",p)} style={{flex:1,padding:"8px 0",borderRadius:6,border:`2px solid ${br.poles===p?"#2563eb":"#e2e8f0"}`,background:br.poles===p?"#2563eb15":"#fff",color:br.poles===p?"#2563eb":"#cbd5e1",fontWeight:800,fontSize:12,cursor:"pointer"}}>{p}P</button>)}</div></div>
                  </div>
                  {/* Row 2: Grade */}
                  <div style={{display:"flex",gap:3,marginBottom:6}}>
                    {GRD.map(g=><button key={g.v} onClick={()=>uBreaker(i,bi,"grade",g.v)} style={{flex:1,padding:"8px 0",borderRadius:6,border:`2px solid ${br.grade===g.v?g.c:"#e2e8f0"}`,background:br.grade===g.v?g.c+"15":"#fff",color:br.grade===g.v?g.c:"#cbd5e1",fontWeight:800,fontSize:12,cursor:"pointer"}}>{g.v}</button>)}
                  </div>
                  {/* Row 3: OEM/AM + Condition flags */}
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <button onClick={()=>uBreaker(i,bi,"oem",br.oem==="oem"?"aftermarket":"oem")} style={{padding:"7px 10px",borderRadius:6,border:`1.5px solid ${br.oem==="oem"?"#0369a1":"#c026d3"}`,background:br.oem==="oem"?"#0369a115":"#c026d315",color:br.oem==="oem"?"#0369a1":"#c026d3",fontWeight:700,fontSize:10,cursor:"pointer"}}>{br.oem==="oem"?"OEM":"Aftermarket"}</button>
                    <button onClick={()=>uBreaker(i,bi,"pitting",!br.pitting)} style={{padding:"7px 10px",borderRadius:6,border:`1.5px solid ${br.pitting?"#dc2626":"#d1d5db"}`,background:br.pitting?"#dc262615":"#fff",color:br.pitting?"#dc2626":"#94a3b8",fontWeight:700,fontSize:10,cursor:"pointer"}}>{br.pitting?"\u26a0 Pitting":"No Pitting"}</button>
                    <button onClick={()=>uBreaker(i,bi,"contactWear",!br.contactWear)} style={{padding:"7px 10px",borderRadius:6,border:`1.5px solid ${br.contactWear?"#f59e0b":"#d1d5db"}`,background:br.contactWear?"#f59e0b15":"#fff",color:br.contactWear?"#f59e0b":"#94a3b8",fontWeight:700,fontSize:10,cursor:"pointer"}}>{br.contactWear?"\u26a0 Contact Wear":"Good Contact"}</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Missing */}
            <div style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:11,fontWeight:700,color:"#dc2626"}}>Missing ({(it.missing||[]).length})</span>
                <button onClick={()=>addMissing(i)} style={{padding:"4px 10px",borderRadius:6,border:"none",background:"#dc2626",color:"#fff",fontWeight:700,fontSize:10,cursor:"pointer"}}>+</button>
              </div>
              {(it.missing||[]).map((m,mi)=>(
                <div key={mi} style={{display:"flex",gap:6,marginBottom:4}}>
                  <select style={{...inpSm,flex:1,padding:"6px"}} value={m.type} onChange={e=>uMissing(i,mi,"type",e.target.value)}><option value="">Type</option>{MT.map(t=><option key={t}>{t}</option>)}</select>
                  <input style={{...inpSm,flex:1,padding:"6px"}} value={m.desc} onChange={e=>uMissing(i,mi,"desc",e.target.value)} placeholder="Details"/>
                  <button onClick={()=>rmMissing(i,mi)} style={{background:"none",border:"none",color:"#ef4444",fontSize:16,cursor:"pointer"}}>&times;</button>
                </div>
              ))}
            </div>

            {/* Condition notes */}
            <input style={inpSm} value={it.conditionNotes} onChange={e=>uItem(i,"conditionNotes",e.target.value)} placeholder="Condition: rust, dents, mods, weather exposure..."/>

            {/* Receive mode: COGS + Location per item */}
            {mode==="receive"&&<div style={{marginTop:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Cost $</label><input style={inpSm} type="number" step="0.01" value={it.acquisitionCost||""} onChange={e=>uItem(i,"acquisitionCost",e.target.value)} placeholder="What you paid"/></div>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Refurb $</label><input style={inpSm} type="number" step="0.01" value={it.refurbCost||""} onChange={e=>uItem(i,"refurbCost",e.target.value)} placeholder="Est refurb"/></div>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Ask $</label><input style={inpSm} type="number" step="0.01" value={it.askingPrice||""} onChange={e=>uItem(i,"askingPrice",e.target.value)} placeholder="Sell price"/></div>
              </div>
              {(parseFloat(it.acquisitionCost)||0)+(parseFloat(it.refurbCost)||0)>0&&<div style={{fontSize:11,fontWeight:700,marginBottom:8,color:parseFloat(it.askingPrice)>((parseFloat(it.acquisitionCost)||0)+(parseFloat(it.refurbCost)||0))?"#16a34a":"#94a3b8"}}>COGS: ${((parseFloat(it.acquisitionCost)||0)+(parseFloat(it.refurbCost)||0)).toFixed(2)}{it.askingPrice?` | Margin: ${(((parseFloat(it.askingPrice)-((parseFloat(it.acquisitionCost)||0)+(parseFloat(it.refurbCost)||0)))/parseFloat(it.askingPrice))*100).toFixed(0)}%`:""}</div>}
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Location</label>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {LOC.filter(l=>l.v!=="scrap_yard").map(l=><button key={l.v} onClick={()=>uItem(i,"destination",l.v)} style={{padding:"6px 10px",borderRadius:6,border:`1.5px solid ${(it.destination||"main_warehouse")===l.v?"#2563eb":"#e2e8f0"}`,background:(it.destination||"main_warehouse")===l.v?"#2563eb15":"#fff",color:(it.destination||"main_warehouse")===l.v?"#2563eb":"#94a3b8",fontWeight:600,fontSize:10,cursor:"pointer"}}>{l.l}</button>)}
              </div></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                <ScanInput label="Putaway Location" value={it.putawayLocation} onChange={v=>uItem(i,"putawayLocation",v)} placeholder="Scan bin/rack..."/>
                <ScanInput label="SKU / Barcode" value={it.barcodeSku} onChange={v=>uItem(i,"barcodeSku",v)} placeholder="Scan or assign..."/>
              </div>
            </div>}
          </div>
        ))}

        {/* Summary (walkthrough/pickup only) */}
        {mode!=="receive"&&items.length>0&&<div style={{...card,background:meetsMargin?"#ecfdf5":"#fef2f2",border:`2px solid ${meetsMargin?"#a7f3d0":"#fecaca"}`}}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:10,color:meetsMargin?"#065f46":"#991b1b"}}>{meetsMargin?"\u2713 Bid Summary":"\u26a0 Below "+targetMargin+"% Margin"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div><div style={{fontSize:10,color:"#6b7280"}}>COGS</div><div style={{fontSize:15,fontWeight:800}}>${totalCOGS.toFixed(0)}</div></div>
            <div><div style={{fontSize:10,color:"#6b7280"}}>Revenue</div><div style={{fontSize:15,fontWeight:800,color:"#16a34a"}}>${totalRevenue.toFixed(0)}</div></div>
            <div><div style={{fontSize:10,color:"#6b7280"}}>Profit</div><div style={{fontSize:15,fontWeight:800,color:grossProfit>0?"#16a34a":"#dc2626"}}>${grossProfit.toFixed(0)}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><div style={{fontSize:10,color:"#6b7280"}}>Resale</div><div style={{fontWeight:700}}>${totalResale.toFixed(0)}</div></div>
            <div><div style={{fontSize:10,color:"#6b7280"}}>Scrap</div><div style={{fontWeight:700}}>${totalScrap.toFixed(0)}</div></div>
          </div>
        </div>}

        {/* Actions */}
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <button onClick={mode==="receive"?handleReceive:handleSubmit} disabled={sv} style={{flex:2,padding:16,borderRadius:12,border:"none",background:sv?"#94a3b8":mode==="receive"?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#0f172a,#1e293b)",color:"#fff",fontSize:16,fontWeight:800,cursor:sv?"not-allowed":"pointer"}}>{sv?"Saving...":mode==="receive"?`Add ${items.length} to Inventory`:"Save"}</button>
          <button onClick={()=>sendWhatsApp()} style={{flex:1,padding:16,borderRadius:12,border:"none",background:"#25D366",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>WhatsApp</button>
        </div>

        {/* Notes */}
        <div style={card}><label style={lbl}>Notes</label><textarea style={{...inp,minHeight:60,resize:"vertical"}} value={job.notes} onChange={e=>uf("notes",e.target.value)} placeholder="Scope, exclusions, access notes..."/></div>
      </div>}

      {/* ════ JOB LIST ════ */}
      {view==="jobs"&&<div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          <button onClick={loadJobs} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #d1d5db",background:"#fff",color:"#475569",fontWeight:700,fontSize:13,cursor:"pointer"}}>{ld?"...":"Refresh"}</button>
        </div>
        {jobs.length===0?<div style={{textAlign:"center",padding:48,color:"#9ca3af"}}>No jobs yet. Tap + to start a walkthrough.</div>:jobs.map(b=>{
          const isE=expId===b.id;const its=b.items||b.bid_line_items||[];
          const mgn=parseFloat(b.gross_margin_pct)||0;const mC=mgn>=45?"#16a34a":mgn>=30?"#f59e0b":"#dc2626";
          return(
            <div key={b.id} style={{...card,borderLeft:`4px solid ${mC}`,padding:14,cursor:"pointer"}} onClick={()=>setExpId(isE?null:b.id)}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontWeight:800,fontSize:14}}>{b.id}</span><span style={{fontSize:10,padding:"2px 6px",borderRadius:6,background:b.mode==="pickup"?"#0891b218":"#8b5cf618",color:b.mode==="pickup"?"#0891b2":"#8b5cf6",fontWeight:700}}>{b.mode||"walkthrough"}</span><span style={{fontSize:10,padding:"2px 6px",borderRadius:6,background:b.status==="accepted"?"#16a34a18":b.status==="rejected"?"#dc262618":"#6b728018",color:b.status==="accepted"?"#16a34a":b.status==="rejected"?"#dc2626":"#6b7280",fontWeight:700}}>{b.status}</span></div>
                  <div style={{fontSize:13,fontWeight:600,marginTop:2}}>{b.job_name}</div>
                  <div style={{fontSize:12,color:"#6b7280"}}>{b.customer_name} | {b.bid_date}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800}}>${parseFloat(b.total_revenue||0).toFixed(0)}</div>
                  <div style={{fontSize:12,fontWeight:700,color:mC}}>{mgn.toFixed(0)}%</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{its.length} items</div>
                </div>
              </div>

              {isE&&<div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #e5e7eb"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10,fontSize:12}}>
                  <div><div style={{color:"#6b7280"}}>COGS</div><div style={{fontWeight:800}}>${parseFloat(b.total_cogs||0).toFixed(0)}</div></div>
                  <div><div style={{color:"#6b7280"}}>Revenue</div><div style={{fontWeight:800,color:"#16a34a"}}>${parseFloat(b.total_revenue||0).toFixed(0)}</div></div>
                  <div><div style={{color:"#6b7280"}}>Profit</div><div style={{fontWeight:800,color:mC}}>${(parseFloat(b.total_revenue||0)-parseFloat(b.total_cogs||0)).toFixed(0)}</div></div>
                </div>
                {its.map((it,j)=>{
                  const pickedUp=it.pickup_status==="completed"||it.pickupStatus==="completed";
                  return(
                  <div key={j} style={{padding:"10px 0",borderBottom:"1px solid #f1f5f9",fontSize:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div><span style={{fontWeight:600}}>{it.equipment_type}</span>{it.manufacturer&&<span style={{color:"#94a3b8",marginLeft:4}}>{it.manufacturer}</span>}{it.amperage_rating&&<span style={{marginLeft:4}}>{it.amperage_rating}A</span>}{it.kva_rating&&<span style={{marginLeft:4,color:"#475569"}}>{it.kva_rating}KVA</span>}<span style={{marginLeft:4,padding:"1px 5px",borderRadius:4,background:(gc[it.grade]||"#6b7280")+"18",color:gc[it.grade],fontSize:10,fontWeight:700}}>{it.grade}</span>{it.nema_rating&&<span style={{marginLeft:4,padding:"1px 5px",borderRadius:4,background:"#6366f118",color:"#6366f1",fontSize:9,fontWeight:600}}>NEMA {it.nema_rating}</span>}{it.winding_material&&<span style={{marginLeft:4,padding:"1px 5px",borderRadius:4,background:it.winding_material==="CU"?"#f59e0b18":"#6b728018",color:it.winding_material==="CU"?"#f59e0b":"#6b7280",fontSize:9,fontWeight:600}}>{it.winding_material}</span>}{it.breaker_count>0&&<span style={{marginLeft:4,padding:"1px 5px",borderRadius:4,background:"#0369a118",color:"#0369a1",fontSize:10,fontWeight:600}}>{it.breaker_count} bkrs</span>}</div>
                      <span style={{fontWeight:700,whiteSpace:"nowrap"}}>${parseFloat(it.disposition==="scrap"?it.estimated_scrap:it.estimated_resale||0).toFixed(0)}</span>
                    </div>
                    {/* Editable disposition */}
                    {!pickedUp&&<div style={{display:"flex",gap:3,marginTop:6,flexWrap:"wrap"}}>
                      {DISP.map(d=><button key={d.v} onClick={e=>{e.stopPropagation();patchLineItem(b.id,j,{disposition:d.v});}} style={{padding:"5px 8px",borderRadius:6,border:`1.5px solid ${(it.disposition||"unassigned")===d.v?d.c:"#e2e8f0"}`,background:(it.disposition||"unassigned")===d.v?d.c+"15":"#fff",color:(it.disposition||"unassigned")===d.v?d.c:"#cbd5e1",fontWeight:700,fontSize:9,cursor:"pointer"}}>{d.l}</button>)}
                    </div>}
                    {/* Editable destination */}
                    {!pickedUp&&(it.disposition&&it.disposition!=="unassigned")&&<div style={{display:"flex",gap:3,marginTop:4,flexWrap:"wrap"}}>
                      {LOC.map(l=><button key={l.v} onClick={e=>{e.stopPropagation();patchLineItem(b.id,j,{destination:l.v});}} style={{padding:"4px 7px",borderRadius:5,border:`1px solid ${(it.destination||"main_warehouse")===l.v?"#2563eb":"#e2e8f0"}`,background:(it.destination||"main_warehouse")===l.v?"#2563eb12":"#fff",color:(it.destination||"main_warehouse")===l.v?"#2563eb":"#cbd5e1",fontWeight:600,fontSize:8,cursor:"pointer"}}>{l.l}</button>)}
                    </div>}
                    {/* Current assignment display */}
                    {(it.disposition&&it.disposition!=="unassigned")&&<div style={{marginTop:4,fontSize:10,color:dc[it.disposition]||"#6b7280",fontWeight:600}}>{it.disposition}{it.destination?` \u2192 ${LOC.find(l=>l.v===it.destination)?.l||it.destination}`:""}</div>}
                    {/* Pickup + Receive controls per item */}
                    {(b.status==="accepted"||b.mode==="pickup")&&(
                      <div style={{marginTop:6}}>
                        {pickedUp?(
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                              <span style={{color:"#16a34a",fontWeight:700,fontSize:11}}>{"\u2713"} Picked up</span>
                              {(it.inventory_id)&&<span style={{fontSize:10,color:"#6b7280"}}>{it.inventory_id}</span>}
                            </div>
                            {/* Receive verification */}
                            {(it.receive_status==="verified"||it.receiveStatus==="verified")?(
                              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                                <span style={{color:"#8b5cf6",fontWeight:700,fontSize:11}}>{"\u2713"} Received</span>
                                {(it.putaway_location||it.putawayLocation)&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:"#8b5cf618",color:"#8b5cf6",fontWeight:600}}>{it.putaway_location||it.putawayLocation}</span>}
                                {(it.barcode_sku||it.barcodeSku)&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:"#f59e0b18",color:"#f59e0b",fontWeight:600}}>SKU: {it.barcode_sku||it.barcodeSku}</span>}
                              </div>
                            ):(
                              <button onClick={e=>{e.stopPropagation();openReceiveModal(b.id,j,it);}}
                                style={{width:"100%",padding:10,borderRadius:8,border:"none",background:"linear-gradient(135deg,#8b5cf6,#7c3aed)",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                                {"\uD83D\uDCE6"} Verify Receipt + Putaway
                              </button>
                            )}
                          </div>
                        ):(
                          <button onClick={e=>{e.stopPropagation();pickupItem(b,it,j);}}
                            style={{width:"100%",padding:10,borderRadius:8,border:"none",background:it.grade==="D"?"linear-gradient(135deg,#dc2626,#b91c1c)":"linear-gradient(135deg,#0891b2,#0e7490)",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                            {it.grade==="D"?"\uD83D\uDE9A Pick Up \u2192 Scrap Yard":`\uD83D\uDE9A Pick Up \u2192 ${LOC.find(l=>l.v===(it.destination||"main_warehouse"))?.l||"Warehouse"}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>);
                })}
                {/* Job action buttons */}
                <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
                  <button onClick={e=>{e.stopPropagation();exportCSV(b);}} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #16a34a",background:"#fff",color:"#16a34a",fontWeight:700,fontSize:12,cursor:"pointer",minWidth:60}}>CSV</button>
                  <button onClick={e=>{e.stopPropagation();const msg=buildWhatsAppMsg(b,its);window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");}} style={{flex:1,padding:10,borderRadius:8,border:"none",background:"#25D366",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",minWidth:60}}>WhatsApp</button>
                  {b.status==="draft"&&<button onClick={e=>{e.stopPropagation();patchJob(b.id,{status:"sent"});}} style={{flex:1,padding:10,borderRadius:8,border:"none",background:"#2563eb",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",minWidth:60}}>Sent</button>}
                  {(b.status==="draft"||b.status==="sent")&&<button onClick={e=>{e.stopPropagation();patchJob(b.id,{status:"accepted"});}} style={{flex:1,padding:10,borderRadius:8,border:"none",background:"#16a34a",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",minWidth:60}}>Won</button>}
                  {b.status==="sent"&&<button onClick={e=>{e.stopPropagation();patchJob(b.id,{status:"rejected"});}} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #dc2626",background:"#fff",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer",minWidth:60}}>Lost</button>}
                </div>
              </div>}
            </div>);
        })}
      </div>}

      {/* ═══ RECEIVE VERIFICATION MODAL ═══ */}
      {recvModal&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setRecvModal(null)}>
        <div style={{background:"#fff",borderRadius:16,padding:20,maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>Verify Receipt</div>
          <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>{recvModal.item.equipment_type} {recvModal.item.manufacturer||""} {recvModal.item.amperage_rating?recvModal.item.amperage_rating+"A":""}<br/>S/N: {recvModal.item.serial_number||"N/A"} | {recvModal.item.inventory_id||""}</div>

          <div style={{marginBottom:12}}>
            <ScanInput label="Putaway Location (scan bin/rack barcode)" value={recvPutaway} onChange={setRecvPutaway} placeholder="LOC-A1-01"/>
          </div>
          <div style={{marginBottom:12}}>
            <ScanInput label="SKU / Barcode (scan or assign)" value={recvSku} onChange={setRecvSku} placeholder="WES-00001"/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:10,fontWeight:600,color:"#6b7280",marginBottom:2}}>Verified By</label>
            <input style={{width:"100%",padding:"10px 12px",border:"1.5px solid #d1d5db",borderRadius:10,fontSize:14,background:"#fff",color:"#111",boxSizing:"border-box",outline:"none",fontFamily:"inherit"}} value={recvBy} onChange={e=>setRecvBy(e.target.value)} placeholder="Your name"/>
          </div>

          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setRecvModal(null)} style={{flex:1,padding:14,borderRadius:10,border:"1px solid #d1d5db",background:"#fff",color:"#6b7280",fontWeight:700,fontSize:14,cursor:"pointer"}}>Cancel</button>
            <button onClick={confirmReceive} style={{flex:2,padding:14,borderRadius:10,border:"none",background:"linear-gradient(135deg,#8b5cf6,#7c3aed)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>{"\u2713"} Confirm Received</button>
          </div>
        </div>
      </div>}
    </div>);
}
