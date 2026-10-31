const $=s=>document.querySelector(s),inr=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const STAGES=["Draft","Quotation","Confirmed","Active","Closed"],TAX=0.18;
const S={role:null,page:"dash",q:"",f:"",staffId:"rohit",customerId:1};
const nextYear=()=>{const [year,month,day]=TODAY.split("-").map(Number);return `${year+1}-${String(month).padStart(2,"0")}-${String(Math.min(day,new Date(year+1,month,0).getDate())).padStart(2,"0")}`};
const cust=id=>DB.customers.find(c=>c.id==id),plan=id=>DB.plans.find(p=>p.id==id);
const badge=s=>`<span class="b ${s.toLowerCase()}">${s}</span>`;
const addDays=(d,n)=>new Date(+new Date(d)+n*864e5).toISOString().slice(0,10);
const ist=i=>i.status=="Confirmed"&&i.due<TODAY?"Overdue":i.status;
const paidOf=i=>DB.payments.filter(p=>p.inv==i.id).reduce((a,p)=>a+p.amt,0);
function discFor(s,date){return DB.discounts.find(d=>s.qty>=d.minQty&&date>=d.from&&date<=d.to&&d.used<d.limit)}
function makeInvoice(s,period,date,seed){
 const pl=plan(s.plan),sub=s.qty*pl.price,d=discFor(s,date);let off=0;
 if(d){off=d.type=="%"?sub*d.value/100:d.value;if(!seed)d.used++}
 const tax=(sub-off)*TAX,days=parseInt(s.terms.replace(/\D/g,""));
 DB.invoices.push({id:"INV-"+String(DB.invoices.length+1).padStart(4,"0"),sub:s.id,cust:s.cust,period,date,due:addDays(date,days),
  lines:`${s.qty} × ${pl.name}`,sub_t:sub,disc:off,discName:d?d.name:"",tax,total:sub-off+tax,status:"Confirmed"});
}
(function seed(){DB.subs.filter(s=>s.status=="Active"||s.status=="Closed").forEach((s,i)=>{makeInvoice(s,"Sep 2026","2026-09-"+(10+i),true)});
 DB.invoices.forEach((v,i)=>{if(i%2==0){v.status="Paid";DB.payments.push({id:DB.payments.length+1,inv:v.id,method:["UPI","Bank Transfer","Card"][i%3],amt:v.total,date:addDays(v.date,6),note:"Received"})}})})();
const NAV={admin:[["dash","Dashboard"],["subs","Subscriptions"],["inv","Invoices"],["pay","Payments"],["prod","Products"],["plans","Plans"],["disc","Discounts"],["staff","Staff"]],
 staff:[["dash","Dashboard"],["subs","Subscriptions"],["inv","Invoices"],["pay","Payments"],["plans","Plans"]],customer:[["subs","My Subscriptions"],["inv","My Invoices"]]};
const STAFF=[
 {id:"rohit",name:"Rohit Mehra",email:"rohit@brightloop.com",customers:[2,4,6]},
 {id:"sneha",name:"Sneha Iyer",email:"sneha@brightloop.com",customers:[3,5,7,8]}];
const visibleCustomerIds=()=>S.role=="admin"?DB.customers.map(c=>c.id):S.role=="staff"?(STAFF.find(s=>s.id==S.staffId)||STAFF[0]).customers:[S.customerId];
const visibleSubs=()=>DB.subs.filter(s=>visibleCustomerIds().includes(s.cust));
const visibleInvoices=()=>DB.invoices.filter(i=>visibleCustomerIds().includes(i.cust));
const visiblePayments=()=>{const ids=new Set(visibleInvoices().map(i=>i.id));return DB.payments.filter(p=>ids.has(p.inv))};
function toast(m){const t=$("#toast");t.textContent=m;t.className="on";setTimeout(()=>t.className="",2200)}
function downloadFile(filename,content,type){
 try{
  const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement("a");
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Download started: "+filename);
 }catch(error){console.error("File download failed",error);toast("Download failed. Please allow downloads and try again.")}
}
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
window.downloadData=()=>{
 const customerIds=visibleCustomerIds(),subscriptions=visibleSubs(),invoices=visibleInvoices(),payments=visiblePayments();
 const planIds=new Set(subscriptions.map(s=>s.plan));
 const data={exportedAt:new Date().toISOString(),role:S.role,account:S.role=="customer"?cust(S.customerId):S.role=="staff"?STAFF.find(s=>s.id==S.staffId):{name:"Brightloop Admin"},
  customers:DB.customers.filter(c=>customerIds.includes(c.id)),subscriptions,invoices,payments,
  plans:DB.plans.filter(p=>S.role=="admin"||planIds.has(p.id))};
 if(S.role=="admin")Object.assign(data,{products:DB.products,discounts:DB.discounts,staff:STAFF});
 downloadFile(`brightloop-${S.role}-data-${TODAY}.json`,JSON.stringify(data,null,2),"application/json;charset=utf-8");
};
window.downloadReceipt=id=>{
 const invoice=visibleInvoices().find(i=>i.id==id);
 if(!invoice){toast("Receipt unavailable for this account");return}
 const customer=cust(invoice.cust),payments=DB.payments.filter(p=>p.inv==invoice.id),received=paidOf(invoice);
 const paid=Math.min(received,invoice.total),balance=Math.max(0,invoice.total-paid);
 const status=balance===0?"Paid":paid>0?"Partially paid":ist(invoice);
 const rows=`<tr><td>${escapeHtml(invoice.lines)}</td><td>${inr(invoice.sub_t)}</td></tr>${invoice.disc?`<tr><td>Discount${invoice.discName?` (${escapeHtml(invoice.discName)})`:""}</td><td>−${inr(invoice.disc)}</td></tr>`:""}<tr><td>Tax</td><td>${inr(invoice.tax)}</td></tr>`;
 const paymentRows=payments.map(p=>`<tr><td>${escapeHtml(p.date)} · ${escapeHtml(p.method)}</td><td>${inr(p.amt)}</td></tr>`).join("");
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Receipt ${escapeHtml(invoice.id)}</title><style>body{font:15px/1.5 system-ui,sans-serif;color:#1e2235;max-width:720px;margin:40px auto;padding:0 20px}.top,.row{display:flex;justify-content:space-between;gap:20px}.muted{color:#6b7190}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:10px;border-bottom:1px solid #e6e8f2}td:last-child{text-align:right}h1{color:#5b4bdb}.total{font-weight:700;font-size:20px}.print{padding:9px 14px;background:#5b4bdb;color:#fff;border:0;border-radius:8px;cursor:pointer}@media print{.print{display:none}body{margin:0 auto}}</style></head><body><div class="top"><div><h1>Brightloop</h1><p class="muted">Invoice / payment receipt</p></div><div><h2>${escapeHtml(invoice.id)}</h2><p class="muted">Issued ${escapeHtml(invoice.date)}</p></div></div><hr><h3>Billed to</h3><p>${escapeHtml(customer?.name)}<br>${escapeHtml(customer?.email)}</p><p><strong>Billing period:</strong> ${escapeHtml(invoice.period)}<br><strong>Due date:</strong> ${escapeHtml(invoice.due)}<br><strong>Status:</strong> ${escapeHtml(status)}</p><table>${rows}<tr class="total"><td>Total</td><td>${inr(invoice.total)}</td></tr>${paymentRows}<tr><td>Amount received</td><td>${inr(paid)}</td></tr><tr class="total"><td>Balance due</td><td>${inr(balance)}</td></tr></table><p class="muted">Thank you for your business.</p><button class="print" onclick="window.print()">Print / Save as PDF</button></body></html>`;
 downloadFile(`receipt-${invoice.id}.html`,html,"text/html;charset=utf-8");
};
function modal(title,fields,fn){const m=$("#modal");m.classList.remove("hidden");
 m.innerHTML=`<form><h3 style="margin:0">${title}</h3>${fields.map(f=>`<label>${f[1]}${f[2]=="select"?`<select name="${f[0]}">${f[3].map(o=>`<option>${o}</option>`).join("")}</select>`:`<input name="${f[0]}" type="${f[2]||"text"}" value="${f[3]||""}" required>`}</label>`).join("")}
 <div class="bar"><button class="btn">Save</button><button type="button" class="btn ghost" onclick="$('#modal').classList.add('hidden')">Cancel</button></div></form>`;
 m.firstChild.onsubmit=e=>{e.preventDefault();fn(Object.fromEntries(new FormData(e.target)));m.classList.add("hidden");render()}}
const table=(h,rows)=>`<div class="card tw"><table><tr>${h.map(x=>`<th>${x}</th>`).join("")}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")||`<tr><td colspan=${h.length}>Nothing here yet</td></tr>`}</table></div>`;
const filt=(arr,fn)=>arr.filter(x=>(!S.f||fn(x)==S.f)&&(!S.q||JSON.stringify(x).toLowerCase().includes(S.q.toLowerCase())));
const bar=(opts)=>`<div class="bar"><input placeholder="Search…" value="${S.q}" oninput="S.q=this.value;render(1)"><select onchange="S.f=this.value;render()"><option value="">All status</option>${opts.map(o=>`<option ${S.f==o?"selected":""}>${o}</option>`).join("")}</select>`;
const P={
dash(){const subs=visibleSubs(),invoices=visibleInvoices(),payments=visiblePayments();
 const act=subs.filter(s=>s.status=="Active").length,rev=payments.reduce((a,p)=>a+p.amt,0);
 const out=invoices.filter(i=>i.status!="Paid").reduce((a,i)=>a+i.total,0),od=invoices.filter(i=>ist(i)=="Overdue");
 const mrr=subs.filter(s=>s.status=="Active").reduce((a,s)=>{const p=plan(s.plan);return a+s.qty*p.price/(p.billing=="Yearly"?12:p.billing=="Weekly"?.23:1)},0);
 const m=[["May",180],["Jun",260],["Jul",310],["Aug",420],["Sep",Math.round(rev/1000)],["Oct",Math.round(rev/1400)]];
 return`<div class="grid">${[["Active subscriptions",act],["MRR",inr(mrr)],["Revenue collected",inr(rev)],["Outstanding",inr(out)],["Overdue invoices",od.length]].map(k=>`<div class="card kpi"><small>${k[0]}</small><b>${k[1]}</b></div>`).join("")}</div>
 <div class="card" style="margin-bottom:20px"><b>Revenue (₹ thousand)</b><div class="bars" style="margin-top:14px">${m.map(x=>`<div><i style="height:${x[1]/3.2}px"></i>${x[0]}</div>`).join("")}</div></div>
 <h3>Overdue invoices</h3>`+table(["Invoice","Customer","Due","Amount"],od.map(i=>[i.id,cust(i.cust).name,i.due,inr(i.total)]))},
subs(){let l=visibleSubs();l=filt(l,s=>s.status);
 return bar(STAGES)+(S.role!="customer"?`<button class="btn" onclick="newSub()">+ New subscription</button>`:"")+`</div>`+
 table(["No.","Customer","Plan","Qty","Start","Expiry","Terms","Progress","Status",""],l.map(s=>{const i=STAGES.indexOf(s.status);
 return[s.id,cust(s.cust).name,plan(s.plan).name,s.qty,s.start,s.end,s.terms,`<div class="steps">${STAGES.map((_,k)=>`<s class="${k<=i?"d":""}"></s>`).join("")}</div>`,badge(s.status),
 S.role!="customer"&&i<4?`<button class="btn sm ghost" onclick="adv('${s.id}')">→ ${STAGES[i+1]}</button>`:""]}))},
inv(){let l=visibleInvoices().map(i=>({...i,st:ist(i)}));l=filt(l,i=>i.st).reverse();
 return bar(["Draft","Confirmed","Paid","Overdue"])+(S.role!="customer"?`<button class="btn" onclick="runBilling()">⚡ Run billing (${PERIOD})</button>`:"")+`</div>`+
 table(["Invoice","Customer","Period","Lines","Discount","Tax","Total","Due","Status",""],l.map(i=>[i.id,cust(i.cust).name,i.period,i.lines,i.disc?`−${inr(i.disc)}`:"—",inr(i.tax),`<b>${inr(i.total)}</b>`,i.due,badge(i.st),
 `<button class="btn sm ghost" onclick="downloadReceipt('${i.id}')">Download receipt</button>${i.st!="Paid"&&S.role!="customer"?` <button class="btn sm" onclick="payModal('${i.id}')">Record payment</button>`:""}`]))},
pay(){return table(["#","Invoice","Method","Amount","Date","Note"],[...visiblePayments()].reverse().map(p=>[p.id,p.inv,p.method,inr(p.amt),p.date,p.note]))},
prod(){return`<button class="btn" onclick="newProd()" style="margin-bottom:14px">+ New product</button>`+table(["Product","Type","Sales price","Cost","Variants","Notes"],DB.products.map(p=>[p.name,p.type,inr(p.price),inr(p.cost),p.variants.map(v=>`${v.n} (+${v.x})`).join(", ")||"—",p.notes]))},
plans(){return table(["Plan","Product","Price","Billing","Min qty","Available","Auto-close"],DB.plans.map(p=>[p.name,DB.products.find(x=>x.id==p.product).name,inr(p.price),p.billing,p.minQty,`${p.from} → ${p.to}`,p.auto?"Yes":"Manual"]))},
disc(){return`<button class="btn" onclick="newDisc()" style="margin-bottom:14px">+ New discount rule</button>`+table(["Rule","Value","Min qty","Validity","Used","State"],DB.discounts.map(d=>[d.name,d.type=="%"?d.value+"%":inr(d.value),d.minQty,`${d.from} → ${d.to}`,`${d.used}/${d.limit}`,badge(d.used>=d.limit||d.to<TODAY?"Closed":"Active")]))},
staff(){return`<button class="btn" onclick="modal('Add staff',[['n','Name'],['e','Email','email']],d=>toast('Staff added: '+d.n))" style="margin-bottom:14px">+ Add staff member</button>`+table(["Name","Email","Role","Assigned customers"],STAFF.map(s=>[s.name,s.email,"Staff",s.customers.map(id=>cust(id).name).join(", ")]).concat([["Admin","admin@brightloop.com","Admin","All customers"]]))}};
window.adv=id=>{const s=DB.subs.find(x=>x.id==id);s.status=STAGES[STAGES.indexOf(s.status)+1];toast(id+" → "+s.status);render()};
window.runBilling=()=>{let n=0;visibleSubs().filter(s=>s.status=="Active"&&!DB.invoices.some(i=>i.sub==s.id&&i.period==PERIOD)).forEach(s=>{makeInvoice(s,PERIOD,TODAY);n++});
 toast(n?`${n} invoice(s) created automatically`:"Nothing to bill — no duplicates created");render()};
window.payModal=id=>{const i=DB.invoices.find(x=>x.id==id);modal("Record payment · "+id,[["m","Method","select",["UPI","Bank Transfer","Card","Cash"]],["a","Amount","number",Math.round(i.total)],["d","Date","date",TODAY],["n","Note"]],d=>{
 DB.payments.push({id:DB.payments.length+1,inv:id,method:d.m,amt:+d.a,date:d.d,note:d.n});if(paidOf(i)>=i.total-1)i.status="Paid";toast("Payment recorded")})};
window.newSub=()=>modal("New subscription",[["c","Customer","select",DB.customers.filter(c=>visibleCustomerIds().includes(c.id)).map(c=>c.name)],["p","Plan","select",DB.plans.map(p=>p.name)],["q","Quantity","number",1],["s","Start","date",TODAY],["e","Expiry","date",nextYear()],["t","Payment terms","select",["Net 7","Net 15","Net 30"]]],d=>
 DB.subs.push({id:"SUB-"+String(DB.subs.length+1).padStart(3,"0"),cust:DB.customers.find(c=>c.name==d.c).id,plan:DB.plans.find(p=>p.name==d.p).id,qty:+d.q,start:d.s,end:d.e,terms:d.t,status:"Draft"}));
window.newProd=()=>modal("New product",[["n","Name"],["t","Type","select",["Software","Add-on","Service"]],["p","Sales price","number"],["c","Cost price","number"],["o","Notes"]],d=>DB.products.push({id:DB.products.length+1,name:d.n,type:d.t,price:+d.p,cost:+d.c,notes:d.o,variants:[]}));
window.newDisc=()=>modal("New discount rule",[["n","Name"],["t","Type","select",["%","Fixed"]],["v","Value","number"],["q","Min quantity","number",1],["f","From","date",TODAY],["to","To","date","2027-03-31"],["l","Usage limit","number",50]],d=>DB.discounts.push({id:DB.discounts.length+1,name:d.n,type:d.t,value:+d.v,minQty:+d.q,from:d.f,to:d.to,limit:+d.l,used:0}));
function pwOk(p){return p.length>8&&/[A-Z]/.test(p)&&/[a-z]/.test(p)&&/[^A-Za-z0-9]/.test(p)}
window.login=(role,profileId)=>{S.role=role;if(role=="staff")S.staffId=profileId||STAFF[0].id;if(role=="customer")S.customerId=Number(profileId)||1;S.page=role=="customer"?"subs":"dash";S.q=S.f="";render()};
window.tryLogin=e=>{e.preventDefault();const p=e.target.pw.value;if(!pwOk(p)){$("#err").textContent="Password needs 9+ chars, uppercase, lowercase and a special character.";return}
 const user=DB.customers.find(c=>c.email.toLowerCase()==e.target.email.value.trim().toLowerCase());if(!user){$("#err").textContent="Use an email address from the sample customer list.";return}login("customer",user.id)};
function render(keep){const root=$("#app");
 if(!S.role){root.innerHTML=`<div class="login"><h1>Bright<span style="color:var(--pri)">loop</span></h1><p style="color:var(--mut)">Subscription management, one place.</p>
 <form class="card" onsubmit="tryLogin(event)"><label>Email<input name="email" type="email" required value="asha@traders.in"></label><label>Password<input name="pw" type="password" required></label><div id="err" class="err"></div>
 <button class="btn">Sign in</button><a href="#" onclick="toast('Reset link sent to your registered email');return false" style="font-size:12px">Forgot password?</a></form>
 <div class="demo-profiles"><label>Staff demo account<select id="staffDemo">${STAFF.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}</select></label><label>Customer demo account<select id="customerDemo">${DB.customers.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select></label></div>
 <div class="demo"><button class="btn ghost" onclick="login('admin')">Demo: Admin</button><button class="btn ghost" onclick="login('staff',$('#staffDemo').value)">Demo: Staff</button><button class="btn ghost" onclick="login('customer',$('#customerDemo').value)">Demo: Customer</button></div></div>`;return}
 const nav=NAV[S.role],cur=nav.find(n=>n[0]==S.page)||nav[0];
 root.innerHTML=`<div class="shell"><aside class="side"><div class="logo">Bright<span>loop</span></div>${nav.map(n=>`<a class="${n[0]==cur[0]?"on":""}" onclick="S.page='${n[0]}';S.q=S.f='';render()">${n[1]}</a>`).join("")}<a onclick="S.role=null;render()" style="margin-top:20px">Sign out</a></aside>
 <main class="main" id="main"><div class="top"><h1>${cur[1]}</h1><div class="top-actions"><button class="btn ghost" onclick="downloadData()">Download data (JSON)</button><span class="b">${S.role=="customer"?escapeHtml(cust(S.customerId).name):S.role=="staff"?escapeHtml(STAFF.find(s=>s.id==S.staffId).name):"ADMIN"}</span></div></div>${P[cur[0]]()}</main></div>`;
 if(keep){const i=$(".bar input");if(i){i.focus();i.setSelectionRange(99,99)}}}
render();
