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
    
    var pixelProcessing = new Worker('/js/PixelProcessing.js');
    
    var artCanvas = document.getElementById('artCanvas');
    var artCtx = artCanvas.getContext("2d");
    
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
    spriteIMG.src = '../res/v10_items.png';
    
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
            document.getElementById("links").style.display = 'none';
            genLinks.style.display = 'none';
            fullscreenButton.style.display = 'none';
            
            if (!scaned)
                getColors(items);
            resizeImage();
            
            $('html,body').animate({scrollTop:$('#art').offset().top+30}, 300);
            $("#canvasBox").slideUp(500, function(){
                pixelProcessing.postMessage(['draw', items, imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)]);
            });
        }
    });
    
    
    pixelProcessing.addEventListener('message', function(e)
    {
        for (var i = 0, l = e.data.length; i < l; i++)
            artCtx.drawImage(spriteCanvas, e.data[i][0]*32, e.data[i][1]*32, 32, 32, e.data[i][2]*32, e.data[i][3]*32, 32, 32);
        
        document.getElementById("canvasPlaceHolder").style.display = 'none';
        $("#canvasBox").slideDown(500);
        genLinks.style.display = 'block';
        fullscreenButton.style.display = 'block';
        startBtn.disabled = false;
        fileInput.disabled = false;
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
        },300);
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
        else options.keepRatio = false;
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
        $('html,body').animate({scrollTop:$(this.hash).offset().top-60}, 300);
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
            fileSizeCheck(file, imageFile.image);
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
