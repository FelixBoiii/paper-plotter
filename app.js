let parsedExpression;var Canvas=document.getElementById("graph-canvas"),Ctx=null;let PdfCanvas=document.getElementById("download-canvas"),CtxPdf=PdfCanvas.getContext("2d");var Width=Canvas.width,Height=Canvas.height;let F,XSTEP,plotWidth=400,plotHeight=320,plotLayerOffset=5,plotLayerOffsetX=2.5,plotLayerOffsetY=7,xtraTopMargin=-10,minYInput=-10,maxYInput=10,y=0,YSTEP=1,totalIndex=0,maxx=12,minx=-12,maxy=1.5,miny=-1.2,pdfXMargin=10,pdfYMargin=0;function maxxRangeF(t){maxx=parseFloat(t)}function minxRangeF(t){minx=parseFloat(t)}function maxyRangeF(t){maxy=parseFloat(t)}function minyRangeF(t){miny=parseFloat(t)}function minyRangeInputF(t){minYInput=parseFloat(t),updateTotalLayers()}function maxyRangeInputF(t){maxYInput=parseFloat(t),updateTotalLayers()}function YStepInputF(t){YSTEP=parseFloat(t),updateTotalLayers()}function changeY(t){y=parseFloat(t),plotLayerOffsetX=.5*t,Draw()}function updateTotalLayers(){document.getElementById("total-layers").innerHTML="Total layers: "+Math.floor((maxYInput-minYInput)/YSTEP+1)}function checkTotalLayers(){Math.floor((maxYInput-minYInput)/YSTEP+1)>101&&(showErrorMessage("tooMLayers"),YSTEP=(maxYInput-minYInput)/100),document.getElementById("total-layers").innerHTML="Total layers: "+Math.floor((maxYInput-minYInput)/YSTEP+1)}function MaxX(){return maxx}function MinX(){return minx}function MaxY(){return maxy*Height/Width}function MinY(){return miny*Height/Width}function XC(t){return(t-MinX())/(MaxX()-MinX())*(Width-20)+10}function YC(t){return Height-(t-MinY())/(MaxY()-MinY())*Height}function XCS(t){return(t-MinX())/(MaxX()-MinX())*(plotWidth-20)+10}function YCS(t){return plotHeight-(t-MinY())/(MaxY()-MinY())*plotHeight}function Draw(){hideErrorMessage();let t=document.getElementById("function-code").value.toLowerCase();try{parsedExpression=math.compile(t)}catch(t){showErrorMessage("fWriteErr")}checkTotalLayers(),Canvas.getContext&&((Ctx=Canvas.getContext("2d")).clearRect(0,0,Width,Height),checkFunctionHeight(F),RenderFunction(F))}function ExampleRenderFunction(t){var e=!0;CtxPdf.fillStyle="white",CtxPdf.fillRect(0,0,Canvas.width,Canvas.height),CtxPdf.fillStyle="black",CtxPdf.lineWidth=8,CtxPdf.beginPath();for(let t=MinX();t<=MaxX();t+=XSTEP){let n=parsedExpression.evaluate({x:t,y:y});e?(CtxPdf.moveTo(XC(t),YC(n)),e=!1):CtxPdf.lineTo(XC(t),YC(n))}CtxPdf.lineTo(Canvas.width-10,Canvas.height-10),CtxPdf.lineTo(10,Canvas.height-10),CtxPdf.closePath(),CtxPdf.stroke(),CtxPdf.fillStyle="white",CtxPdf.fill(),CtxPdf.fillStyle="black",CtxPdf.beginPath(),CtxPdf.moveTo(Canvas.width/4,Canvas.height-10),CtxPdf.lineTo(Canvas.width/4,Canvas.height-50),CtxPdf.moveTo(Canvas.width/4*3,Canvas.height-10),CtxPdf.lineTo(Canvas.width/4*3,Canvas.height-50),CtxPdf.stroke(),CtxPdf.font="24px Roboto",CtxPdf.fillText("y="+y.toFixed(2),210,340)}function RenderFunction(t){var e=!0;let n=-10;Ctx.fillStyle="#63B3ED",Ctx.fillRect(0,0,Canvas.width,Canvas.height);for(let t=minYInput;t<=maxYInput;t+=YSTEP){n=rangeNumbers(t,minYInput,maxYInput,-10,10),Ctx.fillStyle="black",Ctx.lineWidth=4,Ctx.beginPath();for(let a=MinX();a<=MaxX();a+=XSTEP){let i=parsedExpression.evaluate({x:a,y:t});e?(Ctx.moveTo(XCS(a)+n*plotLayerOffsetX+.5*(Width-plotWidth),YCS(i)+n*plotLayerOffsetY+.5*(Height-plotHeight)+xtraTopMargin),e=!1):Ctx.lineTo(XCS(a)+n*plotLayerOffsetX+.5*(Width-plotWidth),YCS(i)+n*plotLayerOffsetY+.5*(Height-plotHeight)+xtraTopMargin)}Ctx.lineTo(plotWidth-10+n*plotLayerOffsetX+.5*(Width-plotWidth),plotHeight-25+n*plotLayerOffsetY+.5*(Height-plotHeight)+xtraTopMargin),Ctx.lineTo(10+n*plotLayerOffsetX+.5*(Width-plotWidth),plotHeight-25+n*plotLayerOffsetY+.5*(Height-plotHeight)+xtraTopMargin),Ctx.closePath(),Ctx.stroke(),Ctx.fillStyle="white",Ctx.fill()}}function renderSetup(){CtxPdf.fillStyle="white",CtxPdf.fillRect(0,0,Canvas.width,Canvas.height),CtxPdf.fillStyle="black",CtxPdf.lineWidth=3,CtxPdf.beginPath(),CtxPdf.rect(10,10,150,15*(totalIndex+1));for(let t=0;t<=totalIndex;t++)CtxPdf.moveTo(10,15*(t+1)+10),CtxPdf.lineTo(60,15*(t+1)+10);CtxPdf.rect(190,10,150,15*(totalIndex+1));for(let t=0;t<=totalIndex;t++)CtxPdf.moveTo(190,15*(t+1)+10),CtxPdf.lineTo(240,15*(t+1)+10);CtxPdf.stroke()}function checkFunctionHeight(t){for(let t=MinX();t<=MaxX();t+=XSTEP){let e=parsedExpression.evaluate({x:t,y:y});YC(e)>Canvas.height-60?showErrorMessage("low"):YC(e)<0&&showErrorMessage("high")}}function makePDF(){var t=new jsPDF;let e=0,n=0;totalIndex=0;for(let i=minYInput;i<=maxYInput;i+=YSTEP){y=i,ExampleRenderFunction(F);var a=PdfCanvas.toDataURL("image/jpeg",1);totalIndex%2==0?(totalIndex%8==0&&0!=e&&(t.addPage(),e=0,n=0),t.addImage(a,"JPEG",pdfXMargin,pdfYMargin+PdfCanvas.height/5.5*e,PdfCanvas.width/5.5,PdfCanvas.height/5.5),e++):(t.addImage(a,"JPEG",pdfXMargin+PdfCanvas.width/5.5,pdfYMargin+PdfCanvas.height/5.5*n,PdfCanvas.width/5.5,PdfCanvas.height/5.5),n++),totalIndex++}renderSetup();a=PdfCanvas.toDataURL("image/jpeg",1);totalIndex%2==0?pdfYMargin+PdfCanvas.height/5.5*e+1+PdfCanvas.height/3.3<t.internal.pageSize.getHeight()?t.addImage(a,"JPEG",pdfXMargin,pdfYMargin+PdfCanvas.height/5.5*e+1,PdfCanvas.width/5.5,PdfCanvas.height/3.5):(t.addPage(),t.addImage(a,"JPEG",pdfXMargin,pdfYMargin+20,Canvas.width/5.5,Canvas.height/3.5)):pdfYMargin+PdfCanvas.height/5.5*n+PdfCanvas.height/3.3<t.internal.pageSize.getHeight()?t.addImage(a,"JPEG",pdfXMargin+PdfCanvas.width/5.5,pdfYMargin+PdfCanvas.height/5.5*n,PdfCanvas.width/5.5,PdfCanvas.height/3.5):(t.addPage(),t.addImage(a,"JPEG",pdfXMargin,pdfYMargin+20,PdfCanvas.width/5.5,PdfCanvas.height/3.5)),t.save("3d-Function-Paper-Cutout.pdf")}function downloadPdf(){makePDF()}function showErrorMessage(t){let e=document.getElementById("err-msg");e.innerHTML="fWriteErr"==t?"The function you put in is not correct.":"low"==t?"The function you put in is too low. Make the minimum z higher":"high"==t?"The function you put in is too high. Make the maximum z higher":"tooMLayers"==t?"You can't have more than 101 layers":"Please change the parameters of your function.";let n=document.getElementById("error-message");n.classList.remove("hidden"),n.classList.add("block")}function hideErrorMessage(){let t=document.getElementById("error-message");t.classList.remove("block"),t.classList.add("hidden")}function rangeNumbers(t,e,n,a,i){return(t-e)*(i-a)/(n-e)+a}function premadeFunction(t,e,n,a,i,o,d,r){document.getElementById("function-code").value=t,maxxRangeF(e),maxyRangeF(n),minxRangeF(a),minyRangeF(i),minyRangeInputF(o),maxyRangeInputF(d),YStepInputF(r),Draw(),downloadPdf()}XSTEP=(MaxX()-MinX())/Width,window.onerror=function(t,e,n){this.showErrorMessage(t)},document.getElementById("premade-function-button-1").onclick=function(){premadeFunction("(sin(sqrt(x^2+y^2)))/(sqrt(x^2+y^2))",12,1.5,-12,-1.2,-10,10,1)},document.getElementById("premade-function-button-2").onclick=function(){premadeFunction("sin(x)*sin(y)",6.3,1.4,-3.1,-2,-3.1,6.3,.4)},document.getElementById("premade-function-button-3").onclick=function(){premadeFunction("7x y/e^(x^2 + y^2)",2.5,1.8,-2.5,-2.5,-2.5,2.5,.25)},window.addEventListener("load",function(){Draw()});
