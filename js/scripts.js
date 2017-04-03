window.addEventListener('load', function(ev) {

//-----functions---
	var getColors = function(colors) {
		
		var canvas2 = document.createElement('canvas');
		var ctx2 = canvas2.getContext('2d');
		canvas2.width = spriteIMG.width;
		canvas2.height = spriteIMG.height;
		ctx2.drawImage(spriteIMG, 0, 0);
		
		//var id = spriteIMG.width / 32 * spriteIMG.height / 32;
		var id = 32;
		var x = 0;
		var y = 0;
		
		for (var i = 0; i < id; i++)
		{
			//x = i % spriteIMG.width / 32;
			//y = i / spriteIMG.width / 32;
			
			imageData = ctx2.getImageData(x*32, y*32, 32, 32);
			var data = imageData.data;
			colors[i] = averageColor(data);
			
			setTimeout(function(i)
			{
				document.body.style.background = 'rgb('+colors[i].r+','+colors[i].g+','+colors[i].b+')';
				
			},400*i, i);
			
			x++;
		}
		
	};
	
	
	var averageColor = function(data) {

		var r = 0;
		var g = 0;
		var b = 0;

		for (var i = 0, l = data.length; i < l; i += 4) {
			r += data[i];
			g += data[i+1];
			b += data[i+2];
		}

		r = Math.floor(r / (data.length / 4));
		g = Math.floor(g / (data.length / 4));
		b = Math.floor(b / (data.length / 4));

		return { r: r, g: g, b: b };
	};
//-----functions---


//-----code--------
	var colors = [0];

	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	
	var startBtn = document.getElementById("startBtn");
	
	var spriteIMG = new Image();
	spriteIMG.src = '../res/ItemSprites.png';
//-----code-------


//-----listeners---
	startBtn.addEventListener('click', function(){getColors(colors);});
//-----listeners---
	
});
















