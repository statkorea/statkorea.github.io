import*as t from"https://cdn.jsdelivr.net/npm/d3@7/+esm";import e from"https://unpkg.com/moment@2.29.4/dist/moment.js";let MGN=50,chart,parent,parentId,lastModifiedId,legendEl,legendId,width=750,height,x,y,pinpoint,xAxis,addCircle,start,end,boxHeight=10,margin={top:20,right:10,bottom:20,left:130},kac_states=["출발","수속중","탑승구 변경","탑승장 입장","탑승중","마감예정","탑승최종","도착","결항","지연","회항"],ic_states=["출발","체크인오픈","탑승준비","탑승중","마감예정","탑승마감","착륙","도착","결항","지연","회항"],states,color,IST,last_airport,trans=()=>t.transition().duration(500),tooltip,createTooltip=function(t){t.classed("tooltip",!0)},getTooltipContent=function(t){return`<b>비행기번호: ${t.plane}</b>
		<br/>
		<b>상태: ${t.state}</b>
		<div>플랫폼: ${t.gate}</div>
		<div>예정시간: ${e(t.schedule).format("MM-DD HH:mm")}</div>
		`},searchInput;function _search(){search(this.value.trim())}function search(e){if(e){let a=RegExp(e,"i");chart.classed("g-searching",!0),chart.selectAll("circle").classed("g-match",t=>a.test(t.plane));let n=t.selectAll(".g-match");if(1==n.nodes().length){n.classed("g-active",!0);let r=n.datum();tooltip.style("opacity",1).style("left",window.innerWidth/2-tooltip.node().offsetWidth/2+"px").style("top","200px").style("background-color",color(r.state)).html(getTooltipContent(r));return}}else searchInput.property("value","");tooltip.style("opacity",0),chart.classed("g-searching",!1),chart.selectAll("circle").classed("g-match",!1).classed("g-active",!1)}function getHours(){let t=new Date,a=new Date().getHours();return[e(t.setHours(a-1)).format("HHmm"),e(t.setHours(a+2)).format("HHmm")]}function init(a){t.select(lastModifiedId).text(e(new Date).format("YYYY-MM-DD HH:mm:ss")),"icn"!=(IST="ICN"==(last_airport=a||"CJJ")?"icn":"kac")?(states=kac_states,color=t.scaleOrdinal().domain(kac_states).range(["#000075","#3cb44b","#f58231","#9A6324","#808000","#469990","#800000","#e6194B","#f032e6","#911eb4"]).unknown("#ccc")):(states=ic_states,color=t.scaleOrdinal().domain(states).range(["#000075","#3cb44b","#9A6324","#808000","#42d4f4","#469990","#4363d8","#800000","#e6194B","#f032e6","#911eb4"]).unknown("#ccc"));{let n=getHours();fetch("https://statkorea.modoree.kr/airport?sh="+n[0]+"&eh="+n[1]+"&branch="+last_airport).then(async a=>{let n=await a.json(),r=[t.csvParse(n.i),t.csvParse(n.o)],l=[];for(let i of r)l=l.concat(i.map(t=>({...t,gate:+t.gate,schedule:new Date(t.schedule),update_schedule:new Date(t.update_schedule)})));start=t.min(l,a=>{let n=t.min([a.schedule,a.update_schedule]);return new Date(e(n).add(-3,"m"))}),end=t.max(l,a=>{let n=t.max([a.schedule,a.update_schedule]);return new Date(e(n).add(3,"m"))}),go(l,start,end)}).catch(function(t){console.log(t)})}}function injectAirlines(e){t.selectAll("#airline option").remove(),t.select("#airline").on("change",function(t){console.log("change item",t.target.value)}).selectAll(null).data(e).enter().append("option").text(t=>t).attr("value",t=>t)}function go(e,a,n){parent.style.height=window.innerHeight-200-50-60+"px",parent.style.overflowY="auto";let r=t.group(e,t=>t.airline),l=Array.from(r.keys()).sort(t.ascending),i=getGroupData(e);height=_height(i),xAxis=_xAxis(x=t.scaleTime().domain([a,n]).range([0,width-margin.left]),height),pinpoint=_pinpoint(x,y=_y(i,l),i),addCircle=_addCircle(r),_legend(summarize(e)),chart=_chart(l,a,n)}function getGroupData(e){let a=new Map;return t.group(e,t=>t.airline).forEach((e,n)=>{let r=t.group(e,t=>t.type),l={};r.forEach((e,a)=>{let n=t.rollup(e,t=>t.length,t=>t.schedule),r=new Map;n.forEach((t,e)=>{t>0&&r.set(e.getTime(),{count:t,left:t})});let i=t.max(n.values());l[a]={max:i,multiple:r}}),l.max=(l.I?.max||1)+(l.O?.max||1),a.set(n,l)}),a}function _height(e){let a=t.sum(e.values(),t=>t.max);return margin.top+12*a+(e.size+1)*50+margin.bottom}function _xAxis(e,a){return n=>n.attr("id","x-axis").attr("transform",`translate(${margin.left}, ${margin.top})`).call(t.axisTop(e)).call(t=>t.selectAll(".tick line").attr("stroke-opacity",.1).attr("y2",a-margin.bottom)).call(t=>t.selectAll(".domain").remove())}function _y(e,a){let n=margin.top,r=[];return a.forEach(t=>{let a=e.get(t),l=a.O?.max||1;l>6&&(l=6);let i=a.I?.max||1;i>6&&(i=6),n+=50,n+=12*l,r.push(n),n+=12*i}),t.scaleOrdinal().domain(a).range(r)}function loc(t,e,a){return"-"==t?-(e*a*1):e*a*1}function _pinpoint(e,a,n){return function(r){let l=t.select(this),i=n.get(r.airline)[r.type].multiple,o="O"==r.type?"-":"+";if(!i||!i.has(r.schedule.getTime())){l.attr("opacity",.1).attr("cy",a(r.airline)).attr("cx",margin.left+e(new Date(r.schedule))).attr("opacity",.9).attr("cy",a(r.airline)+loc(o,1,12));return}if(i.has(r.schedule.getTime())){let s=i.get(r.schedule.getTime()),c=s.count,d=s.left--;if(c<=6){l.attr("opacity",.1).attr("cy",a(r.airline)).attr("cx",margin.left+e(new Date(r.schedule))).attr("opacity",.9).attr("cy",t=>{let e=loc(o,d,12);return a(t.airline)+e});return}}let p=Math.floor((count-left)/2),g=(count-left)%2==0;!g&&p++,l.attr("opacity",.1).attr("cy",a(r.airline)).attr("cx",margin.left+e(new Date(r.schedule))+loc(g?"+":"-",1,6)).attr("opacity",.9).attr("cy",a(r.airline)+loc(o,p,12))}}function _addCircle(e){return function(a){t.select(this).selectAll("circle").data(e.get(a)).join("circle").attr("r",5).attr("stroke-width",.5).attr("stroke","black").attr("fill",t=>color(t.state)).on("mousemove",function(e,a){search(),t.select(this).classed("g-active",!0);let n=e.pageX-tooltip.node().offsetWidth,r=e.pageY-tooltip.node().offsetHeight;tooltip.style("opacity",1).style("top",r+"px").style("left",n+"px").style("background-color",color(a.state)).html(getTooltipContent(a)),t.select("#"+a.airline+" text").attr("font-weight","bold")}).on("mouseleave",function(e,a){t.select(this).classed("g-active",!1),tooltip.style("opacity",0),t.select("#"+a.airline+" text").attr("font-weight","")}).each(pinpoint)}}function summarize(e){return t.rollup(e,t=>t.length,t=>t.state)}let min_width=470,legendx,kac_legend,icn_legend;function _legend(e){if(width<470){legendEl.style.display="none";return}if(0==document.querySelectorAll("#"+IST+"-legend").length){"icn"==IST?(icn_legend=legend(e),kac_legend?.attr("display","none")):(kac_legend=legend(e),icn_legend?.attr("display","none"));return}let a="icn"==IST?icn_legend:kac_legend;icn_legend?.attr("display","icn"==IST?"block":"none"),kac_legend?.attr("display","kac"==IST?"block":"none"),a.selectAll(".size").transition(trans()).each(function(a){t.select(this).text(t=>e.get(t)||0)})}function legend(e){let a=470+Math.floor(Math.sqrt(width-470));legendx=t.scaleLinear([0,5],[0,a]);let n=t.select(legendId).append("svg").attr("text-anchor","start").attr("height",60).attr("width",a).attr("id",IST+"-legend").attr("transform","translate(20 0)");return n.append("g").call(t=>t.selectAll("rect").data(states).join("rect").attr("width",23).attr("height",15).attr("x",0).attr("rx",3).attr("opacity",0).transition(trans()).attr("opacity",1).attr("x",(t,e)=>legendx(e%5)).attr("y",(t,e)=>18*Math.floor(e/5)).attr("fill",t=>color(t))).call(t=>t.selectAll("text").data(states).join("text").attr("x",0).attr("dy","0.2em").attr("font-size",10).attr("fill",t=>color(t)).attr("class","label").attr("opacity",0).transition(trans()).attr("opacity",1).attr("x",(t,e)=>legendx(e%5)+27).attr("y",(t,e)=>18*Math.floor(e/5)+10).text(t=>t)),n.append("g").selectAll("text").data(states).join("text").attr("text-anchor","end").attr("font-weight","bold").attr("x",0).attr("dy","0.15em").attr("font-size","8pt").attr("fill","snow").attr("class","size").attr("opacity",0).transition(trans()).attr("opacity",1).attr("x",(t,e)=>legendx(e%5)+18).attr("y",(t,e)=>18*Math.floor(e/5)+10).text(t=>e.get(t)||0),n}function _chart(e,a,n){let r=t.select("#chart").attr("width",width).attr("height",height).attr("viewBox",[0,0,width,height]).attr("transform",(t,e)=>`translate(0 ${margin.top})`);r.call(t=>t.selectAll("g").remove()).call(t=>t.selectAll("line").remove()),r.append("g").call(xAxis),r.append("g").attr("transform",(t,e)=>`translate(${margin.left} ${height-margin.bottom})`).call(t.axisBottom(x)).call(t=>t.selectAll(".domain").remove());let l=r.append("line").attr("class","line").attr("display","none").attr("y1",margin.top).attr("y2",height-margin.bottom).attr("stroke","rgba(0,0,0,0.2)").style("pointer-events","none").attr("transform",`translate(${margin.left+20})`),i=r.append("g").style("font","11px sans-serif").selectAll("g").data(e).join("g").attr("id",t=>t);return i.append("line").attr("stroke","#777").attr("x1",margin.left+x(a)).attr("x2",width).attr("y1",t=>y(t)).attr("y2",t=>y(t)),i.append("text").attr("text-anchor","end").attr("x",margin.left-10).attr("y",t=>y(t)).attr("dy","0.35em").text(t=>t),i.each(addCircle),r.on("mousemove",e=>{let[n,r]=t.pointer(e);x(a)+margin.left>=n||l.attr("transform",`translate(${n} 0)`)}).on("mouseover",e=>{t.select(".line").attr("display","block")}).on("mouseout",e=>{t.select(".line").attr("display","none")}),r}export default{tooltipId:function(e){return tooltip=t.select("#"+e).call(createTooltip),this},searchId:function(e){return searchInput=t.select("#"+e).on("search",_search).on("keyup",_search),this},legendEl:function(t){return legendEl=t,legendId="#"+t.id,this},parentEl:function(t){return parent=t,parentId="#"+t.id,width=t.offsetWidth-20,this},lastModifiedId:function(t){return lastModifiedId="#"+t,this},reload:function(){init(last_airport)},build:function(t){return init(t),this}};