
//all the variables are here. I know it's shit don't read this code
/* Canvas and context objects */
let parsedExpression;

//initialization for the 3D canvas
var Canvas = document.getElementById('graph-canvas');
var Ctx = null;

//initialization for the canvas for the PDF
let PdfCanvas = document.getElementById('download-canvas');
let CtxPdf = PdfCanvas.getContext('2d');

var Width = Canvas.width;
var Height = Canvas.height;

let plotWidth = 400;
let plotHeight = 320;

let plotLayerOffset = 5;
let plotLayerOffsetX = 2.5;
let plotLayerOffsetY = 7;

let xtraTopMargin = -10;
//
let minYInput = -10;
let maxYInput = 10;

let y = 0;
let F;
//
let XSTEP;
let YSTEP = 1;
//let totalLayers = 0;
let totalIndex = 0;
//var for function boundaries
let maxx = 12;
let minx = -12;
let maxy = 1.5;
let miny = -1.2;

//pdf side margin
let pdfXMargin = 10;
let pdfYMargin = 0;

/*
    all the functions here that change when the variables are changes 
*/

//value change events
function maxxRangeF(val) {
    maxx = parseFloat(val);
}
function minxRangeF(val) {
    minx = parseFloat(val);
}
function maxyRangeF(val) {
    maxy = parseFloat(val);
}
function minyRangeF(val) {
    miny = parseFloat(val);
}
function minyRangeInputF(val) {
    minYInput = parseFloat(val)
    updateTotalLayers();
}
function maxyRangeInputF(val) {
    maxYInput = parseFloat(val)
    updateTotalLayers();
}

function YStepInputF(val) {
    YSTEP = parseFloat(val);
    updateTotalLayers();
}

function changeY(val) {
    y = parseFloat(val);
    plotLayerOffsetX = val * 0.5;
    Draw();
}

//function for calculating the amount of layers
function updateTotalLayers() {
    document.getElementById("total-layers").innerHTML = "Total layers: " + Math.floor(((maxYInput - minYInput) / YSTEP + 1));
}

function checkTotalLayers() {
    let totalLayers = Math.floor(((maxYInput - minYInput) / YSTEP + 1));
    if (totalLayers > 101) {
        showErrorMessage("tooMLayers");
        YSTEP = ((maxYInput - minYInput) / (100));
    }
    document.getElementById("total-layers").innerHTML = "Total layers: " + Math.floor(((maxYInput - minYInput) / YSTEP + 1));

}

// Returns the right boundary of the logical viewport:
function MaxX() {
    return maxx;
}

// Returns the left boundary of the logical viewport:
function MinX() {
    return minx;
}

// Returns the top boundary of the logical viewport:
function MaxY() {
    return maxy * Height / Width;
}

// Returns the bottom boundary of the logical viewport:
function MinY() {
    return miny * Height / Width;
}

// Returns the physical x-coordinate of a logical x-coordinate:
function XC(x) {
    return ((x - MinX()) / (MaxX() - MinX()) * (Width - 20)) + 10;
}

// Returns the physical y-coordinate of a logical y-coordinate:
function YC(y) {
    return Height - (y - MinY()) / (MaxY() - MinY()) * Height;
}

//for 3d showcase
// Returns the physical x-coordinate of a logical x-coordinate:
function XCS(x) {
    return ((x - MinX()) / (MaxX() - MinX()) * (plotWidth - 20)) + 10;
}

//for 3d showcase
// Returns the physical y-coordinate of a logical y-coordinate:
function YCS(y) {
    return plotHeight - (y - MinY()) / (MaxY() - MinY()) * plotHeight;
}

//amount between al the x values
XSTEP = (MaxX() - MinX()) / Width;
/* Rendering functions */

// Clears the canvas, draws the axes and graphs the function F.
function Draw() {
    hideErrorMessage();
    // Evaluate the user-supplied code, which must bind a value to F.
    let inputExpression = document.getElementById('function-code').value.toLowerCase();
    try {
        parsedExpression = math.compile(inputExpression);
    } catch (error) {
        showErrorMessage("fWriteErr");
    }
    checkTotalLayers();
    if (Canvas.getContext) {

        // Set up the canvas:
        Ctx = Canvas.getContext('2d');
        Ctx.clearRect(0, 0, Width, Height);
        checkFunctionHeight(F);
        RenderFunction(F);
    }
}

// When rendering, XSTEP determines the horizontal distance between points:


function ExampleRenderFunction(f) {
    var first = true;
    CtxPdf.fillStyle = "white";
    CtxPdf.fillRect(0, 0, Canvas.width, Canvas.height);
    CtxPdf.fillStyle = "black";
    CtxPdf.lineWidth = 8;
    CtxPdf.beginPath();
    for (let x = MinX(); x <= MaxX(); x += XSTEP) {
        let z = parsedExpression.evaluate({ x: x, y: y });
        if (first) {
            CtxPdf.moveTo(XC(x), YC(z));
            first = false;
        } else {
            CtxPdf.lineTo(XC(x), YC(z));
        }
    }
    //right
    CtxPdf.lineTo(Canvas.width - 10, Canvas.height - 10);
    //bottom
    CtxPdf.lineTo(10, Canvas.height - 10);
    CtxPdf.closePath();
    CtxPdf.stroke();
    CtxPdf.fillStyle = "white";
    CtxPdf.fill();

    CtxPdf.fillStyle = "black";
    CtxPdf.beginPath();
    //left cut
    CtxPdf.moveTo((Canvas.width / 4), Canvas.height - 10);
    CtxPdf.lineTo((Canvas.width / 4), Canvas.height - 50);
    //right cut
    CtxPdf.moveTo((Canvas.width / 4) * 3, Canvas.height - 10);
    CtxPdf.lineTo((Canvas.width / 4) * 3, Canvas.height - 50);

    CtxPdf.stroke();
    CtxPdf.font = "24px Roboto";
    CtxPdf.fillText("y=" + y.toFixed(2), 210, 340);
}

//special render with lines
function RenderFunction(f) {
    var first = true;
    let layerIndex = -10;
    Ctx.fillStyle = "#63B3ED";
    Ctx.fillRect(0, 0, Canvas.width, Canvas.height);
    for (let index = minYInput; index <= maxYInput; index += YSTEP) {
        layerIndex = rangeNumbers(index, minYInput, maxYInput, -10, 10);
        Ctx.fillStyle = "black";
        Ctx.lineWidth = 4;
        Ctx.beginPath();
        for (let x = MinX(); x <= MaxX(); x += XSTEP) {
            let z = parsedExpression.evaluate({ x: x, y: index });
            if (first) {
                Ctx.moveTo((XCS(x) + layerIndex * plotLayerOffsetX) + (Width - plotWidth) * 0.5, (YCS(z) + layerIndex * plotLayerOffsetY) + (Height - plotHeight) * 0.5 + xtraTopMargin);
                first = false;
            } else {
                Ctx.lineTo((XCS(x) + layerIndex * plotLayerOffsetX) + (Width - plotWidth) * 0.5, (YCS(z) + layerIndex * plotLayerOffsetY) + (Height - plotHeight) * 0.5 + xtraTopMargin);
            }
        }
        //right
        Ctx.lineTo(((plotWidth - 10) + layerIndex * plotLayerOffsetX) + (Width - plotWidth) * 0.5, ((plotHeight - 25) + layerIndex * plotLayerOffsetY) + (Height - plotHeight) * 0.5 + xtraTopMargin);
        //bottom
        Ctx.lineTo(((10) + layerIndex * plotLayerOffsetX) + (Width - plotWidth) * 0.5, ((plotHeight - 25) + layerIndex * plotLayerOffsetY) + (Height - plotHeight) * 0.5 + xtraTopMargin);
        Ctx.closePath();
        Ctx.stroke();
        Ctx.fillStyle = "white";
        Ctx.fill();
    }

}

function renderSetup() {
    CtxPdf.fillStyle = "white";
    CtxPdf.fillRect(0, 0, Canvas.width, Canvas.height);
    CtxPdf.fillStyle = "black";
    CtxPdf.lineWidth = 3;
    CtxPdf.beginPath();
    CtxPdf.rect(10, 10, 150, (totalIndex + 1) * 15);
    for (let index = 0; index <= totalIndex; index++) {
        //let margin = (380 - 20) / totalIndex;
        CtxPdf.moveTo(10, 15 * (index + 1) + 10);
        CtxPdf.lineTo(60, 15 * (index + 1) + 10);
    }
    CtxPdf.rect(190, 10, 150, (totalIndex + 1) * 15);
    for (let index = 0; index <= totalIndex; index++) {
        //let margin = (380 - 20) / totalIndex;
        CtxPdf.moveTo(190, 15 * (index + 1) + 10);
        CtxPdf.lineTo(240, 15 * (index + 1) + 10);
    }

    CtxPdf.stroke();
    //totalLayers = 0;
}


function checkFunctionHeight(f) {
    for (let x = MinX(); x <= MaxX(); x += XSTEP) {
        let z = parsedExpression.evaluate({ x: x, y: y });
        if (YC(z) > Canvas.height - 60) {
            showErrorMessage("low");
        } else if (YC(z) < 0) {
            showErrorMessage("high");
        }
    }
}

function makePDF() {
    var pdf = new jsPDF();
    let countEven = 0;
    let countOdd = 0;
    totalIndex = 0
    for (let index = minYInput; index <= maxYInput; index += YSTEP) {
        y = index;
        //pageAm++;
        ExampleRenderFunction(F);
        var imgData = PdfCanvas.toDataURL("image/jpeg", 1);

        if (totalIndex % 2 == 0) {
            if (totalIndex % 8 == 0 && countEven != 0) {
                pdf.addPage();
                countEven = 0;
                countOdd = 0;
            }
            pdf.addImage(imgData, 'JPEG', pdfXMargin, pdfYMargin + (PdfCanvas.height / 5.5) * countEven, PdfCanvas.width / 5.5, PdfCanvas.height / 5.5);
            countEven++;
        } else {
            pdf.addImage(imgData, 'JPEG', pdfXMargin + (PdfCanvas.width / 5.5), pdfYMargin + (PdfCanvas.height / 5.5) * countOdd, PdfCanvas.width / 5.5, PdfCanvas.height / 5.5);
            countOdd++;
        }

        totalIndex++;
    }
    renderSetup();
    var imgData = PdfCanvas.toDataURL("image/jpeg", 1);
    if (totalIndex % 2 == 0) {
        if ((pdfYMargin + (PdfCanvas.height / 5.5) * countEven + 1) + (PdfCanvas.height / 3.3) < pdf.internal.pageSize.getHeight()) {
            pdf.addImage(imgData, 'JPEG', pdfXMargin, pdfYMargin + (PdfCanvas.height / 5.5) * countEven + 1, PdfCanvas.width / 5.5, PdfCanvas.height / 3.5);
        } else {
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', pdfXMargin, pdfYMargin + 20, Canvas.width / 5.5, Canvas.height / 3.5);
        }
    } else {
        if ((pdfYMargin + (PdfCanvas.height / 5.5) * countOdd) + (PdfCanvas.height / 3.3) < pdf.internal.pageSize.getHeight()) {
            pdf.addImage(imgData, 'JPEG', pdfXMargin + (PdfCanvas.width / 5.5), pdfYMargin + (PdfCanvas.height / 5.5) * countOdd, PdfCanvas.width / 5.5, PdfCanvas.height / 3.5);
        } else {
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', pdfXMargin, pdfYMargin + 20, PdfCanvas.width / 5.5, PdfCanvas.height / 3.5);
        }

    }

    pdf.save("3d-Function-Paper-Cutout.pdf");
}

function downloadPdf() {
    makePDF();
}

/*
    here is the error shit handled
*/

//if an error occures
window.onerror = function (msg, url, linenumber) {
    this.showErrorMessage(msg);
}

function showErrorMessage(error) {
    let errorMsg = document.getElementById("err-msg");
    if (error == "fWriteErr") {
        errorMsg.innerHTML = "The function you put in is not correct.";
    } else if (error == "low") {
        errorMsg.innerHTML = "The function you put in is too low. Make the minimum z higher";
    } else if (error == "high") {
        errorMsg.innerHTML = "The function you put in is too high. Make the maximum z higher";
    } else if (error == "tooMLayers") {
        errorMsg.innerHTML = "You can't have more than 101 layers";
    } else {
        errorMsg.innerHTML = "Please change the parameters of your function.";
    }
    let errorContainer = document.getElementById("error-message");
    errorContainer.classList.remove("hidden");
    errorContainer.classList.add("block");
}

function hideErrorMessage() {
    let errorContainer = document.getElementById("error-message");
    errorContainer.classList.remove("block");
    errorContainer.classList.add("hidden");
}

function rangeNumbers(OldValue, OldMin, OldMax, NewMin, NewMax) {
    var newVal = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
    return newVal;
}


//all premade functions function
function premadeFunction(mathFunction, maxx, maxy, minx, miny, maxyR, minyR, Ystep) {
    document.getElementById('function-code').value = mathFunction;
    maxxRangeF(maxx);
    maxyRangeF(maxy);
    minxRangeF(minx);
    minyRangeF(miny);
    minyRangeInputF(maxyR);
    maxyRangeInputF(minyR);
    YStepInputF(Ystep);
    Draw();
    downloadPdf();
}

document.getElementById("premade-function-button-1").onclick = function () { premadeFunction('(sin(sqrt(x^2+y^2)))/(sqrt(x^2+y^2))', 12, 1.5, -12, -1.2, -10, 10, 1) };
document.getElementById("premade-function-button-2").onclick = function () { premadeFunction('sin(x)*sin(y)', 6.3, 1.4, -3.1, -2, -3.1, 6.3, 0.4) };
document.getElementById("premade-function-button-3").onclick = function () { premadeFunction('7x y/e^(x^2 + y^2)', 2.5, 1.8, -2.5, -2.5, -2.5, 2.5, 0.25) };


// To be called when the page finishes loading:
window.addEventListener("load", function () {
    Draw();
});

/*
    TODO: future functions
*/

//functions for color heat map for future update
/*function range(start, end, step = 1) {
    const len = Math.floor((end - start) / step) + 1
    return Array(len).fill().map((_, idx) => start + (idx * step))
}

function heatMapColorforValue(value) {
    var h = (1.0 - value) * 240
    return "hsl(" + ~~h + ", 100%, 50%)";
}

function reverseNumber(num, min, max) {
    return (max + min) - num;
}
*/