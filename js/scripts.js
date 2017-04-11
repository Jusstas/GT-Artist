window.addEventListener('load', function(ev) {

//-----code--------
	var items = [];
	var imageFile = {'ready':false};

	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	
	var canvas2 = document.createElement('canvas');
	var ctx2 = canvas2.getContext('2d');
	
	var spriteIMG = new Image();
	spriteIMG.onload = function() {
		canvas2.width = this.width;
		canvas2.height = this.height;
		ctx2.drawImage(this, 0, 0);
	};
	spriteIMG.src = '../res/ItemSprites.png';
	
	var fileInput = document.getElementById("fileUpload");
	var fileLabel = fileInput.nextElementSibling;
	
	var startBtn = document.getElementById("startBtn");
//-----code--------


//-----listeners---
	fileInput.addEventListener('change', function(e)
	{
		var file = this.files[0];
		
		if('name' in file)
			fileLabel.innerHTML = file.name;
			
		if (file.type.match('image.*'))
		{
			imageFile.file = file;
			imageFile.ready = true;
		}
	});


	startBtn.addEventListener('click', function()
	{
		if (imageFile.ready)
		{
			this.disabled = true;
			setTimeout(function() {
				getColors(items);
				drawArt(imageFile.file);
			},0);
		}
		else
			alert('Please select an image to proceed');
	});
//-----listeners---


//-----functions---
	function getColors(items) {
		
		var div0 = document.getElementById("div0");
		var dataString = '';
		
		var sx = spriteIMG.width / 32;
		var sy = spriteIMG.height / 32;
		
		var id = sx * sy;

		var x = 0;
		var y = 0;
		
		for (var i = 0; i < id; i++)
		{
			var data = ctx2.getImageData(x*32, y*32, 32, 32).data;
			
			var colorObj = averageColor(data);
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

		return { r: r, g: g, b: b, pix: pix };
	}
	
	
	function drawArt(file) {
		
		var imgData = {};
		
		var canvas3 = document.createElement('canvas');
		var ctx3 = canvas3.getContext('2d');
		
		var image = new Image();
		image.onload = function() {
			
			URL.revokeObjectURL(this.src);
			
			canvas3.width = this.width;
			canvas3.height = this.height;
			ctx3.drawImage(this, 0, 0, this.width, this.height);
			
			canvas.width = this.width*32;
			canvas.height = this.height*32;
			
			imgData = ctx3.getImageData(0, 0, canvas3.width, canvas3.height);
			startDrawing(imgData);
		};
		image.src = URL.createObjectURL(file);
	}
	
	
	function startDrawing(imgData)
	{
		var data = imgData.data;
		
		var x = 0;
		var y = 0;
		
		var ix = 0;
		var iy = 0;
		var d = 0, minDif = 0;
		
		for (var i = 0, l = data.length; i < l; i += 4)
		{
			if(data[i+3] > 0)
			{
				c2 = [data[i], data[i+1], data[i+2]];
				minDif = 442;
			
				for (var i2 = 0, l2 = items.length; i2 < l2; i2++)
				{
					if (i2 == 813)
						continue;
					
					if (items[i2].pix < 900)
						continue;
				
					c1 = [items[i2].r, items[i2].g, items[i2].b]; 
				
					d = pixelDif(c1, c2);
				
					if (d < minDif)
					{
						minDif = d;
						ix = items[i2].x;
						iy = items[i2].y;
					}
				}
				ctx.drawImage(canvas2, ix*32, iy*32, 32, 32, x*32, y*32, 32, 32);
			}
			
			x++;
			if (x >= imgData.width)
			{
				x = 0;
				y++;
			}
		}
		canvas.style.display = 'block';
		startBtn.disabled = false;
	}
	
	
	function pixelDif(c1, c2){
		
		var d = 0;
		var r = (c1[0] + c2[0]) / 2;
		var p = [2+r/256, 4, 2+(255-r)/256];
		
		for (var i = 0; i < 3; i++)
		{
			d += p[i] * Math.pow(c1[i] - c2[i], 2);
		}
        return Math.sqrt(d);
    };
//-----functions---
	
});
