//Object holding food items at various stages
var items={
	nutriFood:[],
	mealFood:[],
	mealLabel:[], 	//Holds objects containing calorie total per mealtype
	mealLabelIndex:0,
	getMapData:function(query){
		//Fn that fetches chart axis data points

		var arr=[];
		if(query==='label'){
			this.mealLabel.forEach(function(value){
				arr.push(value.name);
			});
		}
		else{
			this.mealLabel.forEach(function(value){
				arr.push(value.calories);
			});
		}
		return arr;
	}
};


//Object for searching food items
var handler={
	find:function(){
		var foodType=document.getElementById("foodType");
		var exists=false;

		items.mealLabel.forEach(function(obj,index){
			if(obj.name===foodType.value){
				items.mealLabelIndex=index;
				exists=true;
			}
		});

		if(!exists){
				items.mealLabel.push({
				name:foodType.value,
				calories:0
			});
		}
		

		var searchField=document.getElementById("search");
		connection.searchPara=encodeURIComponent(searchField.value);
		connection.nutritionix(foodType.value,items.mealLabelIndex);

		foodType.value="";
		items.mealLabelIndex++;	//Ready for next mealType
	},

};


// Object containing display methods
var display={
	showNutriFood:function(){
		var list=document.getElementById('nutriFoodList');

		//Clear list and meal Btns
		list.innerHTML='';
		document.getElementById('mealBtnContainer').style.display='none';

		//Populate List
		items.nutriFood.forEach(function(obj,index){
			var listItem=document.createElement('li');
			listItem.textContent='Name: '+obj.brand_name+' Calories: '+obj.nf_calories+' Fat: '+obj.nf_total_fat+' Total:'+obj.count;
			listItem.id=index;
			listItem.className='nutriList'

			listItem.setAttribute('data-foodId',obj.id);
			list.appendChild(listItem);
		});

	},

	showMealOptions:function(){
		//Clear list
		var list=document.getElementById('nutriFoodList');
		list.innerHTML='';

		//Populate Btns
		var mealBtnDiv=document.getElementById('mealBtnContainer');
		mealBtnDiv.style.display='initial';
		mealBtnDiv.innerHTML='';

		items.mealLabel.forEach(function(val){
			var newBtn=document.createElement('button');
			newBtn.textContent=val.name;
			mealBtnDiv.appendChild(newBtn);
		});
	},

	showMealFood:function(type){
		var list=document.getElementById('nutriFoodList');
		list.innerHTML='';
		items.mealFood.forEach(function(obj){

			//Check button type with meal Type
			if(obj.foodType===type){			
				var listItem=document.createElement('li');
				listItem.textContent=' Name: '+obj.brand_name+' Calories: '+obj.nf_calories+' Fat: '+obj.nf_total_fat+' Total:'+obj.count;
				list.appendChild(listItem);
			}
		});
	},

	drawChart: function(){
		var chartData = {
			    labels: items.getMapData('label'),
			    datasets: [
			        {
			            label: "My First dataset",
			            fill: false,
			            lineTension: 0.1,
			            backgroundColor: "rgba(75,192,192,0.4)",
			            borderColor: "rgba(75,192,192,1)",
			            borderCapStyle: 'butt',
			            borderDash: [],
			            borderDashOffset: 0.0,
			            borderJoinStyle: 'miter',
			            pointBorderColor: "rgba(75,192,192,1)",
			            pointBackgroundColor: "#fff",
			            pointBorderWidth: 1,
			            pointHoverRadius: 5,
			            pointHoverBackgroundColor: "rgba(75,192,192,1)",
			            pointHoverBorderColor: "rgba(220,220,220,1)",
			            pointHoverBorderWidth: 2,
			            pointRadius: 3	,
			            pointHitRadius: 10,
			            data: items.getMapData('cals'),
			            spanGaps: false,
			        }
			    ]
			};

			//Draw chart on every selection
			new Chart(ctx, {
			    type: 'line',
			    data: chartData,
			    options:{
		        responsive:true,
		        scaleShowVerticalLines: false,
		        scaleShowHorizontalLines: false,
		        scales: {
		            xAxes:[{
		                gridLines: { display: false, color:'rgba(255,255,255,0.57)' }
		            }],
		            yAxes: [{
		                display: true,
		                ticks: {
		                    suggestedMin: 0,
		                    beginAtZero: true
		                },
		                gridLines:{ display: true , color:'rgba(255,255,255,0.2)'}
		            }]
		        }
		    }
			});
	}	//End draw chart
}



//Nutrtionix API Parameters & Connection
var connection={
	fields:{
		fields:'item_name,item_id,brand_name,nf_calories,nf_total_fat',
		appId:'34049f5a',
		appKey:'327ef7cf036f1136b3aeea53dc207ffe'
	},
	url:'https://api.nutritionix.com/v1_1/search/',


	nutritionix:function(foodType,mealLabelIndex){
		$.ajax({
			url:this.url+this.searchPara,
			type:'get',
			data:this.fields,
			success:function(res){
				items.nutriFood=[];

				res.hits.forEach(function(val){
					items.nutriFood.push({
						id:val._id,
						brand_name: val.fields.brand_name,
						nf_calories: val.fields.nf_calories,
						nf_total_fat: val.fields.nf_total_fat,
						foodType:foodType,
						count:1,
						mealLabelIndex:mealLabelIndex
					});
				}); //End foreach

				display.showNutriFood();
			}	//End success
		});	//End ajax
	}	//End nutritionic fn
};


//IIFE for detecting Selection List events
(function(){
	var list=document.getElementById('nutriFoodList');
	list.addEventListener('click',function(event){
		var listItem=event.target;
		if(listItem.className==='nutriList'){
			var itemExists=false;

			//If food exists,incr count and calories
			items.mealFood.forEach(function(obj){
				if(obj.id===listItem.getAttribute('data-foodId')){
					itemExists=true;
					obj.count++;
					obj.nf_calories+=obj.nf_calories;
					obj.nf_total_fat+=obj.nf_total_fat;
				}
			}); //End foreach

			//Otherwise just push it in array
			if(!itemExists)
				items.mealFood.push(items.nutriFood[listItem.id]);

			
			//Incr cals for mealType of selected item
			var index=items.nutriFood[listItem.id].mealLabelIndex;
		
			items.mealLabel[index].calories+=items.nutriFood[listItem.id].nf_calories;

			display.showNutriFood();

			//Build chart data on every click
			display.drawChart();

		}

	});//End of event listener

})(); //End of iife


//IIFE for activating find button
(function(){
	var foodType=document.getElementById("foodType");
	foodType.addEventListener('keyup',function(){
		var findBtn=document.querySelector("input[type='button']");
		if(this.value!=="")
			findBtn.disabled=false;
		else
			findBtn.disabled=true;
	});

})();//End of IIFE


//IIFE for detecting Meal Button Events
(function(){
	var mealBtnDiv=document.getElementById('mealBtnContainer');
	mealBtnDiv.addEventListener('click',function(event){

		//Show food items for selected Meal Type
		if(event.target.tagName='BUTTON'){
			display.showMealFood(event.target.textContent);
		}

	});//End event listener
})();//End of IIFE


var ctx=document.getElementById('mealChart').getContext('2d');

Chart.defaults.global.defaultFontColor = '#ecf0f1';
Chart.defaults.global.defaultFontSize =14;
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.elements.line.borderWidth=4.5;