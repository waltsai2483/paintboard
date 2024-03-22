const COLOR_RECORD_COUNT = 6

let recentColors = []
let memoStack = []
let dropStack = []

let currentWidth = 1080
let currentHeight = 720
let mouseX = 0, mouseY = 0
let isDrawing = false
let isOutOfRange = false

let paintState = 1
let brushWidth = 10

const PainterState = {
    BRUSH: 0,
    ERASE: 1,
    TEXT: 2
}

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

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

function drawBorder() {
    let context = $("#paintboard")[0].getContext("2d")
    context.beginPath()
    context.rect(20, 20, currentWidth - 40, currentHeight - 40)
    context.lineWidth = 2
    context.strokeStyle = 'gray'
    context.stroke()
    context.closePath()
}

function initPainter() {
    let context = $("#paintboard")[0].getContext("2d")
    let path
    context.canvas.width = currentWidth
    context.canvas.height = currentHeight
    $("#paintboard").mousedown((event) => {
        setMouseCoordinates(event)
        enableUiDetect(false)
        changeBrushStat()
        isDrawing = true
        path = {
            width: context.lineWidth,
            color: context.strokeStyle,
            points: []
        }

        // Start Drawing
        context.beginPath()
        context.moveTo(mouseX, mouseY)
    })
    $("#paintboard").mousemove((event) => {
        setMouseCoordinates(event)
        if (isDrawing) {
            context.lineTo(mouseX, mouseY)
            context.stroke()
            path.points.push({ x: mouseX, y: mouseY })
        }
    })
    $("#paintboard").mouseup((event) => {
        setMouseCoordinates(event)
        enableUiDetect(true)
        isDrawing = false
        memoStack.push(path)
        dropStack = []
        path = {}
        enableUndoRedo(memoStack.length != 0, dropStack.length != 0)
    })
}

function redraw() {
    let context = $("#paintboard")[0].getContext("2d")
    context.clearRect(0, 0, currentWidth, currentHeight)
    memoStack.forEach((element) => {
        context.strokeStyle = element.color
        context.lineWidth = element.width
        context.beginPath();
        context.moveTo(element.points[0].x, element.points[0].y)
        for (let i = 1; i < element.points.length; i++) {
            context.lineTo(element.points[i].x, element.points[i].y)
        }
        context.stroke();
    });
}

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

function initPaintTools() {
    document.querySelectorAll(".tools-button").forEach((curr, index) => curr.onclick = () => setPaintState(index))
}

function onReady() {
    initColorList()
    initPainter()
    initPaintTools()
    initMemory()
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