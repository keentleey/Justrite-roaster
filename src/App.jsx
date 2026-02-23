import { useState, useMemo, useEffect } from “react”;

// ── Constants ──────────────────────────────────────────────────────────────
const DEPARTMENTS = [
{ id: “cashier”,      name: “Cashier”,       icon: “🏧”, color: “#F59E0B” },
{ id: “groceries”,    name: “Groceries”,     icon: “🛒”, color: “#10B981” },
{ id: “drinks”,       name: “Drinks”,        icon: “🥤”, color: “#3B82F6” },
{ id: “toiletries”,   name: “Toiletries”,    icon: “🧴”, color: “#8B5CF6” },
{ id: “household”,    name: “Household”,     icon: “🏠”, color: “#EC4899” },
{ id: “electronics”,  name: “Electronics”,   icon: “📱”, color: “#06B6D4” },
{ id: “backstore”,    name: “Backstore”,     icon: “📦”, color: “#6B7280” },
{ id: “merchandiser”, name: “Merchandisers”, icon: “🏷️”, color: “#D97706”, fixed: true },
];

const SHIFT_TYPES = {
morning:   { label:“Morning”,   short:“MOR”, time:“7:30AM–3:00PM”,   color:”#F59E0B”, bg:”#FEF3C7”, text:”#92400E” },
afternoon: { label:“Afternoon”, short:“AFT”, time:“1:30PM–9:00PM”,   color:”#3B82F6”, bg:”#DBEAFE”, text:”#1E40AF” },
sunday:    { label:“Sunday”,    short:“SUN”, time:“9:30AM–9:30PM”,   color:”#10B981”, bg:”#D1FAE5”, text:”#065F46” },
long:      { label:“Long Hour”, short:“LNG”, time:“10:00AM–10:00PM”, color:”#EF4444”, bg:”#FEE2E2”, text:”#991B1B” },
off:       { label:“Day Off”,   short:“OFF”, time:“Rest Day”,         color:”#6B7280”, bg:”#F3F4F6”, text:”#374151” },
};

const DAYS_SHORT = [“Mon”,“Tue”,“Wed”,“Thu”,“Fri”,“Sat”,“Sun”];
const ADMIN_PASSWORD = “justrite2024”;
const REMINDER_OPTIONS = [
{ id:“r24”,  label:“24 hours before”, minutes: 1440 },
{ id:“r12”,  label:“12 hours before”, minutes: 720  },
{ id:“r6”,   label:“6 hours before”,  minutes: 360  },
{ id:“r3”,   label:“3 hours before”,  minutes: 180  },
{ id:“r30”,  label:“30 mins before”,  minutes: 30   },
];

const NAMES = [
“Adebayo Okafor”,“Chioma Nwosu”,“Emeka Eze”,“Fatima Bello”,“Gbenga Adeyemi”,
“Halima Musa”,“Ibrahim Lawal”,“Joke Adesanya”,“Kunle Babatunde”,“Lola Akintunde”,
“Musa Abdullahi”,“Ngozi Okeke”,“Olu Afolabi”,“Priscilla Nwachukwu”,“Quadri Salami”,
“Rita Okonkwo”,“Seun Adeleke”,“Taiwo Abiodun”,“Uche Igwe”,“Vera Nnamdi”,
“Wasiu Olawale”,“Yusuf Garba”,“Zainab Idris”,“Abosede Coker”,“Biodun Fadipe”,
“Chukwudi Eze”,“Dupe Olawuyi”,“Ebere Okoro”,“Folake Ojo”,“Ganiu Sule”,
“Hannah Osei”,“Isaac Adeola”,“Janet Abubakar”,“Kayode Mustapha”,“Latifat Salawu”,
“Michael Nwoye”,“Nkechi Eze”,“Olumide Adegoke”,“Peace Ogbu”,“Raheem Asiwaju”,
“Sade Olatunji”,“Tobi Akintola”,“Usman Shehu”,“Vivian Okeke”,“Wale Ogundimu”,
“Yinka Adewale”,“Zoe Okafor”,“Ama Diallo”,“Bola Omotunde”,“Cynthia Afolabi”,
];

// ── Helpers ────────────────────────────────────────────────────────────────
const initials = n => n.split(” “).map(w=>w[0]).join(””).slice(0,2).toUpperCase();
const PALETTE = [”#F59E0B”,”#10B981”,”#3B82F6”,”#8B5CF6”,”#EC4899”,”#06B6D4”,”#EF4444”,”#D97706”];
const avatarBg = n => PALETTE[n.charCodeAt(0) % PALETTE.length];
const getDaysInMonth = (y,m) => new Date(y,m+1,0).getDate();
const getFirstDOW = (y,m) => { const d=new Date(y,m,1).getDay(); return d===0?6:d-1; };
const monthName = m => [“January”,“February”,“March”,“April”,“May”,“June”,“July”,“August”,“September”,“October”,“November”,“December”][m];
const today = new Date();
const pad = n => String(n).padStart(2,“0”);

function getWeekDays() {
const now = new Date();
const dow = now.getDay()===0?6:now.getDay()-1;
const monday = new Date(now); monday.setDate(now.getDate()-dow);
return Array.from({length:7},(_,i)=>{
const d=new Date(monday); d.setDate(monday.getDate()+i);
return { date:d, day:DAYS_SHORT[i], num:d.getDate(), month:d.getMonth(), year:d.getFullYear(),
isSun:d.getDay()===0, isSat:d.getDay()===6, isToday:d.toDateString()===now.toDateString() };
});
}

// ── Staff Generation ───────────────────────────────────────────────────────
function generateStaff() {
const slots = [
{id:“cashier”,morning:7,afternoon:7,sup:“morning”},
{id:“groceries”,morning:3,afternoon:2,sup:“afternoon”},
{id:“drinks”,morning:2,afternoon:2,sup:“morning”},
{id:“toiletries”,morning:1,afternoon:1,sup:“afternoon”},
{id:“household”,morning:1,afternoon:1,sup:“morning”},
{id:“electronics”,morning:1,afternoon:1,sup:“afternoon”},
{id:“backstore”,morning:1,afternoon:1,sup:“morning”},
{id:“merchandiser”,morning:10,afternoon:9,sup:“morning”},
];
let staff=[],ni=0,id=1000;
slots.forEach(dept=>{
const total=dept.morning+dept.afternoon;
for(let i=0;i<total;i++){
const shift=i<dept.morning?“morning”:“afternoon”;
const isSuper=i===0&&shift===dept.sup;
staff.push({
id:`EMP${id++}`, name:NAMES[ni%NAMES.length],
department:dept.id, level:isSuper?“Supervisor”:“Shopfloor”,
shift, partnerId:null,
phone:`080${String(Math.floor(Math.random()*90000000+10000000))}`,
joinDate:`202${Math.floor(Math.random()*3+1)}-0${Math.floor(Math.random()*9+1)}-${pad(Math.floor(Math.random()*27+1))}`,
fixed:dept.id===“merchandiser”, active:true,
reminderPrefs:[“r24”], // default reminder
});
ni++;
}
});
// pair
const pairs={};
staff.forEach(s=>{ const k=`${s.department}-${s.shift}`; if(!pairs[k])pairs[k]=[]; pairs[k].push(s.id); });
Object.values(pairs).forEach(g=>{ for(let i=0;i<g.length-1;i+=2){ const a=staff.find(s=>s.id===g[i]),b=staff.find(s=>s.id===g[i+1]); if(a&&b){a.partnerId=b.id;b.partnerId=a.id;} } });
return staff;
}

// ── Roster Generation ──────────────────────────────────────────────────────
function autoRoster(staff, y, m) {
const days=getDaysInMonth(y,m), active=staff.filter(s=>s.active&&!s.fixed), r={};
active.forEach(s=>{
let sundays=[], offPlaced=0;
for(let d=1;d<=days;d++){
const date=new Date(y,m,d), dow=date.getDay();
const wk=Math.ceil((d+getFirstDOW(y,m))/7);
const k=`${s.id}-${d}`;
if(dow===0){
const works=(s.shift===“morning”&&wk%2===1)||(s.shift===“afternoon”&&wk%2===0);
r[k]=works?“sunday”:“off”; if(works)sundays.push(d); else offPlaced++;
} else r[k]=s.shift;
}
let wkOffs=0;
sundays.forEach(sd=>{ if(wkOffs>=4)return; const cands=[sd-2,sd-3,sd+1,sd+2]; for(const c of cands){ if(c<1||c>days)continue; const cd=new Date(y,m,c); if(cd.getDay()===0)continue; const ck=`${s.id}-${c}`; if(r[ck]!==“off”&&wkOffs<4){r[ck]=“off”;wkOffs++;break;} } });
if(wkOffs<4){ const step=Math.floor(days/(4-wkOffs+1)); for(let d=step;d<=days&&wkOffs<4;d+=step){ const date=new Date(y,m,d); if(date.getDay()===0)continue; const k=`${s.id}-${d}`; if(r[k]!==“off”){r[k]=“off”;wkOffs++;} } }
});
active.forEach(s=>{ if(!s.partnerId)return; for(let d=1;d<=days;d++){ const date=new Date(y,m,d); if(date.getDay()===0)continue; const mk=`${s.id}-${d}`,pk=`${s.partnerId}-${d}`; if(r[mk]!==“off”&&r[pk]===“off”){ const dept=active.filter(x=>x.department===s.department); const lc=dept.filter(x=>r[`${x.id}-${d}`]===“long”).length; if(lc<1)r[mk]=“long”; } } });
return r;
}

// ── Sample Assignments ─────────────────────────────────────────────────────
const SAMPLE_ASSIGNMENTS = [
{
id:“a1”, title:“Restock Sugar (10 packs)”, description:“Shopfloor has requested 10 packs of sugar. Backstore to retrieve and move to grocery aisle, shopfloor to confirm receipt.”,
createdBy:“EMP1000”, createdAt: new Date(Date.now()-3600000*2).toISOString(),
priority:“high”, recurring:false, recurringDone:false,
steps:[
{ id:“s1”, dept:“backstore”, title:“Retrieve and move 10 packs of sugar to Groceries aisle”, done:false, doneBy:null, doneAt:null, note:””, locked:false },
{ id:“s2”, dept:“groceries”, title:“Confirm receipt of sugar packs on shopfloor”, done:false, doneBy:null, doneAt:null, note:””, locked:true },
{ id:“s3”, dept:“cashier”,   title:“Supervisor sign-off: restock complete”, done:false, doneBy:null, doneAt:null, note:””, locked:true },
],
comments:[],
},
{
id:“a2”, title:“Daily Opening Checklist”, description:“All departments complete their opening checklist before store opens.”,
createdBy:“EMP1000”, createdAt: new Date(Date.now()-3600000*5).toISOString(),
priority:“medium”, recurring:true, recurringDone:false,
steps:[
{ id:“s1”, dept:“cashier”,   title:“Count and verify cash float”, done:false, doneBy:null, doneAt:null, note:””, locked:false },
{ id:“s2”, dept:“groceries”, title:“Check and arrange grocery shelves”, done:false, doneBy:null, doneAt:null, note:””, locked:false },
{ id:“s3”, dept:“backstore”, title:“Confirm delivery manifest and stock levels”, done:false, doneBy:null, doneAt:null, note:””, locked:false },
],
comments:[],
},
{
id:“a3”, title:“Drinks Section Deep Clean”, description:“Full clean of the drinks aisle including refrigerators and shelving.”,
createdBy:“EMP1000”, createdAt: new Date(Date.now()-3600000*24).toISOString(),
priority:“low”, recurring:false, recurringDone:false,
steps:[
{ id:“s1”, dept:“drinks”, title:“Clean refrigerators and shelves”, done:true, doneBy:{id:“EMP1004”,name:“Gbenga Adeyemi”,dept:“drinks”,shift:“morning”}, doneAt:new Date(Date.now()-3600000).toISOString(), note:“All fridges cleaned, temperature checked.”, locked:false },
{ id:“s2”, dept:“drinks”, title:“Restock and face up products”, done:false, doneBy:null, doneAt:null, note:””, locked:false },
],
comments:[{id:“c1”,author:{id:“EMP1004”,name:“Gbenga Adeyemi”,dept:“drinks”,shift:“morning”},text:“Rear fridge had ice build-up, defrosted manually.”,at:new Date(Date.now()-3600000).toISOString()}],
},
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function JustriteApp() {
const [staff, setStaff] = useState(generateStaff);
const [view, setView] = useState(“login”); // login | portal | admin
const [currentUser, setCurrentUser] = useState(null);
const [adminMode, setAdminMode] = useState(false);

// Roster
const [rosters, setRosters] = useState({});
const [viewMonth, setViewMonth] = useState(today.getMonth());
const [viewYear, setViewYear] = useState(today.getFullYear());

// Assignments
const [assignments, setAssignments] = useState(SAMPLE_ASSIGNMENTS);

// UI
const [toast, setToast] = useState(null);
const [modal, setModal] = useState(null);
const [activeTab, setActiveTab] = useState(“schedule”);

// Admin state
const [adminTab, setAdminTab] = useState(“roster”);
const [filterDept, setFilterDept] = useState(“all”);
const [filterShift, setFilterShift] = useState(“all”);
const [search, setSearch] = useState(””);
const [editCell, setEditCell] = useState(null);
const [pwModal, setPwModal] = useState(false);
const [pwInput, setPwInput] = useState(””);
const [pwAction, setPwAction] = useState(null);

// Assignment creation
const [newAssign, setNewAssign] = useState(null);
const [commentInputs, setCommentInputs] = useState({});
const [noteInputs, setNoteInputs] = useState({});

const showToast = (msg, type=“ok”) => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };

const monthKey = `${viewYear}-${viewMonth}`;
const currentRoster = rosters[monthKey] || { approved:false, published:false, data:{} };
const rosterData = currentRoster.data;

// ── Login ────────────────────────────────────────────────────────────────
const [loginId, setLoginId] = useState(””);
const [loginName, setLoginName] = useState(””);
const [loginErr, setLoginErr] = useState(””);

const handleLogin = () => {
if (loginId === “ADMIN” && loginName.toLowerCase() === “admin”) {
setAdminMode(true); setView(“admin”); setLoginErr(””); return;
}
const found = staff.find(s => s.id.toLowerCase()===loginId.toLowerCase() && s.name.toLowerCase()===loginName.toLowerCase() && s.active);
if (!found) { setLoginErr(“Employee ID or name not found. Please check and try again.”); return; }
setCurrentUser(found); setView(“portal”); setLoginErr(””); setActiveTab(“schedule”);
};

// ── Roster ───────────────────────────────────────────────────────────────
const generateRoster = () => {
const data = autoRoster(staff, viewYear, viewMonth);
setRosters(r=>({…r,[monthKey]:{approved:false,published:false,data}}));
showToast(`Roster generated for ${monthName(viewMonth)} ${viewYear}`);
};

const updateCell = (staffId, day, shiftType) => {
setRosters(r=>({…r,[monthKey]:{…currentRoster,approved:false,data:{…rosterData,[`${staffId}-${day}`]:shiftType}}}));
setEditCell(null);
};

const submitPw = () => {
if(pwInput!==ADMIN_PASSWORD){showToast(“Incorrect password”,“err”);return;}
if(pwAction===“approve”) setRosters(r=>({…r,[monthKey]:{…currentRoster,approved:true}}));
if(pwAction===“publish”) setRosters(r=>({…r,[monthKey]:{…currentRoster,approved:true,published:true}}));
showToast(pwAction===“approve”?“Roster approved ✅”:“Roster published 🚀”); setPwModal(false); setPwInput(””);
};

// ── Week data ─────────────────────────────────────────────────────────────
const weekDays = useMemo(()=>getWeekDays(),[]);

// ── User’s schedule ───────────────────────────────────────────────────────
const userSchedule = useMemo(() => {
if(!currentUser) return [];
return weekDays.map(d => {
const shift = rosterData[`${currentUser.id}-${d.num}`] || currentUser.shift;
return { …d, shift, shiftInfo: SHIFT_TYPES[shift] || SHIFT_TYPES[currentUser.shift] };
});
}, [currentUser, weekDays, rosterData]);

// ── Off stats ─────────────────────────────────────────────────────────────
const offStats = useMemo(() => {
if(!currentUser) return { used:0, total:6, days:[] };
const days = getDaysInMonth(viewYear, viewMonth);
const offDays = [];
for(let d=1;d<=days;d++){
if(rosterData[`${currentUser.id}-${d}`]===“off”){
const date=new Date(viewYear,viewMonth,d);
offDays.push({ day:d, dow:DAYS_SHORT[date.getDay()===0?6:date.getDay()-1] });
}
}
return { used:offDays.length, total:6, days:offDays };
}, [currentUser, rosterData, viewYear, viewMonth]);

// ── User’s assignments ────────────────────────────────────────────────────
const userAssignments = useMemo(() => {
if(!currentUser) return [];
return assignments.filter(a =>
a.steps.some(s => s.dept === currentUser.department)
);
}, [currentUser, assignments]);

// Admin visible assignments
const visibleAssignments = useMemo(() => {
if(filterDept===“all”) return assignments;
return assignments.filter(a=>a.steps.some(s=>s.dept===filterDept));
}, [assignments, filterDept]);

// ── Complete a step ───────────────────────────────────────────────────────
const completeStep = (assignId, stepId, note) => {
setAssignments(prev => prev.map(a => {
if(a.id !== assignId) return a;
const steps = a.steps.map((s,idx) => {
if(s.id !== stepId) return s;
const actor = currentUser || { id:“ADMIN”, name:“Admin”, dept:“admin”, shift:”—” };
return { …s, done:true, doneBy:{id:actor.id,name:actor.name,dept:actor.department||“admin”,shift:actor.shift}, doneAt:new Date().toISOString(), note };
});
// Unlock next locked step
let unlocked = false;
const final = steps.map((s,i) => {
if(s.locked && !unlocked && steps[i-1]?.done) { unlocked=true; return {…s,locked:false}; }
return s;
});
const allDone = final.every(s=>s.done);
return { …a, steps:final, recurringDone: a.recurring && allDone };
}));
showToast(“Step marked complete ✅”);
setNoteInputs(n=>({…n,[stepId]:””}));
};

const undoStep = (assignId, stepId) => {
setAssignments(prev=>prev.map(a=>{
if(a.id!==assignId) return a;
const steps=a.steps.map((s,i,arr)=>{
if(s.id!==stepId)return s;
return {…s,done:false,doneBy:null,doneAt:null,note:””};
});
// re-lock steps after this one that depended on it
let foundUndone=false;
const final=steps.map(s=>{ if(s.id===stepId)foundUndone=true; if(foundUndone&&s.id!==stepId)return{…s,locked:true,done:false,doneBy:null,doneAt:null}; return s; });
return {…a,steps:final,recurringDone:false};
}));
showToast(“Step undone”);
};

const addComment = (assignId) => {
const text = commentInputs[assignId]||””;
if(!text.trim()) return;
const actor = currentUser || { id:“ADMIN”, name:“Admin”, department:“admin”, shift:”—” };
const comment = { id:`c${Date.now()}`, author:{id:actor.id,name:actor.name,dept:actor.department||“admin”,shift:actor.shift}, text, at:new Date().toISOString() };
setAssignments(p=>p.map(a=>a.id===assignId?{…a,comments:[…a.comments,comment]}:a));
setCommentInputs(c=>({…c,[assignId]:””}));
};

const deleteAssignment = (id) => {
setAssignments(p=>p.filter(a=>a.id!==id));
showToast(“Assignment deleted”,“warn”);
setModal(null);
};

const resetRecurring = (id) => {
setAssignments(p=>p.map(a=>{
if(a.id!==id||!a.recurring) return a;
return {…a, recurringDone:false, steps:a.steps.map((s,i)=>({…s,done:false,doneBy:null,doneAt:null,note:””,locked:i>0}))};
}));
showToast(“Recurring task reset”);
};

// ── Create assignment ─────────────────────────────────────────────────────
const [newForm, setNewForm] = useState({ title:””, description:””, priority:“medium”, recurring:false, steps:[{dept:“cashier”,title:””}] });

const saveAssignment = () => {
if(!newForm.title.trim()||newForm.steps.some(s=>!s.title.trim()||!s.dept)) return showToast(“Fill all fields”,“err”);
const a = {
id:`a${Date.now()}`, title:newForm.title, description:newForm.description,
createdBy: adminMode?“ADMIN”:currentUser?.id, createdAt:new Date().toISOString(),
priority:newForm.priority, recurring:newForm.recurring, recurringDone:false,
steps: newForm.steps.map((s,i)=>({id:`s${i}`,dept:s.dept,title:s.title,done:false,doneBy:null,doneAt:null,note:””,locked:i>0})),
comments:[],
};
setAssignments(p=>[a,…p]);
setNewForm({title:””,description:””,priority:“medium”,recurring:false,steps:[{dept:“cashier”,title:””}]});
setModal(null);
showToast(“Assignment created ✅”);
};

// ── Calendar export ───────────────────────────────────────────────────────
const exportToCalendar = (s, reminderMins) => {
const d = s.date;
const shiftInfo = s.shiftInfo;
if(!shiftInfo||s.shift===“off”) return;
const [startH,startM] = shiftInfo.time.split(”–”)[0].replace(“AM”,””).replace(“PM”,””).split(”:”).map(Number);
const isPMAdjust = shiftInfo.time.includes(“PM”) && !shiftInfo.time.startsWith(“12”);
const startHour = isPMAdjust ? startH+12 : startH;
const dtStart = new Date(d.getFullYear(),d.getMonth(),d.getDate(),startHour,startM||0);
const [endH,endM] = shiftInfo.time.split(”–”)[1].replace(“AM”,””).replace(“PM”,””).split(”:”).map(Number);
const isEndPM = shiftInfo.time.split(”–”)[1].includes(“PM”);
const endHour = isEndPM && endH!==12 ? endH+12 : endH;
const dtEnd = new Date(d.getFullYear(),d.getMonth(),d.getDate(),endHour,endM||0);
const fmt = dt => dt.toISOString().replace(/[-:]/g,””).split(”.”)[0]+“Z”;
const alarm = reminderMins ? `BEGIN:VALARM\nTRIGGER:-PT${reminderMins}M\nACTION:DISPLAY\nDESCRIPTION:Shift Reminder\nEND:VALARM\n` : “”;
const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(dtStart)}\nDTEND:${fmt(dtEnd)}\nSUMMARY:Justrite – ${shiftInfo.label} Shift\nDESCRIPTION:${shiftInfo.time}\nLOCATION:Justrite Superstore Ile-Ife\n${alarm}END:VEVENT\nEND:VCALENDAR`;
const blob = new Blob([ics],{type:“text/calendar”});
const url = URL.createObjectURL(blob);
const a = document.createElement(“a”); a.href=url; a.download=`justrite-shift-${d.getDate()}.ics`; a.click();
URL.revokeObjectURL(url);
showToast(`Shift added to calendar with ${reminderMins}min reminder`);
};

const exportWeekToCalendar = (reminderMins) => {
const workDays = userSchedule.filter(d=>d.shift!==“off”);
const events = workDays.map(s=>{
const d=s.date, si=s.shiftInfo;
if(!si)return””;
const parseTime = (t,isEnd=false)=>{ const clean=t.trim().replace(“AM”,””).replace(“PM”,””); const [h,m]=(clean+”:00”).split(”:”).map(Number); const isPM=t.includes(“PM”)&&h!==12; return [isPM?h+12:h,m||0]; };
const times=si.time.split(”–”);
const [sh,sm]=parseTime(times[0]);const [eh,em]=parseTime(times[1],true);
const dtS=new Date(d.getFullYear(),d.getMonth(),d.getDate(),sh,sm);
const dtE=new Date(d.getFullYear(),d.getMonth(),d.getDate(),eh,em);
const fmt=dt=>dt.toISOString().replace(/[-:]/g,””).split(”.”)[0]+“Z”;
const alarm=reminderMins?`BEGIN:VALARM\nTRIGGER:-PT${reminderMins}M\nACTION:DISPLAY\nDESCRIPTION:Shift starting in ${reminderMins<60?reminderMins+"mins":reminderMins/60+"hrs"}\nEND:VALARM\n`:””;
return `BEGIN:VEVENT\nDTSTART:${fmt(dtS)}\nDTEND:${fmt(dtE)}\nSUMMARY:Justrite – ${si.label} Shift\nDESCRIPTION:${si.time}\nLOCATION:Justrite Superstore Ile-Ife\n${alarm}END:VEVENT`;
}).filter(Boolean).join(”\n”);
const ics=`BEGIN:VCALENDAR\nVERSION:2.0\n${events}\nEND:VCALENDAR`;
const blob=new Blob([ics],{type:“text/calendar”});
const url=URL.createObjectURL(blob);
const a=document.createElement(“a”);a.href=url;a.download=`justrite-week.ics`;a.click();
URL.revokeObjectURL(url);
showToast(“Full week added to calendar!”);
};

const [selectedReminder, setSelectedReminder] = useState(“r24”);
const reminderMins = REMINDER_OPTIONS.find(r=>r.id===selectedReminder)?.minutes||1440;

// ── Filtered staff for admin ───────────────────────────────────────────────
const filteredStaff = useMemo(()=>staff.filter(s=>{
if(!s.active)return false;
if(filterDept!==“all”&&s.department!==filterDept)return false;
if(filterShift!==“all”&&s.shift!==filterShift)return false;
if(search&&!s.name.toLowerCase().includes(search.toLowerCase()))return false;
return true;
}),[staff,filterDept,filterShift,search]);

// ─────────────────────────────────────────────────────────────────────────
return (
<div style={{minHeight:“100vh”,background:”#F4F4F1”,fontFamily:”‘Outfit’,‘Segoe UI’,sans-serif”,color:”#1A1A1A”}}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fraunces:wght@500;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px;} .btn{border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-weight:600;font-size:13px;transition:all .18s;} .btn-g{background:#1D6F42;color:#fff;padding:10px 20px;}.btn-g:hover{background:#155233;box-shadow:0 4px 14px #1D6F4235;} .btn-o{background:#fff;color:#333;padding:9px 16px;border:1.5px solid #E0E0DC;}.btn-o:hover{border-color:#1D6F42;color:#1D6F42;} .btn-r{background:#FEE2E2;color:#DC2626;padding:8px 14px;}.btn-r:hover{background:#FECACA;} .btn-sm{padding:6px 12px;font-size:12px;}.btn-xs{padding:4px 9px;font-size:11px;} .inp,.sel{background:#fff;border:1.5px solid #E5E5E0;border-radius:8px;color:#1A1A1A;font-family:inherit;font-size:13px;padding:9px 12px;width:100%;outline:none;transition:border .18s;} .inp:focus,.sel:focus{border-color:#1D6F42;box-shadow:0 0 0 3px #1D6F4212;} .sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%23888' d='M5 7L0 0h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;padding-right:28px;cursor:pointer;} .card{background:#fff;border:1.5px solid #EBEBEA;border-radius:14px;} .tab{background:none;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:8px;color:rgba(255,255,255,.55);transition:all .18s;} .tab.on{background:rgba(255,255,255,.18);color:#fff;}.tab:hover:not(.on){color:rgba(255,255,255,.85);} .ptab{background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;padding:10px 16px;color:#888;transition:all .18s;} .ptab.on{border-bottom-color:#1D6F42;color:#1D6F42;}.ptab:hover:not(.on){color:#333;} .mo{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);} .md{background:#fff;border-radius:16px;padding:28px;width:90%;max-width:520px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.18);} .toast{position:fixed;bottom:24px;right:24px;z-index:9999;border-radius:10px;font-size:13px;font-weight:600;padding:12px 20px;box-shadow:0 8px 32px rgba(0,0,0,.18);animation:tin .3s ease;} .tok{background:#1D6F42;color:#fff;}.terr{background:#DC2626;color:#fff;}.twarn{background:#F59E0B;color:#fff;} @keyframes tin{from{transform:translateX(80px);opacity:0;}to{transform:translateX(0);opacity:1;}} .shift-pill{border-radius:6px;font-size:10px;font-weight:700;padding:3px 7px;cursor:pointer;transition:all .15s;white-space:nowrap;user-select:none;} .shift-pill:hover{filter:brightness(1.08);transform:scale(1.05);} .cdrop{position:absolute;background:#fff;border:1.5px solid #E5E5E0;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:200;min-width:160px;overflow:hidden;} .copt{display:flex;align-items:center;gap:10px;padding:9px 13px;cursor:pointer;font-size:12px;transition:background .13s;}.copt:hover{background:#F5F5F2;} label{display:block;font-size:11px;font-weight:700;color:#888;margin-bottom:4px;letter-spacing:.06em;text-transform:uppercase;} .fg{display:grid;grid-template-columns:1fr 1fr;gap:12px;} .step-card{border:1.5px solid #E5E5E0;border-radius:10px;padding:14px;margin-bottom:8px;transition:all .2s;} .step-done{border-color:#6EE7B7;background:#F0FDF4;} .step-locked{opacity:.5;pointer-events:none;filter:grayscale(.5);} .priority-high{background:#FEE2E2;color:#991B1B;border-radius:20px;font-size:10px;font-weight:700;padding:2px 9px;} .priority-medium{background:#FEF3C7;color:#92400E;border-radius:20px;font-size:10px;font-weight:700;padding:2px 9px;} .priority-low{background:#DBEAFE;color:#1E40AF;border-radius:20px;font-size:10px;font-weight:700;padding:2px 9px;} .off-pip{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;} .off-used{background:#FEE2E2;color:#991B1B;} .off-left{background:#D1FAE5;color:#065F46;} .off-empty{background:#F3F4F6;color:#9CA3AF;} .day-card{border-radius:12px;padding:14px 10px;text-align:center;border:2px solid transparent;transition:all .2s;} .day-today{border-color:#1D6F42;box-shadow:0 0 0 3px #1D6F4218;} .comment-bubble{background:#F5F5F2;border-radius:10px;padding:10px 14px;margin-bottom:8px;} .recurring-badge{background:#EDE9FE;color:#5B21B6;border-radius:20px;font-size:10px;font-weight:700;padding:2px 9px;}`}</style>

```
  {/* ══════════ LOGIN SCREEN ══════════ */}
  {view==="login" && (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1D6F42 0%,#0F3D24 100%)"}}>
      <div style={{background:"#fff",borderRadius:20,padding:40,width:"90%",maxWidth:400,boxShadow:"0 32px 80px rgba(0,0,0,.3)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:44,marginBottom:10}}>🛒</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700}}>Justrite Superstore</div>
          <div style={{color:"#888",fontSize:13,marginTop:4,letterSpacing:".05em"}}>ILE-IFE · STAFF PORTAL</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label>Employee ID</label>
            <input className="inp" placeholder="e.g. EMP1001 or ADMIN" value={loginId} onChange={e=>setLoginId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
          </div>
          <div>
            <label>Full Name</label>
            <input className="inp" placeholder="Enter your full name" value={loginName} onChange={e=>setLoginName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
          </div>
          {loginErr && <div style={{background:"#FEE2E2",borderRadius:8,color:"#DC2626",fontSize:13,padding:"10px 14px"}}>{loginErr}</div>}
          <button className="btn btn-g" style={{width:"100%",padding:"13px",fontSize:15,marginTop:4}} onClick={handleLogin}>Sign In →</button>
          <div style={{color:"#bbb",fontSize:11,textAlign:"center"}}>Use ADMIN / admin for manager access</div>
        </div>
      </div>
    </div>
  )}

  {/* ══════════ STAFF PORTAL ══════════ */}
  {view==="portal" && currentUser && (
    <div>
      {/* Header */}
      <div style={{background:"#1D6F42",padding:"0 20px",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 20px #1D6F4240"}}>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0 0"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:avatarBg(currentUser.name),borderRadius:"50%",color:"#fff",fontSize:14,fontWeight:700,height:40,width:40,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(currentUser.name)}</div>
              <div>
                <div style={{color:"#fff",fontWeight:700,fontSize:15}}>{currentUser.name}</div>
                <div style={{color:"rgba(255,255,255,.6)",fontSize:11}}>
                  {DEPARTMENTS.find(d=>d.id===currentUser.department)?.icon} {DEPARTMENTS.find(d=>d.id===currentUser.department)?.name} · {currentUser.level} · {currentUser.id}
                </div>
              </div>
            </div>
            <button className="btn btn-o btn-sm" onClick={()=>{setView("login");setCurrentUser(null);}}>Sign Out</button>
          </div>
          <div style={{display:"flex",gap:2,paddingBottom:0,overflowX:"auto"}}>
            {[["schedule","📅 Schedule"],["offs","🛌 My Offs"],["assignments","📋 Tasks"],["reminders","🔔 Reminders"]].map(([v,l])=>(
              <button key={v} className={`ptab ${activeTab===v?"on":""}`} style={{color:activeTab===v?"#fff":"rgba(255,255,255,.55)",borderBottomColor:activeTab===v?"#fff":"transparent",whiteSpace:"nowrap"}} onClick={()=>setActiveTab(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:800,margin:"0 auto",padding:"24px 16px"}}>

        {/* ── SCHEDULE TAB ── */}
        {activeTab==="schedule" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700}}>This Week's Schedule</div>
                <div style={{color:"#888",fontSize:13}}>{weekDays[0].date.toLocaleDateString("en-GB",{day:"numeric",month:"long"})} – {weekDays[6].date.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <select className="sel" value={selectedReminder} onChange={e=>setSelectedReminder(e.target.value)} style={{width:"auto",fontSize:12}}>
                  {REMINDER_OPTIONS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <button className="btn btn-g btn-sm" onClick={()=>exportWeekToCalendar(reminderMins)}>📅 Export Week</button>
              </div>
            </div>

            {/* Day cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:24}}>
              {userSchedule.map((d,i)=>{
                const si=d.shiftInfo;
                const isOff=d.shift==="off";
                return (
                  <div key={i} className={`day-card ${d.isToday?"day-today":""}`} style={{background:isOff?"#F9F9F7":si?.bg||"#fff",border:d.isToday?`2px solid #1D6F42`:"2px solid transparent"}}>
                    <div style={{color:"#888",fontSize:10,fontWeight:600,marginBottom:4}}>{d.day}</div>
                    <div style={{fontSize:16,fontWeight:800,color:d.isToday?"#1D6F42":d.isSun?"#EF4444":"#1A1A1A",marginBottom:6}}>{d.num}</div>
                    <div style={{background:si?.color||"#E5E5E0",color:"#fff",borderRadius:5,fontSize:9,fontWeight:700,padding:"2px 4px",marginBottom:4}}>{si?.short||"–"}</div>
                    {!isOff && <div style={{color:si?.text,fontSize:9,lineHeight:1.3}}>{si?.time}</div>}
                    {!isOff && (
                      <button style={{background:"none",border:"none",cursor:"pointer",color:"#1D6F42",fontSize:10,marginTop:6,fontWeight:600}} onClick={()=>exportToCalendar(d,reminderMins)} title="Add to calendar">+📅</button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Shift info */}
            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{fontWeight:700,marginBottom:12}}>Your Fixed Shift</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:140}}>
                  <div style={{color:"#888",fontSize:11,marginBottom:4}}>Shift Type</div>
                  <div style={{background:SHIFT_TYPES[currentUser.shift]?.bg,color:SHIFT_TYPES[currentUser.shift]?.text,borderRadius:8,padding:"8px 14px",fontWeight:700,fontSize:14,display:"inline-block"}}>
                    {currentUser.shift==="morning"?"🌅":"🌇"} {SHIFT_TYPES[currentUser.shift]?.label}
                  </div>
                </div>
                <div style={{flex:1,minWidth:140}}>
                  <div style={{color:"#888",fontSize:11,marginBottom:4}}>Hours</div>
                  <div style={{fontWeight:600,fontSize:14}}>{SHIFT_TYPES[currentUser.shift]?.time}</div>
                </div>
                <div style={{flex:1,minWidth:140}}>
                  <div style={{color:"#888",fontSize:11,marginBottom:4}}>Partner</div>
                  {(() => { const p=staff.find(x=>x.id===currentUser.partnerId&&x.active); return p ? <div style={{fontWeight:600,fontSize:14}}>🤝 {p.name}</div> : <div style={{color:"#bbb"}}>Unassigned</div>; })()}
                </div>
                <div style={{flex:1,minWidth:140}}>
                  <div style={{color:"#888",fontSize:11,marginBottom:4}}>Department</div>
                  <div style={{fontWeight:600,fontSize:14}}>{DEPARTMENTS.find(d=>d.id===currentUser.department)?.icon} {DEPARTMENTS.find(d=>d.id===currentUser.department)?.name}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OFFS TAB ── */}
        {activeTab==="offs" && (
          <div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,marginBottom:6}}>My Days Off</div>
            <div style={{color:"#888",fontSize:13,marginBottom:20}}>{monthName(viewMonth)} {viewYear}</div>

            {/* Visual tracker */}
            <div className="card" style={{padding:24,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div style={{fontWeight:700}}>Off Day Tracker</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,color:"#1D6F42"}}>{offStats.used}/{offStats.total}</div>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:16}}>
                {Array.from({length:offStats.total},(_,i)=>(
                  <div key={i} className={`off-pip ${i<offStats.used?"off-used":"off-empty"}`}>{i<offStats.used?"✓":i+1}</div>
                ))}
              </div>
              <div style={{background:"#F3F4F6",borderRadius:99,height:8,overflow:"hidden"}}>
                <div style={{background:"linear-gradient(90deg,#EF4444,#F59E0B)",borderRadius:99,height:"100%",width:`${(offStats.used/offStats.total)*100}%`,transition:"width .4s"}} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:"#888"}}>
                <span style={{color:"#EF4444",fontWeight:600}}>{offStats.used} used</span>
                <span style={{color:"#10B981",fontWeight:600}}>{offStats.total-offStats.used} remaining</span>
              </div>
            </div>

            {/* Off days list */}
            {offStats.days.length>0 ? (
              <div className="card" style={{padding:20}}>
                <div style={{fontWeight:700,marginBottom:14}}>Off Days This Month</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {offStats.days.map((d,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FEF2F2",border:"1.5px solid #FECACA",borderRadius:10,padding:"10px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{background:"#EF4444",borderRadius:"50%",color:"#fff",fontSize:12,fontWeight:700,height:32,width:32,display:"flex",alignItems:"center",justifyContent:"center"}}>{d.day}</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{d.dow}, {monthName(viewMonth).slice(0,3)} {d.day}</div>
                          <div style={{color:"#DC2626",fontSize:11}}>Day Off</div>
                        </div>
                      </div>
                      <span style={{background:"#FEE2E2",color:"#991B1B",borderRadius:20,fontSize:10,fontWeight:700,padding:"2px 9px"}}>OFF {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"40px 0",color:"#bbb"}}>
                <div style={{fontSize:36,marginBottom:10}}>🗓️</div>
                <div>No off days found for this month. Generate the roster first.</div>
              </div>
            )}
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {activeTab==="assignments" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700}}>My Tasks & Assignments</div>
                <div style={{color:"#888",fontSize:13}}>{DEPARTMENTS.find(d=>d.id===currentUser.department)?.name} Department</div>
              </div>
              {currentUser.level==="Supervisor" && (
                <button className="btn btn-g btn-sm" onClick={()=>setModal("createAssign")}>+ New Task</button>
              )}
            </div>

            {userAssignments.length===0 ? (
              <div style={{textAlign:"center",padding:"60px 0",color:"#bbb"}}>
                <div style={{fontSize:40,marginBottom:10}}>📋</div>
                <div>No assignments for your department</div>
              </div>
            ) : userAssignments.map(a => <AssignmentCard key={a.id} a={a} currentUser={currentUser} canAdmin={currentUser.level==="Supervisor"} onComplete={completeStep} onUndo={undoStep} onDelete={deleteAssignment} onReset={resetRecurring} commentInput={commentInputs[a.id]||""} onCommentChange={v=>setCommentInputs(c=>({...c,[a.id]:v}))} onComment={()=>addComment(a.id)} noteInputs={noteInputs} onNoteChange={(sid,v)=>setNoteInputs(n=>({...n,[sid]:v}))} />)}
          </div>
        )}

        {/* ── REMINDERS TAB ── */}
        {activeTab==="reminders" && (
          <div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,marginBottom:6}}>Shift Reminders</div>
            <div style={{color:"#888",fontSize:13,marginBottom:20}}>Add your shifts to your phone calendar with built-in reminders</div>

            <div className="card" style={{padding:20,marginBottom:16}}>
              <div style={{fontWeight:700,marginBottom:14}}>Choose Your Reminder Time</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {REMINDER_OPTIONS.map(r=>(
                  <label key={r.id} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",padding:"12px 14px",borderRadius:10,background:selectedReminder===r.id?"#F0FDF4":"#F9F9F7",border:`1.5px solid ${selectedReminder===r.id?"#6EE7B7":"#EBEBEA"}`,transition:"all .18s"}}>
                    <input type="radio" name="reminder" value={r.id} checked={selectedReminder===r.id} onChange={()=>setSelectedReminder(r.id)} style={{accentColor:"#1D6F42",width:16,height:16}} />
                    <span style={{fontWeight:600,fontSize:14,color:selectedReminder===r.id?"#1D6F42":"#333"}}>{r.label}</span>
                    <span style={{marginLeft:"auto",color:"#888",fontSize:12}}>{r.minutes<60?`${r.minutes}min`:r.minutes/60+"hr"} alert</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card" style={{padding:20}}>
              <div style={{fontWeight:700,marginBottom:14}}>Export Shifts to Calendar</div>
              <div style={{color:"#888",fontSize:13,marginBottom:16}}>Downloads a .ics file — opens in Google Calendar, Apple Calendar, or Outlook automatically with your chosen reminder.</div>

              <div style={{display:"flex",gap:10,marginBottom:16}}>
                <button className="btn btn-g" style={{flex:1}} onClick={()=>exportWeekToCalendar(reminderMins)}>
                  📅 Export This Week ({REMINDER_OPTIONS.find(r=>r.id===selectedReminder)?.label})
                </button>
              </div>

              <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Or export individual days:</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {userSchedule.filter(d=>d.shift!=="off").map((d,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F9F9F7",borderRadius:10,padding:"10px 14px"}}>
                    <div>
                      <span style={{fontWeight:600}}>{d.day} {d.num}</span>
                      <span style={{background:d.shiftInfo?.bg,color:d.shiftInfo?.text,borderRadius:6,fontSize:10,fontWeight:700,padding:"2px 7px",marginLeft:8}}>{d.shiftInfo?.short}</span>
                      <span style={{color:"#888",fontSize:12,marginLeft:8}}>{d.shiftInfo?.time}</span>
                    </div>
                    <button className="btn btn-o btn-xs" onClick={()=>exportToCalendar(d,reminderMins)}>+📅 Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )}

  {/* ══════════ ADMIN PANEL ══════════ */}
  {view==="admin" && adminMode && (
    <div>
      <div style={{background:"#1D6F42",padding:"0 20px",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 20px #1D6F4240"}}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0 0"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:"rgba(255,255,255,.15)",borderRadius:10,fontSize:22,height:42,width:42,display:"flex",alignItems:"center",justifyContent:"center"}}>🛒</div>
              <div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"#fff"}}>Justrite Superstore</div>
                <div style={{color:"rgba(255,255,255,.55)",fontSize:11,letterSpacing:".1em",textTransform:"uppercase"}}>Admin Panel · Ile-Ife</div>
              </div>
            </div>
            <button className="btn btn-o btn-sm" onClick={()=>{setView("login");setAdminMode(false);}}>Sign Out</button>
          </div>
          <div style={{display:"flex",gap:2,paddingBottom:0,overflowX:"auto"}}>
            {[["roster","📅 Roster"],["directory","👥 Directory"],["assignments","📋 Assignments"],["share","📤 Share"]].map(([v,l])=>(
              <button key={v} className={`ptab ${adminTab===v?"on":""}`} style={{color:adminTab===v?"#fff":"rgba(255,255,255,.55)",borderBottomColor:adminTab===v?"#fff":"transparent"}} onClick={()=>setAdminTab(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"24px 20px"}}>

        {/* ── ADMIN ROSTER ── */}
        {adminTab==="roster" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <button className="btn btn-o btn-sm" onClick={()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);}}>◀</button>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,minWidth:200,textAlign:"center"}}>{monthName(viewMonth)} {viewYear}</div>
                <button className="btn btn-o btn-sm" onClick={()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);}}>▶</button>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {currentRoster.published?<span style={{background:"#D1FAE5",color:"#065F46",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700}}>✅ Published</span>:
                 currentRoster.approved?<span style={{background:"#DBEAFE",color:"#1E40AF",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700}}>✔ Approved</span>:
                 Object.keys(rosterData).length>0?<span style={{background:"#FEF3C7",color:"#92400E",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700}}>⚠ Draft</span>:null}
                {Object.keys(rosterData).length===0&&<button className="btn btn-g" onClick={generateRoster}>⚡ Auto-Generate</button>}
                {Object.keys(rosterData).length>0&&!currentRoster.approved&&<><button className="btn btn-o btn-sm" onClick={generateRoster}>🔄 Regenerate</button><button className="btn btn-g" onClick={()=>{setPwAction("approve");setPwModal(true);setPwInput("");}}>🔒 Approve</button></>}
                {currentRoster.approved&&!currentRoster.published&&<button className="btn btn-g" onClick={()=>{setPwAction("publish");setPwModal(true);setPwInput("");}}>🚀 Publish</button>}
              </div>
            </div>

            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <input className="inp" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:180}} />
              <select className="sel" value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{maxWidth:170}}>
                <option value="all">All Departments</option>
                {DEPARTMENTS.filter(d=>!d.fixed).map(d=><option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
              </select>
              <select className="sel" value={filterShift} onChange={e=>setFilterShift(e.target.value)} style={{maxWidth:150}}>
                <option value="all">All Shifts</option>
                <option value="morning">🌅 Morning</option>
                <option value="afternoon">🌇 Afternoon</option>
              </select>
              <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                {Object.entries(SHIFT_TYPES).map(([k,v])=><span key={k} style={{background:v.bg,color:v.text,borderRadius:6,fontSize:10,fontWeight:700,padding:"3px 8px"}}>{v.short}</span>)}
              </div>
            </div>

            {Object.keys(rosterData).length===0?(
              <div style={{textAlign:"center",padding:"80px 0",color:"#bbb"}}>
                <div style={{fontSize:56,marginBottom:16}}>📋</div>
                <div style={{fontSize:17,fontWeight:700,color:"#888",marginBottom:8}}>No roster yet</div>
                <button className="btn btn-g" onClick={generateRoster}>⚡ Auto-Generate Roster</button>
              </div>
            ):(
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"separate",borderSpacing:"0 3px",minWidth:900,width:"100%"}}>
                  <thead>
                    <tr>
                      <th style={{color:"#888",fontSize:11,fontWeight:700,padding:"6px 12px",textAlign:"left",position:"sticky",left:0,background:"#F4F4F1",zIndex:10,minWidth:170}}>Staff</th>
                      {Array.from({length:getDaysInMonth(viewYear,viewMonth)},(_,i)=>{
                        const d=new Date(viewYear,viewMonth,i+1),dow=d.getDay(),isSun=dow===0,isSat=dow===6;
                        return <th key={i} style={{color:isSun?"#EF4444":isSat?"#3B82F6":"#888",fontSize:9,fontWeight:700,padding:"4px 2px",textAlign:"center",minWidth:36}}>
                          <div>{DAYS_SHORT[dow===0?6:dow-1]}</div>
                          <div style={{fontSize:11,fontWeight:800,color:isSun?"#EF4444":isSat?"#3B82F6":"#333"}}>{i+1}</div>
                        </th>;
                      })}
                      <th style={{color:"#888",fontSize:10,fontWeight:700,padding:"6px 8px",textAlign:"center",minWidth:50}}>Offs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.filter(s=>!s.fixed).map((s,si)=>{
                      const dept=DEPARTMENTS.find(d=>d.id===s.department);
                      const offs=Array.from({length:getDaysInMonth(viewYear,viewMonth)},(_,i)=>rosterData[`${s.id}-${i+1}`]).filter(v=>v==="off").length;
                      const longs=Array.from({length:getDaysInMonth(viewYear,viewMonth)},(_,i)=>rosterData[`${s.id}-${i+1}`]).filter(v=>v==="long").length;
                      return (
                        <tr key={s.id} style={{background:si%2===0?"#fff":"#FAFAF8"}}>
                          <td style={{padding:"7px 12px",position:"sticky",left:0,background:si%2===0?"#fff":"#FAFAF8",zIndex:5}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <div style={{background:avatarBg(s.name),borderRadius:"50%",color:"#fff",fontSize:10,fontWeight:700,height:28,width:28,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(s.name)}</div>
                              <div>
                                <div style={{fontSize:12,fontWeight:600}}>{s.name}</div>
                                <div style={{display:"flex",gap:3,marginTop:1}}>
                                  <span style={{background:dept?.color+"18",color:dept?.color,borderRadius:3,fontSize:8,fontWeight:700,padding:"1px 4px"}}>{dept?.name}</span>
                                  {s.level==="Supervisor"&&<span style={{background:"#F0FDF4",color:"#166534",borderRadius:3,fontSize:8,fontWeight:700,padding:"1px 4px"}}>SUP</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          {Array.from({length:getDaysInMonth(viewYear,viewMonth)},(_,i)=>{
                            const day=i+1,sk=rosterData[`${s.id}-${day}`],st=sk?SHIFT_TYPES[sk]:null;
                            const isEd=editCell?.staffId===s.id&&editCell?.day===day;
                            return (
                              <td key={i} style={{padding:"3px 2px",textAlign:"center",position:"relative"}}>
                                <div className="shift-pill" style={{background:st?.bg||"#F3F4F6",color:st?.text||"#9CA3AF",display:"inline-block"}}
                                  onClick={()=>!currentRoster.approved&&setEditCell(isEd?null:{staffId:s.id,day})}>
                                  {st?.short||"–"}
                                </div>
                                {isEd&&(
                                  <div className="cdrop" style={{top:"100%",left:"50%",transform:"translateX(-50%)"}}>
                                    {Object.entries(SHIFT_TYPES).map(([k,v])=>(
                                      <div key={k} className="copt" onClick={()=>updateCell(s.id,day,k)}>
                                        <span style={{background:v.bg,color:v.text,borderRadius:4,fontSize:9,fontWeight:700,padding:"2px 6px"}}>{v.short}</span>
                                        <span>{v.label}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td style={{padding:"6px 8px",textAlign:"center"}}>
                            <div style={{fontSize:12,fontWeight:700,color:"#6B7280"}}>{offs}</div>
                            {longs>0&&<div style={{fontSize:9,color:"#EF4444",fontWeight:700}}>{longs}L</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN DIRECTORY ── */}
        {adminTab==="directory" && (
          <div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <input className="inp" placeholder="🔍 Search staff…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:200}} />
              <select className="sel" value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{maxWidth:170}}>
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(d=><option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
              </select>
              <div style={{marginLeft:"auto",color:"#888",fontSize:13}}><strong style={{color:"#1D6F42"}}>{filteredStaff.length}</strong> staff</div>
            </div>
            {DEPARTMENTS.map(dept=>{
              const ds=filteredStaff.filter(s=>s.department===dept.id);
              if(!ds.length)return null;
              return (
                <div key={dept.id} style={{marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:18}}>{dept.icon}</span>
                    <span style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:700}}>{dept.name}</span>
                    <span style={{background:dept.color+"18",color:dept.color,borderRadius:20,fontSize:11,fontWeight:700,padding:"2px 9px"}}>{ds.length}</span>
                  </div>
                  <div className="card" style={{overflow:"hidden"}}>
                    {ds.map((s,i)=>{
                      const partner=staff.find(p=>p.id===s.partnerId&&p.active);
                      return (
                        <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderTop:i>0?"1px solid #F3F3F1":"none"}}>
                          <div style={{background:avatarBg(s.name),borderRadius:"50%",color:"#fff",fontSize:11,fontWeight:700,height:34,width:34,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(s.name)}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                            <div style={{color:"#999",fontSize:11}}>{s.id} · {s.phone}</div>
                          </div>
                          <span style={{background:s.level==="Supervisor"?"#F0FDF4":"#F9FAFB",color:s.level==="Supervisor"?"#166534":"#374151",borderRadius:20,fontSize:10,fontWeight:700,padding:"2px 9px"}}>{s.level}</span>
                          <span style={{background:s.shift==="morning"?"#FEF3C7":"#DBEAFE",color:s.shift==="morning"?"#92400E":"#1E40AF",borderRadius:20,fontSize:10,fontWeight:700,padding:"2px 9px"}}>{s.shift==="morning"?"🌅":"🌇"} {s.shift}</span>
                          {partner&&<span style={{color:"#999",fontSize:11}}>🤝 {partner.name.split(" ")[0]}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ADMIN ASSIGNMENTS ── */}
        {adminTab==="assignments" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700}}>Assignments & Tasks</div>
                <div style={{color:"#888",fontSize:13}}>Create, manage and track department tasks</div>
              </div>
              <button className="btn btn-g" onClick={()=>setModal("createAssign")}>+ New Assignment</button>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <select className="sel" value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{maxWidth:170}}>
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(d=><option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
              </select>
            </div>
            {visibleAssignments.map(a=><AssignmentCard key={a.id} a={a} currentUser={{id:"ADMIN",name:"Admin",department:"admin",level:"Supervisor",shift:"—"}} canAdmin={true} onComplete={completeStep} onUndo={undoStep} onDelete={deleteAssignment} onReset={resetRecurring} commentInput={commentInputs[a.id]||""} onCommentChange={v=>setCommentInputs(c=>({...c,[a.id]:v}))} onComment={()=>addComment(a.id)} noteInputs={noteInputs} onNoteChange={(sid,v)=>setNoteInputs(n=>({...n,[sid]:v}))} />)}
          </div>
        )}

        {/* ── ADMIN SHARE ── */}
        {adminTab==="share" && (
          <div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,marginBottom:6}}>Share Roster</div>
            <div style={{color:"#888",fontSize:13,marginBottom:20}}>Send individual schedules via WhatsApp or Telegram</div>
            {!currentRoster.published&&<div style={{background:"#FEF3C7",border:"1.5px solid #FDE68A",borderRadius:10,color:"#92400E",fontSize:13,padding:"12px 16px",marginBottom:16}}>⚠️ Publish the roster first before sharing.</div>}
            <div className="card" style={{overflow:"hidden"}}>
              {staff.filter(s=>s.active&&!s.fixed).map((s,i)=>{
                const dept=DEPARTMENTS.find(d=>d.id===s.department);
                const days=getDaysInMonth(viewYear,viewMonth);
                const offs=Array.from({length:days},(_,j)=>rosterData[`${s.id}-${j+1}`]).filter(v=>v==="off").length;
                const msg=encodeURIComponent(`*Justrite Superstore – ${monthName(viewMonth)} ${viewYear}*\n\nHi ${s.name.split(" ")[0]} 👋\nYour roster has been published. Please log in to the staff portal to view your full schedule.\n\nPortal: justrite.staff.app\nYour ID: ${s.id}\n\n_— HR, Justrite Ile-Ife_`);
                const ph=s.phone.replace(/\D/g,"");
                return (
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderTop:i>0?"1px solid #F3F3F1":"none"}}>
                    <div style={{background:avatarBg(s.name),borderRadius:"50%",color:"#fff",fontSize:11,fontWeight:700,height:34,width:34,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(s.name)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                      <div style={{color:"#999",fontSize:11}}>{dept?.icon} {dept?.name} · {s.shift} · {offs} offs</div>
                    </div>
                    <button style={{background:"#25D366",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700,padding:"6px 12px"}} onClick={()=>window.open(`https://wa.me/234${ph.slice(1)}?text=${msg}`,"_blank")}>WhatsApp</button>
                    <button style={{background:"#0088CC",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700,padding:"6px 12px"}} onClick={()=>window.open(`https://t.me/share/url?url=&text=${msg}`,"_blank")}>Telegram</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )}

  {/* ══════════ CREATE ASSIGNMENT MODAL ══════════ */}
  {modal==="createAssign" && (
    <div className="mo" onClick={()=>setModal(null)}>
      <div className="md" style={{maxWidth:560}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700}}>New Assignment</div>
          <button onClick={()=>setModal(null)} style={{background:"#F5F5F2",border:"none",borderRadius:"50%",cursor:"pointer",fontSize:16,height:32,width:32}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label>Title *</label><input className="inp" placeholder="e.g. Restock Sugar Aisle" value={newForm.title} onChange={e=>setNewForm(f=>({...f,title:e.target.value}))} /></div>
          <div><label>Description</label><textarea className="inp" rows={2} placeholder="Details…" value={newForm.description} onChange={e=>setNewForm(f=>({...f,description:e.target.value}))} style={{resize:"vertical"}} /></div>
          <div className="fg">
            <div><label>Priority</label>
              <select className="sel" value={newForm.priority} onChange={e=>setNewForm(f=>({...f,priority:e.target.value}))}>
                <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🔵 Low</option>
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:20}}>
              <input type="checkbox" id="rec" checked={newForm.recurring} onChange={e=>setNewForm(f=>({...f,recurring:e.target.checked}))} style={{accentColor:"#1D6F42",width:16,height:16}} />
              <label htmlFor="rec" style={{fontSize:13,fontWeight:600,textTransform:"none",letterSpacing:0,color:"#333",marginBottom:0,cursor:"pointer"}}>Recurring task</label>
            </div>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <label style={{marginBottom:0}}>Steps / Chain (in order)</label>
              <button className="btn btn-o btn-xs" onClick={()=>setNewForm(f=>({...f,steps:[...f.steps,{dept:"cashier",title:""}]}))}>+ Add Step</button>
            </div>
            {newForm.steps.map((step,i)=>(
              <div key={i} style={{background:"#F9F9F7",borderRadius:10,padding:"12px",marginBottom:8,border:"1.5px solid #EBEBEA"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{background:"#1D6F42",borderRadius:"50%",color:"#fff",fontSize:11,fontWeight:700,height:22,width:22,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</span>
                  <span style={{color:"#888",fontSize:11}}>{i>0?"🔒 Unlocks after step "+i:""}</span>
                  {newForm.steps.length>1&&<button className="btn btn-r btn-xs" style={{marginLeft:"auto"}} onClick={()=>setNewForm(f=>({...f,steps:f.steps.filter((_,j)=>j!==i)}))}>✕</button>}
                </div>
                <div className="fg">
                  <select className="sel" value={step.dept} onChange={e=>setNewForm(f=>({...f,steps:f.steps.map((s,j)=>j===i?{...s,dept:e.target.value}:s)}))}>
                    {DEPARTMENTS.map(d=><option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
                  </select>
                  <input className="inp" placeholder="What to do…" value={step.title} onChange={e=>setNewForm(f=>({...f,steps:f.steps.map((s,j)=>j===i?{...s,title:e.target.value}:s)}))} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20,paddingTop:16,borderTop:"1px solid #F0F0EC"}}>
          <button className="btn btn-o" onClick={()=>setModal(null)}>Cancel</button>
          <button className="btn btn-g" onClick={saveAssignment}>✅ Create Assignment</button>
        </div>
      </div>
    </div>
  )}

  {/* ══════════ PASSWORD MODAL ══════════ */}
  {pwModal&&(
    <div className="mo" onClick={()=>setPwModal(false)}>
      <div className="md" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{fontSize:36,marginBottom:10}}>🔐</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:700}}>{pwAction==="approve"?"Approve Roster":"Publish Roster"}</div>
          <div style={{color:"#888",fontSize:13,marginTop:4}}>Enter admin password to continue</div>
        </div>
        <input className="inp" type="password" placeholder="Password…" value={pwInput} onChange={e=>setPwInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitPw()} autoFocus style={{textAlign:"center",fontSize:16,marginBottom:14}} />
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-o" style={{flex:1}} onClick={()=>setPwModal(false)}>Cancel</button>
          <button className="btn btn-g" style={{flex:1}} onClick={submitPw}>{pwAction==="approve"?"✅ Approve":"🚀 Publish"}</button>
        </div>
      </div>
    </div>
  )}

  {toast&&<div className={`toast t${toast.type}`}>{toast.msg}</div>}
  {editCell&&<div style={{position:"fixed",inset:0,zIndex:100}} onClick={()=>setEditCell(null)} />}
</div>
```

);
}

// ── Assignment Card Component ──────────────────────────────────────────────
function AssignmentCard({a, currentUser, canAdmin, onComplete, onUndo, onDelete, onReset, commentInput, onCommentChange, onComment, noteInputs, onNoteChange}) {
const [expanded, setExpanded] = useState(true);
const [showComments, setShowComments] = useState(false);
const allDone = a.steps.every(s=>s.done);
const doneCount = a.steps.filter(s=>s.done).length;
const userStep = a.steps.find(s=>s.dept===currentUser.department&&!s.done&&!s.locked);

return (
<div style={{background:”#fff”,border:`1.5px solid ${allDone?"#6EE7B7":"#EBEBEA"}`,borderRadius:14,marginBottom:14,overflow:“hidden”,transition:“all .2s”}}>
{/* Header */}
<div style={{padding:“14px 18px”,cursor:“pointer”,display:“flex”,alignItems:“flex-start”,gap:12}} onClick={()=>setExpanded(e=>!e)}>
<div style={{flex:1}}>
<div style={{display:“flex”,alignItems:“center”,gap:8,flexWrap:“wrap”,marginBottom:4}}>
<span style={{fontWeight:700,fontSize:15}}>{a.title}</span>
<span className={`priority-${a.priority}`}>{a.priority}</span>
{a.recurring&&<span className="recurring-badge">🔄 Recurring</span>}
{allDone&&<span style={{background:”#D1FAE5”,color:”#065F46”,borderRadius:20,fontSize:10,fontWeight:700,padding:“2px 9px”}}>✅ Complete</span>}
</div>
<div style={{color:”#888”,fontSize:12}}>{a.description}</div>
<div style={{display:“flex”,gap:10,marginTop:6,alignItems:“center”}}>
<div style={{background:”#F3F4F6”,borderRadius:99,height:5,flex:1,overflow:“hidden”}}>
<div style={{background:”#1D6F42”,borderRadius:99,height:“100%”,width:`${(doneCount/a.steps.length)*100}%`,transition:“width .4s”}} />
</div>
<span style={{color:”#888”,fontSize:11,whiteSpace:“nowrap”}}>{doneCount}/{a.steps.length} steps</span>
</div>
</div>
<div style={{display:“flex”,gap:6,alignItems:“center”}}>
{canAdmin&&a.recurring&&allDone&&<button className=“btn btn-o btn-xs” onClick={e=>{e.stopPropagation();onReset(a.id);}}>🔄 Reset</button>}
{canAdmin&&<button className=“btn btn-r btn-xs” onClick={e=>{e.stopPropagation();onDelete(a.id);}}>🗑</button>}
<span style={{color:”#bbb”,fontSize:14}}>{expanded?“▲”:“▼”}</span>
</div>
</div>

```
  {expanded&&(
    <div style={{padding:"0 18px 18px"}}>
      {/* Steps */}
      {a.steps.map((step,i)=>{
        const dept=DEPARTMENTS.find(d=>d.id===step.dept);
        const canDo = !step.locked && !step.done && (currentUser.department===step.dept || canAdmin);
        const noteVal = noteInputs?.[step.id]||"";
        return (
          <div key={step.id} className={`step-card ${step.done?"step-done":""} ${step.locked?"step-locked":""}`}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{background:step.done?"#10B981":step.locked?"#9CA3AF":"#1D6F42",borderRadius:"50%",color:"#fff",fontSize:11,fontWeight:700,height:26,width:26,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                {step.done?"✓":step.locked?"🔒":i+1}
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:13}}>{step.title}</span>
                  <span style={{background:dept?.color+"18",color:dept?.color,borderRadius:20,fontSize:10,fontWeight:700,padding:"2px 8px"}}>{dept?.icon} {dept?.name}</span>
                  {step.locked&&<span style={{color:"#9CA3AF",fontSize:11}}>🔒 Waiting for step {i}</span>}
                </div>
                {step.done&&step.doneBy&&(
                  <div style={{background:"#F0FDF4",borderRadius:8,padding:"8px 12px",marginBottom:8,fontSize:12}}>
                    <span style={{color:"#166534",fontWeight:600}}>✅ Done by {step.doneBy.name}</span>
                    <span style={{color:"#888",marginLeft:8}}>{DEPARTMENTS.find(d=>d.id===step.doneBy.dept)?.icon} {step.doneBy.dept} · {step.doneBy.shift} shift</span>
                    <span style={{color:"#bbb",marginLeft:8,fontSize:11}}>{new Date(step.doneAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                    {step.note&&<div style={{color:"#555",marginTop:4,fontStyle:"italic"}}>"{step.note}"</div>}
                  </div>
                )}
                {canDo&&(
                  <div style={{marginTop:8}}>
                    <input className="inp" placeholder="Add a note (optional)…" value={noteVal} onChange={e=>onNoteChange(step.id,e.target.value)} style={{marginBottom:8,fontSize:12}} />
                    <button className="btn btn-g btn-sm" onClick={()=>onComplete(a.id,step.id,noteVal)}>✓ Mark as Done</button>
                  </div>
                )}
                {step.done&&(canAdmin||currentUser.department===step.dept)&&(
                  <button className="btn btn-o btn-xs" style={{marginTop:6}} onClick={()=>onUndo(a.id,step.id)}>↩ Undo</button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Comments */}
      <div style={{marginTop:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontWeight:600,fontSize:13}}>💬 Comments ({a.comments.length})</span>
          <button className="btn btn-o btn-xs" onClick={()=>setShowComments(s=>!s)}>{showComments?"Hide":"Show"}</button>
        </div>
        {showComments&&(
          <>
            {a.comments.map(c=>(
              <div key={c.id} className="comment-bubble">
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{background:avatarBg(c.author.name),borderRadius:"50%",color:"#fff",fontSize:9,fontWeight:700,height:22,width:22,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials(c.author.name)}</div>
                  <span style={{fontWeight:600,fontSize:12}}>{c.author.name}</span>
                  <span style={{color:"#bbb",fontSize:10}}>{DEPARTMENTS.find(d=>d.id===c.author.dept)?.name} · {c.author.shift}</span>
                  <span style={{color:"#ccc",fontSize:10,marginLeft:"auto"}}>{new Date(c.at).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                </div>
                <div style={{fontSize:13,color:"#333",paddingLeft:30}}>{c.text}</div>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input className="inp" placeholder="Add a comment…" value={commentInput} onChange={e=>onCommentChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onComment()} style={{fontSize:12}} />
              <button className="btn btn-g btn-sm" onClick={onComment}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  )}
</div>
```

);
}
