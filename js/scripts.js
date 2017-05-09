window.addEventListener('load', function()
{
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
        'keepRatio': true,
        'rWidth': 100,
        'rHeight': 100
    };
    
    var artCanvas = document.createElement('canvas');
    var artCtx = artCanvas.getContext("2d");
    artCanvas.style.maxWidth = '200%';
    
    var imageCanvas = document.createElement('canvas');
    var imageCtx = imageCanvas.getContext('2d');
    
    var spriteCanvas = document.createElement('canvas');
    var spriteCtx = spriteCanvas.getContext('2d');
    
    var spriteIMG = new Image();
    spriteIMG.onload = function()
    {
        spriteCanvas.width = this.width;
        spriteCanvas.height = this.height;
        spriteCtx.drawImage(this, 0, 0);
    };
    spriteIMG.src = '../res/v9_items.png';
    
    var changeEvent = document.createEvent("HTMLEvents");
    changeEvent.initEvent('change', false, true);
    
    var inputEvent = document.createEvent("HTMLEvents");
    inputEvent.initEvent('input', false, true);
    
    var fileInput = document.getElementById("fileUpload");
    var fileLabel = fileInput.nextElementSibling;
    var startBtn = document.getElementById("startBtn");
    
    var genLinks = document.getElementById("genLinks");
    var oLink = document.getElementById("oLink");
    var dLink = document.getElementById("dLink");
    
    var fullscreenButton = document.getElementById("buto");
    var fullscreenDiv = document.getElementById("canvasBox");
    var fullscreenFunc = fullscreenDiv.requestFullscreen;
    if (!fullscreenFunc)
        ['mozRequestFullScreen','msRequestFullscreen','webkitRequestFullScreen'].forEach(function (req){
            fullscreenFunc = fullscreenFunc || fullscreenDiv[req];});
    
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
        
        if (file.name != '')
        {
            fileLabel.innerHTML = file.name;
            imageFile.name = file.name;
        }
        
        if (fileTypeCheck(file))
            loadImageFile(file);
        
        this.value = null;
    });

    startBtn.addEventListener('click', function()
    {
        if (imageCheck())
        {
            startBtn.disabled = true;
            fileInput.disabled = true;
            
            if (!scaned)
                setTimeout(function(){getColors(items);},0);
            setTimeout(function(){resizeImage();},0);
            setTimeout(function(){drawArt();},0);
            setTimeout(function()
            {
                document.getElementById("canvasBox").appendChild(artCanvas);
                startBtn.disabled = false;
                fileInput.disabled = false;
                genLinks.style.display = 'block';
                fullscreenButton.style.display = 'block';
            },0);
        }
    });
    
    
    genLinks.addEventListener('click', function()
    {
        var text = this.innerHTML;
        $('#links').slideUp(300);
        this.innerHTML = 'Generating... ';
        this.disabled = true;
        setTimeout(function()
        {
            artCanvas.toBlob(function(blob)
            {
                dLink.href = URL.createObjectURL(blob);
                dLink.download = 'New_'+imageFile.name.replace(/\.[^/.]+$/, "")+'.jpg';
                oLink.href = dLink.href;
                genLinks.innerHTML = text;
                genLinks.disabled = false;
                $('#links').slideDown(300);
            }, 'image/jpeg', 0.25);
        },100);
    });
    
    fullscreenButton.addEventListener('click', function(){
        fullscreenFunc.call(fullscreenDiv);
    });
    
    
    resizeCheckbox.addEventListener('change', function()
    {
        if (this.checked)
        {
            $('#rTable').slideDown(300);
            options.resize = true;
        }
        else
        {
            $('#rTable').slideUp(300);
            options.resize = false;
        }
    });
    
    aspectRatio.addEventListener('change', function()
    {
        if (this.checked)
        {
            options.keepRatio = true;
            bWidth.dispatchEvent(inputEvent);
        }
        else
            options.keepRatio = false;
    });
    
    bWidth.addEventListener('input', function()
    {
        var value = 0;
        if (options.keepRatio)
        {
            value = Math.round(imageFile.image.height / imageFile.image.width * this.value);
            if (!isNaN(value))
            {
                bHeight.value = value;
                bh.innerHTML = value;
                options.rHeight = value;
            }
        }
        bw.innerHTML = this.value;
        options.rWidth = this.value;
    });
    
    bHeight.addEventListener('input', function()
    {
        var value = 0;
        if (options.keepRatio)
        {
            value = Math.round(imageFile.image.width / imageFile.image.height * this.value);
            if (!isNaN(value))
            {
                bWidth.value = value;
                bw.innerHTML = value;
                options.rWidth = value;
            }
        }
        bh.innerHTML = this.value;
        options.rHeight = this.value;
    });
    
    $('a[href*=\\#]').on('click', function(e)
    {     
        e.preventDefault();
        $('html,body').animate({scrollTop:$(this.hash).offset().top-55}, 300);
    });
//-----listeners----------------



//-----functions----------------
    function fileTypeCheck(file)
    {
        if (!file.type.match('image/*'))
        {
            imageFile.ready = false;
            alert('Please select valid image format (*.png *.jpg *.bmp, *.gif, *.svg)');
            return false;
        }
        return true;
    }
    
    function fileSizeCheck(file, image)
    {
        bWidth.value = image.width;
        bWidth.dispatchEvent(inputEvent);
        if (!options.keepRatio)
        {
             bHeight.value = image.height;
             bHeight.dispatchEvent(inputEvent);
        }
        
        if (image.width * image.height > bWidth.max * bWidth.max)
            imageFile.big = true;
        else
            imageFile.big = false;
        
        if (!options.resize && imageFile.big)
        {
            if (confirm('Image is too big, resize?'))
            {
                resizeCheckbox.checked = true;
                resizeCheckbox.dispatchEvent(changeEvent);
            }
        }
    }
    
    function imageCheck()
    {
        if (!imageFile.ready)
        {
            alert('Please choose IMAGE and wait for it to load');
            return false;
        }
        
        if (imageFile.big && !resizeCheckbox.checked)
        {
            alert('Please enable resize option to proceed');
            return false;
        }
        
        return true;
    }

//--------------------

    function loadImageFile(file)
    {
        imageFile.image.onload = function()
        {
            fileSizeCheck(file, imageFile.image)
            imageFile.ready = true;
            URL.revokeObjectURL(this.src);
        };
        imageFile.image.src = URL.createObjectURL(file);
    }
    
    function resizeImage()
    {
        if (options.resize)
        {
            imageCanvas.width = options.rWidth;
            imageCanvas.height = options.rHeight;
        }
        else
        {
            imageCanvas.width = imageFile.image.width;
            imageCanvas.height = imageFile.image.height;
        }
        imageCtx.drawImage(imageFile.image, 0, 0, imageCanvas.width, imageCanvas.height);
            
        artCanvas.width = imageCanvas.width*32;
        artCanvas.height = imageCanvas.height*32;
    }

//--------------------

    function getColors(items)
    {
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
    
    function averageColor(data)
    {
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
    
    function drawArt()
    {
        
        var imgData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        var data = imgData.data;
        
        var x = 0;
        var y = 0;
        
        var ix = 0;
        var iy = 0;
        var d = 0, minDif = 0;
        var lc1 = [], lc2 = [];
        
        artCtx.clearRect(0, 0, artCanvas.width, artCanvas.height);
        
        for (var i = 0, l = data.length; i < l; i += 4)
        {
            if (data[i+3] > 0)
            {
                if (lc2[i] === undefined)
                    lc2[i] = rgb2lab([data[i], data[i+1], data[i+2]]);
                    
                minDif = 900;
            
                for (var i2 = 0, l2 = items.length; i2 < l2; i2++)
                {
                    //if (items[i2].pix < 900)
                        //continue;
                
                    if (lc1[i2] === undefined)
                        lc1[i2] = rgb2lab(items[i2].color);

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
    
//--------------------
    
    function labColorDif(c1, c2)
    {
        var d = 0;
        
        for (var i = 0; i < 3; i++)
        {
            d += Math.pow(c1[i] - c2[i], 2);
        }
        return Math.sqrt(d);
    }
    
    
    function rgb2lab(c)
    {
        
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
    
//--------------------
    
    function pollyFill()
    {
        if (!HTMLCanvasElement.prototype.toBlob)
        {
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
            value: function (callback, type, quality)
            {
                var binStr = atob( this.toDataURL(type, quality).split(',')[1] );
                var len = binStr.length;
                var arr = new Uint8Array(len);

                for (var i = 0; i < len; i++ )
                    arr[i] = binStr.charCodeAt(i);

                callback( new Blob( [arr], {type: type || 'image/png'} ) );}
            });
        }
    }
//-----functions----------------
    
});


navigator.serviceWorker && navigator.serviceWorker.register('sw.js');
