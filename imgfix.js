/* يحوّل مسارات img/... إلى الصور المضمّنة (imgdata*.js) */
(function(){
  var M=window.IMGS||{};
  function fixEl(el){
    if(el.nodeType!==1)return;
    if(el.tagName==="IMG"){var s=el.getAttribute("src");if(s&&M[s])el.setAttribute("src",M[s]);}
    var st=el.getAttribute&&el.getAttribute("style");
    if(st&&st.indexOf("img/")>-1){el.setAttribute("style",st.replace(/img\/[a-z]+\.(jpg|png)/g,function(p){return M[p]||p;}));}
    for(var c=el.firstElementChild;c;c=c.nextElementSibling)fixEl(c);
  }
  new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(fixEl);});}).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded",function(){fixEl(document.documentElement);});
  window.imgSrc=function(p){return M[p]||p;};
})();
