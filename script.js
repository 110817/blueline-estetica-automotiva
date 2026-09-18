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
  {quote:'A qualidade me surpreendeu positivamente, recebi um serviço nota 100. Restauração de faróis, limpeza completa de motor e chassi, higienização de bancos e itens de tecido, couro e etc.',name:'Felipe Freire',initials:'FF',role:'Cliente Blueline'},
  {quote:'Atendimento impecável e o serviço de primeira. Fiz polimento e lavagem detalhada na Tracker da minha mãe. Retornarei para mais no futuro.',name:'Maurício Abreu',initials:'MA',role:'Cliente Blueline'},
  {quote:'Pode confiar! Desde o início ele foi super solícito, respondeu super rápido e explicou todas as dúvidas que tinha. Deixei o carro uma semana com eles, foi excelente o serviço.',name:'Erika Calixto',initials:'EC',role:'Local Guide'},
  {quote:'Desde o primeiro contato, já senti muita segurança nos serviços prestados e na retirada do veículo. Fiquei ainda mais tranquilo com a qualidade do serviço e profissionalismo da equipe.',name:'Joaquim 3167',initials:'J',role:'Cliente Blueline'},
  {quote:'Fiquei impressionado com o cuidado meticuloso e a atenção aos detalhes demonstrados pelo Nicolas. Cada canto do meu veículo foi cuidadosamente limpo, deixando-o impecável e com um aspecto renovado.',name:'Juliano Santos',initials:'JS',role:'Local Guide'}
];
let current=0;
const box=document.getElementById('testimonial');
const dots=document.getElementById('dots');
function render(){
  if(!box||!dots)return;
  const t=testimonials[current];
  box.innerHTML='<div class="stars">★★★★★</div><div class="google">GOOGLE</div><div class="quote">“'+t.quote+'”</div><div class="person"><div class="avatar">'+t.initials+'</div><div><b>'+t.name+'</b><small>'+t.role+'</small></div></div>';
  dots.innerHTML=testimonials.map((_,i)=>'<button class="dot '+(i===current?'active':'')+'" data-i="'+i+'" aria-label="Mostrar avaliação '+(i+1)+'"></button>').join('');
  dots.querySelectorAll('.dot').forEach(d=>d.addEventListener('click',()=>{current=Number(d.dataset.i);render();}));
}
document.querySelector('.prev')?.addEventListener('click',()=>{current=(current-1+testimonials.length)%testimonials.length;render();});
document.querySelector('.next')?.addEventListener('click',()=>{current=(current+1)%testimonials.length;render();});
render();