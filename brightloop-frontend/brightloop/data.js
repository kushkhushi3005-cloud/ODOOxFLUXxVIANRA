const TODAY_DATE=new Date();
const TODAY=[TODAY_DATE.getFullYear(),String(TODAY_DATE.getMonth()+1).padStart(2,"0"),String(TODAY_DATE.getDate()).padStart(2,"0")].join("-");
const PERIOD=`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][TODAY_DATE.getMonth()]} ${TODAY_DATE.getFullYear()}`;
const DB={
products:[
{id:1,name:"Brightloop CRM",type:"Software",price:1200,cost:400,notes:"Core CRM suite",variants:[{n:"Odoo brand",x:560},{n:"Zoho brand",x:300}]},
{id:2,name:"Billing Add-on",type:"Add-on",price:450,cost:120,notes:"Extra invoicing tools",variants:[]},
{id:3,name:"Analytics Pro",type:"Software",price:2200,cost:800,notes:"Dashboards & reports",variants:[{n:"Standard",x:0},{n:"Enterprise",x:900}]}],
plans:[
{id:1,name:"CRM Monthly",product:1,price:1200,billing:"Monthly",minQty:1,from:"2026-01-01",to:"2027-12-31",auto:true},
{id:2,name:"CRM Yearly",product:1,price:12000,billing:"Yearly",minQty:5,from:"2026-01-01",to:"2027-12-31",auto:false},
{id:3,name:"Add-on Weekly",product:2,price:120,billing:"Weekly",minQty:1,from:"2026-03-01",to:"2026-12-31",auto:true},
{id:4,name:"Analytics Monthly",product:3,price:2200,billing:"Monthly",minQty:2,from:"2026-02-01",to:"2027-06-30",auto:false}],
customers:[
{id:1,name:"Asha Traders",email:"asha@traders.in"},{id:2,name:"Nova Logistics",email:"ops@novalog.com"},
{id:3,name:"Kiran Bakery",email:"kiran@bakery.in"},{id:4,name:"Helix Pharma",email:"it@helixpharma.com"},{id:5,name:"Urban Threads",email:"hi@urbanthreads.in"},
{id:6,name:"Cedar & Co",email:"hello@cedarco.in"},{id:7,name:"Mapleworks Design",email:"team@mapleworks.in"},
{id:8,name:"Acme Education",email:"admin@acmeedu.in"}],
subs:[
{id:"SUB-001",cust:1,plan:1,qty:5,start:"2026-06-01",end:"2027-06-01",terms:"Net 15",status:"Active"},
{id:"SUB-002",cust:2,plan:2,qty:12,start:"2026-04-15",end:"2027-04-15",terms:"Net 30",status:"Active"},
{id:"SUB-003",cust:3,plan:1,qty:2,start:"2026-08-01",end:"2027-08-01",terms:"Net 15",status:"Active"},
{id:"SUB-004",cust:4,plan:4,qty:10,start:"2026-09-10",end:"2027-09-10",terms:"Net 30",status:"Confirmed"},
{id:"SUB-005",cust:5,plan:3,qty:8,start:"2026-10-20",end:"2026-12-31",terms:"Net 7",status:"Quotation"},
{id:"SUB-006",cust:1,plan:3,qty:3,start:"2026-02-01",end:"2026-09-30",terms:"Net 15",status:"Closed"},
{id:"SUB-007",cust:2,plan:4,qty:6,start:"2026-10-28",end:"2027-10-28",terms:"Net 15",status:"Draft"},
{id:"SUB-008",cust:6,plan:2,qty:7,start:"2026-07-12",end:"2027-07-12",terms:"Net 30",status:"Active"},
{id:"SUB-009",cust:7,plan:4,qty:3,start:"2026-08-20",end:"2027-08-20",terms:"Net 15",status:"Active"},
{id:"SUB-010",cust:8,plan:1,qty:15,start:"2026-10-01",end:"2027-10-01",terms:"Net 7",status:"Active"}],
discounts:[
{id:1,name:"Seat Saver 10%",type:"%",value:10,minQty:10,from:"2026-01-01",to:"2026-12-31",limit:50,used:3},
{id:2,name:"Welcome ₹500",type:"Fixed",value:500,minQty:1,from:"2026-09-01",to:"2026-11-30",limit:20,used:20}],
invoices:[],payments:[]};
