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

function plotMultipleSines(ctx, xOffset, yOffset) {
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
}

function drawSpirograph() {
    const canvas = document.getElementById("spirographCanvas");
    const ctx = canvas.getContext("2d");
    
    showAxes(ctx);
    
    for (let i = -4; i < canvas.height; i += 4) {
        plotMultipleSines(ctx, i, 54 + i);
    }
}

// Initialize when window loads
window.addEventListener('load', drawSpirograph);
