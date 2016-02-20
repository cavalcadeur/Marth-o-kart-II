var W,H;
var quadrillage = 25;
var sx,sy;
var actif = 0;
var nJoueur = 2;
var canvas,R;
var ctx;
var info = 0;
var page = 0;
var scrollX = 0;
var scrollY = 0;
var keys = [];
var imgExplosion = new Image();
imgExplosion.src = "images/explosion.png";
var imgMenu = new Image();
imgMenu.src = "images/fond.png";
var imgPerso = [new Image(),new Image(),new Image(),new Image()];
imgPerso.forEach(
    function(e,index){
        e.src = "images/voiture" + (index + 1) + ".png";
    }
);

var imgGus = [new Image(),new Image(),new Image()];
imgGus.forEach(
    function(e,index){
        e.src = "images/j" + (index + 1) + ".png";
    }
);
var objets = ["bombe","champignon","champiOr","eclair","faux","twist"];
var imgObj = {};
var imgCroix = new Image();
imgCroix.src = "images/symetrie.png";
var imgCroixA = new Image();
imgCroixA.src = "images/symetrieA.png";
var imgCroixB = new Image();
imgCroixB.src = "images/symetrieB.png";
var imgBoite = new Image();
imgBoite.src = "images/cadeau.png";
var tour = 0;
var moving = 0;
var t2 = -50;
var speed = 600;
var course;
var edition = 0;
var nCourse = 0;
var pose = "";
var onCourse = 0;

var perso = [{"perso":"mort","x":23,y:14,"vx":24,"vy":14,"r":0,"objet":""},
             {"perso":"mort","x":23,y:13,"vx":24,"vy":13,"r":0,"objet":""}];

function chargement(){
//    course[3].carreaux = [];
//    for(var i = 0;i < 60;i ++){
//        course[3].carreaux[i] = [];
//        for(var j = 0;j < 60;j ++){
//            course[3].carreaux[i][j] = 0;
//        }
//    }
    var load = objets.length + course.length;
    course.forEach(
        function(e) {
            e.file = new Image();
            e.file.src = "images/" + e.img + ".png";
            e.file.onload = function(){
                load -= 1;
                if (load == 0) depart();
            };
        });
    objets.forEach(
        function(e,index){
            imgObj[e] = new Image();
            imgObj[e].src = "images/" + e + ".png";
            imgObj[e].onload = function(){
                load -= 1;
                if (load == 0) depart();
            };
        }
    );
}

function rnd(max){
    return Math.floor(Math.floor(Math.random()*max));
}

function scrollMaFace(touche){
    if (moving == 1) return;
    keys[touche] = 1;
    if (keys[39] == 1) scrollX += quadrillage;
    if (keys[37] == 1) scrollX -= quadrillage;
    if (keys[40] == 1) scrollY += quadrillage;
    if (keys[38] == 1) scrollY -= quadrillage;
    if (touche == 107 && quadrillage < 60) {
        var objX = (W/2 + scrollX) / quadrillage;
        var objY = (H/2 + scrollY) / quadrillage;
        quadrillage += 5;      
        centrer(objX,objY,0);
    }
    if (touche == 109 && quadrillage > 10) {
        var objX = (W/2 + scrollX) / quadrillage;
        var objY = (H/2 + scrollY) / quadrillage;
        quadrillage -= 5;      
        centrer(objX,objY,0);      
    }
    draw();
}

function resize(){
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.setAttribute("width",W);
    canvas.setAttribute("height",H);
}


function start(){
    canvas = document.querySelector("#canvas");
    ctx = canvas.getContext("2d");
    W = canvas.width;
    H = canvas.height;
    resize();
    course = defineVar();
    chargement();
}

function menu(){
    ctx.textAlign = "center";
    ctx.font = "30px serif";
    ctx.drawImage(imgMenu,0,0,W,H);
    ctx.globalAlpha = 0.5;
    var tailleX = (W - 20) / 5;
    var tailleY = (H - 20) / 5;
    course.forEach(
        function(e,index){
            ctx.fillStyle = "rgb(65,65,65)";
            ctx.fillRect(10 + Math.floor(index / 5) * tailleX,10 + index * tailleY,tailleX - 20,tailleY - 20);
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillText(e.nom,10 + tailleX / 2 - 10,10 + index * tailleY + tailleY / 2 - 10);
        }
    );
    ctx.globalAlpha = 1.0;
}

function depart(){
    canvas.addEventListener(
        "mouseup",
        function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            //evt = evt.changedTouches[0];
            var rect = canvas.getBoundingClientRect();
            var x = evt.clientX;
            var y = evt.clientY;
            if (evt.buttons == 1)
                if (onCourse == 0) select(x,y);
                else bouton(x,y);
        });
    canvas.addEventListener(
        "wheel",
        function(evt) {
            if (onCourse == 0) return;
            evt.stopPropagation();
            evt.preventDefault();
            //evt = evt.changedTouches[0];
            if (evt.deltaY > 0)scrollMaFace(109);
            else scrollMaFace(107);
        });
    document.addEventListener(
        "keydown",
        function (event){
            if (onCourse == 0) return;
            event.preventDefault();
            event.stopPropagation();
            scrollMaFace(event.keyCode);
        }
    );
    document.addEventListener(
        "keyup",
        function (event){
            if (onCourse == 0) return;
            event.preventDefault();
            event.stopPropagation();
            keys[event.keyCode] = 0;
        }
    );
    menu();
}

function centrer(x,y,temps){
    if (temps == 0){
        scrollX = x * quadrillage - W/2;
        scrollY = y * quadrillage - H/2;
        return;
    }
    moving = 1;
    var objX = x * quadrillage - W/2 - scrollX;
    var objY = y * quadrillage - H/2 - scrollY;
    var oldX = scrollX;
    var oldY = scrollY;
    var t3 = -50;
    var g = function(u) {
        if (t3 == -50) t3 = u;
        scrollX = (u - t3) / temps * objX + oldX;
        scrollY = (u - t3) / temps * objY + oldY;
        draw();
        if (u - t3 < temps)window.requestAnimationFrame(g);
        else {
            scrollX = objX + oldX;
            scrollY = objY + oldY;
            t3 = -50;
            moving = 0;
            draw();
        }
    };
    window.requestAnimationFrame(g);

}

function movePerso(x,y){
    moving = 1;
    perso[tour].vx = x*2 - perso[tour].x;
    perso[tour].vy = y*2 - perso[tour].y;
    var dx = x - perso[tour].x;
    var dy = y - perso[tour].y;
    perso[tour].r = rotate(dx,dy);
    var listePoints = liste(x,y);
    var aie = 0;
    listePoints.forEach(
        function(e,index){
            course[nCourse].boite.forEach(function(f,j){
                if (e[0] == f[0] && e[1] == f[1] && perso[tour].objet == ""){
                    perso[tour].objet = objets[rnd(objets.length)];
                }
            });
            course[nCourse].faux.forEach(function(f,j){
                if (e[0] == f[0] && e[1] == f[1]){
                    aie = 1;
                    course[nCourse].faux.splice(j,1);
                }
            });
            if (course[nCourse].carreaux[e[0]][e[1]] == 2 | aie == 1){
                x = listePoints[index-1][0];
                y = listePoints[index-1][1];
                dx = listePoints[index-1][0] - perso[tour].x;
                dy = listePoints[index-1][1] - perso[tour].y;
                perso[tour].vx = x;
                perso[tour].vy = y;
                return;
            }
            
        });
    var f = function(t) {
        if (t2 == -50) t2 = t;
        perso[tour].x = (t - t2) / speed * dx + x - dx;
        perso[tour].y = (t - t2) / speed * dy + y - dy;
        draw();
        if (t - t2 < speed)window.requestAnimationFrame(f);
        else {
            if (course[nCourse].carreaux[x][y] == 1){
                perso[tour].x = x;
                perso[tour].y = y;
            }
            else {
                perso[tour].x = x - dx;
                perso[tour].y = y - dy;
                perso[tour].vx = perso[tour].x;
                perso[tour].vy = perso[tour].y;
            }
            course[nCourse].boite.forEach(function(f,j){
                if (perso[tour].x == f[0] && perso[tour].y == f[1] && perso[tour].objet == ""){
                    perso[tour].objet = objets[rnd(objets.length)];
                }
            });
            t2 = -50;
            tour += 1;
            if (tour == perso.length) tour = 0;
            centrer(perso[tour].x,perso[tour].y,600);
        }
    };
    window.requestAnimationFrame(f);
}

function liste(x,y){
    var result = [];
    if (x == perso[tour].x){
        for (var i = 0;i <= y - perso[tour].y;i++){
            result.push([perso[tour].x,perso[tour].y + i]);
        }
    }
    else if (Math.abs(x - perso[tour].x) >= Math.abs(y - perso[tour].y)){
        var coef = (y - perso[tour].y)/(x - perso[tour].x);
        for (var i = 0;i <= x - perso[tour].x;i++){
            result.push([perso[tour].x + i * ((x - perso[tour].x) / Math.abs(x - perso[tour].x)),Math.round(perso[tour].y + i*coef)]);
        }
    }
    else {
        var coef = (x - perso[tour].x)/(y - perso[tour].y);
        for (var i = 0;i <= y - perso[tour].y;i++){
            result.push([Math.round(perso[tour].x + i*coef),perso[tour].y + i * ((y - perso[tour].y) / Math.abs(y - perso[tour].y))]);
        }
    }
    return result;

}

function rotate(x,y){
    if (x == 0) return 1;
    if (Math.abs(y / x) < Math.tan(22.5)) return 0;
    else if (Math.abs(y / x) > 1 / Math.tan(22.5))return 1;
    else if (x * y > 0) return 2;
    else return 3;
}

function select(x,y){
    var tailleX = (W - 20) / 5;
    var tailleY = (H - 20) / 5;
    course.forEach(
        function(e,index){
            if (x > 10 + Math.floor(index / 5) * tailleX && y > 10 + index * tailleY && x < Math.floor(index / 5) * tailleX + tailleX - 10 && y < index * tailleY + tailleY - 10){
                nCourse = index;
                onCourse = 1;
                perso[0].x = e.persos[0][0];
                perso[0].y = e.persos[0][1];
                perso[0].vx = e.persos[0][2];
                perso[0].vy = e.persos[0][3];
                perso[1].x = e.persos[1][0];
                perso[1].y = e.persos[1][1];
                perso[1].vx = e.persos[1][2];
                perso[1].vy = e.persos[1][3];
                return;
            }
        }
    );
    if (onCourse == 1) draw();

}

function bouton(x,y){
    if (pose == ""){
        if (moving == 1) return;
        if (x < 60 && y < 60 && perso[tour].objet != "") utiliseObj();
        x += scrollX;
        y += scrollY;
        while (x % quadrillage != 0){
            x -= 1;        
        }
        while (y % quadrillage != 0){
            y -= 1;        
        }
        x = x / quadrillage;
        y = y / quadrillage;
        if (edition == 1) {course[nCourse].carreaux[x][y] = (course[nCourse].carreaux[x][y] + 1) % 3;draw();console.log(course[nCourse].carreaux);}
        else if ((x == perso[tour].vx + 1 | x == perso[tour].vx - 1 | x == perso[tour].vx) && (y == perso[tour].vy + 1 | y == perso[tour].vy - 1 | y == perso[tour].vy)){
            movePerso(x,y);
        }
    }
    else if (pose == "twist"){ 
        x += scrollX;
        y += scrollY;
        while (x % quadrillage != 0){
            x -= 1;        
        }
        while (y % quadrillage != 0){
            y -= 1;        
        }
        x = x / quadrillage;
        y = y / quadrillage;
        if ((x == perso[tour].vx + 1 | x == perso[tour].vx - 1 | x == perso[tour].vx) && (y == perso[tour].vy + 1 | y == perso[tour].vy - 1 | y == perso[tour].vy)){
            perso[tour].vx = x;
            perso[tour].vy = y;
            pose = "";
            draw();
        }
    }
    else if (pose == "bombe"){
        x += scrollX;
        y += scrollY;
        while (x % quadrillage != 0){
            x -= 1;        
        }
        while (y % quadrillage != 0){
            y -= 1;        
        }
        x = x / quadrillage;
        y = y / quadrillage;
        draw();
        ctx.drawImage(imgExplosion,x * quadrillage - scrollX - quadrillage / 2,y * quadrillage - scrollY - quadrillage / 2,quadrillage * 2,quadrillage * 2);
        perso.forEach(
            function(e){
                if (e.x == x && e.y == y) {e.vx = e.x; e.vy = e.y;}
            }
        );
        pose = "";
    }

    else {
        x += scrollX;
        y += scrollY;
        while (x % quadrillage != 0){
            x -= 1;        
        }
        while (y % quadrillage != 0){
            y -= 1;        
        }
        x = x / quadrillage;
        y = y / quadrillage;
        course[nCourse][pose].push([x,y]);
        pose = "";
        draw();
    }
}

function draw(){
    drawCourse();
    perso.forEach(
        function(e,index) {
            ctx.drawImage(imgPerso[e.r],e.x * quadrillage - scrollX,e.y * quadrillage - scrollY,quadrillage,quadrillage);
            ctx.drawImage(imgGus[index],e.x * quadrillage - scrollX,e.y * quadrillage - scrollY,quadrillage,quadrillage);
        }
    );
    if (edition == 1){
        for (var i = 0;i < course[nCourse].taille;i++){
            for (var j = 0;j < course[nCourse].tailleY;j++){
                if (course[nCourse].carreaux[i][j] == 1){
                    ctx.fillStyle = "rgb(0,200,0)";
                    ctx.fillRect(i * quadrillage - scrollX,j * quadrillage - scrollY,quadrillage,quadrillage);
                }
                if (course[nCourse].carreaux[i][j] == 2){
                    ctx.fillStyle = "rgb(200,0,0)";
                    ctx.fillRect(i * quadrillage - scrollX,j * quadrillage - scrollY,quadrillage,quadrillage);
                }
            }
        }

    }
    if (moving == 0) {
        var points = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
        ctx.drawImage(imgCroix,perso[tour].vx * quadrillage  - scrollX,perso[tour].vy * quadrillage - scrollY,quadrillage,quadrillage);
        points.forEach(
            function(e,index){
                if (course[nCourse].carreaux[perso[tour].vx + e[0]][perso[tour].vy + e[1]] == 1){
                    ctx.drawImage(imgCroixB,(perso[tour].vx + e[0]) * quadrillage  - scrollX,(perso[tour].vy + e[1]) * quadrillage - scrollY,quadrillage,quadrillage);
                }
                else {
                    ctx.drawImage(imgCroixA,(perso[tour].vx + e[0]) * quadrillage  - scrollX,(perso[tour].vy + e[1]) * quadrillage - scrollY,quadrillage,quadrillage);
                }


            }
        );
        if (perso[tour].objet != "") ctx.drawImage(imgObj[perso[tour].objet],0,0); 
    }
}

function drawCourse(){
    ctx.fillStyle = "rgb(200,210,220)";
    ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = "rgb(50,50,50)";
    for (var i = 0;i <= W / quadrillage;i ++){
        ctx.beginPath();
        ctx.moveTo(i * quadrillage - scrollX % quadrillage,0);
        ctx.lineTo(i * quadrillage - scrollX % quadrillage,H);
        ctx.stroke();
    }
    for (var i = 0;i <= H / quadrillage;i ++){
        ctx.beginPath();
        ctx.moveTo(0,i * quadrillage - scrollY % quadrillage);
        ctx.lineTo(W,i * quadrillage - scrollY % quadrillage);
        ctx.stroke();
    }
    ctx.drawImage(course[nCourse].file,0 - scrollX,0 - scrollY,course[nCourse].taille * quadrillage,course[nCourse].tailleY * quadrillage);
    ctx.fillStyle = course[nCourse].couleur;
    ctx.fillRect(0,0,-scrollX,H);
    ctx.fillRect(-scrollX + course[nCourse].taille * quadrillage,0,W,H);
    ctx.fillRect(-scrollX,0,course[nCourse].taille * quadrillage,-scrollY);
    ctx.fillRect(-scrollX,-scrollY + course[nCourse].tailleY * quadrillage,course[nCourse].taille * quadrillage,H);
    course[nCourse].boite.forEach(
        function(e){
            ctx.drawImage(imgBoite,e[0] * quadrillage - scrollX,e[1] * quadrillage - scrollY,quadrillage,quadrillage);
        }
    );
    course[nCourse].faux.forEach(
        function(e){
            ctx.drawImage(imgBoite,e[0] * quadrillage - scrollX,e[1] * quadrillage - scrollY,quadrillage,quadrillage);
        }
    );
}

function utiliseObj(){
    if (perso[tour].objet == "champignon" | perso[tour].objet == "champiOr") boost(tour,1);
    else if (perso[tour].objet == "faux") pose = "faux";
    else if (perso[tour].objet == "eclair"){
        for(var i = 0;i < perso.length;i ++){
            if (i != tour) boost(i,-1);
        }
    }
    else if (perso[tour].objet == "bombe") pose = "bombe";
    else if (perso[tour].objet == "twist") pose = "twist";
    if (perso[tour].objet == "champiOr") perso[tour].objet = "champignon";
    else perso[tour].objet = "";
    draw();
}

function boost(nPerso,vit){
    if (perso[nPerso].vx > perso[nPerso].x) perso[nPerso].vx += vit;
    else if (perso[nPerso].vx < perso[nPerso].x) perso[nPerso].vx -= vit;
    if (perso[nPerso].vy > perso[nPerso].y) perso[nPerso].vy += vit;
    else if (perso[nPerso].vy < perso[nPerso].y) perso[nPerso].vy -= vit;
}
