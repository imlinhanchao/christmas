var imgMove = false;
var imgResize = false;
var imgRotate = false;
var moveBegin = { x:0, y:0 };
var resizeBegin = { x:0, y:0 };
var rotateBegin = { x:0, y:0 };
var box_width = 0;

document.getElementPos = function (element)
{
    var actualTop = element.offsetTop;
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null){
        actualTop += current.offsetTop;
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    return {x: actualLeft, y: actualTop};
};

document.getElementTop = function (element)
{
    var current = element.offsetParent;
    while (current !== null){
        current = current.offsetParent;
    }
    return actualTop;
};

document.getElementById('avatar_template').onload = function() {
    loadImage();
}


var avatar_pos = document.getElementPos(document.getElementById('avatar'))

function loadImage() {
    var imgUrl = document.getElementById('avatar_img').src
    if (document.getElementById('upload').files.length > 0) {
        imgUrl = window.URL.createObjectURL(document.getElementById('upload').files[0]);
        document.getElementById('avatar_img').src = imgUrl;
        document.getElementById('avatar_img').onload = function() {
            document.getElementById('avatar_img').onload = null;
            document.getElementById('avatar_block').style.maxWidth = this.width + 'px';
            document.getElementById('upload').value = '';
            drawImage(imgUrl, mergeImage)
        }
    }
    else drawImage(imgUrl, mergeImage)
}   

function mergeImage(call) {
    document.getElementById('avatar_img').src = document.getElementById('cvs').toDataURL();
    html2canvas(document.querySelector("#avatar"),{
        backgroundColor:null,
        ignoreElements: (ele) => {
            return ele.id == 'control'
        }
    }).then(canvas => {
        call(canvas.toDataURL("image/png"));
    });
}

function refreshImage() {
    html2canvas(document.querySelector("#avatar"),{
        backgroundColor:null,
        ignoreElements: (ele) => {
            return ele.id == 'control'
        }
    }).then(canvas => {
        var image = new Image;
        image.src = canvas.toDataURL("image/png");
        image.onload = function() {
            var cvs = document.getElementById('cvs');
            cvs.getContext('2d').drawImage(image, 0, 0, 300, 300);
        }
    });
}

function drawImage(img, call) {
    var cvs = document.getElementById('cvs');
    cvs.width = document.getElementById('avatar_img').width;
    cvs.height = document.getElementById('avatar_img').height;
    var ctx = cvs.getContext('2d');
    var image = new Image;
    image.src = img;
    image.onload = function() {
        ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
        if(call) call((src) => {
            var image = new Image;
            image.src = src;
            image.onload = function() {
                ctx.drawImage(image, 0, 0, cvs.width, cvs.height);
            }
        })
    }
}

function buildImage() {
    if (document.getElementById('avatar_view').style.display == 'none') {
        refreshImage();
        document.getElementById('avatar_view').style.display = 'block';
        document.getElementById('avatar_block').style.display = 'none';
        document.getElementById('build_icon').className = 'fa fa-pencil-square-o'
    }
    else {
        document.getElementById('avatar_view').style.display = 'none';
        document.getElementById('avatar_block').style.display = 'block';
        document.getElementById('build_icon').className = 'fa fa-check'
    }
}

function downloadImage() {
    var canvas = document.getElementById('cvs');

    // 导出图片 DataURL
    var image = canvas.toDataURL("image/png")

    // 创建一个 a 标签，设置 download 属性，点击时下载文件
    var save_link = document.createElement('a');
    save_link.href = image;
    save_link.download ='avatar.png';
    
    // 创建 click 模拟事件
    var clickevent = document.createEvent('MouseEvents');
    clickevent.initEvent('click', true, false);
    // 触发点击事件
    save_link.dispatchEvent(clickevent);

}

function prevTemplate() {
    var current = parseInt(document.getElementById('avatar_template').alt);
    current = (current - 1 + 40) % 40;
    document.getElementById('avatar_template').src = 'img/' + ('0' + current).slice(-2) + '.png';
    document.getElementById('avatar_template').alt = current;
}

function nextTemplate() {
    var current = parseInt(document.getElementById('avatar_template').alt);
    current = (current + 1) % 40;
    document.getElementById('avatar_template').src = 'img/' + ('0' + current).slice(-2) + '.png';
    document.getElementById('avatar_template').alt = current;
}

function bindEvent() {
    document.getElementById('avatar_template').onmousedown = dragImgStart;
    document.getElementById('avatar_template').onmouseup = dragImgEnd;
    document.getElementById('resize').onmousedown = resizeImgStart;
    document.getElementById('resize').onmouseup = resizeImgEnd;
    document.getElementById('rotate').onmousedown = rotateImgStart;
    document.getElementById('rotate').onmouseup = rotateImgEnd;

    document.getElementById('avatar_template').ontouchstart = dragImgStart;
    document.getElementById('avatar_template').ontouchend = dragImgEnd;
    document.getElementById('resize').ontouchstart = resizeImgStart;
    document.getElementById('resize').ontouchend = resizeImgEnd;
    document.getElementById('rotate').ontouchstart = rotateImgStart;
    document.getElementById('rotate').ontouchend = rotateImgEnd;

    var transform = { x: false, y: false}

    function scaleImg (){
        var scale = '';
        if (transform.x) scale += 'scaleX(-1) ';
        if (transform.y) scale += 'scaleY(-1)';
        document.getElementById('avatar_template').style.transform = scale || null;

    }

    document.getElementById('mirrorh').onclick = function(){
        transform.x = !transform.x;
        scaleImg()
    }

    document.getElementById('mirrorv').onclick = function(){
        transform.y = !transform.y;
        scaleImg()
    }
}

function dragImgStart(e) {
    var box_pos = document.getElementPos(document.getElementById('avatar_box'))
    moveBegin = currentCoord(e);
    moveBegin.x -= box_pos.x
    moveBegin.y -= box_pos.y
    imgMove = true;
    e.stopPropagation();
    return false;
}            

function dragImgEnd(e) {
    imgMove = false;
}

function resizeImgStart(e) {
    resizeBegin = currentCoord(e);
    imgResize = true;
    box_width = document.getElementById('avatar_box').offsetWidth;
    e.stopPropagation();
    return false;
}            

function resizeImgEnd(e) {
    imgResize = false;
}

function rotateImgStart(e) {
    var pos = document.getElementPos(document.getElementById('avatar_box'))
    rotateBegin = {
        x: document.getElementById('avatar_box').offsetWidth / 2 + pos.x,
        y: document.getElementById('avatar_box').offsetHeight / 2 + pos.y
    }
    imgRotate = true;
}

function rotateImgEnd(e) {
    imgRotate = false;
}

document.onmousemove = document.ontouchmove = function(e) {
    let coord = currentCoord(e);
    if (imgMove) {
        document.getElementById('avatar_box').style.top = (coord.y - avatar_pos.y - moveBegin.y) + 'px';
        document.getElementById('avatar_box').style.left = (coord.x - avatar_pos.x - moveBegin.x) + 'px';
    }
    else if(imgResize) {
        document.getElementById('avatar_box').style.width = (coord.x - resizeBegin.x + box_width) + 'px';
    }
    else if(imgRotate) {
        var rotate = Math.atan2(coord.y - rotateBegin.y, coord.x - rotateBegin.x) / Math.PI * 180 + 90;
        document.getElementById('avatar_box').style.transform = 'rotate(' + rotate + 'deg)';
    }
}

document.onmouseup = document.ontouchend = function(e) {
    imgMove = imgRotate = imgResize = false;
    refreshImage()
}

function currentCoord(e) {
    let coord = { x:0, y:0 };
    if (e.targetTouches) {
        coord.x = e.targetTouches[0].pageX;
        coord.y = e.targetTouches[0].pageY;
    } else {
        coord.x = e.clientX;
        coord.y = e.clientY;
    }
    return coord
}

function preLoadImage() {
    var images = []
    for(var i = 1; i <= 40; i++) {
        var image = new Image();
        image.src = 'img/' + ('0' + i).slice(-2) + '.png';
        images.push(image)
    }
}

preLoadImage();

bindEvent();
