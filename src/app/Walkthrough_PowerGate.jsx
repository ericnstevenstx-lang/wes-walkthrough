"use client";
import CompPanel from "./CompPanel";
import { useState, useEffect, useCallback, useRef } from "react";

/* -- Logo Components ------------------------------------- */
const LogoMark = ({ size = 32, color = "#58815a" }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 212 191" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M113.977 155.659C106.789 156.563 99.7953 156.218 93.1887 154.777C92.0481 154.518 91.4671 153.227 92.0266 152.194L98.0737 141.134C98.418 140.489 99.1497 140.144 99.8814 140.23C101.904 140.51 103.992 140.661 106.101 140.661C131.236 140.661 151.702 120.197 151.702 95.0634C151.702 89.813 150.798 84.7562 149.162 80.0652L124.5 125.34C124.199 125.899 123.618 126.222 122.994 126.222H109.243C107.951 126.222 107.134 124.845 107.736 123.704L116.28 108.039C116.602 107.436 116.172 106.726 115.483 106.726H90.1328C89.724 106.726 89.3581 106.942 89.1645 107.307L77.2209 129.234L70.313 141.801C69.7534 142.834 68.3762 143.135 67.4508 142.382C52.4083 130.052 43.3054 110.664 45.2637 89.2965C47.9752 59.9887 71.8839 36.4692 101.237 34.1883C109.587 33.5427 117.614 34.5756 125.038 37.0071C126.286 37.416 126.824 38.8792 126.2 40.0412L120.67 50.1118C120.196 50.994 119.185 51.3814 118.216 51.1231C111.61 49.2941 104.422 48.9068 96.9762 50.3915C78.0601 54.1572 63.3835 69.8871 60.8872 89.0168C59.553 99.2595 61.6619 108.964 66.2026 117.141L93.3824 67.2403C93.5976 66.8315 94.0495 66.5732 94.5014 66.5732H109.221C110.189 66.5732 110.814 67.6061 110.34 68.4669L98.8269 89.6193C98.418 90.3509 98.956 91.2332 99.7953 91.2332H124.931C125.253 91.2332 125.555 91.061 125.727 90.7598L139.995 64.5721L139.952 64.529L146.903 51.7687C147.29 51.0586 148.258 50.9079 148.839 51.4674C161.386 63.7544 168.681 81.3993 166.959 100.658C164.441 128.933 142.19 152.108 114.02 155.659H113.977Z" fill={color}/>
  </svg>
);

const SplashScreen = ({ onDone }) => {
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    requestAnimationFrame(() => setOpacity(1));
    const fade = setTimeout(() => setOpacity(0), 2200);
    const done = setTimeout(onDone, 2800);
    return () => { clearTimeout(fade); clearTimeout(done); };
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity, transition: "opacity 0.6s ease",
    }}>
      <LogoMark size={120} />
      <div style={{ marginTop: 20, fontSize: 32, fontWeight: 800, letterSpacing: 6, color: "#565756", fontFamily: "-apple-system,system-ui,sans-serif" }}>
        HARDIN
      </div>
      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, letterSpacing: 4, color: "#58815a" }}>
        POWER GROUP
      </div>
      <div style={{ marginTop: 32, fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: 2 }}>
        POWERGATE
      </div>
    </div>
  );
};

/* -- Supabase -------------------------------------------- */
const SB="https://ulyycjtrshpsjpvbztkr.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXljanRyc2hwc2pwdmJ6dGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzg1NzAsImV4cCI6MjA5MDcxNDU3MH0.UYwCdYrdy20xl_hCkO8t4CAB16vBHj-oMdflDv1XlVE";
const H={apikey:SK,Authorization:`Bearer ${SK}`,"Content-Type":"application/json",Prefer:"return=representation"};
let loc=false;
async function dbF(p,o={}){const r=await fetch(`${SB}/rest/v1/${p}`,{...o,headers:{...H,...(o.headers||{})}});if(!r.ok)throw new Error(`${r.status}`);const t=await r.text();return t?JSON.parse(t):null;}
async function hpgF(p,o={}){const isWrite=o.method&&o.method!=="GET";const profKey=isWrite?"Content-Profile":"Accept-Profile";return dbF(p,{...o,headers:{...(o.headers||{}),[profKey]:"hpg"}});}
async function sG(k){try{if(typeof window!=="undefined"&&window.storage){const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}}catch{}return null;}
async function sS(k,v){try{if(typeof window!=="undefined"&&window.storage)await window.storage.set(k,JSON.stringify(v));}catch{}}

/* -- Constants ------------------------------------------- */
const EQ=["Switchgear","Panelboard","Transformer","Circuit Breaker","Motor Control Center (MCC)","Bus Duct","Disconnect Switch","UPS System","PDU","RPP (Remote Power Panel)","ATS / Transfer Switch","VFD / Drive","Motor Starter","Control Transformer","Trip Unit","Relay","CT / PT","Meter","Bin Breaker","Mounting Kit","Gasket","Bus Bar","Wire","Inner","Nuts and Bolts","Other"];
const BULK_TYPES=new Set(["Bin Breaker","Mounting Kit","Gasket","Bus Bar","Wire","Inner","Nuts and Bolts"]);
const ENUM_PARENT_TYPES=new Set(["Motor Control Center (MCC)","Switchgear","Panelboard"]);
const MFR=["Eaton / Cutler-Hammer","Siemens","Square D / Schneider","ABB","GE","Westinghouse","ITE","Federal Pacific","Allen-Bradley / Rockwell","Mitsubishi","Yaskawa","Danfoss","Liebert / Vertiv","APC / Schneider","ABL Sursum","Other"];
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
const newInvId=()=>`INV-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2,5)}`;

/* -- Styles ----------------------------------------------- */
const inp={width:"100%",padding:"12px 14px",border:"1.5px solid #d1d5db",borderRadius:10,fontSize:16,background:"#fff",color:"#111",boxSizing:"border-box",outline:"none",fontFamily:"inherit",WebkitAppearance:"none"};
const inpE={...inp,borderColor:"#ef4444"};
const inpSm={...inp,fontSize:14,padding:"10px 12px"};
const lbl={display:"block",fontSize:13,fontWeight:700,color:"#475569",marginBottom:4};
const card={background:"#fff",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"};

/* -- Collapsible section -- */
function Section({title,children,badge,defaultOpen=false,color="#475569"}){
  const [open,setOpen]=useState(defaultOpen);
  return(<div style={{marginBottom:8}}>
    <button onClick={()=>setOpen(!open)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid #e5e7eb",background:open?"#f8fafc":"#fff",cursor:"pointer",fontFamily:"inherit"}}>
      <span style={{fontSize:11,fontWeight:700,color}}>{open?"v":">"} {title}{badge?` (${badge})`:""}</span>
    </button>
    {open&&<div style={{padding:"8px 0 0"}}>{children}</div>}
  </div>);
}

/* -- Photo compression ----------------------------------- */
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

/* -- Barcode Scanner ------------------------------------ */
function BarcodeScanner({onScan,onClose,label}){
  const videoRef=useRef(null);
  const containerRef=useRef(null);
  const [err,setErr]=useState(null);
  const [ready,setReady]=useState(false);
  const [useQuagga,setUseQuagga]=useState(false);

  useEffect(()=>{
    let stream=null,animId=null,quaggaOn=false;
    const cleanup=()=>{
      if(stream)stream.getTracks().forEach(t=>t.stop());
      if(animId)cancelAnimationFrame(animId);
      if(quaggaOn&&window.Quagga){try{window.Quagga.stop();window.Quagga.offDetected();}catch{}}
    };

    if(typeof BarcodeDetector!=="undefined"){
      const det=new BarcodeDetector({formats:["code_128","code_39","ean_13","ean_8","qr_code","upc_a","upc_e","codabar","itf","data_matrix"]});
      (async()=>{
        try{
          stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1920},height:{ideal:1080}}});
          if(videoRef.current){videoRef.current.srcObject=stream;setReady(true);}
          const scan=async()=>{
            if(!videoRef.current||videoRef.current.readyState<2){animId=requestAnimationFrame(scan);return;}
            try{const r=await det.detect(videoRef.current);if(r.length>0){onScan(r[0].rawValue);cleanup();return;}}catch{}
            animId=requestAnimationFrame(scan);
          };
          scan();
        }catch{setErr("Camera access denied. Enter manually.");}
      })();
    }else{
      setUseQuagga(true);
      (async()=>{
        try{
          if(!window.Quagga){
            await new Promise((res,rej)=>{
              const s=document.createElement("script");
              s.src="https://cdn.jsdelivr.net/npm/@ericblade/quagga2/lib/quagga.min.js";
              s.onload=res;s.onerror=rej;
              document.head.appendChild(s);
            });
          }
          await new Promise((res,rej)=>{
            window.Quagga.init({
              inputStream:{type:"LiveStream",target:containerRef.current,
                constraints:{facingMode:"environment",width:1280,height:720}},
              decoder:{readers:["code_128_reader","code_39_reader","ean_reader","upc_reader","upc_e_reader","codabar_reader"]},
              locate:true,
            },e=>e?rej(e):res());
          });
          quaggaOn=true;
          window.Quagga.start();
          setReady(true);
          window.Quagga.onDetected(r=>{
            const code=r?.codeResult?.code;
            if(code){onScan(code);cleanup();}
          });
        }catch(e){setErr("Scanner unavailable. Enter location manually.");}
      })();
    }
    return cleanup;
  },[]);

  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.92)",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{color:"#fff",fontSize:14,fontWeight:700,marginBottom:8}}>{label||"Scan Barcode"}</div>
      <div style={{color:"#94a3b8",fontSize:11,marginBottom:12}}>Code 39 . Code 128 . UCC-128 . EAN . QR</div>
      {err
        ?<div style={{color:"#fca5a5",fontSize:13,padding:20,textAlign:"center"}}>{err}</div>
        :useQuagga
          ?<div ref={containerRef} style={{width:"90%",maxWidth:400,borderRadius:12,overflow:"hidden",border:"3px solid #2563eb",minHeight:200,background:"#000"}}/>
          :<video ref={videoRef} autoPlay playsInline muted style={{width:"90%",maxWidth:400,borderRadius:12,border:"3px solid #2563eb"}}/>
      }
      {!ready&&!err&&<div style={{color:"#94a3b8",fontSize:12,marginTop:12}}>Starting camera...</div>}
      <div style={{marginTop:16}}>
        <button onClick={onClose} style={{padding:"12px 28px",borderRadius:8,border:"none",background:"#dc2626",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>
  );
}

/* -- Scan Input -------- */
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
  const [showSplash,setShowSplash]=useState(true);
  const [view,setView]=useState("jobs");
  const [mode,setMode]=useState("walkthrough");
  const [jobs,setJobs]=useState([]);
  const [ld,setLd]=useState(false);
  const [sv,setSv]=useState(false);
  const [scanning,setScanning]=useState(false);
  const [scanImg,setScanImg]=useState(null);
  const [catalogScanIdx,setCatalogScanIdx]=useState(null);
  const [msg,setMsg]=useState(null);
  const [expId,setExpId]=useState(null);
  const [priceBook,setPriceBook]=useState([]);
  const [weights,setWeights]=useState([]);
  const [scrapPrices,setScrapPrices]=useState(null);
  const [expandedItems,setExpandedItems]=useState({});
  const toggleItem=(i)=>setExpandedItems(p=>({...p,[i]:!p[i]}));

  const [inv,setInv]=useState([]);
  const [invLoading,setInvLoading]=useState(false);
  const [invSearch,setInvSearch]=useState("");
  const [invFilterType,setInvFilterType]=useState("");
  const [invFilterGrade,setInvFilterGrade]=useState("");
  const [invFilterLoc,setInvFilterLoc]=useState("");
  const [invSort,setInvSort]=useState("date_desc");
  const [invExpId,setInvExpId]=useState(null);
  const [skids,setSkids]=useState([]);
  const [newSkidName,setNewSkidName]=useState("");

  const loadSkids=useCallback(async()=>{
    try{const data=await dbF("skid_builds?select=*&order=created_at.desc&limit=50");if(data)setSkids(data);}catch{}
  },[]);

  const createSkid=async(name)=>{
    const id=`SKD-${Date.now().toString(36).toUpperCase()}`;
    const num=name||`SKID-${(skids.length+1).toString().padStart(3,"0")}`;
    const row={id,skid_number:num,status:"building",build_date:today()};
    try{await dbF("skid_builds",{method:"POST",body:JSON.stringify(row)});setSkids(p=>[row,...p]);return id;}catch{return null;}
  };

  const loadInventory=useCallback(async()=>{
    setInvLoading(true);
    try{
      if(!loc){const data=await dbF("inventory_items?select=*&order=created_at.desc&limit=200");if(data)setInv(data);}
      else{const local=await sG("wes_inventory");if(local)setInv(local);}
    }catch{}
    setInvLoading(false);
  },[]);

  const [job,setJob]=useState({jobName:"",customerName:"",siteAddress:"",preparedBy:"",bidDate:today(),laborHours:"",laborRate:"75",transportCost:"",targetMargin:"45",notes:""});
  const [items,setItems]=useState([]);
  const [errs,setErrs]=useState({});

  const [qcPhase,setQcPhase]=useState("location");
  const [qcLocationCode,setQcLocationCode]=useState("");
  const [qcItem,setQcItem]=useState(null);
  const [qcSession,setQcSession]=useState([]);
  const qcFileRef=useRef(null);

  /* -- Decomm Enumeration state -- */
  const [enumComponents,setEnumComponents]=useState([]);
  const [enumParentObs,setEnumParentObs]=useState(null);
  const [enumPhoto,setEnumPhoto]=useState(null);
  const [enumLastTraveler,setEnumLastTraveler]=useState(null);
  const enumFileRef=useRef(null);

  useEffect(()=>{(async()=>{
    try{if(!loc){
      const[pb,wt]=await Promise.all([dbF("price_book?select=*"),dbF("equipment_weights?select=*")]);
      if(pb)setPriceBook(pb);if(wt)setWeights(wt);
    }}catch{loc=true;}
    try{const r=await fetch(`${SB}/functions/v1/scrap-pricing`);if(r.ok)setScrapPrices(await r.json());}catch{}
    try{const sk=await dbF("skid_builds?select=*&status=eq.building&order=created_at.desc");if(sk)setSkids(sk);}catch{}
  })();},[]);

  const loadJobs=useCallback(async()=>{
    setLd(true);
    try{if(!loc){const d=await dbF("bids?select=*,bid_line_items(*)&order=created_at.desc");if(d){setJobs(d.map(r=>({...r,items:r.bid_line_items||[]})));setLd(false);return;}}}catch{loc=true;}
    setJobs(await sG("wes_wt")||[]);setLd(false);
  },[]);
  useEffect(()=>{loadJobs();},[loadJobs]);

  const uf=(k,v)=>{setJob(p=>({...p,[k]:v}));if(errs[k])setErrs(p=>({...p,[k]:undefined}));};

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

  const handleScan=async(file,idx)=>{
    if(!file)return;setScanning(true);setMsg(null);
    try{
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=()=>rej();r.readAsDataURL(file);});
      setScanImg(`data:${file.type};base64,${b64}`);
      const resp=await fetch(`${SB}/functions/v1/scan-nameplate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image_base64:b64,media_type:file.type})});
      if(!resp.ok)throw new Error(`${resp.status}`);
      const p=await resp.json();if(p.error)throw new Error(p.error);
      const mfrMatch=MFR.find(m=>{
        if(!p.manufacturer)return false;
        const raw=p.manufacturer.toLowerCase().trim();
        const parts=m.toLowerCase().split(/[\/\s]+/);
        return parts.some(part=>part.length>2&&raw.includes(part))||raw.includes(m.toLowerCase());
      });
      const isTransformer=p.equipment_type&&p.equipment_type.toLowerCase().includes("transformer");
      const kva=p.kva_rating||(isTransformer?p.amperage_rating:null);
      const amps=isTransformer?null:(p.amperage_rating||null);
      const whv=p.winding_hv||null;
      const wlv=p.winding_lv||null;
      let winding=p.winding_material||null;
      if(!winding&&whv)winding=whv===wlv?whv:`${whv}/${wlv}`;
      const npWeight=p.weight_lbs?parseFloat(String(p.weight_lbs).replace(/[^0-9.]/g,"")):(p.core_coil_weight_lbs?parseFloat(String(p.core_coil_weight_lbs).replace(/[^0-9.]/g,"")):null);
      const cooling=p.cooling_class||null;
      const liquid=p.liquid_type||(cooling&&(cooling.startsWith("OA")||cooling.startsWith("O"))?"OIL":cooling&&(cooling.startsWith("AA")||cooling==="dry")?"DRY":null);

      setItems(prev=>prev.map((it,i)=>i===idx?{...it,
        serialNumber:p.serial_number||it.serialNumber,
        modelNumber:p.model_number||p.catalog_number||it.modelNumber,
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
        catalogNumber:p.catalog_number||p.model_number||it.catalogNumber,
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

  const addPhoto=async(file,idx)=>{
    if(!file)return;
    const compressed=await compressImage(file);
    let photoUrl=compressed;
    try{
      const blob=await(await fetch(compressed)).blob();
      const fname=`${Date.now()}_${Math.random().toString(36).slice(2,8)}.jpg`;
      const upResp=await fetch(`${SB}/storage/v1/object/item-photos/${fname}`,{method:"POST",headers:{apikey:SK,Authorization:`Bearer ${SK}`,"Content-Type":"image/jpeg"},body:blob});
      if(upResp.ok)photoUrl=`${SB}/storage/v1/object/public/item-photos/${fname}`;
    }catch{}
    setItems(prev=>prev.map((it,i)=>i===idx?{...it,photos:[...(it.photos||[]),photoUrl]}:it));
  };

  const handleQuickScan=async(file)=>{
    if(!file)return;
    setQcPhase("analyzing");setMsg(null);
    try{
      const compressed=await compressImage(file);
      const b64=compressed.split(",")[1];
      let photoUrl=compressed;
      const upPromise=(async()=>{
        try{
          const blob=await(await fetch(compressed)).blob();
          const fname=`${Date.now()}_${Math.random().toString(36).slice(2,8)}.jpg`;
          const upResp=await fetch(`${SB}/storage/v1/object/item-photos/${fname}`,{method:"POST",headers:{apikey:SK,Authorization:`Bearer ${SK}`,"Content-Type":"image/jpeg"},body:blob});
          if(upResp.ok)photoUrl=`${SB}/storage/v1/object/public/item-photos/${fname}`;
        }catch{}
      })();
      const resp=await fetch(`${SB}/functions/v1/scan-nameplate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image_base64:b64,media_type:"image/jpeg"})});
      if(!resp.ok)throw new Error(`AI ${resp.status}`);
      const p=await resp.json();
      if(p.error)throw new Error(p.error);
      await upPromise;
      const mfrMatch=MFR.find(m=>{
        if(!p.manufacturer)return false;
        const raw=p.manufacturer.toLowerCase().trim();
        const parts=m.toLowerCase().split(/[\/\s]+/);
        return parts.some(part=>part.length>2&&raw.includes(part))||raw.includes(m.toLowerCase());
      });
      const eqMatch=EQ.find(t=>p.equipment_type&&t.toLowerCase().includes(p.equipment_type.toLowerCase()))||EQ.find(t=>p.equipment_type&&p.equipment_type.toLowerCase().includes(t.toLowerCase()));
      setQcItem({
        photo:photoUrl,
        equipmentType:eqMatch||"",
        manufacturer:mfrMatch||p.manufacturer||"",
        modelNumber:p.model_number||p.catalog_number||"",
        catalogNumber:p.catalog_number||p.model_number||"",
        serialNumber:p.serial_number||"",
        voltageRating:p.voltage_rating||"",
        amperageRating:p.amperage_rating||"",
        kvaRating:p.kva_rating||"",
        phase:p.phase?String(p.phase).replace(/[^0-9]/g,""):"3",
        yearMfg:p.year_manufactured||"",
        grade:"C",
        qty:parseInt(p.quantity_visible)||1,
        bulkOverride:null,
        _ai:p,
      });
      setQcPhase("review");
    }catch(e){
      setMsg({t:"error",m:"Scan failed: "+e.message+". Try again or skip to manual entry."});
      setQcPhase("capture");
    }
  };

  const handleQuickReceive=async(then)=>{
    if(!qcItem){setMsg({t:"error",m:"No item to save"});return;}
    if(mode==="quick"&&!qcLocationCode.trim()){setMsg({t:"error",m:"Set location first"});setQcPhase("location");return;}
    if(mode==="receive"&&!job.preparedBy.trim()){setMsg({t:"error",m:"Received By required"});setQcPhase("location");return;}
    if(!qcItem.equipmentType){setMsg({t:"error",m:"Pick an equipment type"});return;}
    setQcPhase("saving");
    try{
      const invId=newInvId();
      const isBulk=qcItem.bulkOverride!==null?qcItem.bulkOverride:BULK_TYPES.has(qcItem.equipmentType);
      const sn=(qcItem.serialNumber||"").trim();
      const p=qcItem._ai||{};
      const invRow={
        id:invId,tracking_mode:isBulk?"quantity":"serialized",
        qty:isBulk?(parseInt(qcItem.qty)||1):1,
        serial_number:isBulk?null:(sn||"UNKNOWN"),
        model_number:qcItem.modelNumber||null,catalog_number:qcItem.catalogNumber||null,
        manufacturer:qcItem.manufacturer||null,equipment_type:qcItem.equipmentType,
        voltage_rating:qcItem.voltageRating||null,amperage_rating:qcItem.amperageRating||null,
        grade:qcItem.grade||"C",location:"main_warehouse",
        location_detail:mode==="quick"?qcLocationCode.trim():null,
        customer_origin:mode==="receive"?(job.customerName||null):null,
        source_job_site:mode==="receive"?(job.jobName||null):null,
        status:"received",
        date_received:mode==="receive"?(job.bidDate||today()):today(),
        scanned_by:mode==="receive"?(job.preparedBy||"receive"):"quick_capture",
        kva_rating:qcItem.kvaRating||null,phase:qcItem.phase||"3",
        year_manufactured:qcItem.yearMfg?parseInt(qcItem.yearMfg)||null:null,
        frame_size:p.frame_size||null,trip_rating:p.trip_rating||null,
        interrupting_rating:p.interrupting_rating||null,breaker_type:p.breaker_type||null,
        bus_rating:p.bus_rating||null,bil_kv:p.bil_kv||null,
        voltage_class:p.voltage_class||null,cooling_class:p.cooling_class||null,
        liquid_type:p.liquid_type||null,winding_hv:p.winding_hv||null,
        winding_lv:p.winding_lv||null,winding_material:p.winding_material||null,
        received_verified:true,
        verified_by:mode==="receive"?(job.preparedBy||"receive"):"quick_capture",
        verified_date:mode==="receive"?(job.bidDate||today()):today(),
      };
      let ok=false;
      if(!loc){try{
        await dbF("inventory_items",{method:"POST",body:JSON.stringify(invRow)});
        if(qcItem.photo&&qcItem.photo.startsWith(SB)){try{
          await dbF("item_photos",{method:"POST",body:JSON.stringify({reference_id:invId,reference_type:"inventory_item",photo_url:qcItem.photo,photo_role:"nameplate",is_ebay_ready:false})});
        }catch{}}
        ok=true;
      }catch{loc=true;}}
      if(!ok){const stored=await sG("wes_inv")||[];await sS("wes_inv",[{...invRow,_photo:qcItem.photo,created_at:new Date().toISOString()},...stored]);}
      setQcSession(prev=>[...prev,{...invRow,_photo:qcItem.photo}]);
      setQcItem(null);
      setMsg({t:"success",m:`Saved. ${qcSession.length+1} captured this session.`});
      if(then==="finish"){setQcPhase("location");setQcSession([]);setView("inventory");loadInventory();}
      else{setQcPhase("capture");setTimeout(()=>qcFileRef.current?.click(),100);}
    }catch(e){setMsg({t:"error",m:e.message});setQcPhase("review");}
  };

  /* === DECOMM ENUMERATION === */
  const startEnumerate=()=>{
    if(!qcItem)return;
    if(mode==="quick"&&!qcLocationCode.trim()){setMsg({t:"error",m:"Set location first"});setQcPhase("location");return;}
    if(mode==="receive"&&!job.preparedBy.trim()){setMsg({t:"error",m:"Received By required"});setQcPhase("location");return;}
    setEnumComponents([]);setEnumParentObs(null);setEnumPhoto(null);
    setQcPhase("enumerate_capture");
    setTimeout(()=>enumFileRef.current?.click(),100);
  };

  const handleEnumerateCapture=async(file)=>{
    if(!file)return;
    setQcPhase("enumerate_analyzing");setMsg(null);
    try{
      const compressed=await compressImage(file);
      const b64=compressed.split(",")[1];
      let photoUrl=compressed;
      const upPromise=(async()=>{
        try{
          const blob=await(await fetch(compressed)).blob();
          const fname=`${Date.now()}_${Math.random().toString(36).slice(2,8)}.jpg`;
          const upResp=await fetch(`${SB}/storage/v1/object/item-photos/${fname}`,{method:"POST",headers:{apikey:SK,Authorization:`Bearer ${SK}`,"Content-Type":"image/jpeg"},body:blob});
          if(upResp.ok)photoUrl=`${SB}/storage/v1/object/public/item-photos/${fname}`;
        }catch{}
      })();
      const resp=await fetch(`${SB}/functions/v1/scan-breaker-lineup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image_base64:b64,image_media_type:"image/jpeg"})});
      if(!resp.ok){const txt=await resp.text();throw new Error(`AI ${resp.status}: ${txt.slice(0,120)}`);}
      const p=await resp.json();
      if(p.error)throw new Error(p.error);
      await upPromise;
      setEnumPhoto(photoUrl);
      setEnumComponents((p.components||[]).map(c=>({
        position:c.position||"",
        equipment_type:c.equipment_type||"Circuit Breaker",
        manufacturer:c.manufacturer||"",
        model_or_type:c.model_or_type||"",
        amperage:c.amperage||"",
        poles:c.poles||"",
        voltage:c.voltage||"",
        notes:c.notes||"",
        grade:"C",
      })));
      setEnumParentObs(p.parent_observations||null);
      setQcPhase("enumerate_review");
    }catch(e){
      setMsg({t:"error",m:"Enumeration scan failed: "+e.message});
      setQcPhase("enumerate_capture");
    }
  };

  const addEnumComponent=()=>setEnumComponents(p=>[...p,{position:String(p.length+1),equipment_type:"Circuit Breaker",manufacturer:"",model_or_type:"",amperage:"",poles:"",voltage:"",notes:"",grade:"C"}]);
  const rmEnumComponent=(i)=>setEnumComponents(p=>p.filter((_,j)=>j!==i));
  const uEnumComponent=(i,f,v)=>setEnumComponents(p=>p.map((c,j)=>j===i?{...c,[f]:v}:c));

  const handleEnumerateSave=async()=>{
    if(!qcItem){setMsg({t:"error",m:"No parent item"});return;}
    if(enumComponents.length===0){setMsg({t:"error",m:"No components to save. Add at least one or cancel."});return;}
    setQcPhase("enumerate_saving");
    try{
      const parentId=newInvId();
      const sn=(qcItem.serialNumber||"").trim();
      const p=qcItem._ai||{};
      const obs=enumParentObs||{};
      const issuedByLabel=mode==="receive"?(job.preparedBy||"receive"):"quick_capture";
      const parentRow={
        id:parentId,tracking_mode:"serialized",qty:1,
        serial_number:sn||"UNKNOWN",
        model_number:qcItem.modelNumber||null,catalog_number:qcItem.catalogNumber||null,
        manufacturer:qcItem.manufacturer||null,equipment_type:qcItem.equipmentType,
        voltage_rating:qcItem.voltageRating||null,amperage_rating:qcItem.amperageRating||null,
        grade:qcItem.grade||"C",location:"main_warehouse",
        location_detail:mode==="quick"?qcLocationCode.trim():null,
        customer_origin:mode==="receive"?(job.customerName||null):null,
        source_job_site:mode==="receive"?(job.jobName||null):null,
        status:"received",physical_state:"on_shelf",parent_id:null,
        date_received:mode==="receive"?(job.bidDate||today()):today(),
        scanned_by:issuedByLabel,
        kva_rating:qcItem.kvaRating||null,phase:qcItem.phase||"3",
        year_manufactured:qcItem.yearMfg?parseInt(qcItem.yearMfg)||null:null,
        bus_rating:obs.bus_rating||p.bus_rating||null,
        voltage_class:obs.voltage_class||p.voltage_class||null,
        num_sections:obs.visible_sections?(parseInt(String(obs.visible_sections).replace(/\D/g,""))||null):(p.num_sections||null),
        received_verified:true,verified_by:issuedByLabel,
        verified_date:mode==="receive"?(job.bidDate||today()):today(),
      };
      await dbF("inventory_items",{method:"POST",body:JSON.stringify(parentRow)});

      if(qcItem.photo&&qcItem.photo.startsWith(SB)){try{
        await dbF("item_photos",{method:"POST",body:JSON.stringify({reference_id:parentId,reference_type:"inventory_item",photo_url:qcItem.photo,photo_role:"nameplate",is_ebay_ready:false})});
      }catch{}}
      if(enumPhoto&&enumPhoto.startsWith(SB)){try{
        await dbF("item_photos",{method:"POST",body:JSON.stringify({reference_id:parentId,reference_type:"inventory_item",photo_url:enumPhoto,photo_role:"lineup",is_ebay_ready:false})});
      }catch{}}

      const childRows=enumComponents.map((c,idx)=>{
        const cid=`INV-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2,5)}${idx.toString(36)}`;
        return {
          id:cid,tracking_mode:"serialized",qty:1,serial_number:"UNKNOWN",
          equipment_type:c.equipment_type||"Circuit Breaker",
          manufacturer:c.manufacturer||null,
          model_number:c.model_or_type||null,catalog_number:c.model_or_type||null,
          amperage_rating:c.amperage||null,voltage_rating:c.voltage||null,
          grade:c.grade||"C",location:"main_warehouse",
          location_detail:`${parentId}${c.position?` Pos ${c.position}`:""}`,
          status:"pending_decomm",physical_state:"in_parent",
          parent_id:parentId,position_in_parent:c.position||null,expected_qty:1,
          date_received:parentRow.date_received,scanned_by:issuedByLabel,
          condition_notes:c.notes||null,
        };
      });
      if(childRows.length>0)await dbF("inventory_items",{method:"POST",body:JSON.stringify(childRows)});

      const tnResp=await hpgF("rpc/next_decomm_traveler_number",{method:"POST",body:JSON.stringify({})});
      const travelerNumber=typeof tnResp==="string"?tnResp:(Array.isArray(tnResp)?tnResp[0]:String(tnResp));

      const travelerId=`DT-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2,5)}`;
      const travelerRow={
        id:travelerId,traveler_number:travelerNumber,
        parent_inventory_id:parentId,status:"dispatched_to_deman",
        dispatched_at:new Date().toISOString(),
        notes:`Issued by ${issuedByLabel} via PowerGate ${mode}`,
      };
      await hpgF("decomm_travelers",{method:"POST",body:JSON.stringify(travelerRow)});

      const lineRows=childRows.map((cr,idx)=>({
        id:`DTL-${Date.now().toString(36).toUpperCase()}${idx.toString(36)}${Math.random().toString(36).slice(2,4)}`,
        traveler_id:travelerId,child_inventory_id:cr.id,line_number:idx+1,
        expected_equipment_type:cr.equipment_type,
        expected_manufacturer:cr.manufacturer,
        expected_model:cr.model_number,expected_catalog:cr.catalog_number,
        expected_amperage:cr.amperage_rating,expected_voltage:cr.voltage_rating,
        expected_position:cr.position_in_parent,
        extraction_status:"pending",notes:cr.condition_notes,
      }));
      if(lineRows.length>0)await hpgF("decomm_traveler_lines",{method:"POST",body:JSON.stringify(lineRows)});

      setQcSession(prev=>[...prev,{...parentRow,_photo:qcItem.photo,_traveler:travelerNumber,_componentCount:childRows.length}]);
      setEnumLastTraveler({id:travelerId,number:travelerNumber,parentId,parentRow,childRows});
      setQcItem(null);setEnumComponents([]);setEnumPhoto(null);setEnumParentObs(null);
      setMsg({t:"success",m:`${travelerNumber} created with ${childRows.length} component${childRows.length===1?"":"s"}`});
      setQcPhase("enumerate_success");
    }catch(e){
      setMsg({t:"error",m:"Save failed: "+e.message});
      setQcPhase("enumerate_review");
    }
  };

  const printTraveler=(t)=>{
    if(!t){setMsg({t:"error",m:"No traveler to print"});return;}
    const dt=new Date().toLocaleString();
    const issuedBy=mode==="receive"?(job.preparedBy||"-"):"Quick Capture";
    const parent=t.parentRow||{};
    const parentBits=[parent.id,parent.equipment_type,parent.manufacturer,parent.model_number,parent.bus_rating?parent.bus_rating+"A bus":"",parent.voltage_class].filter(Boolean).join(" . ");
    const esc=(s)=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const rows=(t.childRows||[]).map((c,i)=>`<tr>
      <td><div class="cbox"></div></td>
      <td>${esc(c.position_in_parent||i+1)}</td>
      <td>${esc(c.amperage_rating?c.amperage_rating+"A":"-")}</td>
      <td>${esc(c.manufacturer||"")} ${esc(c.model_number||"")}</td>
      <td>${esc(c.equipment_type||"")}</td>
      <td>${esc(c.voltage_rating||"-")}</td>
      <td>${esc(c.condition_notes||"")}</td>
    </tr>`).join("");
    const html=`<!doctype html><html><head><title>HPG ${esc(t.number)}</title>
<style>
@page{size:letter;margin:0.5in}
body{font-family:-apple-system,Segoe UI,sans-serif;color:#111;font-size:11px}
h1{font-size:18px;margin:0 0 4px 0}
.sub{color:#666;margin-bottom:10px;font-size:11px}
.num{font-size:24px;font-weight:800;letter-spacing:2px;margin:6px 0 14px 0;color:#7c3aed}
.meta{background:#f5f5f5;padding:10px;border-radius:6px;margin-bottom:14px;font-size:11px;display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}
.parent{background:#fef3c7;padding:10px;border-radius:6px;margin-bottom:14px;font-size:12px;font-weight:600}
table{width:100%;border-collapse:collapse;margin-top:6px}
th{background:#1e293b;color:#fff;text-align:left;padding:6px 8px;font-size:10px;letter-spacing:0.5px}
td{padding:8px;border-bottom:1px solid #ccc;font-size:11px;vertical-align:top}
.cbox{width:18px;height:18px;border:2px solid #000;display:inline-block}
tr:nth-child(even){background:#fafafa}
.timing{margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:11px}
.timing div{border-top:1px solid #000;padding-top:4px;margin-top:36px}
.footer{margin-top:24px;font-size:10px;color:#666}
</style></head><body>
<h1>HARDIN POWERGATE</h1>
<div class="sub">DECOMM TRAVELER . Printed ${esc(dt)}</div>
<div class="num">${esc(t.number)}</div>
<div class="meta">
  <div><strong>Issued:</strong> ${esc(today())}</div>
  <div><strong>Issued by:</strong> ${esc(issuedBy)}</div>
  <div><strong>Status:</strong> Dispatched to Deman</div>
  <div><strong>Components:</strong> ${(t.childRows||[]).length}</div>
</div>
<div class="parent"><strong>PARENT ASSEMBLY:</strong> ${esc(parentBits)}</div>
<table>
  <thead><tr><th>Pulled</th><th>Pos</th><th>Amp</th><th>Mfr / Model</th><th>Type</th><th>V</th><th>Notes</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="timing">
  <div>Deman started ___ / ___ / ____  ____:____</div>
  <div>Deman finished ___ / ___ / ____  ____:____</div>
</div>
<div class="footer">Signature: _____________________________________   Date: __________</div>
<script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
</body></html>`;
    const w=window.open("","_blank","width=900,height=1200");
    if(!w){setMsg({t:"error",m:"Popup blocked. Allow popups for this site."});return;}
    w.document.open();w.document.write(html);w.document.close();
  };

  const printSessionSummary=()=>{
    if(!qcSession.length){setMsg({t:"error",m:"Nothing to print yet"});return;}
    const dt=new Date().toLocaleString();
    const isReceive=mode==="receive";
    const header=isReceive
      ? `<div class="meta"><div><strong>Source:</strong> ${job.customerName||"(no source)"}</div><div><strong>PO/Ref:</strong> ${job.jobName||"-"}</div><div><strong>Received by:</strong> ${job.preparedBy||"-"}</div><div><strong>Date:</strong> ${job.bidDate||today()}</div></div>`
      : `<div class="meta"><div><strong>Location code:</strong> ${qcLocationCode}</div><div><strong>Walked by:</strong> Quick Capture</div><div><strong>Date:</strong> ${today()}</div></div>`;
    const title=isReceive?"DOCK RECEIPT":"YARD CAPTURE";
    const rows=qcSession.map((r,i)=>{
      const photoCell=r._photo?`<img src="${r._photo}" alt="" style="max-width:120px;max-height:120px;object-fit:cover;border:1px solid #ddd"/>`:"<span style='color:#999'>no photo</span>";
      const idLabel=r.tracking_mode==="quantity"?`Qty ${r.qty}`:`S/N: ${r.serial_number||"UNKNOWN"}`;
      const travelerNote=r._traveler?`<br/><span style="display:inline-block;margin-top:3px;padding:1px 6px;background:#ede9fe;color:#7c3aed;font-weight:700;font-size:10px;border-radius:4px">Traveler ${r._traveler} . ${r._componentCount} comp${r._componentCount===1?"":"s"}</span>`:"";
      return `<tr><td>${i+1}</td><td>${photoCell}</td><td><strong>${r.id}</strong><br/><small>${r.equipment_type||""}</small>${travelerNote}</td><td>${r.manufacturer||"-"}<br/><small>${r.model_number||r.catalog_number||""}</small></td><td>${r.amperage_rating?r.amperage_rating+"A":""}${r.voltage_rating?" / "+r.voltage_rating+"V":""}${r.kva_rating?" / "+r.kva_rating+"KVA":""}</td><td>${r.grade||"C"}</td><td>${idLabel}</td></tr>`;
    }).join("");
    const html=`<!doctype html><html><head><title>HPG ${title} ${dt}</title>
<style>
@page{size:letter;margin:0.5in}
body{font-family:-apple-system,Segoe UI,sans-serif;color:#111;font-size:11px}
h1{font-size:18px;margin:0 0 4px 0}
.sub{color:#666;margin-bottom:12px;font-size:11px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;background:#f5f5f5;padding:10px;border-radius:6px;margin-bottom:14px;font-size:11px}
table{width:100%;border-collapse:collapse}
th{background:#1e293b;color:#fff;text-align:left;padding:6px 8px;font-size:10px;letter-spacing:0.5px}
td{padding:6px 8px;border-bottom:1px solid #ddd;vertical-align:top;font-size:11px}
td img{display:block}
tr:nth-child(even){background:#fafafa}
.footer{margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:11px}
.sig{border-top:1px solid #000;padding-top:4px;margin-top:48px}
.total{font-size:14px;margin:8px 0;font-weight:700}
</style></head><body>
<h1>HARDIN POWERGATE</h1>
<div class="sub">${title} . Printed ${dt}</div>
${header}
<div class="total">${qcSession.length} item${qcSession.length===1?"":"s"}</div>
<table><thead><tr><th>#</th><th>Photo</th><th>INV / Type</th><th>Mfr / Model</th><th>Ratings</th><th>Grade</th><th>Track</th></tr></thead><tbody>${rows}</tbody></table>
<div class="footer"><div><div class="sig">Receiver signature</div></div><div><div class="sig">Supervisor signature</div></div></div>
<script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
</body></html>`;
    const w=window.open("","_blank","width=900,height=1200");
    if(!w){setMsg({t:"error",m:"Popup blocked. Allow popups for this site."});return;}
    w.document.open();w.document.write(html);w.document.close();
  };

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
    barcodeSku:"",putawayLocation:"",putawayQty:1,skidId:"",
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

  const addMissing=(idx)=>setItems(p=>p.map((it,i)=>i===idx?{...it,missing:[...(it.missing||[]),{type:"",desc:"",qty:1}]}:it));
  const rmMissing=(idx,mi)=>setItems(p=>p.map((it,i)=>i===idx?{...it,missing:it.missing.filter((_,j)=>j!==mi)}:it));
  const uMissing=(idx,mi,f,v)=>setItems(p=>p.map((it,i)=>i===idx?{...it,missing:it.missing.map((m,j)=>j===mi?{...m,[f]:v}:m)}:it));

  const addBreaker=(idx)=>setItems(p=>p.map((it,i)=>i===idx?{...it,breakers:[...(it.breakers||[]),{amp:"20",count:1,poles:"1",grade:"B",oem:"oem",pitting:false,contactWear:false,notes:""}]}:it));
  const rmBreaker=(idx,bi)=>setItems(p=>p.map((it,i)=>i===idx?{...it,breakers:it.breakers.filter((_,j)=>j!==bi)}:it));
  const uBreaker=(idx,bi,f,v)=>setItems(p=>p.map((it,i)=>i===idx?{...it,breakers:it.breakers.map((b,j)=>j===bi?{...b,[f]:v}:b)}:it));

  const fetchEbay=async(idx)=>{
    const item=items[idx];
    let q="";
    const cat=item.catalogNumber||"";
    const mfr=item.manufacturer||"";
    const typ=item.equipmentType||"";
    const isXfmr=typ.toLowerCase().includes("transformer");
    const isBkr=typ.toLowerCase().includes("breaker")||typ.toLowerCase().includes("disconnect");
    if(cat){q=cat;}
    else if(isXfmr){q=`${mfr} ${item.kvaRating?item.kvaRating+"KVA":""} transformer ${item.voltageRating||""}`.trim();}
    else if(isBkr){q=`${mfr} ${item.frameSize?item.frameSize+"A frame":""}${item.amperageRating?item.amperageRating+"A":""} ${item.interruptRating?item.interruptRating+"kAIC":""} circuit breaker`.trim();}
    else{q=`${mfr} ${typ} ${item.amperageRating?item.amperageRating+"A":""} ${item.voltageRating?item.voltageRating+"V":""}`.trim();}
    q=q.replace(/\s+/g," ").trim();
    if(!q){setMsg({t:"error",m:"Need type/mfr/amps to search"});return;}
    setMsg({t:"info",m:`Searching: "${q}"`});
    try{const r=await fetch(`${SB}/functions/v1/ebay-comps`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})});
      const d=await r.json();
      if(d.stats){uItem(idx,"ebayCompAvg",Math.round(d.stats.avg*100)/100);
        if(items[idx].disposition!=="scrap"&&d.stats.avg>0)uItem(idx,"estimatedResale",Math.round(d.stats.avg*100)/100);
        setMsg({t:"success",m:`${d.stats.count} comps for "${q}". Avg: $${d.stats.avg.toFixed(0)} | Low: $${d.stats.low.toFixed(0)} | High: $${d.stats.high.toFixed(0)}`});
      }else{setMsg({t:"error",m:d.message||d.error||"No results for: "+q});}
    }catch(e){setMsg({t:"error",m:"eBay failed: "+e.message});}
  };

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

  const buildWhatsAppMsg=(j,its)=>{
    let msg=`*HARDIN POWERGATE ${mode==="walkthrough"?"WALKTHROUGH":"PICKUP"} REPORT*\n`;
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
    msg+=`*SUMMARY:*\nCOGS: $${totalCOGS.toFixed(0)}\nRevenue: $${totalRevenue.toFixed(0)}\nMargin: ${marginPct.toFixed(1)}%\n`;
    return msg;
  };

  const sendWhatsApp=(phone)=>{
    const text=buildWhatsAppMsg(job,items);
    const url=phone?`https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(text)}`:`https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url,"_blank");
  };

  const validate=()=>{
    const e={};
    if(mode==="receive"){if(!job.preparedBy?.trim())e.preparedBy="Required";}
    else{if(!job.jobName.trim())e.jobName="Required";if(!job.customerName.trim())e.customerName="Required";}
    if(items.length===0)e.items="Add at least one item";
    setErrs(e);return Object.keys(e).length===0;
  };

  const handleReceive=async()=>{
    if(!validate())return;
    setSv(true);setMsg(null);
    try{
      for(const it of items){
        const invId=newInvId();
        const bkrs=it.breakers||[];
        const bkrCount=bkrs.reduce((a,b)=>a+(b.count||0),0);
        const bkrDetail=bkrs.map(b=>`${b.count}x ${b.amp}A ${b.poles}P ${b.grade} ${b.oem}${b.pitting?" PITTING":""}${b.contactWear?" WEAR":""}`).join("; ");
        const isBulk=BULK_TYPES.has(it.equipmentType);
        const sn=(it.serialNumber||"").trim();
        const invRow={
          id:invId,tracking_mode:isBulk?"quantity":"serialized",
          qty:isBulk?(parseInt(it.quantity)||1):1,
          serial_number:isBulk?null:(sn||"UNKNOWN"),
          model_number:it.modelNumber||null,manufacturer:it.manufacturer||null,equipment_type:it.equipmentType,
          voltage_rating:it.voltageRating||null,amperage_rating:it.amperageRating||null,
          grade:it.grade,condition_notes:[it.conditionNotes,bkrDetail?`Breakers: ${bkrDetail}`:""].filter(Boolean).join(" | ")||null,
          location:it.destination||"main_warehouse",
          job_number:job.jobName||null,source_job_site:null,
          customer_origin:job.customerName||null,
          status:it.skidId?"staged_for_ship":"received",
          date_received:job.bidDate||today(),scanned_by:job.preparedBy||null,
          acquisition_cost:it.acquisitionCost?parseFloat(it.acquisitionCost):null,
          refurb_cost:it.refurbCost?parseFloat(it.refurbCost):null,
          total_cogs:((parseFloat(it.acquisitionCost)||0)+(parseFloat(it.refurbCost)||0))||null,
          asking_price:it.askingPrice?parseFloat(it.askingPrice):null,
          nema_rating:it.nemaRating||null,indoor_outdoor:it.indoorOutdoor||"indoor",
          year_manufactured:it.yearMfg?parseInt(it.yearMfg):null,
          phase:it.phase||"3",kva_rating:it.kvaRating||null,kva_forced:it.kvaForced||null,
          winding_material:it.windingMaterial||null,winding_hv:it.windingHv||null,winding_lv:it.windingLv||null,
          cooling_class:it.coolingClass||null,liquid_type:it.liquidType||null,
          nameplate_weight_lbs:it.nameplateWeight?parseFloat(it.nameplateWeight):null,
          interrupting_rating:it.interruptRating||null,
          frame_size:it.frameSize||null,trip_rating:it.tripRating||null,breaker_type:it.breakerType||null,trip_unit_type:it.tripUnitType||null,mounting_type:it.mountingType||null,catalog_number:it.catalogNumber||null,bus_rating:it.busRating||null,short_circuit_rating:it.shortCircuitRating||null,bil_kv:it.bilKv||null,voltage_class:it.voltageClass||null,num_sections:it.numSections?parseInt(it.numSections):null,bus_material:it.busMaterial||null,switchgear_type:it.switchgearType||null,
          barcode_sku:it.barcodeSku||null,putaway_location:it.putawayLocation||null,skid_id:it.skidId||null,
          received_verified:true,verified_by:job.preparedBy||null,verified_date:job.bidDate||today(),
        };
        let ok=false;
        if(!loc){try{
          await dbF("inventory_items",{method:"POST",body:JSON.stringify(invRow)});
          if(it.skidId){try{await dbF("skid_items",{method:"POST",body:JSON.stringify({skid_id:it.skidId,inventory_id:invId,sort_order:0})});}catch{}}
          if(bkrs.length>0){
            const subRows=bkrs.map((b,si)=>({inventory_id:invId,component_type:"Breaker",amp_rating:b.amp||null,poles:parseInt(b.poles)||1,quantity:b.count||1,grade:b.grade||"C",condition_notes:[b.pitting?"Pitting":"",b.contactWear?"Contact wear":""].filter(Boolean).join(", ")||null,is_present:true,salvageable:b.grade!=="D",origin_type:b.oem||"oem",sort_order:si}));
            await dbF("inventory_subcomponents",{method:"POST",body:JSON.stringify(subRows)});
          }
          const mc=(it.missing||[]).filter(m=>m.type);
          if(mc.length>0){
            const missRows=mc.map(m=>({inventory_id:invId,component_type:m.type,description:m.desc||null,quantity:m.qty||1,replacement_status:"needed"}));
            await dbF("inventory_missing_components",{method:"POST",body:JSON.stringify(missRows)});
          }
          ok=true;
        }catch{loc=true;}}
        if(!ok){const li={...invRow,missing:it.missing||[],subcomps:bkrs,created_at:new Date().toISOString()};const stored=await sG("wes_inv")||[];await sS("wes_inv",[li,...stored]);}
      }
      setItems([]);setScanImg(null);
      setMsg({t:"success",m:`${items.length} item${items.length>1?"s":""} added to inventory`});
      setView("jobs");
    }catch(e){setMsg({t:"error",m:e.message});}finally{setSv(false);}
  };

  const handleSubmit=async()=>{
    if(!validate())return;setSv(true);setMsg(null);
    const id=`WK-${Date.now().toString(36).toUpperCase()}`;
    const row={id,job_name:job.jobName,customer_name:job.customerName,site_address:job.siteAddress||null,bid_date:job.bidDate,prepared_by:job.preparedBy||null,status:"draft",mode,decom_labor_hours:parseFloat(job.laborHours)||null,labor_rate:parseFloat(job.laborRate)||null,total_labor_cost:laborCost||null,transport_cost:transportCost||null,total_acquisition_cost:totalCOGS||null,total_resale_value:totalResale||null,total_scrap_value:totalScrap||null,total_revenue:totalRevenue||null,total_cogs:totalCOGS||null,gross_margin_pct:Math.round(marginPct*100)/100,bid_amount:Math.max(0,totalCOGS)||null,target_margin_pct:targetMargin,notes:job.notes||null};
    const lineItems=items.map((it,i)=>{
      const bkrs=it.breakers||[];
      const bkrCount=bkrs.reduce((a,b)=>a+(b.count||0),0);
      const bkrDetail=bkrs.map(b=>`${b.count}x ${b.amp}A ${b.poles}P ${b.grade} ${b.oem}${b.pitting?" PITTING":""}${b.contactWear?" WEAR":""}`).join("; ");
      const condNotes=[it.conditionNotes,bkrDetail?`Breakers: ${bkrDetail}`:""].filter(Boolean).join(" | ");
      return {bid_id:id,equipment_type:it.equipmentType,manufacturer:it.manufacturer||null,model_number:it.modelNumber||null,serial_number:it.serialNumber||null,voltage_rating:it.voltageRating||null,amperage_rating:it.amperageRating||null,quantity:it.quantity,grade:it.grade,disposition:it.disposition,estimated_resale:parseFloat(it.estimatedResale)||null,estimated_scrap:it.estimatedScrap||null,ebay_comp_avg:it.ebayCompAvg||null,price_book_value:it.priceBookValue||null,estimated_weight_lbs:it.nameplateWeight?parseFloat(it.nameplateWeight):(it.estimatedWeight||null),breaker_count:bkrCount||null,breaker_value:null,notes:condNotes||null,sort_order:i,photo_count:(it.photos||[]).length,pickup_status:it.pickupStatus||"pending",destination:it.destination||null,nema_rating:it.nemaRating||null,indoor_outdoor:it.indoorOutdoor||"indoor",year_manufactured:it.yearMfg?parseInt(it.yearMfg):null,phase:it.phase||"3",kva_rating:it.kvaRating||null,kva_forced:it.kvaForced||null,winding_material:it.windingMaterial||null,winding_hv:it.windingHv||null,winding_lv:it.windingLv||null,cooling_class:it.coolingClass||null,liquid_type:it.liquidType||null,nameplate_weight_lbs:it.nameplateWeight?parseFloat(it.nameplateWeight):null,interrupting_rating:it.interruptRating||null,frame_size:it.frameSize||null,trip_rating:it.tripRating||null,breaker_type:it.breakerType||null,trip_unit_type:it.tripUnitType||null,mounting_type:it.mountingType||null,catalog_number:it.catalogNumber||null,bus_rating:it.busRating||null,short_circuit_rating:it.shortCircuitRating||null,bil_kv:it.bilKv||null,voltage_class:it.voltageClass||null,num_sections:it.numSections?parseInt(it.numSections):null,bus_material:it.busMaterial||null,switchgear_type:it.switchgearType||null};
    });
    try{
      let ok=false;
      if(!loc){try{
        await dbF("bids",{method:"POST",body:JSON.stringify(row)});
        if(lineItems.length)await dbF("bid_line_items",{method:"POST",body:JSON.stringify(lineItems)});
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

  const patchJob=async(id,u)=>{
    const ul=jobs.map(r=>r.id===id?{...r,...u}:r);setJobs(ul);
    if(!loc){try{const d={};for(const[k,v]of Object.entries(u))d[k.replace(/[A-Z]/g,m=>"_"+m.toLowerCase())]=v===""?null:v;await dbF(`bids?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify(d)});return;}catch{loc=true;}}
    await sS("wes_wt",ul);
  };

  const pickupItem=async(jobData,lineItem,lineIdx)=>{
    const invId=`INV-${Date.now().toString(36).toUpperCase()}`;
    const eqType=lineItem.equipment_type||lineItem.equipmentType||"";
    const isBulk=BULK_TYPES.has(eqType);
    const sn=(lineItem.serial_number||lineItem.serialNumber||"").trim();
    const invRow={
      id:invId,tracking_mode:isBulk?"quantity":"serialized",
      qty:isBulk?(parseInt(lineItem.quantity)||1):1,
      serial_number:isBulk?null:(sn||"UNKNOWN"),
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
    const breakers=lineItem.breakers||[];
    const missingComps=lineItem.missing||[];
    try{
      let ok=false;
      if(!loc){try{
        await dbF("inventory_items",{method:"POST",body:JSON.stringify(invRow)});
        if(breakers.length>0){
          const subRows=breakers.map((b,si)=>({inventory_id:invId,component_type:"Breaker",amp_rating:b.amp||null,poles:parseInt(b.poles)||1,quantity:b.count||1,grade:b.grade||"C",condition_notes:[b.pitting?"Pitting":"",b.contactWear?"Contact wear":""].filter(Boolean).join(", ")||null,is_present:true,salvageable:b.grade!=="D",origin_type:b.oem||"oem",sort_order:si}));
          await dbF("inventory_subcomponents",{method:"POST",body:JSON.stringify(subRows)});
        }
        if(missingComps.length>0){
          const missRows=missingComps.filter(m=>m.type||m.component_type).map(m=>({inventory_id:invId,component_type:m.type||m.component_type,description:m.desc||m.description||null,quantity:m.qty||m.quantity||1,replacement_status:"needed"}));
          if(missRows.length)await dbF("inventory_missing_components",{method:"POST",body:JSON.stringify(missRows)});
        }
        await dbF(`bid_line_items?bid_id=eq.${encodeURIComponent(jobData.id)}&sort_order=eq.${lineIdx}`,{method:"PATCH",body:JSON.stringify({inventory_id:invId,pickup_status:"completed"})});
        ok=true;
      }catch(e){loc=true;console.error(e);}}
      setJobs(prev=>prev.map(j=>{
        if(j.id!==jobData.id)return j;
        const its=(j.items||j.bid_line_items||[]).map((it,idx)=>idx===lineIdx?{...it,inventory_id:invId,pickup_status:"completed"}:it);
        return {...j,items:its,bid_line_items:its};
      }));
      if(!ok)await sS("wes_wt",jobs);
      setMsg({t:"success",m:`${invId} created in inventory. ${lineItem.grade==="D"?"Routed to scrap.":"Routed to "+((LOC.find(l=>l.v===(lineItem.destination||"main_warehouse"))?.l)||"warehouse")+"."}`});
    }catch(e){setMsg({t:"error",m:"Pickup failed: "+e.message});}
  };

  const patchLineItem=async(jobId,lineIdx,updates)=>{
    setJobs(prev=>prev.map(j=>{
      if(j.id!==jobId)return j;
      const its=(j.items||j.bid_line_items||[]).map((it,idx)=>idx===lineIdx?{...it,...updates}:it);
      return {...j,items:its,bid_line_items:its};
    }));
    if(!loc){
      try{
        const d={};
        for(const[k,v]of Object.entries(updates))d[k.replace(/[A-Z]/g,m=>"_"+m.toLowerCase())]=v===""?null:v;
        await dbF(`bid_line_items?bid_id=eq.${encodeURIComponent(jobId)}&sort_order=eq.${lineIdx}`,{method:"PATCH",body:JSON.stringify(d)});
      }catch{loc=true;}
    }
    await sS("wes_wt",jobs);
  };

  const [recvModal,setRecvModal]=useState(null);
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
    if(invId&&!loc){
      try{
        await dbF(`inventory_items?id=eq.${encodeURIComponent(invId)}`,{method:"PATCH",body:JSON.stringify({putaway_location:recvPutaway||null,barcode_sku:recvSku||null,received_verified:true,verified_by:recvBy||null,verified_date:today()})});
      }catch{loc=true;}
    }
    await patchLineItem(jobId,lineIdx,{receive_status:"verified",putaway_location:recvPutaway||null,barcode_sku:recvSku||null});
    setMsg({t:"success",m:`${invId||"Item"} verified. Putaway: ${recvPutaway||"N/A"}`});
    setRecvModal(null);
  };

  const esc=v=>{const s=String(v??"");return s.includes(",")||s.includes('"')?`"${s.replace(/"/g,'""')}"`:s;};
  const exportCSV=(b)=>{
    const its=b.items||b.bid_line_items||[];
    const h=["ID","Job","Customer","Date","Mode","Equipment","Mfr","S/N","Amps","Volts","KVA","KVA FA","Phase","NEMA","In/Out","Year","HV Wind","LV Wind","Class","Liquid","Weight","kAIC","Grade","Disposition","Dest","Qty","Resale $","Scrap $","eBay Avg","Photos","Condition","COGS","Revenue","Margin %"];
    const l=[h.map(esc).join(",")];
    its.forEach((it,i)=>{l.push([esc(b.id),esc(b.job_name),esc(b.customer_name),esc(b.bid_date),esc(b.mode),esc(it.equipment_type),esc(it.manufacturer),esc(it.serial_number),esc(it.amperage_rating),esc(it.voltage_rating),esc(it.kva_rating),esc(it.kva_forced),esc(it.phase),esc(it.nema_rating),esc(it.indoor_outdoor),esc(it.year_manufactured),esc(it.winding_hv),esc(it.winding_lv),esc(it.cooling_class),esc(it.liquid_type),esc(it.nameplate_weight_lbs||it.estimated_weight_lbs),esc(it.interrupting_rating),esc(it.grade),esc(it.disposition),esc(it.destination),esc(it.quantity),esc(it.estimated_resale),esc(it.estimated_scrap),esc(it.ebay_comp_avg),esc(it.photo_count||(it.photos||[]).length),esc(it.notes),esc(i===0?b.total_cogs:""),esc(i===0?b.total_revenue:""),esc(i===0?b.gross_margin_pct:"")].join(","));});
    const bl=new Blob([l.join("\n")],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=`PowerGate_${b.mode||"walkthrough"}_${b.id||"export"}.csv`;a.click();
  };

  return(
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro",sans-serif',maxWidth:480,margin:"0 auto",padding:"12px 16px",color:"#3d5e3f",minHeight:"100vh",background:"#f1f5f9"}}>
      {showSplash&&<SplashScreen onDone={()=>setShowSplash(false)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,padding:"12px 0",borderBottom:"3px solid #58815a"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><LogoMark size={28} /><div><div style={{fontSize:16,fontWeight:800,color:"#565756",letterSpacing:2}}>HARDIN</div><div style={{fontSize:9,color:"#58815a",fontWeight:700,letterSpacing:1.5}}>POWERGATE</div></div></div>
        <div style={{display:"flex",gap:4}}>
          {[{k:"new",l:"+"},{k:"jobs",l:String(jobs.length)},{k:"inventory",l:"[R] "}].map(t=><button key={t.k} onClick={()=>{setView(t.k);if(t.k==="inventory")loadInventory();}} style={{padding:"8px 14px",borderRadius:8,border:"none",background:view===t.k?"#3d5e3f":"#e2e8f0",color:view===t.k?"#fff":"#64748b",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t.l}</button>)}
        </div>
      </div>

      {view==="new"&&<div style={{display:"flex",gap:4,marginBottom:12}}>
        {[{m:"walkthrough",i:"[W]",l:"Walkthrough",s:"On-site bid"},{m:"pickup",i:"[P]",l:"Pickup",s:"Job-site load"},{m:"receive",i:"[R]",l:"Receive",s:"Dock arrival"},{m:"quick",i:"[Q]",l:"Quick",s:"Yard sticker walk"}].map(({m,i,l,s})=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px 4px",borderRadius:10,border:`2.5px solid ${mode===m?(m==="quick"?"#0891b2":m==="receive"?"#16a34a":"#3d5e3f"):"#e2e8f0"}`,background:mode===m?(m==="quick"?"#0891b2":m==="receive"?"#16a34a":"#3d5e3f"):"#fff",color:mode===m?"#fff":"#64748b",fontWeight:800,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div>{i} {l}</div><div style={{fontSize:9,fontWeight:600,opacity:mode===m?0.9:0.7}}>{s}</div>
        </button>)}
      </div>}

      {msg&&<div style={{padding:"12px",background:msg.t==="error"?"#fef2f2":msg.t==="info"?"#eff6ff":"#ecfdf5",border:`1px solid ${msg.t==="error"?"#fecaca":msg.t==="info"?"#bfdbfe":"#a7f3d0"}`,borderRadius:10,color:msg.t==="error"?"#dc2626":msg.t==="info"?"#1d4ed8":"#065f46",fontSize:13,marginBottom:12,display:"flex",justifyContent:"space-between"}}><span>{msg.m}</span><button onClick={()=>setMsg(null)} style={{background:"none",border:"none",fontWeight:700,cursor:"pointer",color:"inherit"}}>&times;</button></div>}

      {view==="new"&&(mode==="walkthrough"||mode==="pickup")&&<div>
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

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:15,fontWeight:800}}>Equipment ({items.length})</span>
          <button onClick={addItem} style={{padding:"10px 16px",borderRadius:8,border:"none",background:"#2563eb",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>+ Add Item</button>
        </div>
        {errs.items&&<div style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{errs.items}</div>}

        {items.map((it,i)=>(
          <div key={i} style={{...card,borderLeft:`4px solid ${gc[it.grade]||"#6b7280"}`,padding:14}}>
            <div onClick={()=>toggleItem(i)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:expandedItems[i]?10:0}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:14,fontWeight:800,color:"#475569"}}>{expandedItems[i]?"v":">"} ITEM {i+1}</span>
                  {it.grade&&<span style={{padding:"2px 8px",borderRadius:6,background:(gc[it.grade]||"#6b7280")+"18",color:gc[it.grade],fontSize:10,fontWeight:800}}>{it.grade}</span>}
                  {it.disposition&&it.disposition!=="unassigned"&&<span style={{padding:"2px 6px",borderRadius:6,background:(dc[it.disposition]||"#6b7280")+"15",color:dc[it.disposition],fontSize:9,fontWeight:700}}>{it.disposition}</span>}
                </div>
                {!expandedItems[i]&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{it.equipmentType||"No type"}{it.manufacturer?` . ${it.manufacturer}`:""}{it.kvaRating?` . ${it.kvaRating}KVA`:""}{it.amperageRating?` . ${it.amperageRating}A`:""}{it.voltageRating?` . ${it.voltageRating}V`:""}{it.serialNumber?` . S/N:${it.serialNumber}`:(it.quantity||1)>1?` . Qty:${it.quantity}`:""}{parseFloat(it.estimatedResale)>0?` . $${parseFloat(it.estimatedResale).toFixed(0)}`:""}{(it.photos||[]).length>0?` . [CAM] ${(it.photos||[]).length}`:""}</div>}
              </div>
              <button onClick={e=>{e.stopPropagation();rmItem(i);}} style={{background:"none",border:"none",color:"#ef4444",fontSize:20,cursor:"pointer"}}>&times;</button>
            </div>

            {expandedItems[i]&&<>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <label style={{flex:1,padding:10,borderRadius:8,background:scanning?"#94a3b8":"#3d5e3f",color:"#fff",fontWeight:700,fontSize:12,textAlign:"center",cursor:"pointer"}}>
                {scanning?"...":"[CAM]  Scan Nameplate"}
                <input type="file" accept="image/*" capture="environment" onChange={e=>handleScan(e.target.files?.[0],i)} style={{display:"none"}} disabled={scanning}/>
              </label>
              <label style={{flex:1,padding:10,borderRadius:8,background:"#475569",color:"#fff",fontWeight:700,fontSize:12,textAlign:"center",cursor:"pointer"}}>
                [PHOTO]  Add Photo ({(it.photos||[]).length})
                <input type="file" accept="image/*" capture="environment" onChange={e=>addPhoto(e.target.files?.[0],i)} style={{display:"none"}}/>
              </label>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <button onClick={()=>setCatalogScanIdx(i)} style={{flex:1,padding:8,borderRadius:8,border:"1.5px solid #d97706",background:"#fff7ed",color:"#92400e",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center"}}>Barcode / QR</button>
            </div>

            {it.photos&&it.photos.length>0&&<div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
              {it.photos.map((p,pi)=><img key={pi} src={p} alt="" style={{width:60,height:60,borderRadius:8,objectFit:"cover",border:"2px solid #e5e7eb",flexShrink:0}}/>)}
            </div>}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Type</label><select style={inpSm} value={it.equipmentType} onChange={e=>uItem(i,"equipmentType",e.target.value)}><option value="">Select</option>{EQ.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Mfr</label><select style={inpSm} value={it.manufacturer} onChange={e=>uItem(i,"manufacturer",e.target.value)}><option value="">Select</option>{MFR.map(m=><option key={m}>{m}</option>)}</select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>S/N</label><input style={inpSm} value={it.serialNumber} onChange={e=>{uItem(i,"serialNumber",e.target.value);if(e.target.value.trim())uItem(i,"quantity",1);}}/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Model</label><input style={inpSm} value={it.modelNumber} onChange={e=>uItem(i,"modelNumber",e.target.value)}/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Amps</label><input style={inpSm} value={it.amperageRating} onChange={e=>uItem(i,"amperageRating",e.target.value)}/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Volts</label><input style={inpSm} value={it.voltageRating} onChange={e=>uItem(i,"voltageRating",e.target.value)}/></div>
            </div>

            {!it.serialNumber&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#eff6ff",borderRadius:8,marginBottom:8,border:"1px solid #bfdbfe"}}>
              <span style={{fontSize:11,fontWeight:700,color:"#1d4ed8",flex:1}}>No S/N . Qty</span>
              <button onClick={()=>uItem(i,"quantity",Math.max(1,(it.quantity||1)-1))} style={{width:32,height:32,borderRadius:6,border:"1.5px solid #bfdbfe",background:"#fff",fontWeight:800,fontSize:18,cursor:"pointer",lineHeight:1,color:"#1d4ed8"}}>-</button>
              <input type="number" min="1" value={it.quantity||1} onChange={e=>uItem(i,"quantity",parseInt(e.target.value)||1)} style={{width:56,textAlign:"center",padding:"6px 0",border:"2px solid #2563eb",borderRadius:8,fontSize:18,fontWeight:800,color:"#1d4ed8",background:"#fff"}}/>
              <button onClick={()=>uItem(i,"quantity",(it.quantity||1)+1)} style={{width:32,height:32,borderRadius:6,border:"1.5px solid #bfdbfe",background:"#fff",fontWeight:800,fontSize:18,cursor:"pointer",lineHeight:1,color:"#1d4ed8"}}>+</button>
              <span style={{fontSize:10,color:"#6b7280"}}>units</span>
            </div>}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>NEMA</label><select style={inpSm} value={it.nemaRating||""} onChange={e=>uItem(i,"nemaRating",e.target.value)}><option value="">--</option>{NEMA.map(n=><option key={n.v} value={n.v}>{n.v}</option>)}</select></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Phase</label><div style={{display:"flex",gap:3}}>{PHASE.map(p=><button key={p} onClick={()=>uItem(i,"phase",p)} style={{flex:1,padding:"8px 0",borderRadius:6,border:`2px solid ${it.phase===p?"#2563eb":"#e2e8f0"}`,background:it.phase===p?"#2563eb15":"#fff",color:it.phase===p?"#2563eb":"#cbd5e1",fontWeight:800,fontSize:12,cursor:"pointer"}}>{p}P</button>)}</div></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Year</label><input style={inpSm} type="number" value={it.yearMfg||""} onChange={e=>uItem(i,"yearMfg",e.target.value)} placeholder="2001"/></div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>In/Out</label><div style={{display:"flex",gap:3}}>{[{v:"indoor",l:"In"},{v:"outdoor",l:"Out"}].map(o=><button key={o.v} onClick={()=>uItem(i,"indoorOutdoor",o.v)} style={{flex:1,padding:"8px 0",borderRadius:6,border:`2px solid ${it.indoorOutdoor===o.v?"#2563eb":"#e2e8f0"}`,background:it.indoorOutdoor===o.v?"#2563eb15":"#fff",color:it.indoorOutdoor===o.v?"#2563eb":"#cbd5e1",fontWeight:700,fontSize:11,cursor:"pointer"}}>{o.l}</button>)}</div></div>
            </div>

            <Section title="Transformer Details" badge={it.kvaRating?`${it.kvaRating}KVA`:""} color="#7c3aed" defaultOpen={it.equipmentType?.toLowerCase().includes("transformer")}>
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
            </Section>

            <Section title="Breaker Details" badge={it.frameSize?`${it.frameSize}A frame`:(it.interruptRating?`${it.interruptRating}kAIC`:"")} color="#0369a1" defaultOpen={it.equipmentType?.toLowerCase().includes("breaker")||it.equipmentType?.toLowerCase().includes("disconnect")}>
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
            </Section>

            <Section title="Switchgear Details" badge={it.busRating?`${it.busRating}A bus`:""} color="#059669" defaultOpen={it.equipmentType?.toLowerCase().includes("switchgear")||it.equipmentType?.toLowerCase().includes("mcc")}>
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
            </Section>

            <div style={{display:"flex",gap:4,marginBottom:8}}>
              {GRD.map(g=><button key={g.v} onClick={()=>uItem(i,"grade",g.v)} style={{flex:1,padding:"10px 0",borderRadius:8,border:`2.5px solid ${it.grade===g.v?g.c:"#e2e8f0"}`,background:it.grade===g.v?g.c+"15":"#fff",color:it.grade===g.v?g.c:"#cbd5e1",fontWeight:800,fontSize:14,cursor:"pointer"}}>{g.v}<div style={{fontSize:9,fontWeight:600}}>{g.d}</div></button>)}
            </div>

            <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap"}}>
              {DISP.map(d=><button key={d.v} onClick={()=>uItem(i,"disposition",d.v)} style={{padding:"8px 10px",borderRadius:8,border:`1.5px solid ${it.disposition===d.v?d.c:"#e2e8f0"}`,background:it.disposition===d.v?d.c+"15":"#fff",color:it.disposition===d.v?d.c:"#94a3b8",fontWeight:700,fontSize:11,cursor:"pointer"}}>{d.l}</button>)}
            </div>

            {it.disposition==="skid"&&<div style={{background:"#f0fdfa",borderRadius:10,padding:12,marginBottom:8,border:"1px solid #99f6e4"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#0891b2",marginBottom:6}}>Skid Assignment</div>
              <div style={{display:"flex",gap:6,alignItems:"end"}}>
                <div style={{flex:1}}><select style={inpSm} value={it.skidId||""} onChange={e=>uItem(i,"skidId",e.target.value)}><option value="">Select skid...</option>{skids.map(s=><option key={s.id} value={s.id}>{s.skid_number}{s.customer_name?` - ${s.customer_name}`:""}</option>)}</select></div>
                <button onClick={async()=>{const name=newSkidName||undefined;const id=await createSkid(name);if(id){uItem(i,"skidId",id);setNewSkidName("");}}} style={{padding:"10px 14px",borderRadius:8,border:"none",background:"#0891b2",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>+ New</button>
              </div>
              {it.skidId&&<div style={{fontSize:10,color:"#0891b2",marginTop:4,fontWeight:600}}>Assigned to: {skids.find(s=>s.id===it.skidId)?.skid_number||it.skidId}</div>}
              {!it.skidId&&<div style={{marginTop:6}}><input style={{...inpSm,fontSize:12}} value={newSkidName} onChange={e=>setNewSkidName(e.target.value)} placeholder="New skid name"/></div>}
            </div>}

            {mode==="pickup"&&<div style={{marginBottom:8}}>
              <label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Destination</label>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                {LOC.map(l=><button key={l.v} onClick={()=>uItem(i,"destination",l.v)} style={{padding:"6px 10px",borderRadius:6,border:`1.5px solid ${it.destination===l.v?"#2563eb":"#e2e8f0"}`,background:it.destination===l.v?"#2563eb15":"#fff",color:it.destination===l.v?"#2563eb":"#94a3b8",fontWeight:600,fontSize:10,cursor:"pointer"}}>{l.l}</button>)}
              </div>
              <ScanInput label="Putaway Location (scan bin/rack barcode)" value={it.putawayLocation} onChange={v=>uItem(i,"putawayLocation",v)} placeholder="e.g. LOC-A1-01"/>
            </div>}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Resale $</label><input style={{...inpSm,borderColor:parseFloat(it.estimatedResale)>0?"#16a34a":"#d1d5db"}} type="number" step="0.01" value={it.estimatedResale} onChange={e=>uItem(i,"estimatedResale",e.target.value)}/>{it.priceBookValue>0&&<div style={{fontSize:9,color:"#2563eb"}}>Book: ${it.priceBookValue.toFixed(0)}</div>}</div>
              <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Scrap $</label><div style={{...inpSm,background:"#f8fafc",color:"#475569"}}>${(it.estimatedScrap||0).toFixed(0)}</div><div style={{fontSize:9,color:"#94a3b8"}}>{it.estimatedWeight>0?`~${it.estimatedWeight} lbs`:""}</div></div>
              <div><button onClick={()=>fetchEbay(i)} style={{width:"100%",padding:"10px 0",borderRadius:8,border:"1px solid #16a34a",background:"#fff",color:"#16a34a",fontWeight:700,fontSize:11,cursor:"pointer",marginTop:18}}>eBay{it.ebayCompAvg>0?` $${it.ebayCompAvg.toFixed(0)}`:""}</button></div>
            </div>

            <CompPanel item={{equipmentType:it.equipmentType,manufacturer:it.manufacturer,modelNumber:it.modelNumber,catalogNumber:it.catalogNumber,amperageRating:it.amperageRating,kvaRating:it.kvaRating,voltageRating:it.voltageRating,grade:it.grade}} />

            <Section title="BREAKERS" badge={`${(it.breakers||[]).reduce((a,b)=>a+(b.count||0),0)} total`} color="#0369a1">
            <div style={{background:"#f0f9ff",borderRadius:10,padding:12,marginBottom:0,border:"1px solid #bae6fd"}}>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
                <button onClick={()=>addBreaker(i)} style={{padding:"6px 12px",borderRadius:6,border:"none",background:"#0369a1",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>+ Add</button>
              </div>
              {(it.breakers||[]).length===0&&<div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:8}}>No breakers logged. Tap + Add.</div>}
              {(it.breakers||[]).map((br,bi)=>(
                <div key={bi} style={{background:"#fff",borderRadius:8,padding:10,marginBottom:6,border:`1.5px solid ${gc[br.grade]||"#e5e7eb"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:10,fontWeight:700,color:"#475569"}}>#{bi+1}</span>
                    <button onClick={()=>rmBreaker(i,bi)} style={{background:"none",border:"none",color:"#ef4444",fontSize:16,cursor:"pointer",padding:0}}>&times;</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:6}}>
                    <div><label style={{fontSize:9,fontWeight:600,color:"#6b7280"}}>Amps</label><select style={{...inpSm,padding:"8px"}} value={br.amp} onChange={e=>uBreaker(i,bi,"amp",e.target.value)}>{AMPS.map(a=><option key={a}>{a}</option>)}</select></div>
                    <div><label style={{fontSize:9,fontWeight:600,color:"#6b7280"}}>Count</label><input style={{...inpSm,padding:"8px",textAlign:"center"}} type="number" min={1} value={br.count} onChange={e=>uBreaker(i,bi,"count",parseInt(e.target.value)||1)}/></div>
                    <div><label style={{fontSize:9,fontWeight:600,color:"#6b7280"}}>Poles</label><div style={{display:"flex",gap:3}}>{["1","2","3"].map(p=><button key={p} onClick={()=>uBreaker(i,bi,"poles",p)} style={{flex:1,padding:"8px 0",borderRadius:6,border:`2px solid ${br.poles===p?"#2563eb":"#e2e8f0"}`,background:br.poles===p?"#2563eb15":"#fff",color:br.poles===p?"#2563eb":"#cbd5e1",fontWeight:800,fontSize:12,cursor:"pointer"}}>{p}P</button>)}</div></div>
                  </div>
                  <div style={{display:"flex",gap:3,marginBottom:6}}>
                    {GRD.map(g=><button key={g.v} onClick={()=>uBreaker(i,bi,"grade",g.v)} style={{flex:1,padding:"8px 0",borderRadius:6,border:`2px solid ${br.grade===g.v?g.c:"#e2e8f0"}`,background:br.grade===g.v?g.c+"15":"#fff",color:br.grade===g.v?g.c:"#cbd5e1",fontWeight:800,fontSize:12,cursor:"pointer"}}>{g.v}</button>)}
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <button onClick={()=>uBreaker(i,bi,"oem",br.oem==="oem"?"aftermarket":"oem")} style={{padding:"7px 10px",borderRadius:6,border:`1.5px solid ${br.oem==="oem"?"#0369a1":"#c026d3"}`,background:br.oem==="oem"?"#0369a115":"#c026d315",color:br.oem==="oem"?"#0369a1":"#c026d3",fontWeight:700,fontSize:10,cursor:"pointer"}}>{br.oem==="oem"?"OEM":"Aftermarket"}</button>
                    <button onClick={()=>uBreaker(i,bi,"pitting",!br.pitting)} style={{padding:"7px 10px",borderRadius:6,border:`1.5px solid ${br.pitting?"#dc2626":"#d1d5db"}`,background:br.pitting?"#dc262615":"#fff",color:br.pitting?"#dc2626":"#94a3b8",fontWeight:700,fontSize:10,cursor:"pointer"}}>{br.pitting?"Pitting":"No Pitting"}</button>
                    <button onClick={()=>uBreaker(i,bi,"contactWear",!br.contactWear)} style={{padding:"7px 10px",borderRadius:6,border:`1.5px solid ${br.contactWear?"#f59e0b":"#d1d5db"}`,background:br.contactWear?"#f59e0b15":"#fff",color:br.contactWear?"#f59e0b":"#94a3b8",fontWeight:700,fontSize:10,cursor:"pointer"}}>{br.contactWear?"Contact Wear":"Good Contact"}</button>
                  </div>
                </div>
              ))}
            </div>
            </Section>

            <Section title="Missing Components" badge={`${(it.missing||[]).length}`} color="#dc2626">
            <div style={{marginBottom:0}}>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}><button onClick={()=>addMissing(i)} style={{padding:"4px 10px",borderRadius:6,border:"none",background:"#dc2626",color:"#fff",fontWeight:700,fontSize:10,cursor:"pointer"}}>+</button></div>
              {(it.missing||[]).map((m,mi)=>(
                <div key={mi} style={{display:"flex",gap:6,marginBottom:4}}>
                  <select style={{...inpSm,flex:1,padding:"6px"}} value={m.type} onChange={e=>uMissing(i,mi,"type",e.target.value)}><option value="">Type</option>{MT.map(t=><option key={t}>{t}</option>)}</select>
                  <input style={{...inpSm,flex:1,padding:"6px"}} value={m.desc} onChange={e=>uMissing(i,mi,"desc",e.target.value)} placeholder="Details"/>
                  <button onClick={()=>rmMissing(i,mi)} style={{background:"none",border:"none",color:"#ef4444",fontSize:16,cursor:"pointer"}}>&times;</button>
                </div>
              ))}
            </div>
            </Section>

            <input style={inpSm} value={it.conditionNotes} onChange={e=>uItem(i,"conditionNotes",e.target.value)} placeholder="Condition: rust, dents, mods, weather exposure..."/>
            </>}
          </div>
        ))}

        {catalogScanIdx!==null&&<BarcodeScanner label="Scan Catalog / Model Barcode" onScan={v=>{setItems(prev=>prev.map((it,j)=>j===catalogScanIdx?{...it,catalogNumber:v,modelNumber:v}:it));setMsg({t:"success",m:"Scanned: "+v});setCatalogScanIdx(null);}} onClose={()=>setCatalogScanIdx(null)}/>}

        {mode!=="receive"&&items.length>0&&<div style={{...card,background:meetsMargin?"#ecfdf5":"#fef2f2",border:`2px solid ${meetsMargin?"#a7f3d0":"#fecaca"}`}}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:10,color:meetsMargin?"#065f46":"#991b1b"}}>{meetsMargin?"Bid Summary":"Below "+targetMargin+"% Margin"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div><div style={{fontSize:10,color:"#6b7280"}}>COGS</div><div style={{fontSize:15,fontWeight:800}}>${totalCOGS.toFixed(0)}</div></div>
            <div><div style={{fontSize:10,color:"#6b7280"}}>Revenue</div><div style={{fontSize:15,fontWeight:800,color:"#16a34a"}}>${totalRevenue.toFixed(0)}</div></div>
            <div><div style={{fontSize:10,color:"#6b7280"}}>Profit</div><div style={{fontSize:15,fontWeight:800,color:grossProfit>0?"#16a34a":"#dc2626"}}>${grossProfit.toFixed(0)}</div></div>
          </div>
        </div>}

        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <button onClick={handleSubmit} disabled={sv} style={{flex:2,padding:16,borderRadius:12,border:"none",background:sv?"#94a3b8":"linear-gradient(135deg,#3d5e3f,#1e293b)",color:"#fff",fontSize:16,fontWeight:800,cursor:sv?"not-allowed":"pointer"}}>{sv?"Saving...":"Save"}</button>
          <button onClick={()=>sendWhatsApp()} style={{flex:1,padding:16,borderRadius:12,border:"none",background:"#25D366",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>WhatsApp</button>
        </div>

        <div style={card}><label style={lbl}>Notes</label><textarea style={{...inp,minHeight:60,resize:"vertical"}} value={job.notes} onChange={e=>uf("notes",e.target.value)} placeholder="Scope, exclusions, access notes..."/></div>
      </div>}

      {view==="new"&&(mode==="quick"||mode==="receive")&&<div>
        {qcPhase!=="location"&&<div style={{position:"sticky",top:0,zIndex:10,background:mode==="receive"?"#16a34a":"#0891b2",color:"#fff",padding:"10px 14px",borderRadius:10,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,fontWeight:700}}>
            {mode==="quick"?<>
              <div>Location: {qcLocationCode}</div>
              <div style={{fontSize:11,opacity:0.85,marginTop:2}}>{qcSession.length} captured this session</div>
            </>:<>
              <div>From: {job.customerName||"(no source)"}{job.jobName?` . ${job.jobName}`:""}</div>
              <div style={{fontSize:11,opacity:0.85,marginTop:2}}>Received by {job.preparedBy} . {qcSession.length} received this session</div>
            </>}
          </div>
          <button onClick={()=>setQcPhase("location")} style={{padding:"6px 12px",borderRadius:6,border:"1px solid rgba(255,255,255,0.4)",background:"transparent",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>{mode==="receive"?"Edit info":"Change"}</button>
        </div>}

        {qcPhase==="location"&&mode==="quick"&&<div style={card}>
          <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>Where are you walking?</div>
          <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Read the sticker code on the shelf. Type it exactly. Stays set until you change it.</div>
          <div style={{marginBottom:16}}>
            <label style={lbl}>Location code</label>
            <input style={{...inp,fontSize:20,padding:"16px 14px",letterSpacing:1}} value={qcLocationCode} onChange={e=>setQcLocationCode(e.target.value)} placeholder="e.g. 1-2-3-5 or FN" autoFocus/>
          </div>
          <button onClick={()=>{if(!qcLocationCode.trim()){setMsg({t:"error",m:"Location code required"});return;}setMsg(null);setQcPhase("capture");}} style={{width:"100%",padding:18,borderRadius:12,border:"none",background:"linear-gradient(135deg,#0891b2,#0e7490)",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}}>Start Capturing &rarr;</button>
        </div>}

        {qcPhase==="location"&&mode==="receive"&&<div style={card}>
          <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>Receiving items</div>
          <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>Net-new sellable stock arriving at the dock. Fill once, then capture all items in this load.</div>
          <div style={{marginBottom:10}}><label style={lbl}>Received By *</label><input style={inp} value={job.preparedBy} onChange={e=>uf("preparedBy",e.target.value)} placeholder="Your name" autoFocus/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Source / Vendor</label><input style={inp} value={job.customerName} onChange={e=>uf("customerName",e.target.value)} placeholder="Customer, vendor, auction"/></div>
            <div><label style={lbl}>PO / Reference</label><input style={inp} value={job.jobName} onChange={e=>uf("jobName",e.target.value)} placeholder="PO #, lot, job ref"/></div>
          </div>
          <div style={{marginBottom:16}}><label style={lbl}>Date</label><input style={inp} type="date" value={job.bidDate} onChange={e=>uf("bidDate",e.target.value)}/></div>
          <button onClick={()=>{if(!job.preparedBy.trim()){setMsg({t:"error",m:"Received By required"});return;}setMsg(null);setQcPhase("capture");}} style={{width:"100%",padding:18,borderRadius:12,border:"none",background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}}>Start Receiving &rarr;</button>
        </div>}

        {qcPhase==="capture"&&<div>
          <div style={card}>
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:48,marginBottom:8}}>[CAM]</div>
              <div style={{fontSize:14,color:"#6b7280",marginBottom:20}}>Photograph the nameplate or the item itself. AI fills in the rest.</div>
              <label style={{display:"block",boxSizing:"border-box",width:"100%",padding:"18px 16px",borderRadius:14,background:mode==="receive"?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#0891b2,#0e7490)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",textAlign:"center"}}>
                <input ref={qcFileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)handleQuickScan(f);}}/>
                CAPTURE ITEM
              </label>
            </div>
          </div>
          {qcSession.length>0&&<button onClick={printSessionSummary} style={{width:"100%",boxSizing:"border-box",padding:14,borderRadius:10,border:`2px solid ${mode==="receive"?"#16a34a":"#0891b2"}`,background:"#fff",color:mode==="receive"?"#16a34a":"#0891b2",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8}}>Print Session Summary ({qcSession.length} item{qcSession.length===1?"":"s"})</button>}
          <button onClick={()=>{setQcPhase("location");setQcSession([]);setView("inventory");loadInventory();}} style={{width:"100%",boxSizing:"border-box",padding:14,borderRadius:10,border:"1px solid #d1d5db",background:"#fff",color:"#475569",fontSize:14,fontWeight:700,cursor:"pointer"}}>Finish session . View inventory</button>
        </div>}

        {qcPhase==="analyzing"&&<div style={card}>
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:36,marginBottom:12}}>...</div>
            <div style={{fontSize:16,fontWeight:700,color:mode==="receive"?"#16a34a":"#0891b2"}}>AI reading item...</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:6}}>Identifying type, manufacturer, model, ratings</div>
          </div>
        </div>}

        {qcPhase==="review"&&qcItem&&<div>
          <div style={card}>
            {qcItem.photo&&<img src={qcItem.photo} alt="captured" style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:10,marginBottom:12}}/>}
            <div style={{fontSize:11,fontWeight:700,color:"#0891b2",marginBottom:6,letterSpacing:1}}>AI EXTRACTED . CONFIRM OR EDIT</div>
            <div style={{marginBottom:10}}>
              <label style={lbl}>Type *</label>
              <select style={qcItem.equipmentType?inp:inpE} value={qcItem.equipmentType} onChange={e=>setQcItem(i=>({...i,equipmentType:e.target.value}))}>
                <option value="">-- pick --</option>
                {EQ.map(t=><option key={t} value={t}>{t}{BULK_TYPES.has(t)?" (bulk)":""}{ENUM_PARENT_TYPES.has(t)?" (enumerable)":""}</option>)}
              </select>
            </div>
            <div style={{marginBottom:10}}>
              <label style={lbl}>Manufacturer</label>
              <select style={inp} value={MFR.includes(qcItem.manufacturer)?qcItem.manufacturer:""} onChange={e=>setQcItem(i=>({...i,manufacturer:e.target.value}))}>
                <option value="">-- pick --</option>
                {MFR.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
              {qcItem.manufacturer&&!MFR.includes(qcItem.manufacturer)&&<div style={{fontSize:11,color:"#f59e0b",marginTop:4}}>AI said: "{qcItem.manufacturer}" - pick closest match above</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={lbl}>Model</label><input style={inp} value={qcItem.modelNumber} onChange={e=>setQcItem(i=>({...i,modelNumber:e.target.value}))}/></div>
              <div><label style={lbl}>Catalog #</label><input style={inp} value={qcItem.catalogNumber} onChange={e=>setQcItem(i=>({...i,catalogNumber:e.target.value}))}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={lbl}>Amps</label><input style={inp} value={qcItem.amperageRating} onChange={e=>setQcItem(i=>({...i,amperageRating:e.target.value}))}/></div>
              <div><label style={lbl}>Volts</label><input style={inp} value={qcItem.voltageRating} onChange={e=>setQcItem(i=>({...i,voltageRating:e.target.value}))}/></div>
              <div><label style={lbl}>KVA</label><input style={inp} value={qcItem.kvaRating} onChange={e=>setQcItem(i=>({...i,kvaRating:e.target.value}))}/></div>
            </div>
          </div>

          <div style={card}>
            <label style={lbl}>Grade *</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
              {GRD.map(g=><button key={g.v} onClick={()=>setQcItem(i=>({...i,grade:g.v}))} style={{padding:"14px 0",borderRadius:10,border:`2.5px solid ${qcItem.grade===g.v?g.c:"#e2e8f0"}`,background:qcItem.grade===g.v?g.c+"15":"#fff",color:qcItem.grade===g.v?g.c:"#94a3b8",fontWeight:800,fontSize:15,cursor:"pointer"}}>{g.v}<div style={{fontSize:9,marginTop:2}}>{g.d}</div></button>)}
            </div>
          </div>

          <div style={card}>
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",userSelect:"none"}}>
              <input type="checkbox" checked={qcItem.bulkOverride!==null?qcItem.bulkOverride:BULK_TYPES.has(qcItem.equipmentType)} onChange={e=>setQcItem(i=>({...i,bulkOverride:e.target.checked}))} style={{width:22,height:22,accentColor:mode==="receive"?"#16a34a":"#0891b2",cursor:"pointer"}}/>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>Track as bulk</div>
                <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{(qcItem.bulkOverride!==null?qcItem.bulkOverride:BULK_TYPES.has(qcItem.equipmentType))?"Multiple identical units stored as one row with count":"Single unit with serial number"}</div>
              </div>
            </label>
          </div>

          <div style={card}>
            {(qcItem.bulkOverride!==null?qcItem.bulkOverride:BULK_TYPES.has(qcItem.equipmentType))?<>
              <label style={lbl}>Quantity *</label>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button onClick={()=>setQcItem(i=>({...i,qty:Math.max(1,(parseInt(i.qty)||1)-1)}))} style={{width:56,height:56,borderRadius:12,border:`2px solid ${mode==="receive"?"#16a34a":"#0891b2"}`,background:"#fff",color:mode==="receive"?"#16a34a":"#0891b2",fontSize:24,fontWeight:800,cursor:"pointer"}}>-</button>
                <input type="number" min="1" value={qcItem.qty} onChange={e=>setQcItem(i=>({...i,qty:parseInt(e.target.value)||1}))} style={{flex:1,padding:"14px 0",textAlign:"center",border:`2px solid ${mode==="receive"?"#16a34a":"#0891b2"}`,borderRadius:12,fontSize:28,fontWeight:800,color:mode==="receive"?"#16a34a":"#0891b2"}}/>
                <button onClick={()=>setQcItem(i=>({...i,qty:(parseInt(i.qty)||1)+1}))} style={{width:56,height:56,borderRadius:12,border:`2px solid ${mode==="receive"?"#16a34a":"#0891b2"}`,background:mode==="receive"?"#16a34a":"#0891b2",color:"#fff",fontSize:24,fontWeight:800,cursor:"pointer"}}>+</button>
              </div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:6}}>Bulk item. Stored as one row with count.</div>
            </>:<>
              <label style={lbl}>Serial Number</label>
              <input style={inp} value={qcItem.serialNumber} onChange={e=>setQcItem(i=>({...i,serialNumber:e.target.value}))} placeholder="Leave blank if unreadable"/>
              <div style={{fontSize:11,color:"#6b7280",marginTop:6}}>Blank serials get saved as &quot;UNKNOWN&quot; for later capture.</div>
            </>}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {ENUM_PARENT_TYPES.has(qcItem.equipmentType)&&<button onClick={startEnumerate} style={{padding:18,borderRadius:12,border:"none",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>Enumerate components &amp; issue traveler &rarr;</button>}
            <button onClick={()=>handleQuickReceive("next")} style={{padding:18,borderRadius:12,border:"none",background:mode==="receive"?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#0891b2,#0e7490)",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}}>{ENUM_PARENT_TYPES.has(qcItem.equipmentType)?"Receive parent only &amp; Capture Next \u2192":"Receive &amp; Capture Next \u2192"}</button>
            <button onClick={()=>handleQuickReceive("finish")} style={{padding:14,borderRadius:10,border:`2px solid ${mode==="receive"?"#16a34a":"#0891b2"}`,background:"#fff",color:mode==="receive"?"#16a34a":"#0891b2",fontSize:14,fontWeight:700,cursor:"pointer"}}>{ENUM_PARENT_TYPES.has(qcItem.equipmentType)?"Receive parent only &amp; Finish Session":"Receive &amp; Finish Session"}</button>
            <button onClick={()=>{setQcItem(null);setQcPhase("capture");}} style={{padding:12,borderRadius:10,border:"1px solid #d1d5db",background:"#fff",color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer"}}>Retake / Discard</button>
          </div>
        </div>}

        {qcPhase==="saving"&&<div style={card}>
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:36,marginBottom:12}}>...</div>
            <div style={{fontSize:16,fontWeight:700,color:mode==="receive"?"#16a34a":"#0891b2"}}>Saving to inventory...</div>
          </div>
        </div>}

        {qcPhase==="enumerate_capture"&&<div style={card}>
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#7c3aed",marginBottom:8,letterSpacing:1}}>STEP 2 OF 2 . COMPONENT LINEUP</div>
            <div style={{fontSize:16,fontWeight:800,marginBottom:6}}>Photograph the open front face</div>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:20,padding:"0 8px"}}>Capture all visible breakers/buckets in one shot. AI will enumerate each component into a traveler list.</div>
            <label style={{display:"block",boxSizing:"border-box",width:"100%",padding:"18px 16px",borderRadius:14,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",textAlign:"center"}}>
              <input ref={enumFileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)handleEnumerateCapture(f);}}/>
              CAPTURE LINEUP
            </label>
            <button onClick={()=>setQcPhase("review")} style={{marginTop:12,padding:"10px 18px",borderRadius:10,border:"1px solid #d1d5db",background:"#fff",color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer"}}>Back</button>
          </div>
        </div>}

        {qcPhase==="enumerate_analyzing"&&<div style={card}>
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:36,marginBottom:12}}>...</div>
            <div style={{fontSize:16,fontWeight:700,color:"#7c3aed"}}>AI enumerating components...</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:6}}>Identifying position, type, mfr, model, amperage for each unit</div>
          </div>
        </div>}

        {qcPhase==="enumerate_review"&&<div>
          <div style={card}>
            <div style={{fontSize:11,fontWeight:700,color:"#7c3aed",marginBottom:8,letterSpacing:1}}>REVIEW &amp; EDIT COMPONENTS</div>
            {enumPhoto&&<img src={enumPhoto} alt="lineup" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:10,marginBottom:12}}/>}
            {enumParentObs&&<div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:"#78350f"}}>
              <strong>Parent observations:</strong> {[enumParentObs.bus_rating?`Bus ${enumParentObs.bus_rating}A`:"",enumParentObs.voltage_class?enumParentObs.voltage_class:"",enumParentObs.visible_sections?`${enumParentObs.visible_sections} sections`:"",enumParentObs.condition_notes||""].filter(Boolean).join(" . ")||"(none)"}
            </div>}
            <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:"#1e293b"}}>{enumComponents.length} component{enumComponents.length===1?"":"s"} detected</div>
          </div>

          {enumComponents.length===0&&<div style={{...card,textAlign:"center",color:"#94a3b8",fontSize:13}}>No components found. Add manually or recapture.</div>}

          {enumComponents.map((c,ci)=>(
            <div key={ci} style={{...card,borderLeft:"4px solid #7c3aed",padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:800,color:"#7c3aed"}}>POS {c.position||ci+1}</span>
                <button onClick={()=>rmEnumComponent(ci)} style={{background:"none",border:"none",color:"#ef4444",fontSize:18,cursor:"pointer"}}>&times;</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Position</label><input style={inpSm} value={c.position} onChange={e=>uEnumComponent(ci,"position",e.target.value)} placeholder="1A, 2B..."/></div>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Type</label><select style={inpSm} value={c.equipment_type} onChange={e=>uEnumComponent(ci,"equipment_type",e.target.value)}><option value="Circuit Breaker">Circuit Breaker</option><option value="Motor Starter">Motor Starter</option><option value="VFD / Drive">VFD / Drive</option><option value="Disconnect Switch">Disconnect Switch</option><option value="Relay">Relay</option><option value="Trip Unit">Trip Unit</option><option value="Other">Other</option></select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Mfr</label><input style={inpSm} value={c.manufacturer} onChange={e=>uEnumComponent(ci,"manufacturer",e.target.value)} placeholder="Cutler-Hammer..."/></div>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Model / Cat</label><input style={inpSm} value={c.model_or_type} onChange={e=>uEnumComponent(ci,"model_or_type",e.target.value)} placeholder="FD3030L..."/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:6}}>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Amps</label><input style={inpSm} value={c.amperage} onChange={e=>uEnumComponent(ci,"amperage",e.target.value)} placeholder="30"/></div>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Poles</label><input style={inpSm} value={c.poles} onChange={e=>uEnumComponent(ci,"poles",e.target.value)} placeholder="3"/></div>
                <div><label style={{fontSize:10,fontWeight:600,color:"#6b7280"}}>Volts</label><input style={inpSm} value={c.voltage} onChange={e=>uEnumComponent(ci,"voltage",e.target.value)} placeholder="480"/></div>
              </div>
              <input style={inpSm} value={c.notes} onChange={e=>uEnumComponent(ci,"notes",e.target.value)} placeholder="Notes (damage, missing handle, etc.)"/>
            </div>
          ))}

          <button onClick={addEnumComponent} style={{width:"100%",boxSizing:"border-box",padding:12,borderRadius:10,border:"2px dashed #7c3aed",background:"#faf5ff",color:"#7c3aed",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:12}}>+ Add Component Manually</button>

          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={handleEnumerateSave} disabled={enumComponents.length===0} style={{padding:18,borderRadius:12,border:"none",background:enumComponents.length===0?"#94a3b8":"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",fontSize:16,fontWeight:800,cursor:enumComponents.length===0?"not-allowed":"pointer"}}>Save &amp; Issue Traveler</button>
            <button onClick={()=>setQcPhase("enumerate_capture")} style={{padding:12,borderRadius:10,border:"1px solid #d1d5db",background:"#fff",color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer"}}>Recapture Lineup</button>
            <button onClick={()=>{setEnumComponents([]);setEnumPhoto(null);setEnumParentObs(null);setQcPhase("review");}} style={{padding:12,borderRadius:10,border:"1px solid #d1d5db",background:"#fff",color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel . Back to parent review</button>
          </div>
        </div>}

        {qcPhase==="enumerate_saving"&&<div style={card}>
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:36,marginBottom:12}}>...</div>
            <div style={{fontSize:16,fontWeight:700,color:"#7c3aed"}}>Issuing traveler...</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:6}}>Creating parent, child records, traveler header and lines</div>
          </div>
        </div>}

        {qcPhase==="enumerate_success"&&enumLastTraveler&&<div>
          <div style={card}>
            <div style={{textAlign:"center",padding:"24px 0"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#7c3aed",marginBottom:6,letterSpacing:1}}>TRAVELER CREATED</div>
              <div style={{fontSize:28,fontWeight:800,color:"#7c3aed",letterSpacing:2,marginBottom:8}}>{enumLastTraveler.number}</div>
              <div style={{fontSize:13,color:"#6b7280"}}>{enumLastTraveler.childRows.length} component{enumLastTraveler.childRows.length===1?"":"s"} . dispatched to deman</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>printTraveler(enumLastTraveler)} style={{padding:18,borderRadius:12,border:"none",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}}>Print Traveler</button>
            <button onClick={()=>{setEnumLastTraveler(null);setQcPhase("capture");setTimeout(()=>qcFileRef.current?.click(),100);}} style={{padding:14,borderRadius:10,border:`2px solid ${mode==="receive"?"#16a34a":"#0891b2"}`,background:"#fff",color:mode==="receive"?"#16a34a":"#0891b2",fontSize:14,fontWeight:700,cursor:"pointer"}}>Continue Capturing &rarr;</button>
            <button onClick={()=>{setEnumLastTraveler(null);setQcPhase("location");setQcSession([]);setView("inventory");loadInventory();}} style={{padding:12,borderRadius:10,border:"1px solid #d1d5db",background:"#fff",color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer"}}>Finish Session . View Inventory</button>
          </div>
        </div>}
      </div>}

      {view==="jobs"&&<div>
        {ld?<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>Loading...</div>:
        jobs.length===0?<div style={{...card,textAlign:"center",color:"#94a3b8",padding:40}}>No jobs yet. Tap + to start.</div>:
        jobs.map(j=>(
          <div key={j.id} style={card}>
            <div onClick={()=>setExpId(expId===j.id?null:j.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:"#1e293b"}}>{j.job_name||j.jobName}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{j.customer_name||j.customerName} . {j.bid_date||j.bidDate} . {(j.items||j.bid_line_items||[]).length} items . {j.mode||"walkthrough"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:14,fontWeight:800,color:"#16a34a"}}>${parseFloat(j.total_revenue||0).toFixed(0)}</div>
                <div style={{fontSize:10,color:parseFloat(j.gross_margin_pct||0)>=(j.target_margin_pct||45)?"#16a34a":"#dc2626",fontWeight:700}}>{parseFloat(j.gross_margin_pct||0).toFixed(0)}%</div>
              </div>
            </div>
            {expId===j.id&&<div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #e5e7eb"}}>
              {(j.items||j.bid_line_items||[]).map((it,ii)=>(
                <div key={ii} style={{padding:8,marginBottom:6,background:"#f8fafc",borderRadius:8,borderLeft:`3px solid ${gc[it.grade]||"#6b7280"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:12,fontWeight:700}}>{it.equipment_type||it.equipmentType} . {it.manufacturer||"?"}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:(gc[it.grade]||"#6b7280")+"18",color:gc[it.grade],fontWeight:700}}>{it.grade}</span>
                      {it.pickup_status==="completed"&&<span style={{fontSize:9,padding:"2px 5px",borderRadius:4,background:"#dcfce7",color:"#15803d",fontWeight:700}}>PICKED UP</span>}
                      {it.receive_status==="verified"&&<span style={{fontSize:9,padding:"2px 5px",borderRadius:4,background:"#dbeafe",color:"#1d4ed8",fontWeight:700}}>VERIFIED</span>}
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{it.amperage_rating||it.amperageRating?(it.amperage_rating||it.amperageRating)+"A":""} {it.voltage_rating||it.voltageRating?(it.voltage_rating||it.voltageRating)+"V":""} {it.kva_rating||it.kvaRating?(it.kva_rating||it.kvaRating)+"KVA":""} . S/N: {it.serial_number||it.serialNumber||"N/A"}</div>
                  {(j.mode==="pickup"||j.mode==="walkthrough")&&it.pickup_status!=="completed"&&<button onClick={()=>pickupItem(j,it,ii)} style={{marginTop:6,padding:"6px 12px",borderRadius:6,border:"none",background:"#16a34a",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Mark Picked Up &rarr; Inventory</button>}
                  {it.pickup_status==="completed"&&it.receive_status!=="verified"&&<button onClick={()=>openReceiveModal(j.id,ii,it)} style={{marginTop:6,padding:"6px 12px",borderRadius:6,border:"none",background:"#2563eb",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Verify Receive &amp; Putaway</button>}
                </div>
              ))}
              <div style={{display:"flex",gap:6,marginTop:8}}>
                <button onClick={()=>exportCSV(j)} style={{flex:1,padding:"10px 0",borderRadius:8,border:"1px solid #2563eb",background:"#fff",color:"#2563eb",fontSize:12,fontWeight:700,cursor:"pointer"}}>Export CSV</button>
                <button onClick={()=>sendWhatsApp()} style={{flex:1,padding:"10px 0",borderRadius:8,border:"none",background:"#25D366",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>WhatsApp</button>
              </div>
            </div>}
          </div>
        ))}
      </div>}

      {view==="inventory"&&<div>
        <div style={card}>
          <div style={{fontSize:14,fontWeight:800,marginBottom:10}}>Inventory ({inv.length})</div>
          <input style={inp} value={invSearch} onChange={e=>setInvSearch(e.target.value)} placeholder="Search S/N, model, mfr, location..."/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
            <select style={{...inpSm,flex:1}} value={invFilterType} onChange={e=>setInvFilterType(e.target.value)}><option value="">All types</option>{EQ.map(t=><option key={t}>{t}</option>)}</select>
            <select style={{...inpSm,flex:1}} value={invFilterGrade} onChange={e=>setInvFilterGrade(e.target.value)}><option value="">All grades</option>{GRD.map(g=><option key={g.v} value={g.v}>{g.v}</option>)}</select>
            <select style={{...inpSm,flex:1}} value={invFilterLoc} onChange={e=>setInvFilterLoc(e.target.value)}><option value="">All locations</option>{LOC.map(l=><option key={l.v} value={l.v}>{l.l}</option>)}</select>
          </div>
        </div>
        {invLoading?<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>Loading inventory...</div>:
        (()=>{
          let filtered=inv;
          if(invSearch){const q=invSearch.toLowerCase();filtered=filtered.filter(r=>[r.serial_number,r.model_number,r.catalog_number,r.manufacturer,r.equipment_type,r.location_detail,r.putaway_location,r.barcode_sku,r.id].some(v=>v&&String(v).toLowerCase().includes(q)));}
          if(invFilterType)filtered=filtered.filter(r=>r.equipment_type===invFilterType);
          if(invFilterGrade)filtered=filtered.filter(r=>r.grade===invFilterGrade);
          if(invFilterLoc)filtered=filtered.filter(r=>r.location===invFilterLoc);
          if(filtered.length===0)return <div style={{...card,textAlign:"center",color:"#94a3b8",padding:40}}>No matches.</div>;
          return filtered.map(r=>(
            <div key={r.id} style={{...card,borderLeft:`4px solid ${gc[r.grade]||"#6b7280"}`,padding:12}}>
              <div onClick={()=>setInvExpId(invExpId===r.id?null:r.id)} style={{cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:13,fontWeight:800}}>{r.id}</div>
                  <div style={{display:"flex",gap:4}}>
                    <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:(gc[r.grade]||"#6b7280")+"18",color:gc[r.grade],fontWeight:700}}>{r.grade}</span>
                    {r.physical_state==="on_shelf"&&r.parent_id===null&&<span style={{fontSize:9,padding:"2px 5px",borderRadius:4,background:"#ede9fe",color:"#7c3aed",fontWeight:700}}>PARENT</span>}
                    {r.physical_state==="in_parent"&&<span style={{fontSize:9,padding:"2px 5px",borderRadius:4,background:"#fef3c7",color:"#78350f",fontWeight:700}}>IN PARENT</span>}
                    {r.physical_state==="extracted"&&<span style={{fontSize:9,padding:"2px 5px",borderRadius:4,background:"#dbeafe",color:"#1d4ed8",fontWeight:700}}>EXTRACTED</span>}
                    {r.status==="pending_decomm"&&<span style={{fontSize:9,padding:"2px 5px",borderRadius:4,background:"#fee2e2",color:"#991b1b",fontWeight:700}}>DECOMM</span>}
                  </div>
                </div>
                <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{r.equipment_type} . {r.manufacturer||"?"} . {r.model_number||""}</div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{r.amperage_rating?r.amperage_rating+"A":""}{r.voltage_rating?" / "+r.voltage_rating+"V":""}{r.kva_rating?" / "+r.kva_rating+"KVA":""} . S/N: {r.serial_number||"N/A"} . {(LOC.find(l=>l.v===r.location)?.l)||r.location||""}{r.location_detail?" / "+r.location_detail:""}{r.putaway_location?" . PUT: "+r.putaway_location:""}</div>
              </div>
              {invExpId===r.id&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #e5e7eb",fontSize:11,color:"#475569"}}>
                <div><strong>Received:</strong> {r.date_received} by {r.scanned_by||"-"}</div>
                {r.customer_origin&&<div><strong>Source:</strong> {r.customer_origin}</div>}
                {r.source_job_site&&<div><strong>Job:</strong> {r.source_job_site}</div>}
                {r.parent_id&&<div><strong>Parent:</strong> {r.parent_id}{r.position_in_parent?` (Pos ${r.position_in_parent})`:""}</div>}
                {r.bus_rating&&<div><strong>Bus:</strong> {r.bus_rating}A {r.voltage_class||""}</div>}
                {r.condition_notes&&<div style={{marginTop:4}}><strong>Notes:</strong> {r.condition_notes}</div>}
              </div>}
            </div>
          ));
        })()}
      </div>}

      {recvModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"#fff",borderRadius:14,padding:20,maxWidth:420,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:6}}>Verify Receive &amp; Putaway</div>
          <div style={{fontSize:11,color:"#64748b",marginBottom:14}}>{recvModal.item.equipment_type||recvModal.item.equipmentType} . {recvModal.item.inventory_id||""}</div>
          <div style={{marginBottom:10}}><label style={lbl}>Verified By *</label><input style={inp} value={recvBy} onChange={e=>setRecvBy(e.target.value)} placeholder="Your name"/></div>
          <div style={{marginBottom:10}}><ScanInput label="Putaway Location" value={recvPutaway} onChange={setRecvPutaway} placeholder="Scan or type bin/rack..."/></div>
          <div style={{marginBottom:14}}><ScanInput label="SKU / Barcode" value={recvSku} onChange={setRecvSku} placeholder="Scan or assign SKU..."/></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setRecvModal(null)} style={{flex:1,padding:12,borderRadius:8,border:"1px solid #d1d5db",background:"#fff",color:"#64748b",fontSize:13,fontWeight:700,cursor:"pointer"}}>Cancel</button>
            <button onClick={confirmReceive} style={{flex:2,padding:12,borderRadius:8,border:"none",background:"#2563eb",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>Confirm Verified</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
