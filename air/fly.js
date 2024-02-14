import*as t from"https://cdn.jsdelivr.net/npm/d3@7/+esm";import e from"https://unpkg.com/moment@2.29.4/dist/moment.js";let MGN=50,chart,parent,parentId,legend,legendId,width=750,height,x,y,pinpoint,xAxis,addCircle,start,end,boxHeight=10,margin={top:20,right:10,bottom:20,left:130},transition=t.transition().duration(500),states=["출발","탑승중","탑승준비","마감예정","탑승마감","도착","결항","회항","착륙","지연"],color=t.scaleOrdinal().domain(states).range(["#808000","#911eb4","#f58231","#4363d8","#3cb44b","#000075","#800000","#f032e6","#469990","#e6194B"]).unknown("#ccc"),tooltip,createTooltip=function(t){t.classed("tooltip",!0)},getTooltipContent=function(t){return`<b>비행기번호: ${t.plane}</b>
		<br/>
		<b>상태: ${t.state}</b>
		<div>플랫폼: ${t.gate}</div>
		<div>예정시간: ${e(t.schedule).format("MM-DD HH:mm")}</div>
		`},searchInput;function _search(){search(this.value.trim())}function search(e){if(e){let a=RegExp(e,"i");chart.classed("g-searching",!0),chart.selectAll("circle").classed("g-match",t=>a.test(t.plane));let n=t.selectAll(".g-match");if(1==n.nodes().length){n.classed("g-active",!0);let r=n.datum();tooltip.style("opacity",1).style("left",window.innerWidth/2-tooltip.node().offsetWidth/2+"px").style("top","200px").style("background-color",color(r.state)).html(getTooltipContent(r));return}}else searchInput.property("value","");tooltip.style("opacity",0),chart.classed("g-searching",!1),chart.selectAll("circle").classed("g-match",!1).classed("g-active",!1)}function init(){Promise.all([t.csv("../files/fly-in.csv"),t.csv("../files/fly-out.csv"),]).then(function(a){let n=[];for(let r of a)n=n.concat(r.map(t=>({...t,gate:+t.gate,schedule:new Date(t.schedule),update_schedule:new Date(t.update_schedule)})));start=t.min(n,a=>{let n=t.min([a.schedule,a.update_schedule]);return new Date(e(n).add(-3,"m"))}),end=t.max(n,a=>{let n=t.max([a.schedule,a.update_schedule]);return new Date(e(n).add(3,"m"))}),go(n,start,end)}).catch(function(t){console.log(t)})}function injectAirlines(e){t.select("#airline").on("change",function(t){console.log("change item",t.target.value)}).selectAll(null).data(e).enter().append("option").text(t=>t).attr("value",t=>t)}function go(e,a,n){parent.style.height=window.innerHeight-200-50-60+"px",parent.style.overflowY="auto";let r=t.group(e,t=>t.airline),i=Array.from(r.keys()).sort(t.ascending);injectAirlines(i);let l=getGroupData(e);height=_height(l),xAxis=_xAxis(x=t.scaleTime().domain([a,n]).range([0,width-margin.left]),height),pinpoint=_pinpoint(x,y=_y(l,i),l),addCircle=_addCircle(r),_legend(summarize(e)),chart=_chart(i,a,n)}function getGroupData(e){let a=new Map;return t.group(e,t=>t.airline).forEach((e,n)=>{let r=t.group(e,t=>t.type),i={};r.forEach((e,a)=>{let n=t.rollup(e,t=>t.length,t=>t.schedule),r=new Map;n.forEach((t,e)=>{t>1&&r.set(e,{count:t,left:t})});let l=t.max(n.values());i[a]={max:l,multiple:r}}),i.max=(i.in?.max||0)+(i.out?.max||0),a.set(n,i)}),a}function _height(e){let a=t.sum(e.values(),t=>t.max);return margin.top+14*a+50*e.size}function _xAxis(e,a){return n=>n.attr("id","x-axis").attr("transform",`translate(${margin.left}, ${margin.top})`).call(t.axisTop(e)).call(t=>t.selectAll(".tick line").attr("stroke-opacity",.1).attr("y2",a-margin.bottom)).call(t=>t.selectAll(".domain").remove())}function _y(e,a){let n=margin.top+50,r=[];return a.forEach(t=>{let a=e.get(t),i=a.out?.max||1;i>6&&(i=6);let l=a.in?.max||1;l>6&&(l=6),n+=10*i,r.push(n),n+=10*l,n+=50}),t.scaleOrdinal().domain(a).range(r)}function loc(t,e,a){return"-"==t?-(e*a*1):e*a*1}function _pinpoint(e,a,n){return function(r){let i=t.select(this),l=n.get(r.airline)[r.type].multiple,o="out"==r.type?"-":"+";if(!l||!l.has(r.schedule)){i.attr("opacity",.1).attr("cy",a(r.airline)).attr("cx",margin.left+e(new Date(r.schedule))).transition(transition).attr("opacity",.9).attr("cy",a(r.airline)+loc(o,1,12));return}if(l.has(r.schedule)){let s=l.get(r.schedule),c=s.count,d=s.left--;if(c<=6){i.attr("opacity",.1).attr("cy",a(r.airline)).attr("cx",margin.left+e(new Date(r.schedule))).transition(transition).attr("opacity",.9).attr("cy",a(r.airline)+loc(o,d,12));return}let p=Math.floor((c-d)/2),h=(c-d)%2==0;!h&&p++,i.attr("opacity",.1).attr("cy",a(r.airline)).attr("cx",margin.left+e(new Date(r.schedule))+loc(h?"+":"-",1,6)).transition(transition).attr("opacity",.9).attr("cy",a(r.airline)+loc(o,p,12))}}}function _addCircle(e){return function(a){t.select(this).selectAll("circle").data(e.get(a)).join("circle").attr("r",5).attr("stroke-width",.5).attr("stroke","black").attr("fill",t=>color(t.state)).on("mousemove",function(e,a){search(),t.select(this).classed("g-active",!0);let n=e.pageX-tooltip.node().offsetWidth,r=e.pageY-tooltip.node().offsetHeight;tooltip.style("opacity",1).style("top",r+"px").style("left",n+"px").style("background-color",color(a.state)).html(getTooltipContent(a)),t.select("#"+a.airline+" text").attr("font-weight","bold")}).on("mouseleave",function(e,a){t.select(this).classed("g-active",!1),tooltip.style("opacity",0),t.select("#"+a.airline+" text").attr("font-weight","")}).each(pinpoint)}}function summarize(e){return t.rollup(e,t=>t.length,t=>t.state)}let min_width=470;function _legend(e){if(width<470){legend.style.display="none";return}let a=470+Math.floor(Math.sqrt(width-470)),n=t.scaleLinear([0,states.length/2],[0,a]),r=t.select(legendId).append("svg").attr("text-anchor","start").attr("height",40).attr("width",a).attr("transform","translate(20 0)");r.append("g").call(t=>t.selectAll("rect").data(states).join("rect").attr("width",23).attr("height",15).attr("x",0).attr("rx",3).attr("opacity",0).transition(transition).attr("opacity",1).attr("x",(t,e)=>(e>=5&&(e-=5),n(e))).attr("y",(t,e)=>e<5?0:18).attr("fill",t=>color(t))).call(t=>t.selectAll("text").data(states).join("text").attr("x",0).attr("dy","0.2em").attr("font-size",10).attr("fill",t=>color(t)).attr("opacity",0).transition(transition).attr("opacity",1).attr("x",(t,e)=>(e>=5&&(e-=5),n(e)+27)).attr("y",(t,e)=>e<5?10:28).text(t=>t)),r.append("g").selectAll("text").data(states).join("text").attr("text-anchor","end").attr("font-weight","bold").attr("x",0).attr("dy","0.15em").attr("font-size","8pt").attr("fill","snow").attr("opacity",0).transition(transition).attr("opacity",1).attr("x",(t,e)=>(e>=5&&(e-=5),n(e)+18)).attr("y",(t,e)=>e<5?10:28).text(t=>e.get(t)||0)}function _chart(e,a,n){parseInt(parent.style.height)<height&&(width-=20);let r=t.select(parentId).append("svg").attr("width",width).attr("height",height).attr("viewBox",[0,0,width,height]).attr("transform",(t,e)=>`translate(0 ${margin.top})`);r.append("g").call(xAxis),r.append("g").attr("transform",(t,e)=>`translate(${margin.left} ${height-margin.bottom})`).call(t.axisBottom(x)).call(t=>t.selectAll(".domain").remove());let i=r.append("line").attr("class","line").attr("display","none").attr("y1",margin.top).attr("y2",height-margin.bottom).attr("stroke","rgba(0,0,0,0.2)").style("pointer-events","none").attr("transform",`translate(${margin.left+20})`),l=r.append("g").style("font","11px sans-serif").selectAll("g").data(e).join("g").attr("id",t=>t);return l.append("line").attr("stroke","#777").attr("x1",margin.left+x(a)).attr("x2",width).attr("y1",t=>y(t)).attr("y2",t=>y(t)),l.append("text").attr("text-anchor","end").attr("x",margin.left-10).attr("y",t=>y(t)).attr("dy","0.35em").text(t=>t),l.each(addCircle),r.on("mousemove",e=>{let[n,r]=t.pointer(e);x(a)+margin.left>=n||i.attr("transform",`translate(${n} 0)`)}).on("mouseover",e=>{t.select(".line").attr("display","block")}).on("mouseout",e=>{t.select(".line").attr("display","none")}),r}export default{tooltipId:function(e){return tooltip=t.select("#"+e).call(createTooltip),this},searchId:function(e){return searchInput=t.select("#"+e).on("search",_search).on("keyup",_search),this},legendEl:function(t){return legend=t,legendId="#"+t.id,this},parentEl:function(t){return parent=t,parentId="#"+t.id,width=t.offsetWidth,this},build:()=>init()};