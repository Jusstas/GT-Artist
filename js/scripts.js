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
    
    var canvasBox = document.getElementById("canvasBox");
    var genLinks = document.getElementById("genLinks");
    var oLink = document.getElementById("oLink");
    var dLink = document.getElementById("dLink");
    
    var fullscreenFunc = canvasBox.requestFullscreen;
    if (!fullscreenFunc)
        ['mozRequestFullScreen','msRequestFullscreen','webkitRequestFullScreen'].forEach(function (req){
            fullscreenFunc = fullscreenFunc || canvasBox[req];});
    
    var bWidth = document.getElementById("bWidth");
    var bw = bWidth.parentElement.nextElementSibling.firstChild;
    var bHeight = document.getElementById("bHeight");
    var bh = bHeight.parentElement.nextElementSibling.firstChild;
    var resizeCheckbox = document.getElementById("resize");
    var aspectRatio = document.getElementById("aspectRatio");
    
    $('#top').velocity("scroll", 1000);
    document.getElementsByTagName("header")[0].style.height = window.innerHeight + 'px';
    $('header').children().velocity("fadeIn", {duration: 2000});
    
    var pixelProcessing = new Worker('/js/PixelProcessing.js');
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
            document.getElementById("canvasButtons").style.display = 'none';
            document.getElementById("canvasPlaceHolder").innerHTML = 'Loading...';
            document.getElementById("canvasPlaceHolder").style.display = 'block';
            
            if (!scaned)
                getColors(items);
            resizeImage();
            
            $("#art").velocity("scroll", {duration: 500, offset: 30, easing: 'ease'});
            $("#canvasBox").velocity("slideUp", {duration: 500, complete: function(){
                pixelProcessing.postMessage(['draw', items, imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)]);
            }});
        }
    });
    
    
    pixelProcessing.addEventListener('message', function(e)
    {
        for (var i = 0, l = e.data.length; i < l; i++)
            artCtx.drawImage(spriteCanvas, e.data[i][0]*32, e.data[i][1]*32, 32, 32, e.data[i][2]*32, e.data[i][3]*32, 32, 32);
        
        document.getElementById("canvasPlaceHolder").style.display = 'none';
        artCanvas.style.display = 'block';
        $("#canvasBox").velocity("slideDown", 500);
        document.getElementById("canvasButtons").style.display = 'inline-block';
        startBtn.disabled = false;
        fileInput.disabled = false;
    });
    
    
    genLinks.addEventListener('click', function()
    {
        var text = this.innerHTML;
        $('#links').velocity("fadeOut", {duration: 300});
        this.innerHTML = 'Generating...';
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
                $('#links').velocity("fadeIn", {duration: 300, display: 'inline-block'});
            });
        },300);
    });
    
    canvasBox.addEventListener('dblclick', function(){
        fullscreenFunc.call(canvasBox);
    });
    
    
    resizeCheckbox.addEventListener('change', function()
    {
        if (this.checked)
        {
            $('#rTable').velocity("slideDown", 300);
            options.resize = true;
        }
        else
        {
            $('#rTable').velocity("slideUp", 300);
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
    
    
    window.addEventListener('scroll', debounce(removeHeader, 200));
    
    $('div#container').mouseenter(function(event) { //need more test
        $('body').css('overflow', 'hidden');}).mouseleave(function(event) {$('body').css('overflow', '');
    });
    
    $(window).on('resize orientationchange', function() {
        $('header').innerHeight($(this).innerHeight());
        //document.getElementsByTagName("header")[0].style.height = window.innerHeight + 'px';
    });
    
    $('a[href*="#"]').on('click', function(e)
    {
        e.preventDefault();
        var target = $(this).attr('href');
        $(target).velocity('scroll', {duration: 500, offset: -68, easing: 'ease'});
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

    function removeHeader()
    {
        if(window.pageYOffset >= 100)
        {
            document.getElementById("tlkio").style.display = 'block';
            $("#tlkio").velocity({opacity: 1}, {duration: 500});
            document.getElementById("barUl").style.display = 'block';
            $("#barUl").velocity({opacity: 1}, {duration: 500});
        }
        
        if(window.pageYOffset < 100)
        {
            $("#tlkio").velocity({opacity: 0}, {duration: 500, complete: function(){
                document.getElementById("tlkio").style.display = 'none';
            }});
            $("#barUl").velocity({opacity: 0}, {duration: 500, complete: function(){
                document.getElementById("barUl").style.display = 'none';
            }});
        }
    }
    
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
    
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
//-----functions----------------
    
});

navigator.serviceWorker && navigator.serviceWorker.register('sw.js');
