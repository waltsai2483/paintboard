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

let layerList = []
let currentUsedLayer = 0

let currentWidth = MAX_PAINTBOARD_WIDTH
let currentHeight = MAX_PAINTBOARD_HEIGHT
let mouseX = 0, mouseY = 0
let dragAngle = 0
let isDrawing = false

let isDragging = false
let clientDragStart = undefined, cliendDragEnd = undefined, dragStart = undefined, dragEnd = undefined

let fontSelectorToggle = false
let fontType = SUPPORTED_FONT[0]
let textAlign = "left"

let canvaMultiplier = 1
let defaultCanvaMultiplier = 1
let canvaLeft = 0, canvaTop = 0
let canvaKeyState = {
    left: false, right: false, up: false, down: false, shift: false, ctrl: false
}

let paintState = 0
let filled = false
let filledColor = "#000000"

let colorSelectorToggle = false
let colorHsl = {
    hue: 0, sat: 100, light: 50
}
let colorHslRectHold = {
    hue: false, sat: false, light: false
}

let filename = "art"
let layerDragging = false

let calibrationLine = false

const PaintState = {
    HAND: 0,
    DRAW: 1,
    ERASE: 2,
    TEXT: 3,
    CIRCLE: 4,
    LINE: 5,
    RECT: 6,
    TRIANGLE: 7
}

const SHORTCUT_MAP = {
    "1": PaintState.HAND,
    "2": PaintState.DRAW,
    "3": PaintState.ERASE,
    "4": PaintState.TEXT,
    "5": PaintState.CIRCLE,
    "6": PaintState.LINE,
    "7": PaintState.RECT,
    "8": PaintState.TRIANGLE
}

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

function updateCursor() {
    const paintboard = document.getElementById("paintboard")
    switch (paintState) {
        case PaintState.HAND:
            console.log(canvaKeyState.shift)
            return paintboard.style.cursor = "url('assets/cursor/cursor-hand.png') 16 16,auto"
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
    currentWidth = width
    currentHeight = height
    context.canvas.width = width
    context.canvas.height = height
}

function setPaintState(value) {
    paintState = value
}

function onColorPicked() {
    console.log(recentColors)
    recentColors.unshift($("#color-picker").css("background-color"))
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
        $("#color-picker").css("background-color", picked[0])
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

function updateMouseCoordinates(event) {
    const pos = getMouseCoordinates(event)
    mouseX = pos.x
    mouseY = pos.y
    clientDragEnd = { x: event.clientX, y: event.clientY }
}

function enableUiDetect(enable) {
    if (enable) {
        $(".disable-right-hover").removeClass("disable-right-hover").addClass("swipe-right-hover")
        $(".disable-up-hover").removeClass("disable-up-hover").addClass("swipe-up-hover")
        $(".disable-left-hover").removeClass("disable-left-hover").addClass("swipe-left-hover")
        $(".disable-down-hover").removeClass("disable-down-hover").addClass("swipe-down-hover")
    } else {
        $(".swipe-right-hover").removeClass("swipe-right-hover").addClass("disable-right-hover")
        $(".swipe-left-hover").removeClass("swipe-left-hover").addClass("disable-left-hover")
        $(".swipe-down-hover").removeClass("swipe-down-hover").addClass("disable-down-hover")
        $(".swipe-up-hover").removeClass("swipe-up-hover").addClass("disable-up-hover")
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
    context.strokeStyle = paintState == PaintState.ERASE ? "#ffffff" : $("#color-picker").css("background-color")
    context.lineWidth = parseFloat($("#width-input").val())
    context.globalCompositeOperation = paintState == PaintState.ERASE ? "destination-out" : "source-over";
}

function clearPage() {
    let context = $("#paintboard")[0].getContext("2d")
    context.clearRect(0, 0, currentWidth, currentHeight)
}

function renew(force = false) {
    if (!force && !confirm("Are you sure? All of your work will be discarded."))
        return
    
    const width = prompt("Input the")
    const height = prompt("Are you sure? All of your work will be discarded.")
    setCanvaSize(MAX_PAINTBOARD_WIDTH, MAX_PAINTBOARD_HEIGHT)
    resizeCanva(MAX_PAINTBOARD_WIDTH, MAX_PAINTBOARD_HEIGHT)
    enableUndoRedo(false, false)
    resetTextbox()
    rename("art")
    layerList = []
    initLayers()
    $("#paintboard").css("background-color", "#ffffff")
    clearPage()
}

function render(context, element, opacity = 1) {
    context.globalAlpha = opacity
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
        } else {
            if (element.type == "circle") {
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
        }
        if (element.filledColor) context.fill()
        context.fillStyle = undefined
        context.globalCompositeOperation = "source-over"
    }
}

function updateLayerPreview() {
    const maxWidth = 96, maxHeight = 64
    const previewMaxLength = Math.max(currentWidth / maxWidth, currentHeight / maxHeight)
    layerList.map((layer, index) => {
        const context = $(".layer-preview").get(index).getContext("2d")
        $(".layer-preview").get(index).style.width = currentWidth / previewMaxLength + "px"
        $(".layer-preview").get(index).style.height = currentHeight / previewMaxLength + "px"
        context.canvas.width = currentWidth
        context.canvas.height = currentHeight
        if (layer.loadedImage) {
            context.drawImage(layer.loadedImage, 0, 0, currentWidth, currentHeight)
        }
        layer.memoStack.map((element) => render(context, element, layer.opacity))
    })
}

function updateLayerHTML() {
    $("#layer-list").empty()
    layerList.map((layer, index, array) => {
        const box = $(`<div class="layer-box bg-gray-200" index="${index}"></div>`)
        const button = $('<button class="flex w-5 h-4 rounded-2xl bg-gray-300 bg-opacity-60 hover:bg-opacity-100 shadow-md text-center justify-center items-center font-semibold text-sm">x</button>')
        const row = $('<div class="flex flex-row h-16 justify-between items-center p-2"></div>')
        button.click((event) => {
            if (layerList.length > 1) {
                const index = parseInt(event.target.closest(".layer-box").getAttribute("index"))
                if (currentUsedLayer === index || currentUsedLayer >= layerList.length - 1) {
                    currentUsedLayer = Math.max(0, currentUsedLayer - 1)
                }
                layerList.splice(index, 1)
                updateLayerHTML()
                redraw()
                console.log(currentUsedLayer, index)
            }
        })
        box.click((event) => {
            const index = event.target.closest(".layer-box").getAttribute("index")
            $(".layer-box").eq(currentUsedLayer).removeClass("selected-layer")
            $(".layer-box").eq(index).addClass("selected-layer")
            currentUsedLayer = index

            $("#layer-opacity-input").val(parseInt(layerList[currentUsedLayer].opacity * 100))
        })

        box.append('<canvas class="layer-preview"></canvas>')
        row.append(`<span class="flex w-16 text-sm line-clamp-2">${layer.name}</span>`)
        row.append(button)
        box.append(row)
        $("#layer-list").append(box)
    })
    $(".layer-box").eq(currentUsedLayer).addClass("selected-layer")
    updateLayerPreview()
}

function pushLayer(name) {
    layerList.push({
        name: name,
        opacity: 1,
        loadedImage: undefined,
        position: {x: 0, y: 0},
        rotation: 0,
        memoStack: [],
        dropStack: []
    })
}

function initLayers() {
    pushLayer("default")
    $("#layer-input").on("input", (event) => {
        $("#btn-add-layer").prop("disabled", $("#layer-input").val().length == 0)
        if ($("#layer-input").val().length == 0) {
            $("#btn-add-layer").addClass("bg-gray-50").removeClass("hover:bg-gray-300").removeClass("bg-gray-200")
        } else {
            $("#btn-add-layer").removeClass("bg-gray-50").addClass("hover:bg-gray-300").addClass("bg-gray-200")
        }
    })
    updateLayerHTML()
    $("#layer-list").sortable({
        scroll: false,
        axis: "x",
        start: () => layerDragging = true,
        stop: (event, ui) => {
            const arrangement = []
            let reselectable = true
            $(".layer-box").each((index, layer) => {
                const oldIdx = parseInt(layer.getAttribute("index"))
                arrangement.push(layerList[oldIdx])
                if (oldIdx == currentUsedLayer && reselectable) {
                    currentUsedLayer = index
                    reselectable = false
                }
                layer.setAttribute("index", index)
            })
            layerDragging = false
            layerList = arrangement
            redraw()
        }
    })
    $(".layer-box").eq(currentUsedLayer).removeClass("bg-gray-200").addClass("bg-gray-100")
    $("#layer-opacity-input").on("change", () => {
        layerList[currentUsedLayer].opacity = $("#layer-opacity-input").val() / 100.0
        redraw()
        updateLayerPreview()
    })
    document.getElementById("layer-input").addEventListener("keydown", (event) => { if (event.key === "Enter" && $("#layer-input").val().length > 0) addNewLayer() })
}

function addNewLayer() {
    pushLayer($("#layer-input").val())
    $("#layer-input").val("")
    $("#btn-add-layer").prop("disabled", true).addClass("bg-gray-50").removeClass("hover:bg-gray-300").removeClass("bg-gray-200")
    updateLayerHTML()
}

function redraw() {
    let context = $("#paintboard")[0].getContext("2d")
    context.globalCompositeOperation = "source-over"
    context.clearRect(0, 0, currentWidth, currentHeight)
    layerList.map((layer) => {
        const newCanva = document.createElement("canvas")
        const newContext = newCanva.getContext("2d")
        newContext.canvas.width = currentWidth
        newContext.canvas.height = currentHeight
        if (layer.loadedImage) {
            newContext.drawImage(layer.loadedImage, 0, 0, currentWidth, currentHeight)
        }
        layer.memoStack.forEach((element) => render(newContext, element, layer.opacity))
        context.save()
        context.drawImage(newCanva, 0, 0)
        context.restore()
    })
    updateLayerPreview()
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
    input.style.height = h / canvaMultiplier + 'px'
    input.style.fontSize = `${Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)) / canvaMultiplier}px`
    input.style.fontFamily = $("#font-selector-text").text()
    input.style.color = $("#color-picker").css("background-color")

    input.onkeydown = (event) => {
        if (event.key === "Enter") {
            const dragStart = { x: $("#textInputEmbeded")[0].getAttribute("startX"), y: $("#textInputEmbeded")[0].getAttribute("startY") }
            const dragEnd = { x: $("#textInputEmbeded")[0].getAttribute("endX"), y: $("#textInputEmbeded")[0].getAttribute("endY") }
            const align = $("#textInputEmbeded")[0].getAttribute("align")
            layerList[currentUsedLayer].memoStack.push({
                type: "text",
                x:Math.min(parseFloat(dragStart.x), parseFloat(dragEnd.x)),
                y: Math.min(parseFloat(dragStart.y), parseFloat(dragEnd.y)) + Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)) * getFontOffset($("#font-selector-text").text()),
                font: `${Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y))}px ${$("#font-selector-text").text()}`,
                color: $("#textInputEmbeded").css("color"),
                text: $("#textInputEmbeded").val(),
                width: Math.abs(parseFloat(dragEnd.x) - parseFloat(dragStart.x)),
                align: align
            })
            resetTextbox()
            enableUndoRedo(layerList[currentUsedLayer].memoStack.length != 0, layerList[currentUsedLayer].dropStack.length != 0)
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

function colorSelectorToggler() {
    colorSelectorToggle = !colorSelectorToggle
    if (colorSelectorToggle) {
        $("#color-selector-items").fadeIn(100)
    } else {
        $("#color-selector-items").fadeOut(100)
        console.log(recentColors[0])
        console.log($("#color-picker").css("background-color"))
        if (recentColors.length == 0 || recentColors[0] !== $("#color-picker").css("background-color")) {
            onColorPicked()
            updateColor()
        }
    }

}

function fillSelectorToggler() {
    filled = !filled
    if (filled) {
        $("#fill-selector > img").attr("src", "assets/buttons/btn-filled.png")
        $("#fill-selector-menu").append('<span id="filled-color-label" class="align-top w-10">with</span>')
        $("#fill-selector-menu").append(`<button id="filled-color-picker" type="color" class="h-9 w-24 cursor-pointer rounded-lg" style="background-color: ${filledColor};"></button>`)
        $("#fill-bg-changer").css("background-color", filledColor)
        $("#filled-color-picker").click(() => {
            filledColor = $("#color-picker").css("background-color")
            $("#filled-color-picker").css("background-color", filledColor)
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

function showCalLine(context) {
    if (calibrationLine) {
        context.strokeStyle = '#9999fa';
        context.lineWidth = 2;
        context.beginPath()
        context.moveTo((canvaKeyState.shift) ? dragEnd.x : mouseX, 0)
        context.lineTo((canvaKeyState.shift) ? dragEnd.x : mouseX, currentHeight)
        context.stroke()
        context.moveTo(0, (canvaKeyState.shift) ? dragEnd.y : mouseY)
        context.lineTo(currentWidth, (canvaKeyState.shift) ? dragEnd.y : mouseY)
        context.stroke()
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
        updateMouseCoordinates(event)
        enableUiDetect(false)
        changeBrushStat()
        if (colorSelectorToggle) {
            colorSelectorToggler()
        }
        if (paintState >= PaintState.TEXT || paintState === PaintState.HAND) {
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
        }
    })
    $("body").mousemove((event) => {
        updateMouseCoordinates(event)
        if (paintState === PaintState.HAND && isDragging) {
            layerList[currentUsedLayer].position.x += mouseX - dragStart.x
            layerList[currentUsedLayer].position.y += mouseY - dragStart.y
            dragStart.x = mouseX
            dragStart.y = mouseY
            redraw()
        } else if (isDragging) {
            dragAngle = Math.acos((mouseX - dragStart.x) / Math.sqrt(Math.pow(mouseY - dragStart.y, 2) + Math.pow(mouseX - dragStart.x, 2)))
            dragAngle = ((dragStart.y - mouseY < 0) ? Math.PI * 2 - dragAngle : dragAngle) * 180 / Math.PI
            clearPage()
            redraw()
            context.lineWidth = (paintState === PaintState.RECT) ? parseFloat($("#width-input").val()) : 2
            context.strokeStyle = '#9999fa';
            if (paintState !== PaintState.LINE) {
                const height = mouseY - dragStart.y
                context.beginPath()
                context.rect(dragStart.x, dragStart.y, (canvaKeyState.shift) ? Math.sign(mouseX - dragStart.x) * Math.abs(height) : mouseX - dragStart.x, height)
                context.stroke()
                context.closePath()
                if (canvaKeyState.shift) {
                    dragEnd = { x: dragStart.x + Math.sign(mouseX - dragStart.x) * Math.abs(height), y: mouseY }
                }
            }
            context.lineWidth = parseFloat($("#width-input").val())
            context.beginPath()
            if (paintState === PaintState.CIRCLE) {
                const height = Math.abs(mouseY - dragStart.y) / 2
                context.beginPath()
                context.ellipse((canvaKeyState.shift) ? dragStart.x + Math.sign(mouseX - dragStart.x) * Math.abs(mouseY - dragStart.y) / 2 : (mouseX + dragStart.x) / 2, (mouseY + dragStart.y) / 2, (canvaKeyState.shift) ? height : Math.abs(mouseX - dragStart.x) / 2, height, 0, 0, 2 * Math.PI)
                context.stroke()
            } else if (paintState === PaintState.LINE) {
                context.beginPath()
                context.moveTo(dragStart.x, dragStart.y)
                if (canvaKeyState.shift) {
                    const fixedAngle = parseInt((dragAngle + 22.5) % 360 / 45) * 45 * Math.PI / 180
                    const length = Math.sqrt(Math.pow(mouseY - dragStart.y, 2) + Math.pow(mouseX - dragStart.x, 2))
                    dragEnd = { x: dragStart.x + Math.cos(fixedAngle) * length, y: dragStart.y - Math.sin(fixedAngle) * length }
                    context.lineTo(dragEnd.x, dragEnd.y)
                } else {
                    context.lineTo(mouseX, mouseY)
                }
                context.stroke()
            } else if (paintState === PaintState.TRIANGLE) {
                context.beginPath()
                context.moveTo(dragStart.x, dragStart.y)
                context.lineTo((canvaKeyState.shift) ? dragEnd.x : mouseX, dragStart.y)
                context.lineTo(0.5 * (((canvaKeyState.shift) ? dragEnd.x : mouseX) + dragStart.x), (canvaKeyState.shift) ? dragEnd.y : mouseY)
                context.lineTo(dragStart.x, dragStart.y)
                context.closePath()
                context.stroke()
            }
            context.fillStyle = "#9999fa"
            context.font = "16px Arial"
            context.fillText(`${Math.abs(mouseX - dragStart.x).toFixed(0)}x${Math.abs(mouseY - dragStart.y).toFixed(0)}`, mouseX + 5, mouseY)
            context.fillStyle = undefined
        } else if (isDrawing) {
            context.lineTo(mouseX, mouseY)
            context.stroke()
            path.points.push({
                x: mouseX,
                y: mouseY
            })
        } else {
            clearPage()
            redraw()
        }
        showCalLine(context)
    })

    $("body").mouseup((event) => {
        updateMouseCoordinates(event)
        enableUiDetect(true)
        if (isDragging) {
            isDragging = false
            if (paintState == PaintState.TEXT) {
                addInputBox(Math.min(clientDragStart.x, clientDragEnd.x), Math.min(clientDragStart.y, clientDragEnd.y), Math.abs(parseFloat(dragEnd.x) - parseFloat(dragStart.x)), Math.abs(parseFloat(dragEnd.y) - parseFloat(dragStart.y)), dragStart, dragEnd)
                return
            }
            if (paintState === PaintState.HAND) {
            } else {
                if (!canvaKeyState.shift || dragEnd === undefined) {
                    dragEnd = { x: mouseX, y: mouseY }
                }
                if (paintState === PaintState.CIRCLE) {
                    layerList[currentUsedLayer].memoStack.push({
                        type: "circle",
                        begin: dragStart,
                        end: dragEnd,
                        color: $("#color-picker").css("background-color"),
                        filledColor: filled ? filledColor : undefined,
                        width: parseFloat($("#width-input").val())
                    })
                } else if (paintState === PaintState.LINE) {
                    layerList[currentUsedLayer].memoStack.push({
                        type: "straight",
                        begin: dragStart,
                        end: dragEnd,
                        color: $("#color-picker").css("background-color"),
                        width: parseFloat($("#width-input").val())
                    })
                } else if (paintState === PaintState.TRIANGLE) {
                    layerList[currentUsedLayer].memoStack.push({
                        type: "triangle",
                        begin: dragStart,
                        end: dragEnd,
                        color: $("#color-picker").css("background-color"),
                        filledColor: filled ? filledColor : undefined,
                        width: parseFloat($("#width-input").val())
                    })
                } else if (paintState === PaintState.RECT) {
                    layerList[currentUsedLayer].memoStack.push({
                        type: "rect",
                        begin: dragStart,
                        end: dragEnd,
                        color: $("#color-picker").css("background-color"),
                        filledColor: filled ? filledColor : undefined,
                        width: parseFloat($("#width-input").val())
                    })
                }   
                layerList[currentUsedLayer].dropStack = []
            }
            clearPage()
            redraw()
            enableUndoRedo(layerList[currentUsedLayer].memoStack.length != 0, layerList[currentUsedLayer].dropStack.length != 0)
        } if (isDrawing) {
            isDrawing = false
            layerList[currentUsedLayer].memoStack.push(path)
            layerList[currentUsedLayer].dropStack = []
            path = {}
            enableUndoRedo(layerList[currentUsedLayer].memoStack.length != 0, layerList[currentUsedLayer].dropStack.length != 0)
            updateLayerPreview()
            redraw()
        }
    })
}

function undoCanva() {
    if (layerList[currentUsedLayer].memoStack.length > 0) {
        layerList[currentUsedLayer].dropStack.push(layerList[currentUsedLayer].memoStack.splice(layerList[currentUsedLayer].memoStack.length - 1, 1)[0])
        enableUndoRedo(layerList[currentUsedLayer].memoStack.length != 0, layerList[currentUsedLayer].dropStack.length != 0)
        clearPage()
        redraw()
    }
}

function redoCanva() {
    if (layerList[currentUsedLayer].dropStack.length > 0) {
        layerList[currentUsedLayer].memoStack.push(layerList[currentUsedLayer].dropStack.splice(layerList[currentUsedLayer].dropStack.length - 1, 1)[0])
        enableUndoRedo(layerList[currentUsedLayer].memoStack.length != 0, layerList[currentUsedLayer].dropStack.length != 0)
        clearPage()
        redraw()
    }
}

function initMemory() {
    enableUndoRedo(false, false)
    $("#btn-undo").click(() => {
        undoCanva()
    })
    $("#btn-redo").click(() => {
        redoCanva()
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

function toolsButtonSelection() {
    document.querySelectorAll(".tools-button").forEach((curr, index) => {
        if (paintState === index) {
            curr.classList.add("bg-gray-300")
        } else {
            curr.classList.remove("bg-gray-300")
        }
    })
}

function initPaintTools() {
    document.querySelectorAll(".tools-button").forEach((curr, index) => curr.onclick = () => {
        setPaintState(index)
        updateCursor()
        toolsButtonSelection()
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
    const wMul = width / MAX_PAINTBOARD_WIDTH
    const hMul = height / MAX_PAINTBOARD_HEIGHT
    canvaMultiplier = Math.max(wMul, hMul)
    defaultCanvaMultiplier = canvaMultiplier
    $("#paintboard").css("width", width / defaultCanvaMultiplier).css("height", height / defaultCanvaMultiplier)
    document.getElementById("paintboard").style.left = `calc(50% - ${width / 2 / defaultCanvaMultiplier}px + ${canvaLeft}px)`
    document.getElementById("paintboard").style.top = `calc(50% - ${height / 2 / defaultCanvaMultiplier}px + ${canvaTop}px)`
}

function uploadProcess(files, filename) {
    let fr = new FileReader()
    fr.onload = (event) => {
        let img = new Image()
        img.src = event.target.result
        img.onload = function () {
            canvaLeft = 0
            canvaTop = 0
            canvaMultiplier = 1
            if ((this.width !== currentWidth || this.height !== currentHeight) && confirm("The canva size doesn't fit the size of the image. Resize canva?")) {
                setCanvaSize(this.width, this.height)
                resizeCanva(this.width, this.height)
            }
            addNewLayer()
            layerList[layerList.length - 1].loadedImage = img
            layerList[layerList.length - 1].name = filename.split(/(\\|\/)/g).pop().replace(/\.[^/.]+$/, "")
            redraw()
            updateLayerHTML()
        }
        img.onerror = () => {
            alert("Failed to load image :(")
        }
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

function initKeyboardShortcut() {
    document.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase()
        if (SHORTCUT_MAP[key] !== undefined) {
            if (!($("#textInputEmbeded").val() !== undefined || document.activeElement === document.getElementById("layer-input") || document.activeElement === document.getElementById("width-input") || document.activeElement === document.getElementById("layer-opacity-input"))) {
                setPaintState(SHORTCUT_MAP[key])
                updateCursor()
                toolsButtonSelection()
            }
        } else if (["w", "s", "a", "d"].includes(key)) {
            if (key === "w") {
                canvaKeyState.up = false
            } else if (key === "a") {
                canvaKeyState.left = false
            } else if (key === "s") {
                canvaKeyState.down = false
            } else if (key === "d") {
                canvaKeyState.right = false
            }
        } else if (key === "f") {
            if (!($("#textInputEmbeded").val() !== undefined || document.activeElement === document.getElementById("layer-input") || document.activeElement === document.getElementById("width-input") || document.activeElement === document.getElementById("layer-opacity-input"))) {
                fillSelectorToggler()
            }
        } else if (key === "c") {
            if (!($("#textInputEmbeded").val() !== undefined || document.activeElement === document.getElementById("layer-input") || document.activeElement === document.getElementById("width-input") || document.activeElement === document.getElementById("layer-opacity-input"))) {
                calibrationLine = !calibrationLine
            }
        }
        canvaKeyState.shift = event.shiftKey
        canvaKeyState.ctrl = event.ctrlKey
    })
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase()
        if (event.ctrlKey && (key === "z" || key === "x")) {
            if (key === "z") {
                undoCanva()
            } else {
                redoCanva()
            }
        } else if (key === "w") {
            canvaKeyState.up = true
        } else if (key === "a") {
            canvaKeyState.left = true
        } else if (key === "s") {
            canvaKeyState.down = true
        } else if (key === "d") {
            canvaKeyState.right = true
        } else if (key === "escape") {
            resetTextbox()
        } else if (["[", "]"].includes(key)) {
            const currWidth = parseFloat($("#width-input").val())
            if (key === "[") {
                $("#width-input").val(currWidth - 1)
            } else {
                $("#width-input").val(currWidth + 1)
            }
        }
        canvaKeyState.shift = event.shiftKey
        canvaKeyState.ctrl = event.ctrlKey
    })
    document.addEventListener("wheel", (e) => {
        if ($("#textInputEmbeded").val() !== undefined) return
        if (e.wheelDelta < 0) {
            canvaMultiplier = Math.min(defaultCanvaMultiplier * 2, canvaMultiplier + 0.05)
        }
        else {
            canvaMultiplier = Math.max(defaultCanvaMultiplier / 2, canvaMultiplier - 0.05)
        }
        $("#paintboard").css("width", currentWidth / canvaMultiplier).css("height", currentHeight / canvaMultiplier)
        document.getElementById("paintboard").style.left = `calc(50% - ${currentWidth / 2 / canvaMultiplier}px + ${canvaLeft / canvaMultiplier}px)`
        document.getElementById("paintboard").style.top = `calc(50% - ${currentHeight / 2 / canvaMultiplier}px + ${canvaTop / canvaMultiplier}px)`
    })

    function movementLoop() {
        if ($("#textInputEmbeded").val() !== undefined || document.activeElement === document.getElementById("width-input") || document.activeElement === document.getElementById("layer-input") || document.activeElement === document.getElementById("layer-opacity-input")) {
            setTimeout(movementLoop, 20);
            return
        }
        if (canvaKeyState.up || canvaKeyState.down) {
            canvaTop += ((canvaKeyState.up) ? 3 : (canvaKeyState.down) ? -3 : 0) * ((canvaKeyState.shift) ? 20 : 1)
        } else {
            canvaLeft += ((canvaKeyState.left) ? 3 : (canvaKeyState.right) ? -3 : 0) * ((canvaKeyState.shift) ? 20 : 1)
        }
        document.getElementById("paintboard").style.left = `calc(50% - ${currentWidth / 2 / canvaMultiplier}px + ${canvaLeft / canvaMultiplier}px)`
        document.getElementById("paintboard").style.top = `calc(50% - ${currentHeight / 2 / canvaMultiplier}px + ${canvaTop / canvaMultiplier}px)`

        if (paintState === PaintState.HAND) {
            if (isDragging) {
                paintboard.style.cursor = "url('assets/cursor/cursor-hand-drag.png') 16 16,auto"
            } else {
                paintboard.style.cursor = "url('assets/cursor/cursor-hand.png') 16 16,auto"
            }
        }

        setTimeout(movementLoop, 20);
    }
    movementLoop()
}

function getColorRectMouseX(event, id) {
    const boundings = document.getElementById(id).getBoundingClientRect()
    let x = event.clientX - boundings.left
    x *= document.getElementById(id).width / boundings.width
    return x
}

function renderHue() {
    const context = $("#color-hue-rect")[0].getContext("2d")
    const width = 300
    var grad = context.createLinearGradient(0, 0, width, 0)
    for (let i = 0; i < 360; i++) {
        grad.addColorStop(i / 359, `hsl(${i}, ${colorHsl.sat}%, ${colorHsl.light}%)`)
    }
    context.fillStyle = grad
    context.fillRect(0, 0, width, 1000)
}

function renderSaturation() {
    const context = $("#color-sat-rect")[0].getContext("2d")
    const width = 300
    var grad = context.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, `hsl(${colorHsl.hue}, 0%, ${colorHsl.light}%)`)
    grad.addColorStop(1, `hsl(${colorHsl.hue}, 100%, ${colorHsl.light}%)`)
    context.fillStyle = grad
    context.fillRect(0, 0, width, 1000)
}

function renderLightness() {
    const context = $("#color-light-rect")[0].getContext("2d")
    const width = 300
    var grad = context.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, `hsl(${colorHsl.hue}, ${colorHsl.sat}%, 0%)`)
    grad.addColorStop(1, `hsl(${colorHsl.hue}, ${colorHsl.sat}%, 100%)`)
    context.fillStyle = grad
    context.fillRect(0, 0, width, 1000)
}

function updateColorRect() {
    renderHue()
    renderSaturation()
    renderLightness()
    $("#color-hue-label").text(colorHsl.hue)
    $("#color-sat-label").text(colorHsl.sat + "%")
    $("#color-light-label").text(colorHsl.light + "%")
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100
    const f = n => {
        const k = (n + h / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color).toString(16).padStart(2, '0')
    };
    return `#${f(0)}${f(8)}${f(4)}`
}

function updateMainColor() {
    onColorPicked()
    updateColor()
}

function initColorRect() {
    updateColorRect()
    $("#color-hue-rect").mousedown((event) => {
        colorHslRectHold.hue = true
    })
    $("#color-sat-rect").mousedown((event) => {
        colorHslRectHold.sat = true
    })
    $("#color-light-rect").mousedown((event) => {
        colorHslRectHold.light = true
    })
    $("body").mouseup((event) => {
        colorHslRectHold.hue = false
        colorHslRectHold.sat = false
        colorHslRectHold.light = false
    })
    $("#color-hue-rect").mousemove((event) => {
        if (colorHslRectHold.hue) {
            const colorRectX = getColorRectMouseX(event, "color-hue-rect")
            colorHsl.hue = Math.ceil(colorRectX * 360 / 299)

            updateColorRect()
            const context = $("#color-hue-rect")[0].getContext("2d")
            context.fillStyle = "#ffffff"
            context.fillRect(colorRectX - 3, 0, 6, 1000)
            context.fillStyle = "#dddddd"
            context.fillRect(colorRectX - 1, 0, 2, 1000)
            $("#color-picker").css("background-color", hslToHex(colorHsl.hue, colorHsl.sat, colorHsl.light))
        }
    })
    $("#color-sat-rect").mousemove((event) => {
        if (colorHslRectHold.sat) {
            const colorRectX = getColorRectMouseX(event, "color-sat-rect")
            colorHsl.sat = Math.ceil(colorRectX * 100 / 299)

            updateColorRect()
            const context = $("#color-sat-rect")[0].getContext("2d")
            context.fillStyle = "#ffffff"
            context.fillRect(colorRectX - 3, 0, 6, 1000)
            context.fillStyle = "#dddddd"
            context.fillRect(colorRectX - 1, 0, 2, 1000)
            $("#color-picker").css("background-color", hslToHex(colorHsl.hue, colorHsl.sat, colorHsl.light))
        }
    })
    $("#color-light-rect").mousemove((event) => {
        if (colorHslRectHold.light) {
            const colorRectX = getColorRectMouseX(event, "color-light-rect")
            colorHsl.light = Math.ceil(colorRectX * 100 / 299)

            updateColorRect()
            const context = $("#color-light-rect")[0].getContext("2d")
            context.fillStyle = "#ffffff"
            context.fillRect(colorRectX - 3, 0, 6, 1000)
            context.fillStyle = "#dddddd"
            context.fillRect(colorRectX - 1, 0, 2, 1000)
            $("#color-picker").css("background-color", hslToHex(colorHsl.hue, colorHsl.sat, colorHsl.light))
        }
    })
}

function onReady() {
    $("#color-picker").css("background-color", "#000000")
    initColorList()
    initPainter()
    initPaintTools()
    initMemory()
    initFont()
    setTextAlign("left")
    rename("art")
    updateCursor()
    initLayers()
    initKeyboardShortcut()
    toolsButtonSelection()
    initColorRect()
    $("#font-selector-items").hide()
    $("#color-selector-items").hide()
    $("#btn-upload").change(() => {
        if ($("#btn-upload").prop('files')[0]) {
            uploadProcess($("#btn-upload").prop('files'), $("#btn-upload").val())
            $("btn-upload").prop('files', "")
        }
        $("#btn-upload").val("")
    })
}

$(document).ready(onReady)