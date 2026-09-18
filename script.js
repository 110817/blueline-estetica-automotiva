const video=document.getElementById('serviceVideo');
const sound=document.getElementById('soundControl');
if(video){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        video.muted=true;
        video.play().catch(()=>{});
      }else{
        video.pause();
      }
    });
  },{threshold:.55});
  observer.observe(video);
}
if(sound&&video){
  sound.addEventListener('click',()=>{
    video.muted=!video.muted;
    if(video.paused) video.play().catch(()=>{});
    sound.querySelector('strong').textContent=video.muted?'Ative o som':'Som ativado';
    sound.querySelector('small').textContent=video.muted?'Ativar o som do vídeo':'Clique para silenciar';
  });
}
const testimonials=[
  {quote:'A qualidade me surpreendeu positivamente, recebi um serviço nota 100. Restauração de faróis, limpeza completa de motor e chassi, higienização de bancos e itens de tecido, couro e etc.',name:'Felipe Freire',initials:'FF'},
  {quote:'Atendimento cuidadoso, serviço muito bem executado e atenção aos detalhes do começo ao fim.',name:'Cliente Blueline',initials:'CB'},
  {quote:'O carro ficou com excelente acabamento. Dá para perceber o cuidado no resultado final.',name:'Cliente Blueline',initials:'CB'},
  {quote:'Equipe atenciosa e trabalho caprichado. O resultado ficou acima da expectativa.',name:'Cliente Blueline',initials:'CB'},
  {quote:'Boa experiência, comunicação clara e serviço entregue com muito cuidado.',name:'Cliente Blueline',initials:'CB'}
];
let current=0;
const box=document.getElementById('testimonial');
const dots=document.getElementById('dots');
function render(){
  if(!box||!dots)return;
  const t=testimonials[current];
  box.innerHTML='<div class="stars">★★★★★</div><div class="google">GOOGLE</div><div class="quote">“'+t.quote+'”</div><div class="person"><div class="avatar">'+t.initials+'</div><div><b>'+t.name+'</b><small>Cliente Blueline</small></div></div>';
  dots.innerHTML=testimonials.map((_,i)=>'<button class="dot '+(i===current?'active':'')+'" data-i="'+i+'" aria-label="Mostrar avaliação '+(i+1)+'"></button>').join('');
  dots.querySelectorAll('.dot').forEach(d=>d.addEventListener('click',()=>{current=Number(d.dataset.i);render();}));
}
document.querySelector('.prev')?.addEventListener('click',()=>{current=(current-1+testimonials.length)%testimonials.length;render();});
document.querySelector('.next')?.addEventListener('click',()=>{current=(current+1)%testimonials.length;render();});
render();