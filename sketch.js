// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// let scoreText = "成績分數: " + finalScore + "/" + maxScore;
// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// -----------------------------------------------------------------
// 新增：用於煙火特效的全域變數
// -----------------------------------------------------------------
let fireworks = []; // 儲存 Firework 物件的陣列
let triggerFirework = false; // 旗標：是否觸發一次煙火發射


window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        // -------------------------------------------------------------
        // 新增：如果達到滿分且分數大於 0，設定旗標來觸發煙火效果
        // -------------------------------------------------------------
        if (finalScore > 0 && finalScore === maxScore) {
             triggerFirework = true;
        } else {
             triggerFirework = false;
        }
        
        console.log("新的分數已接收:", scoreText); 
        
        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 (見方案二)
        // ----------------------------------------
        if (typeof redraw === 'function') {
            // 收到新分數後強制重繪
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

// -----------------------------------------------------------------
// 新增：Firework 類別 (為簡化，不包含複雜的粒子/重力邏輯，只是一個簡單的爆炸動畫)
// -----------------------------------------------------------------

class Firework {
    constructor(x, y, color) {
        this.pos = createVector(x, y);
        this.color = color || color(random(255), random(255), random(255));
        this.exploded = false;
        this.particles = [];
        this.lifespan = 255; // 模擬淡出效果

        // 模擬上升/爆炸的簡化點 (一個簡單的爆炸點)
        for (let i = 0; i < 50; i++) {
            let p = p5.Vector.random2D(); // 隨機方向
            let vel = p5.Vector.mult(p, random(2, 8)); // 隨機速度
            this.particles.push({
                pos: this.pos.copy(),
                vel: vel,
                lifespan: random(100, 255) // 每個粒子的生命週期
            });
        }
    }

    update() {
        if (!this.exploded) {
            // 簡單起見，直接設定為已爆炸並開始淡出
            this.exploded = true;
        }
        
        // 更新粒子位置
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.pos.add(p.vel);
            p.lifespan -= 5; // 粒子逐漸淡出
            if (p.lifespan < 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // 煙火生命週期結束
        if (this.particles.length === 0) {
            return true; // 表示煙火已結束
        }
        return false;
    }

    show() {
        noStroke();
        for (let p of this.particles) {
            // 使用粒子的生命週期來控制透明度
            let alpha = map(p.lifespan, 0, 255, 0, 255);
            this.color.setAlpha(alpha); 
            fill(this.color);
            ellipse(p.pos.x, p.pos.y, 4, 4);
        }
    }
}


function setup() { 
    // ... (其他設置)
    createCanvas(windowWidth / 2, windowHeight / 2); 
    background(255); 
    // !!! 移除 noLoop()，讓 draw() 可以持續執行來實現動畫 !!!
    // noLoop(); 
} 

// score_display.js 中的 draw() 函數片段

function draw() { 
    background(255, 50); // 輕微的殘影效果，讓煙火更流暢

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;
    
    // -----------------------------------------------------------------
    // C. 煙火動畫邏輯 (畫面反映三)
    // -----------------------------------------------------------------
    if (finalScore > 0 && finalScore === maxScore) {
        // 滿分時，確保動畫循環啟動
        loop(); 
        
        // 根據旗標，發射一個新的煙火 (確保只發射一次，直到下次分數更新)
        if (triggerFirework) {
             let x = random(width * 0.2, width * 0.8);
             let y = random(height * 0.2, height * 0.7);
             let newColor = color(random(255), random(255), random(255));
             fireworks.push(new Firework(x, y, newColor));
             triggerFirework = false; // 關閉旗標
        }
        
        // 更新和顯示所有煙火
        for (let i = fireworks.length - 1; i >= 0; i--) {
             let isDone = fireworks[i].update();
             fireworks[i].show();
             if (isDone) {
                 fireworks.splice(i, 1); // 移除已結束的煙火
             }
        }
        
        // 如果所有煙火都結束了，就停止循環
        if (fireworks.length === 0 && !triggerFirework) {
            // 可以選擇在這裡加一個小的延遲，或保持循環讓背景殘影效果持續
        }

    } else {
        // 非滿分時，停止動畫循環 (如果沒有其他持續動畫的需求)
        noLoop(); 
    }
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    textSize(80); 
    textAlign(CENTER);
    
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色 [6]
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色 [6]
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色 [6]
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(50);
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 [7]
        fill(0, 200, 50, 150); // 帶透明度
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 [4]
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // 如果您想要更複雜的視覺效果，還可以根據分數修改線條粗細 (strokeWeight) 
    // 或使用 sin/cos 函數讓圖案的動畫效果有所不同 [8, 9]。
}
