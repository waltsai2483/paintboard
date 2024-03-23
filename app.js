const COLOR_RECORD_COUNT = 6
const SUPPORTED_FONT = [
    "Arial",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Times New Roman",
    "Georgia",
    "Comic Sans MS",
    "Courier"
]
const TEXT_ALIGN = [
    "left", "center", "right"
]
const MAX_PAINTBOARD_WIDTH = 1080
const MAX_PAINTBOARD_HEIGHT = 720

let recentColors = []
let memoStack = []
let dropStack = []

let currentWidth = MAX_PAINTBOARD_WIDTH
let currentHeight = MAX_PAINTBOARD_HEIGHT
let mouseX = 0, mouseY = 0
let isDrawing = false

let isDragging = false
let clientDragStart = undefined, cliendDragEnd = undefined, dragStart = undefined, dragEnd = undefined

let fontSelectorToggle = false
let fontType = SUPPORTED_FONT[0]
let textAlign = "left"

let canvaMultiplier = 1

let paintState = 1
let filled = false
let filledColor = "#444444"
let backgroundColor = undefined

let filename = "art"
let loadedImg = undefined

const PaintState = {
    DRAW: 0,
    ERASE: 1,
    TEXT: 2,
    CIRCLE: 3,
    LINE: 4,
    RECT: 5,
    TRIANGLE: 6
}

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

function updateCursor() {
    const paintboard = document.getElementById("paintboard")
    switch (paintState) {
        case PaintState.DRAW:
            return paintboard.style.cursor = "url('assets/cursor/cursor-pen.png') 0 0,auto"
        case PaintState.ERASE:
            return paintboard.style.cursor = "url('assets/cursor/cursor-eraser.png') 5 5,auto"
        case PaintState.TEXT:
            return paintboard.style.cursor = "url('assets/cursor/cursor-text.png') 2 2,auto"
        case PaintState.CIRCLE:
            return paintboard.style.cursor = "url('assets/cursor/cursor-shape-circle.png') 5 5,auto"
        case PaintState.LINE:
            return paintboard.style.cursor = "url('assets/cursor/cursor-shape-line.png') 5 5,auto"
        case PaintState.RECT:
            return paintboard.style.cursor = "url('assets/cursor/cursor-shape-rect.png') 5 5,auto"
        case PaintState.TRIANGLE:
            return paintboard.style.cursor = "url('assets/cursor/cursor-shape-triangle.png') 5 5,auto"
    }
}

function setCanvaSize(width, height) {
    let context = $("#paintboard")[0].getContext("2d")
    context.canvas.width = currentWidth = width
    context.canvas.height = currentHeight = height
}

function setPaintState(value) {
    paintState = value
}

function onColorPicked() {
    recentColors.unshift($("#color-picker").val())
    if (recentColors.length > 7) {
        recentColors.pop()
    }
}

function updateColor() {
    for (let i = 1; i < recentColors.length; i++) {
        $("#color-list > .recent-picked-color")[i - 1].style.backgroundColor = recentColors[i]
    }
    for (let i = recentColors.length; i <= COLOR_RECORD_COUNT; i++) {
        $("#color-list > .recent-picked-color")[i - 1].style.backgroundColor = rgb2hex("rgb(209, 213, 219)")
    }
}

function repickColor(index) {
    if (index < recentColors.length) {
        const picked = recentColors.splice(index, 1)
        recentColors.unshift(picked[0])
        $("#color-picker").val(picked[0])
        updateColor()
    }
}

function getMouseCoordinates(event) {
    const boundings = document.getElementById("paintboard").getBoundingClientRect()
    let x, y
    x = event.clientX - boundings.left
    y = event.clientY - boundings.top
    x *= document.getElementById("paintboard").width / boundings.width
    y *= document.getElementById("paintboard").height / boundings.height
    return { x: x, y: y }
}

function setMouseCoordinates(event) {
    const pos = getMouseCoordinates(event)
    if (!(pos.x < 0 || pos.y < 0 || pos.x > currentWidth || pos.y > currentHeight)) {
        mouseX = pos.x
        mouseY = pos.y
        clientDragEnd = { x: event.clientX, y: event.clientY }
    }
}

function enableUiDetect(enable) {
    if (enable) {
        $(".disable-right-hover").removeClass("disable-right-hover").addClass("swipe-right-hover")
        $(".disable-left-hover").removeClass("disable-left-hover").addClass("swipe-left-hover")
        $(".disable-top-hover").removeClass("disable-top-hover").addClass("swipe-top-hover")
    } else {
        $(".swipe-right-hover").removeClass("swipe-right-hover").addClass("disable-right-hover")
        $(".swipe-left-hover").removeClass("swipe-left-hover").addClass("disable-left-hover")
        $(".swipe-top-hover").removeClass("swipe-top-hover").addClass("disable-top-hover")
    }
}

function enableButton(target_id, enable) {
    $(target_id).prop("disabled", !enable)
    if (enable) {
        $(target_id).removeClass("filter contrast-0")
    } else {
        $(target_id).addClass("filter contrast-0")
    }
}

function enableUndoRedo(undo, redo) {
    enableButton("#btn-undo", undo)
    enableButton("#btn-redo", redo)
}

function initColorList() {
    // Color list
    for (let i = 0; i < COLOR_RECORD_COUNT; i++) {
        const element = document.createElement("div")
        element.classList.add("recent-picked-color")
        element.classList.add("cursor-pointer")
        element.setAttribute("index", i + 1)
        element.onclick = () => repickColor(i + 1)
        $("#color-list").append(element)
    }
}

function changeBrushStat() {
    let context = $("#paintboard")[0].getContext("2d")
    context.strokeStyle = paintState == PaintState.ERASE ? "#ffffff" : $("#color-picker").val()
    context.lineWidth = parseFloat($("#width-input").val())
    context.globalCompositeOperation = paintState == PaintState.ERASE ? "destination-out" : "source-over";
}

function clearPage() {
    let context = $("#paintboard")[0].getContext("2d")
    context.clearRect(0, 0, currentWidth, currentHeight)
}

function renew() {
    enableBgSetButton(true)
    enableUndoRedo(false, false)
    resetTextbox()
    rename("art")
    memoStack = []
    dropStack = []
    loadedImg = undefined
    backgroundColor = undefined
    $("#paintboard").css("background-color", "#ffffff")
    setCanvaSize(MAX_PAINTBOARD_WIDTH, MAX_PAINTBOARD_HEIGHT)
    clearPage()
}

function redraw() {
    let context = $("#paintboard")[0].getContext("2d")
    if (backgroundColor) {
        context.fillStyle = backgroundColor
        context.fillRect(0, 0, currentWidth, currentHeight)
        context.fillStyle = undefined
    }
    if (loadedImg) {
        context.drawImage(loadedImg, 0, 0, currentWidth, currentHeight)
    }
    memoStack.forEach((element) => {
        if (element.type == "text") {
            context.font = element.font
            context.fillStyle = element.color
            context.textAlign = element.align
            let offset = 0
            if (element.align === "center") {
                offset = element.width / 2
            } else if (element.align === "right") {
                offset = element.width
            }
            context.fillText(element.text, element.x + offset, element.y, element.width)
        } else {
            context.font = undefined
            context.fillStyle = element.filledColor
            context.strokeStyle = element.color
            context.lineWidth = element.filledColor ? element.width * 2 : element.width
            context.globalCompositeOperation = element.eraseMode ? "destination-out" : "source-over"
            if (element.type == "line") {
                context.beginPath();
                context.moveTo(element.points[0].x, element.points[0].y)
                for (let i = 1; i < element.points.length; i++) {
                    context.lineTo(element.points[i].x, element.points[i].y)
                }
                context.stroke();
            } else if (element.type == "circle") {
                context.beginPath()
                context.ellipse(0.5 * (element.end.x + element.begin.x), 0.5 * (element.end.y + element.begin.y), Math.abs(element.end.x - element.begin.x) / 2, Math.abs(element.end.y - element.begin.y) / 2, 0, 0, 2 * Math.PI)
                context.stroke()
            } else if (element.type == "straight") {
                context.beginPath()
                context.moveTo(element.begin.x, element.begin.y)
                context.lineTo(element.end.x, element.end.y)
                context.stroke()
            } else if (element.type == "triangle") {
                context.beginPath()
                context.moveTo(element.begin.x, element.begin.y)
                context.lineTo(element.end.x, element.begin.y)
                context.lineTo(0.5 * (element.end.x + element.begin.x), element.end.y)
                context.lineTo(element.begin.x, element.begin.y)
                context.lineTo(element.end.x, element.begin.y)
                context.stroke()
            } else if (element.type == "rect") {
                context.beginPath()
                context.rect(element.begin.x, element.begin.y, element.end.x - element.begin.x, element.end.y - element.begin.y)
                context.stroke()
            }
            if (element.filledColor) context.fill()
            context.fillStyle = undefined
            context.globalCompositeOperation = "source-over"
        }

    });
}

function resetTextbox() {
    clientDragStart = undefined
    dragStart = undefined
    dragEnd = undefined
    $("#textInputEmbeded").remove()
    clearPage()
    redraw()
}

/*
    "Arial",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Times New Roman",
    "Georgia",
    "Comic Sans MS",
    "Courier"
*/

function getFontOffset(type) {
    switch (type) {
        case "Arial":
            return 0.8465
        case "Verdana":
            return 0.8975
        case "Tahoma":
            return 0.89
        case "Trebuchet MS":
            return 0.857
        case "Times New Roman":
            return 0.8355
        case "Georgia":
            return 0.8485
        case "Comic Sans MS":
            return 0.905
        default:
            return 0.763
    }
}

function setTextAlign(align) {
    textAlign = align
    TEXT_ALIGN.map((val) => {
        if (textAlign === val) {
            $(`#align-${val}-option`).addClass("bg-gray-300").removeClass("hover:bg-gray-200")
        } else {
            $(`#align-${val}-option`).removeClass("bg-gray-300").addClass("hover:bg-gray-200")
        }
    })
}

function addInputBox(x, y, w, h, dragStart, dragEnd) {
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'textInputEmbeded'
    input.setAttribute("startX", dragStart.x)
    input.setAttribute("startY", dragStart.y)
    input.setAttribute("endX", dragEnd.x)
    input.setAttribute("endY", dragEnd.y)
    input.setAttribute("align", textAlign)
    input.style.textAlign = textAlign
    input.style.position = 'fixed'
    input.style.left = (x) + 'px'
    input.style.top = (y) + 'px'
    input.style.width = w / canvaMultiplier + 'px'
    input.style.height = h / canvaMultiplier+ 'px'
    input.style.fontSize = `${Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)) / canvaMultiplier}px`
    input.style.fontFamily = $("#font-selector-text").text()
    input.style.color = $("#color-picker").val()

    input.onkeydown = (event) => {
        if (event.key === "Enter") {
            const dragStart = { x: $("#textInputEmbeded")[0].getAttribute("startX"), y: $("#textInputEmbeded")[0].getAttribute("startY") }
            const dragEnd = { x: $("#textInputEmbeded")[0].getAttribute("endX"), y: $("#textInputEmbeded")[0].getAttribute("endY") }
            const align = $("#textInputEmbeded")[0].getAttribute("align")
            memoStack.push({
                type: "text",
                x: Math.min(parseFloat(dragStart.x), parseFloat(dragEnd.x)),
                y: Math.min(parseFloat(dragStart.y), parseFloat(dragEnd.y)) + Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)) * getFontOffset($("#font-selector-text").text()),
                font: `${Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y))}px ${$("#font-selector-text").text()}`,
                color: $("#textInputEmbeded").css("color"),
                text: $("#textInputEmbeded").val(),
                width: Math.abs(parseFloat(dragEnd.x) - parseFloat(dragStart.x)),
                align: align
            })
            resetTextbox()
            enableUndoRedo(memoStack.length != 0, dropStack.length != 0)
        }
    };

    document.body.appendChild(input);

    input.focus();

    hasInput = true;
}

function fontSelectorToggler() {
    fontSelectorToggle = !fontSelectorToggle
    if (fontSelectorToggle) {
        $("#font-selector-items").fadeIn(100)
    } else {
        $("#font-selector-items").fadeOut(100)
    }
}

function repickFillColor() {
    filledColor = $("#filled-color-picker").val()
}

function fillSelectorToggler() {
    filled = !filled
    if (filled) {
        $("#fill-selector > img").attr("src", "assets/buttons/btn-filled.png")
        $("#fill-selector-menu").append('<span id="filled-color-label" class="align-top w-10">with</span>')
        $("#fill-selector-menu").append(`<input id="filled-color-picker" type="color" class="h-9 w-24 cursor-pointer" value="${filledColor}"/>`)
        $("#fill-bg-changer").css("background-color", filledColor)
        $("#filled-color-picker").change(() => {
            repickFillColor()
            $("#fill-bg-changer").css("background-color", filledColor)
        })
    } else {
        $("#fill-selector > img").attr("src", "assets/buttons/btn-filled.png")
        $("#fill-bg-changer").css("background-color", "transparent")
        $("#filled-color-picker").remove()
        $("#filled-color-label").remove()
        $("#filled-color-picker").remove()
    }
}

function initPainter() {
    let context = $("#paintboard")[0].getContext("2d")
    let path
    context.canvas.width = currentWidth
    context.canvas.height = currentHeight
    $("#paintboard").mousedown((event) => {
        if (dragEnd !== undefined) {
            resetTextbox()
        }
        setMouseCoordinates(event)
        enableUiDetect(false)
        changeBrushStat()
        if (paintState >= PaintState.TEXT) {
            isDragging = true
            dragStart = { x: mouseX, y: mouseY }
            clientDragStart = { x: event.clientX, y: event.clientY }
        } else {
            isDrawing = true
            path = {
                type: "line",
                width: context.lineWidth,
                color: context.strokeStyle,
                eraseMode: paintState == PaintState.ERASE,
                points: [{
                    x: mouseX,
                    y: mouseY
                }]
            }
            context.beginPath()
            context.moveTo(mouseX, mouseY)
            context.lineCap = 'round';
        }
    })
    $("#paintboard").mousemove((event) => {
        setMouseCoordinates(event)
        if (isDragging) {
            clearPage()
            redraw()
            context.lineWidth = (paintState === PaintState.RECT) ? 4 : 2;
            context.strokeStyle = '#9999fa';
            if (paintState !== PaintState.LINE) {
                context.beginPath()
                context.rect(dragStart.x, dragStart.y, mouseX - dragStart.x, mouseY - dragStart.y)
                context.stroke()
                context.closePath()
            }
            context.beginPath()
            context.fillStyle = "#9999fa"
            context.font = "16px Arial"
            context.fillText(`${Math.abs(mouseX - dragStart.x).toFixed(2)}x${Math.abs(mouseY - dragStart.y).toFixed(2)}`, dragStart.x + 8, dragStart.y - 8)
            context.fillStyle = undefined
            context.lineWidth = 4;
            if (paintState === PaintState.CIRCLE) {
                context.beginPath()
                context.ellipse(0.5 * (mouseX + dragStart.x), 0.5 * (mouseY + dragStart.y), Math.abs(mouseX - dragStart.x) / 2, Math.abs(mouseY - dragStart.y) / 2, 0, 0, 2 * Math.PI)
                context.stroke()
            } else if (paintState === PaintState.LINE) {
                context.beginPath()
                context.moveTo(dragStart.x, dragStart.y)
                context.lineTo(mouseX, mouseY)
                context.stroke()
            } else if (paintState === PaintState.TRIANGLE) {
                context.beginPath()
                context.moveTo(dragStart.x, dragStart.y)
                context.lineTo(mouseX, dragStart.y)
                context.lineTo(0.5 * (mouseX + dragStart.x), mouseY)
                context.lineTo(dragStart.x, dragStart.y)
                context.stroke()
            }
        } else if (isDrawing) {
            context.lineTo(mouseX, mouseY)
            context.stroke()
            path.points.push({ x: mouseX, y: mouseY })
        }
    })

    $("body").mouseup((event) => {
        setMouseCoordinates(event)
        enableUiDetect(true)
        if (isDragging) {
            isDragging = false
            dragEnd = { x: mouseX, y: mouseY }
            if (paintState == PaintState.TEXT) {
                addInputBox(Math.min(clientDragStart.x, clientDragEnd.x), Math.min(clientDragStart.y, clientDragEnd.y), Math.abs(parseFloat(dragEnd.x) - parseFloat(dragStart.x)), Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)), dragStart, dragEnd)
                return
            }
            if (paintState === PaintState.CIRCLE) {
                memoStack.push({
                    type: "circle",
                    begin: dragStart,
                    end: dragEnd,
                    color: $("#color-picker").val(),
                    filledColor: filled ? filledColor : undefined,
                    width: parseFloat($("#width-input").val())
                })
            } else if (paintState === PaintState.LINE) {
                memoStack.push({
                    type: "straight",
                    begin: dragStart,
                    end: dragEnd,
                    color: $("#color-picker").val(),
                    width: parseFloat($("#width-input").val())
                })
            } else if (paintState === PaintState.TRIANGLE) {
                memoStack.push({
                    type: "triangle",
                    begin: dragStart,
                    end: dragEnd,
                    color: $("#color-picker").val(),
                    filledColor: filled ? filledColor : undefined,
                    width: parseFloat($("#width-input").val())
                })
            } else if (paintState === PaintState.RECT) {
                memoStack.push({
                    type: "rect",
                    begin: dragStart,
                    end: dragEnd,
                    color: $("#color-picker").val(),
                    filledColor: filled ? filledColor : undefined,
                    width: parseFloat($("#width-input").val())
                })
            }
            dropStack = []
            clearPage()
            redraw()
            enableUndoRedo(memoStack.length != 0, dropStack.length != 0)
        } if (isDrawing) {
            isDrawing = false
            memoStack.push(path)
            dropStack = []
            path = {}
            enableUndoRedo(memoStack.length != 0, dropStack.length != 0)
        }
    })
}
``
function initMemory() {
    enableUndoRedo(false, false)
    $("#btn-undo").click(() => {
        dropStack.push(memoStack.splice(memoStack.length - 1, 1)[0])
        enableUndoRedo(memoStack.length != 0, dropStack.length != 0)
        clearPage()
        redraw()
    })
    $("#btn-redo").click(() => {
        memoStack.push(dropStack.splice(dropStack.length - 1, 1)[0])
        enableUndoRedo(memoStack.length != 0, dropStack.length != 0)
        clearPage()
        redraw()
    })
}

function initFont() {
    $("#font-selector-items").hide()
    SUPPORTED_FONT.map((value) => $("#font-items").append(`<div class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50 select-none cursor-pointer" onclick="setFont('${value}')">${value}</div>`))
}

function setFont(value) {
    fontType = value
    $("#font-selector-text").text(fontType)
    fontSelectorToggler()
}

function initPaintTools() {
    document.querySelectorAll(".tools-button").forEach((curr, index) => curr.onclick = () => {
        setPaintState(index)
        updateCursor()
    })
}

function rename(name) {
    filename = name
    $("#filename").text(`${filename}.png`)
}

function downloadURI(uri) {
    var link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

function resizeCanva(width, height) {
    const wMul = width/MAX_PAINTBOARD_WIDTH
    const hMul = height/MAX_PAINTBOARD_HEIGHT
    canvaMultiplier = Math.max(wMul, hMul)
    $("#paintboard").css("width", width / canvaMultiplier).css("height", height / canvaMultiplier)
}

function uploadProcess(files, filename) {
    const context = $("#paintboard")[0].getContext("2d")
    let fr = new FileReader()
    fr.onload = (event) => {
        renew()
        enableBgSetButton(false)
        let img = new Image()
        img.src = event.target.result
        img.onload = function () {
            setCanvaSize(this.width, this.height)
            resizeCanva(this.width, this.height)
            context.drawImage(img, 0, 0, currentWidth, currentHeight)
        }
        loadedImg = img
        rename(filename.split(/(\\|\/)/g).pop().replace(/\.[^/.]+$/, ""))
    }
    fr.readAsDataURL(files[0])
}

function downloadProcess() {
    const context = $("#paintboard")[0].getContext("2d")
    context.globalCompositeOperation = "source-over"
    clearPage()
    redraw()
    downloadURI(document.getElementById('paintboard').toDataURL("image/png").replace("png", "octet-stream"))
}

function setBackgroundColor() {
    backgroundColor = $("#color-picker").val()
    $("#paintboard").css("background-color", backgroundColor)
}

function enableBgSetButton(enabled) {
    if (enabled) {
        $("#btn-background-color").removeClass("bg-gray-200")
        $("#btn-background-color").prop('disabled', false)
    } else {
        console.log("dawd")
        $("#btn-background-color").addClass("bg-gray-300")
        $("#btn-background-color").prop('disabled', 'disabled')
    }
}

function onReady() {
    initColorList()
    initPainter()
    initPaintTools()
    initMemory()
    initFont()
    setTextAlign("left")
    rename("art")
    enableBgSetButton(true)
    $("body").bind('mousewheel', function (e) {
        if (e.originalEvent.wheelDelta / 120 > 0) {
            console.log('scrolling up !')
        }
        else {
            console.log('scrolling down !')
        }
    })
    $("#color-picker").change(() => {
        onColorPicked()
        updateColor()
    })
    $("#btn-upload").change(() => {
        if ($("#btn-upload").prop('files')[0]) {
            uploadProcess($("#btn-upload").prop('files'), $("#btn-upload").val())
            $("btn-upload").prop('files', "")
        }
        $("#btn-upload").val("")
    })
}

$(document).ready(onReady)