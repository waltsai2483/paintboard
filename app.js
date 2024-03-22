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

let recentColors = []
let memoStack = []
let dropStack = []

let currentWidth = 1080
let currentHeight = 720
let mouseX = 0, mouseY = 0
let isDrawing = false

let isDragging = false
let clientDragStart = undefined, dragStart = undefined, dragEnd = undefined

let fontSelectorToggle = false
let fontType = SUPPORTED_FONT[0]

let paintState = 1
let brushWidth = 10

const PainterState = {
    BRUSH: 0,
    ERASE: 1,
    TEXT: 2
}

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

function updateCursor() {
    const paintboard = document.getElementById("paintboard")
    switch (paintState) {
        case PainterState.BRUSH:
            return paintboard.style.cursor = "url('assets/cursor-pen.png') 0 0,auto"
        case PainterState.ERASE:
            return paintboard.style.cursor = "url('assets/cursor-eraser.png') 8 8,auto"
        case PainterState.TEXT:
            return paintboard.style.cursor = "url('assets/cursor-text.png') 2 2,auto"
    }
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

function setMouseCoordinates(event) {
    const boundings = document.getElementById("paintboard").getBoundingClientRect()
    mouseX = event.clientX - boundings.left
    mouseY = event.clientY - boundings.top
    mouseX *= document.getElementById("paintboard").width / boundings.width
    mouseY *= document.getElementById("paintboard").height / boundings.height
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
    context.strokeStyle = paintState == PainterState.ERASE ? "#ffffff" : $("#color-picker").val()
    context.lineWidth = brushWidth
}

function clearPage() {
    let context = $("#paintboard")[0].getContext("2d")
    context.clearRect(0, 0, currentWidth, currentHeight)
}

function redraw() {
    let context = $("#paintboard")[0].getContext("2d")
    clearPage()
    memoStack.forEach((element) => {
        if (element.type == "line") {
            context.font = undefined
            context.fillStyle = undefined
            context.strokeStyle = element.color
            context.lineWidth = element.width
            context.beginPath();
            context.moveTo(element.points[0].x, element.points[0].y)
            for (let i = 1; i < element.points.length; i++) {
                context.lineTo(element.points[i].x, element.points[i].y)
            }
            context.stroke();
        } else if (element.type == "text") {
            context.font = element.font
            context.fillStyle = element.color
            context.fillText(element.text, element.x, element.y, element.width)
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

function addInputBox(x, y, w, h, dragStart, dragEnd) {
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'textInputEmbeded'
    input.setAttribute("startX", dragStart.x)
    input.setAttribute("startY", dragStart.y)
    input.setAttribute("endX", dragEnd.x)
    input.setAttribute("endY", dragEnd.y)
    input.style.position = 'fixed';
    input.style.left = (x - 4) + 'px';
    input.style.top = (y - 4) + 'px';
    input.style.width = w + 8 + 'px';
    input.style.height = h + 8 + 'px';
    input.style.fontSize = `${Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y))}px`
    input.style.fontFamily = $("#font-selector-text").text()
    input.style.color = $("#color-picker").val()

    input.onkeydown = (event) => {
        if (event.key === "Enter") {
            const dragStart = { x: $("#textInputEmbeded")[0].getAttribute("startX"), y: $("#textInputEmbeded")[0].getAttribute("startY") }
            const dragEnd = { x: $("#textInputEmbeded")[0].getAttribute("endX"), y: $("#textInputEmbeded")[0].getAttribute("endY") }
            memoStack.push({
                type: "text",
                x: Math.min(parseFloat(dragStart.x), parseFloat(dragEnd.x))-4,
                y: Math.min(parseFloat(dragStart.y), parseFloat(dragEnd.y)) + Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)) * 0.84,
                font: `${Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y))}px ${$("#font-selector-text").text()}`,
                color: $("#textInputEmbeded").css("color"),
                text: $("#textInputEmbeded").val(),
                width: Math.abs(parseFloat(dragEnd.x) - parseFloat(dragStart.x))
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
        if (paintState >= PainterState.TEXT) {
            isDragging = true
            dragStart = { x: mouseX, y: mouseY }
            clientDragStart = { x: event.clientX, y: event.clientY }
        } else {
            isDrawing = true
            path = {
                type: "line",
                width: context.lineWidth,
                color: context.strokeStyle,
                points: [{
                    x: mouseX,
                    y: mouseY
                }]
            }
            context.beginPath()
            context.moveTo(mouseX, mouseY)
        }
    })
    $("#paintboard").mousemove((event) => {
        setMouseCoordinates(event)
        if (isDragging) {
            clearPage()
            redraw()
            context.lineWidth = 2;
            context.strokeStyle = '#9999fa';
            context.strokeRect(dragStart.x, dragStart.y, mouseX - dragStart.x, mouseY - dragStart.y)
        } else if (isDrawing) {
            context.lineTo(mouseX, mouseY)
            context.stroke()
            path.points.push({ x: mouseX, y: mouseY })
        }
    })
    $("#paintboard").mouseup((event) => {
        setMouseCoordinates(event)
        enableUiDetect(true)
        if (isDragging) {
            isDragging = false
            dragEnd = { x: mouseX, y: mouseY }
            if (paintState == PainterState.TEXT) {
                addInputBox(Math.min(clientDragStart.x, event.clientX), Math.min(clientDragStart.y, event.clientY), Math.abs(parseFloat(dragEnd.x) - parseFloat(dragStart.x)), Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)), dragStart, dragEnd)
                /*
                const text = prompt("Input text: ", "Hello world!")
                memoStack.push({
                    type: "text",
                    x: Math.min(parseFloat(dragStart.x), parseFloat(dragEnd.x)),
                    y: Math.min(parseFloat(dragStart.y), parseFloat(dragEnd.y)) + Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)) - 36,
                    font: `${Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y))}px Calibri`,
                    color: $("#color-picker").val(),
                    text: text,
                    width: Math.abs(parseFloat(dragEnd.x) - parseFloat(dragStart.x))
                })
                resetTextbox()
                */
            }
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
        redraw()
    })
    $("#btn-redo").click(() => {
        memoStack.push(dropStack.splice(dropStack.length - 1, 1)[0])
        enableUndoRedo(memoStack.length != 0, dropStack.length != 0)
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

function onReady() {
    initColorList()
    initPainter()
    initPaintTools()
    initMemory()
    initFont()
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
}

$(document).ready(onReady)