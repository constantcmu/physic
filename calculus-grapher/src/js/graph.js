let isDragging = false;
let points = [];
let currentScale = 1.0;
const MIN_SCALE = 0.25;
const MAX_SCALE = 4.0;
const SCALE_STEP = 0.25;

const SCALE = 50; // 1 unit = 50 pixels
const GRID_SIZE = 20;
let offsetX, offsetY;

function initializeGraph() {
    const canvas = document.getElementById('graphCanvas');
    offsetX = canvas.width / 2;
    offsetY = canvas.height / 4; // กึ่งกลางของแต่ละส่วน
    
    // เคลียร์จุดที่มีอยู่เดิม
    points = [];
}

function drawGrid(ctx, isTop) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height / 2;
    const yStart = isTop ? 0 : height;

    // วาดเส้นกริด
    ctx.beginPath();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    // เส้นตั้ง
    for (let x = 0; x <= width; x += GRID_SIZE) {
        ctx.moveTo(x, yStart);
        ctx.lineTo(x, yStart + height);
    }
    // เส้นนอน
    for (let y = yStart; y <= yStart + height; y += GRID_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    // วาดแกน
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    // แกน x
    ctx.moveTo(0, yStart + height/2);
    ctx.lineTo(width, yStart + height/2);
    // แกน y
    ctx.moveTo(width/2, yStart);
    ctx.lineTo(width/2, yStart + height);
    ctx.stroke();
}

function drawGraph(fx, ctx, color, isTop) {
    const height = ctx.canvas.height / 2;
    const yOffset = isTop ? 0 : height;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    // ปรับการวาดให้ละเอียดขึ้น
    const step = 1;  // ลดขนาด step เพื่อให้เส้นโค้งเรียบขึ้น
    for (let px = 0; px <= ctx.canvas.width; px += step) {
        const x = (px - offsetX) / SCALE;
        const y = fx(x);
        const py = yOffset + (height/2 - y * SCALE);
        
        if (px === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}

function drawSplitCanvas(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // วาดเส้นแบ่งให้ชัดเจนขึ้น
    ctx.beginPath();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]); // เส้นประ
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();
    ctx.setLineDash([]); // กลับไปเป็นเส้นปกติ
}

function f(x) {
    // หาค่า y จากจุดที่ถูกเปลี่ยนแปลง
    const point = points.find(p => Math.abs(p.x - x) < 1);
    if (point) {
        return point.y;
    }
    return Math.sin(x);  // เริ่มต้นเป็น sine curve
}

function fPrime(x) {
    // อนุพันธ์ของ sin(x) คือ cos(x)
    if (points.length > 0) {
        // ถ้ามีการเปลี่ยนแปลงกราฟ ใช้การคำนวณอนุพันธ์จากจุด
        const h = 0.1;
        const pointBefore = f(x - h);
        const pointAfter = f(x + h);
        return (pointAfter - pointBefore) / (2 * h);
    }
    return Math.cos(x);  // อนุพันธ์ของ sin(x)
}

function plotGraphs() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // วาดกริดและกราฟ
    drawGrid(ctx, true);
    drawGrid(ctx, false);
    drawSplitCanvas(ctx);
    drawGraph(f, ctx, 'blue', true);
    drawGraph(fPrime, ctx, 'red', false);
    
    // วาดเส้นสัมผัส
    const xPos = parseFloat(document.getElementById('xPosition').value);
    drawTangentLine(xPos, ctx);
}

// เพิ่มฟังก์ชันจัดการ mouse events
function handleMouseDown(e) {
    const canvas = document.getElementById('graphCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // ตรวจสอบว่าคลิกในส่วนบนของ canvas
    if (y < canvas.height / 2) {
        isDragging = true;
        updatePoint(x, y);
    }
}

function handleMouseMove(e) {
    if (!isDragging) return;
    
    const canvas = document.getElementById('graphCanvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updatePoint(x, y);
}

function handleMouseUp() {
    isDragging = false;
}

function updatePoint(x, y) {
    // แปลงพิกัด pixel เป็นค่าจริง
    const realX = (x - offsetX) / SCALE;
    const realY = (y - offsetY) / SCALE;
    
    const existingPoint = points.find(p => Math.abs(p.x - realX) < 0.1);
    if (existingPoint) {
        existingPoint.y = -realY; // กลับเครื่องหมายเพราะ canvas y กลับหัว
    } else {
        points.push({ x: realX, y: -realY });
    }
    
    // คำนวณอนุพันธ์ใหม่
    updateDerivative();
    plotGraphs();
}

function updateDerivative() {
    // เรียงลำดับจุดตาม x
    points.sort((a, b) => a.x - b.x);

    // คำนวณอนุพันธ์โดยใช้ความชันระหว่างจุด
    for (let i = 1; i < points.length; i++) {
        const deltaX = points[i].x - points[i-1].x;
        const deltaY = points[i].y - points[i-1].y;
        const slope = deltaY / deltaX;
        // อัพเดตค่าความชันในช่วงระหว่างจุด
        points[i-1].derivative = slope;
        if (i === points.length - 1) {
            points[i].derivative = slope;
        }
    }
}

function updateScale(direction) {
    const oldScale = currentScale;
    if (direction === 'in' && currentScale < MAX_SCALE) {
        currentScale += SCALE_STEP;
    } else if (direction === 'out' && currentScale > MIN_SCALE) {
        currentScale -= SCALE_STEP;
    }

    // อัพเดต scale value ที่แสดงบนหน้าเว็บ
    document.getElementById('scaleValue').textContent = currentScale.toFixed(2) + 'x';

    // ปรับ scale ของกราฟ
    const scaleFactor = currentScale / oldScale;
    points = points.map(p => ({
        x: p.x * scaleFactor,
        y: p.y * scaleFactor
    }));

    plotGraphs();
}

// เพิ่มฟังก์ชันสำหรับ reset กราฟ
function resetGraph() {
    // รีเซ็ตทุกค่ากลับไปเป็นค่าเริ่มต้น
    points = [];
    currentScale = 1.0;
    document.getElementById('scaleValue').textContent = '1x';
    document.getElementById('xPosition').value = '0';
    
    // วาดกราฟใหม่
    plotGraphs();
}

function drawTangentLine(x, ctx) {
    const height = ctx.canvas.height / 2;
    const y = f(x);
    const slope = fPrime(x);
    
    // จุดกึ่งกลางของเส้นสัมผัส
    const centerX = x * SCALE + offsetX;
    const centerY = height/2 - y * SCALE;
    
    // คำนวณจุดปลายของเส้นสัมผัส
    const lineLength = 100; // ความยาวของเส้นสัมผัส (pixel)
    const dx = lineLength / Math.sqrt(1 + slope * slope);
    const dy = slope * dx;
    
    // วาดเส้นสัมผัส
    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 1;
    ctx.moveTo(centerX - dx, centerY + dy);
    ctx.lineTo(centerX + dx, centerY - dy);
    ctx.stroke();
    
    // วาดจุดสัมผัส
    ctx.beginPath();
    ctx.fillStyle = 'green';
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();
}

window.onload = function() {
    initializeGraph();
    const canvas = document.getElementById('graphCanvas');
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    // เพิ่ม event listeners สำหรับปุ่ม zoom
    document.getElementById('zoomIn').addEventListener('click', () => updateScale('in'));
    document.getElementById('zoomOut').addEventListener('click', () => updateScale('out'));
    
    // เพิ่ม event listener สำหรับ reset (ถ้าต้องการ)
    document.getElementById('resetButton').addEventListener('click', resetGraph);
    
    document.getElementById('xPosition').addEventListener('input', plotGraphs);
    
    plotGraphs();
};