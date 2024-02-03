import{region}from"../js/cm.js";import Scrubber from"../js/scrubber.js";import*as d3 from"https://cdn.jsdelivr.net/npm/d3@7/+esm";let years=d3.range(2008,(new Date).getFullYear(),1);const metropolitans=[{code:"SD",value:"수도권"},{code:"DN",value:"동남권"},{code:"CC",value:"충청권"},{code:"HN",value:"호남권"},{code:"DG",value:"대경권"},{code:"GW",value:"강원권"},{code:"JJ",value:"제주권"}];let tooltip,createTooltip=function(t){t.classed("tooltip",!0)};const color=d3.scaleOrdinal().domain(metropolitans.map(t=>t.code)).range(d3.schemeCategory10.map(t=>d3.interpolateRgb(t,"white")(.5)));function _index(t,e){return t(d3.range(e.years.length),{el_id:scrubber_id,delay:1500,loop:!1,format:t=>""})}async function _data(){const[t,e]=await Promise.all([d3.csv("../files/census_regions.csv"),d3.tsv("../files/population.tsv")]).then(([t,e])=>[t,e.slice(1).map(t=>{return{name:t[""],values:years.map(e=>+t[e])}})]),a=new Map(t.map(t=>[t.State,t.Region]));return{years:years,group:d3.group(e,t=>a.get(t.name))}}function _legend(){if(width<min_width)return;let t=min_width+Math.sqrt(width-min_width),e=d3.transition().duration(500),a=d3.scaleBand().domain(metropolitans.map(t=>t.code)).range([0,t]);d3.select(parentId).append("svg").attr("text-anchor","start").attr("id","legend").attr("height",20).attr("width",t).attr("transform","translate(20 0)").append("g").call(t=>t.selectAll("circle").data(metropolitans).join("circle").attr("r",5).attr("cx",0).attr("cy",0).attr("opacity",0).transition(e).attr("opacity",1).attr("cx",({code:t})=>a(t)).attr("fill",({code:t})=>color(t))).call(t=>t.selectAll("text").data(metropolitans).join("text").attr("x",0).attr("y",3).attr("dy","0.2em").attr("font-size",10).attr("fill",t=>color(t)).attr("opacity",0).transition(e).attr("opacity",1).attr("x",({code:t})=>a(t)+7).text(({value:t})=>t))}function registerEvent(t){document.addEventListener("input",e=>t.update(e.target.value,2500))}function init(){_data().then(t=>{for(let e of t.group)e[1].forEach(t=>t.name=region(t.name));_legend(),registerEvent(_chart(t))})}let parentId,scrubber_id,width=720;const min_width=500,height=500,portion_format=d3.format(".2%"),parseNumber=t=>+t.replace(/,/g,""),formatNumber=d3.format(",d");export default{tooltipId:function(t){return tooltip=d3.select("#"+t).call(createTooltip),this},scrubberId:function(t){return scrubber_id=t,this},years:function(t,e){return t<2008&&(t=2008),e>(new Date).getFullYear()&&(e=(new Date).getFullYear()),years=d3.range(t,e,1),console.log(years),this},parentEl:function(t){return parentId="#"+t.id,width=t.offsetWidth,this},build:()=>init()};function _chart(t){const e=_index(Scrubber,t).value;let a=d3.hierarchy(t.group);const r=d3.max(t.years,(t,e)=>a.sum(t=>t.values[e]).value),n=d3.treemap().size([width,height]).tile(d3.treemapResquarify).padding(t=>1===t.height?1:0).round(!0),i=n(a.sum(t=>{if(Array.isArray(t.values)){return d3.sum(t.values)}return 0}).sort((t,e)=>e.value-t.value)),o=d3.select(parentId).append("svg").attr("width",width).attr("height",height).attr("viewBox",[0,0,width,height]);let l,s=999999999;const d=o.append("g").selectAll("g").data(t.years.map((t,e)=>{const a=i.sum(t=>t.values[e]).value;if(999999999==s){let t=Math.min(s,a);s=1e4*Math.floor(t/1e4)}return r==a&&(l=e),{year:t,value:a,i:e,k:Math.sqrt((a-s)/(r-s))}}).reverse()).join("g").attr("transform",({k:t})=>{return`translate(${(1-t)/2*width}, ${(1-t)/2*height})`}).attr("opacity",({i:t})=>t==e+1?1:0).call(t=>t.append("text").attr("y",-5).attr("fill","#777").selectAll("tspan").data(({year:t,value:e})=>[t,` ${formatNumber(e)}`]).join("tspan").attr("font-weight",(t,e)=>0===e?"bold":null).text(t=>t)).call(t=>t.append("rect").attr("fill","none").attr("stroke","#ccc").attr("width",({k:t})=>t*width).attr("height",({k:t})=>t*height));let c=m(e);const u=o.append("g").selectAll("g").data(c).join("g").attr("transform",t=>`translate(${t.x0}, ${t.y0})`).on("mousemove",function(t,e){let a=t.pageX-tooltip.node().offsetWidth,r=t.pageY-tooltip.node().offsetHeight,n=`<b>시도: ${e.data.name}</b><br /> 전국대비 비율: ${portion_format(e.value/e.parent.parent.value)}<br /> 인구수: ${formatNumber(e.value)}`;tooltip.style("opacity",1).style("top",r+"px").style("left",a+"px").style("color","black").style("background-color","white").html(n)}).on("mouseleave",()=>{tooltip.style("opacity",0)});let p=0,h=t=>"O-"+t+"-"+p++;function m(t){const e=Math.sqrt((i.sum(e=>e.values[t]).value-s)/(r-s)),a=(1-e)/2*width,o=(1-e)/2*height;return n.size([width*e,height*e])(i).each(t=>{t.x0+=a,t.x1+=a,t.y0+=o;return t.y1+=o}).leaves()}return u.append("rect").attr("id",t=>t.leafUid=h("leaf")).attr("fill",t=>{for(;t.depth>1;)t=t.parent;return color(t.data[0])}).attr("width",t=>t.x1-t.x0).attr("height",t=>t.y1-t.y0),u.append("clipPath").attr("id",t=>t.clipUid=h("clip")).append("use").attr("xlink:href",t=>"#"+t.leafUid),u.append("text").attr("clip-path",t=>"url(#"+t.clipUid+")").selectAll("tspan").data(t=>{return[t.data.name,t.value/t.parent.parent.value,formatNumber(t.value)]}).join("tspan").attr("x",3).attr("y",(t,e,a)=>`${.3*(e===a.length-1)+1.1+1*e}em`).attr("fill-opacity",(t,e,a)=>e===a.length-1?.7:null).text((t,e)=>1!=e?t:portion_format(t)),Object.assign(o.node(),{update(t,e){d.transition().duration(e).attr("opacity",({i:e})=>(function(t){return function(e){let a=e==t?1:0;return e==l&&t>l+1&&(a=1),a}})(t)(e)),u.data(m(t)).transition().duration(e).ease(d3.easeLinear).attr("transform",t=>`translate(${t.x0}, ${t.y0})`).call(t=>t.select("rect").attr("width",t=>t.x1-t.x0).attr("height",t=>t.y1-t.y0)).call(t=>t.select("text tspan:nth-child(2)").tween("text",function(t){let e=t.value/t.parent.parent.value;var a=parseFloat(this.textContent)/100;const r=d3.interpolate(a,e);return function(t){this.textContent=portion_format(r(t))}})).call(t=>t.select("text tspan:last-child").tween("text",function(t){const e=d3.interpolate(parseNumber(this.textContent),t.value);return function(t){this.textContent=formatNumber(e(t))}}))}})}