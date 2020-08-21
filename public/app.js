// To be called when the page finishes loading:
window.addEventListener("load", function () {
    XSTEP = (MaxX() - MinX()) / Width;
    Draw();
});

//---------------------------------------------------------------------------
//all variables
//initialization for the canvas for the PDF
let PdfCanvas = document.getElementById('download-canvas');
let CtxPdf = PdfCanvas.getContext('2d');
//initialization for the 3D canvas
let Canvas = document.getElementById('graph-canvas');
let Ctx = Canvas.getContext('2d');

let parsedExpression;
//pdf side margin
let pdfXMargin = 10;
let pdfYMargin = 0;
let xtraTopMargin = -10;
//Canvas size
let Width = Canvas.width;
let Height = Canvas.height;
//all variables for the plotting settings
let miny = -10;
let maxy = 10;
let maxx = 12;
let minx = -12;
let maxz = 1.5;
let minz = -1.2;

let y = 0;
let F;
let XSTEP;
let YSTEP = 1;
let totalIndex = 0;

let materialThickness = 4;

//other initialization for the 3D canvas
//width and height of the 3D view plot
let plotWidth = 400;
let plotHeight = 320;

//all ofsetts
let plotLayerOffset = 5;
let plotLayerOffsetX = 2.5;
let plotLayerOffsetY = 7;

//for tabchange
let lastTab = 2;
let lastGradient = 0;

//gradients
let white_gradient = GradientGenerator.createGradient(['#ffffff', '#ffffff', '#ffffff']);
let viridis_gradient = GradientGenerator.createGradient(['#440154', '#482475', '#414487', '#355f8d', '#2a788e', '#21908d', '#22a884', '#42be71', '#7ad151', '#bddf26', '#bddf26']);
let magma_gradient = GradientGenerator.createGradient(['#000004', '#140e36', '#3b0f70', '#641a80', '#8c2981', '#b5367a', '#de4968', '#f66e5c', '#fe9f6d', '#fecf92', '#fecf92']);
let megatron_gradient = GradientGenerator.createGradient(['#6e40aa', '#be3caf', '#fe4b83', '#ff7747', '#e3b62f', '#b0ef5a', '#53f666', '#1edfa2', '#23acd8', '#4c6fdc', '#4c6fdc']);
let spectral_gradient = GradientGenerator.createGradient(['#9e0142', '#d13b4b', '#f0704a', '#fcab63', '#fedc8c', '#fbf8b0', '#e0f3a1', '#aadda2', '#69bda9', '#4288b5', '#4288b5']);
let jShine_gradient = GradientGenerator.createGradient(['#12c2e9', '#c471ed', '#f64f59']);

let gradients = [white_gradient, viridis_gradient, magma_gradient, megatron_gradient, spectral_gradient, jShine_gradient];
let mainGradient = gradients[0];


//---------------------------------------------------------------------------
//UX logic
function tabchange(index) {
    tab1 = document.getElementById("tab1");
    tab2 = document.getElementById("tab2");
    tab1Con = document.getElementById("tab1Content");
    tab2Con = document.getElementById("tab2Content");
    if (index == 1) {
        tab1.classList.add('active-tab');
        tab1.classList.remove('inactive-tab');
        tab2.classList.remove('active-tab');
        tab2.classList.add('inactive-tab');

        tab1Con.classList.add('hidden');
        tab2Con.classList.remove('hidden');
    } else {
        tab1.classList.remove('active-tab');
        tab1.classList.add('inactive-tab');
        tab2.classList.add('active-tab');
        tab2.classList.remove('inactive-tab');

        tab1Con.classList.remove('hidden');
        tab2Con.classList.add('hidden');
    }
}

function chooseGradientUi(index) {
    if (index != lastGradient) {
        checkmark = document.getElementById("checkmark" + index);
        oldcheckmark = document.getElementById("checkmark" + lastGradient);

        lastGradient = index;
        mainGradient = gradients[index];

        checkmark.classList.remove('opacity-0');
        checkmark.classList.add('opacity-100');

        oldcheckmark.classList.add('opacity-0');
        oldcheckmark.classList.remove('opacity-100');

        Draw();
    }
}
//all variables in the settings
function maxxRangeF(val) {
    maxx = parseFloat(val);
}
function minxRangeF(val) {
    minx = parseFloat(val);
}
function maxzRangeF(val) {
    maxz = parseFloat(val);
}
function minzRangeF(val) {
    minz = parseFloat(val);
}
function minyRangeF(val) {
    miny = parseFloat(val)
    updateTotalLayers();
}
function maxyRangeF(val) {
    maxy = parseFloat(val)
    updateTotalLayers();
}
function YStepInputF(val) {
    YSTEP = parseFloat(val);
    updateTotalLayers();
}
function downloadPdf() {
    makePDF();
}
//changes the y value and 
function changeY(val) {
    y = parseFloat(val);
    plotLayerOffsetX = val * 0.5;
    Draw();
}
function updateTotalLayers() {
    document.getElementById("total-layers").innerHTML = "Total layers: " + Math.floor(((maxy - miny) / YSTEP + 1));
}
function checkTotalLayers() {
    let totalLayers = Math.floor(((maxy - miny) / YSTEP + 1));
    if (totalLayers > 101) {
        showErrorMessage("tooMLayers");
        YSTEP = ((maxy - miny) / (100));
    }
    updateTotalLayers();

}
function checkFunctionHeight(f) {
    for (let x = MinX(); x <= MaxX(); x += XSTEP) {
        let z = parsedExpression.evaluate({ x: x, y: y });
        if (ZC(z) > Canvas.height - 60) {
            showErrorMessage("low");
        } else if (ZC(z) < 0) {
            showErrorMessage("high");
        }
    }
}

//---------------------------------------------------------------------------
//Draw function for updating 3D viewer
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
    checkFunctionHeight(F);
    Render3DFunction(F);
}

//renderfunctions for rendering the 3D view
function Render3DFunction(f) {
    var first = true;
    let layerIndex;
    Ctx.fillStyle = "#63B3ED";
    Ctx.fillRect(0, 0, Canvas.width, Canvas.height);
    for (let index = miny; index <= maxy; index += YSTEP) {
        layerIndex = rangeNumbers(index, miny, maxy, -10, 10);
        Ctx.fillStyle = "black";
        Ctx.lineWidth = 4;
        Ctx.beginPath();
        for (let x = MinX(); x <= MaxX(); x += XSTEP) {
            let z = parsedExpression.evaluate({ x: x, y: index });
            if (first) {
                Ctx.moveTo((XC3D(x) + layerIndex * plotLayerOffsetX) + (Width - plotWidth) * 0.5, (ZC3D(z) + layerIndex * plotLayerOffsetY) + (Height - plotHeight) * 0.5 + xtraTopMargin);
                first = false;
            } else {
                Ctx.lineTo((XC3D(x) + layerIndex * plotLayerOffsetX) + (Width - plotWidth) * 0.5, (ZC3D(z) + layerIndex * plotLayerOffsetY) + (Height - plotHeight) * 0.5 + xtraTopMargin);
            }
        }
        //right
        Ctx.lineTo(((plotWidth - 10) + layerIndex * plotLayerOffsetX) + (Width - plotWidth) * 0.5, ((plotHeight - 25) + layerIndex * plotLayerOffsetY) + (Height - plotHeight) * 0.5 + xtraTopMargin);
        //bottom
        Ctx.lineTo(((10) + layerIndex * plotLayerOffsetX) + (Width - plotWidth) * 0.5, ((plotHeight - 25) + layerIndex * plotLayerOffsetY) + (Height - plotHeight) * 0.5 + xtraTopMargin);
        Ctx.closePath();
        Ctx.stroke();
        Ctx.fillStyle = mainGradient.getColorHexAt(mapRange(index, miny, maxy, 0, 1));
        Ctx.fill();
    }

}

//---------------------------------------------------------------------------
//All the PDF functions
function PDFRenderFunction(f) {
    var first = true;
    CtxPdf.fillStyle = "white";
    CtxPdf.fillRect(0, 0, Canvas.width, Canvas.height);
    CtxPdf.fillStyle = "black";
    CtxPdf.strokeStyle = "black";
    CtxPdf.lineWidth = 8;
    CtxPdf.beginPath();
    for (let x = MinX(); x <= MaxX(); x += XSTEP) {
        let z = parsedExpression.evaluate({ x: x, y: y });
        if (first) {
            CtxPdf.moveTo(XC(x), ZC(z));
            first = false;
        } else {
            CtxPdf.lineTo(XC(x), ZC(z));
        }
    }
    //right
    CtxPdf.lineTo(Canvas.width - 10, Canvas.height - 10);
    //bottom
    CtxPdf.lineTo(10, Canvas.height - 10);
    CtxPdf.closePath();
    CtxPdf.stroke();
    CtxPdf.fillStyle = mainGradient.getColorHexAt(mapRange(y, miny, maxy, 0, 1));
    CtxPdf.fill();

    CtxPdf.fillStyle = "black";
    let gradientcolor = mainGradient.getColorAt(mapRange(y, miny, maxy, 0, 1));
    if ((gradientcolor.r * 76.245 + gradientcolor.g * 149.685 + gradientcolor.b * 29.07) <= 186) {
        CtxPdf.fillStyle = "white";
        CtxPdf.strokeStyle = "white";
    }
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
    CtxPdf.fillStyle = "black";
}

//renders the strips.
function renderSetup() {
    let ysize = (maxy - miny) / Canvas.width;
    CtxPdf.fillStyle = "white";
    CtxPdf.fillRect(0, 0, Canvas.width, Canvas.height);
    CtxPdf.fillStyle = "black";
    CtxPdf.lineWidth = 3;
    CtxPdf.beginPath();
    CtxPdf.rect(10, 10, 150, (totalIndex + 1) * 15);
    for (let index = 0; index <= totalIndex; index++) {
        CtxPdf.moveTo(10, 15 * (index + 1) + 10);
        CtxPdf.lineTo(60, 15 * (index + 1) + 10);
    }
    CtxPdf.rect(190, 10, 150, (totalIndex + 1) * 15);
    for (let index = 0; index <= totalIndex; index++) {
        CtxPdf.moveTo(190, 15 * (index + 1) + 10);
        CtxPdf.lineTo(240, 15 * (index + 1) + 10);
    }
    CtxPdf.stroke();
}

//creates the PDF and puts all the layers in the right place
function makePDF() {
    var pdf = new jsPDF();
    let countEven = 0;
    let countOdd = 0;
    totalIndex = 0
    for (let index = miny; index <= maxy; index += YSTEP) {
        y = index;
        PDFRenderFunction(F);
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

//---------------------------------------------------------------------------
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

//---------------------------------------------------------------------------
//all premade functions function
function premadeFunction(mathFunction, maxx, maxy, minx, miny, maxyR, minyR, Ystep) {
    document.getElementById('function-code').value = mathFunction;
    maxxRangeF(maxx);
    maxzRangeF(maxy);
    minxRangeF(minx);
    minzRangeF(miny);
    minyRangeF(maxyR);
    maxyRangeF(minyR);
    YStepInputF(Ystep);
    Draw();
    downloadPdf();
}

document.getElementById("premade-function-button-1").onclick = function () { premadeFunction('(sin(sqrt(x^2+y^2)))/(sqrt(x^2+y^2))', 12, 1.5, -12, -1.2, -10, 10, 1) };
document.getElementById("premade-function-button-2").onclick = function () { premadeFunction('sin(x)*sin(y)', 6.3, 1.4, -3.1, -2, -3.1, 6.3, 0.4) };
document.getElementById("premade-function-button-3").onclick = function () { premadeFunction('7x y/e^(x^2 + y^2)', 2.5, 1.8, -2.5, -2.5, -2.5, 2.5, 0.25) };

/*
    TODO: future functions
*/

/*function createSvg(f) {
    let ctxx = new C2S(500, 400);

    var first = true;
    ctxx.fillStyle = "black";
    ctxx.strokeStyle = "black";
    ctxx.lineWidth = 8;
    ctxx.beginPath();
    for (let x = MinX(); x <= (MaxX() + 0.1); x += XSTEP * 5) {
        let z = parsedExpression.evaluate({ x: x, y: y });
        if (first) {
            ctxx.moveTo(XC(x).toFixed(2), YC(z).toFixed(2));
            first = false;
        } else {
            ctxx.lineTo(XC(x).toFixed(2), YC(z).toFixed(2));
        }
    }
    //right
    ctxx.lineTo(Canvas.width - 10, Canvas.height - 10);

    let materialChange = materialThickness / 2;
    //right cut
    ctxx.lineTo((Canvas.width / 4) * 3 + materialChange, Canvas.height - 10);
    ctxx.lineTo((Canvas.width / 4) * 3 + materialChange, Canvas.height - 50);
    ctxx.lineTo((Canvas.width / 4) * 3 - materialChange, Canvas.height - 50);
    ctxx.lineTo((Canvas.width / 4) * 3 - materialChange, Canvas.height - 10);
    //left cut
    ctxx.lineTo((Canvas.width / 4) + materialChange, Canvas.height - 10);
    ctxx.lineTo((Canvas.width / 4) + materialChange, Canvas.height - 50);
    ctxx.lineTo((Canvas.width / 4) - materialChange, Canvas.height - 50);
    ctxx.lineTo((Canvas.width / 4) - materialChange, Canvas.height - 10);
    //bottom
    ctxx.lineTo(10, Canvas.height - 10);
    ctxx.closePath();
    ctxx.stroke();
    ctxx.fillStyle = mainGradient.getColorHexAt(mapRange(y, minYInput, maxYInput, 0, 1));
    ctxx.fill();

    ctxx.fillStyle = "black";
    ctxx.font = "24px Roboto";
    ctxx.fillText("y=" + y.toFixed(2), 210, 340);
    //console.log(ctxx.getSerializedSvg(true));
    return ctxx.getSerializedSvg(true);
}

function makeVecPDF() {
    var pdf = new jsPDF();
    svgData = createSvg(F);
    console.log(svgData);
    pdf.addSvg(svgData, 50, 50, 500, 400);
    /*let countEven = 0;
    let countOdd = 0;
    totalIndex = 0
    for (let index = minYInput; index <= maxYInput; index += YSTEP) {
        y = index;
        //pageAm++;

        var svgData = createSvg(F);

        if (totalIndex % 2 == 0) {
            if (totalIndex % 8 == 0 && countEven != 0) {
                pdf.addPage();
                countEven = 0;
                countOdd = 0;
            }
            pdf.addSvg(svgData, pdfXMargin, pdfYMargin + (PdfCanvas.height / 5.5) * countEven, PdfCanvas.width / 5.5, PdfCanvas.height / 5.5, PdfCanvas.width / 5.5, PdfCanvas.height / 5.5);
            countEven++;
        } else {
            pdf.addSvg(svgData, pdfXMargin + (PdfCanvas.width / 5.5), pdfYMargin + (PdfCanvas.height / 5.5) * countOdd, PdfCanvas.width / 5.5, PdfCanvas.height / 5.5, 500, 400);
            countOdd++;
        }

        totalIndex++;
    }*/

//
/*renderSetup();
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
}*/

//---------------------------------------------------------------------------
//canvas calculations
// Returns the right boundary of the logical viewport:
function MaxX() {
    return maxx;
}
// Returns the left boundary of the logical viewport:
function MinX() {
    return minx;
}
// Returns the top boundary of the logical viewport:
function MaxZ() {
    return maxz * Height / Width;
}
// Returns the bottom boundary of the logical viewport:
function MinZ() {
    return minz * Height / Width;
}
// Returns the physical x-coordinate of a logical x-coordinate:
function XC(x) {
    return ((x - MinX()) / (MaxX() - MinX()) * (Width - 20)) + 10;
}
// Returns the physical y-coordinate of a logical y-coordinate:
function ZC(y) {
    return Height - (y - MinZ()) / (MaxZ() - MinZ()) * Height;
}
//for 3d showcase
// Returns the physical x-coordinate of a logical x-coordinate:
function XC3D(x) {
    return ((x - MinX()) / (MaxX() - MinX()) * (plotWidth - 20)) + 10;
}
// Returns the physical y-coordinate of a logical y-coordinate:
function ZC3D(y) {
    return plotHeight - (y - MinZ()) / (MaxZ() - MinZ()) * plotHeight;
}

//other calculations
function rangeNumbers(OldValue, OldMin, OldMax, NewMin, NewMax) {
    var newVal = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
    return newVal;
}
// linearly maps value from the range (a..b) to (c..d)
function mapRange(value, a, b, c, d) {
    // first map value from (a..b) to (0..1)
    value = (value - a) / (b - a);
    // then map it from (0..1) to (c..d) and return it
    return c + value * (d - c);
}