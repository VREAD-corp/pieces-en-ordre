/*! audience anonyme, sans cookie (même principe que octave-checkout/gas/web/mesure.js). Tests (?octave_notrack=1), navigateurs automatisés et robots : compteur « exclu » à part ; l'user agent est lu ici, jamais envoyé. */
((n,l,d)=>{let p=l.pathname,q=new URLSearchParams(l.search),A=(k,f)=>d.addEventListener(k,f,!0),b,t,v,x='',s,go;
if(n.doNotTrack=='1'||n.globalPrivacyControl||l.hostname!='pieces-en-ordre.jalonel.com')return;
v=window.octaveCro&&octaveCro.v('price');
try{s=localStorage;if(q.has('octave_notrack'))q.get('octave_notrack')=='1'?s.setItem('octave_notrack','1'):s.removeItem('octave_notrack');s.getItem('octave_notrack')=='1'&&(x='notrack')}catch(e){}
x=x||(q.get('octave_notrack')=='1'?'notrack':n.webdriver?'webdriver':/bot\b|crawl|spider|slurp|headless|lighthouse|pagespeed|inspectiontool|googleother|mediapartners|bingpreview|phantom|puppeteer|playwright|selenium/i.test(n.userAgent||'')?'bot':'');
b={v:2,site:'pieces-en-ordre',page:p,ref_domain:d.referrer.split('/')[2],device:innerWidth<768?'mobile':'desktop',variant:v=='a'||v=='b'?v:''};
if(x)b.excluded=x;
for(let g of['source','medium','campaign'])b['utm_'+g]=q.get('utm_'+g);
t=e=>{b.event=e;b.ts=Date.now();try{fetch('__ENDPOINT__?action=track',{method:'POST',keepalive:!0,credentials:'omit',redirect:'manual',body:JSON.stringify(b)}).catch(e=>0)}catch(e){}};
window.poTrack=t;
go=()=>{t('view');/\/commander\//.test(p)&&t('order_view');/\/pack\//.test(p)&&t('pack_view')};
// page préchargée : comptée seulement si elle est ouverte
if(d.prerendering)d.addEventListener('prerenderingchange',go,{once:!0});
else if(d.visibilityState=='prerender'){let w=()=>{if(d.visibilityState!='prerender'){d.removeEventListener('visibilitychange',w);go()}};d.addEventListener('visibilitychange',w)}
else go();
A('click',e=>{let a=e.target.closest&&e.target.closest('a,button'),h=a&&a.dataset.mesure;h&&t(h)})})(navigator,location,document)
