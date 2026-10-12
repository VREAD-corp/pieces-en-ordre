/*! audience anonyme, sans cookie (même principe que octave-checkout/gas/web/mesure.js) */
((n,l,d)=>{let p=l.pathname,q=new URLSearchParams(l.search),A=(k,f)=>d.addEventListener(k,f,!0),b,t,v;
if(n.doNotTrack=='1'||n.globalPrivacyControl||l.hostname!='outils.vread.fr')return;
try{v=localStorage.getItem('po_v')}catch(e){}
b={site:'pieces-en-ordre',page:p,ref_domain:d.referrer.split('/')[2],device:innerWidth<768?'mobile':'desktop',variant:v=='a'||v=='b'?v:''};
for(let g of['source','medium','campaign'])b['utm_'+g]=q.get('utm_'+g);
t=e=>{b.event=e;b.ts=Date.now();try{fetch('__ENDPOINT__?action=track',{method:'POST',keepalive:!0,credentials:'omit',redirect:'manual',body:JSON.stringify(b)}).catch(e=>0)}catch(e){}};
window.poTrack=t;
t('view');/\/commander\//.test(p)&&t('order_view');/\/pack\//.test(p)&&t('pack_view');
A('click',e=>{let a=e.target.closest&&e.target.closest('a,button'),h=a&&a.dataset.mesure;h&&t(h)})})(navigator,location,document)
