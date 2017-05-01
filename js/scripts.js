window.addEventListener('load', function() {

//-----code---------------------
    var items = [];
    var scaned = false;
    var imageFile = {
        'ready': false,
        'image': new Image(),
        'name': "",
        'big': false
    };
    
    var options = {
        'resize': false,
        'keepRatio': false,
        'rWidth': 100.0,
        'rHeight': 100.0
    };

    var artCanvas = document.createElement('canvas');
    var artCtx = artCanvas.getContext("2d");
    
    var imageCanvas = document.createElement('canvas');
    var imageCtx = imageCanvas.getContext('2d');
    
    var spriteCanvas = document.createElement('canvas');
    var spriteCtx = spriteCanvas.getContext('2d');
    
    var spriteIMG = new Image();
    spriteIMG.onload = function() {
        spriteCanvas.width = this.width;
        spriteCanvas.height = this.height;
        spriteCtx.drawImage(this, 0, 0);
    };
    spriteIMG.src = '../res/ItemSprites.png';
    
    var changeEvent = document.createEvent("HTMLEvents");
    changeEvent.initEvent('change', false, true);
    
    var inputEvent = document.createEvent("HTMLEvents");
    inputEvent.initEvent('input', false, true);
    
    var fileInput = document.getElementById("fileUpload");
    var fileLabel = fileInput.nextElementSibling;
    var startBtn = document.getElementById("startBtn");
    var oLink = document.getElementById("oLink");
    var dLink = document.getElementById("dLink");
    var bWidth = document.getElementById("bWidth");
    var bw = bWidth.parentElement.nextElementSibling.firstChild;
    var bHeight = document.getElementById("bHeight");
    var bh = bHeight.parentElement.nextElementSibling.firstChild;
    var resizeCheckbox = document.getElementById("resize");
    var aspectRatio = document.getElementById("aspectRatio");
    
    pollyFill();
//-----code---------------------



//-----listeners----------------
    fileInput.addEventListener('change', function()
    {
        var file = this.files[0];
        
        if(file.name != '')
        {
            fileLabel.innerHTML = file.name;
            imageFile.name = file.name;
        }
            
        if (file.type.match('image/*'))
        {
            if (file.size < 4 * 1024)
            {
                imageFile.big = false;
            }
            else {
                imageFile.big = true;
                if(!options.resize)
                {
                    if(confirm('Image is too big, resize?'))
                    {
                        resizeCheckbox.checked = true;
                        resizeCheckbox.dispatchEvent(changeEvent);
                    }
                }
            }
                loadImageFile(file);
        }
        else {
            imageFile.ready = false;
            alert('This file type is not supported, please select *.png *.jpg *.bmp or *.gif file');
        }
        this.value = null;
    });


    startBtn.addEventListener('click', function()
    {
        if (imageFile.ready)
        {
            if(imageFile.big && !resizeCheckbox.checked)
                alert('Please enable resize option to proceed');
            else
            {
                startBtn.disabled = true;
                fileInput.disabled = true;
                
                if (!scaned)
                    setTimeout(function(){getColors(items);},0);
                setTimeout(function(){resizeImage();},0);
                setTimeout(function(){drawArt();},0);
                setTimeout(function(){document.getElementById("canvasBox").appendChild(artCanvas);},0);
                
                setTimeout(function(){
                    artCanvas.toBlob(function(blob) {
                        oLink.href = URL.createObjectURL(blob);
                        dLink.href = oLink.href;
                        dLink.download = 'New_'+imageFile.name;
                        oLink.style.display = 'inline-block';
                        dLink.style.display = 'inline-block';
                        startBtn.disabled = false;
                        fileInput.disabled = false;
                    }, 'image/jpeg', 0.25);
                },0);
            }
        }
        else
            alert('Please choose IMAGE and wait for it to load');
    });
    
    
    resizeCheckbox.addEventListener('change', function(){
        if(this.checked)
        {
            document.getElementById('rTable').style.display = 'table';
            options.resize = true;
        }
        else {
            document.getElementById('rTable').style.display = 'none';
            options.resize = false;
        }
    });
    
    aspectRatio.addEventListener('change', function(){
        if(this.checked)
        {
            options.keepRatio = true;
            bWidth.dispatchEvent(inputEvent);
        }
        else
            options.keepRatio = false;
    });
    
    bWidth.addEventListener('input', function(){
        var value = 0;
        if(options.keepRatio)
        {
            value = Math.round(imageFile.image.height / imageFile.image.width * this.value);
            bHeight.value = value;
            bh.innerHTML = value;
            options.rHeight = value;
        }
        bw.innerHTML = this.value;
        options.rWidth = this.value;
    });
    
    bHeight.addEventListener('input', function(){
        var value = 0;
        if(options.keepRatio)
        {
            value = Math.round(imageFile.image.width / imageFile.image.height * this.value);
            bWidth.value = value;
            bw.innerHTML = value;
            options.rWidth = value;
        }
        bh.innerHTML = this.value;
        options.rHeight = this.value;
    });
    
    $('a[href*=\\#]').on('click', function(e){     
        e.preventDefault();
        $('html,body').animate({scrollTop:$(this.hash).offset().top}, 300);
    });
//-----listeners----------------



//-----functions----------------
    function getColors(items) {
        
        var sx = spriteIMG.width / 32;
        var sy = spriteIMG.height / 32;
        
        var id = sx * sy;
        
        var x = 0;
        var y = 0;
        
        var data = {};
        var colorObj = {};
        
        for (var i = 0; i < id; i++)
        {
            data = spriteCtx.getImageData(x*32, y*32, 32, 32).data;
            
            colorObj = averageColor(data);
            if (colorObj.pix > 0)
            {
                items.push(colorObj);
                items[items.length-1].x = x;
                items[items.length-1].y = y;
            }
            
            x++;
            if (x >= sx)
            {
                x = 0;
                y++;
            }
        }
        scaned = true;
    }
    
    function averageColor(data) {
        
        var r = 0;
        var g = 0;
        var b = 0;
        var pix = 0;

        for (var i = 0, l = data.length; i < l; i += 4)
        {
            if (data[i+3] > 0)
            {
                r += data[i];
                g += data[i+1];
                b += data[i+2];
                
                pix++;
            }
        }

        r = Math.floor(r / pix);
        g = Math.floor(g / pix);
        b = Math.floor(b / pix);

        return { color: [r, g, b], pix: pix };
    }
    
//--------------------
    
    function loadImageFile(file) {

        imageFile.image.onload = function() {
            imageFile.ready = true;
            bWidth.dispatchEvent(inputEvent);
            URL.revokeObjectURL(this.src);
        };
        imageFile.image.src = URL.createObjectURL(file);
    }
    
    function resizeImage() {
        
        if (options.resize)
            {
                imageCanvas.width = options.rWidth;
                imageCanvas.height = options.rHeight;
            }
            else {
                imageCanvas.width = imageFile.image.width;
                imageCanvas.height = imageFile.image.height;
            }
        imageCtx.drawImage(imageFile.image, 0, 0, imageCanvas.width, imageCanvas.height);
            
        artCanvas.width = imageCanvas.width*32;
        artCanvas.height = imageCanvas.height*32;
    }
    
//--------------------
    
    function drawArt() {
        
        var imgData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        var data = imgData.data;
        
        var x = 0;
        var y = 0;
        
        var ix = 0;
        var iy = 0;
        var d = 0, minDif = 0;
        var pixColor = [];
        var lc1 = [], lc2 = [];
        
        artCtx.clearRect(0, 0, artCanvas.width, artCanvas.height);
        
        for (var i = 0, l = data.length; i < l; i += 4)
        {
            if(data[i+3] > 0)
            {
                pixColor[i] = [data[i], data[i+1], data[i+2]];
                if (lc2[i] === undefined)
                    lc2[i] = rgb2lab(pixColor[i]);
                    
                minDif = 900;
            
                for (var i2 = 0, l2 = items.length; i2 < l2; i2++)
                {
                    if (i2 == 813)
                        continue;
                    
                    if (items[i2].pix < 900)
                        continue;
                
                    if (lc1[i2] === undefined)
                        lc1[i2] = rgb2lab(items[i2].color);
                
                    //d = colorDif(items[i2].color, pixColor[i]);
                    d = labColorDif(lc1[i2], lc2[i]);
                
                    if (d < minDif)
                    {
                        minDif = d;
                        ix = items[i2].x;
                        iy = items[i2].y;
                    }
                }
                artCtx.drawImage(spriteCanvas, ix*32, iy*32, 32, 32, x*32, y*32, 32, 32);
            }
            
            x++;
            if (x >= imgData.width)
            {
                x = 0;
                y++;
            }
        }
    }
    
    
    function colorDif(c1, c2) {
        
        var d = 0;
        var r = (c1[0] + c2[0]) / 2.0;
        var p = [2+r/256.0, 4, 2+(255-r)/256.0];
        
        for (var i = 0; i < 3; i++)
        {
            d += p[i] * Math.pow(c1[i] - c2[i], 2);
        }
        return Math.sqrt(d);
    }
    
    function labColorDif(c1, c2) {
        
        var d = 0;
        
        for (var i = 0; i < 3; i++)
        {
            d += Math.pow(c1[i] - c2[i], 2);
        }
        return Math.sqrt(d);
    }
    
    
    function rgb2lab(c) {
        
        //RGB to XYZ
        var vC = [], XYZ = [];
        
        for (var i = 0; i < 3; i++)
        {
            vC[i] = ( c[i] / 255.0 );

            if (vC[i] > 0.04045)
                vC[i] = Math.pow(((vC[i] + 0.055) / 1.055), 2.4);
            else 
                vC[i] = vC[i] / 12.92;

            vC[i] = vC[i] * 100;
        }
        
        XYZ[0] = vC[0] * 0.4124 + vC[1] * 0.3576 + vC[2] * 0.1805;
        XYZ[1] = vC[0] * 0.2126 + vC[1] * 0.7152 + vC[2] * 0.0722;
        XYZ[2] = vC[0] * 0.0193 + vC[1] * 0.1192 + vC[2] * 0.9505;
        
        //XYZ to CIA-L*ab
        var L, a, b;
        
        XYZ[0] = XYZ[0] / 95.047;
        XYZ[1] = XYZ[1] / 100.0;
        XYZ[2] = XYZ[2] / 108.883;

        for (var i = 0; i < 3; i++)
        {
            if (XYZ[i] > 0.008856)
                XYZ[i] = Math.pow(XYZ[i], (1.0/3));
            else
                XYZ[i] = (7.787 * XYZ[i]) + (16.0 / 116);
        }

        L = (116 * XYZ[1]) - 16;
        a = 500 * (XYZ[0] - XYZ[1]);
        b = 200 * (XYZ[1] - XYZ[2]);
        
        return [L, a, b];
    }
    
    function pollyFill()
    {
        if (!HTMLCanvasElement.prototype.toBlob) {
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
            value: function (callback, type, quality) {

            var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
                len = binStr.length,
                arr = new Uint8Array(len);

            for (var i = 0; i < len; i++ ) {
            arr[i] = binStr.charCodeAt(i);
            }

            callback( new Blob( [arr], {type: type || 'image/png'} ) );}
            });
        }
    }
//-----functions----------------
    
});
