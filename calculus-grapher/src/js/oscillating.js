let oscillatingStep = -4;

function showAxes(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.beginPath();
    ctx.strokeStyle = "rgb(128,128,128)";
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
}

function drawPoint(ctx, y) {
    const radius = 3;
    ctx.beginPath();
    ctx.arc(4, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
}

function plotOscillatingSine(ctx, xOffset) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const amplitude = 40;
    const frequency = 20;
    
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(66,44,255)";
    
    let x = 4;
    ctx.moveTo(x, 50);
    
    while (x < width) {
        const y = height/2 + amplitude * Math.sin((x+xOffset)/frequency);
        ctx.lineTo(x, y);
        x++;
    }
    
    ctx.stroke();
    drawPoint(ctx, height/2 + amplitude * Math.sin((width+xOffset)/frequency));
}

function animate() {
    const canvas = document.getElementById("oscillatingCanvas");
    const ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showAxes(ctx);
    plotOscillatingSine(ctx, oscillatingStep);
    oscillatingStep += 4;
    
    requestAnimationFrame(animate);
}

// Start animation when window loads
window.addEventListener('load', animate);
